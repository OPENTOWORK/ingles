/**
 * Marca o desmarca un slot de examen como borrador interno usando
 * levels_examenes.modelo = 'draft'. NUNCA toca la columna `tipo`.
 *
 * - Solo se permiten los slots 5 y 6 (los slots 1–4 son producción y se
 *   rechazan SIEMPRE, hardcodeado).
 * - Antes de --set exige un backup reciente (<24h) creado con
 *   scripts/backup-exam-slot.mjs en scripts/generated/backups/.
 *
 * Uso:
 *   node scripts/mark-exam-draft.mjs --slot 5 --set
 *   node scripts/mark-exam-draft.mjs --slot 5 --unset
 *   [--level b2] [--skip-backup-check]  (este último, solo bajo tu responsabilidad)
 */
import { readdirSync, statSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKUP_DIR = path.join(ROOT, 'scripts', 'generated', 'backups');

const ALLOWED_DRAFT_SLOTS = new Set([5, 6]);
const PROTECTED_SLOTS = new Set([1, 2, 3, 4]);
const BACKUP_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const slot = Number(argValue('--slot'));
const doSet = args.includes('--set');
const doUnset = args.includes('--unset');
const levelSlug = String(argValue('--level') || 'b2').toLowerCase();
const skipBackupCheck = args.includes('--skip-backup-check');

if (!Number.isFinite(slot) || (doSet === doUnset)) {
  console.error('Uso: node scripts/mark-exam-draft.mjs --slot <5|6> (--set | --unset) [--level b2]');
  process.exit(1);
}

if (PROTECTED_SLOTS.has(slot)) {
  console.error(`RECHAZADO: el slot ${slot} es un examen de producción (1–4). No se toca nunca desde este script.`);
  process.exit(1);
}
if (!ALLOWED_DRAFT_SLOTS.has(slot)) {
  console.error(`RECHAZADO: por ahora solo se permiten los slots 5 y 6 como borradores (pedido: ${slot}).`);
  process.exit(1);
}

if (doSet && !skipBackupCheck) {
  let recent = null;
  if (existsSync(BACKUP_DIR)) {
    const prefix = `backup-exam${slot}-${levelSlug}-`;
    for (const f of readdirSync(BACKUP_DIR)) {
      if (!f.startsWith(prefix) || !f.endsWith('.json')) continue;
      const mtime = statSync(path.join(BACKUP_DIR, f)).mtimeMs;
      if (!recent || mtime > recent.mtime) recent = { file: f, mtime };
    }
  }
  const fresh = recent && Date.now() - recent.mtime < BACKUP_MAX_AGE_MS;
  if (!fresh) {
    console.error(
      `RECHAZADO: no hay backup reciente (<24h) del exam ${slot} en scripts/generated/backups/.\n` +
        `Ejecuta antes: node scripts/backup-exam-slot.mjs ${slot} --level ${levelSlug}`,
    );
    process.exit(1);
  }
  console.log(`Backup reciente encontrado: ${recent.file}`);
}
if (doSet && skipBackupCheck) {
  console.warn('⚠️  AVISO: --skip-backup-check activo. Estás marcando draft SIN comprobar backup.');
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local (se requiere service role para escribir).');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

function sortExamRows(rows) {
  return [...(rows || [])].sort((a, b) => {
    const na = parseInt(String(a?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    const nb = parseInt(String(b?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    if (na !== nb) return na - nb;
    return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
  });
}

const { data: level } = await admin.from('levels').select('id, nombre').ilike('nombre', levelSlug).single();
if (!level?.id) {
  console.error(`Nivel ${levelSlug.toUpperCase()} no encontrado.`);
  process.exit(1);
}

const { data: allExams, error: examsErr } = await admin
  .from('levels_examenes')
  .select('id, nombre, tipo, modelo')
  .eq('level_id', level.id);
if (examsErr) {
  console.error('Error leyendo levels_examenes:', examsErr.message);
  process.exit(1);
}
const ordered = sortExamRows(allExams);
const examRow = ordered[slot - 1];
if (!examRow?.id) {
  console.error(`No existe el slot ${slot} (hay ${ordered.length} exámenes ${levelSlug.toUpperCase()}).`);
  process.exit(1);
}

console.log('Antes :', JSON.stringify({ id: examRow.id, nombre: examRow.nombre, tipo: examRow.tipo, modelo: examRow.modelo }));

const newModelo = doSet ? 'draft' : null;
// Solo se actualiza `modelo`; `tipo` y el resto de columnas quedan intactas.
const { data: updated, error: updErr } = await admin
  .from('levels_examenes')
  .update({ modelo: newModelo })
  .eq('id', examRow.id)
  .select('id, nombre, tipo, modelo')
  .single();

if (updErr) {
  console.error('Error actualizando modelo:', updErr.message);
  process.exit(1);
}

console.log('Después:', JSON.stringify(updated));
console.log(doSet ? `Exam ${slot} marcado como draft (modelo='draft').` : `Exam ${slot} desmarcado (modelo=null).`);
