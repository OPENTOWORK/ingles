'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TrainingDraloCompanion from '@/components/training/TrainingDraloCompanion';
import {
  ClassifyBoard,
  ItemExtras,
  MatchBoard,
  MultiPick,
  OptionAudio,
  RichText,
  SelectGapText,
  SequenceBoard,
  ShortAnswer,
  SlotBoard,
  TokenPicker,
  TypedGapText,
} from '@/components/training/TrainingItemWidgets';
import TrainingStarsCelebration from '@/components/training/TrainingStarsCelebration';
import { playTrainingAnswerSound, playTrainingFinishSound } from '@/lib/trainingFeedbackSounds';
import {
  formatTrainingSolution,
  gradeTrainingItem,
  parseGapFillSentence,
  summariseGapFillErrors,
} from '@/lib/trainingGapFillGrading';
import {
  TRAINING_TYPE_FORMATS,
  canSubmitTrainingItem,
  isTrainingListeningItem,
  trainingDisplayOrder,
  trainingFormatFamily,
  trainingItemPromptText,
  trainingSolutionLines,
} from '@/lib/trainingItemFormats';
import { expandItem } from '@/lib/trainingQuestionVariants';
import { saveExerciseResult } from '@/utils/progressTracker';
import { saveTrainingLevelStars } from '@/utils/trainingStarsProgress';
import styles from './TrainingGapFillExercise.module.css';

const MAX_ATTEMPTS = 1;

/** Same thresholds as the rest of the training path. */
function starsForAccuracy(accuracy) {
  if (accuracy === 100) return 3;
  if (accuracy >= 80) return 2;
  if (accuracy >= 60) return 1;
  return 0;
}

/** 100 if the answer is right, 0 when the solution has to be shown. */
function scoreForResult({ firstTry, solved }) {
  if (firstTry) return 100;
  return solved ? 50 : 0;
}

function itemFormat(item) {
  return item?.format || 'gap';
}

const SESSION_SIZE = 10;

const TEXT_PLACEHOLDERS = {
  dictation: 'Type what you hear',
  translate_to_english: 'Write it in English',
  translate_to_spanish: 'Write it in Spanish',
};

/** True/False keeps its order; every other new choice type is shown shuffled. */
const SHUFFLED_CHOICE_FORMATS = new Set(TRAINING_TYPE_FORMATS.filter((format) => format !== 'listen_true_false'));

function shuffle(list) {
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/** A normal level asks 10. A review asks however many `size` says. */
function pickSession(list, size = SESSION_SIZE) {
  const usedFormats = new Set();
  return shuffle(shuffle(list).slice(0, size)).map((item) => {
    const variants = expandItem(item);
    const fresh = variants.filter((variant) => !usedFormats.has(itemFormat(variant)));
    const pool = fresh.length ? fresh : variants;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedFormats.add(itemFormat(chosen));
    return { ...chosen, displaySeed: Math.random().toString(36).slice(2) };
  });
}

function GapSentence({ item, values, onChange, disabled, inputRef, onSubmit, gapStates }) {
  const parts = useMemo(() => parseGapFillSentence(item.sentence), [item.sentence]);

  return (
    <p className={styles.sentence}>
      {parts.map((part, position) =>
        part.type === 'text' ? (
          <span key={`t-${position}`}>{part.value}</span>
        ) : (
          <input
            key={`g-${part.index}`}
            ref={part.index === 1 ? inputRef : null}
            type="text"
            className={`${styles.gapInput} ${gapStates[part.index] || ''}`}
            value={values[part.index] ?? ''}
            onChange={(event) => onChange(part.index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit();
              }
            }}
            disabled={disabled}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-label={`Gap ${part.index}`}
          />
        ),
      )}
    </p>
  );
}

/**
 * Typed gap-fill runner for one level of the grammar path.
 *
 * @param {{
 *   exercise: { exerciseId: string, instruction: string, items: object[] },
 *   sectionTitle: string,
 *   topicLabel: string,
 *   levelNumber: string,
 *   levelNum: number,
 *   backHref: string,
 *   cefrLevel: string,
 *   skill: string,
 *   difficulty: string,
 *   userId?: string | null,
 * }} props
 */
