/**
 * Align Exam 1 Listening Part 10 MCQ questions/answers with resynthesized audio scripts.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/sync-part10-questions-exam1.mjs [examSlot]
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildB2EnunciadoFromGenerated } from '../src/lib/formatB2Enunciado.js';
import {
  buildAnswerRowsFromGenerated,
  formatMcqRespuestaRow,
} from '../src/lib/formatLevelsEnunciado.js';

const examSlot = Number(process.argv[2] || 1);
const partNumber = 10;
const env = loadEnvLocal();

const SETTING =
  'You will hear people talking in eight different everyday situations in an urban environment.';

/** @type {Array<{ number: number, situation: string, prompt: string, options: [string, string, string], correct: 'A'|'B'|'C' }>} */
const QUESTIONS = [
  {
    number: 1,
    situation: 'You hear two friends discussing a mobile app.',
    prompt: 'What does the app help users with when they are travelling around the city?',
    options: [
      'A) Finding empty parking spaces quickly',
      'B) Avoiding traffic problems on their route',
      'C) Checking daily weather forecasts',
    ],
    correct: 'B',
  },
  {
    number: 2,
    situation: 'You hear a conversation about smart home technology.',
    prompt: 'What does the woman highlight about the devices?',
    options: [
      'A) You can control several home systems from one app',
      'B) They are the cheapest devices on the market',
      'C) Each appliance needs a separate specialist installation',
    ],
    correct: 'A',
  },
  {
    number: 3,
    situation: 'You hear two neighbours talking about where they live.',
    prompt: 'What do they like most about their neighbourhood?',
    options: [
      'A) How quiet the streets are at night',
      'B) How affordable the local shops are',
      'C) How energetic and busy the area feels',
    ],
    correct: 'C',
  },
  {
    number: 4,
    situation: 'You hear two people discussing electric bikes.',
    prompt: 'Which advantage of e-bikes do they mention?',
    options: [
      'A) They are better for the environment',
      'B) They can carry heavier loads than ordinary bikes',
      'C) They always cost less than public transport',
    ],
    correct: 'A',
  },
  {
    number: 5,
    situation: 'You hear two visitors in a shared office space.',
    prompt: 'What especially impresses them about the coworking space?',
    options: [
      'A) The free drinks available all day',
      'B) The quality and speed of the internet connection',
      'C) That everyone gets their own private office',
    ],
    correct: 'B',
  },
  {
    number: 6,
    situation: 'You hear two friends talking about technology.',
    prompt: 'What do both speakers find difficult to cope with?',
    options: [
      'A) Arranging meetings online',
      'B) Keeping up with everything on social media',
      'C) Sending messages on their phones',
    ],
    correct: 'B',
  },
  {
    number: 7,
    situation: 'You hear people at a community meeting.',
    prompt: 'Why are more streetlights being installed in the area?',
    options: [
      'A) To help residents feel safer after dark',
      'B) To reduce the council’s electricity bills',
      'C) To make the streets look more attractive to tourists',
    ],
    correct: 'A',
  },
  {
    number: 8,
    situation: 'You hear a couple planning a meal out.',
    prompt: 'What kind of food does the new restaurant serve?',
    options: [
      'A) Authentic Mexican cooking',
      'B) Traditional Italian pasta dishes',
      'C) Dishes that combine different culinary styles',
    ],
    correct: 'C',
  },
];

function buildGeneratedPayload() {
  return {
    partNumber,
    setting: SETTING,
    questions: QUESTIONS.map((q) => ({
      number: q.number,
      situation: q.situation,
      prompt: q.prompt,
      options: q.options,
    })),
    modelAnswers: QUESTIONS.map((q) => ({
      number: q.number,
      answer: q.correct,
    })),
  };
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examenes } = await admin
  .from('levels_examenes')
  .select('id')
  .eq('level_id', level.id)
  .order('nombre');
const examenId = examenes[examSlot - 1]?.id;
const { data: parte } = await admin
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', `Parte ${partNumber} B2`)
  .single();
const { data: pregunta } = await admin
  .from('levels_preguntas')
  .select('id')
  .eq('examen_id', examenId)
  .eq('parte_id', parte.id)
  .single();

if (!pregunta?.id) {
  console.error('Pregunta Part 10 no encontrada');
  process.exit(1);
}

const generated = buildGeneratedPayload();
const enunciado = buildB2EnunciadoFromGenerated(generated, partNumber);
const { mcq } = buildAnswerRowsFromGenerated(generated);

console.error(`Actualizando pregunta ${pregunta.id}…`);

const { error: enErr } = await admin
  .from('levels_preguntas')
  .update({ enunciado })
  .eq('id', pregunta.id);
if (enErr) throw new Error(enErr.message);

await admin.from('levels_respuestas').delete().eq('pregunta_id', pregunta.id);

const rows = mcq.map((row) => ({
  pregunta_id: pregunta.id,
  respuesta: formatMcqRespuestaRow({
    questionNumber: row.questionNumber,
    letter: row.letter,
    text: row.text,
  }),
  correcta: Boolean(row.correcta),
}));

const { error: insErr } = await admin.from('levels_respuestas').insert(rows);
if (insErr) throw new Error(insErr.message);

const answerKey = QUESTIONS.map((q) => ({ n: q.number, correct: q.correct }));
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(path.join(root, 'scripts', 'generated'), { recursive: true });
writeFileSync(
  path.join(root, 'scripts', 'generated', `sync-part10-exam${examSlot}-result.json`),
  JSON.stringify({ preguntaId: pregunta.id, answerKey, enunciadoPreview: enunciado.slice(0, 500) }, null, 2),
);

console.log(
  JSON.stringify(
    {
      ok: true,
      examSlot,
      preguntaId: pregunta.id,
      mcqRows: rows.length,
      answerKey,
    },
    null,
    2,
  ),
);
