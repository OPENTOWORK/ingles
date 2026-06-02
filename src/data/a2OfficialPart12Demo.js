import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

export const A2_OFFICIAL_PART12_DEMO = {
  directions: `Part 5\n\n${A2_LISTENING_DIRECTIONS[5]}`,
  introLines: [
    'You will hear Simon talking to Maria about a party.',
    'What will each person bring to the party?',
  ],
  example: { number: 0, name: 'Maria', letter: 'B' },
  people: [
    { number: 21, name: 'Barbara' },
    { number: 22, name: 'Simon' },
    { number: 23, name: 'Anita' },
    { number: 24, name: 'Peter' },
    { number: 25, name: 'Michael' },
  ],
  optionPool: [
    { letter: 'A', text: 'bread' },
    { letter: 'B', text: 'cake' },
    { letter: 'C', text: 'cheese' },
    { letter: 'D', text: 'chicken' },
    { letter: 'E', text: 'fish' },
    { letter: 'F', text: 'fruit' },
    { letter: 'G', text: 'ice cream' },
    { letter: 'H', text: 'salad' },
  ],
  answers: {
    21: 'F',
    22: 'C',
    23: 'A',
    24: 'D',
    25: 'H',
  },
};

export function isA2Part12DemoEmpty({ enunciado = '', matchCount = 0 }) {
  if (Number(matchCount) >= 5) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  return !(hasEnunciado && Number(matchCount) >= 5);
}
