'use client';

/**
 * Tarjeta de tarea de Writing A2 (Parte 6/7) con formato hoja de examen.
 */
export function A2WritingTaskCard({
  partTitle = 'Part 6',
  questionLabel = '',
  scenario = '',
  bulletsIntro = '',
  bullets = [],
  pictures = [],
  wordCountNote = '',
  answerSheetNote = '',
  inputPrompts = [],
}) {
  const scenarioLines = String(scenario || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="a2-writing-task">
      <h3 className="a2-writing-task__part-title">{partTitle}</h3>
      {questionLabel ? (
        <p className="a2-writing-task__question">{questionLabel}</p>
      ) : null}

      {scenarioLines.length ? (
        <div className="a2-writing-task__scenario">
          {scenarioLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ) : null}

      {inputPrompts.length ? (
        <p className="a2-writing-task__input-prompts">
          Read this {inputPrompts.length === 1 ? 'message' : 'information'}.
        </p>
      ) : null}

      {bulletsIntro ? <p className="a2-writing-task__bullets-intro">{bulletsIntro}</p> : null}
      {bullets.length ? (
        <ul className="a2-writing-task__bullets">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}

      {pictures.length ? (
        <div className="a2-writing-task__pictures">
          {pictures.map((label, i) => (
            <div key={i} className="a2-writing-task__picture">
              {label}
            </div>
          ))}
        </div>
      ) : null}

      {wordCountNote ? <p className="a2-writing-task__word-note">{wordCountNote}</p> : null}
      {answerSheetNote ? (
        <p className="a2-writing-task__answer-note">{answerSheetNote}</p>
      ) : null}
    </div>
  );
}
