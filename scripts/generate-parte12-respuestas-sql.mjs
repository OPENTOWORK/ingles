/**
 * Parte 12 Listening (B2): Excel TRUE + Word (A–H) → levels_respuestas (TRUE + FALSE).
 *
 * Uso:
 *   node scripts/generate-parte12-respuestas-sql.mjs --full --with-delete
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import mammoth from 'mammoth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PARTE12 = path.join(ROOT, 'Ejercicios', 'Levels', 'B2', 'PARTE 12');

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[''´`]/g, "'")
    .replace(/\.\s*$/, '')
    .trim();
}

function sqlString(s) {
  const t = String(s)
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"');
  return "'" + t.replace(/'/g, "''") + "'";
}

function insertLine(preguntaId, respuesta, correcta) {
  return (
    `INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES (` +
    `'${preguntaId}'::uuid, ` +
    `${sqlString(respuesta)}, ` +
    `${correcta}` +
    `);`
  );
}

/** "For questions 19–23" */
function parseQuestionRangeFromWord(raw) {
  const head = String(raw).split(/\bAUDIO\b/i)[0];
  const m = head.match(/For questions\s*(\d+)\s*[\u2013\u2014-]\s*(\d+)/i);
  if (!m) throw new Error('No se encontró "For questions X–Y" en el Word');
  const from = Number(m[1]);
  const to = Number(m[2]);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) {
    throw new Error(`Rango inválido: ${from}–${to}`);
  }
  return { from, to, count: to - from + 1 };
}

/** Primera lista A–H (texto tras AUDIO se ignora). */
function parseOptionsPoolAH(raw) {
  const main = String(raw).split(/\bAUDIO\b/i)[0];
  const map = {};
  const re = /^([A-H])\s+(.+)$/gim;
  let m;
  while ((m = re.exec(main)) !== null) {
    const L = m[1].toUpperCase();
    map[L] = m[2].trim();
  }
  const letters = Object.keys(map).sort();
  if (letters.length !== 8) {
    console.warn(`Se esperaban 8 opciones A–H; hay ${letters.length}:`, letters.join(''));
  }
  return map;
}

/** Filas Excel correcta=TRUE en orden de aparición. */
function orderedPreguntaIds(rows) {
  const out = [];
  const seen = new Set();
  for (const r of rows) {
    const pid = String(r.pregunta_id || '').trim();
    if (!pid || seen.has(pid)) continue;
    seen.add(pid);
    out.push(pid);
  }
  return out;
}

function trueRowsByPregunta(rows) {
  const m = new Map();
  for (const r of rows) {
    const pid = String(r.pregunta_id || '').trim();
    if (!pid) continue;
    const corr = String(r.correcta ?? '')
      .trim()
      .toUpperCase();
    if (corr && corr !== 'TRUE' && corr !== '1') continue;
    if (!m.has(pid)) m.set(pid, []);
    m.get(pid).push(String(r.respuesta || '').trim());
  }
  return m;
}

function parseExcelAnswerLetter(respuesta) {
  const t = String(respuesta).trim();
  const paren = t.match(/^([A-H])\s*\(\s*(.+?)\s*\)\s*$/i);
  if (paren) return { letter: paren[1].toUpperCase(), body: paren[2].trim() };
  const sp = t.match(/^([A-H])\s+(.+)$/i);
  if (sp) return { letter: sp[1].toUpperCase(), body: sp[2].trim() };
  throw new Error(`No se pudo parsear la respuesta Excel: ${t}`);
}

function resolveCorrectLetter(respuesta, optionMap) {
  const { letter, body } = parseExcelAnswerLetter(respuesta);
  const nb = norm(body);
  for (const L of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
    if (!optionMap[L]) continue;
    if (norm(optionMap[L]) === nb) return L;
  }
  return letter;
}

async function main() {
  const argv = process.argv;
  if (!argv.includes('--full')) {
    console.error('Uso: node scripts/generate-parte12-respuestas-sql.mjs --full [--with-delete]');
    process.exit(1);
  }
  const withDelete = argv.includes('--with-delete');

  const xlsxPath = path.join(PARTE12, 'Script para tabla levels_respuestas.xlsx');
  const rows = XLSX.utils.sheet_to_json(XLSX.readFile(xlsxPath).Sheets['Hoja1'] || {}, { defval: '' });
  const ids = orderedPreguntaIds(rows);
  const byTrue = trueRowsByPregunta(rows);

  if (ids.length !== 5) {
    console.warn(`Se esperaban 5 pregunta_id distintos; hay ${ids.length}`);
  }

  const lines = [];
  lines.push('-- Generado por scripts/generate-parte12-respuestas-sql.mjs (Parte 12, A–H, preguntas 19–23)');
  lines.push('');

  if (withDelete) {
    lines.push(
      `DELETE FROM public.levels_respuestas WHERE pregunta_id IN (${ids.map((id) => `'${id}'::uuid`).join(', ')});`,
    );
    lines.push('');
  }

  for (let i = 0; i < ids.length; i++) {
    const preguntaId = ids[i];
    const docPath = path.join(PARTE12, `EJERCICIO ${i + 1}.docx`);
    const { value: raw } = await mammoth.extractRawText({ path: docPath });
    const { from, count } = parseQuestionRangeFromWord(raw);
    const optionMap = parseOptionsPoolAH(raw);
    const excelList = byTrue.get(preguntaId) || [];

    if (excelList.length !== count) {
      console.warn(`Examen ${i + 1} (${preguntaId}): esperaba ${count} filas TRUE, hay ${excelList.length}`);
    }

    lines.push(`-- Examen ${i + 1} (${preguntaId})`);

    const nQ = Math.min(count, excelList.length);
    for (let qi = 0; qi < nQ; qi++) {
      const qNum = from + qi;
      const correctLetter = resolveCorrectLetter(excelList[qi], optionMap);

      for (const L of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
        const text = optionMap[L];
        if (!text) continue;
        const respuesta = `${qNum} ${L} ${text}`;
        const correcta = L === correctLetter;
        lines.push(insertLine(preguntaId, respuesta, correcta));
      }
    }
    lines.push('');
  }

  const outDir = path.join(ROOT, 'scripts', 'generated');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'parte12_levels_respuestas_completo.sql');
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log('Escrito:', outPath);
  console.log('INSERTs:', lines.filter((l) => l.startsWith('INSERT')).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
