'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useConfirmedUserRole, useUserRole } from '@/context/UserRoleContext';
import { isAdminRole } from '@/utils/authRoles';
import { getGuestLoginHref } from '@/config/appNavMenu';
import { playTrainingAnswerSound, playTrainingFinishSound } from '@/lib/trainingFeedbackSounds';
import {
  QUIZ_GAME_CATEGORIES,
  QUIZ_GAME_QUESTIONS,
} from '@/data/quizGameQuestions';
import {
  QUIZ_GAME_LIVES,
  QUIZ_GAME_QUESTION_COUNT,
  QUIZ_GAME_SECONDS,
  buildQuizRound,
  readQuizBestScore,
  scoreQuizAnswer,
  writeQuizBestScore,
} from '@/lib/quizGame';
import styles from './QuizGamePage.module.css';

const HUB_HREF = '/exam-practice/b2/';
const FEEDBACK_MS = 1600;

function categoryLabel(id) {
  return QUIZ_GAME_CATEGORIES.find((item) => item.id === id)?.label || 'Mixed';
}

function QuizGate({ children }) {
  const router = useRouter();
  const { session } = useUserRole();
  const { roleConfirmed } = useConfirmedUserRole();

  useEffect(() => {
    if (!roleConfirmed) return;
    if (!session) {
      router.replace(getGuestLoginHref('/exam-practice/b2/quiz-game'));
    }
  }, [roleConfirmed, session, router]);

  if (!roleConfirmed || !session) {
    return (
      <main className={styles.page}>
        <p className={styles.gate}>Checking access…</p>
      </main>
    );
  }

  return children;
}

function LivesRow({ lives }) {
  return (
    <span className={styles.lives} aria-label={`${lives} lives left`}>
      {Array.from({ length: QUIZ_GAME_LIVES }, (_, index) => (
        <span key={index} className={index < lives ? styles.lifeOn : styles.lifeOff} aria-hidden>
          ●
        </span>
      ))}
    </span>
  );
}

export default function QuizGamePage() {
  return (
    <QuizGate>
      <QuizGameBoard />
    </QuizGate>
  );
}

