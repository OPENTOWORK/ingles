'use client';

/**
 * @param {object} props
 * @param {string} props.categoryLabel
 * @param {string} props.timeLabel
 * @param {'prominent' | 'discrete' | 'session' | 'hidden'} [props.variant]
 * @param {boolean} [props.isRunning]
 * @param {boolean} [props.isPaused]
 * @param {boolean} [props.isIdle]
 * @param {boolean} [props.isStopped]
 * @param {() => void} [props.onStart]
 * @param {() => void} [props.onPause]
 * @param {() => void} [props.onResume]
 * @param {() => void} [props.onStop]
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
  isStopped = false,
  onStart,
  onPause,
  onResume,
  onStop,
  timerHidden = false,
  onToggleTimerHidden,
  lang = 'en',
}) {
  if (variant === 'hidden') return null;

  const en = lang === 'en';
  const showTransportControls = Boolean(onStart || onPause || onResume || onStop);
  const labels = {
    start: en ? 'Start timer' : 'Iniciar cronómetro',
    pause: en ? 'Pause timer' : 'Pausar cronómetro',
    resume: en ? 'Resume timer' : 'Reanudar cronómetro',
    stop: en ? 'Stop timer' : 'Detener cronómetro',
    hideTimer: en ? 'Hide' : 'Ocultar',
    showTimer: en ? 'Show' : 'Mostrar',
    timerHidden: en ? 'Timer hidden' : 'Cronómetro oculto',
    timer: en ? 'Timer' : 'Cronómetro',
  };

  const handlePlay = () => {
    if (isPaused || isStopped) onResume?.();
    else onStart?.();
  };

  const variantClass =
    variant === 'discrete'
      ? ' levels-b2-timer--discrete'
      : variant === 'session'
        ? ' levels-b2-timer--session'
        : variant === 'prominent'
          ? ' levels-b2-timer--prominent'
          : '';

  return (
    <div className={`levels-b2-timer${variantClass}`}>
      <div className="levels-b2-timer__main">
        {variant === 'session' ? (
          <span className="levels-b2-timer__session-tag">{labels.timer}</span>
        ) : (
          <span className="levels-b2-timer__label">{categoryLabel}</span>
        )}
        <span
          className={`levels-b2-timer__value${isRunning ? ' levels-b2-timer__value--live' : ''}${isStopped ? ' levels-b2-timer__value--stopped' : ''}`}
          aria-live="polite"
        >
          {timerHidden ? labels.timerHidden : timeLabel}
        </span>
        {variant === 'session' && categoryLabel ? (
          <span className="levels-b2-timer__session-context">{categoryLabel}</span>
        ) : null}
      </div>

      <div className="levels-b2-timer__controls">
        {onToggleTimerHidden ? (
          <button
            type="button"
            className="levels-b2-timer__btn levels-b2-timer__btn--ghost"
            onClick={onToggleTimerHidden}
          >
            {timerHidden ? labels.showTimer : labels.hideTimer}
          </button>
        ) : null}

        {showTransportControls && !timerHidden ? (
          <div className="levels-b2-timer__transport" role="group" aria-label={labels.timer}>
            {isRunning ? (
              <button
                type="button"
                className="levels-b2-timer__icon-btn"
                onClick={onPause}
                aria-label={labels.pause}
                title={labels.pause}
              >
                <span aria-hidden>⏸</span>
              </button>
            ) : (
              <button
                type="button"
                className="levels-b2-timer__icon-btn levels-b2-timer__icon-btn--primary"
                onClick={handlePlay}
                aria-label={isPaused || isStopped ? labels.resume : labels.start}
                title={isPaused || isStopped ? labels.resume : labels.start}
              >
                <span aria-hidden>▶</span>
              </button>
            )}

            {onStop ? (
              <button
                type="button"
                className="levels-b2-timer__icon-btn levels-b2-timer__icon-btn--stop"
                onClick={onStop}
                disabled={isIdle && !isRunning && !isPaused && !isStopped}
                aria-label={labels.stop}
                title={labels.stop}
              >
                <span aria-hidden>⏹</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
