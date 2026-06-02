'use client';

import { A2McqFeedback } from '@/components/a2/A2ExamReadingUi';
import { A2_RW_DIRECTIONS } from '@/data/a2-key-official-spec';
import { parseA2Part2Profiles, parseA2Part2TextIntro } from '@/utils/a2ExamMatching';

const LETTERS = ['A', 'B', 'C'];

/**
 * Parte 2 A2 Key — perfiles (Young blog writers) + tabla 7–13 en marco (estilo QP).
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

  const directionLines = String(directions || A2_RW_DIRECTIONS[2] || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const partTitle = directionLines[0]?.toLowerCase() === 'part 2' ? directionLines[0] : 'Part 2';
  const bodyLines =
    directionLines[0]?.toLowerCase() === 'part 2' ? directionLines.slice(1) : directionLines;

  const people =
    profiles.length >= 3
      ? profiles.slice(0, 3)
      : LETTERS.map((letter, i) => ({
          letter,
          name: profileNames[i] || `Person ${letter}`,
          text: '',
        }));

  const sortedGroups = [...groups].sort(
    (a, b) => Number(a.questionNumber) - Number(b.questionNumber),
  );

  return (
    <div className="a2-p2-paper">
      <header className="a2-p2-paper__header">
        <h3 className="a2-p2-paper__part-title">{partTitle}</h3>
        <div className="a2-p2-paper__directions">
          {bodyLines.length ? (
            bodyLines.map((line, i) => (
              <p
                key={i}
                className={/^Questions\s/i.test(line) ? 'a2-p2-paper__directions-range' : ''}
              >
                {line}
              </p>
            ))
          ) : (
            <p>For each question, choose the correct answer.</p>
          )}
        </div>
        <hr className="a2-p2-paper__rule" />
      </header>

      <section className="a2-p2-profiles" aria-label="Reading text">
        {(title || subtitle) && (
          <div className="a2-p2-profiles__intro">
            {title ? <h4 className="a2-p2-profiles__title">{title}</h4> : null}
            {subtitle ? <p className="a2-p2-profiles__subtitle">{subtitle}</p> : null}
          </div>
        )}
        <div className="a2-p2-profiles__grid">
          {people.map((p) => (
            <article key={p.letter} className="a2-p2-profile-card">
              <div className="a2-p2-profile-card__photo" aria-hidden="true">
                <span>Photo</span>
              </div>
              <div className="a2-p2-profile-card__body">
                <div className="a2-p2-profile-card__head">
                  <span className="a2-p2-profile-card__name">{p.name}</span>
                </div>
                {p.text ? (
                  <p className="a2-p2-profile-card__text">{p.text}</p>
                ) : (
                  <p className="a2-p2-profile-card__text a2-p2-profile-card__text--empty">
                    Read the text for this person in your exam materials.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="a2-p2-match-box" aria-label="Questions 7 to 13">
        <table className="a2-p2-official-table">
          <thead>
            <tr>
              <th className="a2-p2-official-table__qcol" scope="col" />
              {people.map((p) => (
                <th key={p.letter} className="a2-p2-official-table__person" scope="col">
                  <span className="a2-p2-official-table__person-name">{p.name}</span>
                  <span className="a2-p2-official-table__person-letter">{p.letter}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedGroups.map((group, groupIndex) => {
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
                <tr key={`a2-p2-q-${group.questionNumber}-${groupIndex}`}>
                  <td className="a2-p2-official-table__prompt">
                    <span className="a2-p2-official-table__qnum">{group.questionNumber}</span>
                    <span className="a2-p2-official-table__qtext">
                      {group.prompt || group.questionStem || ''}
                    </span>
                  </td>
                  {LETTERS.map((letter) => {
                    const option = byLetter[letter];
                    const isSelected = option && selectedOptions[questionKey] === option.id;
                    const showCorrect = !hideFeedback && isChecked && option?.correcta;
                    const showIncorrect =
                      !hideFeedback && isChecked && isSelected && option && !option.correcta;

                    return (
                      <td key={letter} className="a2-p2-official-table__cell">
                        {option ? (
                          <button
                            type="button"
                            className={[
                              'a2-p2-official-table__btn',
                              isSelected ? 'a2-p2-official-table__btn--selected' : '',
                              showCorrect ? 'a2-p2-official-table__btn--correct' : '',
                              showIncorrect ? 'a2-p2-official-table__btn--wrong' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            aria-label={`Question ${group.questionNumber}, ${letter} ${people.find((x) => x.letter === letter)?.name || ''}`}
                            onClick={() =>
                              onOptionSelect({ group, groupIndex, option, questionKey })
                            }
                          >
                            {letter}
                          </button>
                        ) : (
                          <span className="a2-p2-official-table__btn-muted">{letter}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {sortedGroups.map((group, groupIndex) => {
        const questionKey = getQuestionKey(
          selectedPart.id,
          group.questionNumber,
          `p2-fb-${groupIndex}`,
        );
        const isChecked = checkedQuestions[questionKey];
        const correct = group.options?.find((o) => o.correcta);
        if (!isChecked || hideFeedback) return null;
        return (
          <div key={`a2-p2-fb-${group.questionNumber}`} className="a2-p2-match__feedback">
            <span className="a2-p2-match__feedback-label">Question {group.questionNumber}: </span>
            <A2McqFeedback
              show
              correctText={correct?.formattedText || correct?.respuesta}
              hint={aiHintsByKey[questionKey]}
            />
          </div>
        );
      })}
    </div>
  );
}
