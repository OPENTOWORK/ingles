/**

 * A2 Key (Entry 2) — 14 partes globales (formato muestra oficial 2020/2022).

 * Reading & Writing 1–7, Listening 8–12, Speaking 13–14.

 * Numeración de preguntas alineada con el examen oficial (QP 2022).

 */



export const A2_EXAM_SLOT_MAX = 5;



export const A2_EXAM_PARTS = [

  {

    partNumber: 1,

    section: 'Reading and Writing',

    title: 'Part 1: Notices and messages',

    mode: 'reading',

    activity: 'notice-mcq',

    questionCount: 6,

    questionStart: 1,

    needsAudio: false,

    needsImages: false,

  },

  {

    partNumber: 2,

    section: 'Reading and Writing',

    title: 'Part 2: Multiple choice (people)',

    mode: 'reading',

    activity: 'people-mcq',

    questionCount: 7,

    questionStart: 7,

    needsAudio: false,

  },

  {

    partNumber: 3,

    section: 'Reading and Writing',

    title: 'Part 3: Multiple choice (long text)',

    mode: 'reading',

    activity: 'multiple-choice',

    questionCount: 5,

    questionStart: 14,

    needsAudio: false,

  },

  {

    partNumber: 4,

    section: 'Reading and Writing',

    title: 'Part 4: Multiple choice cloze',

    mode: 'use-of-english',

    activity: 'multiple-choice-cloze',

    questionCount: 6,

    questionStart: 19,

    needsAudio: false,

  },

  {

    partNumber: 5,

    section: 'Reading and Writing',

    title: 'Part 5: Open cloze (email)',

    mode: 'use-of-english',

    activity: 'open-cloze',

    questionCount: 6,

    questionStart: 25,

    needsAudio: false,

  },

  {

    partNumber: 6,

    section: 'Reading and Writing',

    title: 'Part 6: Short message',

    mode: 'writing',

    activity: 'short-message',

    questionCount: 1,

    questionStart: 31,

    needsAudio: false,

  },

  {

    partNumber: 7,

    section: 'Reading and Writing',

    title: 'Part 7: Short story',

    mode: 'writing',

    activity: 'short-story',

    questionCount: 1,

    questionStart: 32,

    needsAudio: false,

  },

  {

    partNumber: 8,

    section: 'Listening',

    title: 'Part 1: Multiple choice (pictures)',

    mode: 'listening',

    activity: 'short-extracts',

    questionCount: 5,

    questionStart: 1,

    needsAudio: true,

    audioClips: 5,

  },

  {

    partNumber: 9,

    section: 'Listening',

    title: 'Part 2: Gap-fill (monologue)',

    mode: 'listening',

    activity: 'sentence-completion',

    questionCount: 5,

    questionStart: 6,

    needsAudio: true,

    audioClips: 1,

  },

  {

    partNumber: 10,

    section: 'Listening',

    title: 'Part 3: Multiple choice (conversation)',

    mode: 'listening',

    activity: 'conversation',

    questionCount: 5,

    questionStart: 11,

    needsAudio: true,

    audioClips: 1,

  },

  {

    partNumber: 11,

    section: 'Listening',

    title: 'Part 4: Multiple choice (short extracts)',

    mode: 'listening',

    activity: 'short-extracts',

    questionCount: 5,

    questionStart: 16,

    needsAudio: true,

    audioClips: 5,

  },

  {

    partNumber: 12,

    section: 'Listening',

    title: 'Part 5: Matching (conversation)',

    mode: 'listening',

    activity: 'multiple-matching',

    questionCount: 5,

    questionStart: 21,

    needsAudio: true,

    audioClips: 1,

  },

  {

    partNumber: 13,

    section: 'Speaking',

    title: 'Part 1: Personal interview',

    mode: 'speaking',

    activity: 'interview',

    questionCount: 6,

    questionStart: 1,

    needsAudio: false,

  },

  {

    partNumber: 14,

    section: 'Speaking',

    title: 'Part 2: Collaborative task',

    mode: 'speaking',

    activity: 'situation',

    questionCount: 1,

    questionStart: 1,

    needsAudio: false,

  },

];



export function parteNameA2(partNumber) {

  return `Parte ${partNumber} A2`;

}



export function examenNameA2(slot) {

  return `Examen ${slot} A2`;

}



export function getA2PartsByRange(partMin, partMax) {

  return A2_EXAM_PARTS.filter((p) => p.partNumber >= partMin && p.partNumber <= partMax);

}


