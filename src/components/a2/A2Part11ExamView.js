'use client';

import { A2McqFeedback } from '@/components/a2/A2ExamReadingUi';
import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

/**
 * A2 Key Listening Part 4 (parte global 11) — 5 extractos cortos; cada pregunta
 * incluye su propio contexto "You will hear …" + MCQ A/B/C de texto.
 */
export function A2Part11ExamView({
  directions = '',
  groups = [],
  getQuestionKey,
  selectedPart,
  selectedOptions,
  checkedQuestions,
  hideFeedback,
  onOptionSelect,
  aiHintsByKey = {},
}) {
  const directionLines = String(directions || `Part 4\n\n${A2_LISTENING_DIRECTIONS[4]}`)
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
    <div className="a2-p11-paper">
      <header className="a2-p11-paper__header">
        <h3 className="a2-p11-paper__part-title">{partTitle}</h3>
        <div className="a2-p11-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => (
              <p
                key={i}
                className={/^Questions\s/i.test(line) ? 'a2-p11-paper__directions-range' : ''}
              >
                {line}
              </p>
            ))
          ) : (
            <p>For each question, choose the correct answer.</p>
          )}
        </div>
        <hr className="a2-p11-paper__rule" />
      </header>

      <section className="a2-p11-questions" aria-label="Questions 16 to 20">
        {sortedGroups.map((group, groupIndex) => {
          const questionKey = getQuestionKey(
            selectedPart.id,
            group.questionNumber,
            `p11-${groupIndex}`,
          );
          const isChecked = checkedQuestions[questionKey];
          const correct = group.options?.find((o) => o.correcta);
          const hint = aiHintsByKey[questionKey];

          return (
            <article
              key={`a2-p11-q-${group.questionNumber}-${groupIndex}`}
              className="a2-p11-question"
            >
              {group.context ? (
                <p className="a2-p11-question__context">{group.context}</p>
              ) : null}
              <p className="a2-p11-question__prompt">
                <span className="a2-p11-question__num">{group.questionNumber}</span>
                <span className="a2-p11-question__text">
                  {group.prompt || group.questionStem || ''}
                </span>
              </p>
              <div
                className="a2-p11-question__options"
                role="group"
                aria-label={`Question ${group.questionNumber} options`}
              >
                {group.options?.map((option) => {
                  const m = String(option.formattedText || option.respuesta || '').match(
                    /^([A-C])\)\s*(.*)$/i,
                  );
                  const letter = m?.[1]?.toUpperCase() || '';
                  const text = m?.[2]?.trim() || option.formattedText || '';
                  const isSelected = selectedOptions[questionKey] === option.id;
                  const showCorrect = !hideFeedback && isChecked && option.correcta;
                  const showIncorrect =
                    !hideFeedback && isChecked && isSelected && !option.correcta;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={[
                        'a2-p11-choice',
                        isSelected ? 'a2-p11-choice--selected' : '',
                        showCorrect ? 'a2-p11-choice--correct' : '',
                        showIncorrect ? 'a2-p11-choice--wrong' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() =>
                        onOptionSelect({ group, groupIndex, option, questionKey })
                      }
                    >
                      <span className="a2-p11-choice__letter">{letter}</span>
                      <span className="a2-p11-choice__text">{text}</span>
                    </button>
                  );
                })}
              </div>
              {!hideFeedback && isChecked ? (
                <div className="a2-p11-question__feedback">
                  <A2McqFeedback
                    show
                    correctText={correct?.formattedText || correct?.respuesta}
                    hint={hint}
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
