'use client';

import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { DRALO_AI_HUB } from '@/data/draloAiConfig';

const ACCENT_GRADIENT = {
  indigo: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
  ocean: 'linear-gradient(90deg, #2563eb, #06b6d4)',
  amber: 'linear-gradient(90deg, #d97706, #f59e0b)',
  emerald: 'linear-gradient(90deg, #059669, #14b8a6)',
  rose: 'linear-gradient(90deg, #e11d48, #db2777)',
};

export default function DraloAiHubPage() {
  return (
    <main className="dralo-ai-page">
      <PageHero
        eyebrow="Inteligencia artificial"
        title={DRALO_AI_HUB.title}
        description={DRALO_AI_HUB.description}
        accent="violet"
        mascotVariant={10}
        stats={[
          { value: '5', label: 'Habilidades' },
          { value: 'IA', label: 'Dralo' },
          { value: 'B1–C1', label: 'Niveles' },
        ]}
      />

      <section className="dralo-ai-hub__grid" aria-label="Apartados Dralo AI">
        {DRALO_AI_HUB.items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="dralo-ai-hub__card"
            style={{ '--dralo-accent': ACCENT_GRADIENT[item.accent] || ACCENT_GRADIENT.indigo }}
          >
            <span className="dralo-ai-hub__icon" aria-hidden>
              {item.icon}
            </span>
            <h2 className="dralo-ai-hub__label">{item.label}</h2>
            <p className="dralo-ai-hub__tagline">{item.tagline}</p>
            <span className="dralo-ai-hub__cta">
              {item.external ? 'Abrir práctica oral →' : 'Entrar al estudio →'}
            </span>
          </Link>
        ))}
      </section>

    </main>
  );
}
