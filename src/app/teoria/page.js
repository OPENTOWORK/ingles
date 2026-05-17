'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import SiteMascot from '@/components/SiteMascot';
import TeoriaFilterToolbar from '@/components/theory/TeoriaFilterToolbar';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import {
  SECTION_CATALOG,
  SECTIONS,
  buildAllTopicsFlat,
  filterTopicsGlobal,
} from '@/data/teoriaSections';

const ALL_TOPICS = buildAllTopicsFlat();
const TOPIC_COUNT = ALL_TOPICS.length;

export default function TeoriaPage() {
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [query, setQuery] = useState('');

  const toggleLevel = useCallback(
    (code) =>
      setSelectedLevels((prev) =>
        prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code],
      ),
    [],
  );

  const toggleSection = useCallback(
    (key) =>
      setSelectedSections((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
      ),
    [],
  );

  const clearFilters = useCallback(() => {
    setSelectedLevels([]);
    setSelectedSections([]);
    setQuery('');
  }, []);

  const filteredTopics = useMemo(
    () =>
      filterTopicsGlobal(ALL_TOPICS, {
        selectedLevels,
        selectedSections,
        query,
      }),
    [selectedLevels, selectedSections, query],
  );

  const hasActiveFilters =
    selectedLevels.length > 0 || selectedSections.length > 0 || query.trim().length > 0;

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
          { value: String(hasActiveFilters ? filteredTopics.length : TOPIC_COUNT), label: 'Topics' },
        ]}
      />

      <TeoriaFilterToolbar
        selectedLevels={selectedLevels}
        onToggleLevel={toggleLevel}
        query={query}
        onQueryChange={setQuery}
        onClear={clearFilters}
        filteredCount={filteredTopics.length}
        totalCount={TOPIC_COUNT}
        searchPlaceholder="Search any topic or skill area…"
        sections={SECTION_CATALOG}
        selectedSections={selectedSections}
        onToggleSection={toggleSection}
      />

      {hasActiveFilters ? (
        filteredTopics.length === 0 ? (
          <TeoriaEmptyState onReset={clearFilters} />
        ) : (
          <ul className="topic-grid">
            {filteredTopics.map((topic, i) => (
              <li key={`${topic.href}-${i}`}>
                <Link href={topic.href} className="card">
                  <span className="card__section">{topic.sectionKey}</span>
                  <div className="card__title">{topic.text}</div>
                  <div className="card__levels">
                    {topic.levels.map((l) => (
                      <span key={l} className="pill" aria-label={`Level ${l}`}>
                        {l}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
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
      )}

      <TeoriaGlobalStyles />
    </main>
  );
}

function TeoriaEmptyState({ onReset }) {
  return (
    <div className="empty">
      <div className="empty__mascot">
        <SiteMascot variant={6} width={128} alt="" />
      </div>
      <h3>No results</h3>
      <p>Try removing filters or searching for another term.</p>
      <button type="button" className="btn" onClick={onReset}>
        Clear filters
      </button>
    </div>
  );
}
