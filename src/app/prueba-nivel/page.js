'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { usePlacementAccess } from '@/context/PlacementAccessContext';
import SiteMascot from '@/components/SiteMascot';
import StudyPlanSurvey from '@/components/plan-objetivos/StudyPlanSurvey';
import StudyPlanSurveyAnswers from '@/components/plan-objetivos/StudyPlanSurveyAnswers';
import { levelRecommendations } from '@/data/placementTest';
import {
  computeOutcomesPlacementResults,
  outcomesCefrForTraining,
} from '@/lib/placementOutcomesScoring';
import {
  PLACEMENT_ESTIMATED_MINUTES,
  PLACEMENT_EXAM2_EXPECTED_QUESTIONS,
  PLACEMENT_MIXED_TEST_ID,
  PLACEMENT_MIXED_TOTAL,
  PLACEMENT_PARTS,
  finalizePlacementQuestions,
  getPlacementPartDefsFromQuestions,
  getPlacementPartStartIndex,
  getPlacementStorageKey,
  getSharedReadingPassageForPart2,
  isPlacementMixedTestId,
  summarizePlacementParts,
} from '@/lib/placementSupabase';

/**
 * Versión con nivel CEFR, progreso legible y mejoras de UX.
 * Cambios solicitados:
 *  - Visual de opción seleccionada antes de enviar (clase .opt.selected)
 *  - Sin “Ir a la primera sin responder”
 *  - Sin “Saltar a sin responder”
 *  - Sin redirección automática al terminar
 */

const STORAGE_VERSION = 24;

function clearStalePlacementCache(testId) {
  if (typeof window === 'undefined' || !testId) return;
  const prefixes = [
    'placement.v12.',
    'placement.v13.',
    'placement.v14.',
    'placement.v15.',
    'placement.v16.',
    'placement.v17.',
    'placement.v18.',
    'placement.v19.',
    'placement.v20.',
    'placement.v21.',
    'placement.v22.',
    'placement.v23.',
  ];
  for (const prefix of prefixes) {
    try {
      localStorage.removeItem(`${prefix}${testId}`);
    } catch {
      /* ignore */
    }
  }
}

function isStructuredPlacementTestLabel(label) {
  return /test\s*[23]|examen\s*[23]|placement\s*[23]/i.test(String(label || ''));
}

