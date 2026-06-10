/**
 * Backup + save of approved B2 Examen 1 Writing Parts 1–2 (Dralo parts 8–9).
 * 1. Backs up current rows (read-only, anon key) to scripts/generated/.
 * 2. Saves approved content via the production internal API (service key lives server-side).
 * 3. Verifies the saved enunciados parse into the approved tasks.
 * Usage: node scripts/push-writing-exam1.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';

const db = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const BASE_URL = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';

const apiKey =
  process.env.DRALO_INTERNAL_API_KEY ||
  process.env.INTERNAL_API_SECRET ||
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing internal API auth key (.env.local).');
  process.exit(1);
}

const headers = { 'Content-Type': 'application/json', 'x-internal-key': apiKey };

const PART1_GENERATED = {
  question:
    'Some people believe schools should teach practical life skills, such as cooking or managing money. Do you agree?',
  bulletPoints: [
    'why practical skills are useful',
    'possible problems with adding them to school subjects',
    'your own idea',
  ],
  instructions: 'Write an essay using all the notes and give reasons for your point of view.',
  wordMin: 140,
  wordMax: 190,
};

const PART2_GENERATED = {
  instructions:
    'Choose ONE of the tasks below and write your answer in 140–190 words in an appropriate style.',
  wordMin: 140,
  wordMax: 190,
  questions: [
    {
      number: 1,
      format: 'article',
      context: 'School English-language magazine announcement',
      targetReader: 'Students who read the school magazine',
      prompt: [
        'You see this announcement in your school’s English-language magazine:',
        'Articles wanted: Switch off and relax!',
        'What hobby or activity helps young people relax? Describe the hobby or activity, explain why it helps people relax, and say who you would recommend it to.',
      ].join('\n'),
    },
    {
      number: 2,
      format: 'email',
      context: 'Email from your English-speaking friend Alex',
      targetReader: 'Your friend Alex',
      prompt: [
        'You have received this email from your English-speaking friend Alex:',
        'Great news — I’m coming to stay in your area for a weekend next month! What could we do together while I’m there? And what clothes and other things should I bring? See you soon!',
        'In your email, suggest two things you could do together, explain what clothes and things Alex should bring, and offer to help with the plans.',
      ].join('\n'),
    },
    {
      number: 3,
      format: 'report',
      context: 'Report requested by the principal of your college',
      targetReader: 'The college principal',
      prompt: [
        'The principal of your college wants to improve the study areas for students, and has asked you to write a report.',
        'In your report, describe the problems with the study areas at the moment, suggest some improvements, and explain which change would be the most useful for students.',
      ].join('\n'),
    },
  ],
};

async function getPartRows(partNumber) {
  const { data: parte, error: parteError } = await db
    .from('levels_partes')
    .select('id, nombre_parte')
    .eq('nombre_parte', `Parte ${partNumber} B2`)
    .single();
  if (parteError || !parte) throw new Error(`Parte ${partNumber}: ${parteError?.message || 'not found'}`);

  const { data: preguntas, error: pregError } = await db
    .from('levels_preguntas')
    .select('*')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id);
  if (pregError) throw new Error(`Preguntas parte ${partNumber}: ${pregError.message}`);

  return { parte, preguntas: preguntas || [] };
}

async function savePart(partNumber, generated) {
  const res = await fetch(`${BASE_URL}/api/internal/save-exam-part-preview/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ slug: 'b2', slot: 1, partNumber, skipAudio: true, generated }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Save part ${partNumber} failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  // 1. Backup (read-only)
  const [p8, p9] = await Promise.all([getPartRows(8), getPartRows(9)]);
  const backup = {
    examenId: EXAMEN_ID,
    createdAt: new Date().toISOString(),
    rollbackNote:
      'Rollback: re-save the old enunciado via the same internal API, or restore levels_preguntas rows below.',
    part8: { parteId: p8.parte.id, rows: p8.preguntas },
    part9: { parteId: p9.parte.id, rows: p9.preguntas },
  };
  const backupPath = path.join(scriptsDir, 'generated', `backup-exam1-b2-writing-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`Backup written → ${backupPath}`);
  console.log(`Old preguntaId Part 1: ${p8.preguntas[0]?.id}`);
  console.log(`Old preguntaId Part 2: ${p9.preguntas[0]?.id}`);

  // 2. Save via production internal API
  const save8 = await savePart(8, PART1_GENERATED);
  console.log(`Part 1 saved. New preguntaId: ${save8.preguntaId}`);
  const save9 = await savePart(9, PART2_GENERATED);
  console.log(`Part 2 saved. New preguntaId: ${save9.preguntaId}`);

  // 3. Verify (read back)
  const [v8, v9] = await Promise.all([getPartRows(8), getPartRows(9)]);
  const e8 = v8.preguntas[0]?.enunciado || '';
  const e9 = v9.preguntas[0]?.enunciado || '';

  const checks = [
    ['P1 question', e8.includes('practical life skills, such as cooking or managing money')],
    ['P1 note 1', e8.includes('why practical skills are useful')],
    ['P1 word limit', e8.includes('140–190 words')],
    ['P2 instructions', e9.includes('Choose ONE of the tasks below')],
    ['P2 article', e9.includes('Switch off and relax!')],
    ['P2 email', e9.includes('English-speaking friend Alex')],
    ['P2 report', e9.includes('improve the study areas')],
    ['P2 no review', !/Write your review\./.test(e9)],
    ['P2 exactly 3 options', (e9.match(/^Write your /gm) || []).length === 3],
  ];

  let allOk = true;
  for (const [label, ok] of checks) {
    console.log(`Verify ${label}: ${ok ? 'OK' : 'FAIL'}`);
    if (!ok) allOk = false;
  }

  const result = {
    ok: allOk,
    backupPath,
    oldPreguntaIds: { part1: p8.preguntas[0]?.id, part2: p9.preguntas[0]?.id },
    newPreguntaIds: { part1: save8.preguntaId, part2: save9.preguntaId },
    enunciadoPart1: e8,
    enunciadoPart2: e9,
  };
  writeFileSync(
    path.join(scriptsDir, 'generated', 'save-writing-exam1-result.json'),
    JSON.stringify(result, null, 2),
    'utf8',
  );

  if (!allOk) process.exit(1);
  console.log('\nDone. Writing Part 1 + Part 2 saved and verified.');
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
