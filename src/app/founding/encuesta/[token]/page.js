'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { FOUNDING_SURVEY_QUESTIONS, FOUNDING_SURVEY_RESPONSE_DAYS } from '@/lib/foundingSurvey.rules';
import styles from './Encuesta.module.css';

/** Enlace de muestra que reciben los administradores en el correo de prueba. */
const PREVIEW_TOKEN = 'preview';

function Shell({ children }) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <p className={styles.brand}>
          Dralo<span className={styles.brandAccent}>English</span>
        </p>
        <section className={styles.card}>{children}</section>
      </div>
    </main>
  );
}

function ScaleQuestion({ question, value, onChange, disabled }) {
  const values = [];
  for (let n = question.min; n <= question.max; n += 1) values.push(n);

  return (
    <>
      <div className={styles.scale}>
        {values.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`${styles.scaleButton} ${value === n ? styles.scaleButtonActive : ''}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className={styles.scaleLabels}>
        <span>{question.minLabel}</span>
        <span>{question.maxLabel}</span>
      </div>
    </>
  );
}

function ChoiceQuestion({ question, value, onChange, disabled }) {
  return (
    <div className={styles.options}>
      {question.options.map((option) => (
        <label
          key={option}
          className={`${styles.option} ${value === option ? styles.optionActive : ''}`}
        >
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={value === option}
            disabled={disabled}
            onChange={() => onChange(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

export default function FoundingSurveyPage() {
  const params = useParams();
  const token = String(params?.token || '');
  const isPreview = token === PREVIEW_TOKEN;

  const [loading, setLoading] = useState(!isPreview);
  const [loadError, setLoadError] = useState('');
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isPreview) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/founding-member/encuesta/${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setLoadError(data?.error || 'Este enlace no es válido.');
        else setSurvey(data);
      } catch {
        if (!cancelled) setLoadError('No hemos podido cargar el formulario. Inténtalo de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isPreview, token]);

  const questions = useMemo(
    () => survey?.preguntas || FOUNDING_SURVEY_QUESTIONS,
    [survey],
  );

  const setAnswer = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => (prev[id] ? { ...prev, [id]: undefined } : prev));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isPreview || submitting) return;

    setSubmitting(true);
    setSubmitError('');
    setFieldErrors({});

    try {
      const res = await fetch(`/api/founding-member/encuesta/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestas: answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFieldErrors(data?.errors || {});
        setSubmitError(data?.error || 'No se pudieron guardar tus respuestas.');
        return;
      }

      setDone(true);
    } catch {
      setSubmitError('No hemos podido enviar el formulario. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Shell>
        <p className={styles.stateText}>Cargando tu formulario…</p>
      </Shell>
    );
  }

  if (loadError) {
    return (
      <Shell>
        <span className={styles.stateIcon} aria-hidden="true">
          🔒
        </span>
        <h1 className={styles.title}>Este enlace no está disponible</h1>
        <p className={styles.stateText}>{loadError}</p>
        <a className={styles.link} href="/">
          Ir a Dralo
        </a>
      </Shell>
    );
  }

  if (done || survey?.estado === 'respondida') {
    return (
      <Shell>
        <span className={styles.stateIcon} aria-hidden="true">
          🎉
        </span>
        <h1 className={styles.title}>Tu Plan Plus es tuyo de por vida</h1>
        <p className={styles.stateText}>
          Hemos recibido tus respuestas. El Plan Plus queda confirmado sin coste y sin fecha de
          caducidad. Gracias por el rato que le has dedicado: leemos todo lo que nos llega.
        </p>
        <a className={styles.link} href="/">
          Volver a Dralo
        </a>
      </Shell>
    );
  }

  if (survey?.estado === 'vencida' || survey?.estado === 'revocada') {
    return (
      <Shell>
        <span className={styles.stateIcon} aria-hidden="true">
          ⏳
        </span>
        <h1 className={styles.title}>El plazo ya ha terminado</h1>
        <p className={styles.stateText}>
          Tenías {FOUNDING_SURVEY_RESPONSE_DAYS} días para responder y la plaza de lanzamiento ya ha
          vuelto al cupo. Tu progreso sigue intacto y puedes seguir practicando con el Plan Free. Si
          fue un despiste, escríbenos y lo miramos.
        </p>
        <a className={styles.link} href="/contacto">
          Escribirnos
        </a>
      </Shell>
    );
  }

  return (
    <Shell>
      {isPreview && (
        <p className={styles.previewNotice}>
          <strong>Vista previa para el equipo.</strong> Así ve el formulario el alumno. Aquí no se
          guarda nada ni se modifica ningún plan.
        </p>
      )}

      <h1 className={styles.title}>
        {survey?.nombre ? `${survey.nombre}, tu Plan Plus de por vida` : 'Tu Plan Plus de por vida'}
      </h1>
      <p className={styles.intro}>
        Fuiste de las 50 primeras personas en confiar en Dralo y te regalamos el Plan Plus. Lo único
        que te pedimos a cambio son estas preguntas: al enviarlas, el Plan Plus queda confirmado de
        por vida, gratis y sin caducidad.
      </p>
      {survey?.fechaLimite && (
        <p className={styles.deadline}>
          Plazo hasta el {survey.fechaLimite}
          {typeof survey.diasRestantes === 'number' ? ` · quedan ${survey.diasRestantes} días` : ''}
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        {questions.map((question) => (
          <div key={question.id} className={styles.question}>
            <p className={styles.label}>
              {question.label}
              {!question.required && <span className={styles.optional}>opcional</span>}
            </p>

            {question.type === 'scale' && (
              <ScaleQuestion
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswer(question.id, value)}
                disabled={isPreview}
              />
            )}

            {question.type === 'choice' && (
              <ChoiceQuestion
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswer(question.id, value)}
                disabled={isPreview}
              />
            )}

            {question.type === 'text' && (
              <textarea
                className={styles.textarea}
                maxLength={question.maxLength}
                value={answers[question.id] || ''}
                disabled={isPreview}
                onChange={(event) => setAnswer(question.id, event.target.value)}
              />
            )}

            {fieldErrors[question.id] && (
              <p className={styles.error}>{fieldErrors[question.id]}</p>
            )}
          </div>
        ))}

        {submitError && <p className={styles.formError}>{submitError}</p>}

        <button type="submit" className={styles.submit} disabled={isPreview || submitting}>
          {submitting ? 'Enviando…' : 'Enviar y conservar mi Plan Plus'}
        </button>

        <p className={styles.footnote}>
          Usamos tus respuestas solo para mejorar Dralo. Nada de esto se publica ni se comparte.
        </p>
      </form>
    </Shell>
  );
}
