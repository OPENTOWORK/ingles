'use client';

import { GOAL_LABELS, SKILL_LABELS } from '@/lib/buildStudyPlanDocument';
import styles from './StudyPlanSurveyAnswers.module.css';

function labelsFromIds(ids, map) {
  return (ids || []).map((id) => map[id] || id).filter(Boolean);
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(`${value}T12:00:00`).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

/**
 * Vista de solo lectura de la encuesta que rellena el alumno (para admin).
 */
export default function StudyPlanSurveyAnswers({
  plan,
  studentName,
  studentEmail,
  forAdmin = false,
}) {
  if (!plan) return null;

  const goals = labelsFromIds(plan.study_goals, GOAL_LABELS);
  const strengths = labelsFromIds(plan.strengths, SKILL_LABELS);
  const weaknesses = labelsFromIds(plan.weaknesses, SKILL_LABELS);

  return (
    <article className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {forAdmin ? 'Resumen de la encuesta (vista previa)' : 'Tu encuesta'}
        </h2>
        {(studentName || studentEmail) && (
          <p className={styles.student}>
            {studentName && <strong>{studentName}</strong>}
            {studentEmail && (
              <span className={styles.email}>
                {studentName ? ' · ' : ''}
                {studentEmail}
              </span>
            )}
          </p>
        )}
        <p className={styles.meta}>
          Nivel placement: <strong>{plan.placement_level || '—'}</strong>
          {plan.completed_at && (
            <>
              {' '}
              · Respondida el {formatDateTime(plan.completed_at)}
            </>
          )}
        </p>
        {forAdmin && (
          <p className={styles.hint}>
            {studentName
              ? 'Respuestas del alumno tras el placement test.'
              : 'Vista previa: así se mostrarán las respuestas cuando un alumno complete la encuesta.'}
          </p>
        )}
      </header>

      <dl className={styles.list}>
        <div className={styles.row}>
          <dt>¿Qué quieres lograr?</dt>
          <dd>
            {goals.length > 0 ? (
              <ul className={styles.tags}>
                {goals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            ) : (
              '—'
            )}
          </dd>
        </div>

        <div className={styles.row}>
          <dt>Tiempo real de estudio (horas/semana)</dt>
          <dd>
            <strong>{plan.hours_per_week != null ? `${plan.hours_per_week} h` : '—'}</strong>
          </dd>
        </div>

        <div className={styles.row}>
          <dt>Fecha objetivo del examen</dt>
          <dd>{formatDate(plan.exam_goal_date)}</dd>
        </div>

        <div className={styles.row}>
          <dt>Fortalezas</dt>
          <dd>
            {strengths.length > 0 ? (
              <ul className={styles.tags}>
                {strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              <span className={styles.muted}>No indicadas</span>
            )}
          </dd>
        </div>

        <div className={styles.row}>
          <dt>Áreas a mejorar</dt>
          <dd>
            {weaknesses.length > 0 ? (
              <ul className={styles.tags}>
                {weaknesses.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : (
              '—'
            )}
          </dd>
        </div>

        <div className={styles.row}>
          <dt>Comentarios adicionales</dt>
          <dd className={styles.notes}>
            {plan.other_notes?.trim() ? plan.other_notes.trim() : (
              <span className={styles.muted}>Sin comentarios</span>
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
}
