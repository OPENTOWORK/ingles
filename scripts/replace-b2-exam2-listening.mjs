/**
 * Sustituye el Listening del examen 2 de B2 (partes 10–13) por EXAM 02:
 * preguntas del documento y las cuatro grabaciones ya montadas.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/replace-b2-exam2-listening.mjs
 */
import { readFileSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { deletePartContentForExam, findLevelExamenRowBySlot } from '../src/lib/levelsExamPersist.js';
import { uploadListeningClip } from '../src/lib/levelsExamAudioStorage.js';
import { formatMcqRespuestaRow, formatOpenRespuestaRow } from '../src/lib/formatLevelsEnunciado.js';

const AUDIO_DIR = path.join(process.env.TEMP, 'exam02-listening-docx', 'EXAM 02');

const PARTS = [
  {
    partNumber: 10,
    file: 'P02_LISTENING_PART_1.mp3',
    title: 'Part 1: Short extracts (questions 1–8)',
    enunciado: `You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).

1
You hear a student talking to a friend about managing money after moving away from home.
What has Aisha done to reduce her spending?
A) reduced the amount she spends socialising
B) started preparing lunches in advance
C) looked for cheaper accommodation

2
You hear two friends discussing a concert they attended.
What impressed Luke most about the concert?
A) the singer's voice
B) the stage presentation
C) the quality of the sound

3
You hear a swimming coach giving feedback to a learner.
What does the coach want the learner to improve?
A) the strength of the leg movement
B) the position of the head while breathing
C) the amount of tension in the upper body

4
You hear a woman talking about moving from a city to a small town.
What does the woman appreciate most about living in the small town?
A) having a larger home
B) knowing more people locally
C) living in a quieter environment

5
You hear a media commentator discussing celebrities in advertising.
What concern does the commentator have about using celebrities in advertising?
A) The celebrity may receive more attention than the product.
B) Customers may assume the celebrity genuinely uses the product.
C) Companies may spend more money than the campaign can earn back.

6
You hear two friends discussing a plan to travel before starting university.
Why has Ruby postponed her trip?
A) She wants to save more money first.
B) Her parents are unhappy about the plan.
C) She needs to avoid missing the start of university.

7
You hear a man talking about an app he uses to record his baby's routine.
What does the man find most useful about the app?
A) It gives him advice about what to do each day.
B) It lets him recognise patterns over time.
C) It warns him when something may be wrong.

8
You hear a café owner talking about a change at work.
What change most improved the café owner's work-life balance?
A) closing the café for an additional day
B) giving more responsibility to another member of staff
C) reducing the number of services offered`,
    mcq: [
      [1, 'B', [
        ['A', 'reduced the amount she spends socialising'],
        ['B', 'started preparing lunches in advance'],
        ['C', 'looked for cheaper accommodation'],
      ]],
      [2, 'B', [
        ['A', "the singer's voice"],
        ['B', 'the stage presentation'],
        ['C', 'the quality of the sound'],
      ]],
      [3, 'C', [
        ['A', 'the strength of the leg movement'],
        ['B', 'the position of the head while breathing'],
        ['C', 'the amount of tension in the upper body'],
      ]],
      [4, 'B', [
        ['A', 'having a larger home'],
        ['B', 'knowing more people locally'],
        ['C', 'living in a quieter environment'],
      ]],
      [5, 'A', [
        ['A', 'The celebrity may receive more attention than the product.'],
        ['B', 'Customers may assume the celebrity genuinely uses the product.'],
        ['C', 'Companies may spend more money than the campaign can earn back.'],
      ]],
      [6, 'A', [
        ['A', 'She wants to save more money first.'],
        ['B', 'Her parents are unhappy about the plan.'],
        ['C', 'She needs to avoid missing the start of university.'],
      ]],
      [7, 'B', [
        ['A', 'It gives him advice about what to do each day.'],
        ['B', 'It lets him recognise patterns over time.'],
        ['C', 'It warns him when something may be wrong.'],
      ]],
      [8, 'B', [
        ['A', 'closing the café for an additional day'],
        ['B', 'giving more responsibility to another member of staff'],
        ['C', 'reducing the number of services offered'],
      ]],
    ],
  },
  {
    partNumber: 11,
    file: 'P02_LISTENING_PART_2.mp3',
    title: 'Part 2: Priya Nair, urban beekeeping (questions 9–18)',
    enunciado: `You hear a talk by Priya Nair, who keeps bees on city rooftops. For questions 9–18, complete the sentences with a word or short phrase.

Urban beekeeping

Priya first became interested in bees after helping a (9) ___.

Her first hive was placed on the roof of a (10) ___.

Priya says beginners should start with two wooden (11) ___ rather than one.

The main inspection season usually begins in (12) ___.

During a shortage of natural food, Priya sometimes gives the bees (13) ___.

A plant called (14) ___ provides particularly useful food for the bees in the city.

Priya keeps her hives at least (15) ___ from the edge of a roof.

One of her regular education partners is a local (16) ___.

Some of the beeswax is now made into reusable (17) ___.

Priya hopes to build an (18) ___ for visitors to see bees safely.`,
    open: {
      9: ['neighbour', 'neighbor', 'elderly neighbour', 'elderly neighbor'],
      10: ['library'],
      11: ['boxes'],
      12: ['March'],
      13: ['sugar syrup'],
      14: ['red clover'],
      15: ['two metres', '2 metres', 'two meters', '2 meters'],
      16: ['primary school', 'school'],
      17: ['food wraps'],
      18: ['observation hive'],
    },
  },
  {
    partNumber: 12,
    file: 'P02_LISTENING_PART_3.mp3',
    title: 'Part 3: Evening classes (questions 19–23)',
    enunciado: `You hear five people talking about joining an evening class. For questions 19–23, choose from the list (A–H) what surprised each speaker most. Use each letter only once. There are three extra letters which you do not need to use.

A how mixed the age range of the group was
B how much work they were expected to do between classes
C how practical the lessons were
D how funny the teacher was
E how supportive the other learners were
F how much specialist equipment was required
G how useful the course became in their job
H how quickly they noticed improvement

Speaker 1
Speaker 2
Speaker 3
Speaker 4
Speaker 5`,
    matching: { 19: 'A', 20: 'H', 21: 'G', 22: 'C', 23: 'E' },
  },
  {
    partNumber: 13,
    file: 'P02_LISTENING_PART_4.mp3',
    title: 'Part 4: Four-day working week (questions 24–30)',
    enunciado: `You hear two colleagues, Mia and Callum, discussing their company's six-month trial of a four-day working week. For questions 24–30, choose the best answer (A, B or C).

24
What was Mia most worried about before the trial began?
A) clients expecting help on the day the office was closed
B) staff trying to fit five days of work into four
C) senior managers ending the trial too quickly

25
What surprised Callum about clients' reaction?
A) Most of them adapted more easily than expected.
B) Several asked to change their own working hours.
C) They preferred contacting individual staff directly.

26
What change to meetings do both speakers think was most effective?
A) holding all meetings on the same day
B) limiting how long routine meetings could last
C) allowing people to join meetings remotely

27
What personal benefit has Mia noticed?
A) She spends more time doing exercise.
B) She feels less anxious on Sunday evenings.
C) She has begun studying for a qualification.

28
What do Mia and Callum disagree about?
A) whether productivity has actually increased
B) whether the office should remain closed on Fridays
C) whether staff should answer urgent messages on their day off

29
What problem has the trial revealed?
A) Some tasks are still concentrated with too few people.
B) New employees find it harder to meet colleagues.
C) Creative work is receiving less time than before.

30
What do they expect the company to do next?
A) return immediately to a five-day week
B) extend the trial while changing some procedures
C) make the four-day week permanent without further review`,
    mcq: [
      [24, 'B', [
        ['A', 'clients expecting help on the day the office was closed'],
        ['B', 'staff trying to fit five days of work into four'],
        ['C', 'senior managers ending the trial too quickly'],
      ]],
      [25, 'A', [
        ['A', 'Most of them adapted more easily than expected.'],
        ['B', 'Several asked to change their own working hours.'],
        ['C', 'They preferred contacting individual staff directly.'],
      ]],
      [26, 'B', [
        ['A', 'holding all meetings on the same day'],
        ['B', 'limiting how long routine meetings could last'],
        ['C', 'allowing people to join meetings remotely'],
      ]],
      [27, 'B', [
        ['A', 'She spends more time doing exercise.'],
        ['B', 'She feels less anxious on Sunday evenings.'],
        ['C', 'She has begun studying for a qualification.'],
      ]],
      [28, 'C', [
        ['A', 'whether productivity has actually increased'],
        ['B', 'whether the office should remain closed on Fridays'],
        ['C', 'whether staff should answer urgent messages on their day off'],
      ]],
      [29, 'A', [
        ['A', 'Some tasks are still concentrated with too few people.'],
        ['B', 'New employees find it harder to meet colleagues.'],
        ['C', 'Creative work is receiving less time than before.'],
      ]],
      [30, 'B', [
        ['A', 'return immediately to a five-day week'],
        ['B', 'extend the trial while changing some procedures'],
        ['C', 'make the four-day week permanent without further review'],
      ]],
    ],
  },
];

const env = loadEnvLocal();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level, error: levelErr } = await db.from('levels').select('id, nombre').ilike('nombre', 'b2').single();
if (levelErr || !level) throw new Error(levelErr?.message || 'No B2 level');

