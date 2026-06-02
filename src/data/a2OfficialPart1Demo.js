import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';

/**
 * A2 Key Reading Part 1 — texto oficial de muestra (sin imágenes).
 * Mismo contenido que el QP Cambridge; las imágenes se añadirán después.
 */
export const A2_OFFICIAL_PART1_DEMO = {
  directions: `Part 1\n\n${A2_RW_DIRECTIONS[1]}`,
  example: {
    body: `For Sale\nWomen's bicycle (small)\n11 years old - needs new tyres\nPhone Debbie - 0794587454`,
    options: [
      'A) The bicycle is for children.',
      'B) Some parts of the bicycle must be changed.',
      'C) Debbie is selling the bike because she\'s too big for it now.',
    ],
    answer: 'B',
  },
  items: [
    {
      questionNumber: 1,
      stimulusType: 'classified_ad',
      message:
        "For Sale\nWomen's bicycle (small)\n11 years old - needs new tyres\nPhone Debbie - 0794587454",
      prompt: '',
      options: [
        { letter: 'A', text: "The bicycle that's for sale was built for a child." },
        { letter: 'B', text: 'Some parts of the bicycle must be changed.' },
        { letter: 'C', text: "Debbie is selling the bike because she's too big for it now." },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 2,
      stimulusType: 'text_message',
      message:
        "Hi Ben,\nI've booked concert tickets for both of us online. Can you give me the money this afternoon when I see you?\nTim",
      prompt: '',
      options: [
        { letter: 'A', text: 'Tim thinks Ben should look on the concert website.' },
        { letter: 'B', text: 'Tim hopes that Ben will be able to come with him.' },
        { letter: 'C', text: 'Tim wants to know if Ben can pay him back today.' },
      ],
      correctLetter: 'C',
    },
    {
      questionNumber: 3,
      stimulusType: 'public_sign',
      message:
        'ADVENTURE PARK\nHalf-price tickets for groups of 12 or more\nAsk at entrance',
      prompt: '',
      options: [
        { letter: 'A', text: 'You get into the park by going this way.' },
        { letter: 'B', text: 'It is more expensive to go here alone.' },
        { letter: 'C', text: 'You will have fun if you come with friends.' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 4,
      stimulusType: 'text_message',
      message:
        "Lynne\nKim's party starts at 8 p.m. but of course you don't finish work until 9. Shall we go together at 9.30? I'll pick you up.\nEmma",
      prompt: '',
      options: [
        { letter: 'A', text: "Emma knows that Lynne can't be at the party when it starts." },
        { letter: 'B', text: 'Emma wants to go to the party a bit later than Lynne.' },
        { letter: 'C', text: 'Emma wants to go out with Lynne but not to the party.' },
      ],
      correctLetter: 'A',
    },
    {
      questionNumber: 5,
      stimulusType: 'shop_sign',
      message: "DAN'S ICE CREAMS\nBuy one, get one free!\n(Special offer 12 - 2 p.m. only)",
      prompt: '',
      options: [
        { letter: 'A', text: 'The ice cream shop is open for only 2 hours.' },
        { letter: 'B', text: 'Two ice creams will cost the same as one.' },
        { letter: 'C', text: 'You can get free ice creams all afternoon.' },
      ],
      correctLetter: 'B',
    },
    {
      questionNumber: 6,
      stimulusType: 'text_message',
      message:
        "Anna,\nSorry you missed today's class. Don't forget about the history project we're working on together - the teacher wants it by Friday. Call me!\nSophie",
      prompt: 'Why did Sophie write this message?',
      options: [
        { letter: 'A', text: 'to check if Anna has completed her homework' },
        { letter: 'B', text: 'to let Anna know what they did in class today' },
        { letter: 'C', text: 'to ask Anna to contact her about the homework' },
      ],
      correctLetter: 'C',
    },
  ],
};

/** Enunciado serializado (formato parseA2Part1Pack). */
export function formatA2OfficialPart1DemoEnunciado() {
  const { directions, example, items } = A2_OFFICIAL_PART1_DEMO;
  const lines = [directions, '', 'Example:', example.body, ...example.options, `Answer: ${example.answer}`, '', 'Questions'];

  for (const item of items) {
    lines.push('');
    lines.push(String(item.questionNumber));
    if (item.stimulusType) lines.push(`STIMULUS: ${item.stimulusType}`);
    for (const line of String(item.message || '').split('\n')) {
      if (line.trim()) lines.push(line.trim());
    }
    if (item.prompt) lines.push(item.prompt);
    for (const opt of item.options) {
      lines.push(`${opt.letter}) ${opt.text}`);
    }
  }

  return lines.join('\n');
}

/** Filas tipo levels_respuestas (una correcta por pregunta). */
export function getA2OfficialPart1DemoRespuestas() {
  const rows = [];
  for (const item of A2_OFFICIAL_PART1_DEMO.items) {
    const qn = item.questionNumber;
    for (const opt of item.options) {
      rows.push({
        respuesta: `${qn} ${opt.letter}) ${opt.text}`,
        correcta: opt.letter === item.correctLetter,
      });
    }
  }
  return rows;
}

export function isA2Part1DemoEmpty({ enunciado = '', respuestasCount = 0, groupsCount = 0 }) {
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  const hasAnswers = Number(respuestasCount) >= 6;
  const hasGroups = Number(groupsCount) >= 1;
  return !hasGroups && !(hasEnunciado && hasAnswers);
}
