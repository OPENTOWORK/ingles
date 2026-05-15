/**
 * Inserta audios Parte 10 desde el Excel vía scripts/generated/parte10_levels_preguntas_audios_insert.sql
 * o directamente leyendo el xlsx. Requiere .env.local con SUPABASE_SERVICE_ROLE_KEY.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const PARTE10_PREGUNTA_IDS = [
  '2e44ac3c-2e7e-430b-9b0d-226f7e459bea',
  'ba46a83c-6f2f-4899-bb82-01cc3ca1d561',
  '81a4a85a-c928-4260-84f2-3aa5c585ffad',
  'a73489dd-47ad-4cb2-997d-ad605c898cff',
  'a3bf3439-57c9-48bf-992b-2cff82a00eb8',
];

const xlsxPath = path.join(
  ROOT,
  'Ejercicios',
  'Levels',
  'B2',
  'PARTE 10',
  'Script para tabla levels_preguntas_audios 10.xlsx',
);

function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[m[1]] == null || process.env[m[1]] === '') process.env[m[1]] = v;
  }
}

function readRowsFromExcel() {
  const wb = XLSX.readFile(xlsxPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null });
  return rows
    .map((r) => ({
      pregunta_id: String(r.pregunta_id || '').trim(),
      audio_url: String(r.audio_url || '').trim(),
      orden: Number(r.orden) || 1,
      titulo: String(r.titulo || '').trim() || null,
    }))
    .filter((r) => r.pregunta_id && r.audio_url);
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
  }

  const rows = readRowsFromExcel();
  if (!rows.length) {
    console.error('No hay filas válidas en el Excel.');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { error: delErr } = await supabase
    .from('levels_preguntas_audios')
    .delete()
    .in('pregunta_id', PARTE10_PREGUNTA_IDS);
  if (delErr) {
    console.error('DELETE falló:', delErr.message || delErr);
    process.exit(1);
  }
  console.log('DELETE previo OK (5 pregunta_id Parte 10).');

  const chunk = 32;
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { error } = await supabase.from('levels_preguntas_audios').insert(slice);
    if (error) {
      console.error('INSERT falló:', error.message || error);
      process.exit(1);
    }
  }

  const { count, error: countErr } = await supabase
    .from('levels_preguntas_audios')
    .select('*', { count: 'exact', head: true })
    .in('pregunta_id', PARTE10_PREGUNTA_IDS);
  if (countErr) console.warn('No se pudo verificar conteo:', countErr.message);
  else console.log('Filas en BD para Parte 10:', count);

  console.log('Listo:', rows.length, 'audios insertados desde Excel (exámenes 2–5 en el archivo).');
  if (!rows.some((r) => r.pregunta_id === PARTE10_PREGUNTA_IDS[0])) {
    console.warn('El Excel no trae examen 1 (2e44ac3c). Añade esas filas al xlsx si las necesitas.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
