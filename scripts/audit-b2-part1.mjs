/**
 * Auditoría READ-ONLY de B2 Reading & Use of English Part 1 (multiple-choice cloze)
 * en los exámenes 1–6. No escribe nada en Supabase.
 *
 * Comprueba por examen:
 *  - exactamente 8 preguntas (parseadas del enunciado, como las ve la UI)
 *  - gaps (1)–(8) en el pasaje, sin duplicados ni números extra
 *  - 4 opciones A/B/C/D por pregunta, de una palabra, sin duplicados
 *  - answer key 1–8 completo en levels_respuestas (una fila correcta por pregunta)
 *  - datos malformados (filas ilegibles, letras fuera de A–D, claves duplicadas)
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/audit-b2-part1.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const {
  extractTextoBloque,
  splitPart1TextoYPreguntas,
  parsePart1QuestionOptions,
} = await import('../src/utils/b2ExamTextBlocks.js');

loadEnvLocal();

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

const { data: level, error: levelError } = await db
  .from('levels')
  .select('id, nombre')
  .ilike('nombre', 'b2')
  .single();
if (levelError || !level) fail(`No se pudo obtener el nivel B2: ${levelError?.message}`);

const { data: exams, error: examsError } = await db
  .from('levels_examenes')
  .select('id, nombre, tipo, modelo')
  .eq('level_id', level.id);
if (examsError || !exams?.length) fail(`No se pudieron obtener los exámenes: ${examsError?.message}`);

const sortedExams = [...exams].sort(
  (a, b) => Number(a.nombre.match(/\d+/)?.[0] || 0) - Number(b.nombre.match(/\d+/)?.[0] || 0),
);

const { data: partes, error: partesError } = await db
  .from('levels_partes')
  .select('id, nombre_parte');
if (partesError) fail(`No se pudieron obtener las partes: ${partesError.message}`);
const parte1 = partes.filter((p) => /^\s*parte\s*1\s*b2\s*$/i.test(p.nombre_parte || ''));
if (parte1.length !== 1) {
  fail(`Se esperaba una única "Parte 1 B2" y hay ${parte1.length}: ${parte1.map((p) => p.id).join(', ')}`);
}
const parte1Id = parte1[0].id;
console.log(`Parte 1 B2: ${parte1Id}\n`);

const summaryRows = [];

for (const exam of sortedExams) {
  const slot = Number(exam.nombre.match(/\d+/)?.[0] || 0);
  if (slot < 1 || slot > 6) continue;
  const examLabel = `Exam ${slot} (${exam.nombre.trim()})`;
  const issues = [];
  const warnings = [];

  const { data: preguntas, error: pregError } = await db
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', exam.id)
    .eq('parte_id', parte1Id);
  if (pregError) {
    issues.push(`No se pudieron leer las preguntas: ${pregError.message}`);
    summaryRows.push({ examLabel, issues, warnings, ok: false });
    continue;
  }
  if (!preguntas?.length) {
    issues.push('Sin fila en levels_preguntas para Part 1.');
    summaryRows.push({ examLabel, issues, warnings, ok: false });
    continue;
  }
  if (preguntas.length > 1) {
    warnings.push(`${preguntas.length} filas de pregunta para Part 1 (se audita la primera).`);
  }
  const pregunta = preguntas[0];
  const raw = pregunta.enunciado || '';

  // --- Parse del enunciado exactamente como la UI ---
  const textoExtracted = extractTextoBloque(raw, 1, { levelSlug: 'b2' });
  const split = splitPart1TextoYPreguntas(textoExtracted || raw);
  const texto = split.texto.trim();
  const parsedQuestions = parsePart1QuestionOptions(split.preguntas);

  // Preguntas y opciones
  if (parsedQuestions.length !== 8) {
    issues.push(`Preguntas parseadas: ${parsedQuestions.length} (se esperaban 8).`);
  }
  const qNums = parsedQuestions.map((q) => q.questionNumber).sort((a, b) => a - b);
  const dupQ = qNums.filter((n, i) => qNums.indexOf(n) !== i);
  if (dupQ.length) issues.push(`Números de pregunta duplicados: ${[...new Set(dupQ)].join(', ')}.`);
  for (let n = 1; n <= 8; n += 1) {
    if (!qNums.includes(n)) issues.push(`Falta la pregunta ${n} en el bloque Questions.`);
  }
  const extraQ = qNums.filter((n) => n < 1 || n > 8);
  if (extraQ.length) issues.push(`Preguntas fuera de rango 1–8: ${[...new Set(extraQ)].join(', ')}.`);

  for (const q of parsedQuestions) {
    const letters = ['A', 'B', 'C', 'D'];
    const present = letters.filter((L) => q.options[L] != null && String(q.options[L]).trim());
    if (present.length !== 4) {
      issues.push(`Q${q.questionNumber}: ${present.length} opciones (${present.join('')}), se esperaban A–D.`);
      continue;
    }
    const words = letters.map((L) => String(q.options[L]).trim());
    words.forEach((w, i) => {
      if (/\s/.test(w)) warnings.push(`Q${q.questionNumber}: opción ${letters[i]} con más de una palabra ("${w}").`);
    });
    const lower = words.map((w) => w.toLowerCase());
    if (new Set(lower).size !== lower.length) {
      issues.push(`Q${q.questionNumber}: opciones duplicadas (${words.join(', ')}).`);
    }
  }

  // Gaps del pasaje
  const gapNums = [...texto.matchAll(/\((\d{1,2})\)\s*(?:_+|\.{2,}|…+)/g)].map((m) => Number(m[1]));
  for (let n = 1; n <= 8; n += 1) {
    const count = gapNums.filter((g) => g === n).length;
    if (count === 0) issues.push(`Pasaje sin gap (${n}).`);
    if (count > 1) issues.push(`Pasaje con gap (${n}) repetido.`);
  }
  const extraGaps = [...new Set(gapNums.filter((g) => g > 8))];
  if (extraGaps.length) issues.push(`Gaps inesperados en el pasaje: ${extraGaps.join(', ')}.`);
  const hasGap0 = gapNums.includes(0);
  if (/\(\s*[oO]\s*\)/.test(texto)) issues.push('Pasaje contiene "(o)" con letra o.');

  // --- Answer key en levels_respuestas ---
  const { data: respuestas, error: respError } = await db
    .from('levels_respuestas')
    .select('id, respuesta, correcta')
    .eq('pregunta_id', pregunta.id);
  if (respError) {
    issues.push(`No se pudieron leer las respuestas: ${respError.message}`);
  } else {
    const correctByNum = new Map();
    const malformed = [];
    for (const row of respuestas || []) {
      const t = String(row.respuesta || '').trim();
      const m = t.match(/^(\d{1,2})\s+([A-Za-z])\b/);
      if (!m) {
        malformed.push(t || '(vacía)');
        continue;
      }
      const num = Number(m[1]);
      const letter = m[2].toUpperCase();
      if (row.correcta === true) {
        if (!/^[A-D]$/.test(letter)) {
          issues.push(`Key Q${num}: letra "${letter}" fuera de A–D ("${t}").`);
        }
        if (correctByNum.has(num)) {
          issues.push(`Key Q${num}: más de una fila marcada como correcta (${correctByNum.get(num)} y ${letter}).`);
        }
        correctByNum.set(num, letter);
      }
    }
    for (let n = 1; n <= 8; n += 1) {
      if (!correctByNum.has(n)) issues.push(`Key sin respuesta correcta para Q${n}.`);
    }
    const extraKeys = [...correctByNum.keys()].filter((n) => n < 1 || n > 8);
    if (extraKeys.length) issues.push(`Key con números fuera de 1–8: ${extraKeys.join(', ')}.`);
    if (malformed.length) {
      warnings.push(`${malformed.length} fila(s) de respuesta ilegibles: ${malformed.slice(0, 3).join(' | ')}${malformed.length > 3 ? ' …' : ''}`);
    }

    // Distribución del key
    const counts = {};
    for (const [n, L] of correctByNum) {
      if (n >= 1 && n <= 8) counts[L] = (counts[L] || 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 6) issues.push(`Key degenerado: "${top[0]}" correcta ${top[1]} veces.`);
    else if (top && top[1] === 5) warnings.push(`Key concentrado: "${top[0]}" correcta 5 veces.`);

    console.log(`=== ${examLabel} ===`);
    console.log(`  modelo: ${exam.modelo ?? 'null'} · tipo: ${exam.tipo ?? 'null'}`);
    console.log(`  preguntas parseadas: ${parsedQuestions.length} (${qNums.join(',') || '—'})`);
    console.log(`  gaps en pasaje: ${[...new Set(gapNums)].sort((a, b) => a - b).join(',') || '—'}${hasGap0 ? ' (incluye ejemplo (0))' : ''}`);
    console.log(`  filas respuestas: ${respuestas?.length ?? 0} · key correctas: ${[...correctByNum.entries()].sort((a, b) => a[0] - b[0]).map(([n, L]) => `${n}${L}`).join(' ') || '—'}`);
  }

  if (issues.length) {
    console.log(`  PROBLEMAS (${issues.length}):`);
    issues.forEach((i) => console.log(`    - ${i}`));
  }
  if (warnings.length) {
    console.log(`  Avisos (${warnings.length}):`);
    warnings.forEach((w) => console.log(`    ~ ${w}`));
  }
  if (!issues.length && !warnings.length) console.log('  OK sin incidencias.');
  console.log('');

  summaryRows.push({ examLabel, issues, warnings, ok: issues.length === 0 });
}

console.log('================ RESUMEN ================');
for (const row of summaryRows) {
  console.log(
    `${row.ok ? (row.warnings.length ? 'OK*' : 'OK ') : 'FAIL'} ${row.examLabel} — ${row.issues.length} problema(s), ${row.warnings.length} aviso(s)`,
  );
}
console.log('\nAuditoría read-only completada. No se ha escrito nada en Supabase.');
