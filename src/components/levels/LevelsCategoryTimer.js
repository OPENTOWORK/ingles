'use client';

/**
 * @param {{ categoryLabel: string, timeLabel: string, variant?: 'prominent' | 'discrete' | 'hidden' }} props
 */
export default function LevelsCategoryTimer({ categoryLabel, timeLabel, variant = 'prominent' }) {
  if (variant === 'hidden') return null;

  return (
    <div
      className={`levels-b2-timer${variant === 'discrete' ? ' levels-b2-timer--discrete' : ''}${variant === 'prominent' ? ' levels-b2-timer--prominent' : ''}`}
    >
      <span className="levels-b2-timer__label">{categoryLabel}</span>
      <span className="levels-b2-timer__value">{timeLabel}</span>
    </div>
  );
}
