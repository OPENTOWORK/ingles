'use client';

import { B2ExamQuestionItem } from '@/components/b2/B2ExamPracticeContent';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { parseA2Part2Profiles } from '@/utils/a2ExamMatching';

/**
 * Parte 1: aviso/mensaje en caja + tres frases A/B/C a la derecha (no MCQ genérico).
 */
export function A2Part1QuestionList({ groups, renderQuestionBlock }) {
  if (!groups?.length) return null;
  return (
    <div className="a2-rw-part1">
      {groups.map((group, groupIndex) => (
        <div key={`a2-p1-${group.questionNumber}-${groupIndex}`} className="a2-rw-part1__row">
          <div className="a2-rw-part1__num">{group.questionNumber}</div>
          <div className="a2-rw-part1__notice">
            {group.stimulusImageUrl ? (
              <img
                src={group.stimulusImageUrl}
                alt=""
                className="a2-rw-part1__notice-img"
              />
            ) : null}
            {group.prompt ? (
              <p className="a2-rw-part1__notice-prompt">{group.prompt}</p>
            ) : null}
            {!group.stimulusImageUrl && (group.questionStem || group.prompt) ? (
              <p className="a2-rw-part1__notice-text">{group.questionStem || group.prompt}</p>
            ) : null}
            {!group.stimulusImageUrl && !group.questionStem && !group.prompt ? (
              <p className="a2-rw-part1__notice-placeholder">Read the notice or message.</p>
            ) : null}
          </div>
          <div className="a2-rw-part1__options">{renderQuestionBlock(group, groupIndex)}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Parte 2: tabla 7–13 × personas A/B/C (Tasha, Danni, Chrissie).
 */
export function A2Part2MatchingGrid({
  groups,
  profileNames,
  getQuestionKey,
  selectedPart,
  selectedOptions,
  checkedQuestions,
  hideFeedback,
  onOptionSelect,
  aiHintsByKey,
}) {
  const names =
    profileNames?.length >= 3
      ? profileNames.slice(0, 3)
      : ['Person A', 'Person B', 'Person C'];

  return (
    <div className="a2-rw-part2-grid-wrap">
      <table className="a2-rw-part2-grid">
        <thead>
          <tr>
            <th className="a2-rw-part2-grid__qcol" />
            {names.map((name, i) => (
              <th key={name} className="a2-rw-part2-grid__person">
                <span className="a2-rw-part2-grid__person-name">{name}</span>
                <span className="a2-rw-part2-grid__person-letter">{String.fromCharCode(65 + i)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group, groupIndex) => {
            const questionKey = getQuestionKey(
              selectedPart.id,
              group.questionNumber,
              `extra-${groupIndex}`,
            );
            const isChecked = checkedQuestions[questionKey];
            const correct = group.options.find((o) => o.correcta);
            const byLetter = {};
            for (const opt of group.options || []) {
              const m = String(opt.formattedText || opt.respuesta || '').match(/^([A-C])\b/i);
              if (m) byLetter[m[1].toUpperCase()] = opt;
            }
            return (
              <tr key={`a2-p2-${group.questionNumber}-${groupIndex}`}>
                <td className="a2-rw-part2-grid__prompt">
                  <span className="a2-rw-part2-grid__qnum">{group.questionNumber}</span>
                  <span>{group.prompt || group.questionStem || ''}</span>
                </td>
                {['A', 'B', 'C'].map((letter) => {
                  const option = byLetter[letter];
                  const isSelected = option && selectedOptions[questionKey] === option.id;
                  const showCorrect = !hideFeedback && isChecked && option?.correcta;
                  const showIncorrect =
                    !hideFeedback && isChecked && isSelected && option && !option.correcta;
                  return (
                    <td key={letter} className="a2-rw-part2-grid__cell">
                      {option ? (
                        <button
                          type="button"
                          className="a2-rw-part2-grid__letter-btn"
                          onClick={() =>
                            onOptionSelect({ group, groupIndex, option, questionKey })
                          }
                          style={{
                            border: showCorrect
                              ? '2px solid #2f855a'
                              : showIncorrect
                                ? '2px solid #c53030'
                                : isSelected
                                  ? '2px solid #3182ce'
                                  : '1px solid #cbd5e0',
                            background: showCorrect
                              ? '#f0fff4'
                              : showIncorrect
                                ? '#fff5f5'
                                : isSelected
                                  ? '#ebf8ff'
                                  : '#fff',
                          }}
                        >
                          {letter}
                        </button>
                      ) : (
                        <span className="a2-rw-part2-grid__letter-muted">{letter}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {groups.map((group, groupIndex) => {
        const questionKey = getQuestionKey(
          selectedPart.id,
          group.questionNumber,
          `extra-${groupIndex}`,
        );
        const isChecked = checkedQuestions[questionKey];
        const correct = group.options.find((o) => o.correcta);
        if (!isChecked || hideFeedback) return null;
        return (
          <div key={`fb-${group.questionNumber}`} style={{ marginTop: '0.5rem' }}>
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

/** Perfiles Parte 2 en panel Text. */
export function A2Part2ProfilesText({ texto }) {
  const profiles = parseA2Part2Profiles(texto);
  if (!profiles.length) {
    return (
      <div className="a2-rw-part2-profiles">
        {texto
          .split('\n')
          .filter(Boolean)
          .map((line, i) => (
            <p key={i} style={{ margin: '0.5rem 0', lineHeight: 1.75 }}>
              {line}
            </p>
          ))}
      </div>
    );
  }
  return (
    <div className="a2-rw-part2-profiles">
      {profiles.map((p) => (
        <div key={p.letter} className="a2-rw-part2-profile">
          <p className="a2-rw-part2-profile__name">
            {p.letter}) {p.name}
          </p>
          <p className="a2-rw-part2-profile__text">{p.text}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Parte 3: pregunta + A/B/C en bloque (frases cortas).
 */
export function A2Part3QuestionList({ groups, renderQuestionBlock }) {
  return (
    <div className="a2-rw-part3">
      {groups.map((group, groupIndex) => (
        <B2ExamQuestionItem key={`a2-p3-${group.questionNumber}-${groupIndex}`}>
          <p className="a2-rw-part3__q">
            <strong>{group.questionNumber}</strong> {group.prompt || group.questionStem || ''}
          </p>
          {renderQuestionBlock(group, groupIndex, { layout: 'stacked-abc' })}
        </B2ExamQuestionItem>
      ))}
    </div>
  );
}

/**
 * Listening Part 8: tres imágenes A/B/C en fila por pregunta.
 */
export function A2ListeningPictureMcq({ groups, renderQuestionBlock }) {
  if (!groups?.length) return null;
  return (
    <div className="a2-listening-pictures">
      {groups.map((group, groupIndex) => (
        <div key={`a2-l8-${group.questionNumber}-${groupIndex}`} className="a2-listening-pictures__item">
          <p className="a2-listening-pictures__stem">
            <strong>{group.questionNumber}.</strong>{' '}
            {group.prompt || group.questionStem || ''}
          </p>
          {renderQuestionBlock(group, groupIndex, { layout: 'listening-pictures' })}
        </div>
      ))}
    </div>
  );
}

/**
 * Parte 4: filas 19–24 con tres palabras en columnas A | B | C.
 */
export function A2Part4ClozeOptions({ groups, renderQuestionBlock }) {
  return (
    <div className="a2-rw-part4-options">
      {groups.map((group, groupIndex) => (
        <div key={`a2-p4-${group.questionNumber}-${groupIndex}`} className="a2-rw-part4-options__row">
          <span className="a2-rw-part4-options__num">{group.questionNumber}</span>
          {renderQuestionBlock(group, groupIndex, { layout: 'cloze-row' })}
        </div>
      ))}
    </div>
  );
}

export function A2McqFeedback({ show, correctText, hint }) {
  if (!show) return null;
  return (
    <>
      <p style={{ margin: '0.7rem 0 0', fontWeight: 600, color: '#1f2937' }}>
        Correct answer: {correctText || 'Not available'}
      </p>
      <LevelsAnswerJustification hint={hint} />
    </>
  );
}

/**
 * Botones MCQ A2 con estilos según parte oficial.
 * @param {{ layout?: 'part1'|'inline-abc'|'stacked-abc'|'cloze-row' }} props
 */
export function A2McqOptionButtons({
  group,
  groupIndex,
  layout = 'stacked-abc',
  getQuestionKey,
  selectedPart,
  selectedOptions,
  checkedQuestions,
  hideFeedback,
  onOptionSelect,
  afterOptions,
}) {
  const wrapClass =
    layout === 'listening-pictures'
      ? 'a2-listening-pictures__options'
      : layout === 'part1'
      ? 'a2-rw-part1__option-list'
      : layout === 'inline-abc'
        ? 'a2-rw-part2-grid__option-list'
        : layout === 'cloze-row'
          ? 'a2-rw-part4-options__words'
          : 'a2-rw-part3__option-list';

  return (
    <>
      <div className={wrapClass}>
        {group.options.map((option) => {
          const questionKey = getQuestionKey(
            selectedPart.id,
            group.questionNumber,
            `extra-${groupIndex}`,
          );
          const isSelected = selectedOptions[questionKey] === option.id;
          const isChecked = checkedQuestions[questionKey];
          const isCorrect = !!option.correcta;
          const showCorrect = !hideFeedback && isChecked && isCorrect;
          const showIncorrect = !hideFeedback && isChecked && isSelected && !isCorrect;

          return (
            <button
              key={option.id}
              type="button"
              className={
                layout === 'cloze-row'
                  ? 'a2-rw-part4-options__word-btn'
                  : layout === 'inline-abc'
                    ? 'a2-rw-part2-grid__letter-btn'
                    : 'a2-mcq-option-btn'
              }
              onClick={() => onOptionSelect({ group, groupIndex, option, questionKey })}
              style={{
                textAlign: layout === 'cloze-row' ? 'center' : 'left',
                borderRadius: layout === 'inline-abc' ? '6px' : '8px',
                padding:
                  layout === 'inline-abc' ? '0.5rem 0.75rem' : layout === 'cloze-row' ? '0.45rem 0.65rem' : '0.75rem 1rem',
                border: showCorrect
                  ? '2px solid #2f855a'
                  : showIncorrect
                    ? '2px solid #c53030'
                    : isSelected
                      ? '2px solid #3182ce'
                      : '1px solid #e2e8f0',
                backgroundColor: showCorrect
                  ? '#f0fff4'
                  : showIncorrect
                    ? '#fff5f5'
                    : isSelected
                      ? '#ebf8ff'
                      : '#fff',
                cursor: 'pointer',
                flex: layout === 'cloze-row' || layout === 'listening-pictures' ? '1' : undefined,
                minWidth: layout === 'inline-abc' ? '2.5rem' : undefined,
                display: layout === 'listening-pictures' ? 'flex' : undefined,
                flexDirection: layout === 'listening-pictures' ? 'column' : undefined,
                alignItems: layout === 'listening-pictures' ? 'center' : undefined,
              }}
            >
              {option.imageUrl ? (
                <>
                  <img
                    src={option.imageUrl}
                    alt=""
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      height: 'auto',
                      marginBottom: '0.35rem',
                      borderRadius: '6px',
                    }}
                  />
                  <span>{option.formattedText || option.respuesta}</span>
                </>
              ) : (
                option.formattedText || option.respuesta
              )}
            </button>
          );
        })}
      </div>
      {afterOptions}
    </>
  );
}
