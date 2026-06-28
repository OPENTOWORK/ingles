/**
 * Add Part 1 Q8 (gap, options, answer key) to B2 Exams 4–6 only.
 * Does not modify Q1–Q7 text/options or other parts.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/apply-b2-part1-q8-exams-456.mjs [--dry-run]
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

const Q8_BY_SLOT = {
  4: {
    textAppend:
      '\nEven established brands must innovate constantly if they do not want to (8) ___ behind.',
    options: { A: 'fall', B: 'stay', C: 'remain', D: 'trail' },
    correct: 'A',
    rationale: 'Collocation "fall behind" (lag behind competitors).',
  },
  5: {
    textAppend:
      '\nWithout adequate rest, the immune system may gradually (8) ___ weaker.',
    options: { A: 'grow', B: 'become', C: 'turn', D: 'get' },
    correct: 'D',
    rationale: '"Get weaker" fits gradual decline; distractors are plausible but less natural here.',
  },
  6: {
    textAppend:
      '\nOver time, successful gardens can (8) ___ a stronger sense of belonging among residents.',
    options: { A: 'create', B: 'build', C: 'foster', D: 'raise' },
    correct: 'C',
    rationale: 'Collocation "foster a sense of belonging".',
  },
};

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

function sortExamRows(rows) {
  return [...(rows || [])].sort((a, b) => {
    const na = parseInt(String(a?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    const nb = parseInt(String(b?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    if (na !== nb) return na - nb;
    return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
  });
}

function detectKeyFormat(respuestas) {
  const sample = (respuestas || []).find((r) => /^\d/.test(String(r.respuesta || '').trim()))?.respuesta || '';
  return /^\d+\s+[A-D]\)\s/.test(String(sample).trim()) ? 'paren' : 'plain';
}

function formatRespuesta(num, letter, word, style) {
  if (style === 'paren') return `${num} ${letter}) ${word}`;
  return `${num} ${letter} ${word}`;
}

function buildQ8Block(options, useBlankLines) {
  const lines = ['8'];
  for (const L of ['A', 'B', 'C', 'D']) {
    if (useBlankLines) lines.push('');
    lines.push(`${L} ${options[L]}`);
  }
  return lines.join('\n');
}

function addQ8ToEnunciado(enunciado, textAppend, q8Block) {
  const m = enunciado.match(/\nQuestions\n/i);
  if (!m) throw new Error('Questions block not found in enunciado');
  const idx = m.index;
  const textBefore = enunciado.slice(0, idx);
  const questionsBlock = enunciado.slice(idx);
  return `${textBefore}${textAppend}${questionsBlock}\n${q8Block}`;
}

function extractQ1to7Questions(enunciado) {
  const parts = enunciado.split(/\nQuestions\n/i);
  if (parts.length < 2) return '';
  const block = parts[1].replace(/\n8[\s\S]*/i, '');
  return block.trimEnd();
}

function extractPassageBeforeQ8(enunciado, textAppend) {
  const parts = enunciado.split(/\nQuestions\n/i);
  const passage = parts[0] || '';
  if (textAppend && passage.endsWith(textAppend)) {
    return passage.slice(0, -textAppend.length);
  }
  return passage;
}

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: parte1 } = await admin
  .from('levels_partes')
  .select('id, nombre_parte')
  .ilike('nombre_parte', 'parte 1 b2')
  .single();

const { data: exams } = await admin.from('levels_examenes').select('id, nombre').eq('level_id', level.id);
const sorted = sortExamRows(exams);

const results = [];

for (const slot of [4, 5, 6]) {
  const patch = Q8_BY_SLOT[slot];
  const exam = sorted[slot - 1];
  const { data: preg, error: pregErr } = await admin
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', exam.id)
    .eq('parte_id', parte1.id)
    .single();

  if (pregErr || !preg) {
    results.push({ slot, ok: false, error: pregErr?.message || 'pregunta not found' });
    continue;
  }

  const { data: respuestas } = await admin.from('levels_respuestas').select('*').eq('pregunta_id', preg.id);
  const q1to7Before = extractQ1to7Questions(preg.enunciado);
  const passageBefore = extractPassageBeforeQ8(preg.enunciado, '');

  const hasQ8Key = (respuestas || []).some((r) => r.correcta && /^8\s+[A-D]/i.test(String(r.respuesta || '')));
  if (hasQ8Key) {
    results.push({ slot, ok: false, error: 'Q8 key already exists — aborting to avoid duplicate apply' });
    continue;
  }

  const keyStyle = detectKeyFormat(respuestas);
  const useBlankLines = /\n7\s*\n\nA /.test(preg.enunciado) || slot === 6;
  const q8Block = buildQ8Block(patch.options, useBlankLines);
  const newEnunciado = addQ8ToEnunciado(preg.enunciado, patch.textAppend, q8Block);
  const q1to7After = extractQ1to7Questions(newEnunciado);
  const passageAfter = extractPassageBeforeQ8(newEnunciado, patch.textAppend);

  if (q1to7Before !== q1to7After) {
    results.push({ slot, ok: false, error: 'Q1–Q7 questions block changed after patch' });
    continue;
  }
  if (passageBefore !== passageAfter) {
    results.push({ slot, ok: false, error: 'Passage Q1–Q7 text changed unexpectedly' });
    continue;
  }

  const newRows = ['A', 'B', 'C', 'D'].map((L) => ({
    pregunta_id: preg.id,
    respuesta: formatRespuesta(8, L, patch.options[L], keyStyle),
    correcta: L === patch.correct,
  }));

  const result = {
    slot,
    preguntaId: preg.id,
    keyStyle,
    correct: patch.correct,
    options: patch.options,
    rationale: patch.rationale,
    newKey: formatRespuesta(8, patch.correct, patch.options[patch.correct], keyStyle),
  };

  if (!dryRun) {
    const { error: updErr } = await admin
      .from('levels_preguntas')
      .update({ enunciado: newEnunciado })
      .eq('id', preg.id);
    if (updErr) {
      results.push({ slot, ok: false, error: updErr.message });
      continue;
    }
    const { error: insErr } = await admin.from('levels_respuestas').insert(newRows);
    if (insErr) {
      results.push({ slot, ok: false, error: insErr.message });
      continue;
    }
  }

  result.ok = true;
  result.dryRun = dryRun;
  results.push(result);
  console.log(`Exam ${slot} Part 1 Q8 ${dryRun ? '(dry-run) ' : ''}OK — key ${result.newKey}`);
}

const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'apply-b2-part1-q8-exams-456-result.json');
writeFileSync(outPath, JSON.stringify({ appliedAt: new Date().toISOString(), dryRun, results }, null, 2), 'utf8');

const failed = results.filter((r) => !r.ok);
process.exit(failed.length ? 1 : 0);
