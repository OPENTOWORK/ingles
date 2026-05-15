// Genera un fichero SQL con INSERTs para `levels_preguntas` a partir del Excel
// `Ejercicios/Levels/B2/PARTE 10/Script para tabla levels_preguntas partes 10, 11,12 y 13.xlsx`.
//
// No ejecuta nada contra Supabase. El SQL se imprime por stdout para que se
// pueda revisar antes de aplicarlo con la Management API / MCP execute_sql.
import XLSX from 'xlsx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xlsxPath = path.join(
  __dirname,
  '..',
  'Ejercicios',
  'Levels',
  'B2',
  'PARTE 10',
  'Script para tabla levels_preguntas partes 10, 11,12 y 13.xlsx',
);

const outputPath = path.join(__dirname, '_b2-listening-insert.sql');

/** Parte 10: quita ciclos 1–8 duplicados en el Excel (misma lógica que `trimListeningPart10DuplicateCycles`). */
function trimPart10DuplicateListeningBody(text) {
  const t = String(text || '').replace(/\r\n/g, '\n');
  if (!t.trim()) return t;
  const re = /(?:^|\n)\s*1\s*\n\s*\n\s*(?:You hear|You overhear)\b/gi;
  const hits = [];
  let m;
  while ((m = re.exec(t)) !== null) {
    hits.push(m.index);
  }
  if (hits.length <= 1) return t;
  return t.slice(0, hits[1]).replace(/[ \t\u00a0]+$/g, '').replace(/\n+$/, '');
}

const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });

const TAG = 'EnunciadoB2L';
const lines = [];
lines.push('-- Auto-generado por scripts/import-levels-preguntas-b2-listening.mjs');
lines.push('BEGIN;');

for (const row of rows) {
  if (!row.level_id || !row.examen_id || !row.parte_id || !row.enunciado) {
    console.error('Fila inválida, se omite:', row);
    continue;
  }
  let enunciado = String(row.enunciado).replace(/\r\n/g, '\n');
  if (row.parte_id === 'be502acc-2e8b-4088-9f86-a9eb6e1ed209') {
    enunciado = trimPart10DuplicateListeningBody(enunciado);
  }
  // Comprobación de seguridad por si el contenido incluye el tag.
  if (enunciado.includes(`$${TAG}$`)) {
    throw new Error('El contenido incluye el tag dollar-quoted; cambia TAG.');
  }
  lines.push(
    `INSERT INTO public.levels_preguntas (level_id, examen_id, parte_id, enunciado) VALUES (` +
      `'${row.level_id}', '${row.examen_id}', '${row.parte_id}', ` +
      `$${TAG}$${enunciado}$${TAG}$);`,
  );
}

lines.push('COMMIT;');
fs.writeFileSync(outputPath, lines.join('\n') + '\n', { encoding: 'utf8' });
console.log('SQL escrito en:', outputPath);
console.log('Filas a insertar:', lines.filter((l) => l.startsWith('INSERT')).length);
