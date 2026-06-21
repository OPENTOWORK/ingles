'use client';

/**
 * B2 First Writing Part 2 — choose one task from selectable cards.
 */
export default function B2WritingPart2TaskPicker({
  title = 'Writing Part 2 — Choose one task',
  instructions = '',
  options = [],
  selectedId = null,
  onSelect,
  wordMin = 140,
  wordMax = 190,
  lang = 'en',
  hideHeader = false,
  hideInstructions = false,
}) {
  const isEn = lang === 'en';
  const selected = options.find((o) => o.id === selectedId) || null;

  return (
    <div className="b2-writing-part2">
      {!hideHeader && title ? <h3 className="b2-writing-task__title">{title}</h3> : null}

      {!hideInstructions && instructions ? (
        <div className="b2-writing-task__instructions">
          <p className="b2-writing-task__label">Instructions</p>
          <p>{instructions}</p>
        </div>
      ) : null}

      <p className="b2-writing-task__word-note">
        Word limit: <strong>{wordMin}–{wordMax} words</strong>
      </p>

      {!selected ? (
        <div className="b2-writing-part2__options" role="radiogroup" aria-label={title || 'Writing Part 2'}>
          {options.map((opt, index) => (
            <button
              key={opt.id}
              type="button"
              className="b2-writing-part2__option-card"
              role="radio"
              aria-checked={false}
              onClick={() => onSelect?.(opt.id)}
            >
              <span className="b2-writing-part2__option-badge">
                {isEn ? `Option ${index + 1}` : `Opción ${index + 1}`}
              </span>
              <span className="b2-writing-part2__option-type">{opt.label}</span>
              <span className="b2-writing-part2__option-preview">
                {String(opt.context || opt.task || '')
                  .split('\n')
                  .find((l) => l.trim()) || opt.label}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="b2-writing-part2__selected">
          <div className="b2-writing-part2__selected-head">
            <span className="b2-writing-part2__option-badge">
              {isEn ? `Option ${selected.id}` : `Opción ${selected.id}`}
            </span>
            <span className="b2-writing-part2__option-type">{selected.label}</span>
            <button
              type="button"
              className="b2-writing-part2__change-btn"
              onClick={() => onSelect?.(null)}
            >
              {isEn ? 'Choose a different task' : 'Elegir otra tarea'}
            </button>
          </div>

          <div className="levels-exam-split__passage-panel b2-writing-part2__stimulus">
            {selected.context ? (
              <p className="b2-writing-part2__context">{selected.context}</p>
            ) : null}

            {selected.task ? (
              <div className="b2-writing-part2__task-body">
                {String(selected.task)
                  .split('\n')
                  .map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
