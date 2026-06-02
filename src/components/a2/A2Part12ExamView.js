'use client';

import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

/**
 * A2 Key Listening Part 5 (parte global 12) — emparejar personas (21–25) con comida (A–H).
 * Selector A–H por persona; 3 opciones del pool quedan sin usar.
 */
export function A2Part12ExamView({
  directions = '',
  introLines = [],
  example = null,
  people = [],
  optionPool = [],
  answers = {},
  selections = {},
  checks = {},
  hideFeedback = false,
  onSelect,
}) {
  const directionLines = String(directions || `Part 5\n\n${A2_LISTENING_DIRECTIONS[5]}`)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 5' ? directionLines[0] : 'Part 5';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 5' ? directionLines.slice(1) : directionLines;

  return (
    <div className="a2-p12-paper">
      <header className="a2-p12-paper__header">
        <h3 className="a2-p12-paper__part-title">{partTitle}</h3>
        <div className="a2-p12-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => (
              <p
                key={i}
                className={/^Questions\s/i.test(line) ? 'a2-p12-paper__directions-range' : ''}
              >
                {line}
              </p>
            ))
          ) : (
            <p>For each question, choose the correct answer.</p>
          )}
        </div>
        <hr className="a2-p12-paper__rule" />
      </header>

      {introLines.length ? (
        <div className="a2-p12-intro">
          {introLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ) : null}

      {example ? (
        <div className="a2-p12-example" aria-label="Example">
          <span className="a2-p12-example__label">Example:</span>
          <span className="a2-p12-example__box">
            <span className="a2-p12-example__num">{example.number}</span>
            <span className="a2-p12-example__name">{example.name}</span>
            <span className="a2-p12-example__letter">{example.letter}</span>
          </span>
        </div>
      ) : null}

      <div className="a2-p12-grid">
        <section className="a2-p12-people" aria-label="People">
          <h4 className="a2-p12-col-title">People</h4>
          <ul className="a2-p12-people__list">
            {people.map((person) => {
              const value = selections[person.number] || '';
              const result = checks[person.number];
              const showResult = !hideFeedback && typeof result === 'boolean';
              const rowClass = [
                'a2-p12-person',
                showResult ? (result ? 'a2-p12-person--correct' : 'a2-p12-person--wrong') : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <li key={person.number} className={rowClass}>
                  <span className="a2-p12-person__num">{person.number}</span>
                  <span className="a2-p12-person__name">{person.name}</span>
                  <select
                    className="a2-p12-person__select"
                    value={value}
                    aria-label={`Choose food for ${person.name}`}
                    onChange={(e) => onSelect?.(person.number, e.target.value)}
                  >
                    <option value="">—</option>
                    {optionPool.map((opt) => (
                      <option key={opt.letter} value={opt.letter}>
                        {opt.letter}
                      </option>
                    ))}
                  </select>
                  {showResult ? (
                    <span className="a2-p12-person__answer">
                      {result ? 'Correct' : `Answer: ${answers[person.number] || '?'}`}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="a2-p12-food" aria-label="Food">
          <h4 className="a2-p12-col-title">Food</h4>
          <ul className="a2-p12-food__list">
            {optionPool.map((opt) => (
              <li key={opt.letter} className="a2-p12-food__item">
                <span className="a2-p12-food__letter">{opt.letter}</span>
                <span className="a2-p12-food__text">{opt.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
