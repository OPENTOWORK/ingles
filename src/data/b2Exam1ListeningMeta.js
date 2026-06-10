/** UX copy + situation context for B2 Examen 1 Listening (Dralo parts 10–12). UI-only — not in audio. */

export const B2_EXAM1_LISTENING_EXAM_SLOT = 1;

export const B2_EXAM1_PART10_SITUATIONS = {
  1: 'You hear a visitor asking about a painting in a local art gallery.',
  2: 'You hear an announcement at an airport departure gate.',
  3: 'You hear a student calling a university registry office about an official transcript.',
  4: 'You hear a customer speaking to a theatre box-office assistant on the phone.',
  5: "You hear a customer at a dry cleaner's counter about a stained jacket.",
  6: 'You hear a chef introducing a live cookery demonstration to an audience.',
  7: 'You hear a staff member making an announcement to visitors at a botanical garden.',
  8: 'You hear a tenant receiving a phone call from a letting agency about their flat.',
};

export const B2_EXAM1_PART12_MATCHING_POOL = [
  { letter: 'A', text: 'feeling disappointed because the job offered fewer learning opportunities than expected' },
  { letter: 'B', text: 'being given more responsibility than they had anticipated' },
  { letter: 'C', text: 'learning to stay patient when dealing with rude or unreasonable people' },
  { letter: 'D', text: 'discovering that getting on with colleagues mattered more than working quickly' },
  { letter: 'E', text: 'finding that repetitive tasks became oddly satisfying after a while' },
  { letter: 'F', text: 'wishing they had asked for advice before accepting the position' },
  { letter: 'G', text: 'recognising that the experience changed their ideas about future study or careers' },
  { letter: 'H', text: 'feeling physically exhausted by work they had not taken seriously before' },
];

const PART_UX = {
  10: {
    instructions:
      'You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C). You will hear each extract twice.',
    practiceNote: 'Practice mode: you can replay each audio before checking your answer.',
  },
  11: {
    instructions:
      'You will hear a woman called Elena talking about training with a mountain rescue team. For questions 9–18, complete the sentences with a word or short phrase. You will hear the recording twice.',
    practiceNote: 'Practice mode: you can replay the audio before checking your answers.',
  },
  12: {
    instructions:
      'You will hear five people talking about their first experiences of paid work. For questions 19–23, choose from the list (A–H) the opinion each speaker expresses. Use the letters only once. There are three extra letters which you do not need to use. You will hear the recording twice.',
    practiceNote: 'Practice mode: you can replay each speaker audio before checking your answers.',
  },
};

/**
 * @param {number} partNumber
 * @param {number} examSlot
 * @returns {{ instructions: string, practiceNote: string } | null}
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
