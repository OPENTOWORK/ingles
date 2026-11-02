'use client';

import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { DRALO_AI_HUB } from '@/data/draloAiConfig';

const ACCENTS = {
  indigo: { solid: '#6366f1', soft: '#eef2ff', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  ocean: { solid: '#2563eb', soft: '#eff6ff', gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)' },
  amber: { solid: '#d97706', soft: '#fffbeb', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  emerald: { solid: '#059669', soft: '#ecfdf5', gradient: 'linear-gradient(135deg, #059669, #14b8a6)' },
  rose: { solid: '#e11d48', soft: '#fff1f2', gradient: 'linear-gradient(135deg, #e11d48, #db2777)' },
  lime: { solid: '#65a30d', soft: '#f7fee7', gradient: 'linear-gradient(135deg, #65a30d, #84cc16)' },
  violet: { solid: '#7c3aed', soft: '#f5f3ff', gradient: 'linear-gradient(135deg, #7c3aed, #6366f1)' },
};

function HubIcon({ id }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (id === 'listening') {
    return (
      <svg {...common}>
        <path d="M4 13a8 8 0 0 1 16 0" />
        <path d="M4 14v2a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2z" />
        <path d="M20 14v2a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (id === 'speaking') {
    return (
      <svg {...common}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M6 11a6 6 0 0 0 12 0" />
        <path d="M12 17v4" />
      </svg>
    );
  }
  if (id === 'grammar-coach') {
    return (
      <svg {...common}>
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M8 14a5 5 0 1 1 8 0c-.8.8-1.5 1.4-1.7 2.2H9.7C9.5 15.4 8.8 14.8 8 14z" />
      </svg>
    );
  }
  if (id === 'pronunciation-coach') {
    return (
      <svg {...common}>
        <path d="M4 10v4" />
        <path d="M8 7v10" />
        <path d="M12 4v16" />
        <path d="M16 8v8" />
        <path d="M20 11v2" />
      </svg>
    );
  }
  if (id === 'dictionary') {
    return (
      <svg {...common}>
        <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22.5z" />
        <path d="M5 4.5V22" />
        <path d="M9 7h7" />
        <path d="M9 11h7" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
    </svg>
  );
}

export default function DraloAiHubPage() {
  return (
    <main className="dralo-ai-page">
      <PageHero
        eyebrow="Artificial intelligence"
        title={DRALO_AI_HUB.title}
        accent="violet"
        mascotVariant={10}
        stats={[
          { value: String(DRALO_AI_HUB.items.length), label: 'Tools' },
          { value: 'AI', label: 'Dralo' },
          { value: 'A2–C2', label: 'Levels' },
        ]}
      />

      <section className="dralo-ai-hub__grid" aria-label="Dralo AI tools" data-tour="dralo-ai-hub">
        {DRALO_AI_HUB.items.map((item) => {
          const accent = ACCENTS[item.accent] || ACCENTS.indigo;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="dralo-ai-hub__card"
              style={{
                '--dralo-accent': accent.gradient,
                '--dralo-accent-solid': accent.solid,
                '--dralo-accent-soft': accent.soft,
              }}
            >
              <span className="dralo-ai-hub__icon" aria-hidden>
                <HubIcon id={item.id} />
              </span>
              <h2 className="dralo-ai-hub__label">{item.label}</h2>
              <p className="dralo-ai-hub__tagline">{item.tagline}</p>
              <span className="dralo-ai-hub__cta">
                {item.external ? 'Open speaking practice' : 'Open studio'}
                <span aria-hidden>→</span>
              </span>
            </Link>
          );
        })}
      </section>

    </main>
  );
}
