'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import TeoriaFilterToolbar from '@/components/theory/TeoriaFilterToolbar';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import ExamTheoryProgressBar from '@/components/niveles/ExamTheoryProgressBar';
import { useUserRole } from '@/context/UserRoleContext';
import { useTeoriaProgress } from '@/hooks/useTeoriaProgress';
import {
  SECTIONS,
  THEORY_SECTION_CATALOG,
  buildTheoryTopicsFlat,
  filterTopicsGlobal,
} from '@/data/teoriaSections';
import { getTeoriaApartadoUnlockStates } from '@/lib/teoriaUnlock';
import { buildAllTeoriaTopicUnlockMap } from '@/lib/teoriaTopicUnlock';

const ALL_TOPICS = buildTheoryTopicsFlat();
const TOPIC_COUNT = ALL_TOPICS.length;

export default function TheoryHub() {
  const { userRole, session } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const { globalPercent, units, topicProgressByHref } = useTeoriaProgress(
    session?.user?.id,
    session?.access_token,
  );

  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [query, setQuery] = useState('');

  const apartadoUnlockBySlug = useMemo(() => {
    const states = getTeoriaApartadoUnlockStates(units, isStudent);
    return Object.fromEntries(states.map((state) => [state.slug, state]));
  }, [units, isStudent]);

  const topicUnlockByHref = useMemo(
    () => buildAllTeoriaTopicUnlockMap(topicProgressByHref ?? {}, isStudent),
    [topicProgressByHref, isStudent],
  );

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
    <main className="shell teoria-page theory-hub-page">
      <PageHero
        eyebrow="Study hub"
        title="Theory"
        description="Explore grammar, vocabulary, and pronunciation — organised by skill area and CEFR level."
        showMascot={true}
        mascotVariant={4}
        mascotWidth={156}
        accent="violet"
        stats={[
          { value: String(THEORY_SECTION_CATALOG.length), label: 'Skill areas' },
          {
            value: String(hasActiveFilters ? filteredTopics.length : TOPIC_COUNT),
            label: 'Topics',
          },
        ]}
      />

      <div className="theory-hub-global-progress">
        <ExamTheoryProgressBar
          percent={globalPercent}
          label="Progreso total Theory"
          size="md"
          accentColor="#7c3aed"
        />
        <p className="theory-hub-global-progress__hint">
          Media de Grammar, Vocabulary y Pronunciation
          {isStudent ? ' · completa cada apartado al 100% para desbloquear el siguiente' : ''}
        </p>
      </div>

      <TeoriaFilterToolbar
        selectedLevels={selectedLevels}
        onToggleLevel={toggleLevel}
        query={query}
        onQueryChange={setQuery}
        onClear={clearFilters}
        filteredCount={filteredTopics.length}
        totalCount={TOPIC_COUNT}
        searchPlaceholder="Search any topic or skill area…"
        sections={THEORY_SECTION_CATALOG}
        selectedSections={selectedSections}
        onToggleSection={toggleSection}
      />

      {hasActiveFilters ? (
        filteredTopics.length === 0 ? (
          <TeoriaEmptyState onReset={clearFilters} />
        ) : (
          <ul className="topic-grid theory-hub-topic-grid">
            {filteredTopics.map((topic, i) => {
              const unlock = topicUnlockByHref[topic.href];
              const isLocked = Boolean(unlock?.locked);
              const area = THEORY_SECTION_CATALOG.find((a) => a.key === topic.sectionKey);
              const percent = unlock?.percent ?? topicProgressByHref?.[topic.href] ?? 0;

              return (
                <li
                  key={`${topic.href}-${i}`}
                  className={isLocked ? 'theory-topic-item is-locked' : 'theory-topic-item'}
                >
                  {isLocked ? (
                    <>
                      <div className="card theory-topic-card card--disabled" aria-disabled="true">
                        <span className="card__section">{topic.sectionKey}</span>
                        <div className="card__title">{topic.text}</div>
                        <ExamTheoryProgressBar
                          percent={percent}
                          label={topic.text}
                          size="sm"
                          accentColor={area?.accent ?? '#7c3aed'}
                        />
                        <div className="card__levels">
                          {topic.levels.map((l) => (
                            <span key={l} className="pill">
                              {l}
                            </span>
                          ))}
                        </div>
                        {unlock?.requiredPrevious ? (
                          <p className="theory-topic-card__lock-hint">
                            Complete {unlock.requiredPrevious} first
                          </p>
                        ) : null}
                      </div>
                      <div className="theory-topic-item__lock">Blocked</div>
                    </>
                  ) : (
                    <Link href={topic.href} className="card theory-topic-card">
                      <span className="card__section">{topic.sectionKey}</span>
                      <div className="card__title">{topic.text}</div>
                      <ExamTheoryProgressBar
                        percent={percent}
                        label={topic.text}
                        size="sm"
                        accentColor={area?.accent ?? '#7c3aed'}
                      />
                      <div className="card__levels">
                        {topic.levels.map((l) => (
                          <span key={l} className="pill">
                            {l}
                          </span>
                        ))}
                      </div>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <ul className="area-grid theory-hub-area-grid">
          {THEORY_SECTION_CATALOG.map((area) => {
            const unit = units.find((u) => u.slug === area.slug);
            const unlock = apartadoUnlockBySlug[area.slug];
            const isLocked = Boolean(unlock?.locked);
            const count = SECTIONS[area.key]?.length ?? 0;
            const initial = area.key.charAt(0);
            const percent = unit?.percent ?? 0;

            return (
              <li
                key={area.slug}
                className={isLocked ? 'theory-apartado-item is-locked' : 'theory-apartado-item'}
              >
                {isLocked ? (
                  <>
                    <div className="area-card theory-apartado-card area-card--disabled" aria-disabled="true">
                      <ApartadoCardBody
                        area={area}
                        initial={initial}
                        percent={percent}
                        unit={unit}
                        count={count}
                      />
                      {unlock?.requiredPrevious ? (
                        <p className="theory-apartado-card__lock-hint">
                          Complete {unlock.requiredPrevious} first
                        </p>
                      ) : null}
                    </div>
                    <div className="theory-apartado-item__lock">Blocked</div>
                  </>
                ) : (
                  <Link href={`/teoria/${area.slug}`} className="area-card theory-apartado-card">
                    <ApartadoCardBody
                      area={area}
                      initial={initial}
                      percent={percent}
                      unit={unit}
                      count={count}
                    />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <TeoriaGlobalStyles />
      <TheoryHubStyles />
    </main>
  );
}

function ApartadoCardBody({ area, initial, percent, unit, count }) {
  return (
    <>
      <div className="area-card__head">
        <span className="area-card__icon" style={{ background: area.accent }} aria-hidden>
          {initial}
        </span>
        <span className="area-card__title">{area.key}</span>
      </div>
      <span className="area-card__desc">{area.description}</span>
      <ExamTheoryProgressBar
        percent={percent}
        label={area.key}
        size="sm"
        accentColor={area.accent}
      />
      <span className="area-card__meta">
        {unit?.completedTopics ?? 0}/{count} temas · {count} topic{count === 1 ? '' : 's'} →
      </span>
    </>
  );
}

function TeoriaEmptyState({ onReset }) {
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

function TheoryHubStyles() {
  return (
    <style jsx global>{`
      .theory-hub-page .theory-hub-global-progress {
        margin: 0 0 18px;
        padding: 14px 16px;
        border-radius: 16px;
        background: linear-gradient(180deg, #f5f3ff 0%, #f8fafc 100%);
        border: 1px solid rgba(124, 58, 237, 0.15);
      }
      .theory-hub-page .theory-hub-global-progress__hint {
        margin: 8px 0 0;
        font-size: 0.82rem;
        color: #5a6b7d;
        line-height: 1.45;
      }
      .theory-hub-page .theory-apartado-item,
      .theory-hub-page .theory-topic-item {
        position: relative;
        list-style: none;
      }
      .theory-hub-page .theory-apartado-card,
      .theory-hub-page .theory-topic-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .theory-hub-page .area-card--disabled,
      .theory-hub-page .card--disabled {
        cursor: not-allowed;
        opacity: 0.88;
        pointer-events: none;
      }
      .theory-hub-page .theory-apartado-item__lock,
      .theory-hub-page .theory-topic-item__lock {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        pointer-events: none;
      }
      .theory-hub-page .theory-apartado-card__lock-hint,
      .theory-hub-page .theory-topic-card__lock-hint {
        margin: 0;
        font-size: 0.78rem;
        color: #94a3b8;
        text-align: center;
        line-height: 1.35;
      }
      .theory-hub-page .theory-hub-area-grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      }
      @media (min-width: 900px) {
        .theory-hub-page .theory-hub-area-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
    `}</style>
  );
}
