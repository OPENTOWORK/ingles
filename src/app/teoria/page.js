'use client';

import Link from 'next/link';
import SiteMascot from '@/components/SiteMascot';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import { SECTION_CATALOG, SECTIONS } from '@/data/teoriaSections';

export default function TeoriaPage() {
  return (
    <main className="shell teoria-page">
      <header className="header header--mascot">
        <div className="header__copy">
          <h1>Theory</h1>
          <p>Choose an area to explore its theory topics.</p>
        </div>
        <div className="header__mascot" aria-hidden>
          <SiteMascot variant={4} width={150} alt="" />
        </div>
      </header>

      <ul className="area-grid">
        {SECTION_CATALOG.map((area) => {
          const count = SECTIONS[area.key]?.length ?? 0;
          const initial = area.key.charAt(0);

          return (
            <li key={area.slug}>
              <Link href={`/teoria/${area.slug}`} className="area-card">
                <span
                  className="area-card__icon"
                  style={{ background: area.accent }}
                  aria-hidden
                >
                  {initial}
                </span>
                <span className="area-card__title">{area.key}</span>
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
