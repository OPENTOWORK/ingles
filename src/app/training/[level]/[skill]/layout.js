const SKILLS = [
  'use-of-english',
  'writing',
  'listening',
  'speaking',
  'reading',
  'vocabulary',
  'all',
  'challenge',
];

export function generateStaticParams() {
  return SKILLS.map((skill) => ({ skill }));
}

export default function TrainingSkillLayout({ children }) {
  return children;
}
