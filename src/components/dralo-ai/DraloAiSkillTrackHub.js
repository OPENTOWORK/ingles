'use client';

import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';
import {
  DRALO_AI_EXAM_TRACK,
  DRALO_AI_SITUATIONAL_TRACK,
} from '@/data/draloAiSituationalConfig';

const ACCENT_SOLID = {
  indigo: '#6366f1',
  ocean: '#2563eb',
  amber: '#d97706',
  emerald: '#059669',
  rose: '#e11d48',
};

export default function DraloAiSkillTrackHub({ skillId }) {
  const config = DRALO_AI_MODES[skillId];
  if (!config) return null;

  const base = `/dralo-ai/${skillId}`;
  const accentSolid = ACCENT_SOLID[config.accent] || ACCENT_SOLID.indigo;

  return (
    <main className="dralo-ai-page" style={{ '--dralo-accent-solid': accentSolid }}>
      <div className="page-hero-wrap__breadcrumb">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/dralo-ai">Dralo AI</Link>
          <span aria-hidden> / </span>
          <span>{config.title}</span>
        </nav>
      </div>

      <PageHero
        eyebrow={config.eyebrow}
        title={config.title}
        description="Elige cómo quieres practicar: partes del examen Cambridge o situaciones del mundo real."
        accent={config.accent}
        mascotVariant={config.mascotVariant}
      />

      <div className="dralo-ai-track-hub">
        <Link href={`${base}/exam`} className="dralo-ai-track-card dralo-ai-track-card--exam">
          <span className="dralo-ai-track-card__icon" aria-hidden>
            {DRALO_AI_EXAM_TRACK.icon}
          </span>
          <h2 className="dralo-ai-track-card__title">{DRALO_AI_EXAM_TRACK.label}</h2>
          <p className="dralo-ai-track-card__desc">{DRALO_AI_EXAM_TRACK.description}</p>
          <ul className="dralo-ai-track-card__list">
            {(skillId === 'speaking'
              ? [
                  { id: 'p1', icon: '🗣️', label: 'Part 1: Interview' },
                  { id: 'p2', icon: '🖼️', label: 'Part 2: Long turn' },
                  { id: 'p3', icon: '🤝', label: 'Part 3: Collaborative task' },
                  { id: 'p4', icon: '💬', label: 'Part 4: Discussion' },
                ]
              : config.activities
            ).map((a) => (
              <li key={a.id}>
                {a.icon} {a.label}
              </li>
            ))}
          </ul>
          {skillId === 'speaking' ? (
            <p className="dralo-ai-track-card__hint" style={{ marginTop: 8 }}>
              A2–C2: el número de partes se adapta a tu nivel en el filtro.
            </p>
          ) : null}
          <span className="dralo-ai-track-card__cta">Entrar →</span>
        </Link>

        <Link
          href={`${base}/situational`}
          className="dralo-ai-track-card dralo-ai-track-card--situational"
        >
          <span className="dralo-ai-track-card__icon" aria-hidden>
            {DRALO_AI_SITUATIONAL_TRACK.icon}
          </span>
          <h2 className="dralo-ai-track-card__title">{DRALO_AI_SITUATIONAL_TRACK.label}</h2>
          <p className="dralo-ai-track-card__desc">{DRALO_AI_SITUATIONAL_TRACK.description}</p>
          <p className="dralo-ai-track-card__hint">
            {skillId === 'speaking'
              ? 'Role play con el avatar (aeropuerto, hotel, entrevistas…)'
              : skillId === 'writing'
                ? 'WhatsApp, emails, artículos…'
                : 'Textos y audios auténticos del día a día'}
          </p>
          <span className="dralo-ai-track-card__cta">Entrar →</span>
        </Link>
      </div>
    </main>
  );
}
