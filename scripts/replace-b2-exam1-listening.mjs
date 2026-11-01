/**
 * Sustituye el Listening del examen 1 de B2 (partes 10–13) por EXAM 01:
 * preguntas del documento y las cuatro grabaciones ya montadas (intro, pausa y dos pasadas).
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/replace-b2-exam1-listening.mjs
 */
import { readFileSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { deletePartContentForExam, findLevelExamenRowBySlot } from '../src/lib/levelsExamPersist.js';
import { uploadListeningClip } from '../src/lib/levelsExamAudioStorage.js';
import { formatMcqRespuestaRow, formatOpenRespuestaRow } from '../src/lib/formatLevelsEnunciado.js';

const AUDIO_DIR = path.join(process.env.TEMP, 'exam01-listening-docx', 'EXAM 01');

const PARTS = [
  {
    partNumber: 10,
    file: 'P01_LISTENING_PART_1.mp3',
    title: 'Part 1: Short extracts (questions 1–8)',
    enunciado: `You will hear eight short unrelated recordings. For questions 1–8, choose the best answer (A, B or C).

1
You hear two friends talking after visiting a recently renovated community centre.
What do Maya and Tom think the renovation has done particularly well?
A) made the outside of the building more attractive
B) allowed different activities to take place successfully
C) improved the way customers are served in the café

2
You hear two friends discussing their plans for the evening.
Why do Ben and Sophie decide not to go to the outdoor film?
A) Rain is expected during the evening.
B) The wind is likely to become too strong.
C) They think the temperature will be too low.

3
You hear a nutritionist giving advice about food labels.
What advice does the nutritionist give about food labels?
A) Check that products are being compared using the same quantity.
B) Ignore the coloured labels and concentrate only on the figures.
C) Choose products whose serving sizes are smaller.

4
You hear two colleagues talking about a new role at work.
Why is Daniel interested in applying for the new role?
A) It would give him a significant increase in salary.
B) It would provide him with a more impressive job title.
C) It would allow him to take greater responsibility for decisions.

5
You hear two friends discussing a television drama they have just finished watching.
What did Olivia and Claire like most about the television drama?
A) the amount of action in each episode
B) the way the music created atmosphere
C) the way events were shown from different viewpoints

6
You hear a man talking about a weekend trip he took without using a car.
What surprised the man most about travelling without a car?
A) how much more he noticed during the trip
B) how difficult the public transport connections were
C) how little difference the journey made to the environment

7
You hear a voicemail message about a music rehearsal.
What does Megan ask Josh to do?
A) arrange access to the school hall
B) bring something needed for the rehearsal
C) confirm that he has received the new rehearsal time

8
You hear part of an interview with a scientist who studies migrating butterflies.
What was the most unexpected result of the butterfly research?
A) The butterflies were travelling much greater distances.
B) The butterflies were reaching some areas much earlier.
C) The plants used by the butterflies had moved north.`,
    mcq: [
      [1, 'B', [
        ['A', 'made the outside of the building more attractive'],
        ['B', 'allowed different activities to take place successfully'],
        ['C', 'improved the way customers are served in the café'],
      ]],
      [2, 'B', [
        ['A', 'Rain is expected during the evening.'],
        ['B', 'The wind is likely to become too strong.'],
        ['C', 'They think the temperature will be too low.'],
      ]],
      [3, 'A', [
        ['A', 'Check that products are being compared using the same quantity.'],
        ['B', 'Ignore the coloured labels and concentrate only on the figures.'],
        ['C', 'Choose products whose serving sizes are smaller.'],
      ]],
      [4, 'C', [
        ['A', 'It would give him a significant increase in salary.'],
        ['B', 'It would provide him with a more impressive job title.'],
        ['C', 'It would allow him to take greater responsibility for decisions.'],
      ]],
      [5, 'C', [
        ['A', 'the amount of action in each episode'],
        ['B', 'the way the music created atmosphere'],
        ['C', 'the way events were shown from different viewpoints'],
      ]],
      [6, 'A', [
        ['A', 'how much more he noticed during the trip'],
        ['B', 'how difficult the public transport connections were'],
        ['C', 'how little difference the journey made to the environment'],
      ]],
      [7, 'C', [
        ['A', 'arrange access to the school hall'],
        ['B', 'bring something needed for the rehearsal'],
        ['C', 'confirm that he has received the new rehearsal time'],
      ]],
      [8, 'B', [
        ['A', 'The butterflies were travelling much greater distances.'],
        ['B', 'The butterflies were reaching some areas much earlier.'],
        ['C', 'The plants used by the butterflies had moved north.'],
      ]],
    ],
  },
  {
    partNumber: 11,
    file: 'P01_LISTENING_PART_2.mp3',
    title: 'Part 2: Hannah Cole, sourdough bakery (questions 9–18)',
    enunciado: `You will hear a talk by Hannah Cole, who runs a small sourdough bakery. For questions 9–18, complete the sentences with a word or short phrase.

Hannah first became interested in bread while volunteering at a (9) ___.

She first sold her bread regularly at the (10) ___.

In the bakery building, an old (11) ___ was kept and used for cooling bread and packing orders.

The bakery mainly uses (12) ___ to feed its sourdough starter.

The bakery's most popular regular product is the (13) ___.

On baking days, the staff begin work at (14) ___ in the morning.

Hannah says their sourdough can remain good for about (15) ___ when stored properly.

Each bread-making class is now limited to (16) ___.

Unsold bread is collected by a local (17) ___.

Instead of opening another bakery, Hannah would like to create a small (18) ___.`,
    open: {
      9: ['community cafe', 'community café'],
      10: ['Saturday market', 'the Saturday market'],
      11: ['counter', 'long counter'],
      12: ['rye flour'],
      13: ['walnut loaf', 'the walnut loaf'],
      14: ['4.30', '4:30', '4.30 am', '4:30 am', 'half past four', 'four thirty'],
      15: ['four days', '4 days'],
      16: ['six people', '6 people', 'six', '6'],
      17: ['soup kitchen'],
      18: ['milling room'],
    },
  },
  {
    partNumber: 12,
    file: 'P01_LISTENING_PART_3.mp3',
    title: 'Part 3: Community garden (questions 19–23)',
    enunciado: `You will hear five short extracts in which people are talking about taking part in a community garden. For questions 19–23, choose from the list (A–H) what each speaker values most. Use each letter only once. There are three extra letters which you do not need to use.

A being able to take fresh produce home
B getting to know people in the local area
C having a way to switch off mentally after work
D improving a neglected part of the neighbourhood
E helping children understand how food and nature work
F becoming more confident and skilful at gardening
G getting more physical exercise
H receiving advice from a highly experienced gardener

Speaker 1
Speaker 2
Speaker 3
Speaker 4
Speaker 5`,
    matching: { 19: 'B', 20: 'C', 21: 'D', 22: 'E', 23: 'F' },
  },
  {
    partNumber: 13,
    file: 'P01_LISTENING_PART_4.mp3',
    title: 'Part 4: Laura Bennett, department store library (questions 24–30)',
    enunciado: `You will hear an interview with architect Laura Bennett about turning an old department store into a public library. For questions 24–30, choose the best answer (A, B or C).

24
What first led Laura towards architecture?
A) She was particularly talented at drawing buildings.
B) She was interested in making places look more attractive.
C) She was curious about how people behaved in different spaces.

25
What was the main difficulty in converting the old department store?
A) bringing enough natural light into the centre of the building
B) creating more floor space for readers and students
C) reducing the amount of artificial lighting used throughout the building

26
Why did Laura's team decide to keep the central staircase?
A) It made movement between floors more efficient.
B) Local people associated it strongly with the building's past.
C) Removing it would have made the project too expensive.

27
What surprised Laura about the teenagers using the new library?
A) They made less use of the technology area than she had expected.
B) They preferred working in large groups rather than alone.
C) They avoided areas where they could still see other people.

28
What does Laura think should have been improved in the original design?
A) the durability of the furniture
B) the control of noise from the café
C) the management of the construction budget

29
What did Laura learn from consulting local residents?
A) People's everyday routines were more useful than their wish lists.
B) People usually had very similar priorities for public buildings.
C) Residents needed to see completed plans before giving useful feedback.

30
What principle is Laura applying to the new health-centre project?
A) Each room should be designed for one clearly defined purpose.
B) Public and private activities should always take place in separate areas.
C) Spaces should be easy to adapt when users' needs change.`,
    mcq: [
      [24, 'C', [
        ['A', 'She was particularly talented at drawing buildings.'],
        ['B', 'She was interested in making places look more attractive.'],
        ['C', 'She was curious about how people behaved in different spaces.'],
      ]],
      [25, 'A', [
        ['A', 'bringing enough natural light into the centre of the building'],
        ['B', 'creating more floor space for readers and students'],
        ['C', 'reducing the amount of artificial lighting used throughout the building'],
      ]],
      [26, 'B', [
        ['A', 'It made movement between floors more efficient.'],
        ['B', 'Local people associated it strongly with the building\'s past.'],
        ['C', 'Removing it would have made the project too expensive.'],
      ]],
      [27, 'A', [
        ['A', 'They made less use of the technology area than she had expected.'],
        ['B', 'They preferred working in large groups rather than alone.'],
        ['C', 'They avoided areas where they could still see other people.'],
      ]],
      [28, 'B', [
        ['A', 'the durability of the furniture'],
        ['B', 'the control of noise from the café'],
        ['C', 'the management of the construction budget'],
      ]],
      [29, 'A', [
        ['A', 'People\'s everyday routines were more useful than their wish lists.'],
        ['B', 'People usually had very similar priorities for public buildings.'],
        ['C', 'Residents needed to see completed plans before giving useful feedback.'],
      ]],
      [30, 'C', [
        ['A', 'Each room should be designed for one clearly defined purpose.'],
        ['B', 'Public and private activities should always take place in separate areas.'],
        ['C', 'Spaces should be easy to adapt when users\' needs change.'],
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

const examen = await findLevelExamenRowBySlot(db, level.id, 1);
if (!examen) throw new Error('No B2 exam slot 1');
console.log(`Examen 1: ${examen.nombre} (${examen.id})`);

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
  const storagePath = `b2/exam-1/part-${part.partNumber}/full-exam01.mp3`;
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

console.log('Listening del examen 1 sustituido.');
