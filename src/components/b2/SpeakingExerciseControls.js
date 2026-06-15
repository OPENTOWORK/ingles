'use client';

function ControlIcon({ name }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'play':
      return (
        <svg {...common}>
          <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'pause':
      return (
        <svg {...common}>
          <rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
          <rect x="13" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'repeat':
      return (
        <svg {...common}>
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      );
    case 'next':
      return (
        <svg {...common}>
          <path d="M5 12h12" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Transport controls for skill speaking practice.
 */
export default function SpeakingExerciseControls({
  lang = 'en',
  sessionReady = false,
  exerciseStarted = false,
  exercisePaused = false,
  loading = false,
  canRepeat = false,
  onPlay,
  onPause,
  onRepeat,
  onNextStep,
}) {
  const isEn = lang === 'en';
  const playLabel = exercisePaused
    ? isEn
      ? 'Resume'
      : 'Reanudar'
    : isEn
      ? 'Play'
      : 'Play';
  const pauseLabel = isEn ? 'Pause' : 'Pausar';
  const repeatLabel = isEn ? 'Repeat' : 'Repetir';
  const nextLabel = isEn ? 'Next step' : 'Siguiente paso';

  const busy = loading;
  const playDisabled = busy || !sessionReady;
  const pauseDisabled = busy || !exerciseStarted;
  const repeatDisabled = busy || !canRepeat;
  const nextDisabled = busy || !sessionReady || !exerciseStarted;

  return (
    <div className="speaking-exercise-controls" role="toolbar" aria-label={isEn ? 'Exercise controls' : 'Controles del ejercicio'}>
      <button
        type="button"
        className="speaking-exercise-controls__btn speaking-exercise-controls__btn--primary"
        onClick={onPlay}
        disabled={playDisabled}
        aria-label={playLabel}
      >
        <ControlIcon name="play" />
        <span>{playLabel}</span>
      </button>
      <button
        type="button"
        className="speaking-exercise-controls__btn"
        onClick={onPause}
        disabled={pauseDisabled}
        aria-label={pauseLabel}
      >
        <ControlIcon name="pause" />
        <span>{pauseLabel}</span>
      </button>
      <button
        type="button"
        className="speaking-exercise-controls__btn"
        onClick={onRepeat}
        disabled={repeatDisabled}
        aria-label={repeatLabel}
      >
        <ControlIcon name="repeat" />
        <span>{repeatLabel}</span>
      </button>
      <button
        type="button"
        className="speaking-exercise-controls__btn speaking-exercise-controls__btn--accent"
        onClick={onNextStep}
        disabled={nextDisabled}
        aria-label={nextLabel}
      >
        <ControlIcon name="next" />
        <span>{nextLabel}</span>
      </button>
    </div>
  );
}
