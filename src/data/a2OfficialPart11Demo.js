import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

export const A2_OFFICIAL_PART11_DEMO = {
  directions: `Part 4\n\n${A2_LISTENING_DIRECTIONS[4]}`,
  items: [
    {
      questionNumber: 16,
      context: "You will hear a woman talking to her friend about why she's bought a motorbike.",
      prompt: 'Why did she buy it?',
      options: [
        { letter: 'A', text: "It's fast." },
        { letter: 'B', text: 'It was cheap.' },
        { letter: 'C', text: "It'll be easy to repair." },
      ],
      correctLetter: 'A',
    },
    {
      questionNumber: 17,
      context: 'You will hear two friends talking about going to University.',
      prompt: 'What subject is the man going to study?',
      options: [
        { letter: 'A', text: 'history' },
        { letter: 'B', text: 'geography' },
        { letter: 'C', text: 'chemistry' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 18,
      context: 'You will hear two friends talking about a photograph.',
      prompt: "What's the photograph of?",
      options: [
        { letter: 'A', text: 'a sports stadium' },
        { letter: 'B', text: 'a zoo' },
        { letter: 'C', text: 'a school playground' },
      ],
      correctLetter: 'C',
    },
    {
      questionNumber: 19,
      context: 'You will hear a woman talking to a friend on the phone.',
      prompt: "Why's she upset?",
      options: [
        { letter: 'A', text: 'Her train was delayed.' },
        { letter: 'B', text: "She's lost her wallet." },
        { letter: 'C', text: "She's broken her glasses." },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 20,
      context: "You will hear a woman talking to her friend, David, about something she's bought.",
      prompt: 'What has she bought?',
      options: [
        { letter: 'A', text: 'some clothes' },
        { letter: 'B', text: 'some food' },
        { letter: 'C', text: 'some games' },
      ],
      correctLetter: 'A',
    },
  ],
};

export function buildA2Part11GroupsFromDemoItems(items = []) {
  return items.map((item) => ({
    questionNumber: item.questionNumber,
    context: item.context,
    prompt: item.prompt,
    questionStem: item.prompt,
    options: item.options.map((opt) => ({
      id: `a2-p11-demo-${item.questionNumber}-${opt.letter}`,
      respuesta: `${opt.letter}) ${opt.text}`,
      formattedText: `${opt.letter}) ${opt.text}`,
      correcta: opt.letter === item.correctLetter,
    })),
  }));
}

export function isA2Part11DemoEmpty({ enunciado = '', respuestasCount = 0, part11GroupCount = 0 }) {
  if (Number(part11GroupCount) >= 5) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  const hasAnswers = Number(respuestasCount) >= 5;
  return !(hasEnunciado && hasAnswers);
}
