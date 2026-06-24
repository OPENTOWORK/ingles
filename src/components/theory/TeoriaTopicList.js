'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import TeoriaFilterToolbar from '@/components/theory/TeoriaFilterToolbar';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import { SECTION_CATALOG, filterTopics } from '@/data/teoriaSections';
import { APP_ROUTES } from '@/config/appRoutes';

export default function TeoriaTopicList({ sectionTitle, topics }) {
  const [query, setQuery] = useState('');

  const clear = useCallback(() => {
    setQuery('');
  }, []);

  const filtered = useMemo(() => filterTopics(topics, { query }), [topics, query]);

  const sectionMeta = SECTION_CATALOG.find((s) => s.key === sectionTitle);

  return (
    <main className="shell teoria-page">
      <PageHero
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href={sectionMeta?.slug && ['use-of-english', 'reading', 'listening', 'writing', 'speaking'].includes(sectionMeta.slug) ? APP_ROUTES.examStrategies : APP_ROUTES.teoria}>
              {['use-of-english', 'reading', 'listening', 'writing', 'speaking'].includes(sectionMeta?.slug) ? 'Exam Strategies' : 'Theory'}
            </Link>
            <span aria-hidden>›</span>
            <span>{sectionTitle}</span>
          </nav>
        }
        eyebrow={sectionMeta?.key || 'Theory'}
        title={sectionTitle}
        description={sectionMeta?.description || 'Search by title and explore topics in this area.'}
        mascotVariant={4}
        mascotWidth={140}
        accent={sectionMeta?.heroAccent || 'violet'}
        stats={[
          { value: String(topics.length), label: 'Topics' },
          { value: String(filtered.length), label: 'Showing' },
        ]}
      />

      <TeoriaFilterToolbar
        query={query}
        onQueryChange={setQuery}
        onClear={clear}
        filteredCount={filtered.length}
        totalCount={topics.length}
      />

      {filtered.length === 0 ? (
        <EmptyState onReset={clear} />
      ) : (
        <ul className="topic-grid">
          {filtered.map((t, i) => (
            <li key={`${t.href}-${i}`}>
              <Link href={t.href} className="card">
                <div className="card__title">{t.text}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <TeoriaGlobalStyles />
    </main>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="empty">
      <h3>No results</h3>
      <p>Try removing filters or searching for another term.</p>
      <button type="button" className="btn" onClick={onReset}>
        Clear filters
      </button>
    </div>
  );
}
