/**
 * Sustituye el Listening del examen 3 de B2 (partes 10–13) por EXAM 03:
 * preguntas del documento y las cuatro grabaciones ya montadas.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/replace-b2-exam3-listening.mjs
 */
import { readFileSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { deletePartContentForExam, findLevelExamenRowBySlot } from '../src/lib/levelsExamPersist.js';
import { uploadListeningClip } from '../src/lib/levelsExamAudioStorage.js';
import { formatMcqRespuestaRow, formatOpenRespuestaRow } from '../src/lib/formatLevelsEnunciado.js';

const AUDIO_DIR = path.join(process.env.TEMP, 'exam03-listening-docx', 'EXAM 03');

const PARTS = [
  {
    partNumber: 10,
    file: 'P03_LISTENING_PART_1.mp3',
    title: 'Part 1: Short extracts (questions 1–8)',
    enunciado: `You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).

1
You hear a student talking to a friend about cutting everyday costs.
How has Noah mainly reduced his spending?
A) by preparing his own lunches
B) by going out with friends less often
C) by buying cheaper evening meals

2
You hear two friends talking after visiting an art gallery.
What changed Grace's view of the painting?
A) a question asked by the gallery guide
B) an explanation of the painter's intention
C) a detail Ethan pointed out

3
You hear a traveller talking about a delayed journey.
Why was the traveller satisfied with the airline?
A) The staff dealt effectively with a connection problem.
B) The food was better than expected.
C) The seat was particularly comfortable.

4
You hear a designer talking about taking a professional course.
Why did the designer take the course?
A) to gain a qualification required by her employer
B) to prepare for a different career
C) to refresh and extend her creative skills

5
You hear two friends discussing plans for a very hot day.
Why do the friends change their plan?
A) because heavy rain is expected
B) because the weather will be too hot
C) because strong winds are forecast

6
You hear a man talking about a problem at home.
Why did the man decide to call a professional?
A) He did not have enough time to do the repair.
B) He thought the problem might be unsafe.
C) He lacked the basic tools he needed.

7
You hear a woman talking about a singer she admires.
What does the woman value most about the singer?
A) the quality of her lyrics
B) the originality of her voice
C) the musical arrangements

8
You hear two friends talking about a shop.
What is Cara's main reservation about the shop?
A) The staff are not knowledgeable enough.
B) The products are too expensive.
C) The displays make products difficult to compare.`,
    mcq: [
      [1, 'A', [
        ['A', 'by preparing his own lunches'],
        ['B', 'by going out with friends less often'],
        ['C', 'by buying cheaper evening meals'],
      ]],
      [2, 'A', [
        ['A', 'a question asked by the gallery guide'],
        ['B', "an explanation of the painter's intention"],
        ['C', 'a detail Ethan pointed out'],
      ]],
      [3, 'A', [
        ['A', 'The staff dealt effectively with a connection problem.'],
        ['B', 'The food was better than expected.'],
        ['C', 'The seat was particularly comfortable.'],
      ]],
      [4, 'C', [
        ['A', 'to gain a qualification required by her employer'],
        ['B', 'to prepare for a different career'],
        ['C', 'to refresh and extend her creative skills'],
      ]],
      [5, 'B', [
        ['A', 'because heavy rain is expected'],
        ['B', 'because the weather will be too hot'],
        ['C', 'because strong winds are forecast'],
      ]],
      [6, 'B', [
        ['A', 'He did not have enough time to do the repair.'],
        ['B', 'He thought the problem might be unsafe.'],
        ['C', 'He lacked the basic tools he needed.'],
      ]],
      [7, 'A', [
        ['A', 'the quality of her lyrics'],
        ['B', 'the originality of her voice'],
        ['C', 'the musical arrangements'],
      ]],
      [8, 'B', [
        ['A', 'The staff are not knowledgeable enough.'],
        ['B', 'The products are too expensive.'],
        ['C', 'The displays make products difficult to compare.'],
      ]],
    ],
  },
  {
    partNumber: 11,
    file: 'P03_LISTENING_PART_2.mp3',
    title: 'Part 2: Sofia Malik, food festival (questions 9–18)',
    enunciado: `You hear a talk by Sofia Malik, who organises a neighbourhood food festival. For questions 9–18, complete the sentences with a word or short phrase.

Organising a neighbourhood food festival

The first festival was held in a (9) ___.

This year the festival will have (10) ___ food stalls.

Visitors are encouraged to use reusable (11) ___.

Demonstrations take place on the festival's (12) ___.

A (13) ___ provides bread for the community lunch.

The public entrance opens at (14) ___.

If the weather is very bad, activities move into a nearby (15) ___.

Festival volunteers can be recognised by their (16) ___.

Unsold food is given to a local (17) ___.

Next year Sofia hopes to add a special (18) ___ event.`,
    open: {
      9: ['school playground', 'playground'],
      10: ['18', 'eighteen'],
      11: ['cups'],
      12: ['cooking stage', 'covered cooking stage'],
      13: ['local bakery', 'bakery'],
      14: ['11 a.m.', '11 am', '11am', '11', 'eleven', 'eleven a.m.', '11.00', '11:00'],
      15: ['sports hall'],
      16: ['green shirts', 'green shirt'],
      17: ['food bank'],
      18: ['breakfast'],
    },
  },
  {
    partNumber: 12,
    file: 'P03_LISTENING_PART_3.mp3',
    title: 'Part 3: Slower journeys (questions 19–23)',
    enunciado: `You hear five people talking about taking a slower journey rather than flying or driving directly to their destination. For questions 19–23, choose from the list (A–H) what each speaker appreciated most. Use each letter only once. There are three extra letters which you do not need to use.

A having time to enjoy the scenery
B meeting interesting people during the journey
C being able to change plans easily
D spending less money than expected
E reducing the environmental impact of the trip
F trying food in places they would otherwise have missed
G having more time to read
H avoiding the stress of airports

Speaker 1
Speaker 2
Speaker 3
Speaker 4
Speaker 5`,
    matching: { 19: 'A', 20: 'C', 21: 'H', 22: 'E', 23: 'F' },
  },
  {
    partNumber: 13,
    file: 'P03_LISTENING_PART_4.mp3',
    title: 'Part 4: Museum navigation app (questions 24–30)',
    enunciado: `You hear an interview with app designer Leo Chen about creating a navigation app for museums. For questions 24–30, choose the best answer (A, B or C).

24
What problem first inspired Leo to work on the app?
A) Visitors often struggled to decide where to begin.
B) Museum maps contained too little detail.
C) Visitors were unable to find basic facilities.

25
What did early user testing reveal about printed maps?
A) People found the symbols difficult to understand.
B) People often stopped looking at them after entering the museum.
C) People wanted maps to include more written information.

26
Why did Leo's team reduce the number of audio notifications?
A) They distracted visitors from what they were looking at.
B) They were difficult to hear in crowded galleries.
C) They used too much of the phone's battery.

27
Which accessibility feature proved useful to a wider audience than expected?
A) a high-contrast route display
B) written descriptions of audio content
C) step-free route planning

28
What surprised Leo about older visitors?
A) Many preferred the app to asking staff for help.
B) They used more advanced features than expected.
C) They were more willing than younger visitors to share location data.

29
What did museum staff contribute most effectively?
A) ideas about which artworks should be promoted
B) knowledge of how visitors actually move through the building
C) technical advice about phone connectivity

30
What principle is guiding the next version of the app?
A) It should suggest routes without collecting unnecessary personal data.
B) It should encourage visitors to spend longer in the museum.
C) It should replace most physical signs inside the building.`,
    mcq: [
      [24, 'A', [
        ['A', 'Visitors often struggled to decide where to begin.'],
        ['B', 'Museum maps contained too little detail.'],
        ['C', 'Visitors were unable to find basic facilities.'],
      ]],
      [25, 'B', [
        ['A', 'People found the symbols difficult to understand.'],
        ['B', 'People often stopped looking at them after entering the museum.'],
        ['C', 'People wanted maps to include more written information.'],
      ]],
      [26, 'A', [
        ['A', 'They distracted visitors from what they were looking at.'],
        ['B', 'They were difficult to hear in crowded galleries.'],
        ['C', "They used too much of the phone's battery."],
      ]],
      [27, 'C', [
        ['A', 'a high-contrast route display'],
        ['B', 'written descriptions of audio content'],
        ['C', 'step-free route planning'],
      ]],
      [28, 'B', [
        ['A', 'Many preferred the app to asking staff for help.'],
        ['B', 'They used more advanced features than expected.'],
        ['C', 'They were more willing than younger visitors to share location data.'],
      ]],
      [29, 'B', [
        ['A', 'ideas about which artworks should be promoted'],
        ['B', 'knowledge of how visitors actually move through the building'],
        ['C', 'technical advice about phone connectivity'],
      ]],
      [30, 'A', [
        ['A', 'It should suggest routes without collecting unnecessary personal data.'],
        ['B', 'It should encourage visitors to spend longer in the museum.'],
        ['C', 'It should replace most physical signs inside the building.'],
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

const examen = await findLevelExamenRowBySlot(db, level.id, 3);
if (!examen) throw new Error('No B2 exam slot 3');
console.log(`Examen 3: ${examen.nombre} (${examen.id})`);

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
  const storagePath = `b2/exam-3/part-${part.partNumber}/full-exam03.mp3`;
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

console.log('Listening del examen 3 sustituido.');
