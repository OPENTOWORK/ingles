/**
 * Sustituye el Listening del examen 4 de B2 (partes 10–13) por EXAM 04:
 * preguntas del documento y las cuatro grabaciones ya montadas.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/replace-b2-exam4-listening.mjs
 */
import { readFileSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { deletePartContentForExam, findLevelExamenRowBySlot } from '../src/lib/levelsExamPersist.js';
import { uploadListeningClip } from '../src/lib/levelsExamAudioStorage.js';
import { formatMcqRespuestaRow, formatOpenRespuestaRow } from '../src/lib/formatLevelsEnunciado.js';

const AUDIO_DIR = path.join(process.env.TEMP, 'exam04-listening-docx', 'EXAM 04');

const PARTS = [
  {
    partNumber: 10,
    file: 'P04_LISTENING_PART_1.mp3',
    title: 'Part 1: Short extracts (questions 1–8)',
    enunciado: `You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).

1
You hear an amateur photographer describing a club outing.
What did the photographer find most useful about the club outing?
A) meeting people with more expensive equipment
B) learning to wait before taking a picture
C) understanding new camera settings

2
You hear two friends checking a restaurant booking.
What does Nora suggest they do?
A) change the booking to another evening
B) arrive at the restaurant earlier than planned
C) telephone the restaurant to check the time

3
You hear a lecturer talking to students about taking notes.
What does the lecturer advise students to do?
A) summarise the main points while listening
B) record the whole lecture on a phone
C) rewrite their notes immediately after class

4
You hear a reviewer discussing a documentary film.
What most impressed the reviewer about the documentary?
A) the people chosen for the interviews
B) the unusual places where it was filmed
C) the way different kinds of material were put together

5
You hear a weather forecaster advising walkers.
What does the forecaster advise walkers to do this morning?
A) set off earlier than usual
B) use a route that stays at a lower level
C) carry extra drinking water

6
You hear a recruitment advisor talking about job interviews.
What mistake does the adviser say candidates often make?
A) speaking too quickly because they are nervous
B) failing to find out enough about the employer
C) making claims without giving a specific example

7
You hear a voicemail message from a museum lost property office.
Why is the museum employee calling?
A) to confirm what the lost item looks like
B) to explain when the item must be collected
C) to ask the visitor to pay postage costs

8
You hear a scientist describing a sleep study.
What finding surprised the research team?
A) Screen users took much longer to fall asleep.
B) Screen users woke more often during the night.
C) Screen users remembered fewer dreams the next morning.`,
    mcq: [
      [1, 'B', [
        ['A', 'meeting people with more expensive equipment'],
        ['B', 'learning to wait before taking a picture'],
        ['C', 'understanding new camera settings'],
      ]],
      [2, 'C', [
        ['A', 'change the booking to another evening'],
        ['B', 'arrive at the restaurant earlier than planned'],
        ['C', 'telephone the restaurant to check the time'],
      ]],
      [3, 'A', [
        ['A', 'summarise the main points while listening'],
        ['B', 'record the whole lecture on a phone'],
        ['C', 'rewrite their notes immediately after class'],
      ]],
      [4, 'C', [
        ['A', 'the people chosen for the interviews'],
        ['B', 'the unusual places where it was filmed'],
        ['C', 'the way different kinds of material were put together'],
      ]],
      [5, 'B', [
        ['A', 'set off earlier than usual'],
        ['B', 'use a route that stays at a lower level'],
        ['C', 'carry extra drinking water'],
      ]],
      [6, 'C', [
        ['A', 'speaking too quickly because they are nervous'],
        ['B', 'failing to find out enough about the employer'],
        ['C', 'making claims without giving a specific example'],
      ]],
      [7, 'B', [
        ['A', 'to confirm what the lost item looks like'],
        ['B', 'to explain when the item must be collected'],
        ['C', 'to ask the visitor to pay postage costs'],
      ]],
      [8, 'B', [
        ['A', 'Screen users took much longer to fall asleep.'],
        ['B', 'Screen users woke more often during the night.'],
        ['C', 'Screen users remembered fewer dreams the next morning.'],
      ]],
    ],
  },
  {
    partNumber: 11,
    file: 'P04_LISTENING_PART_2.mp3',
    title: 'Part 2: Ellie Turner, community radio (questions 9–18)',
    enunciado: `You hear a talk by Ellie Turner, who volunteers at a community radio station. For questions 9–18, complete the sentences with a word or short phrase.

Volunteering at a community radio station

Ellie first tried radio as part of a (9) ___.

The station now broadcasts from a converted (10) ___.

New presenters are taught how to use the studio (11) ___ before going on air.

Ellie's regular programme is broadcast on (12) ___.

At the beginning of each programme, Ellie reads a short (13) ___.

A typical interview on Ellie's programme lasts about (14) ___.

The programme often includes music by (15) ___.

A (16) ___ outside the studio shows when a microphone is live.

Volunteers receive a (17) ___ containing the station's main rules.

The station hopes to create a small (18) ___ next year.`,
    open: {
      9: ['school project'],
      10: ['shop'],
      11: ['headphones'],
      12: ['Thursday evening', 'Thursday', 'Thursdays'],
      13: ['weather report'],
      14: ['45 minutes', 'forty-five minutes', 'forty five minutes', '45 mins'],
      15: ['local musicians'],
      16: ['red light'],
      17: ['training handbook', 'handbook'],
      18: ['podcast studio'],
    },
  },
  {
    partNumber: 12,
    file: 'P04_LISTENING_PART_3.mp3',
    title: 'Part 3: Learning an instrument (questions 19–23)',
    enunciado: `You hear five people talking about learning to play a musical instrument. For questions 19–23, choose from the list (A–H) what each speaker says helped them most. Use each letter only once. There are three extra letters which you do not need to use.

A practising along with professional recordings
B having a fixed time for practice
C performing in front of other people
D learning the theory behind the music
E starting with music they already knew well
F practising with another learner
G recording their own practice sessions
H joining a larger group of musicians

Speaker 1
Speaker 2
Speaker 3
Speaker 4
Speaker 5`,
    matching: { 19: 'B', 20: 'F', 21: 'G', 22: 'E', 23: 'H' },
  },
  {
    partNumber: 13,
    file: 'P04_LISTENING_PART_4.mp3',
    title: 'Part 4: Town-centre square (questions 24–30)',
    enunciado: `You hear an interview with urban planner Samira Cole about redesigning a town-centre square. For questions 24–30, choose the best answer (A, B or C).

24
What was the main problem with the square before the redesign?
A) It contained too many different activities.
B) People mainly used it as a route to somewhere else.
C) The shops around it were difficult to reach.

25
What surprised Samira during the public consultation?
A) Older residents wanted more activity in the evening.
B) Teenagers were most concerned about the trees.
C) Shop owners wanted all parking removed.

26
How did the team deal with delivery traffic?
A) They banned deliveries from the square completely.
B) They created a new underground delivery area.
C) They restricted deliveries to particular hours.

27
What principle guided the choice of seating?
A) People should be able to choose different ways of sitting.
B) All seats should face the central performance area.
C) The seating should be easy to remove for large events.

28
What was the biggest difficulty when planting new trees?
A) finding species that could tolerate wind
B) avoiding underground pipes and cables
C) persuading businesses to accept reduced visibility

29
What has happened to the businesses around the square?
A) Weekend customer numbers have generally increased.
B) Most cafés now stay open much later every night.
C) Several shops have changed the type of products they sell.

30
What does Samira say should happen next?
A) A permanent stage should be built immediately.
B) The square should be studied across different seasons.
C) More road space should be converted into shops.`,
    mcq: [
      [24, 'B', [
        ['A', 'It contained too many different activities.'],
        ['B', 'People mainly used it as a route to somewhere else.'],
        ['C', 'The shops around it were difficult to reach.'],
      ]],
      [25, 'A', [
        ['A', 'Older residents wanted more activity in the evening.'],
        ['B', 'Teenagers were most concerned about the trees.'],
        ['C', 'Shop owners wanted all parking removed.'],
      ]],
      [26, 'C', [
        ['A', 'They banned deliveries from the square completely.'],
        ['B', 'They created a new underground delivery area.'],
        ['C', 'They restricted deliveries to particular hours.'],
      ]],
      [27, 'A', [
        ['A', 'People should be able to choose different ways of sitting.'],
        ['B', 'All seats should face the central performance area.'],
        ['C', 'The seating should be easy to remove for large events.'],
      ]],
      [28, 'B', [
        ['A', 'finding species that could tolerate wind'],
        ['B', 'avoiding underground pipes and cables'],
        ['C', 'persuading businesses to accept reduced visibility'],
      ]],
      [29, 'A', [
        ['A', 'Weekend customer numbers have generally increased.'],
        ['B', 'Most cafés now stay open much later every night.'],
        ['C', 'Several shops have changed the type of products they sell.'],
      ]],
      [30, 'B', [
        ['A', 'A permanent stage should be built immediately.'],
        ['B', 'The square should be studied across different seasons.'],
        ['C', 'More road space should be converted into shops.'],
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

const examen = await findLevelExamenRowBySlot(db, level.id, 4);
if (!examen) throw new Error('No B2 exam slot 4');
console.log(`Examen 4: ${examen.nombre} (${examen.id})`);

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
  const storagePath = `b2/exam-4/part-${part.partNumber}/full-exam04.mp3`;
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

console.log('Listening del examen 4 sustituido.');
