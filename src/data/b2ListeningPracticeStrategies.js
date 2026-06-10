/** Cambridge-style labels for Dralo B2 Listening parts 10–13 (Examen 1). */

export const B2_LISTENING_CAMBRIDGE_PART = {
  10: { cambridge: 1, label: 'Listening Part 1', task: 'short extracts' },
  11: { cambridge: 2, label: 'Listening Part 2', task: 'sentence completion' },
  12: { cambridge: 3, label: 'Listening Part 3', task: 'multiple matching' },
  13: { cambridge: 4, label: 'Listening Part 4', task: 'interview' },
};

/**
 * @param {number} draloPartNumber
 */
export function getB2ListeningCambridgePartLabel(draloPartNumber) {
  return B2_LISTENING_CAMBRIDGE_PART[Number(draloPartNumber)]?.label || `Listening Part ${draloPartNumber}`;
}

/**
 * @param {number} draloPartNumber
 */
export function getB2ListeningPracticeSubtitle(draloPartNumber) {
  const task = B2_LISTENING_CAMBRIDGE_PART[Number(draloPartNumber)]?.task || 'listening tasks';
  return `Practise ${task} with instant feedback, strategies and notes.`;
}

/**
 * @param {number} draloPartNumber
 */
export function getB2ListeningStrategyPack(draloPartNumber) {
  return LISTENING_STRATEGIES[Number(draloPartNumber)] || DEFAULT_STRATEGY;
}

const DEFAULT_STRATEGY = {
  strategy: 'Read the question before you listen. Focus on key words and attitude, not every word.',
  commonTraps: ['Choosing an option because you recognise one word from the audio.'],
  listenFor: ['Main idea', 'Speaker attitude', 'Specific details mentioned once'],
  studyTip: 'If you miss an answer, leave it and prepare for the next question.',
};

const LISTENING_STRATEGIES = {
  10: {
    strategy:
      'Before each extract plays, read the question and all three options. Listen for the option that matches the whole idea — not just one word you hear.',
    commonTraps: [
      'A word from the audio appears in a wrong option (keyword trap).',
      'The speaker mentions all three topics but only one is the main point.',
      'Choosing the first thing you hear before the speaker changes their mind.',
    ],
    listenFor: [
      'Purpose and recommendation (what should the listener do?).',
      'Attitude (surprised, annoyed, relieved).',
      'Specific details that answer the question directly.',
    ],
    studyTip: 'Use the situation line to predict context — gallery, airport, university, etc.',
  },
  11: {
    strategy:
      'Follow the sentence on screen while you listen. The missing word is usually a single content word (noun, adjective or short phrase) said clearly in the monologue.',
    commonTraps: [
      'Writing a word that fits grammar but was not said.',
      'Missing compound answers such as "first aid".',
      'Spelling a word differently — check British spelling if unsure.',
    ],
    listenFor: [
      'Signpost phrases: "before anyone is accepted", "the initial course", "most often".',
      'Exact nouns and adjectives after paraphrased lead-ins.',
    ],
    studyTip: 'Write only the missing words — do not repeat the whole sentence.',
  },
  12: {
    strategy:
      'Use the notes box while each speaker talks. Match the overall opinion — not one detail. Each letter can be used only once.',
    commonTraps: [
      'Two speakers mention work but express different opinions.',
      'Choosing a letter because one phrase sounds similar.',
      'Reusing a letter for two speakers.',
    ],
    listenFor: [
      'First vs final attitude (did their feeling change?).',
      'Contrast signals: "but", "however", "what surprised me".',
      'The speaker\'s main lesson, not the job title.',
    ],
    studyTip: 'Eliminate letters you are sure about, then compare the remaining options for the last speaker.',
  },
  13: {
    strategy:
      'Read the question stem before the interview moves on. Interviewers often paraphrase — the correct option may use different words from the audio.',
    commonTraps: [
      'An option mentions something true in the interview but does not answer the question.',
      'Extreme words: "every", "only", "all" when the speaker was more cautious.',
      'Confusing who did what (council vs volunteers vs heritage body).',
    ],
    listenFor: [
      'Cause and effect (why did delays happen?).',
      'Who uses the hall now vs what was expected.',
      'Advice at the end — what should towns do first?',
    ],
    studyTip: 'Eliminate one clearly wrong option per question to improve your odds under time pressure.',
  },
};