const examen = await findLevelExamenRowBySlot(db, level.id, 2);
if (!examen) throw new Error('No B2 exam slot 2');
console.log(`Examen 2: ${examen.nombre} (${examen.id})`);

const { data: partes, error: partesErr } = await db
  .from('levels_partes')
  .select('id, nombre_parte')
  .in('nombre_parte', [10, 11, 12, 13].map((n) => `Parte ${n} B2`));
if (partesErr) throw new Error(partesErr.message);
const parteId = Object.fromEntries(
  (partes || []).map((p) => [Number(String(p.nombre_parte).match(/\d+/)?.[0]), p.id]),
);

for (const part of PARTS) {
  const parte = parteId[part.partNumber];
  if (!parte) throw new Error(`Missing Parte ${part.partNumber} B2`);

  await deletePartContentForExam(db, examen.id, parte, { levelSlug: 'b2', partNumber: part.partNumber });

  const { data: pregunta, error: pqErr } = await db
    .from('levels_preguntas')
    .insert({
      level_id: level.id,
      examen_id: examen.id,
      parte_id: parte,
      enunciado: part.enunciado,
    })
    .select('id')
    .single();
  if (pqErr) throw new Error(`levels_preguntas ${part.partNumber}: ${pqErr.message}`);

  if (part.mcq) {
    const rows = [];
    for (const [number, correct, options] of part.mcq) {
      for (const [letter, text] of options) {
        rows.push({
          pregunta_id: pregunta.id,
          respuesta: formatMcqRespuestaRow({ questionNumber: number, letter, text }),
          correcta: letter === correct,
        });
      }
    }
    const { error } = await db.from('levels_respuestas').insert(rows);
    if (error) throw new Error(`levels_respuestas ${part.partNumber}: ${error.message}`);
  }

  if (part.open) {
    const rows = [];
    for (const [number, variants] of Object.entries(part.open)) {
      for (const text of variants) {
        rows.push({
          pregunta_id_abierta: pregunta.id,
          respuesta_texto: formatOpenRespuestaRow({ questionNumber: Number(number), text }),
        });
      }
    }
    const { error } = await db.from('levels_respuestas_abiertas').insert(rows);
    if (error) throw new Error(`levels_respuestas_abiertas ${part.partNumber}: ${error.message}`);
  }

  if (part.matching) {
    const rows = [];
    for (const [number, correct] of Object.entries(part.matching)) {
      for (const letter of 'ABCDEFGH') {
        rows.push({
          pregunta_id: pregunta.id,
          respuesta: formatMcqRespuestaRow({ questionNumber: Number(number), letter, text: '' }),
          correcta: letter === correct,
        });
      }
    }
    const { error } = await db.from('levels_respuestas').insert(rows);
    if (error) throw new Error(`levels_respuestas matching ${part.partNumber}: ${error.message}`);
  }

  const audioPath = path.join(AUDIO_DIR, part.file);
  const audioBuffer = readFileSync(audioPath);
  const storagePath = `b2/exam-2/part-${part.partNumber}/full-exam02.mp3`;
  const audioUrl = await uploadListeningClip(db, { path: storagePath, audioBuffer });
  const { error: audioErr } = await db.from('levels_preguntas_audios').insert({
    pregunta_id: pregunta.id,
    audio_url: audioUrl,
    orden: 1,
    titulo: part.title,
  });
  if (audioErr) throw new Error(`levels_preguntas_audios ${part.partNumber}: ${audioErr.message}`);

  const head = await fetch(audioUrl, { method: 'HEAD' });
  console.log(
    `Parte ${part.partNumber}: pregunta ${pregunta.id}, audio ${head.status} ${(audioBuffer.length / 1e6).toFixed(1)} MB`,
  );
}

console.log('Listening del examen 2 sustituido.');
