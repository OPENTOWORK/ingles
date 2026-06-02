import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

export const A2_OFFICIAL_PART9_DEMO = {
  directions: `Part 2\n\n${A2_LISTENING_DIRECTIONS[2]}`,
  intro: 'You will hear a teacher talking to a group of students about summer jobs.',
  noteTitle: ['Jobs for students', 'with Sunshine Holidays'],
  rows: [
    { label: 'Work in:', text: "Children's summer camps" },
    { label: 'Dates of jobs:', number: 6, before: '15th June – 20th ', after: '' },
    { label: 'Staff must be:', number: 7, before: '', after: ' years old' },
    { label: 'Staff must be able to:', number: 8, before: '', after: '' },
    { label: 'Staff will earn:', number: 9, before: '£ ', after: ' per week' },
    { label: 'Send a letter and:', number: 10, before: '', after: '' },
  ],
  gapNumbers: [6, 7, 8, 9, 10],
  answers: {
    6: ['August'],
    7: ['19'],
    8: ['drive'],
    9: ['65'],
    10: ['photograph'],
  },
};

export function buildA2Part9OpenAnswerMap(answers = A2_OFFICIAL_PART9_DEMO.answers) {
  const map = new Map();
  for (const [num, list] of Object.entries(answers)) {
    map.set(
      Number(num),
      new Set((list || []).map((w) => String(w).trim().toLowerCase())),
    );
  }
  return map;
}

export function isA2Part9DemoEmpty({ enunciado = '', openCount = 0 }) {
  if (Number(openCount) >= 5) return false;
  const hasEnunciado = String(enunciado || '').trim().length > 40;
  return !(hasEnunciado && Number(openCount) >= 5);
}
