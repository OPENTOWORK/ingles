'use client';

import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import { SECTION_CATALOG, SECTIONS } from '@/data/teoriaSections';

const TOPIC_COUNT = Object.values(SECTIONS).reduce((n, topics) => n + topics.length, 0);

export default function TeoriaPage() {
  return (
    <main className="shell teoria-page">
      <PageHero
        eyebrow="Study hub"
        title="Theory"
        description="Explore grammar, exam skills, and communication topics — organised by skill area and CEFR level."
        mascotVariant={4}
        mascotWidth={156}
        accent="violet"
        stats={[
          { value: String(SECTION_CATALOG.length), label: 'Skill areas' },
          { value: String(TOPIC_COUNT), label: 'Topics' },
        ]}
      />

      <ul className="area-grid">
        {SECTION_CATALOG.map((area) => {
          const count = SECTIONS[area.key]?.length ?? 0;
          const initial = area.key.charAt(0);

          return (
            <li key={area.slug}>
              <Link href={`/teoria/${area.slug}`} className="area-card">
                <div className="area-card__head">
                  <span
                    className="area-card__icon"
                    style={{ background: area.accent }}
                    aria-hidden
                  >
                    {initial}
                  </span>
                  <span className="area-card__title">{area.key}</span>
                </div>
                <span className="area-card__desc">{area.description}</span>
                <span className="area-card__meta">
                  {count} topic{count === 1 ? '' : 's'} →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <TeoriaGlobalStyles />
    </main>
  );
}
