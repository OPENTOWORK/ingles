import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';

const P1 =
  'The women in the Watson family are all crazy about ballet. These days, Alice Watson gives ballet lessons, but for many years, she was a dancer with the National Ballet Company. Her mother, Hannah, also had a full-time job there, making costumes for the dancers.';

const P2 =
  "Alice's daughter Demi started learning ballet as soon as she could walk. 'I never taught her,' says Alice, 'because she never let me.' Now aged sixteen, Demi is a member of the ballet company where her mother was the star dancer for many years.";

const P3 =
  "Alice's husband, Jack, is an electrician. They met while he was working at a theatre where she was dancing and got married soon after. 'When Demi started dancing, the house was too small for her and Alice to practise in so I made the garage into a dance studio. Now the living room is nice and quiet when I'm watching television!' he says.";

const P4 =
  "Last month, Demi was invited to dance in the ballet Swan Lake. Of course, Alice and Hannah were in the audience and even Jack was there, which made it very special for Demi. Jack says, 'I'm not that interested in ballet myself but it's fantastic seeing Demi taking her first steps with Alice's old company!' Demi was wearing a dress that Hannah made for Alice many years before.";

const P5 =
  "'It was very exciting for all of us,' says Hannah. 'Demi's way of dancing is very like Alice's. I know I'm her grandmother, but I think she has a great future!'";

export const A2_OFFICIAL_PART3_DEMO = {
  directions: `Part 3\n\n${A2_RW_DIRECTIONS[3]}`,
  passageTitle: 'A family of dancers',
  passageParagraphs: [P1, P2, P3, P4, P5],
  passageText: ['A family of dancers', P1, P2, P3, P4, P5].join('\n\n'),
  items: [
    {
      questionNumber: 14,
      prompt: "What is Alice Watson's job now?",
      options: [
        { letter: 'A', text: 'dancer' },
        { letter: 'B', text: 'teacher' },
        { letter: 'C', text: 'dress-maker' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 15,
      prompt: 'Demi had her first ballet lessons',
      options: [
        { letter: 'A', text: 'at a very young age.' },
        { letter: 'B', text: 'at the National Ballet Company.' },
        { letter: 'C', text: 'from her mother.' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 16,
      prompt: 'Jack helped his wife and daughter by',
      options: [
        { letter: 'A', text: 'moving to a larger house.' },
        { letter: 'B', text: 'letting them use the living room for dancing.' },
        { letter: 'C', text: 'making a place for them to practise in.' },
      ],
      correctLetter: 'A',
    },
    {
      questionNumber: 17,
      prompt: 'What was the best thing about the Swan Lake show for Demi?',
      options: [
        { letter: 'A', text: 'It was her first show with the company.' },
        { letter: 'B', text: 'All her family were there.' },
        { letter: 'C', text: 'She was wearing a new dress.' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 18,
      prompt: 'Hannah says that Demi',
      options: [
        { letter: 'A', text: 'will be a star one day.' },
        { letter: 'B', text: 'is her favourite granddaughter.' },
        { letter: 'C', text: 'dances better than Alice did.' },
      ],
      correctLetter: 'C',
    },
  ],
};

export function buildA2Part3GroupsFromDemoItems(items = []) {
  return items.map((item) => ({
    questionNumber: item.questionNumber,
    prompt: item.prompt,
    questionStem: item.prompt,
    options: item.options.map((opt) => ({
      id: `a2-p3-demo-${item.questionNumber}-${opt.letter}`,
      respuesta: `${opt.letter}) ${opt.text}`,
      formattedText: `${opt.letter}) ${opt.text}`,
      correcta: opt.letter === item.correctLetter,
    })),
  }));
}

export function isA2Part3DemoEmpty({ enunciado = '', respuestasCount = 0, part3GroupCount = 0 }) {
  if (Number(part3GroupCount) >= 5) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  const hasAnswers = Number(respuestasCount) >= 5;
  return !(hasEnunciado && hasAnswers);
}
