'use client';

import { A2McqFeedback } from '@/components/a2/A2ExamReadingUi';
import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';
import { parseA2Part3Passage } from '@/utils/a2Part3Parser';

const LETTERS = ['A', 'B', 'C'];

/**
 * Parte 4 A2 Key — texto con huecos (19–24) en marco + filas de opciones A/B/C.
 */
export function A2Part4ExamView({
  directions = '',
  passageTitle = '',
  passageParagraphs = [],
  passageText = '',
  groups = [],
  getQuestionKey,
  selectedPart,
  selectedOptions,
  checkedQuestions,
  hideFeedback,
  onOptionSelect,
  aiHintsByKey = {},
}) {
  const parsed = parseA2Part3Passage(passageText);
  const title = passageTitle || parsed.title;
  const paragraphs =
    passageParagraphs?.length > 0 ? passageParagraphs : parsed.paragraphs;

  const directionLines = String(directions || A2_RW_DIRECTIONS[4] || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 4' ? directionLines[0] : 'Part 4';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 4' ? directionLines.slice(1) : directionLines;

  const sortedGroups = [...groups].sort(
    (a, b) => Number(a.questionNumber) - Number(b.questionNumber),
  );

  return (
    <div className="a2-p4-paper">
      <header className="a2-p4-paper__header">
        <h3 className="a2-p4-paper__part-title">{partTitle}</h3>
        <div className="a2-p4-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => (
              <p
                key={i}
                className={/^Questions\s/i.test(line) ? 'a2-p4-paper__directions-range' : ''}
              >
                {line}
              </p>
            ))
          ) : (
            <p>For each question, choose the correct answer.</p>
          )}
        </div>
        <hr className="a2-p4-paper__rule" />
      </header>

      <section className="a2-p4-passage-box" aria-label="Reading text">
        {title ? <h4 className="a2-p4-passage-box__title">{title}</h4> : null}
        <div className="a2-p4-passage-box__text">
          {paragraphs.length ? (
            paragraphs.map((para, i) => (
              <p key={i} className="a2-p4-passage-box__para">
                {para}
              </p>
            ))
          ) : (
            <p className="a2-p4-passage-box__para a2-p4-passage-box__para--empty">
              Read the text in your exam materials.
            </p>
          )}
        </div>
      </section>

      <section className="a2-p4-options" aria-label="Questions 19 to 24">
        {sortedGroups.map((group, groupIndex) => {
          const questionKey = getQuestionKey(
            selectedPart.id,
            group.questionNumber,
            `p4-${groupIndex}`,
          );
          const isChecked = checkedQuestions[questionKey];
          const correct = group.options?.find((o) => o.correcta);
          const hint = aiHintsByKey[questionKey];

          const byLetter = {};
          for (const opt of group.options || []) {
            const m = String(opt.formattedText || opt.respuesta || '').match(/^([A-C])\)?\s*(.*)$/i);
            if (m) byLetter[m[1].toUpperCase()] = { option: opt, text: m[2]?.trim() || '' };
          }

          return (
            <div key={`a2-p4-row-${group.questionNumber}-${groupIndex}`} className="a2-p4-option-row">
              <span className="a2-p4-option-row__num">{group.questionNumber}</span>
              <div className="a2-p4-option-row__choices">
                {LETTERS.map((letter) => {
                  const entry = byLetter[letter];
                  if (!entry) {
                    return (
                      <span key={letter} className="a2-p4-choice a2-p4-choice--muted">
                        <span className="a2-p4-choice__letter">{letter}</span>
                      </span>
                    );
                  }
                  const { option, text } = entry;
                  const isSelected = selectedOptions[questionKey] === option.id;
                  const showCorrect = !hideFeedback && isChecked && option.correcta;
                  const showIncorrect =
                    !hideFeedback && isChecked && isSelected && !option.correcta;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={[
                        'a2-p4-choice',
                        isSelected ? 'a2-p4-choice--selected' : '',
                        showCorrect ? 'a2-p4-choice--correct' : '',
                        showIncorrect ? 'a2-p4-choice--wrong' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() =>
                        onOptionSelect({ group, groupIndex, option, questionKey })
                      }
                    >
                      <span className="a2-p4-choice__letter">{letter}</span>
                      <span className="a2-p4-choice__text">{text}</span>
                    </button>
                  );
                })}
              </div>
              {!hideFeedback && isChecked ? (
                <div className="a2-p4-option-row__feedback">
                  <A2McqFeedback
                    show
                    correctText={correct?.formattedText || correct?.respuesta}
                    hint={hint}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}
