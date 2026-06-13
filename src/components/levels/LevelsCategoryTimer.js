'use client';

/**
 * @param {object} props
 * @param {string} props.categoryLabel
 * @param {string} props.timeLabel
 * @param {'prominent' | 'discrete' | 'hidden'} [props.variant]
 * @param {boolean} [props.isRunning]
 * @param {boolean} [props.isPaused]
 * @param {boolean} [props.isIdle]
 * @param {() => void} [props.onStart]
 * @param {() => void} [props.onPause]
 * @param {() => void} [props.onResume]
 * @param {boolean} [props.timerHidden]
 * @param {() => void} [props.onToggleTimerHidden]
 * @param {string} [props.lang]
 */
export default function LevelsCategoryTimer({
  categoryLabel,
  timeLabel,
  variant = 'prominent',
  isRunning,
  isPaused,
  isIdle,
  onStart,
  onPause,
  onResume,
  timerHidden = false,
  onToggleTimerHidden,
  lang = 'en',
}) {
  if (variant === 'hidden') return null;

  const en = lang === 'en';
  const showControls = Boolean(onStart || onPause || onResume);
  const labels = {
    start: en ? 'Start' : 'Empezar',
    pause: en ? 'Pause' : 'Pausar',
    resume: en ? 'Resume' : 'Reanudar',
    hideTimer: en ? 'Hide timer' : 'Ocultar cronómetro',
    showTimer: en ? 'Show timer' : 'Mostrar cronómetro',
    timerHidden: en ? 'Timer hidden' : 'Cronómetro oculto',
  };

  return (
    <div
      className={`levels-b2-timer${variant === 'discrete' ? ' levels-b2-timer--discrete' : ''}${variant === 'prominent' ? ' levels-b2-timer--prominent' : ''}`}
    >
      <div className="levels-b2-timer__main">
        <span className="levels-b2-timer__label">{categoryLabel}</span>
        <span className="levels-b2-timer__value">
          {timerHidden ? labels.timerHidden : timeLabel}
        </span>
      </div>

      <div className="levels-b2-timer__controls">
        {onToggleTimerHidden ? (
          <button type="button" className="levels-b2-timer__btn" onClick={onToggleTimerHidden}>
            {timerHidden ? labels.showTimer : labels.hideTimer}
          </button>
        ) : null}
        {showControls ? (
          <>
            {isRunning ? (
              <button type="button" className="levels-b2-timer__btn" onClick={onPause}>
                {labels.pause}
              </button>
            ) : isPaused ? (
              <button type="button" className="levels-b2-timer__btn levels-b2-timer__btn--primary" onClick={onResume}>
                {labels.resume}
              </button>
            ) : isIdle ? (
              <button type="button" className="levels-b2-timer__btn levels-b2-timer__btn--primary" onClick={onStart}>
                {labels.start}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
