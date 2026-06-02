/**
 * A2 Key Reading & Writing Part 6 — tarea oficial de muestra (Question 31).
 */
export const A2_OFFICIAL_PART6_DEMO = {
  partTitle: 'Part 6',
  questionLabel: 'Question 31',
  scenario:
    'You want to go swimming on Saturday with your English friend, Toni.\nWrite an email to Toni.',
  bulletsIntro: 'In your email:',
  bullets: [
    'ask Toni to go swimming with you on Saturday',
    'say where you want to go swimming',
    'say how you will travel there.',
  ],
  wordCountNote: 'Write 25 words or more.',
  answerSheetNote: 'Write the email on your answer sheet.',
  wordMin: 25,
  wordMax: 80,
};

/**
 * A2 Key Reading & Writing Part 7 — tarea oficial de muestra (Question 32).
 */
export const A2_OFFICIAL_PART7_DEMO = {
  partTitle: 'Part 7',
  questionLabel: 'Question 32',
  scenario:
    'Look at the three pictures.\nWrite the story shown in the pictures.',
  bulletsIntro: '',
  bullets: [],
  pictures: ['Picture 1', 'Picture 2', 'Picture 3'],
  wordCountNote: 'Write 35 words or more.',
  answerSheetNote: 'Write the story on your answer sheet.',
  wordMin: 35,
  wordMax: 100,
};

export function buildA2WritingInstructionsText(demo) {
  if (!demo) return '';
  const bulletLines = (demo.bullets || []).map((b) => `• ${b}`);
  const picturesLine =
    (demo.pictures || []).length > 0
      ? 'There are three pictures that tell a story; write the story they show.'
      : '';
  const lines = [
    demo.questionLabel,
    demo.scenario,
    demo.bulletsIntro,
    ...bulletLines,
    picturesLine,
    demo.wordCountNote,
  ].filter(Boolean);
  return lines.join('\n');
}

export function getA2WritingDemoByPart(partNumber) {
  if (Number(partNumber) === 6) return A2_OFFICIAL_PART6_DEMO;
  if (Number(partNumber) === 7) return A2_OFFICIAL_PART7_DEMO;
  return null;
}
