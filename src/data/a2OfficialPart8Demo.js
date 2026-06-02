import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

export const A2_OFFICIAL_PART8_DEMO = {
  directions: `Part 1\n\n${A2_LISTENING_DIRECTIONS[1]}`,
  items: [
    {
      questionNumber: 1,
      prompt: 'Where will Claire meet Alex?',
      options: [
        { letter: 'A', caption: 'Picture A' },
        { letter: 'B', caption: 'Picture B' },
        { letter: 'C', caption: 'Picture C' },
      ],
      correctLetter: 'A',
    },
    {
      questionNumber: 2,
      prompt: 'What time should the man telephone again?',
      options: [
        { letter: 'A', caption: 'Picture A' },
        { letter: 'B', caption: 'Picture B' },
        { letter: 'C', caption: 'Picture C' },
      ],
      correctLetter: 'C',
    },
    {
      questionNumber: 3,
      prompt: 'When are they going to have the party?',
      options: [
        { letter: 'A', caption: 'Picture A' },
        { letter: 'B', caption: 'Picture B' },
        { letter: 'C', caption: 'Picture C' },
      ],
      correctLetter: 'C',
    },
    {
      questionNumber: 4,
      prompt: 'What was the weather like on the picnic?',
      options: [
        { letter: 'A', caption: 'Picture A' },
        { letter: 'B', caption: 'Picture B' },
        { letter: 'C', caption: 'Picture C' },
      ],
      correctLetter: 'A',
    },
    {
      questionNumber: 5,
      prompt: 'How much are the shorts?',
      options: [
        { letter: 'A', caption: 'Picture A' },
        { letter: 'B', caption: 'Picture B' },
        { letter: 'C', caption: 'Picture C' },
      ],
      correctLetter: 'A',
    },
  ],
};

export function buildA2Part8GroupsFromDemoItems(items = []) {
  return items.map((item) => ({
    questionNumber: item.questionNumber,
    prompt: item.prompt,
    questionStem: item.prompt,
    options: item.options.map((opt) => ({
      id: `a2-p8-demo-${item.questionNumber}-${opt.letter}`,
      letter: opt.letter,
      imageUrl: opt.imageUrl || '',
      caption: opt.caption || `Picture ${opt.letter}`,
      respuesta: opt.letter,
      formattedText: opt.letter,
      correcta: opt.letter === item.correctLetter,
    })),
  }));
}

export function isA2Part8DemoEmpty({ enunciado = '', respuestasCount = 0, part8GroupCount = 0 }) {
  if (Number(part8GroupCount) >= 5) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  const hasAnswers = Number(respuestasCount) >= 5;
  return !(hasEnunciado && hasAnswers);
}
