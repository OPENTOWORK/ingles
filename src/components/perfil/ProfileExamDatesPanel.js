'use client';

import { useMemo } from 'react';
import {
  CAMBRIDGE_EXAM_CITIES,
  CAMBRIDGE_EXAM_OFFICIAL_LINKS,
} from '@/data/cambridgeExamDatesByCity';
import { getExamReadinessRecommendation } from '@/utils/examReadinessRecommendation';

/**
 * Recomendación de preparación + fechas por ciudad con enlaces oficiales.
 */
export default function ProfileExamDatesPanel({
  levelEstimate = 'B1',
  completedExams = 0,
  studyStreak = 0,
  totalStudyMinutes = 0,
}) {
  const recommendation = useMemo(
    () =>
      getExamReadinessRecommendation({
        levelEstimate,
        completedExams,
        studyStreak,
        totalStudyMinutes,
      }),
    [levelEstimate, completedExams, studyStreak, totalStudyMinutes],
  );

  return (
    <>
      <section className="profile-section">
        <div className="section-head">
          <h2>🎓 ¿Cuándo presentarte al examen?</h2>
        </div>
        <p className="section-desc">
          Recomendación personalizada según tu actividad en Dralo. Las fechas exactas dependen de
          cada centro autorizado — usa los enlaces para confirmar plazas e inscripción.
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{recommendation.level}</div>
              <div className="stat-label">Nivel estimado</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number" style={{ fontSize: '18px', lineHeight: 1.3 }}>
                {recommendation.suggestedWindow}
              </div>
              <div className="stat-label">Ventana orientativa</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              {recommendation.readiness === 'ready'
                ? '✅'
                : recommendation.readiness === 'almost'
                  ? '🟡'
                  : '📘'}
            </div>
            <div className="stat-content">
              <div className="stat-number" style={{ fontSize: '18px' }}>
                {recommendation.readinessLabel}
              </div>
              <div className="stat-label">Estado de preparación</div>
            </div>
          </div>
        </div>

        <p style={{ margin: '20px 0 12px', lineHeight: 1.55, color: 'var(--text)' }}>
          {recommendation.headline}
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#64748b', lineHeight: 1.55 }}>
          {recommendation.tips.map((tip) => (
            <li key={tip} style={{ marginBottom: '0.35rem' }}>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section className="profile-section">
        <div className="section-head">
          <h2>📅 Fechas por ciudad</h2>
        </div>
        <p className="section-desc">
          Convocatorias habituales en España (junio, agosto y diciembre en papel; computer-based con
          más frecuencia). Pulsa el enlace de tu ciudad para ver centros, fechas reales e
          inscripción.
        </p>

        <div className="skills-grid">
          {CAMBRIDGE_EXAM_CITIES.map((city) => (
            <div key={city.id} className="skill-card" style={{ textAlign: 'left' }}>
              <div className="skill-name">
                {city.name}
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666' }}>
                  {city.region}
                </span>
              </div>
              <ul
                style={{
                  margin: '12px 0',
                  paddingLeft: '1.1rem',
                  fontSize: '13px',
                  color: '#475569',
                  lineHeight: 1.45,
                }}
              >
                {city.typicalSessions.map((session) => (
                  <li key={session}>{session}</li>
                ))}
              </ul>
              <a
                href={city.centreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-action-btn"
                style={{ display: 'block', marginTop: '8px', fontSize: '14px', padding: '12px 14px' }}
              >
                Ver centros y fechas — {city.name}
              </a>
              {city.extraUrl ? (
                <a
                  href={city.extraUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#0070f3',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  British Council (España) →
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <div className="section-head">
          <h2>🔗 Recursos oficiales</h2>
        </div>
        <p className="section-desc">
          Enlaces a Cambridge English y centros autorizados para consultar plazos, precios e
          inscripción.
        </p>
        <div className="quick-actions">
          {CAMBRIDGE_EXAM_OFFICIAL_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-action-btn"
              title={link.description}
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
