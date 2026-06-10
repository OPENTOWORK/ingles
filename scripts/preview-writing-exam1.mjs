/**
 * READ-ONLY preview of B2 Exam 1 Writing Parts 1–2 (Dralo parts 8–9).
 * Fetches current enunciados from Supabase (no writes) and builds the
 * proposed new Part 1 topic preview locally.
 * Usage: node scripts/preview-writing-exam1.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvLocal();

const DEFAULT_SUPABASE_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';

/**
 * Exam-realistic Part 2 for B2 Examen 1: exactly 3 options (Article, Email, Report).
 * The Review task is intentionally NOT included here — it is preserved below
 * as a Practice Mode extra / future Examen 2 option.
 */
const PROPOSED_PART2_ENUNCIADO = [
  'Writing Part 2 — Choose one task',
  'Choose ONE of the tasks below and write your answer in 140–190 words in an appropriate style.',
  'Word limit: 140–190 words',
  '',
  '1',
  'You see this announcement in your school’s English-language magazine:',
  'Articles wanted: Switch off and relax!',
  'What hobby or activity helps young people relax? Describe the hobby or activity, explain why it helps people relax, and say who you would recommend it to.',
  'Write your article.',
  '',
  '2',
  'You have received this email from your English-speaking friend Alex:',
  'Great news — I’m coming to stay in your area for a weekend next month! What could we do together while I’m there? And what clothes and other things should I bring? See you soon!',
  'In your email, suggest two things you could do together, explain what clothes and things Alex should bring, and offer to help with the plans.',
  'Write your email.',
  '',
  '3',
  'The principal of your college wants to improve the study areas for students, and has asked you to write a report.',
  'In your report, describe the problems with the study areas at the moment, suggest some improvements, and explain which change would be the most useful for students.',
  'Write your report.',
].join('\n');

/** Reserved for Practice Mode extras / future Examen 2 — NOT part of Examen 1 Part 2. */
const RESERVED_REVIEW_TASK = [
  'You see this announcement on a website for students:',
  'Reviews wanted! Have you read a book, watched a film or series, or visited a café, museum or other place that young people would enjoy? Describe it briefly, tell us what was good and less good about it, and say whether you would recommend it.',
  'Write your review.',
].join('\n');

const PROPOSED_PART1_ENUNCIADO = [
  'Writing Part 1 — Essay',
  '',
  'Question: Some people believe schools should teach practical life skills, such as cooking or managing money. Do you agree?',
  '',
  'Notes:',
  '1. why practical skills are useful',
  '2. possible problems with adding them to school subjects',
  '3. your own idea',
  '',
  'Instructions:',
  'Write an essay using all the notes and give reasons for your point of view.',
  '',
  'Word limit: 140–190 words',
].join('\n');

async function getPart(partNumber) {
  const { data: parte, error: parteError } = await db
    .from('levels_partes')
    .select('id, nombre_parte')
    .eq('nombre_parte', `Parte ${partNumber} B2`)
    .single();
  if (parteError || !parte) throw new Error(`Parte ${partNumber}: ${parteError?.message || 'not found'}`);

  const { data: preguntas, error: pregError } = await db
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id);
  if (pregError) throw new Error(`Preguntas parte ${partNumber}: ${pregError.message}`);

  return { parte, preguntas: preguntas || [] };
}

async function main() {
  const [p8, p9] = await Promise.all([getPart(8), getPart(9)]);

  const out = {
    examenId: EXAMEN_ID,
    generatedAt: new Date().toISOString(),
    readOnly: true,
    part1Current: {
      parteId: p8.parte.id,
      preguntaId: p8.preguntas[0]?.id || null,
      enunciado: p8.preguntas[0]?.enunciado || '',
    },
    part1Proposed: {
      enunciado: PROPOSED_PART1_ENUNCIADO,
      note: 'NOT saved to Supabase — preview only.',
    },
    part2Current: {
      parteId: p9.parte.id,
      preguntaId: p9.preguntas[0]?.id || null,
      enunciado: p9.preguntas[0]?.enunciado || '',
    },
    part2Proposed: {
      enunciado: PROPOSED_PART2_ENUNCIADO,
      note: 'NOT saved to Supabase — preview only. Exactly 3 options (exam-realistic format).',
    },
    part2ReservedTasks: [
      {
        writingType: 'review',
        enunciado: RESERVED_REVIEW_TASK,
        note: 'Approved Review task kept for Practice Mode extras or future Examen 2 Part 2. NOT in Examen 1.',
      },
    ],
  };

  const outPath = path.join(scriptsDir, 'generated', 'preview-exam1-b2-writing-parts.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

  console.log('=== WRITING PART 1 — CURRENT (DB) ===');
  console.log(out.part1Current.enunciado || '(empty)');
  console.log('\n=== WRITING PART 1 — PROPOSED (preview only) ===');
  console.log(PROPOSED_PART1_ENUNCIADO);
  console.log('\n=== WRITING PART 2 — CURRENT (DB) ===');
  console.log(out.part2Current.enunciado || '(empty)');
  console.log('\n=== WRITING PART 2 — PROPOSED (preview only) ===');
  console.log(PROPOSED_PART2_ENUNCIADO);
  console.log(`\nSaved preview JSON → ${outPath}`);
}

main().catch((err) => {
  console.error('Preview failed:', err.message);
  process.exit(1);
});
