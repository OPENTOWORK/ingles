'use client';

import { A2McqFeedback } from '@/components/a2/A2ExamReadingUi';
import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';
import { parseA2Part3Passage } from '@/utils/a2Part3Parser';

/**
 * Parte 3 A2 Key — texto en marco (foto a la derecha) + preguntas 14–18.
 */
export function A2Part3ExamView({
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

  const directionLines = String(directions || A2_RW_DIRECTIONS[3] || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 3' ? directionLines[0] : 'Part 3';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 3' ? directionLines.slice(1) : directionLines;

  const sortedGroups = [...groups].sort(
    (a, b) => Number(a.questionNumber) - Number(b.questionNumber),
  );

  return (
    <div className="a2-p3-paper">
      <header className="a2-p3-paper__header">
        <h3 className="a2-p3-paper__part-title">{partTitle}</h3>
        <div className="a2-p3-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => (
              <p
                key={i}
                className={/^Questions\s/i.test(line) ? 'a2-p3-paper__directions-range' : ''}
              >
                {line}
              </p>
            ))
          ) : (
            <p>For each question, choose the correct answer.</p>
          )}
        </div>
        <hr className="a2-p3-paper__rule" />
      </header>

      <section className="a2-p3-passage-box" aria-label="Reading text">
        <div className="a2-p3-passage-box__inner">
          <div className="a2-p3-passage-box__photo" aria-hidden="true">
            <span>Photo</span>
          </div>
          {title ? <h4 className="a2-p3-passage-box__title">{title}</h4> : null}
          <div className="a2-p3-passage-box__text">
            {paragraphs.length ? (
              paragraphs.map((para, i) => (
                <p key={i} className="a2-p3-passage-box__para">
                  {para}
                </p>
              ))
            ) : (
              <p className="a2-p3-passage-box__para a2-p3-passage-box__para--empty">
                Read the text in your exam materials.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="a2-p3-questions" aria-label="Questions 14 to 18">
        {sortedGroups.map((group, groupIndex) => {
          const questionKey = getQuestionKey(
            selectedPart.id,
            group.questionNumber,
            `p3-${groupIndex}`,
          );
          const isChecked = checkedQuestions[questionKey];
          const correct = group.options?.find((o) => o.correcta);
          const hint = aiHintsByKey[questionKey];

          return (
            <article
              key={`a2-p3-q-${group.questionNumber}-${groupIndex}`}
              className="a2-p3-question"
            >
              <p className="a2-p3-question__prompt">
                <span className="a2-p3-question__num">{group.questionNumber}</span>
                <span className="a2-p3-question__text">
                  {group.prompt || group.questionStem || ''}
                </span>
              </p>
              <div
                className="a2-p3-question__options"
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
                        'a2-p3-choice',
                        isSelected ? 'a2-p3-choice--selected' : '',
                        showCorrect ? 'a2-p3-choice--correct' : '',
                        showIncorrect ? 'a2-p3-choice--wrong' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() =>
                        onOptionSelect({ group, groupIndex, option, questionKey })
                      }
                    >
                      <span className="a2-p3-choice__letter">{letter}</span>
                      <span className="a2-p3-choice__text">{text}</span>
                    </button>
                  );
                })}
              </div>
              {!hideFeedback && isChecked ? (
                <div className="a2-p3-question__feedback">
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
