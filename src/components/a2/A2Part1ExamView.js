'use client';

import { A2Part1Stimulus } from '@/components/a2/A2Part1Stimulus';
import { A2McqFeedback } from '@/components/a2/A2ExamReadingUi';
/**
 * Parte 1 A2 Key — layout tipo hoja de examen oficial.
 */
export function A2Part1ExamView({
  directions = '',
  example = null,
  groups = [],
  getQuestionKey,
  selectedPart,
  selectedOptions,
  checkedQuestions,
  hideFeedback,
  onOptionSelect,
  aiHintsByKey = {},
}) {
  return (
    <div className="a2-p1-paper">
      {directions ? (
        <header className="a2-p1-paper__header">
          <h3 className="a2-p1-paper__part-title">Part 1</h3>
          <div className="a2-p1-paper__directions">
            {directions.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <hr className="a2-p1-paper__rule" />
        </header>
      ) : null}

      {example ? (
        <section className="a2-p1-paper__example" aria-label="Example">
          <p className="a2-p1-paper__example-label">Example</p>
          <div className="a2-p1-paper__example-grid">
            <div className="a2-p1-paper__example-stimulus">
              <div className="a2-p1-paper__example-text">{example.body}</div>
            </div>
            <div className="a2-p1-paper__example-options">
              {example.options?.map((opt) => (
                <p key={opt} className="a2-p1-paper__example-opt">
                  {opt}
                </p>
              ))}
              {example.answer ? (
                <p className="a2-p1-paper__example-ans">
                  <span className="a2-p1-paper__example-box">{example.answer}</span>
                </p>
              ) : null}
            </div>
          </div>
          <hr className="a2-p1-paper__rule" />
        </section>
      ) : null}

      {groups.length > 0 ? (
        <div className="a2-p1-paper__cols-head" aria-hidden="true">
          <span className="a2-p1-paper__cols-head-num" />
          <span className="a2-p1-paper__cols-head-stimulus">Text / notice</span>
          <span className="a2-p1-paper__cols-head-choices">Options</span>
        </div>
      ) : null}

      <div className="a2-p1-paper__items">
        {groups.map((group, groupIndex) => {
          const questionKey = getQuestionKey(
            selectedPart.id,
            group.questionNumber,
            `p1-${groupIndex}`,
          );
          const isChecked = checkedQuestions[questionKey];
          const correct = group.options?.find((o) => o.correcta);
          const hint = aiHintsByKey[questionKey];

          const hasImage = Boolean(group.stimulusImageUrl);

          return (
            <article
              key={`a2-p1-item-${group.questionNumber}-${groupIndex}`}
              className={`a2-p1-paper__item${hasImage ? ' a2-p1-paper__item--has-image' : ''}`}
            >
              <span className="a2-p1-paper__qnum">{group.questionNumber}</span>
              <A2Part1Stimulus
                stimulusType={group.stimulusType}
                message={group.message || group.questionStem}
                imageUrl={group.stimulusImageUrl}
                prompt={group.prompt}
              />
              <div
                className="a2-p1-paper__choices"
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
                        'a2-p1-choice',
                        isSelected ? 'a2-p1-choice--selected' : '',
                        showCorrect ? 'a2-p1-choice--correct' : '',
                        showIncorrect ? 'a2-p1-choice--wrong' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() =>
                        onOptionSelect({ group, groupIndex, option, questionKey })
                      }
                    >
                      <span className="a2-p1-choice__letter">{letter}</span>
                      <span className="a2-p1-choice__text">{text}</span>
                    </button>
                  );
                })}
              </div>
              {!hideFeedback && isChecked ? (
                <div className="a2-p1-paper__feedback">
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
      </div>
    </div>
  );
}
