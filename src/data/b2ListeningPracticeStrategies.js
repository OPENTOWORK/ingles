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
      'You will hear eight short extracts (~33–38 seconds each) in one recording (~4½–5 minutes). Each extract is a different scenario with different speakers and accents. Read the question and all three options before each extract. Choose the answer that matches the whole idea — inference, not a single word from the audio.',
    commonTraps: [
      'Keyword trap: a word from the audio appears in a wrong option.',
      'The speaker mentions all three topics but only one is the main point.',
      'Choosing the first thing you hear before the speaker changes their mind.',
      'Answering without listening — the question should not give away the answer.',
      'Two options seem valid because the distractor was mentioned in the audio.',
    ],
    listenFor: [
      'Purpose and recommendation (what should the listener do?).',
      'Attitude (surprised, annoyed, relieved).',
      'Speaker intent — what they mean, not just what they say.',
      'Context clues from register (formal announcement vs casual chat).',
    ],
    studyTip:
      'Use the situation line to predict context. After the first listen, eliminate one distractor that clearly echoes the audio but misses the point.',
  },
  11: {
    strategy:
      'You will hear one long monologue (~2:30–3:30). Read all ten sentences first, then listen for the exact 1–3 words that fill each gap. The sentences paraphrase the audio — the answer is not always the same wording you read on screen.',
    commonTraps: [
      'Paraphrasing the answer instead of writing the exact words from the audio.',
      'Writing more than three words or copying the whole sentence.',
      'Choosing a word that fits grammar but was not said.',
      'Missing compound answers such as "first aid" or "traffic lights".',
      'Jumping ahead — answers follow the order of the recording (Q9→Q18).',
    ],
    listenFor: [
      'Signpost phrases before the key detail ("the main reason", "what surprised me").',
      'Exact nouns, adjectives and short phrases after paraphrased question stems.',
      'Linear progression — if you miss one gap, note the topic and keep listening.',
    ],
    studyTip:
      'Write only the missing words. Check spelling on the second listen — British spelling if names or places appear.',
  },
  12: {
    strategy:
      'Five speakers (~30–35 s each) share one theme. Read all eight options (A–H) first. Match each speaker’s overall message — not one phrase. Each letter is used once; three options are unused distractors.',
    commonTraps: [
      'Literal match: an option repeats a word from the audio but is not the speaker’s main point.',
      'Two speakers mention the same topic but with different attitudes — only one option fits each.',
      'Reusing a letter because two options seem possible for one speaker.',
      'Distractor that was briefly mentioned but is not what the speaker emphasises.',
      'Choosing before the speaker finishes — attitude may shift at the end.',
    ],
    listenFor: [
      'The speaker’s main lesson, feeling or conclusion (not their job title or setting).',
      'Contrast signals: "but", "however", "what surprised me", "the real reason".',
      'First vs final attitude — did their view change by the end of the monologue?',
      'Subtle overlap: unused options may echo a detail from another speaker.',
    ],
    studyTip:
      'After the first listen, cross out two or three letters you are sure about, then compare the remaining options for the last speaker.',
  },
  13: {
    strategy:
      'One long interview or discussion (~3–4 min). Read question 24 before listening, then follow the order of the audio. Answers test attitude, opinion and inference — the correct option rarely repeats exact words from the recording.',
    commonTraps: [
      'Keyword trap: a word from the audio appears in a wrong option.',
      'An option is true in the interview but does not answer the question asked.',
      'Two options seem valid because speakers disagree — check who said what.',
      'Extreme wording ("always", "never", "only") when the speaker was hedging.',
      'Answering from the situation line without listening to the whole exchange.',
    ],
    listenFor: [
      'Agreement vs disagreement between speakers ("but", "I\'m not sure", "actually").',
      'Attitude and purpose — why someone says something, not just what happened.',
      'Hedging and reformulation ("what I mean is", "sort of", "to be honest").',
      'Signpost moments before each answer (new topic, summary, recommendation).',
    ],
    studyTip:
      'On the second listen, confirm one eliminated option per question and note which speaker supports the correct answer.',
  },
};
