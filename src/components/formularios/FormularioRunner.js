'use client';

import { useState } from 'react';
import SiteMascot from '@/components/SiteMascot';
import styles from './FormularioRunner.module.css';

function isAnswered(question, answer) {
  if (question.tipo === 'varias') return Array.isArray(answer) && answer.length > 0;
  return Boolean(String(answer ?? '').trim());
}

/** Recorre un formulario pregunta a pregunta y entrega las respuestas en `onFinish`. */
export default function FormularioRunner({
  form,
  showHeader = false,
  finishLabel = 'Enviar',
  saving = false,
  error = '',
  onFinish,
}) {
  const questions = form?.preguntas || [];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  if (questions.length === 0) return null;

  if (questions.every((question) => question.tipo === 'info')) {
    return (
      <div className={styles.runner}>
        <article className={styles.intro}>
          <SiteMascot variant={3} width={104} alt="" />
          <h2 className={styles.introTitle}>{form.titulo}</h2>
          {form.descripcion ? <p className={styles.introText}>{form.descripcion}</p> : null}
          <ul className={styles.introList}>
            {questions.map((question) => (
              <li key={question.id}>{question.titulo}</li>
            ))}
          </ul>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="button" className={styles.primary} disabled={saving} onClick={() => onFinish?.({})}>
            {saving ? 'Guardando…' : 'Empezar'}
          </button>
        </article>
      </div>
    );
  }

  const index = Math.min(step, questions.length - 1);
  const current = questions[index];
  const answer = answers[current.id];
  const isLast = index === questions.length - 1;
  const canContinue = current.tipo === 'info' || !current.obligatoria || isAnswered(current, answer);
  const options = Array.isArray(current.opciones) ? current.opciones : [];

  const setAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const toggleOption = (id) => {
    const list = Array.isArray(answer) ? answer : [];
    setAnswer(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  };

  return (
    <div className={styles.runner}>
      {showHeader ? (
        <header className={styles.header}>
          <SiteMascot variant={3} width={64} alt="" className={styles.mascot} />
          <div>
            <h2 className={styles.formTitle}>{form.titulo}</h2>
            {form.descripcion ? <p className={styles.formDesc}>{form.descripcion}</p> : null}
          </div>
        </header>
      ) : null}

      <div className={styles.progress} aria-hidden>
        <div className={styles.progressBar} style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <div className={styles.card}>
        <p className={styles.stepLabel}>
          Pregunta {index + 1} de {questions.length}
          {current.tipo !== 'info' && !current.obligatoria ? ' · Opcional' : ''}
        </p>
        <h3 className={styles.question}>{current.titulo}</h3>
        {current.ayuda ? <p className={styles.help}>{current.ayuda}</p> : null}

        {current.tipo === 'varias' && (
          <div className={styles.options}>
            {options.map((option) => {
              const selected = Array.isArray(answer) && answer.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                >
                  <input type="checkbox" checked={selected} onChange={() => toggleOption(option.id)} />
                  <span className={styles.optionText}>
                    {option.label}
                    {option.hint ? <span className={styles.optionHint}>{option.hint}</span> : null}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {current.tipo === 'una' && (
          <div className={styles.options} role="radiogroup" aria-label={current.titulo}>
            {options.map((option) => (
              <label
                key={option.id}
                className={`${styles.option} ${answer === option.id ? styles.optionSelected : ''}`}
              >
                <input
                  type="radio"
                  name={`formulario-${current.id}`}
                  checked={answer === option.id}
                  onChange={() => setAnswer(option.id)}
                />
                <span className={styles.optionText}>
                  {option.label}
                  {option.hint ? <span className={styles.optionHint}>{option.hint}</span> : null}
                </span>
              </label>
            ))}
          </div>
        )}

        {current.tipo === 'fecha' && (
          <input
            type="date"
            className={styles.input}
            value={answer || ''}
            aria-label={current.titulo}
            onChange={(event) => setAnswer(event.target.value)}
          />
        )}

        {current.tipo === 'texto' && (
          <textarea
            className={styles.input}
            rows={4}
            maxLength={2000}
            value={answer || ''}
            aria-label={current.titulo}
            onChange={(event) => setAnswer(event.target.value)}
          />
        )}

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.actions}>
          {index > 0 ? (
            <button type="button" className={styles.secondary} disabled={saving} onClick={() => setStep(index - 1)}>
              Atrás
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className={styles.primary}
            disabled={!canContinue || saving}
            onClick={() => {
              if (isLast) onFinish?.(answers);
              else setStep(index + 1);
            }}
          >
            {isLast ? (saving ? 'Guardando…' : finishLabel) : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
