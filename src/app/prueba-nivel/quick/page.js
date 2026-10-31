'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { canViewPlacementAndTraining } from '@/config/appNavMenu';
import PageHero from '@/components/PageHero';
import SiteMascot from '@/components/SiteMascot';
import TestsBranchStyles from '@/components/placement/TestsBranchStyles';
import { landingFont } from '@/components/home/landing/landingFont';
import { useUserRole } from '@/context/UserRoleContext';
import { levelRecommendations } from '@/data/placementTest';
import { PLACEMENT_MIXED_TEST_ID } from '@/lib/placementSupabase';
import {
  QUICK_TEST_QUESTION_COUNT,
  QUICK_TEST_SECONDS,
  countQuickTestCorrect,
  pickQuickTestQuestions,
  quickTestLevelFromScore,
} from '@/lib/quickPlacementTest';

function formatClock(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function QuickPlacementTestPage() {
  const router = useRouter();
  const { session, userRole } = useUserRole();
  const canAccess = canViewPlacementAndTraining(userRole);

  const [phase, setPhase] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUICK_TEST_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) router.push('/login');
  }, [session, router]);

  useEffect(() => {
    if (userRole && !canAccess) router.replace('/niveles/b2');
  }, [userRole, canAccess, router]);

  useEffect(() => {
    if (phase !== 'test') return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'test' && secondsLeft === 0) setPhase('result');
  }, [phase, secondsLeft]);

  const current = questions[index] || null;
  const correct = useMemo(
    () => countQuickTestCorrect(questions, answers),
    [questions, answers],
  );
  const level = useMemo(() => {
    if (phase !== 'result' || questions.length === 0) return null;
    return quickTestLevelFromScore(correct, questions.length);
  }, [phase, correct, questions.length]);
  const recommendation = level ? levelRecommendations[level.cefr] : null;

  async function startTest() {
    if (!session?.access_token || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/placement/questions/?testId=${encodeURIComponent(PLACEMENT_MIXED_TEST_ID)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load questions.');
      const picked = pickQuickTestQuestions(data.questions || [], QUICK_TEST_QUESTION_COUNT);
      if (!picked.length) throw new Error('There are no grammar questions available for this test.');
      setQuestions(picked);
      setAnswers({});
      setIndex(0);
      setSecondsLeft(QUICK_TEST_SECONDS);
      setPhase('test');
    } catch (err) {
      setError(err?.message || 'Could not load questions.');
    } finally {
      setLoading(false);
    }
  }

  function choose(questionId, value) {
    if (phase !== 'test') return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  if (userRole && !canAccess) return null;

  return (
    <main className={`shell content-hub-shell tests-branch niveles-level-page niveles-level-page--b2 ${landingFont.variable}`}>
      <div className="levels-b2-page-content">
        <PageHero
          backHref="/prueba-nivel/"
          backLabel="Tests"
          eyebrow="Tests"
          title="Quick Test"
          description="Ten grammar and vocabulary questions in 5 minutes. The result is an estimate of your level."
          showMascot
          mascotVariant={2}
          mascotWidth={120}
          accent="violet"
        />

        {!session ? (
          <p>Loading…</p>
        ) : phase === 'intro' ? (
          <section className="tests-intro">
            <p className="tests-kicker">Quick Test</p>
            <h2 className="tests-intro__title">Ready for a 5-minute check?</h2>
            <p className="tests-intro__lead">
              The clock starts when you press the button. Questions are drawn at
              random from the placement grammar bank. This sample does not replace
              the full Placement Test.
            </p>
            <ul className="tests-intro__stats">
              <li>
                <strong>{QUICK_TEST_QUESTION_COUNT}</strong>
                <span>questions</span>
              </li>
              <li>
                <strong>5:00</strong>
                <span>minutes</span>
              </li>
            </ul>
            {error ? <p className="tests-intro__error">{error}</p> : null}
            <button type="button" className="tests-start" onClick={startTest} disabled={loading}>
              {loading ? 'Preparing test…' : 'Start Quick Test'}
            </button>
          </section>
        ) : phase === 'test' && current ? (
          <div>
            <div className="tests-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span>
                  Question <strong>{index + 1}</strong> of {questions.length}
                </span>
                <span style={{ color: secondsLeft <= 30 ? '#b91c1c' : 'inherit' }}>
                  {formatClock(secondsLeft)}
                </span>
              </div>
              <h2 style={{ marginTop: '1rem' }}>{current.text}</h2>
              <div style={{ display: 'grid', gap: '0.7rem', marginTop: '1rem' }}>
                {current.options.map((option, optionIndex) => {
                  const selected = answers[current.id] === option;
                  return (
                    <label key={`${option}-${optionIndex}`} className={`opt ${selected ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name={`q-${current.id}`}
                        value={option}
                        checked={selected}
                        onChange={() => choose(current.id, option)}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              <div className="tests-actions" style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                >
                  Previous
                </button>
                {index === questions.length - 1 ? (
                  <button type="button" className="btn btn-primary" onClick={() => setPhase('result')}>
                    Finish
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : phase === 'result' && level ? (
          <>
            <section className="tests-panel">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <SiteMascot variant={7} width={96} alt="" />
                <div>
                  <p className="tests-kicker">Estimated level</p>
                  <h2 style={{ margin: '0.2rem 0' }}>{level.cefr}</h2>
                  <p>{recommendation?.title || level.outcomesLevel}</p>
                  <p>
                    Score: <strong>{level.correct}</strong> / {level.total}
                    {secondsLeft === 0 ? ' · time is up' : ''}
                  </p>
                  <p>This is a 5-minute sample. The full Placement Test is the detailed check.</p>
                  <div className="tests-actions">
                    <Link href="/prueba-nivel/placement" className="btn btn-primary">
                      Full Placement Test
                    </Link>
                    <button type="button" className="btn" onClick={() => setPhase('intro')}>
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </section>
            <section className="tests-panel">
              <h3>Your answers</h3>
              <ol>
                {questions.map((question, i) => {
                  const given = String(answers[question.id] ?? '').trim();
                  const expected = String(question.answer ?? '').trim();
                  const ok = given === expected;
                  return (
                    <li key={question.id} style={{ marginTop: '0.8rem' }}>
                      <p>
                        {i + 1}. {question.text}
                      </p>
                      <p style={{ color: ok ? '#15803d' : '#b91c1c' }}>
                        {given ? `Your answer: ${given}` : 'No answer'}
                        {ok ? '' : ` · Correct: ${expected}`}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>
          </>
        ) : (
          <p>Loading…</p>
        )}
      </div>
      <TestsBranchStyles />
    </main>
  );
}