export default function TrainingGapFillExercise({
  exercise,
  sectionTitle,
  topicLabel,
  levelNumber,
  levelNum,
  backHref,
  cefrLevel,
  skill,
  difficulty,
  userId = null,
  completeLabel = '',
  sessionSize = SESSION_SIZE,
}) {
  const [items] = useState(() => pickSession(exercise.items, sessionSize));
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState({});
  const [attempt, setAttempt] = useState(1);
  /** 'answering' | 'correct' | 'retry' | 'revealed' */
  const [status, setStatus] = useState('answering');
  const [draloReaction, setDraloReaction] = useState(0);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [celebration, setCelebration] = useState(null);

  const firstGapRef = useRef(null);
  const itemStartRef = useRef(Date.now());
  const savedStarsRef = useRef(false);

  const item = items[index];
  const total = items.length;

  useEffect(() => {
    itemStartRef.current = Date.now();
    firstGapRef.current?.focus();
  }, [index]);

  const grade = useMemo(
    () => (status === 'answering' ? null : gradeTrainingItem(item, values)),
    [status, item, values],
  );

  const gapStates = useMemo(() => {
    if (!grade) return {};
    /** On the retry only the wrong gaps are marked: nothing is confirmed yet. */
    if (status === 'retry') {
      return Object.fromEntries(
        grade.gaps.filter((gap) => !gap.correct).map((gap) => [gap.index, styles.gapWrong]),
      );
    }
    return Object.fromEntries(
      grade.gaps.map((gap) => [gap.index, gap.correct ? styles.gapOk : styles.gapWrong]),
    );
  }, [grade, status]);

  const readyToCheck = canSubmitTrainingItem(item, values);
  const format = itemFormat(item);
  const family = trainingFormatFamily(item);
  const locked = status === 'correct' || status === 'revealed';

  const gapMarks = useMemo(() => {
    if (!grade) return {};
    if (status === 'retry') {
      return Object.fromEntries(grade.gaps.filter((gap) => !gap.correct).map((gap) => [gap.index, 'wrong']));
    }
    return Object.fromEntries(grade.gaps.map((gap) => [gap.index, gap.correct ? 'ok' : 'wrong']));
  }, [grade, status]);

  const optionOrder = useMemo(() => {
    const count = family === 'choice' ? item?.options?.length || 0 : 0;
    if (!SHUFFLED_CHOICE_FORMATS.has(format)) return Array.from({ length: count }, (_, position) => position);
    return trainingDisplayOrder(item, count, 'options');
  }, [item, family, format]);

  const updateValues = useCallback(
    (next) => {
      setValues(next);
      if (status === 'retry') setStatus('answering');
    },
    [status],
  );

  const recordResult = useCallback(
    (result) => {
      setResults((current) => [...current, result]);
      if (!userId) return;
      const timeSpent = Math.round((Date.now() - itemStartRef.current) / 1000);
      void saveExerciseResult(
        userId,
        result.item.id,
        scoreForResult(result),
        timeSpent,
        result.attempts,
      ).catch(() => {});
    },
    [userId],
  );

  const checkAnswer = useCallback(() => {
    if (status === 'correct' || status === 'revealed') return;
    if (!readyToCheck) return;

    const outcome = gradeTrainingItem(item, values);
    if (outcome.correct) {
      playTrainingAnswerSound(true);
      setStatus('correct');
      setDraloReaction((n) => n + 1);
      recordResult({ item, answers: { ...values }, firstTry: attempt === 1, solved: true, attempts: attempt });
      return;
    }

    playTrainingAnswerSound(false);

    if (attempt < MAX_ATTEMPTS) {
      setAttempt(attempt + 1);
      setStatus('retry');
      setDraloReaction((n) => n + 1);
      return;
    }

    setStatus('revealed');
    setDraloReaction((n) => n + 1);
    recordResult({ item, answers: { ...values }, firstTry: false, solved: false, attempts: attempt });
  }, [status, readyToCheck, item, values, attempt, recordResult]);

  const correctCount = results.filter((result) => result.firstTry).length;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const stars = starsForAccuracy(accuracy);

  const goNext = useCallback(() => {
    if (index < total - 1) {
      setIndex(index + 1);
      setValues({});
      setAttempt(1);
      setStatus('answering');
      return;
    }
    setFinished(true);
    playTrainingFinishSound(stars);
  }, [index, total, stars]);
  const mistakes = results.filter((result) => !result.firstTry);
  const errorAreas = useMemo(
    () => summariseGapFillErrors(mistakes.map((result) => result.item)),
    [mistakes],
  );

  useEffect(() => {
    if (!finished || savedStarsRef.current) return;
    savedStarsRef.current = true;

    const { previous, saved } = saveTrainingLevelStars({
      cefrLevel,
      skill,
      difficulty,
      levelNumber,
      stars,
    });
    if (saved || stars > 0) {
      setCelebration({ stars, improved: saved && stars > previous });
    }
  }, [finished, stars, cefrLevel, skill, difficulty, levelNumber]);

  const restart = () => {
    setIndex(0);
    setValues({});
    setAttempt(1);
    setStatus('answering');
    setResults([]);
    setFinished(false);
    setReviewing(false);
    setCelebration(null);
    savedStarsRef.current = false;
  };

  const backLink = (
    <Link href={backHref} className={styles.backLink} data-quiet-nav="">
      <svg className={styles.backIcon} viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M12.5 5 7.5 10l5 5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Grammar path
    </Link>
  );

  const eyebrow = (
    <h1 className={styles.eyebrow}>
      <span className={styles.eyebrowSection}>{sectionTitle}</span>
      <span className={styles.eyebrowDot} aria-hidden>
        ·
      </span>
      <span className={styles.eyebrowTopic}>{topicLabel}</span>
    </h1>
  );

  const header = (
    <header className={styles.header}>
      {backLink}
      {eyebrow}
    </header>
  );

  const draloMood =
    status === 'correct' ? 'correct' : status === 'revealed' || status === 'retry' ? 'wrong' : 'idle';
  const instruction =
    item?.instruction ||
    (format === 'gap'
      ? 'Complete the sentence with the correct form of the verb in brackets.'
      : exercise.instruction);
  const solutionLines = locked ? trainingSolutionLines(item) : [];

  if (finished) {
    return (
      <main className={styles.page}>
        <TrainingDraloCompanion
          mood={stars >= 2 ? 'correct' : 'wrong'}
          reactionKey={draloReaction}
        />
        {celebration ? (
          <TrainingStarsCelebration
            stars={celebration.stars}
            levelNum={levelNum}
            levelLabel={completeLabel}
            badge={completeLabel ? 'Review complete' : 'Level complete'}
            topicLabel={topicLabel}
            improved={celebration.improved}
            onClose={() => setCelebration(null)}
          />
        ) : null}

        <div className={styles.shell}>
          <section className={styles.card}>
            {header}

            <h2 className={styles.summaryTitle}>Exercise complete</h2>
            <p className={styles.score}>
              Score: {correctCount} / {total}
            </p>
            <div className={styles.stars} aria-label={`${stars} of 3 stars`}>
              {[1, 2, 3].map((star) => (
                <span key={star} className={star <= stars ? styles.starOn : styles.starOff}>
                  ★
                </span>
              ))}
            </div>

            <ul className={styles.tally}>
              <li>
                <strong>{correctCount}</strong> correct first time
              </li>
              <li>
                <strong>{mistakes.length}</strong> incorrect
              </li>
            </ul>

            {errorAreas.length ? (
              <div className={styles.areas}>
                <p className={styles.areasTitle}>Grammar areas to review</p>
                <ul className={styles.areaList}>
                  {errorAreas.map((area) => (
                    <li key={area.tag}>
                      {area.label} <span className={styles.areaCount}>×{area.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={styles.allRight}>No mistakes — every gap right first time.</p>
            )}

            {reviewing && mistakes.length ? (
              <ol className={styles.review}>
                {mistakes.map((result) => (
                  <li key={result.item.itemId} className={styles.reviewItem}>
                    <p className={styles.reviewSentence}>
                      {(result.item.format || 'gap') === 'gap'
                        ? parseGapFillSentence(result.item.sentence).map((part, position) =>
                            part.type === 'text' ? (
                              <span key={`t-${position}`}>{part.value}</span>
                            ) : (
                              <strong key={`g-${part.index}`} className={styles.reviewGap}>
                                {result.item.gaps[part.index - 1].canonicalAnswer}
                              </strong>
                            ),
                          )
                        : trainingItemPromptText(result.item)}
                    </p>
                    <p className={styles.reviewMeta}>
                      Answer:{' '}
                      <em>
                        <RichText text={formatTrainingSolution(result.item)} />
                      </em>
                    </p>
                    <p className={styles.reviewExplanation}>{result.item.explanation}</p>
                  </li>
                ))}
              </ol>
            ) : null}

            <div className={styles.actions}>
              {mistakes.length ? (
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setReviewing((current) => !current)}
                >
                  {reviewing ? 'Hide mistakes' : 'Review mistakes'}
                </button>
              ) : null}
              <button type="button" className={styles.retryBtn} onClick={restart}>
                Try again
              </button>
              <Link href={backHref} className={styles.backBtn}>
                Back to path
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <header className={styles.header}>
            {backLink}
            <div className={styles.titleRow}>
              {eyebrow}
              <p className={styles.progressLabel}>
                Question {index + 1} of {total}
              </p>
            </div>
          </header>

          <div className={styles.body}>
            <ItemExtras key={`extras-${index}`} item={item} collapsed={locked} />

            {format === 'gap' ? (
              <GapSentence
                item={item}
                values={values}
                gapStates={gapStates}
                disabled={status === 'correct' || status === 'revealed'}
                inputRef={firstGapRef}
                onSubmit={checkAnswer}
                onChange={(gapIndex, value) => {
                  setValues((current) => ({ ...current, [gapIndex]: value }));
                  if (status === 'retry') setStatus('answering');
                }}
              />
            ) : family === 'gaps' ? (
              <TypedGapText
                key={`gaps-${index}`}
                item={item}
                values={values}
                marks={gapMarks}
                disabled={locked}
                collapsed={locked}
                inputRef={firstGapRef}
                onSubmit={checkAnswer}
                onChange={(gapIndex, value) => updateValues((current) => ({ ...current, [gapIndex]: value }))}
              />
            ) : family === 'select_gaps' ? (
              <SelectGapText
                key={`select-${index}`}
                item={item}
                values={values}
                marks={gapMarks}
                disabled={locked}
                collapsed={locked}
                onChange={(gapIndex, value) => updateValues((current) => ({ ...current, [gapIndex]: value }))}
              />
            ) : item.sentence ? (
              <p className={styles.sentence} lang={item.sourceLanguage}>
                <RichText text={item.sentence} />
              </p>
            ) : null}

            {family === 'text' ? (
              <textarea
                className={styles.rewrite}
                value={values.text || ''}
                onChange={(event) => updateValues({ text: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    checkAnswer();
                  }
                }}
                disabled={locked}
                rows={3}
                placeholder={TEXT_PLACEHOLDERS[format] || 'Write your sentence'}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Your sentence"
              />
            ) : null}

            {family === 'short_text' ? (
              <ShortAnswer
                key={`short-${index}`}
                item={item}
                value={values.text || ''}
                mark={locked ? (grade?.correct ? 'ok' : 'wrong') : ''}
                disabled={locked}
                inputRef={firstGapRef}
                onSubmit={checkAnswer}
                onChange={(text) => updateValues({ text })}
              />
            ) : null}

            {format === 'order' ? (
              <div className={styles.orderBlock}>
                <p className={styles.built}>
                  {(values.sequence || []).map((wordIndex) => item.words[wordIndex]).join(' ') ||
                    '…'}
                </p>
                <div className={styles.wordBank}>
                  {item.words.map((word, wordIndex) => {
                    const used = (values.sequence || []).includes(wordIndex);
                    return (
                      <button
                        key={`${word}-${wordIndex}`}
                        type="button"
                        className={used ? styles.wordUsed : styles.word}
                        disabled={used || status === 'correct' || status === 'revealed'}
                        onClick={() => {
                          setValues((current) => ({
                            sequence: [...(current.sequence || []), wordIndex],
                          }));
                          if (status === 'retry') setStatus('answering');
                        }}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className={styles.undo}
                  onClick={() =>
                    setValues((current) => ({ sequence: (current.sequence || []).slice(0, -1) }))
                  }
                  disabled={!(values.sequence || []).length || status === 'correct' || status === 'revealed'}
                >
                  Undo
                </button>
              </div>
            ) : null}

            {family === 'sequence' ? (
              <SequenceBoard
                key={`sequence-${index}`}
                item={item}
                sequence={values.sequence || []}
                onChange={(sequence) => updateValues({ sequence })}
                disabled={locked}
                showKey={locked}
                collapsed={locked}
              />
            ) : null}

            {family === 'tap' ? (
              <TokenPicker
                key={`tap-${index}`}
                item={item}
                value={values.token}
                onPick={(token) => updateValues({ token })}
                disabled={locked}
                showKey={locked}
              />
            ) : null}

            {family === 'multi' ? (
              <MultiPick
                key={`multi-${index}`}
                item={item}
                picked={values.picked || []}
                onToggle={(id) =>
                  updateValues((current) => {
                    const picked = current.picked || [];
                    return { picked: picked.includes(id) ? picked.filter((value) => value !== id) : [...picked, id] };
                  })
                }
                disabled={locked}
                showKey={locked}
                collapsed={locked}
              />
            ) : null}

            {family === 'match' ? (
              <MatchBoard
                key={`match-${index}`}
                item={item}
                pairs={values.pairs || {}}
                onChange={(pairs) => updateValues({ pairs })}
                disabled={locked}
                showKey={locked}
                collapsed={locked}
              />
            ) : null}

            {family === 'classify' ? (
              <ClassifyBoard
                key={`classify-${index}`}
                item={item}
                assign={values.assign || {}}
                onChange={(assign) => updateValues({ assign })}
                disabled={locked}
                showKey={locked}
                collapsed={locked}
              />
            ) : null}

            {family === 'slots' ? (
              <SlotBoard
                key={`slots-${index}`}
                item={item}
                slots={values.slots || {}}
                onChange={(slots) => updateValues({ slots })}
                disabled={locked}
                showKey={locked}
                collapsed={locked}
              />
            ) : null}

            {family === 'choice' ? (
              <div className={styles.options} role="listbox" aria-label="Answers">
                {optionOrder.map((optionIndex) => {
                  const option = item.options[optionIndex];
                  const picked = values.selected === option.id;
                  const showKey = status === 'correct' || status === 'revealed';
                  const isKey = option.id === item.correctId;
                  const optionClass = showKey
                    ? isKey
                      ? styles.optionOk
                      : picked
                        ? styles.optionBad
                        : styles.option
                    : picked
                      ? styles.optionOn
                      : styles.option;
                  return (
                    <OptionAudio key={option.id} text={option.text} show={format === 'odd_sound' && showKey}>
                      <button
                        type="button"
                        className={optionClass}
                        disabled={showKey}
                        onClick={() => {
                          setValues({ selected: option.id });
                          if (status === 'retry') setStatus('answering');
                        }}
                      >
                        <RichText text={option.text} />
                      </button>
                    </OptionAudio>
                  );
                })}
              </div>
            ) : null}

            {item.promptWord ? <p className={styles.promptWord}>({item.promptWord})</p> : null}

            <div className={styles.mascotSlot}>
              <TrainingDraloCompanion
                mood={draloMood}
                dock
                prompt={instruction}
                reactionKey={draloReaction}
              />
            </div>

            {status === 'answering' || status === 'retry' ? (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={checkAnswer}
                disabled={!readyToCheck}
              >
                Check answer
              </button>
            ) : null}

            {status === 'retry' ? (
              <div className={`${styles.feedback} ${styles.feedbackRetry}`} role="status">
                <p className={styles.feedbackTitle}>Not quite — try again</p>
                <p className={styles.feedbackText}>
                  Have another look at the sentence. You have one more attempt.
                </p>
              </div>
            ) : null}

            {status === 'correct' || status === 'revealed' ? (
              <div
                className={`${styles.feedback} ${
                  status === 'correct' ? styles.feedbackOk : styles.feedbackWrong
                }`}
                role="status"
              >
                <p className={styles.feedbackTitle}>
                  {status === 'correct' ? '✓ Correct' : '✗ Not quite'}
                </p>
                {status === 'revealed' ? (
                  solutionLines.length > 1 ? (
                    <div className={styles.solution}>
                      Answer:
                      <ul className={styles.solutionList}>
                        {solutionLines.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className={styles.solution}>
                      Answer:{' '}
                      <strong>
                        <RichText text={formatTrainingSolution(item)} />
                      </strong>
                    </p>
                  )
                ) : null}
                {isTrainingListeningItem(item) ? (
                  <p className={styles.transcript}>You heard: “{item.audio}”</p>
                ) : null}
                <p className={styles.feedbackText}>{item.explanation}</p>
                <div className={styles.actions}>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    {index < total - 1 ? 'Continue →' : 'See results'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
