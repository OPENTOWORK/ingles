import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

export const A2_OFFICIAL_PART10_DEMO = {
  directions: `Part 3\n\n${A2_LISTENING_DIRECTIONS[3]}`,
  intro: 'You will hear Robert talking to his friend, Laura, about a trip to Dublin.',
  items: [
    {
      questionNumber: 11,
      prompt: 'Who has already decided to go with Robert?',
      options: [
        { letter: 'A', text: 'family members' },
        { letter: 'B', text: 'colleagues' },
        { letter: 'C', text: 'tennis partners' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 12,
      prompt: "They'll stay in",
      options: [
        { letter: 'A', text: 'a university.' },
        { letter: 'B', text: 'a guest house.' },
        { letter: 'C', text: 'a hotel.' },
      ],
      correctLetter: 'A',
    },
    {
      questionNumber: 13,
      prompt: 'Laura must remember to take',
      options: [
        { letter: 'A', text: 'a map.' },
        { letter: 'B', text: 'a camera.' },
        { letter: 'C', text: 'a coat.' },
      ],
      correctLetter: 'C',
    },
    {
      questionNumber: 14,
      prompt: 'Why does Laura like Dublin?',
      options: [
        { letter: 'A', text: 'The people are friendly.' },
        { letter: 'B', text: 'The buildings are interesting.' },
        { letter: 'C', text: 'The shops are beautiful.' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 15,
      prompt: "Robert's excited about the trip to Dublin because",
      options: [
        { letter: 'A', text: "he can't wait to go to the music festival." },
        { letter: 'B', text: 'he loves the food there.' },
        { letter: 'C', text: 'he wants to go to a new art exhibition.' },
      ],
      correctLetter: 'B',
    },
  ],
};

export function buildA2Part10GroupsFromDemoItems(items = []) {
  return items.map((item) => ({
    questionNumber: item.questionNumber,
    prompt: item.prompt,
    questionStem: item.prompt,
    options: item.options.map((opt) => ({
      id: `a2-p10-demo-${item.questionNumber}-${opt.letter}`,
      respuesta: `${opt.letter}) ${opt.text}`,
      formattedText: `${opt.letter}) ${opt.text}`,
      correcta: opt.letter === item.correctLetter,
    })),
  }));
}

export function isA2Part10DemoEmpty({ enunciado = '', respuestasCount = 0, part10GroupCount = 0 }) {
  if (Number(part10GroupCount) >= 5) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  const hasAnswers = Number(respuestasCount) >= 5;
  return !(hasEnunciado && hasAnswers);
}
