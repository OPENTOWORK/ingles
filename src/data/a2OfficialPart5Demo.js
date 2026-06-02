import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';

const GAP = '................';

const BODY = [
  `I hope (0) ${GAP} are well. I'm having a great holiday here in Thailand. Our hotel is very nice and there are a lot of good restaurants near it.`,
  `Yesterday morning, we went to (25) ${GAP} lovely beach. We had to leave before lunch because it was very hot. We went to a party (26) ${GAP} the evening in the centre (27) ${GAP} the town. Everyone had a good time and we got back at midnight. Tomorrow, we want to (28) ${GAP} on a boat trip or (29) ${GAP} tennis.`,
  `I'll show you my photos (30) ${GAP} I get back.`,
  'See you soon,',
  'Maria',
];

export const A2_OFFICIAL_PART5_DEMO = {
  directions: `Part 5\n\n${A2_RW_DIRECTIONS[5]}`,
  email: {
    fromLabel: 'From:',
    toLabel: 'To:',
    from: 'Maria',
    to: 'John',
  },
  example: { number: 0, answer: 'you' },
  bodyParagraphs: BODY,
  bodyText: BODY.join('\n\n'),
  gapNumbers: [25, 26, 27, 28, 29, 30],
  answers: {
    25: ['a', 'this'],
    26: ['in', 'during'],
    27: ['of'],
    28: ['go'],
    29: ['play', 'watch'],
    30: ['when', 'after'],
  },
};

export function buildA2Part5OpenAnswerMap(answers = A2_OFFICIAL_PART5_DEMO.answers) {
  const map = new Map();
  for (const [num, list] of Object.entries(answers)) {
    map.set(
      Number(num),
      new Set((list || []).map((w) => String(w).trim().toLowerCase())),
    );
  }
  return map;
}

export function isA2Part5DemoEmpty({ enunciado = '', openCount = 0 }) {
  if (Number(openCount) >= 6) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  return !(hasEnunciado && Number(openCount) >= 6);
}
