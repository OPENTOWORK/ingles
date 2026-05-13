/**
 * Lee Script para tabla levels_respuestas parte 10.xlsx (solo filas correcta=TRUE)
 * y EJERCICIO 1–5.docx (opciones A/B/C). Genera INSERTs para levels_respuestas
 * con las dos opciones FALSE por cada pregunta (no borra nada en BD).
 *
 * Uso:
 *   node scripts/generate-parte10-respuestas-sql.mjs
 *   node scripts/generate-parte10-respuestas-sql.mjs --full
 *
 * Salida (sin --full):
 *   scripts/generated/parte10_levels_respuestas_solo_false.sql
 *   scripts/generated/parte10_levels_respuestas_solo_true.sql
 * Con --full:
 *   scripts/generated/parte10_levels_respuestas_completo.sql (TRUE + FALSE)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import mammoth from 'mammoth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PARTE10 = path.join(ROOT, 'Ejercicios', 'Levels', 'B2', 'PARTE 10');

const PREGUNTA_IDS_IN_ORDER = [
  '2e44ac3c-2e7e-430b-9b0d-226f7e459bea',
  'ba46a83c-6f2f-4899-bb82-01cc3ca1d561',
  '81a4a85a-c928-4260-84f2-3aa5c585ffad',
  'a73489dd-47ad-4cb2-997d-ad605c898cff',
  'a3bf3439-57c9-48bf-992b-2cff82a00eb8',
];

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[''´`]/g, "'")
    .replace(/\.\s*$/, '')
    .trim();
}

/** Texto del Word antes de AUDIO SCRIPTS → bloques por pregunta 1–8 con A/B/C */
function parseListeningOptions(raw) {
  const main = String(raw).split(/\bAUDIO\s+SCRIPTS\b/i)[0].trim();
  const parts = main.split(/\n\s*\n(?=\d+\s*\n\s*\n)/);
  const out = [];
  for (const p of parts) {
    const m = p.trim().match(/^(\d+)\s*\n\s*\n([\s\S]+)$/);
    if (!m) continue;
    const body = m[2].trim();
    const am = body.match(/A\s+([^\n]+)\s*\n\s*B\s+([^\n]+)\s*\n\s*C\s+([^\n]+)/i);
    if (!am) {
      console.warn('Sin bloque A/B/C para bloque que empieza por número:', m[1], body.slice(0, 120));
      continue;
    }
    out.push({
      n: Number(m[1]),
      A: am[1].trim(),
      B: am[2].trim(),
      C: am[3].trim(),
    });
  }
  out.sort((a, b) => a.n - b.n);
  return out;
}

function leadingLetter(text) {
  const t = String(text || '').trim();
  const m = t.match(/^([ABC])\s+(.+)$/i);
  if (!m) return { letter: null, rest: t };
  return { letter: m[1].toUpperCase(), rest: m[2].trim() };
}

