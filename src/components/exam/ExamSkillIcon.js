import { TrainingSkillIcon } from '@/components/training/TrainingIcons';

const THEME_TO_SKILL = {
  reading: 'reading',
  'reading-writing': 'reading',
  writing: 'writing',
  listening: 'listening',
  speaking: 'speaking',
  'exam-mode': 'challenge',
};

/**
 * @param {{ theme?: string, className?: string, size?: 'sm' | 'md' }} props
 */
export default function ExamSkillIcon({ theme = 'reading', className = '', size = 'sm' }) {
  const skillId = THEME_TO_SKILL[theme] || 'reading';
  const sizeClass =
    size === 'md'
      ? 'exam-skill-icon exam-skill-icon--md'
      : 'exam-skill-icon exam-skill-icon--sm';

  return (
    <span className={[sizeClass, className].filter(Boolean).join(' ')} aria-hidden>
      <TrainingSkillIcon skillId={skillId} className="exam-skill-icon__svg" />
    </span>
  );
}
