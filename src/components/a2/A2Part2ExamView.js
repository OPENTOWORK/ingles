'use client';

import { A2McqFeedback } from '@/components/a2/A2ExamReadingUi';
import { parseA2Part2Profiles, parseA2Part2TextIntro } from '@/utils/a2ExamMatching';

const LETTERS = ['A', 'B', 'C'];

/**
 * Parte 2 A2 Key — perfiles + matching 7–13 (layout profesional).
 */
export function A2Part2ExamView({
  directions = '',
  passageText = '',
  profileNames = [],
  groups = [],
  getQuestionKey,
  selectedPart,
  selectedOptions,
  checkedQuestions,
  hideFeedback,
  onOptionSelect,
  aiHintsByKey = {},
}) {
  const profiles = parseA2Part2Profiles(passageText);
  const { title, subtitle } = parseA2Part2TextIntro(passageText);

  const people =
    profiles.length >= 3
      ? profiles.slice(0, 3)
      : LETTERS.map((letter, i) => ({
          letter,
          name: profileNames[i] || `Person ${letter}`,
          text: '',
        }));

  return (
    <div className="a2-p2-paper">
      <header className="a2-p2-paper__header">
        <h3 className="a2-p2-paper__part-title">Part 2</h3>
        {directions ? (
          <div className="a2-p2-paper__directions">
            {directions.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : (
          <p className="a2-p2-paper__directions a2-p2-paper__directions--default">
            For each question, choose the correct answer.
          </p>
        )}
        <hr className="a2-p2-paper__rule" />
      </header>

      <div className="a2-p2-layout">
        <aside className="a2-p2-profiles" aria-label="Reading text">
          {(title || subtitle) && (
            <div className="a2-p2-profiles__intro">
              {title ? <h4 className="a2-p2-profiles__title">{title}</h4> : null}
              {subtitle ? <p className="a2-p2-profiles__subtitle">{subtitle}</p> : null}
            </div>
          )}
          {people.map((p) => (
            <article key={p.letter} className="a2-p2-profile-card">
              <div className="a2-p2-profile-card__head">
                <span className="a2-p2-profile-card__letter">{p.letter}</span>
                <span className="a2-p2-profile-card__name">{p.name}</span>
              </div>
              {p.text ? (
                <p className="a2-p2-profile-card__text">{p.text}</p>
              ) : (
                <p className="a2-p2-profile-card__text a2-p2-profile-card__text--empty">
                  Read the text for this person in your exam materials.
                </p>
              )}
            </article>
          ))}
        </aside>

        <section className="a2-p2-match" aria-label="Questions">
          <div className="a2-p2-match__legend">
            {people.map((p) => (
              <div key={p.letter} className="a2-p2-match__person">
                <span className="a2-p2-match__person-letter">{p.letter}</span>
                <span className="a2-p2-match__person-name">{p.name}</span>
              </div>
            ))}
          </div>

          <ol className="a2-p2-match__list">
            {groups.map((group, groupIndex) => {
              const questionKey = getQuestionKey(
                selectedPart.id,
                group.questionNumber,
                `p2-${groupIndex}`,
              );
              const isChecked = checkedQuestions[questionKey];
              const correct = group.options?.find((o) => o.correcta);
              const byLetter = {};
              for (const opt of group.options || []) {
                const m = String(opt.formattedText || opt.respuesta || '').match(/^([A-C])\b/i);
                if (m) byLetter[m[1].toUpperCase()] = opt;
              }

              return (
                <li
                  key={`a2-p2-q-${group.questionNumber}-${groupIndex}`}
                  className="a2-p2-match__row"
                >
                  <div className="a2-p2-match__prompt">
                    <span className="a2-p2-match__qnum">{group.questionNumber}</span>
                    <span className="a2-p2-match__qtext">
                      {group.prompt || group.questionStem || ''}
                    </span>
                  </div>
                  <div
                    className="a2-p2-match__choices"
                    role="group"
                    aria-label={`Question ${group.questionNumber}`}
                  >
                    {LETTERS.map((letter) => {
                      const option = byLetter[letter];
                      const person = people.find((x) => x.letter === letter);
                      const isSelected = option && selectedOptions[questionKey] === option.id;
                      const showCorrect = !hideFeedback && isChecked && option?.correcta;
                      const showIncorrect =
                        !hideFeedback && isChecked && isSelected && option && !option.correcta;

                      return (
                        <button
                          key={letter}
                          type="button"
                          className={[
                            'a2-p2-choice',
                            isSelected ? 'a2-p2-choice--selected' : '',
                            showCorrect ? 'a2-p2-choice--correct' : '',
                            showIncorrect ? 'a2-p2-choice--wrong' : '',
                            !option ? 'a2-p2-choice--disabled' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          disabled={!option}
                          title={person?.name}
                          onClick={() =>
                            option &&
                            onOptionSelect({ group, groupIndex, option, questionKey })
                          }
                        >
                          <span className="a2-p2-choice__letter">{letter}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!hideFeedback && isChecked ? (
                    <div className="a2-p2-match__feedback">
                      <A2McqFeedback
                        show
                        correctText={correct?.formattedText || correct?.respuesta}
                        hint={aiHintsByKey[questionKey]}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
