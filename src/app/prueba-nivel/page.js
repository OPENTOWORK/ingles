'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import SiteMascot from '@/components/SiteMascot';
import { levelFromScore, levelRecommendations } from '@/data/placementTest';
import { shuffleQuestionOptions } from '@/lib/placementSupabase';

/**
 * Versión con nivel CEFR, progreso legible y mejoras de UX.
 * Cambios solicitados:
 *  - Visual de opción seleccionada antes de enviar (clase .opt.selected)
 *  - Sin “Ir a la primera sin responder”
 *  - Sin “Saltar a sin responder”
 *  - Sin redirección automática al terminar
 */

const LOCAL_KEY = 'placement.v5';

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function PlacementTestPage() {
  const router = useRouter();
  const { session } = useUserRole();

  // Estado principal
  const [answers, setAnswers] = useState({}); // { [qid]: value }
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [index, setIndex] = useState(0); // índice de pregunta activa
  const [cancelAuto, setCancelAuto] = useState(false); // (se queda por compatibilidad)
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [writingTopics, setWritingTopics] = useState({});
  const [writingEval, setWritingEval] = useState(null);
  const [writingEvalError, setWritingEvalError] = useState('');
  const [evaluatingWriting, setEvaluatingWriting] = useState(false);

  const topRef = useRef(null);
  const writingQuestion = useMemo(
    () => questions.find((q) => q.type === 'writing') || null,
    [questions],
  );
  const loadStartedRef = useRef(false);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  const total = questions.length;

  const fetchQuestions = useCallback(async ({ forceNew = false } = {}) => {
    if (!session?.access_token) return;

    setLoadingQuestions(true);
    setLoadError('');

    try {
      if (!forceNew) {
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          if (raw) {
            const saved = JSON.parse(raw);
            if (
              (saved?.v === 4 || saved?.v === 5) &&
              Array.isArray(saved.questions) &&
              saved.questions.length > 0
            ) {
              setQuestions(shuffleQuestionOptions(saved.questions));
              setAnswers(saved.answers || {});
              setWritingTopics(saved.writingTopics || {});
              setWritingEval(saved.writingEval || null);
              setSubmitted(!!saved.submitted);
              setSeconds(saved.seconds || 0);
              setIndex(Math.min(saved.index ?? 0, saved.questions.length - 1));
              setLoadingQuestions(false);
              return;
            }
          }
        } catch {
          /* ignorar caché corrupta */
        }
      }

      const res = await fetch('/api/placement/questions', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron cargar las preguntas.');
      }

      const qs = shuffleQuestionOptions(data.questions || []);
      if (!qs.length) {
        throw new Error('El banco de preguntas está vacío.');
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
    } catch (err) {
      setLoadError(err.message || 'Error al cargar el test.');
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (!session?.access_token || loadStartedRef.current) return;
    loadStartedRef.current = true;
    void fetchQuestions();
  }, [session?.access_token, fetchQuestions]);

  // Guardar progreso + orden de preguntas (sin repetir en la misma sesión)
  useEffect(() => {
    if (!questions.length) return;
    const payload = JSON.stringify({
      v: 4,
      total,
      questions,
      answers,
      submitted,
      seconds,
      index,
    });
    localStorage.setItem(LOCAL_KEY, payload);
  }, [questions, answers, writingTopics, writingEval, submitted, seconds, index, total]);

  // Temporizador
  useEffect(() => {
    if (submitted || isPaused || loadingQuestions || total === 0) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [submitted, isPaused, loadingQuestions, total]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setIsPaused(true); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Respuestas
  const current = questions[index];
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
  const progressLabel = total > 0 ? `${answeredCount} de ${total}` : '—';

  const handleChange = useCallback((qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, []);

  const goto = (next) => setIndex((i) => Math.min(Math.max(next, 0), total - 1));

  const submitNow = async (e) => {
    e?.preventDefault?.();
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
          const res = await fetch('/api/placement/evaluate-writing', {
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
            throw new Error(data.error || 'No se pudo corregir el writing.');
          }
          setWritingEval(data);
        } catch (err) {
          setWritingEvalError(err.message || 'Error al corregir el writing.');
        } finally {
          setEvaluatingWriting(false);
        }
      }
    }

    setTimeout(() => topRef.current?.focus?.(), 0);
  };

  const handleReset = () => {
    localStorage.removeItem(LOCAL_KEY);
    void fetchQuestions({ forceNew: true });
  };

  // Puntuación
  const score = useMemo(() => {
    if (!submitted) return 0;
    let s = 0;
    for (const q of questions) {
      if (q.type === 'writing') continue;
      if (String(answers[q.id] ?? '').trim() === String(q.answer).trim()) {
        s += 1;
      }
    }
    if (writingEval?.countsAsCorrect) s += 1;
    return s;
  }, [submitted, answers, questions, writingEval]);

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
            Elige un tema y escribe entre {q.wordMin ?? 150} y {q.wordMax ?? 200} palabras en inglés.
          </p>
          <fieldset className="space-y-2" disabled={submitted}>
            <legend className="text-sm font-medium text-slate-800 mb-2">Tema elegido</legend>
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
                  <strong className="mr-1">Opción {String.fromCharCode(65 + i)}:</strong>
                  {opt}
                </span>
              </label>
            ))}
          </fieldset>
          <div>
            <label htmlFor={`writing-${q.id}`} className="text-sm font-medium text-slate-800">
              Tu texto en inglés
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
              Palabras: {words} / objetivo {q.wordMin ?? 150}–{q.wordMax ?? 200}
            </p>
          </div>
          {submitted && evaluatingWriting && (
            <p className="text-sm text-indigo-600">Corrigiendo tu writing con IA…</p>
          )}
          {submitted && writingEvalError && (
            <p className="text-sm text-red-600">{writingEvalError}</p>
          )}
          {submitted && writingEval && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-4 text-sm space-y-2">
              <p>
                <strong>Corrección IA:</strong> {writingEval.scorePercent}% —{' '}
                {writingEval.countsAsCorrect ? 'suma 1 punto al placement' : 'no suma punto'}
              </p>
              <p>{writingEval.feedback}</p>
              {writingEval.strengths?.length > 0 && (
                <p><strong>Fortalezas:</strong> {writingEval.strengths.join(' · ')}</p>
              )}
              {writingEval.improvements?.length > 0 && (
                <p><strong>A mejorar:</strong> {writingEval.improvements.join(' · ')}</p>
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
    () => (submitted ? levelFromScore(score, total) : null),
    [submitted, score, total],
  );
  const recommendation = useMemo(() => (level ? levelRecommendations[level] : null), [level]);

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
            <p className="mt-2 text-slate-600">Un test moderno para estimar tu nivel de inglés. Sin secciones, sin ruido.</p>
          </div>
        </header>

        {/* Barra superior */}
        <div className="sticky top-4 z-20 mb-6 bg-white/80 backdrop-blur rounded-2xl border p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"/>
                <span>Progreso:</span>
                <strong>{progressLabel}</strong>
              </span>
              <span className="opacity-70" aria-label="porcentaje completado">{progress}%</span>
              {/* (Eliminado) Ir a la primera sin responder */}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono">⏱ {fmt(seconds)}</span>
              <button type="button" onClick={() => setIsPaused((p) => !p)} className="btn">{isPaused ? 'Reanudar' : 'Pausar'}</button>
              {!submitted ? (
                <button type="button" onClick={() => setConfirmOpen(true)} className="btn btn-primary">Enviar</button>
              ) : (
                <button type="button" onClick={handleReset} className="btn btn-dark">Reiniciar</button>
              )}
            </div>
          </div>
          <div className="mt-3 w-full h-2 bg-gray-200 rounded overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" style={{ width: `${progress}%`, transition: 'width .2s ease' }} />
          </div>
        </div>

        {!session || loadingQuestions ? (
          <p className="text-center">Cargando preguntas…</p>
        ) : loadError ? (
          <div className="text-center space-y-4 rounded-2xl border bg-white p-6">
            <p className="text-red-600">{loadError}</p>
            <button type="button" className="btn btn-primary" onClick={() => fetchQuestions({ forceNew: true })}>
              Reintentar
            </button>
          </div>
        ) : total === 0 ? (
          <p className="text-center">No hay preguntas disponibles.</p>
        ) : (
          <div className="space-y-6">
            {/* Tarjeta de pregunta actual */}
            <div className="rounded-3xl border bg-white shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold">Pregunta {index + 1} de {total}</h2>
                {!submitted && current?.type === 'writing' ? (
                  <span className="pill">Writing · 150–200 palabras</span>
                ) : !submitted ? (
                  <span className="pill">Opcional</span>
                ) : null}
              </div>
              {current?.type !== 'writing' && (
                <div className="mt-2 text-xl leading-relaxed">{current.text}</div>
              )}

              <div className="mt-5">
                {renderQuestion(current)}
              </div>

              {submitted &&
                current?.type !== 'writing' &&
                String(answers[current.id] ?? '').trim() !== String(current.answer ?? '').trim() && (
                  <p className="mt-4 text-sm text-red-600">
                    Correcta: <strong>{String(current.answer)}</strong>{' '}
                    {current.explanation ? `— ${current.explanation}` : ''}
                  </p>
                )}

              {/* Navegación */}
              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={() => goto(index - 1)} disabled={index === 0} className="btn disabled:opacity-40">Anterior</button>
                <div className="flex items-center gap-2">
                  {/* (Eliminado) Saltar a sin responder */}
                  {index === total - 1 && !submitted ? (
                    <button type="button" onClick={() => setConfirmOpen(true)} className="btn btn-primary">Enviar</button>
                  ) : (
                    <button type="button" onClick={() => goto(index + 1)} disabled={index === total - 1 || submitted} className="btn disabled:opacity-40">Siguiente</button>
                  )}
                </div>
              </div>
            </div>

            {/* Rejilla de navegación rápida */}
            <div className="rounded-3xl border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {questions.map((q, i) => {
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
                    title={`Ir a la pregunta ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Resultados */}
            {submitted && (
              <section className="rounded-3xl border bg-white shadow-sm p-6" aria-live="polite">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                  <div className="shrink-0 leading-none mx-auto sm:mx-0" aria-hidden>
                    <SiteMascot variant={7} width={100} alt="" />
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                <h3 className="text-xl font-semibold">Resultados</h3>
                <p className="mt-1">Aciertos: <span className="font-semibold">{score}</span> / {total}</p>
                {evaluatingWriting && (
                  <p className="text-sm text-indigo-600 mt-1">Corrigiendo writing con IA…</p>
                )}
                  </div>
                </div>

                {level && (
                  <div className="mt-3">
                    <p className="text-slate-600">Tu nivel estimado es <span className="font-semibold">{level}</span>.</p>
                    {recommendation && (
                      <div className="mt-3 flex items-center gap-3">
                        <Link href={recommendation.link} className="btn btn-primary">Comenzar en {level}: {recommendation.title}</Link>
                        <button type="button" className="btn" onClick={() => router.push(recommendation.link)}>Ir ahora</button>
                        {/* Eliminado: botón “No redirigir” y aviso de redirección automática */}
                      </div>
                    )}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer select-none">Ver preguntas incorrectas</summary>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    {questions.filter((q) => {
                      if (q.type === 'writing') {
                        return submitted && writingEval && !writingEval.countsAsCorrect;
                      }
                      return answers[q.id] && String(answers[q.id]) !== String(q.answer);
                    }).map((q) => (
                      <li key={`wrong-${q.id}`}>
                        <button type="button" className="text-blue-700 underline decoration-dotted" onClick={() => setIndex(questions.findIndex((x) => x.id === q.id))}>
                          Ir a la {questions.findIndex((x) => x.id === q.id) + 1}
                        </button>
                        {' '}
                        {q.type === 'writing' ? (
                          <>— Revisa la corrección IA en la pregunta {questions.findIndex((x) => x.id === q.id) + 1}</>
                        ) : (
                          <>
                            — Tu respuesta: <span className="line-through">{String(answers[q.id])}</span> · Correcta:{' '}
                            <strong>{String(q.answer)}</strong> {q.explanation ? `— ${q.explanation}` : ''}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              </section>
            )}
          </div>
        )}

        {/* Modal de confirmación */}
        {confirmOpen && !submitted && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-lg font-semibold">¿Enviar el test?</h4>
              <p className="text-sm text-gray-600 mt-1">Has respondido {answeredCount} de {total} preguntas.</p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" className="btn" onClick={() => setConfirmOpen(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={submitNow}>Enviar ahora</button>
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
  `}</style>
);
