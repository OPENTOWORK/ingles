import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';

const GAP = '................';

const P1 = `William Perkin was born in London in 1838. As a child he had many hobbies, including model making and photography. But it was the (19) ${GAP} of chemistry that really interested him. At the age of 15, he went to college to study it.`;

const P2 = `While he was there, he was (20) ${GAP} to make a medicine from coal. This didn't go well, but when he was working on the problem, he found a cheap (21) ${GAP} to make the colour purple. At that (22) ${GAP} it was very expensive to make clothes in different colours. William knew he could make a business out of his new colour. Helped by his father and brother, William (23) ${GAP} his own factory to make the colour. It sold well, and soon purple clothes (24) ${GAP} very popular in England and the rest of the world.`;

export const A2_OFFICIAL_PART4_DEMO = {
  directions: `Part 4\n\n${A2_RW_DIRECTIONS[4]}`,
  passageTitle: 'William Perkin',
  passageParagraphs: [P1, P2],
  passageText: ['William Perkin', P1, P2].join('\n\n'),
  items: [
    {
      questionNumber: 19,
      options: [
        { letter: 'A', text: 'class' },
        { letter: 'B', text: 'subject' },
        { letter: 'C', text: 'course' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 20,
      options: [
        { letter: 'A', text: 'thinking' },
        { letter: 'B', text: 'trying' },
        { letter: 'C', text: 'deciding' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 21,
      options: [
        { letter: 'A', text: 'way' },
        { letter: 'B', text: 'path' },
        { letter: 'C', text: 'plan' },
      ],
      correctLetter: 'A',
    },
    {
      questionNumber: 22,
      options: [
        { letter: 'A', text: 'day' },
        { letter: 'B', text: 'time' },
        { letter: 'C', text: 'hour' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 23,
      options: [
        { letter: 'A', text: 'brought' },
        { letter: 'B', text: 'turned' },
        { letter: 'C', text: 'opened' },
      ],
      correctLetter: 'C',
    },
    {
      questionNumber: 24,
      options: [
        { letter: 'A', text: 'began' },
        { letter: 'B', text: 'arrived' },
        { letter: 'C', text: 'became' },
      ],
      correctLetter: 'C',
    },
  ],
};

export function buildA2Part4GroupsFromDemoItems(items = []) {
  return items.map((item) => ({
    questionNumber: item.questionNumber,
    prompt: '',
    questionStem: '',
    options: item.options.map((opt) => ({
      id: `a2-p4-demo-${item.questionNumber}-${opt.letter}`,
      respuesta: `${opt.letter}) ${opt.text}`,
      formattedText: `${opt.letter}) ${opt.text}`,
      correcta: opt.letter === item.correctLetter,
    })),
  }));
}

export function isA2Part4DemoEmpty({ enunciado = '', respuestasCount = 0, part4GroupCount = 0 }) {
  if (Number(part4GroupCount) >= 6) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  const hasAnswers = Number(respuestasCount) >= 6;
  return !(hasEnunciado && hasAnswers);
}
