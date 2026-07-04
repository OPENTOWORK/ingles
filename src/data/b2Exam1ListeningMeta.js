/** UX copy + situation context for B2 Examen 1 Listening (Dralo parts 10–12). UI-only — not in audio. */

export const B2_EXAM1_LISTENING_EXAM_SLOT = 1;

export const B2_EXAM1_PART10_SITUATIONS = {
  1: 'You hear two friends discussing a mobile app.',
  2: 'You hear a conversation about smart home technology.',
  3: 'You hear two neighbours talking about where they live.',
  4: 'You hear two people discussing electric bikes.',
  5: 'You hear two visitors in a shared office space.',
  6: 'You hear two friends talking about technology.',
  7: 'You hear people at a community meeting.',
  8: 'You hear a couple planning a meal out.',
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
    whatYouWillHear:
      'Eight short extracts — friends chatting, a sales pitch, a community meeting, and other everyday urban situations (~4½ minutes in one recording).',
    whatYouNeedToDo:
      'For questions 1–8, choose the best answer (A, B or C). You will hear each extract twice.',
    practiceNote: 'Practice mode: you can replay the audio before checking your answers.',
  },
  11: {
    whatYouWillHear:
      'A woman called Elena talking about how new mountain rescue volunteers are trained.',
    whatYouNeedToDo:
      'For questions 9–18, complete the sentences with a word or short phrase. You will hear the recording twice.',
    practiceNote: 'Practice mode: you can replay the audio before checking your answers.',
  },
  12: {
    whatYouWillHear:
      'Five people talking about their first experiences of paid work (~3–3½ minutes in one recording).',
    whatYouNeedToDo:
      'For questions 19–23, choose from the list (A–H) the opinion each speaker expresses. Use the letters only once. There are three extra letters which you do not need to use. You will hear the recording twice.',
    practiceNote: 'Practice mode: you can replay the audio before checking your answers.',
  },
  13: {
    whatYouWillHear:
      'An interview about a community project to restore a town hall and how local people use it today.',
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