function resolveCorrectLetter(excelRow, opts) {
  const { letter, rest } = leadingLetter(excelRow);
  const nRest = norm(rest);
  for (const L of ['A', 'B', 'C']) {
    if (norm(opts[L]) === nRest) return L;
  }
  if (letter && ['A', 'B', 'C'].includes(letter)) return letter;
  return letter || 'A';
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

async function main() {
  const includeFull = process.argv.includes('--full');
  const xlsxPath = path.join(PARTE10, 'Script para tabla levels_respuestas parte 10.xlsx');
  const wb = XLSX.readFile(xlsxPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

  const byPregunta = new Map();
  for (const r of rows) {
    const pid = String(r.pregunta_id || '').trim();
    if (!pid) continue;
    if (!byPregunta.has(pid)) byPregunta.set(pid, []);
    byPregunta.get(pid).push(String(r.respuesta || '').trim());
  }

  const linesTrue = [];
  const linesFalse = [];

  const pushHeader = (arr, title, extra) => {
    arr.push('-- Generado por scripts/generate-parte10-respuestas-sql.mjs');
    arr.push(`-- ${title}`);
    if (extra) arr.push(`-- ${extra}`);
    arr.push('-- No incluye DELETE.');
    arr.push('');
  };

  if (includeFull) {
    pushHeader(
      linesTrue,
      'Modo --full: todas las filas (TRUE + FALSE).',
      '120 INSERTs (24 × 5 exámenes).',
    );
  } else {
    pushHeader(
      linesFalse,
      'Solo correcta = false',
      '80 INSERTs (2 opciones incorrectas × 8 preguntas × 5 exámenes).',
    );
    pushHeader(
      linesTrue,
      'Solo correcta = true',
      '40 INSERTs (1 respuesta correcta × 8 preguntas × 5 exámenes). Formato N L texto para la app.',
    );
  }

  for (let i = 0; i < PREGUNTA_IDS_IN_ORDER.length; i++) {
    const preguntaId = PREGUNTA_IDS_IN_ORDER[i];
    const docPath = path.join(PARTE10, `EJERCICIO ${i + 1}.docx`);
    const { value: raw } = await mammoth.extractRawText({ path: docPath });
    const questions = parseListeningOptions(raw);
    const excelAnswers = byPregunta.get(preguntaId) || [];

    if (excelAnswers.length !== 8) {
      console.warn(`Pregunta ${preguntaId}: esperaba 8 filas TRUE en Excel, hay ${excelAnswers.length}`);
    }
    if (questions.length !== 8) {
      console.warn(`EJERCICIO ${i + 1}: esperaba 8 preguntas parseadas, hay ${questions.length}`);
    }

    const sectionComment = `-- Examen / pregunta ${i + 1} (${preguntaId})`;
    if (includeFull) {
      linesTrue.push(sectionComment);
    } else {
      linesFalse.push(sectionComment);
      linesTrue.push(sectionComment);
    }

    const nQ = Math.min(8, questions.length, excelAnswers.length);
    for (let qi = 0; qi < nQ; qi++) {
      const qn = qi + 1;
      const opt = questions[qi];
      if (opt.n !== qn) {
        console.warn(`Orden pregunta doc EJ${i + 1}: esperaba ${qn}, fila tiene n=${opt.n}`);
      }
      const excelCorrect = excelAnswers[qi];
      const correctLetter = resolveCorrectLetter(excelCorrect, opt);

      for (const L of ['A', 'B', 'C']) {
        const text = opt[L];
        const respuesta = `${qn} ${L} ${text}`;
        const correcta = L === correctLetter;
        const line = insertLine(preguntaId, respuesta, correcta);
        if (includeFull) {
          linesTrue.push(line);
        } else if (correcta) {
          linesTrue.push(line);
        } else {
          linesFalse.push(line);
        }
      }
    }
    if (includeFull) {
      linesTrue.push('');
    } else {
      linesFalse.push('');
      linesTrue.push('');
    }
  }

  const outDir = path.join(ROOT, 'scripts', 'generated');
  fs.mkdirSync(outDir, { recursive: true });
  if (includeFull) {
    const outPath = path.join(outDir, 'parte10_levels_respuestas_completo.sql');
    fs.writeFileSync(outPath, linesTrue.join('\n') + '\n', 'utf8');
    console.log('Escrito:', outPath, 'líneas:', linesTrue.length);
  } else {
    const pFalse = path.join(outDir, 'parte10_levels_respuestas_solo_false.sql');
    const pTrue = path.join(outDir, 'parte10_levels_respuestas_solo_true.sql');
    fs.writeFileSync(pFalse, linesFalse.join('\n') + '\n', 'utf8');
    fs.writeFileSync(pTrue, linesTrue.join('\n') + '\n', 'utf8');
    console.log('Escrito:', pFalse, 'líneas:', linesFalse.length);
    console.log('Escrito:', pTrue, 'líneas:', linesTrue.length);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
