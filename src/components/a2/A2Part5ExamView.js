'use client';

import { Fragment } from 'react';
import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';

const GAP_RE = /\((\d+)\)\s*\.*/g;

/** Divide un párrafo en nodos de texto y huecos numerados. */
function splitParagraph(paragraph) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  GAP_RE.lastIndex = 0;
  while ((match = GAP_RE.exec(paragraph)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: paragraph.slice(lastIndex, match.index) });
    }
    nodes.push({ type: 'gap', number: Number(match[1]) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < paragraph.length) {
    nodes.push({ type: 'text', value: paragraph.slice(lastIndex) });
  }
  return nodes;
}

/**
 * Parte 5 A2 Key — email con huecos (25–30), una palabra por hueco.
 */
export function A2Part5ExamView({
  directions = '',
  email = {},
  example = null,
  bodyParagraphs = [],
  values = {},
  checks = {},
  answers = {},
  hideFeedback = false,
  onChange,
  onCheck,
}) {
  const directionLines = String(directions || A2_RW_DIRECTIONS[5] || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 5' ? directionLines[0] : 'Part 5';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 5' ? directionLines.slice(1) : directionLines;

  const renderGap = (number) => {
    if (example && Number(number) === Number(example.number)) {
      return (
        <span key={`gap-${number}`} className="a2-p5-gap a2-p5-gap--example">
          <span className="a2-p5-gap__num">{number}</span>
          <input
            type="text"
            className="a2-p5-gap__input a2-p5-gap__input--example"
            value={example.answer}
            disabled
            aria-label={`Example ${number}`}
          />
        </span>
      );
    }

    const value = values[number] || '';
    const result = checks[number];
    const showResult = !hideFeedback && typeof result === 'boolean';
    const inputClass = [
      'a2-p5-gap__input',
      showResult ? (result ? 'a2-p5-gap__input--correct' : 'a2-p5-gap__input--wrong') : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span key={`gap-${number}`} className="a2-p5-gap">
        <span className="a2-p5-gap__num">{number}</span>
        <input
          type="text"
          className={inputClass}
          value={value}
          placeholder="word"
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
      </span>
    );
  };

  return (
    <div className="a2-p5-paper">
      <header className="a2-p5-paper__header">
        <h3 className="a2-p5-paper__part-title">{partTitle}</h3>
        <div className="a2-p5-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => (
              <p
                key={i}
                className={/^Questions\s/i.test(line) ? 'a2-p5-paper__directions-range' : ''}
              >
                {line}
              </p>
            ))
          ) : (
            <p>For each question, write the correct answer. Write one word for each gap.</p>
          )}
        </div>
      </header>

      {example ? (
        <div className="a2-p5-example" aria-label="Example">
          <span className="a2-p5-example__label">Example:</span>
          <span className="a2-p5-example__box">
            <span className="a2-p5-example__num">{example.number}</span>
            <span className="a2-p5-example__answer">{example.answer}</span>
          </span>
        </div>
      ) : null}

      <section className="a2-p5-email" aria-label="Email">
        <div className="a2-p5-email__meta">
          <div className="a2-p5-email__meta-row">
            <span className="a2-p5-email__meta-label">{email.fromLabel || 'From:'}</span>
            <span className="a2-p5-email__meta-value">{email.from || ''}</span>
          </div>
          <div className="a2-p5-email__meta-row">
            <span className="a2-p5-email__meta-label">{email.toLabel || 'To:'}</span>
            <span className="a2-p5-email__meta-value">{email.to || ''}</span>
          </div>
        </div>

        <div className="a2-p5-email__body">
          {bodyParagraphs.map((para, pIndex) => {
            const nodes = splitParagraph(para);
            return (
              <p key={pIndex} className="a2-p5-email__para">
                {nodes.map((node, nIndex) =>
                  node.type === 'text' ? (
                    <Fragment key={nIndex}>{node.value}</Fragment>
                  ) : (
                    renderGap(node.number)
                  ),
                )}
              </p>
            );
          })}
        </div>
      </section>

      {!hideFeedback ? (
        <div className="a2-p5-answers" aria-label="Correct answers">
          {Object.keys(answers).length > 0
            ? Object.entries(answers).map(([num, list]) => {
                const result = checks[Number(num)];
                if (typeof result !== 'boolean') return null;
                return (
                  <p
                    key={num}
                    className={`a2-p5-answers__row ${result ? 'a2-p5-answers__row--ok' : 'a2-p5-answers__row--ko'}`}
                  >
                    <strong>Question {num}:</strong>{' '}
                    {result ? 'Correct' : 'Incorrect'} — answer:{' '}
                    {(list || []).join(' / ') || 'Not available'}
                  </p>
                );
              })
            : null}
        </div>
      ) : null}
    </div>
  );
}
