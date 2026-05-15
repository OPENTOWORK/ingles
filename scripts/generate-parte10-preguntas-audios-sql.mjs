// Lee `Ejercicios/Levels/B2/PARTE 10/Script para tabla levels_preguntas_audios 10.xlsx`
// y escribe `scripts/generated/parte10_levels_preguntas_audios_insert.sql`.
import XLSX from 'xlsx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PARTE10_PREGUNTA_IDS = [
  '2e44ac3c-2e7e-430b-9b0d-226f7e459bea',
  'ba46a83c-6f2f-4899-bb82-01cc3ca1d561',
  '81a4a85a-c928-4260-84f2-3aa5c585ffad',
  'a73489dd-47ad-4cb2-997d-ad605c898cff',
  'a3bf3439-57c9-48bf-992b-2cff82a00eb8',
];

const xlsxPath = path.join(
  __dirname,
  '..',
  'Ejercicios',
  'Levels',
  'B2',
  'PARTE 10',
  'Script para tabla levels_preguntas_audios 10.xlsx',
);

const outPath = path.join(__dirname, 'generated', 'parte10_levels_preguntas_audios_insert.sql');

const esc = (s) => String(s ?? '').replace(/'/g, "''");

const wb = XLSX.readFile(xlsxPath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null });

const vals = [];
const pidsInExcel = new Set();

for (const r of rows) {
  const pid = String(r.pregunta_id || '').trim();
  const url = String(r.audio_url || '').trim();
  const orden = Number(r.orden);
  const titulo = String(r.titulo || '').trim();
  if (!pid || !url) continue;
  pidsInExcel.add(pid);
  vals.push(
    `('${esc(pid)}'::uuid, '${esc(url)}', ${Number.isFinite(orden) ? orden : 1}, '${esc(titulo)}')`,
  );
}

const lines = [
  '-- Generado por scripts/generate-parte10-preguntas-audios-sql.mjs',
  '-- Parte 10 listening: 8 audios por pregunta (exámenes en Excel).',
  'BEGIN;',
  'DELETE FROM public.levels_preguntas_audios',
  `WHERE pregunta_id IN (${PARTE10_PREGUNTA_IDS.map((p) => `'${p}'::uuid`).join(', ')});`,
  '',
  'INSERT INTO public.levels_preguntas_audios (pregunta_id, audio_url, orden, titulo) VALUES',
  vals.join(',\n') + ';',
  'COMMIT;',
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log('Written:', outPath);
console.log('Filas INSERT:', vals.length);
console.log('pregunta_id en Excel:', [...pidsInExcel].join(', '));
if (!pidsInExcel.has(PARTE10_PREGUNTA_IDS[0])) {
  console.warn('Aviso: el Excel no incluye audios para examen 1 (2e44ac3c-…).');
}
