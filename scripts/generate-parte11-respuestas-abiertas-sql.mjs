// Lee `Ejercicios/Levels/B2/PARTE 11/Script tabla levels_respuestas_abiertas.xlsx`
// y escribe SQL: DELETE por los pregunta_id_abierta del Excel + INSERT de filas.
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
  'PARTE 11',
  'Script tabla levels_respuestas_abiertas.xlsx',
);

const outPath = path.join(__dirname, 'generated', 'parte11_levels_respuestas_abiertas.sql');

function sqlString(s) {
  return "'" + String(s ?? '').replace(/'/g, "''") + "'";
}

/** Examen 5 en el Excel llegó como 1–10; el listening Parte 11 usa huecos (9)–(18). */
const EXAM5_PART11_PARENT = '49c664ef-4645-4d78-9283-4d0a714cf679';

function normalizePart11RespuestaText(preguntaIdAbierta, raw) {
  const t = String(raw ?? '').trim();
  if (!t) return t;
  if (preguntaIdAbierta !== EXAM5_PART11_PARENT) return t;
  const m = t.match(/^(\d{1,2})\s*[\.\)]?\s*(.*)$/);
  if (!m) return t;
  const n = Number(m[1]);
  const rest = String(m[2] ?? '').trim();
  if (!Number.isFinite(n) || n < 1 || n > 10) return t;
  return `${n + 8}. ${rest}`;
}

const wb = XLSX.readFile(xlsxPath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });

const parents = [...new Set(rows.map((r) => String(r.pregunta_id_abierta || '').trim()).filter(Boolean))];

const lines = [];
lines.push('-- Auto-generado por scripts/generate-parte11-respuestas-abiertas-sql.mjs');
lines.push('BEGIN;');
lines.push('');
lines.push(
  'DELETE FROM public.levels_respuestas_abiertas WHERE pregunta_id_abierta IN (' +
    parents.map((p) => `${sqlString(p)}::uuid`).join(', ') +
    ');',
);
lines.push('');

const tuples = [];
for (const row of rows) {
  const pid = String(row.pregunta_id_abierta || '').trim();
  const txt = normalizePart11RespuestaText(pid, String(row.respuesta_texto ?? '').trim());
  if (!pid || !txt) continue;
  tuples.push(`(${sqlString(pid)}::uuid, ${sqlString(txt)})`);
}

lines.push(
  'INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES\n' +
    tuples.join(',\n') +
    ';',
);
lines.push('');
lines.push('COMMIT;');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log('Escrito:', outPath);
console.log('Padres (DELETE):', parents.length);
console.log('INSERT filas:', tuples.length);