function QuizGameBoard() {
  const { userRole } = useUserRole();
  const showAdminPill = isAdminRole(userRole);
  const [phase, setPhase] = useState('lobby');
  const [category, setCategory] = useState('use-of-english');
  const [round, setRound] = useState([]);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(QUIZ_GAME_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_GAME_SECONDS);
  const [pickedId, setPickedId] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const scoreRef = useRef(0);
  const advancingRef = useRef(false);

  const question = round[index] || null;
  const locked = pickedId != null || timedOut;

  useEffect(() => {
    setBestScore(readQuizBestScore());
  }, []);

  const startRound = useCallback((nextCategory = category) => {
    const nextRound = buildQuizRound(QUIZ_GAME_QUESTIONS, {
      category: nextCategory,
      count: QUIZ_GAME_QUESTION_COUNT,
    });
    setCategory(nextCategory);
    setRound(nextRound);
    setIndex(0);
    setLives(QUIZ_GAME_LIVES);
    scoreRef.current = 0;
    advancingRef.current = false;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSecondsLeft(QUIZ_GAME_SECONDS);
    setPickedId(null);
    setTimedOut(false);
    setAnswers([]);
    setPhase('play');
  }, [category]);

  const finishRound = useCallback((finalScore) => {
    const stored = writeQuizBestScore(finalScore);
    setBestScore(stored);
    playTrainingFinishSound(finalScore >= stored * 0.7 || finalScore >= 700 ? 3 : 1);
    setPhase('results');
  }, []);

  const resolveAnswer = useCallback(
    (optionId, fromTimeout = false) => {
      if (!question || locked) return;
      const option = question.options.find((item) => item.id === optionId) || null;
      const correct = Boolean(option?.correct);
      const nextStreak = correct ? streak + 1 : 0;
      const nextLives = correct ? lives : lives - 1;
      const gained = scoreQuizAnswer({
        correct,
        secondsLeft: fromTimeout ? 0 : secondsLeft,
        streakAfter: nextStreak,
      });

      const nextScore = score + gained;
      playTrainingAnswerSound(correct);
      setPickedId(optionId || '__timeout');
      setTimedOut(fromTimeout);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setLives(nextLives);
      scoreRef.current = nextScore;
      setScore(nextScore);
      setAnswers((list) => [
        ...list,
        {
          id: question.id,
          stem: question.stem,
          why: question.why,
          correct,
          picked: option?.text || (fromTimeout ? 'Time ran out' : 'No answer'),
          answer: question.options.find((item) => item.correct)?.text || '',
        },
      ]);
    },
    [question, locked, streak, lives, secondsLeft],
  );

  const goNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    const lastQuestion = index >= round.length - 1;
    if (lives <= 0 || lastQuestion) {
      finishRound(scoreRef.current);
      return;
    }
    setIndex((value) => value + 1);
    setPickedId(null);
    setTimedOut(false);
    setSecondsLeft(QUIZ_GAME_SECONDS);
    advancingRef.current = false;
  }, [lives, index, round.length, finishRound]);

  useEffect(() => {
    if (phase !== 'play' || locked) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, locked, index]);

  useEffect(() => {
    if (phase !== 'play' || locked || secondsLeft > 0) return;
    resolveAnswer(null, true);
  }, [phase, locked, secondsLeft, resolveAnswer]);

  useEffect(() => {
    if (phase !== 'play' || !locked) return undefined;
    const timer = window.setTimeout(goNext, FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, locked, goNext]);

  useEffect(() => {
    if (phase !== 'play' || locked) return undefined;
    const onKey = (event) => {
      const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
      const optionIndex = map[event.key?.toLowerCase()];
      if (optionIndex == null || !question?.options[optionIndex]) return;
      event.preventDefault();
      resolveAnswer(question.options[optionIndex].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, locked, question, resolveAnswer]);

  const correctCount = answers.filter((item) => item.correct).length;
  const timerPct = Math.max(0, (secondsLeft / QUIZ_GAME_SECONDS) * 100);
  const selectedCategory = useMemo(
    () => QUIZ_GAME_CATEGORIES.find((item) => item.id === category) || QUIZ_GAME_CATEGORIES[0],
    [category],
  );

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.top}>
          <Link href={HUB_HREF} className={styles.back}>
            ← Practice
          </Link>
          {showAdminPill ? <span className={styles.adminPill}>Admin preview</span> : null}
        </header>

        {phase === 'lobby' ? (
          <section className={styles.panel} aria-labelledby="quiz-game-title">
            <p className={styles.eyebrow}>Quiz game</p>
            <h1 id="quiz-game-title" className={styles.title}>
              Beat the clock
            </h1>
            <p className={styles.lead}>
              {QUIZ_GAME_QUESTION_COUNT} questions, {QUIZ_GAME_SECONDS} seconds each, {QUIZ_GAME_LIVES}{' '}
              lives. Same success and fail sounds as Training.
            </p>
            {bestScore > 0 ? <p className={styles.best}>Best score: {bestScore}</p> : null}

            <div className={styles.categories} role="list">
              {QUIZ_GAME_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    styles.category,
                    item.featured ? styles.categoryFeatured : '',
                    category === item.id ? styles.categoryOn : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setCategory(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>

            <button type="button" className={styles.primary} onClick={() => startRound(category)}>
              Start quiz
            </button>
          </section>
        ) : null}

        {phase === 'play' && question ? (
          <section className={styles.panel} aria-labelledby="quiz-question">
            <div className={styles.stats}>
              <LivesRow lives={lives} />
              <span className={styles.stat}>
                {index + 1} / {round.length}
              </span>
              <span className={styles.stat}>Score {score}</span>
              <span className={styles.stat}>Streak {streak}</span>
            </div>
            <div className={styles.timerTrack} aria-hidden>
              <span className={styles.timerFill} style={{ width: `${timerPct}%` }} />
            </div>
            <p className={styles.timerLabel}>{secondsLeft}s · {selectedCategory.label}</p>
            <h1 id="quiz-question" className={styles.question}>
              {question.stem}
            </h1>
            <div className={styles.options}>
              {question.options.map((option, optionIndex) => {
                const isPicked = pickedId === option.id;
                const showCorrect = locked && option.correct;
                const showWrong = locked && isPicked && !option.correct;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={[
                      styles.option,
                      showCorrect ? styles.optionOk : '',
                      showWrong ? styles.optionBad : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={locked}
                    onClick={() => resolveAnswer(option.id)}
                  >
                    <span className={styles.optionKey}>{optionIndex + 1}</span>
                    {option.text}
                  </button>
                );
              })}
            </div>
            {locked ? (
              <div className={styles.feedback}>
                <p className={timedOut || !question.options.some((item) => item.id === pickedId && item.correct)
                  ? styles.feedbackBad
                  : styles.feedbackOk}
                >
                  {timedOut
                    ? "Time's up"
                    : question.options.some((item) => item.id === pickedId && item.correct)
                      ? 'Correct'
                      : 'Not quite'}
                </p>
                <p className={styles.why}>{question.why}</p>
                <button type="button" className={styles.secondary} onClick={goNext}>
                  Continue
                </button>
              </div>
            ) : (
              <p className={styles.hint}>Keys 1–4 also work.</p>
            )}
          </section>
        ) : null}

        {phase === 'results' ? (
          <section className={styles.panel} aria-labelledby="quiz-results">
            <p className={styles.eyebrow}>Round over</p>
            <h1 id="quiz-results" className={styles.title}>
              {correctCount === answers.length && answers.length > 0 ? 'Clean sweep' : 'Nice run'}
            </h1>
            <div className={styles.resultGrid}>
              <div>
                <strong>{score}</strong>
                <span>Score</span>
              </div>
              <div>
                <strong>
                  {correctCount}/{answers.length}
                </strong>
                <span>Correct</span>
              </div>
              <div>
                <strong>{bestStreak}</strong>
                <span>Best streak</span>
              </div>
              <div>
                <strong>{bestScore}</strong>
                <span>Best ever</span>
              </div>
            </div>
            <ol className={styles.review}>
              {answers.map((item) => (
                <li key={item.id} className={item.correct ? styles.reviewOk : styles.reviewBad}>
                  <p>{item.stem}</p>
                  <p>
                    {item.correct ? 'Your answer: ' : 'You chose: '}
                    <strong>{item.picked}</strong>
                    {item.correct ? null : (
                      <>
                        {' · '}
                        Correct: <strong>{item.answer}</strong>
                      </>
                    )}
                  </p>
                  <p>{item.why}</p>
                </li>
              ))}
            </ol>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={() => startRound(category)}>
                Play again
              </button>
              <button type="button" className={styles.secondary} onClick={() => setPhase('lobby')}>
                Change category
              </button>
              <Link href={HUB_HREF} className={styles.linkBtn}>
                Back to Practice
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
