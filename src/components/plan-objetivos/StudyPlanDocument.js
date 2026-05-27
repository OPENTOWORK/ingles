'use client';

import Link from 'next/link';
import { GOAL_LABELS, SKILL_LABELS } from '@/lib/buildStudyPlanDocument';
import styles from './StudyPlanDocument.module.css';

function renderParagraph(text) {
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

export default function StudyPlanDocument({ plan, showActions = true, onEdit }) {
  const doc = plan?.plan_document;
  if (!doc?.sections) {
    return (
      <p className="text-slate-600">No hay documento de plan disponible.</p>
    );
  }

  const goals = (plan.study_goals || []).map((id) => GOAL_LABELS[id] || id);

  return (
    <article className={styles.doc}>
      <header className={styles.docHeader}>
        <h1 className={styles.docTitle}>Tu plan de estudios Dralo</h1>
        <div className={styles.meta}>
          <span>
            Nivel: <strong>{plan.placement_level || doc.placementLevel || '—'}</strong>
          </span>
          <span>
            Estudio: <strong>{plan.hours_per_week} h/semana</strong>
          </span>
          {plan.exam_goal_date && (
            <span>
              Examen: <strong>{plan.exam_goal_date}</strong>
              {doc.daysToExam != null ? ` (${doc.daysToExam} días)` : ''}
            </span>
          )}
        </div>
        {goals.length > 0 && (
          <p className={styles.meta} style={{ marginTop: '0.5rem' }}>
            Objetivos: {goals.join(' · ')}
          </p>
        )}
      </header>

      {doc.sections.map((section) => (
        <section key={section.id} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>

          {section.paragraphs?.map((p, i) => (
            <p key={i} className={styles.paragraph}>
              {renderParagraph(p)}
            </p>
          ))}

          {section.bullets?.length > 0 && (
            <ul className={styles.list}>
              {section.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}

          {section.schedule?.map((block, i) => (
            <div key={i} className={styles.scheduleBlock}>
              <div className={styles.scheduleDay}>{block.day}</div>
              <ul className={styles.list}>
                {block.tasks.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            </div>
          ))}

          {section.milestones?.map((m, i) => (
            <div key={i} className={styles.milestone}>
              <span className={styles.milestoneWeek}>Sem. {m.week}</span>
              <div>
                <strong>{m.title}</strong>
                <p className={styles.paragraph} style={{ margin: '0.25rem 0 0' }}>
                  {m.detail}
                </p>
              </div>
            </div>
          ))}
        </section>
      ))}

      {(plan.strengths?.length > 0 || plan.weaknesses?.length > 0) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Resumen de habilidades</h2>
          <ul className={styles.list}>
            {plan.strengths?.length > 0 && (
              <li>
                Fortalezas:{' '}
                {plan.strengths.map((s) => SKILL_LABELS[s] || s).join(', ')}
              </li>
            )}
            {plan.weaknesses?.length > 0 && (
              <li>
                Prioridad:{' '}
                {plan.weaknesses.map((s) => SKILL_LABELS[s] || s).join(', ')}
              </li>
            )}
          </ul>
        </section>
      )}

      {showActions && (
        <div className={styles.actions}>
          <Link href="/training" className="btn btn-primary">
            Ir a Training
          </Link>
          <Link href="/niveles" className="btn">
            Ir a Levels
          </Link>
          {onEdit && (
            <button type="button" className="btn btn-secondary" onClick={onEdit}>
              Actualizar encuesta
            </button>
          )}
        </div>
      )}
    </article>
  );
}
