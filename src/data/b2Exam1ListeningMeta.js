/** UX copy + situation context for B2 Examen 1 Listening (Dralo parts 10–12). UI-only — not in audio. */

export const B2_EXAM1_LISTENING_EXAM_SLOT = 1;

export const B2_EXAM1_PART10_SITUATIONS = {
  1: 'You hear two friends talking after visiting a recently renovated community centre.',
  2: 'You hear two friends discussing their plans for the evening.',
  3: 'You hear a nutritionist giving advice about food labels.',
  4: 'You hear two colleagues talking about a new role at work.',
  5: 'You hear two friends discussing a television drama they have just finished watching.',
  6: 'You hear a man talking about a weekend trip he took without using a car.',
  7: 'You hear a voicemail message about a music rehearsal.',
  8: 'You hear part of an interview with a scientist who studies migrating butterflies.',
};

export const B2_EXAM1_PART12_MATCHING_POOL = [
  { letter: 'A', text: 'being able to take fresh produce home' },
  { letter: 'B', text: 'getting to know people in the local area' },
  { letter: 'C', text: 'having a way to switch off mentally after work' },
  { letter: 'D', text: 'improving a neglected part of the neighbourhood' },
  { letter: 'E', text: 'helping children understand how food and nature work' },
  { letter: 'F', text: 'becoming more confident and skilful at gardening' },
  { letter: 'G', text: 'getting more physical exercise' },
  { letter: 'H', text: 'receiving advice from a highly experienced gardener' },
];

const PART_UX = {
  10: {
    whatYouWillHear:
      'Eight short extracts — a renovated community centre, plans for an outdoor film, food labels, a new job, a television drama, a car-free trip, a rehearsal message, and butterfly research (~9½ minutes, heard twice).',
    whatYouNeedToDo:
      'For questions 1–8, choose the best answer (A, B or C). You will hear each extract twice.',
    practiceNote: 'Practice mode: you can replay the audio before checking your answers.',
  },
  11: {
    whatYouWillHear:
      'A talk by Hannah Cole, who runs a small sourdough bakery (~8 minutes, heard twice).',
    whatYouNeedToDo:
      'For questions 9–18, complete the sentences with a word or short phrase from the recording. You will hear the recording twice.',
    practiceNote: 'Practice mode: you can replay the audio before checking your answers.',
  },
  12: {
    whatYouWillHear:
      'Five people talking about taking part in a community garden (~7 minutes, heard twice).',
    whatYouNeedToDo:
      'For questions 19–23, choose from the list (A–H) what each speaker values most. Use the letters only once. There are three extra letters which you do not need to use. You will hear the recording twice.',
    practiceNote: 'Practice mode: you can replay the audio before checking your answers.',
  },
  13: {
    whatYouWillHear:
      'An interview with architect Laura Bennett about turning an old department store into a public library (~8½ minutes, heard twice).',
    whatYouNeedToDo:
      'For questions 24–30, choose the best answer (A, B or C). You will hear the recording twice.',
    practiceNote: 'Practice mode: you can replay the audio before checking your answers.',
  },
};

/**
 * @param {number} partNumber
 * @param {number} examSlot
 * @returns {{ whatYouWillHear: string, whatYouNeedToDo: string, practiceNote: string } | null}
 */
export function getB2Exam1ListeningPartUx(partNumber, examSlot = 1) {
  if (Number(examSlot) !== B2_EXAM1_LISTENING_EXAM_SLOT) return null;
  const ux = PART_UX[Number(partNumber)];
  if (!ux) return null;
  return ux;
}

/**
 * @param {number} questionNumber
 * @param {number} examSlot
 * @returns {string | null}
 */
export function getB2Exam1Part10Situation(questionNumber, examSlot = 1) {
  if (Number(examSlot) !== B2_EXAM1_LISTENING_EXAM_SLOT) return null;
  return B2_EXAM1_PART10_SITUATIONS[Number(questionNumber)] || null;
}
