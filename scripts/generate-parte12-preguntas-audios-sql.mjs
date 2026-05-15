// Lee `Ejercicios/Levels/B2/PARTE 12/Script para tabla levels_preguntas_audios.xlsx`
// y escribe `scripts/generated/parte12_levels_preguntas_audios_insert.sql`.
import XLSX from 'xlsx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const xlsxPath = path.join(
  __dirname,
  '..',
  'Ejercicios',
  'Levels',
  'B2',
  'PARTE 12',
  'Script para tabla levels_preguntas_audios.xlsx',
);

const outPath = path.join(__dirname, 'generated', 'parte12_levels_preguntas_audios_insert.sql');

const esc = (s) => String(s || '').replace(/'/g, "''");

const wb = XLSX.readFile(xlsxPath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null });

/** @type {Record<string, string[]>} */
const byPid = {};
for (const r of rows) {
  const pid = String(r.pregunta_id || '').trim();
  const url = String(r.audio_url || '').trim();
  if (!pid || !url) continue;
  if (!byPid[pid]) byPid[pid] = [];
  byPid[pid].push(url);
}

const pids = Object.keys(byPid);
const vals = [];
for (const pid of pids) {
  const urls = byPid[pid];
  urls.forEach((url, i) => {
    const orden = i + 1;
    vals.push(`('${esc(pid)}', '${esc(url)}', ${orden}, 'Speaker ${orden}')`);
  });
}

const lines = [
  '-- Generado por scripts/generate-parte12-preguntas-audios-sql.mjs (Excel Parte 12 audios)',
  '-- Parte 12 listening: 5 audios por pregunta (Speaker 1–5), orden 1–5.',
  'BEGIN;',
  'DELETE FROM public.levels_preguntas_audios',
  `WHERE pregunta_id IN (${pids.map((p) => `'${esc(p)}'`).join(', ')});`,
  '',
  'INSERT INTO public.levels_preguntas_audios (pregunta_id, audio_url, orden, titulo) VALUES',
  vals.join(',\n') + ';',
  'COMMIT;',
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log('Written:', outPath);
console.log('Preguntas:', pids.length, 'Filas INSERT:', vals.length);
