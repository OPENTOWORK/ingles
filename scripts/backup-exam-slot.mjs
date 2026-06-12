/**
 * Backup completo y con timestamp de un slot de examen (fila levels_examenes +
 * preguntas + respuestas + respuestas abiertas + audios + partes referenciadas).
 *
 * Solo LEE de Supabase; no borra ni modifica nada.
 *
 * Uso: node scripts/backup-exam-slot.mjs <slot> [--level b2]
 * Salida: scripts/generated/backups/backup-exam<slot>-<level>-<timestamp>.json
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKUP_DIR = path.join(ROOT, 'scripts', 'generated', 'backups');

const args = process.argv.slice(2);
const slot = Number(args.find((a) => /^\d+$/.test(a)) || NaN);
const levelArgIdx = args.indexOf('--level');
const levelSlug = String((levelArgIdx >= 0 && args[levelArgIdx + 1]) || 'b2').toLowerCase();

if (!Number.isFinite(slot) || slot < 1) {
  console.error('Uso: node scripts/backup-exam-slot.mjs <slot> [--level b2]');
  process.exit(1);
}

// Mismos valores por defecto (solo lectura, anon) que scripts/dump-b2-exam.mjs.
const DEFAULT_SUPABASE_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const key =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local');
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

const { data: level, error: levelErr } = await admin
  .from('levels')
  .select('id, nombre')
  .ilike('nombre', levelSlug)
  .single();
if (levelErr || !level?.id) {
  console.error(`Nivel ${levelSlug.toUpperCase()} no encontrado:`, levelErr?.message || 'sin filas');
  process.exit(1);
}

// Slot posicional sobre la lista COMPLETA (incluye drafts).
const { data: allExams, error: examsErr } = await admin
  .from('levels_examenes')
  .select('*')
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

const examenId = examRow.id;

const { data: questions, error: qErr } = await admin
  .from('levels_preguntas')
  .select('*')
  .eq('examen_id', examenId);
if (qErr) {
  console.error('Error leyendo levels_preguntas:', qErr.message);
  process.exit(1);
}

const qIds = (questions || []).map((q) => q.id);
const partIds = [...new Set((questions || []).map((q) => q.parte_id).filter(Boolean))];

let partes = [];
let respuestas = [];
let respuestasAbiertas = [];
let audios = [];

if (partIds.length) {
  const r = await admin.from('levels_partes').select('*').in('id', partIds);
  if (r.error) {
    console.error('Error leyendo levels_partes:', r.error.message);
    process.exit(1);
  }
  partes = r.data || [];
}

if (qIds.length) {
  const r1 = await admin.from('levels_respuestas').select('*').in('pregunta_id', qIds);
  if (r1.error) {
    console.error('Error leyendo levels_respuestas:', r1.error.message);
    process.exit(1);
  }
  respuestas = r1.data || [];

  const r2 = await admin
    .from('levels_respuestas_abiertas')
    .select('*')
    .in('pregunta_id_abierta', qIds);
  if (r2.error) {
    console.error('Error leyendo levels_respuestas_abiertas:', r2.error.message);
    process.exit(1);
  }
  respuestasAbiertas = r2.data || [];

  const r3 = await admin.from('levels_preguntas_audios').select('*').in('pregunta_id', qIds);
  if (r3.error) {
    console.error('Error leyendo levels_preguntas_audios:', r3.error.message);
    process.exit(1);
  }
  audios = r3.data || [];
}

const backup = {
  meta: {
    createdAt: new Date().toISOString(),
    levelSlug,
    levelId: level.id,
    slot,
    examenId,
    counts: {
      preguntas: questions?.length || 0,
      respuestas: respuestas.length,
      respuestasAbiertas: respuestasAbiertas.length,
      audios: audios.length,
      partes: partes.length,
    },
  },
  levels_examenes: examRow,
  levels_partes: partes,
  levels_preguntas: questions || [],
  levels_respuestas: respuestas,
  levels_respuestas_abiertas: respuestasAbiertas,
  levels_preguntas_audios: audios,
};

mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outPath = path.join(BACKUP_DIR, `backup-exam${slot}-${levelSlug}-${stamp}.json`);
writeFileSync(outPath, JSON.stringify(backup, null, 2), 'utf8');

console.log(`Backup OK: ${outPath}`);
console.log(
  `  examen: "${examRow.nombre}" (id ${examenId}) tipo=${JSON.stringify(examRow.tipo)} modelo=${JSON.stringify(examRow.modelo)}`,
);
console.log(
  `  ${backup.meta.counts.preguntas} preguntas, ${backup.meta.counts.respuestas} respuestas, ${backup.meta.counts.respuestasAbiertas} abiertas, ${backup.meta.counts.audios} audios, ${backup.meta.counts.partes} partes.`,
);
