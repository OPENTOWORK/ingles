'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import { LEVELS, SECTION_CATALOG, filterTopics } from '@/data/teoriaSections';

export default function TeoriaTopicList({ sectionTitle, topics }) {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');

  const toggle = (lvl) =>
    setSelected((prev) => (prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]));

  const clear = () => {
    setSelected([]);
    setQuery('');
  };

  const filtered = useMemo(
    () => filterTopics(topics, { selectedLevels: selected, query }),
    [topics, selected, query]
  );

  const sectionMeta = SECTION_CATALOG.find((s) => s.key === sectionTitle);

  return (
    <main className="shell teoria-page">
      <PageHero
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/teoria">Theory</Link>
            <span aria-hidden>›</span>
            <span>{sectionTitle}</span>
          </nav>
        }
        eyebrow={sectionMeta?.key || 'Theory'}
        title={sectionTitle}
        description={sectionMeta?.description || 'Filter by level, search by title, and explore topics in this area.'}
        mascotVariant={4}
        mascotWidth={140}
        accent={sectionMeta?.heroAccent || 'violet'}
        stats={[
          { value: String(topics.length), label: 'Topics' },
          { value: String(filtered.length), label: 'Showing' },
        ]}
      />

      <section className="toolbar">
        <div className="chips">
          {LEVELS.map((level) => {
            const active = selected.includes(level.code);
            return (
              <button
                key={level.code}
                type="button"
                className={`chip ${active ? 'chip--active' : ''}`}
                onClick={() => toggle(level.code)}
                aria-pressed={active}
                title={`${level.name}: ${level.description}`}
                style={{
                  borderColor: active ? level.color : '#eaeaea',
                  background: active ? level.color : 'var(--card)',
                  color: active ? 'white' : 'var(--text)',
                  boxShadow: active ? `0 8px 20px ${level.color}35` : 'none',
                }}
              >
                {level.code}
              </button>
            );
          })}
          <button type="button" className="chip chip--ghost" onClick={clear}>
            Clear
          </button>
        </div>

        <div className="search">
          <input
            type="search"
            placeholder="Search topic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search topic"
          />
          <span className="search__icon" aria-hidden>
            ⌕
          </span>
        </div>

        <div className="meta">
          Showing <strong>{filtered.length}</strong> topic{filtered.length === 1 ? '' : 's'}
        </div>

        {selected.length > 0 && (
          <div className="level-info">
            <h4>Selected levels:</h4>
            <div className="level-cards">
              {LEVELS.filter((level) => selected.includes(level.code)).map((level) => (
                <div key={level.code} className="level-card" style={{ borderColor: level.color }}>
                  <div className="level-header" style={{ backgroundColor: level.color }}>
                    <span className="level-code">{level.code}</span>
                    <span className="level-name">{level.name}</span>
                  </div>
                  <div className="level-content">
                    <p className="level-description">{level.description}</p>
                    <p className="level-skills">
                      <strong>Skills:</strong> {level.skills}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {filtered.length === 0 ? (
        <EmptyState onReset={clear} />
      ) : (
        <ul className="topic-grid">
          {filtered.map((t, i) => (
            <li key={`${t.href}-${i}`}>
              <Link href={t.href} className="card">
                <div className="card__title">{t.text}</div>
                <div className="card__levels">
                  {t.levels.map((l) => (
                    <span key={l} className="pill" aria-label={`Level ${l}`}>
                      {l}
                    </span>
                  ))}
                </div>
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
