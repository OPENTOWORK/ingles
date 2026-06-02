'use client';

import { A2McqFeedback } from '@/components/a2/A2ExamReadingUi';
import { A2_LISTENING_DIRECTIONS } from '@/data/a2-key-official-spec';

/**
 * A2 Key Listening Part 1 (parte global 8) — cabecera Part 1 + 5 preguntas,
 * cada una con tres opciones de imagen A/B/C (placeholder si no hay imageUrl).
 */
export function A2Part8ExamView({
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
  const directionLines = String(directions || `Part 1\n\n${A2_LISTENING_DIRECTIONS[1]}`)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 1' ? directionLines[0] : 'Part 1';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 1' ? directionLines.slice(1) : directionLines;

  const sortedGroups = [...groups].sort(
    (a, b) => Number(a.questionNumber) - Number(b.questionNumber),
  );

  return (
    <div className="a2-p8-paper">
      <header className="a2-p8-paper__header">
        <h3 className="a2-p8-paper__part-title">{partTitle}</h3>
        <div className="a2-p8-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => (
              <p
                key={i}
                className={/^Questions\s/i.test(line) ? 'a2-p8-paper__directions-range' : ''}
              >
                {line}
              </p>
            ))
          ) : (
            <p>For each question, choose the correct answer.</p>
          )}
        </div>
        <hr className="a2-p8-paper__rule" />
      </header>

      <section className="a2-p8-questions" aria-label="Questions 1 to 5">
        {sortedGroups.map((group, groupIndex) => {
          const questionKey = getQuestionKey(
            selectedPart.id,
            group.questionNumber,
            `p8-${groupIndex}`,
          );
          const isChecked = checkedQuestions[questionKey];
          const correct = group.options?.find((o) => o.correcta);
          const hint = aiHintsByKey[questionKey];

          return (
            <article
              key={`a2-p8-q-${group.questionNumber}-${groupIndex}`}
              className="a2-p8-question"
            >
              <p className="a2-p8-question__prompt">
                <span className="a2-p8-question__num">{group.questionNumber}</span>
                <span className="a2-p8-question__text">
                  {group.prompt || group.questionStem || ''}
                </span>
              </p>
              <div
                className="a2-p8-question__options"
                role="group"
                aria-label={`Question ${group.questionNumber} options`}
              >
                {group.options?.map((option) => {
                  const m = String(option.formattedText || option.respuesta || '').match(
                    /^([A-C])/i,
                  );
                  const letter = (option.letter || m?.[1] || '').toUpperCase();
                  const imageUrl = option.imageUrl || '';
                  const caption = option.caption || (letter ? `Picture ${letter}` : 'Picture');
                  const isSelected = selectedOptions[questionKey] === option.id;
                  const showCorrect = !hideFeedback && isChecked && option.correcta;
                  const showIncorrect =
                    !hideFeedback && isChecked && isSelected && !option.correcta;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={[
                        'a2-p8-choice',
                        isSelected ? 'a2-p8-choice--selected' : '',
                        showCorrect ? 'a2-p8-choice--correct' : '',
                        showIncorrect ? 'a2-p8-choice--wrong' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() =>
                        onOptionSelect({ group, groupIndex, option, questionKey })
                      }
                    >
                      <span className="a2-p8-choice__letter">{letter}</span>
                      <span className="a2-p8-choice__picture">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={caption || `Option ${letter}`}
                            className="a2-p8-choice__img"
                          />
                        ) : (
                          <span className="a2-p8-choice__placeholder" aria-hidden="true">
                            {caption}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!hideFeedback && isChecked ? (
                <div className="a2-p8-question__feedback">
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
