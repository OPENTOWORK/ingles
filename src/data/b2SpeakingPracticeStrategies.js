/** Cambridge-style labels for Dralo B2 Speaking parts 14–17. */

export const B2_SPEAKING_CAMBRIDGE_PART = {
  14: { cambridge: 1, label: 'Speaking Part 1', task: 'personal interview' },
  15: { cambridge: 2, label: 'Speaking Part 2', task: 'long turn with photographs' },
  16: { cambridge: 3, label: 'Speaking Part 3', task: 'collaborative task' },
  17: { cambridge: 4, label: 'Speaking Part 4', task: 'discussion' },
};

/**
 * @param {number} draloPartNumber
 */
export function getB2SpeakingCambridgePartLabel(draloPartNumber) {
  return B2_SPEAKING_CAMBRIDGE_PART[Number(draloPartNumber)]?.label || `Speaking Part ${draloPartNumber}`;
}

/**
 * @param {number} draloPartNumber
 */
export function getB2SpeakingStrategyPack(draloPartNumber) {
  return SPEAKING_STRATEGIES[Number(draloPartNumber)] || DEFAULT_STRATEGY;
}

const DEFAULT_STRATEGY = {
  strategy:
    'Listen to the examiner, answer fully, and keep speaking until they move on. B2 candidates extend answers with reasons and examples.',
  commonMistakes: ['One-word or very short answers without development.'],
  focusOn: ['Clear pronunciation', 'Range of vocabulary', 'Linking ideas with because / so / however'],
  studyTip: 'Press Play to hear the examiner, then respond with Speak or type your answer.',
};

const SPEAKING_STRATEGIES = {
  14: {
    strategy:
      'Treat Part 1 as a short interview about you. Give complete answers: what, where, when, why — not just yes/no. Extend naturally with one reason or example.',
    commonMistakes: [
      'Very short answers without details or opinions.',
      'Memorised speeches that do not match the question.',
      'Stopping too soon because you are waiting for another prompt.',
    ],
    focusOn: [
      'Past, present and future tenses when talking about habits and plans.',
      'Opinion + reason (I think… because…).',
      'Natural fillers while you think: well, actually, to be honest.',
    ],
    studyTip:
      'If you are unsure, answer the question you understood and ask politely: "Do you mean…?" — examiners accept clarification at B2.',
  },
  15: {
    strategy:
      'Press Play, listen to the task, then compare both photos for about one minute. Do not describe them separately — link them: both show…, whereas…, the main difference is…',
    commonMistakes: [
      'Describing photo A, then photo B, with no comparison.',
      'Listing objects without saying how the scenes differ.',
      'Stopping after twenty seconds instead of developing the turn.',
    ],
    focusOn: [
      'Comparatives: more crowded, less formal, similar to, unlike.',
      'Speculation: might, could, looks as if, seems to.',
      'Personal reaction: I would prefer… because…',
    ],
    studyTip:
      'Use the full minute: compare people, setting, mood, then give your preference with a reason.',
  },
  16: {
    strategy:
      'Work with the examiner as your partner. Respond to their ideas, disagree politely, and move the task forward. Aim to reach a decision — not to "win" the argument.',
    commonMistakes: [
      'Talking only about your own ideas without reacting to the examiner.',
      'Not asking questions or checking understanding.',
      'Ignoring the decision question at the end of the task.',
    ],
    focusOn: [
      'Turn-taking: What do you think? / I see your point, but…',
      'Negotiation: We could… / How about… / I am not sure about that because…',
      'Summarising: So we agree that…',
    ],
    studyTip:
      'Use Next step if you need a new examiner prompt — in the real exam, keep the discussion moving until the task is complete.',
  },
  17: {
    strategy:
      'Discuss the topic from Part 3 in more depth. Give extended opinions, respond to the examiner\'s comments, and use examples from experience or general knowledge.',
    commonMistakes: [
      'Repeating the same opinion without developing it.',
      'Not engaging with what the examiner just said.',
      'Over-formal language that sounds unnatural in conversation.',
    ],
    focusOn: [
      'Abstract language: society, advantage, drawback, trend, impact.',
      'Hedging: tend to, in general, it depends on.',
      'Building on ideas: That reminds me of… / Following on from that…',
    ],
    studyTip:
      'Balance fluency and accuracy — minor mistakes are fine if your ideas are clear and you interact naturally.',
  },
};
