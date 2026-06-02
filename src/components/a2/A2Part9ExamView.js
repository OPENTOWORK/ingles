'use client';

import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

/**
 * A2 Key Listening Part 2 (parte global 9) — nota/formulario con huecos (6–10).
 * Una palabra/número/fecha/hora por hueco; inputs inline como en Reading Part 5.
 */
export function A2Part9ExamView({
  directions = '',
  intro = '',
  noteTitle = [],
  rows = [],
  values = {},
  checks = {},
  answers = {},
  hideFeedback = false,
  onChange,
  onCheck,
}) {
  const directionLines = String(directions || `Part 2\n\n${A2_LISTENING_DIRECTIONS[2]}`)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 2' ? directionLines[0] : 'Part 2';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 2' ? directionLines.slice(1) : directionLines;

  const renderGap = (number) => {
    const value = values[number] || '';
    const result = checks[number];
    const showResult = !hideFeedback && typeof result === 'boolean';
    const inputClass = [
      'a2-p9-gap__input',
      showResult ? (result ? 'a2-p9-gap__input--correct' : 'a2-p9-gap__input--wrong') : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <input
        type="text"
        className={inputClass}
        value={value}
        placeholder="answer"
        aria-label={`Gap ${number}`}
        onChange={(e) => onChange?.(number, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onCheck?.(number, value);
          }
        }}
        onBlur={() => onCheck?.(number, value)}
      />
    );
  };

  return (
    <div className="a2-p9-paper">
      <header className="a2-p9-paper__header">
        <h3 className="a2-p9-paper__part-title">{partTitle}</h3>
        <div className="a2-p9-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => (
              <p
                key={i}
                className={/^Questions\s/i.test(line) ? 'a2-p9-paper__directions-range' : ''}
              >
                {line}
              </p>
            ))
          ) : (
            <p>For each question, write the correct answer in the gap.</p>
          )}
        </div>
        <hr className="a2-p9-paper__rule" />
      </header>

      {intro ? <p className="a2-p9-intro">{intro}</p> : null}

      <section className="a2-p9-note" aria-label="Notes">
        {noteTitle.length ? (
          <div className="a2-p9-note__title">
            {noteTitle.map((line, i) => (
              <span key={i} className="a2-p9-note__title-line">
                {line}
              </span>
            ))}
          </div>
        ) : null}
        <div className="a2-p9-note__rows">
          {rows.map((row, i) => (
            <div key={i} className="a2-p9-note__row">
              <span className="a2-p9-note__label">{row.label}</span>
              <span className="a2-p9-note__value">
                {typeof row.number === 'number' ? (
                  <>
                    <span className="a2-p9-note__num">({row.number})</span>
                    {row.before ? <span>{row.before}</span> : null}
                    {renderGap(row.number)}
                    {row.after ? <span>{row.after}</span> : null}
                  </>
                ) : (
                  <span>{row.text}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {!hideFeedback ? (
        <div className="a2-p9-answers" aria-label="Correct answers">
          {Object.entries(answers).map(([num, list]) => {
            const result = checks[Number(num)];
            if (typeof result !== 'boolean') return null;
            return (
              <p
                key={num}
                className={`a2-p9-answers__row ${result ? 'a2-p9-answers__row--ok' : 'a2-p9-answers__row--ko'}`}
              >
                <strong>Question {num}:</strong> {result ? 'Correct' : 'Incorrect'} — answer:{' '}
                {(list || []).join(' / ') || 'Not available'}
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
