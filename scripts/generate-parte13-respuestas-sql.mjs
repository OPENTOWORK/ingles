/**
 * Parte 13 Listening B2 (= Part 4): Excel TRUE (24.–30. + letra) + Word (A/B/C) → levels_respuestas.
 *
 * Uso:
 *   node scripts/generate-parte13-respuestas-sql.mjs --full --with-delete
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import mammoth from 'mammoth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PARTE13 = path.join(ROOT, 'Ejercicios', 'Levels', 'B2', 'PARTE 13');

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

/** Texto del Word antes de AUDIO SCRIPT(S) → preguntas 24–30 con A/B/C */
function parseListeningPart4Mcq(raw) {
  const main = String(raw)
    .split(/\bAUDIO\s+SCRIPTS?\b/i)[0]
    .replace(/\r\n/g, '\n');
  const lines = main.split('\n');
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const nm = t.match(/^(\d{1,2})$/);
    if (!nm) continue;
    const qn = Number(nm[1]);
    if (qn < 24 || qn > 30) continue;

    const opts = { A: null, B: null, C: null };
    let j = i + 1;
    while (j < lines.length) {
      const s = lines[j].trim();
      const nextNum = s.match(/^(\d{1,2})$/);
      if (nextNum) {
        const n2 = Number(nextNum[1]);
        if (n2 >= 24 && n2 <= 30 && n2 !== qn) break;
      }
      const Am = s.match(/^A\s+(.+)$/i);
      if (Am) {
        opts.A = Am[1].trim();
        j++;
        continue;
      }
      const Bm = s.match(/^B\s+(.+)$/i);
      if (Bm) {
        opts.B = Bm[1].trim();
        j++;
        continue;
      }
      const Cm = s.match(/^C\s+(.+)$/i);
      if (Cm) {
        opts.C = Cm[1].trim();
        j++;
        continue;
      }
      j++;
    }

    if (opts.A && opts.B && opts.C) {
      out.push({ n: qn, A: opts.A, B: opts.B, C: opts.C });
    } else {
      console.warn(`Pregunta ${qn}: faltan opciones A/B/C`, opts);
    }
  }

  out.sort((a, b) => a.n - b.n);
  return out;
}

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

/** p. ej. "24. B " o "30. C" */
function parseExcelChoice(respuesta) {
  const t = String(respuesta || '').trim();
  const m = t.match(/^(\d{1,2})\s*\.\s*([ABC])\b/i);
  if (!m) throw new Error(`Respuesta Excel no reconocida: "${t}"`);
  return { num: Number(m[1]), letter: m[2].toUpperCase() };
}

async function main() {
  const argv = process.argv;
  if (!argv.includes('--full')) {
    console.error('Uso: node scripts/generate-parte13-respuestas-sql.mjs --full [--with-delete]');
    process.exit(1);
  }
  const withDelete = argv.includes('--with-delete');

  const xlsxPath = path.join(PARTE13, 'Script para tabla levels_respuestas.xlsx');
  const sheet = XLSX.readFile(xlsxPath).Sheets['Hoja1'];
  if (!sheet) throw new Error('Hoja1 no encontrada en el Excel');
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const ids = orderedPreguntaIds(rows);
  const byTrue = trueRowsByPregunta(rows);

  const lines = [];
  lines.push('-- Generado por scripts/generate-parte13-respuestas-sql.mjs (Parte 13 / Listening Part 4, 24–30, A/B/C)');
  lines.push('');

  if (withDelete) {
    lines.push(
      `DELETE FROM public.levels_respuestas WHERE pregunta_id IN (${ids.map((id) => `'${id}'::uuid`).join(', ')});`,
    );
    lines.push('');
  }

  for (let i = 0; i < ids.length; i++) {
    const preguntaId = ids[i];
    const docPath = path.join(PARTE13, `EJERCICIO ${i + 1}.docx`);
    const { value: raw } = await mammoth.extractRawText({ path: docPath });
    const questions = parseListeningPart4Mcq(raw);
    const excelRows = byTrue.get(preguntaId) || [];

    const byNum = new Map();
    for (const row of excelRows) {
      const { num, letter } = parseExcelChoice(row);
      byNum.set(num, letter);
    }

    if (questions.length !== 7) {
      console.warn(`EJERCICIO ${i + 1}: esperaba 7 preguntas, hay ${questions.length}`);
    }
    if (byNum.size !== 7) {
      console.warn(`Examen ${i + 1}: esperaba 7 filas TRUE, hay ${byNum.size}`);
    }

    lines.push(`-- Examen ${i + 1} (${preguntaId})`);

    for (const opt of questions) {
      const correctLetter = byNum.get(opt.n);
      if (!correctLetter || !['A', 'B', 'C'].includes(correctLetter)) {
        console.warn(`Sin letra correcta Excel para pregunta ${opt.n} (examen ${i + 1})`);
      }
      for (const L of ['A', 'B', 'C']) {
        const text = opt[L];
        if (!text) continue;
        const respuesta = `${opt.n} ${L} ${text}`;
        const correcta = L === correctLetter;
        lines.push(insertLine(preguntaId, respuesta, correcta));
      }
    }
    lines.push('');
  }

  const outDir = path.join(ROOT, 'scripts', 'generated');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'parte13_levels_respuestas_completo.sql');
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log('Escrito:', outPath);
  console.log('INSERTs:', lines.filter((l) => l.startsWith('INSERT')).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
