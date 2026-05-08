'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import SiteMascot from '@/components/SiteMascot';
import { placementQuestions as rawQuestions, levelFromScore, levelRecommendations } from '@/data/placementTest';

/**
 * Versión con nivel CEFR, progreso legible y mejoras de UX.
 * Cambios solicitados:
 *  - Visual de opción seleccionada antes de enviar (clase .opt.selected)
 *  - Sin “Ir a la primera sin responder”
 *  - Sin “Saltar a sin responder”
 *  - Sin redirección automática al terminar
 */

const LOCAL_KEY = 'placement.v3';
const AUTO_REDIRECT_MS = 3500; // (ya no se usa para redirigir)

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

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

  const topRef = useRef(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  // Dataset preparado: barajado y con tipo por defecto
  const questions = useMemo(() => {
    const normalized = rawQuestions.map((q, i) => ({
      id: q.id ?? i + 1,
      type: q.type || 'mcq',
      text: q.text,
      options: q.options || (q.type === 'tf' ? ['True', 'False'] : []),
      answer: q.answer,
      explanation: q.explanation,
      media: q.media,
    }));
    return shuffle(normalized).map((q) =>
      q.type === 'mcq' && Array.isArray(q.options)
        ? { ...q, options: shuffle(q.options) }
        : q
    );
  }, []);

  const total = questions.length;

  // Cargar estado persistido
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.v === 3 && saved.total === total) {
        setAnswers(saved.answers || {});
        setSubmitted(!!saved.submitted);
        setSeconds(saved.seconds || 0);
        setIndex(Math.min(saved.index ?? 0, total - 1));
      }
    } catch {}
  }, [total]);

  // Guardar estado
  useEffect(() => {
    const payload = JSON.stringify({ v: 3, total, answers, submitted, seconds, index });
    localStorage.setItem(LOCAL_KEY, payload);
  }, [answers, submitted, seconds, index, total]);

  // Temporizador
  useEffect(() => {
    if (submitted || isPaused) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [submitted, isPaused]);

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
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = Math.round((answeredCount / total) * 100);
  const progressLabel = `${answeredCount} de ${total}`;

  const handleChange = useCallback((qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, []);

  const goto = (next) => setIndex((i) => Math.min(Math.max(next, 0), total - 1));

  const submitNow = (e) => {
    e?.preventDefault?.();
    setSubmitted(true);
    setIsPaused(true);
    setConfirmOpen(false);
    setCancelAuto(false);
    setTimeout(() => topRef.current?.focus?.(), 0);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setSeconds(0);
    setIsPaused(false);
    setIndex(0);
    localStorage.removeItem(LOCAL_KEY);
  };

  // Puntuación
  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce(
      (acc, q) =>
        acc + (String(answers[q.id] ?? '').trim() === String(q.answer).trim() ? 1 : 0),
      0
    );
  }, [submitted, answers, questions]);

  // Renderizador de pregunta por tipo (mcq, tf, cloze)
  const renderQuestion = (q) => {
    if (!q) return null;

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
  const level = useMemo(() => (submitted ? levelFromScore(score) : null), [submitted, score]);
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

        {!session ? (
          <p className="text-center">Cargando…</p>
        ) : (
          <div className="space-y-6">
            {/* Tarjeta de pregunta actual */}
            <div className="rounded-3xl border bg-white shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold">Pregunta {index + 1} de {total}</h2>
                {!submitted && (
                  <span className="pill">Opcional</span>
                )}
              </div>
              <div className="mt-2 text-xl leading-relaxed">{current.text}</div>

              <div className="mt-5">
                {renderQuestion(current)}
              </div>

              {submitted && answers[current.id] !== current.answer && (
                <p className="mt-4 text-sm text-red-600">Correcta: <strong>{String(current.answer)}</strong> {current.explanation ? `— ${current.explanation}` : ''}</p>
              )}

              {/* Navegación */}
              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={() => goto(index - 1)} disabled={index === 0} className="btn disabled:opacity-40">Anterior</button>
                <div className="flex items-center gap-2">
                  {/* (Eliminado) Saltar a sin responder */}
                  <button type="button" onClick={() => goto(index + 1)} disabled={index === total - 1} className="btn disabled:opacity-40">Siguiente</button>
                </div>
              </div>
            </div>

            {/* Rejilla de navegación rápida */}
            <div className="rounded-3xl border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`bubble ${i === index ? 'bubble--active' : answers[q.id] ? 'bubble--done' : ''}`}
                    title={`Ir a la pregunta ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
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
                    {questions.filter((q) => answers[q.id] && String(answers[q.id]) !== String(q.answer)).map((q) => (
                      <li key={`wrong-${q.id}`}>
                        <button type="button" className="text-blue-700 underline decoration-dotted" onClick={() => setIndex(questions.findIndex((x) => x.id === q.id))}>
                          Ir a la {questions.findIndex((x) => x.id === q.id) + 1}
                        </button>
                        {' '}— Tu respuesta: <span className="line-through">{String(answers[q.id])}</span> · Correcta: <strong>{String(q.answer)}</strong> {q.explanation ? `— ${q.explanation}` : ''}
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
  .bubble{width:2.25rem;height:2.25rem;border-radius:9999px;border:1px solid #e2e8f0;background:#fff;display:grid;place-items:center}
  .bubble--active{background:#2563eb;border-color:#2563eb;color:#fff}
  .bubble--done{background:#f0fdf4;border-color:#86efac}
  input[type="text"]{padding:.5rem .75rem;border:1px solid #e2e8f0;border-radius:.6rem;outline:none}
  input[type="text"]:focus{box-shadow:0 0 0 4px rgba(37,99,235,.15);border-color:#93c5fd}
  `}</style>
);
