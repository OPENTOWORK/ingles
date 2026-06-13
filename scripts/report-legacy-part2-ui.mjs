/**
 * Reporte READ-ONLY de cómo renderiza la UI la Part 2 legacy (exams 1–6) tras la limpieza.
 * Reproduce exactamente la tubería de exam-useofenglish/exam-reading:
 *   Descripción + enunciado → composeOpenClozeDirections → extractLegacyPart2InlineExample
 *   → texto limpio → gaps activos (mismo regex que B2ExamInlineOpenClozePassage).
 * No escribe nada en Supabase.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/report-legacy-part2-ui.mjs
 */
import { createClient } from '@supabase/supabase-js';

const { extractTextoBloque } = await import('../src/utils/b2ExamTextBlocks.js');
const {
  composeOpenClozeDirections,
  extractLegacyPart2InlineExample,
  getOpenAnswerMap,
  inferOpenQuestionNumbersFromPrompt,
} = await import('../src/utils/b2ExamPaperShared.js');

// Mismo marcador que OPEN_GAP_MARKER_RE en B2ExamInlineOpenClozePassage.js
const GAP_RE = /\((\d{1,2})\)\s*(?:_+|\.{2,}|…{2,})/g;

const SUPABASE_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data: level } = await db.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: exams } = await db.from('levels_examenes').select('id, nombre').eq('level_id', level.id);
const { data: partes } = await db.from('levels_partes').select('id, nombre_parte, "Descripción"');
const parte2 = partes.find((p) => /^\s*parte\s*2\s*b2\s*$/i.test(p.nombre_parte || ''));
if (!parte2) {
  console.error('No se encontró "Parte 2 B2".');
  process.exit(1);
}
const desc = String(parte2['Descripción'] || '').replace(/\r\n/g, '\n').trim();

const { data: preguntas } = await db
  .from('levels_preguntas')
  .select('id, examen_id, enunciado')
  .eq('level_id', level.id)
  .eq('parte_id', parte2.id);

const sorted = [...exams].sort(
  (a, b) => Number(a.nombre.match(/\d+/)?.[0] || 0) - Number(b.nombre.match(/\d+/)?.[0] || 0),
);

let failures = 0;

for (const exam of sorted) {
  const slot = Number(exam.nombre.match(/\d+/)?.[0] || 0);
  const pregunta = preguntas.find((q) => q.examen_id === exam.id);
  console.log(`\n================ Exam ${slot} (${exam.nombre.trim()}) ================`);
  if (!pregunta) {
    console.log('  Sin pregunta Part 2.');
    continue;
  }
  const rawPregunta = pregunta.enunciado || '';

  // --- Tubería idéntica a selectedPartContent (partNumber 2) ---
  const textoExtracted = extractTextoBloque(rawPregunta, 2, { levelSlug: 'b2' });
  let texto = (textoExtracted || '').trim();
  let enunciado = composeOpenClozeDirections(desc, rawPregunta) || '';
  const legacy = extractLegacyPart2InlineExample(texto);
  if (legacy) {
    texto = legacy.cleanedTexto;
    if (!/^example\s*:/im.test(enunciado)) {
      enunciado = `${enunciado}\nExample:\n${legacy.exampleSentence}`.trim();
    }
  }

  // --- Gaps activos como los calcula la página ---
  const { data: abiertas } = await db
    .from('levels_respuestas_abiertas')
    .select('id, pregunta_id_abierta, respuesta_texto')
    .eq('pregunta_id_abierta', pregunta.id);
  const inferred = inferOpenQuestionNumbersFromPrompt([rawPregunta, texto].join('\n'), 2);
  const answerMap = getOpenAnswerMap(abiertas || [], [], inferred);
  const fromAnswers = [...answerMap.keys()].sort((a, b) => a - b);
  const promptSet = new Set(inferred);
  const intersection = fromAnswers.filter((n) => promptSet.has(n));
  const activeGaps = intersection.length > 0 ? intersection : inferred;

  // --- Lo que renderiza el componente: segmentos de gap en el texto limpio ---
  const renderedGaps = [...texto.matchAll(GAP_RE)].map((m) => Number(m[1]));

  console.log('--- Directions / Instructions (lo que ve el alumno arriba) ---');
  console.log(enunciado.split('\n').map((l) => `  | ${l}`).join('\n'));
  console.log('--- Text (primeras 2 líneas del panel) ---');
  texto.split('\n').slice(0, 2).forEach((l) => console.log(`  | ${l.slice(0, 110)}${l.length > 110 ? '…' : ''}`));

  const checks = [
    ['ejemplo roto "She lives in Madrid" eliminado', !enunciado.includes('She lives in Madrid')],
    ['bloque Example presente con gap (0) real', /Example:/.test(enunciado) && /\(0\)\s*(?:_+|…+|\.{2,})/.test(enunciado)],
    ['sin (0) en el texto principal', !/\(\s*0\s*\)\s*(?:_+|\.{2,}|…+)/.test(texto)],
    ['sin "(o)" (letra o) en el texto principal', !/\(\s*[oO]\s*\)\s*(?:_+|\.{2,}|…+)/.test(texto)],
    ['gaps renderizados en texto = 9–16', renderedGaps.join(',') === '9,10,11,12,13,14,15,16'],
    ['gaps activos (con input) = 9–16', activeGaps.join(',') === '9,10,11,12,13,14,15,16'],
    ['sin input para gap 0', !activeGaps.includes(0) && !renderedGaps.includes(0)],
  ];
  console.log('--- Checks ---');
  for (const [name, ok] of checks) {
    console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${name}`);
    if (!ok) failures += 1;
  }
}

console.log(
  failures === 0
    ? '\nTodos los exámenes muestran Part 2 limpia (read-only, sin escrituras).'
    : `\n${failures} check(s) fallidos.`,
);
process.exit(failures === 0 ? 0 : 1);
