'use client';

/**
 * @param {{ categoryLabel: string, timeLabel: string }} props
 */
export default function LevelsCategoryTimer({ categoryLabel, timeLabel }) {
  return (
    <div className="levels-b2-timer">
      <span className="levels-b2-timer__label">{categoryLabel}</span>
      <span className="levels-b2-timer__value">{timeLabel}</span>
    </div>
  );
}