function shouldIgnorePlacementCache(saved, testId) {
  if (!saved?.questions?.length) return true;
  if (isPlacementMixedTestId(testId)) {
    return !saved.mixed;
  }
  if (
    testId === PLACEMENT_EXAM2_TEST_ID ||
    isStructuredPlacementTestLabel(saved.examLabel)
  ) {
    const part2 = saved.questions.filter((q) => q.part === 2);
    if (
      testId === PLACEMENT_EXAM2_TEST_ID &&
      saved.questions.length < PLACEMENT_EXAM2_EXPECTED_QUESTIONS
    ) {
      return true;
    }
    if (part2.length === 0) return true;
  }
  const part2 = saved.questions.filter((q) => q.part === 2);
  if (!part2.length) return false;
  const passage = part2.find((q) => q.readingPassage?.trim())?.readingPassage;
  return !passage || passage.length < 80;
}

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function PlacementTestPage() {
  const router = useRouter();
  const { session } = useUserRole();
  const { refreshPlacementAccess, hasPlacementResult, loading: placementAccessLoading } =
    usePlacementAccess();

  // Estado principal
  const [answers, setAnswers] = useState({}); // { [qid]: value }
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [index, setIndex] = useState(0); // índice de pregunta activa
  const [cancelAuto, setCancelAuto] = useState(false); // (se queda por compatibilidad)
  const [selectedTestId, setSelectedTestId] = useState(PLACEMENT_MIXED_TEST_ID);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [writingTopics, setWritingTopics] = useState({});
  const [writingEval, setWritingEval] = useState(null);
  const [writingEvalError, setWritingEvalError] = useState('');
  const [evaluatingWriting, setEvaluatingWriting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  const topRef = useRef(null);
  const placementSaveAttemptedRef = useRef(false);
  const [placementSaved, setPlacementSaved] = useState(false);
  const [placementSaveError, setPlacementSaveError] = useState('');
  const [savingPlacement, setSavingPlacement] = useState(false);
  const [saveRetryTick, setSaveRetryTick] = useState(0);
  const [studyPlan, setStudyPlan] = useState(null);
  const [studyPlanChecked, setStudyPlanChecked] = useState(false);
  const [showStudyPlanSurvey, setShowStudyPlanSurvey] = useState(false);
  const writingQuestion = useMemo(
    () => questions.find((q) => q.type === 'writing') || null,
    [questions],
  );
  const mixedExamMeta = useMemo(
    () => ({
      id: PLACEMENT_MIXED_TEST_ID,
      label: 'Placement Test',
      totalQuestions: PLACEMENT_MIXED_TOTAL,
      estimatedMinutes: PLACEMENT_ESTIMATED_MINUTES,
      parts: PLACEMENT_PARTS,
    }),
    [],
  );

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  const total = questions.length;

  const introParts = useMemo(() => {
    if (questions.length > 0) {
      return summarizePlacementParts(questions);
    }
    return PLACEMENT_PARTS;
  }, [questions]);

  const introTotalQuestions =
    questions.length > 0 ? total : mixedExamMeta.totalQuestions;
  const introTotalMinutes = useMemo(
    () =>
      introParts.reduce((sum, p) => sum + p.estimatedMinutes, 0) ||
      PLACEMENT_ESTIMATED_MINUTES,
    [introParts],
  );

  const fetchQuestions = useCallback(
    async ({ testId, forceNew = false, restoreOnly = false } = {}) => {
      if (!session?.access_token || !testId) return [];

      setLoadingQuestions(true);
      setLoadError('');

      const storageKey = getPlacementStorageKey(testId);
      clearStalePlacementCache(testId);

      try {
        if (!forceNew) {
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              const saved = JSON.parse(raw);
              if (
                saved?.v === STORAGE_VERSION &&
                saved?.testId === testId &&
                Array.isArray(saved.questions) &&
                saved.questions.length > 0 &&
                !shouldIgnorePlacementCache(saved, testId)
              ) {
                const savedAnswers = saved.answers || {};
                const hasProgress =
                  !!saved.submitted ||
                  !!saved.examStarted ||
                  (saved.index ?? 0) > 0 ||
                  (saved.seconds ?? 0) > 0 ||
                  Object.keys(savedAnswers).length > 0;

                const restored = finalizePlacementQuestions(saved.questions);
                setQuestions(restored);
                setAnswers(savedAnswers);
                setWritingTopics(saved.writingTopics || {});
                setWritingEval(saved.writingEval || null);
                setSubmitted(!!saved.submitted);
                setSeconds(saved.seconds || 0);
                setIndex(Math.min(saved.index ?? 0, saved.questions.length - 1));
                setExamStarted(hasProgress);
                setLoadingQuestions(false);
                return restored;
              }
            }
          } catch {
            /* ignorar caché corrupta */
          }
        }

        if (restoreOnly) {
          setLoadingQuestions(false);
          return [];
        }

        const res = await fetch(
          `/api/placement/questions/?testId=${encodeURIComponent(testId)}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Could not load questions.');
        }

        const qs = finalizePlacementQuestions(data.questions || []);
        if (!qs.length) {
          throw new Error('This exam has no questions available.');
        }

        if (isPlacementMixedTestId(testId) && qs.length < PLACEMENT_MIXED_TOTAL) {
          console.warn(
            `[placement] Mixed session incomplete: ${qs.length}/${PLACEMENT_MIXED_TOTAL}.`,
            data.partCounts,
          );
        }

        setQuestions(qs);
        setAnswers({});
        setWritingTopics({});
        setWritingEval(null);
        setWritingEvalError('');
        setSubmitted(false);
        setSeconds(0);
        setIsPaused(false);
        setIndex(0);
        setExamStarted(false);
        return qs;
      } catch (err) {
        setLoadError(err.message || 'Error loading the test.');
        setQuestions([]);
        return [];
      } finally {
        setLoadingQuestions(false);
      }
    },
    [session?.access_token],
  );

  useEffect(() => {
    if (!session?.access_token) return;
    setSelectedTestId(PLACEMENT_MIXED_TEST_ID);
    void fetchQuestions({
      testId: PLACEMENT_MIXED_TEST_ID,
      forceNew: false,
      restoreOnly: true,
    });
  }, [session?.access_token, fetchQuestions]);

  // Guardar progreso por examen (testId)
  useEffect(() => {
    if (!questions.length || !selectedTestId) return;
    const payload = JSON.stringify({
      v: STORAGE_VERSION,
      testId: selectedTestId,
      examLabel: mixedExamMeta.label,
      mixed: true,
      total,
      questions,
      answers,
      writingTopics,
      writingEval,
      submitted,
      seconds,
      index,
      examStarted,
    });
    localStorage.setItem(getPlacementStorageKey(selectedTestId), payload);
  }, [
    questions,
    answers,
    writingTopics,
    writingEval,
    submitted,
    seconds,
    index,
    total,
    examStarted,
    selectedTestId,
  ]);

  // Temporizador (solo cuando el examen ha empezado)
  useEffect(() => {
    if (!examStarted || submitted || isPaused || loadingQuestions || total === 0) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [examStarted, submitted, isPaused, loadingQuestions, total]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && examStarted) setIsPaused(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [examStarted]);

  const handleStartExam = async () => {
    if (!session?.access_token) return;

    let qs = questions;
    if (!qs.length) {
      qs =
        (await fetchQuestions({
          testId: PLACEMENT_MIXED_TEST_ID,
          forceNew: true,
        })) || [];
    }

    if (!qs.length) {
      setLoadError(
        loadError || 'No se pudieron cargar las preguntas. Inténtalo de nuevo.',
      );
      return;
    }

    setExamStarted(true);
    setIsPaused(false);
    setSubmitted(false);
    setIndex(0);
    setSeconds(0);
    setConfirmOpen(false);
    setTimeout(() => topRef.current?.focus?.(), 0);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Respuestas
  const current = questions[index];
  const currentPart = current?.part ?? 1;
  const partDefs = useMemo(
    () =>
      questions.length > 0
        ? getPlacementPartDefsFromQuestions(questions)
        : introParts.length
          ? introParts
          : PLACEMENT_PARTS,
    [questions, introParts],
  );
  const currentPartMeta = useMemo(
    () => partDefs.find((p) => p.part === currentPart) ?? partDefs[0],
    [partDefs, currentPart],
  );

  const sharedReadingPassage = useMemo(
    () => getSharedReadingPassageForPart2(questions),
    [questions],
  );

  const showReadingPassage = Boolean(
    current?.part === 2 && sharedReadingPassage.trim(),
  );

  const partProgress = useMemo(() => {
    return partDefs.map((meta) => {
      const partQs = questions.filter((q) => q.part === meta.part);
      const answered = partQs.filter((q) => {
        if (q.type === 'writing') {
          const essay = String(answers[q.id] ?? '').trim();
          return essay.length >= 20 && Boolean(writingTopics[q.id]);
        }
        return String(answers[q.id] ?? '').trim() !== '';
      }).length;
      return { ...meta, total: partQs.length, answered };
    });
  }, [questions, answers, writingTopics, partDefs]);

  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      if (q.type === 'writing') {
        const essay = String(answers[q.id] ?? '').trim();
        return essay.length >= 20 && Boolean(writingTopics[q.id]);
      }
      return String(answers[q.id] ?? '').trim() !== '';
    }).length;
  }, [answers, questions, writingTopics]);
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const progressLabel = total > 0 ? `${answeredCount} of ${total}` : '—';

  const handleChange = useCallback((qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, []);

  const goto = (next) => setIndex((i) => Math.min(Math.max(next, 0), total - 1));

  const goToPart = (partId) => {
    const start = getPlacementPartStartIndex(questions, partId);
    setIndex(start);
  };

  const submitNow = async (e) => {
    e?.preventDefault?.();
    placementSaveAttemptedRef.current = false;
    setPlacementSaved(false);
    setPlacementSaveError('');
    setSubmitted(true);
    setIsPaused(true);
    setConfirmOpen(false);
    setCancelAuto(false);
    setWritingEval(null);
    setWritingEvalError('');

    const wq = writingQuestion;
    if (wq && session?.access_token) {
      const essay = String(answers[wq.id] ?? '').trim();
      const topic = writingTopics[wq.id];
      if (essay.length >= 20 && topic) {
        setEvaluatingWriting(true);
        try {
          const res = await fetch('/api/placement/evaluate-writing/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              taskPrompt: wq.text,
              selectedTopic: topic,
              essay,
              wordMin: wq.wordMin ?? 150,
              wordMax: wq.wordMax ?? 200,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || 'Could not evaluate the writing task.');
          }
          setWritingEval(data);
        } catch (err) {
          setWritingEvalError(err.message || 'Error evaluating the writing task.');
        } finally {
          setEvaluatingWriting(false);
        }
      }
    }

    setTimeout(() => topRef.current?.focus?.(), 0);
  };

  const handleReset = () => {
    if (selectedTestId) {
      localStorage.removeItem(getPlacementStorageKey(selectedTestId));
    }
    placementSaveAttemptedRef.current = false;
    setPlacementSaved(false);
    setPlacementSaveError('');
    setSavingPlacement(false);
    setExamStarted(false);
    setSubmitted(false);
    setIndex(0);
    setSeconds(0);
    if (selectedTestId) {
      void fetchQuestions({ testId: selectedTestId, forceNew: true });
    }
  };

  const placementResults = useMemo(() => {
    if (!submitted || !questions.length) return null;
    return computeOutcomesPlacementResults({
      questions,
      answers,
      writingEval,
    });
  }, [submitted, questions, answers, writingEval]);

  useEffect(() => {
    if (!submitted || !placementResults || !session?.user?.id || !session?.access_token) {
      return;
    }
    if (placementAccessLoading) return;
    if (hasPlacementResult) return;
    if (evaluatingWriting) return;

    const essayAwaitingEval =
      writingQuestion &&
      String(answers[writingQuestion.id] ?? '').trim().length >= 20 &&
      Boolean(writingTopics[writingQuestion.id]);
    if (essayAwaitingEval && !writingEval && !writingEvalError) return;

    if (placementSaveAttemptedRef.current) return;

    placementSaveAttemptedRef.current = true;
    setSavingPlacement(true);
    setPlacementSaveError('');

    void (async () => {
      try {
        const res = await fetch('/api/placement/save-result/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            testId: selectedTestId,
            placementResults,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo guardar el resultado del placement.');
        }
        setPlacementSaved(true);
        await refreshPlacementAccess();
      } catch (err) {
        console.error('[placement] Error saving result:', err);
        setPlacementSaveError(err.message || 'Error al guardar el resultado.');
        placementSaveAttemptedRef.current = false;
      } finally {
        setSavingPlacement(false);
      }
    })();
  }, [
    submitted,
    placementResults,
    session?.user?.id,
    session?.access_token,
    placementAccessLoading,
    hasPlacementResult,
    evaluatingWriting,
    writingQuestion,
    writingEval,
    writingEvalError,
    answers,
    writingTopics,
    selectedTestId,
    refreshPlacementAccess,
    saveRetryTick,
  ]);

  const retrySavePlacement = () => {
    placementSaveAttemptedRef.current = false;
    setPlacementSaveError('');
    setSaveRetryTick((t) => t + 1);
  };

  const placementLevelForPlan = useMemo(() => {
    if (!placementResults) return null;
    return (
      placementResults.recommended?.cefr ||
      outcomesCefrForTraining(placementResults) ||
      null
    );
  }, [placementResults]);

  useEffect(() => {
    if (!session?.access_token) return;
    if (!submitted) return;
    if (!placementSaved && !hasPlacementResult) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/plan-objetivos', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!cancelled) {
          setStudyPlan(json.plan || null);
          setShowStudyPlanSurvey(!json.plan?.completed_at);
          setStudyPlanChecked(true);
        }
      } catch {
        if (!cancelled) setStudyPlanChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    session?.access_token,
    submitted,
    placementSaved,
    hasPlacementResult,
  ]);

  const score = placementResults?.totalCorrect ?? 0;

  // Renderizador de pregunta por tipo (mcq, tf, cloze)
  const renderQuestion = (q) => {
    if (!q) return null;

    if (q.type === 'writing') {
      const essay = String(answers[q.id] ?? '');
      const words = countWords(essay);
      const topic = writingTopics[q.id] || '';
      const topics = Array.isArray(q.topicOptions) && q.topicOptions.length > 0
        ? q.topicOptions
        : ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];

      return (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm whitespace-pre-line max-h-72 overflow-y-auto">
            {q.text}
          </div>
          <p className="text-sm text-slate-600">
            Choose a topic and write between {q.wordMin ?? 150} and {q.wordMax ?? 200} words in
            English.
          </p>
          <fieldset className="space-y-2" disabled={submitted}>
            <legend className="text-sm font-medium text-slate-800 mb-2">Selected topic</legend>
            {topics.map((opt, i) => (
              <label key={opt} className={`opt block ${topic === opt ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={`writing-topic-${q.id}`}
                  value={opt}
                  checked={topic === opt}
                  onChange={() =>
                    setWritingTopics((prev) => ({ ...prev, [q.id]: opt }))
                  }
                  className="mr-2"
                  disabled={submitted}
                />
                <span>
                  <strong className="mr-1">Option {String.fromCharCode(65 + i)}:</strong>
                  {opt}
                </span>
              </label>
            ))}
          </fieldset>
          <div>
            <label htmlFor={`writing-${q.id}`} className="text-sm font-medium text-slate-800">
              Your text in English
            </label>
            <textarea
              id={`writing-${q.id}`}
              className="mt-2 w-full min-h-[220px] rounded-xl border border-slate-200 p-3 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={essay}
              onChange={(e) => handleChange(q.id, e.target.value)}
              disabled={submitted}
              placeholder="Write your answer here…"
              maxLength={12000}
            />
            <p className={`mt-1 text-sm ${words >= (q.wordMin ?? 150) ? 'text-green-700' : 'text-slate-500'}`}>
              Words: {words} / target {q.wordMin ?? 150}–{q.wordMax ?? 200}
            </p>
          </div>
          {submitted && evaluatingWriting && (
            <p className="text-sm text-indigo-600">Evaluating your writing with AI…</p>
          )}
          {submitted && writingEvalError && (
            <p className="text-sm text-red-600">{writingEvalError}</p>
          )}
          {submitted && writingEval && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-4 text-sm space-y-2">
              <p>
                <strong>AI feedback:</strong>{' '}
                {writingEval.writingScore10 != null
                  ? `${writingEval.writingScore10}/10 (Outcomes writing scale)`
                  : `${writingEval.scorePercent}%`}
                {' — '}
                {writingEval.countsAsCorrect
                  ? 'counts as 1 point on the placement test'
                  : 'does not count as a point'}
              </p>
              <p>{writingEval.feedback}</p>
              {writingEval.strengths?.length > 0 && (
                <p><strong>Strengths:</strong> {writingEval.strengths.join(' · ')}</p>
              )}
              {writingEval.improvements?.length > 0 && (
                <p><strong>To improve:</strong> {writingEval.improvements.join(' · ')}</p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (q.type === 'tf') {
      const opts = q.options?.length ? q.options : ['True', 'False'];
      return (
        <div className="grid grid-cols-2 gap-3">
          {opts.map((opt) => {
            const isSelected = answers[q.id] === opt;
            const cls =
              submitted
                ? (opt === q.answer ? 'correct' : isSelected ? 'wrong' : '')
                : (isSelected ? 'selected' : '');
            return (
              <label key={opt} className={`opt ${cls} text-lg justify-center`}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt}
                  disabled={submitted}
                  checked={answers[q.id] === opt}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="sr-only"
                />
                {opt}
              </label>
            );
          })}
        </div>
      );
    }

    if (q.type === 'cloze') {
      const parts = String(q.text || '').split('____');
      return (
        <div className="space-y-3">
          <p className="text-lg leading-relaxed">
            {parts.map((chunk, i) => (
              <span key={i}>
                {chunk}
                {i < parts.length - 1 && (
                  <input
                    type="text"
                    className="mx-2 px-3 py-2 rounded-lg border focus:outline-none focus:ring focus:ring-blue-200 min-w-[10ch]"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    disabled={submitted}
                  />
                )}
              </span>
            ))}
          </p>
        </div>
      );
    }

    // mcq por defecto
    const opts = Array.isArray(q.options) ? q.options : [];
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {opts.map((opt) => {
          const isSelected = answers[q.id] === opt;
          const cls =
            submitted
              ? (opt === q.answer ? 'correct' : isSelected ? 'wrong' : '')
              : (isSelected ? 'selected' : '');
          return (
            <label key={opt} className={`opt ${cls}`}>
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt}
                disabled={submitted}
                checked={answers[q.id] === opt}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    );
  };

  // Nivel y recomendación
  const level = useMemo(
    () => (placementResults ? outcomesCefrForTraining(placementResults) : null),
    [placementResults],
  );
  const recommendation = useMemo(() => (level ? levelRecommendations[level] : null), [level]);

  const incorrectQuestions = useMemo(() => {
    if (!submitted) return [];
    return questions.filter((q) => {
      if (q.type === 'writing') {
        return writingEval && !writingEval.countsAsCorrect;
      }
      const userAns = String(answers[q.id] ?? '').trim();
      return userAns && userAns !== String(q.answer ?? '').trim();
    });
  }, [submitted, questions, answers, writingEval]);

  // >>> Redirección automática DESACTIVADA a petición <<<

  // ====================== UI ======================
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div ref={topRef} tabIndex={-1} />

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 text-center sm:text-left">
          <div className="shrink-0 leading-none drop-shadow-md" aria-hidden>
            <SiteMascot variant={2} width={112} alt="" />
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Placement Test</h1>
            <p className="mt-2 text-slate-600">
              Three parts: Grammar & vocabulary, Reading, and Writing. Questions are
              drawn at random from all placement exams.
            </p>
          </div>
        </header>

        {!session ? (
          <p className="text-center">Loading…</p>
        ) : loadError && !examStarted ? (
          <div className="text-center space-y-4 rounded-2xl border bg-white p-6">
            <p className="text-red-600">{loadError}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                fetchQuestions({ testId: PLACEMENT_MIXED_TEST_ID, forceNew: true })
              }
            >
              Retry
            </button>
          </div>
        ) : !examStarted ? (
          <section className="placement-intro">
            <div className="placement-intro__hero">
              <p className="placement-intro__eyebrow">Placement Test</p>
              <h2 className="placement-intro__title">Ready to start?</h2>
              <p className="placement-intro__desc">
                The timer starts when you press the button. Each session uses random questions
                from all placement exams without repeats. You can pause and continue later; your
                progress is saved on this device.
              </p>
              <div className="placement-intro__stats">
                <span className="placement-intro__stat">
                  <strong>{introTotalQuestions}</strong> questions
                </span>
                <span className="placement-intro__stat-divider" aria-hidden />
                <span className="placement-intro__stat">
                  <strong>~{introTotalMinutes}</strong> min approx.
                </span>
              </div>
            </div>

            <div className="placement-intro__grid">
              {introParts.map((meta) => (
                <article
                  key={meta.part}
                  className={`placement-intro-card placement-intro-card--${meta.accent}`}
                >
                  <div className="placement-intro-card__head">
                    <span className="placement-intro-card__icon" aria-hidden>
                      {meta.icon}
                    </span>
                    <span className="placement-intro-card__part">Part {meta.part}</span>
                  </div>
                  <h3 className="placement-intro-card__title">{meta.title}</h3>
                  <dl className="placement-intro-card__meta">
                    <div>
                      <dt>Questions</dt>
                      <dd>{meta.questionCount}</dd>
                    </div>
                    <div>
                      <dt>Est. time</dt>
                      <dd>~{meta.estimatedMinutes} min</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary placement-intro__start"
              onClick={handleStartExam}
              disabled={loadingQuestions}
            >
              {loadingQuestions ? 'Preparing exam…' : 'Start exam'}
            </button>
          </section>
        ) : loadingQuestions && total === 0 ? (
          <p className="text-center">Loading exam…</p>
        ) : total === 0 ? (
          <div className="text-center space-y-4 rounded-2xl border bg-white p-6">
            <p className="text-red-600">No questions available.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                fetchQuestions({ testId: PLACEMENT_MIXED_TEST_ID, forceNew: true })
              }
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Barra superior */}
            <div className="sticky top-4 z-20 bg-white/80 backdrop-blur rounded-2xl border p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"/>
                    <span>Progress:</span>
                    <strong>{progressLabel}</strong>
                  </span>
                  <span className="opacity-70" aria-label="percent complete">{progress}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">⏱ {fmt(seconds)}</span>
                  <button type="button" onClick={() => setIsPaused((p) => !p)} className="btn">{isPaused ? 'Resume' : 'Pause'}</button>
                  {!submitted ? (
                    <button type="button" onClick={() => setConfirmOpen(true)} className="btn btn-primary">Submit</button>
                  ) : (
                    <button type="button" onClick={handleReset} className="btn btn-dark">Reset</button>
                  )}
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" style={{ width: `${progress}%`, transition: 'width .2s ease' }} />
              </div>
            </div>
            {/* Partes del examen */}
            <nav className="rounded-2xl border bg-white p-3 shadow-sm" aria-label="Placement test parts">
              <div className="grid gap-2 sm:grid-cols-3">
                {partProgress.map((meta) => {
                  const isActive = meta.part === currentPart;
                  const done =
                    meta.total > 0 && meta.answered === meta.total;
                  return (
                    <button
                      key={meta.part}
                      type="button"
                      onClick={() => goToPart(meta.part)}
                      disabled={submitted && meta.total === 0}
                      className={`part-tab ${isActive ? 'part-tab--active' : ''} ${done ? 'part-tab--done' : ''}`}
                    >
                      <span className="part-tab__kicker">Part {meta.part}</span>
                      <span className="part-tab__title">{meta.title}</span>
                      <span className="part-tab__range">
                        Questions {meta.from}–{meta.to}
                      </span>
                      <span className="part-tab__progress">
                        {meta.answered} / {meta.total || '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Tarjeta de pregunta actual */}
            <div className="rounded-3xl border bg-white shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">
                    Part {currentPart}: {currentPartMeta.title}
                  </p>
                  <h2 className="text-lg font-semibold">
                    Question {current?.displayNumber ?? index + 1} of {total}
                  </h2>
                </div>
                {!submitted && current?.type === 'writing' ? (
                  <span className="pill">Writing · 150–200 words</span>
                ) : null}
              </div>
              {showReadingPassage && (
                <div className="reading-passage-box mt-4">
                  <p className="reading-passage-box__label">Reading text</p>
                  <div className="reading-passage-box__body whitespace-pre-line">
                    {sharedReadingPassage}
                  </div>
                </div>
              )}
              {current?.type !== 'writing' && current?.type !== 'cloze' && current?.text && (
                <div
                  className={
                    showReadingPassage
                      ? 'reading-question-prompt mt-4'
                      : 'mt-2 text-xl leading-relaxed whitespace-pre-line'
                  }
                >
                  {showReadingPassage ? (
                    <>
                      <p className="reading-passage-box__label">
                        Question {current?.displayNumber ?? ''}
                      </p>
                      <p className="reading-question-prompt__text">{current.text}</p>
                    </>
                  ) : (
                    current.text
                  )}
                </div>
              )}

              <div className="mt-5">
                {renderQuestion(current)}
              </div>

              {submitted &&
                current?.type !== 'writing' &&
                String(answers[current.id] ?? '').trim() !== String(current.answer ?? '').trim() && (
                  <p className="mt-4 text-sm text-red-600">
                    Correct answer: <strong>{String(current.answer)}</strong>{' '}
                    {current.explanation ? `— ${current.explanation}` : ''}
                  </p>
                )}

              {/* Navegación */}
              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={() => goto(index - 1)} disabled={index === 0} className="btn disabled:opacity-40">Previous</button>
                <div className="flex items-center gap-2">
                  {index === total - 1 && !submitted ? (
                    <button type="button" onClick={() => setConfirmOpen(true)} className="btn btn-primary">Submit</button>
                  ) : (
                    <button type="button" onClick={() => goto(index + 1)} disabled={index === total - 1 || submitted} className="btn disabled:opacity-40">Next</button>
                  )}
                </div>
              </div>
            </div>

            {/* Rejilla de navegación rápida por partes */}
            <div className="rounded-3xl border bg-white p-4 shadow-sm space-y-4">
              {PLACEMENT_PARTS.map((meta) => {
                const partQs = questions.filter((q) => q.part === meta.part);
                if (!partQs.length) return null;
                return (
                  <div key={meta.part}>
                    <p className="part-bubbles__label">
                      Part {meta.part}: {meta.title}{' '}
                      <span className="text-slate-500 font-normal">
                        ({meta.from}–{meta.to})
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {partQs.map((q) => {
                        const i = questions.findIndex((x) => x.id === q.id);
                        const isActive = i === index;
                        const userAns = String(answers[q.id] ?? '').trim();
                        const correctAns = String(q.answer ?? '').trim();
                        const isWriting = q.type === 'writing';
                        const isCorrect = isWriting
                          ? Boolean(writingEval?.countsAsCorrect)
                          : userAns === correctAns;

                        let bubbleModifier = '';
                        if (submitted) {
                          if (isWriting) {
                            if (evaluatingWriting) bubbleModifier = '';
                            else if (writingEval?.countsAsCorrect) bubbleModifier = 'bubble--correct';
                            else if (userAns) bubbleModifier = 'bubble--wrong';
                            else bubbleModifier = 'bubble--skipped';
                          } else if (isCorrect) bubbleModifier = 'bubble--correct';
                          else if (userAns) bubbleModifier = 'bubble--wrong';
                          else bubbleModifier = 'bubble--skipped';
                        } else if (isWriting ? userAns && writingTopics[q.id] : answers[q.id]) {
                          bubbleModifier = 'bubble--done';
                        }

                        const activeModifier = isActive
                          ? (submitted ? 'bubble--active-ring' : 'bubble--active')
                          : '';

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setIndex(i)}
                            className={`bubble ${bubbleModifier} ${activeModifier}`.trim()}
                            title={`Go to question ${q.displayNumber ?? i + 1}`}
                          >
                            {q.displayNumber ?? i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resultados */}
            {submitted && (
              <section className="rounded-3xl border bg-white shadow-sm p-6" aria-live="polite">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                  <div className="shrink-0 leading-none mx-auto sm:mx-0" aria-hidden>
                    <SiteMascot variant={7} width={100} alt="" />
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                <h3 className="text-xl font-semibold">Results</h3>
                <p className="mt-1">
                  Total score: <span className="font-semibold">{score}</span> / {total}
                </p>
                {evaluatingWriting && (
                  <p className="text-sm text-indigo-600 mt-1">Evaluating writing with AI…</p>
                )}
                {savingPlacement && (
                  <p className="text-sm text-indigo-600 mt-1">Guardando tu nivel en la plataforma…</p>
                )}
                {placementSaved && !savingPlacement && (
                  <p className="text-sm text-green-700 mt-1 font-medium">
                    Nivel registrado. Ya puedes acceder a los niveles desbloqueados en Levels.
                  </p>
                )}
                {placementSaveError && (
                  <p className="text-sm text-red-600 mt-1">{placementSaveError}</p>
                )}
                {submitted &&
                  !placementSaved &&
                  !savingPlacement &&
                  !hasPlacementResult &&
                  !evaluatingWriting && (
                    <button
                      type="button"
                      className="btn btn-secondary mt-2"
                      onClick={retrySavePlacement}
                    >
                      Reintentar guardar nivel
                    </button>
                  )}
                  </div>
                </div>

                {placementResults && (
                  <div className="placement-results-breakdown mt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-2">
                      Outcomes placement scoring
                    </p>
                    <div className="placement-results-grid">
                      <div className="placement-results-part">
                        <span className="placement-results-part__label">Grammar & vocabulary</span>
                        <span className="placement-results-part__score">
                          {placementResults.grammar.correct} / {placementResults.grammar.total}
                        </span>
                        <span className="placement-results-part__level">
                          {placementResults.grammar.band.shortLevel}
                        </span>
                      </div>
                      {placementResults.reading.total > 0 ? (
                        <div className="placement-results-part">
                          <span className="placement-results-part__label">Reading</span>
                          <span className="placement-results-part__score">
                            {placementResults.reading.correct} / {placementResults.reading.total}
                          </span>
                          <span className="placement-results-part__level">
                            {placementResults.reading.band.shortLevel}
                          </span>
                        </div>
                      ) : null}
                      {placementResults.writing ? (
                        <div className="placement-results-part">
                          <span className="placement-results-part__label">Writing</span>
                          <span className="placement-results-part__score">
                            {placementResults.writing.score10} / 10
                          </span>
                          <span className="placement-results-part__level">
                            {placementResults.writing.band.shortLevel}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <p className="mt-3 text-slate-700">
                      <strong>Recommended course:</strong>{' '}
                      {placementResults.recommended.outcomesLevel}
                    </p>
                    <p className="text-sm text-slate-600">
                      CEFR equivalent: <strong>{placementResults.recommended.cefr}</strong>
                      {placementResults.spread >= 2 ? (
                        <>
                          {' '}
                          (conservative estimate: {placementResults.conservativeCefr} — parts
                          differ)
                        </>
                      ) : null}
                    </p>
                  </div>
                )}

                {level && (
                  <div className="mt-3">
                    <p className="text-slate-600">
                      Suggested training path: <span className="font-semibold">{level}</span>
                    </p>
                    {recommendation && (
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <Link href={recommendation.link} className="btn btn-primary">
                          Start at {level}: {recommendation.title}
                        </Link>
                        <button type="button" className="btn" onClick={() => router.push(recommendation.link)}>
                          Go now
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {studyPlanChecked &&
                  (placementSaved || hasPlacementResult) &&
                  session?.access_token && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="text-lg font-semibold text-indigo-900 mb-1">
                      Plan de objetivos
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Responde esta breve encuesta sobre tus objetivos y tiempo de estudio.
                    </p>
                    {showStudyPlanSurvey && !studyPlan?.completed_at ? (
                      <StudyPlanSurvey
                        compact
                        placementLevel={placementLevelForPlan}
                        placementBreakdown={placementResults}
                        accessToken={session.access_token}
                        onComplete={(plan) => {
                          setStudyPlan(plan);
                          setShowStudyPlanSurvey(false);
                        }}
                        onSkip={() => setShowStudyPlanSurvey(false)}
                      />
                    ) : studyPlan?.completed_at ? (
                      <div>
                        <StudyPlanDocument plan={studyPlan} showActions />
                        <p className="mt-4 text-sm">
                          <Link href="/plan-objetivos" className="text-indigo-600 font-medium underline">
                            Ver plan completo en tu perfil de estudios →
                          </Link>
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowStudyPlanSurvey(true)}
                        >
                          Completar encuesta
                        </button>
                        <Link href="/plan-objetivos" className="btn">
                          Ir a plan de objetivos
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {incorrectQuestions.length > 0 ? (
                  <details className="wrong-questions mt-5" open>
                    <summary className="wrong-questions__summary">
                      <span className="wrong-questions__summary-text">
                        View incorrect questions
                      </span>
                      <span className="wrong-questions__badge">
                        {incorrectQuestions.length}
                      </span>
                    </summary>
                    <div className="wrong-questions__list">
                      {incorrectQuestions.map((q) => {
                        const qIndex = questions.findIndex((x) => x.id === q.id);
                        const qNum = q.displayNumber ?? qIndex + 1;
                        const isWriting = q.type === 'writing';

                        return (
                          <article key={`wrong-${q.id}`} className="wrong-question-card">
                            <div className="wrong-question-card__top">
                              <span className="wrong-question-card__num">Q{qNum}</span>
                              <button
                                type="button"
                                className="wrong-question-card__link"
                                onClick={() => setIndex(qIndex)}
                              >
                                Review question →
                              </button>
                            </div>

                            {isWriting ? (
                              <p className="wrong-question-card__writing-hint">
                                See the AI feedback on your writing task below the essay.
                              </p>
                            ) : (
                              <div className="wrong-question-card__compare">
                                <div className="wrong-answer-chip wrong-answer-chip--yours">
                                  <span className="wrong-answer-chip__label">Your answer</span>
                                  <span className="wrong-answer-chip__value">
                                    {String(answers[q.id])}
                                  </span>
                                </div>
                                <div
                                  className="wrong-answer-chip wrong-answer-chip--correct"
                                  aria-hidden
                                >
                                  →
                                </div>
                                <div className="wrong-answer-chip wrong-answer-chip--right">
                                  <span className="wrong-answer-chip__label">Correct answer</span>
                                  <span className="wrong-answer-chip__value">
                                    {String(q.answer)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </details>
                ) : null}
              </section>
            )}
          </div>
        )}

        {/* Modal de confirmación */}
        {confirmOpen && !submitted && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-lg font-semibold">Submit the test?</h4>
              <p className="text-sm text-gray-600 mt-1">You have answered {answeredCount} of {total} questions.</p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" className="btn" onClick={() => setConfirmOpen(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={submitNow}>Submit now</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {styleGlobal}
    </main>
  );
}

// Fallback CSS global embebido para cuando Tailwind no esté cargado
const styleGlobal = (
  <style jsx global>{`
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{background:#f8fafc;color:#0f172a;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Arial}
  .rounded-3xl{border-radius:1.5rem}
  .rounded-2xl{border-radius:1rem}
  .rounded-xl{border-radius:.75rem}
  .shadow-sm{box-shadow:0 1px 3px rgba(15,23,42,.08)}
  .shadow{box-shadow:0 10px 15px -3px rgba(15,23,42,.1),0 4px 6px -4px rgba(15,23,42,.1)}
  .border{border:1px solid #e2e8f0}
  .bg-white{background:#fff}
  .text-center{text-align:center}
  .text-slate-600{color:#475569}
  .text-xl{font-size:1.25rem;line-height:1.75rem}
  .sticky{position:sticky}
  .top-4{top:1rem}
  .backdrop-blur{backdrop-filter:saturate(180%) blur(8px)}
  button{appearance:none;border:none;background:transparent;color:inherit;font:inherit;cursor:pointer}
  .btn{padding:.6rem 1rem;border-radius:.75rem;border:1px solid #e2e8f0;background:#fff;transition:all .15s}
  .btn:hover{background:#f8fafc}
  .btn-primary{background:linear-gradient(90deg,#2563eb,#4f46e5);color:#fff;border:none}
  .btn-primary:hover{filter:brightness(1.05)}
  .btn-dark{background:#0f172a;color:#fff}
  .pill{display:inline-flex;align-items:center;gap:.5rem;padding:.25rem .5rem;border-radius:9999px;background:#eef2ff;color:#3730a3;font-size:.75rem}
  .progress-track{width:100%;height:.5rem;background:#e2e8f0;border-radius:.5rem;overflow:hidden}
  .progress-bar{height:100%;background:linear-gradient(90deg,#2563eb,#4f46e5);transition:width .2s}
  .opt{display:flex;align-items:center;gap:.6rem;padding:.6rem .8rem;border:1px solid #e2e8f0;border-radius:.75rem;background:#fff;transition:all .15s}
  .opt:hover{border-color:#cbd5e1;background:#f8fafc}
  .opt input{accent-color:#2563eb}
  .opt.correct{border-color:#86efac;background:#f0fdf4}
  .opt.wrong{border-color:#fecaca;background:#fef2f2}
  .opt.selected{border-color:#93c5fd;background:#eff6ff;box-shadow:inset 0 0 0 3px rgba(59,130,246,.25)}
  .bubble{width:2.25rem;height:2.25rem;border-radius:9999px;border:1px solid #e2e8f0;background:#fff;display:grid;place-items:center;font-weight:600;font-size:.8rem}
  .bubble--active{background:#2563eb;border-color:#2563eb;color:#fff}
  .bubble--done{background:#f0fdf4;border-color:#86efac;color:#14532d}
  .bubble--correct{background:#dcfce7;border-color:#22c55e;color:#14532d}
  .bubble--wrong{background:#fee2e2;border-color:#ef4444;color:#991b1b}
  .bubble--skipped{background:#f1f5f9;border-color:#cbd5e1;color:#64748b}
  .bubble--active-ring{box-shadow:0 0 0 3px #2563eb,0 0 0 5px rgba(37,99,235,.25)}
  input[type="text"]{padding:.5rem .75rem;border:1px solid #e2e8f0;border-radius:.6rem;outline:none}
  input[type="text"]:focus{box-shadow:0 0 0 4px rgba(37,99,235,.15);border-color:#93c5fd}
  .part-tab{display:flex;flex-direction:column;align-items:flex-start;gap:.15rem;padding:.75rem .9rem;border-radius:.9rem;border:1px solid #e2e8f0;background:#f8fafc;text-align:left;transition:all .15s}
  .part-tab:hover:not(:disabled){border-color:#93c5fd;background:#eff6ff}
  .part-tab--active{border-color:#2563eb;background:#eff6ff;box-shadow:inset 0 0 0 2px rgba(37,99,235,.2)}
  .part-tab--done{border-color:#86efac;background:#f0fdf4}
  .part-tab__kicker{font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6366f1}
  .part-tab__title{font-size:.9rem;font-weight:700;color:#0f172a}
  .part-tab__range{font-size:.72rem;color:#64748b}
  .part-tab__progress{font-size:.75rem;font-weight:600;color:#334155;margin-top:.1rem}
  .part-bubbles__label{font-size:.8rem;font-weight:700;color:#334155;margin:0}
  .reading-passage-box{border-radius:.9rem;border:1px solid #c7d2fe;background:#f8fafc;padding:1rem 1.1rem}
  .reading-passage-box__label{margin:0 0 .5rem;font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#4f46e5}
  .reading-passage-box__body{font-size:1rem;line-height:1.65;color:#1e293b;max-height:20rem;overflow-y:auto}
  .reading-question-prompt__text{margin:0;font-size:1.125rem;line-height:1.55;color:#0f172a;font-weight:600}
  .placement-intro{display:flex;flex-direction:column;gap:1.5rem}
  .placement-intro__hero{
    position:relative;overflow:hidden;border-radius:1.5rem;padding:2rem 1.75rem;text-align:center;color:#fff;
    background:linear-gradient(135deg,#4f46e5 0%,#6366f1 45%,#2563eb 100%);
    box-shadow:0 20px 50px rgba(79,70,229,.28);
  }
  .placement-intro__hero::before{
    content:'';position:absolute;inset:0;opacity:.15;
    background-image:linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px);
    background-size:24px 24px;pointer-events:none;
  }
  .placement-intro__hero > *{position:relative;z-index:1}
  .placement-intro__eyebrow{margin:0 0 .5rem;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.9}
  .placement-intro__title{margin:0 0 .65rem;font-size:clamp(1.6rem,4vw,2rem);font-weight:800;letter-spacing:-.02em}
  .placement-intro__desc{margin:0 auto 1.25rem;max-width:36ch;font-size:1rem;line-height:1.55;opacity:.92}
  .placement-intro__stats{
    display:inline-flex;align-items:center;gap:1rem;padding:.55rem 1.1rem;border-radius:9999px;
    background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(8px);
  }
  .placement-intro__stat{font-size:.9rem;opacity:.95}
  .placement-intro__stat strong{font-size:1.05rem;font-weight:800;color:#fff}
  .placement-intro__stat-divider{width:1px;height:1.25rem;background:rgba(255,255,255,.35)}
  .placement-intro__grid{display:grid;gap:1rem;grid-template-columns:1fr}
  @media (min-width:640px){.placement-intro__grid{grid-template-columns:repeat(3,1fr)}}
  .placement-intro-card{
    display:flex;flex-direction:column;gap:.75rem;padding:1.15rem 1.2rem;border-radius:1.15rem;
    border:1px solid #e2e8f0;background:#fff;box-shadow:0 4px 18px rgba(15,23,42,.06);transition:transform .2s,box-shadow .2s;
  }
  .placement-intro-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(15,23,42,.1)}
  .placement-intro-card__head{display:flex;align-items:center;justify-content:space-between;gap:.5rem}
  .placement-intro-card__icon{
    display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:.75rem;font-size:1.25rem;
  }
  .placement-intro-card__part{font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748b}
  .placement-intro-card__title{margin:0;font-size:1.05rem;font-weight:700;color:#0f172a;line-height:1.25}
  .placement-intro-card__meta{display:grid;grid-template-columns:1fr 1fr;gap:.65rem;margin:0}
  .placement-intro-card__meta div{padding:.5rem .6rem;border-radius:.65rem;background:#f8fafc}
  .placement-intro-card__meta dt{margin:0 0 .15rem;font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
  .placement-intro-card__meta dd{margin:0;font-size:1rem;font-weight:800;color:#0f172a}
  .placement-intro-card--violet .placement-intro-card__icon{background:#ede9fe}
  .placement-intro-card--violet{border-top:3px solid #7c3aed}
  .placement-intro-card--ocean .placement-intro-card__icon{background:#e0f2fe}
  .placement-intro-card--ocean{border-top:3px solid #0284c7}
  .placement-intro-card--emerald .placement-intro-card__icon{background:#d1fae5}
  .placement-intro-card--emerald{border-top:3px solid #059669}
  .placement-intro__start{
    align-self:center;padding:.95rem 2.5rem;font-size:1.08rem;font-weight:800;border-radius:9999px;
    box-shadow:0 10px 28px rgba(37,99,235,.35);
  }
  .placement-intro__start:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}
  .placement-exam-grid{display:grid;gap:1rem;grid-template-columns:1fr}
  @media (min-width:640px){.placement-exam-grid{grid-template-columns:repeat(2,1fr)}}
  .placement-exam-pick{
    display:flex;flex-direction:column;align-items:flex-start;gap:.5rem;padding:1.35rem 1.4rem;
    border-radius:1.2rem;border:2px solid #e2e8f0;background:#fff;text-align:left;
    box-shadow:0 6px 22px rgba(15,23,42,.07);transition:transform .2s,border-color .2s,box-shadow .2s;
  }
  .placement-exam-pick:hover{
    transform:translateY(-3px);border-color:#818cf8;box-shadow:0 16px 36px rgba(79,70,229,.16);
  }
  .placement-exam-pick__badge{
    font-size:.65rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
    color:#4f46e5;background:#eef2ff;padding:.2rem .55rem;border-radius:9999px;
  }
  .placement-exam-pick__title{margin:0;font-size:1.15rem;font-weight:800;color:#0f172a;line-height:1.25}
  .placement-exam-pick__desc{margin:0;font-size:.88rem;line-height:1.45;color:#64748b}
  .placement-exam-pick__stats{
    display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;margin-top:.25rem;font-size:.88rem;color:#334155;
  }
  .placement-exam-pick__stats strong{font-size:1rem;color:#0f172a}
  .placement-exam-switch{
    padding:1rem 1.1rem;border-radius:1rem;border:1px solid #e2e8f0;background:#f8fafc;
  }
  .placement-exam-switch__label{margin:0 0 .65rem;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b}
  .placement-exam-switch__grid{display:flex;flex-wrap:wrap;gap:.5rem}
  .placement-exam-chip{
    padding:.45rem .9rem;border-radius:9999px;border:1px solid #cbd5e1;background:#fff;
    font-size:.85rem;font-weight:600;color:#334155;transition:all .15s;
  }
  .placement-exam-chip:hover{border-color:#818cf8;color:#4338ca}
  .placement-exam-chip--active{
    border-color:#4f46e5;background:linear-gradient(90deg,#4f46e5,#2563eb);color:#fff;
    box-shadow:0 6px 16px rgba(79,70,229,.28);
  }
  .wrong-questions{
    border-radius:1rem;border:1px solid #fecaca;background:linear-gradient(180deg,#fffbfb 0%,#fff 100%);
    overflow:hidden;
  }
  .wrong-questions__summary{
    display:flex;align-items:center;justify-content:space-between;gap:.75rem;
    padding:.95rem 1.15rem;cursor:pointer;list-style:none;font-weight:700;color:#991b1b;
    background:rgba(254,226,226,.35);transition:background .15s;
  }
  .wrong-questions__summary::-webkit-details-marker{display:none}
  .wrong-questions__summary::marker{display:none}
  .wrong-questions__summary:hover{background:rgba(254,226,226,.55)}
  .wrong-questions__summary-text{font-size:.95rem}
  .wrong-questions__summary-text::before{
    content:'▸';display:inline-block;margin-right:.45rem;transition:transform .15s;
  }
  .wrong-questions[open] .wrong-questions__summary-text::before{transform:rotate(90deg)}
  .wrong-questions__badge{
    display:inline-flex;align-items:center;justify-content:center;min-width:1.75rem;height:1.75rem;
    padding:0 .45rem;border-radius:9999px;background:#ef4444;color:#fff;font-size:.8rem;font-weight:800;
  }
  .wrong-questions__list{
    display:flex;flex-direction:column;gap:.65rem;padding:.85rem 1rem 1.1rem;
    border-top:1px solid #fecaca;
  }
  .wrong-question-card{
    padding:.85rem 1rem;border-radius:.85rem;border:1px solid #e2e8f0;background:#fff;
    box-shadow:0 2px 8px rgba(15,23,42,.04);transition:border-color .15s,box-shadow .15s;
  }
  .wrong-question-card:hover{border-color:#fca5a5;box-shadow:0 4px 14px rgba(239,68,68,.08)}
  .wrong-question-card__top{
    display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.65rem;
  }
  .wrong-question-card__num{
    display:inline-flex;align-items:center;justify-content:center;min-width:2.25rem;height:2.25rem;
    padding:0 .5rem;border-radius:.65rem;background:#fef2f2;border:1px solid #fecaca;
    font-size:.85rem;font-weight:800;color:#b91c1c;
  }
  .wrong-question-card__link{
    font-size:.82rem;font-weight:700;color:#2563eb;padding:.35rem .65rem;border-radius:.5rem;
    background:#eff6ff;border:1px solid #bfdbfe;transition:all .15s;
  }
  .wrong-question-card__link:hover{background:#dbeafe;border-color:#93c5fd;color:#1d4ed8}
  .wrong-question-card__writing-hint{
    margin:0;font-size:.88rem;line-height:1.5;color:#64748b;
  }
  .wrong-question-card__compare{
    display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:stretch;
  }
  @media (max-width:520px){
    .wrong-question-card__compare{grid-template-columns:1fr;gap:.45rem}
    .wrong-answer-chip--correct{display:none}
  }
  .wrong-answer-chip{
    display:flex;flex-direction:column;gap:.25rem;padding:.55rem .7rem;border-radius:.65rem;min-width:0;
  }
  .wrong-answer-chip__label{
    font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;
  }
  .wrong-answer-chip__value{
    font-size:.9rem;font-weight:600;line-height:1.35;word-break:break-word;
  }
  .wrong-answer-chip--yours{
    background:#fef2f2;border:1px solid #fecaca;
  }
  .wrong-answer-chip--yours .wrong-answer-chip__label{color:#b91c1c}
  .wrong-answer-chip--yours .wrong-answer-chip__value{
    color:#991b1b;text-decoration:line-through;text-decoration-color:rgba(185,28,28,.45);
  }
  .wrong-answer-chip--right{
    background:#f0fdf4;border:1px solid #bbf7d0;
  }
  .wrong-answer-chip--right .wrong-answer-chip__label{color:#15803d}
  .wrong-answer-chip--right .wrong-answer-chip__value{color:#14532d}
  .wrong-answer-chip--correct{
    display:grid;place-items:center;font-size:1.1rem;font-weight:700;color:#94a3b8;padding:0 .15rem;
  }
  .placement-results-breakdown{
    padding:1rem 1.1rem;border-radius:.9rem;border:1px solid #c7d2fe;background:#f8fafc;
  }
  .placement-results-grid{
    display:grid;gap:.65rem;grid-template-columns:1fr;
  }
  @media (min-width:520px){.placement-results-grid{grid-template-columns:repeat(3,1fr)}}
  .placement-results-part{
    display:flex;flex-direction:column;gap:.2rem;padding:.65rem .75rem;border-radius:.65rem;
    background:#fff;border:1px solid #e2e8f0;
  }
  .placement-results-part__label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b}
  .placement-results-part__score{font-size:1.1rem;font-weight:800;color:#0f172a}
  .placement-results-part__level{font-size:.82rem;font-weight:600;color:#4f46e5}
  `}</style>
);
