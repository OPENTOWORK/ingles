'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import TeoriaFilterToolbar from '@/components/theory/TeoriaFilterToolbar';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import ExamTheoryProgressBar from '@/components/niveles/ExamTheoryProgressBar';
import { useUserRole } from '@/context/UserRoleContext';
import { useTeoriaProgress } from '@/hooks/useTeoriaProgress';
import { filterTopics } from '@/data/teoriaSections';
import {
  getTeoriaSectionProgressSummary,
  getTeoriaSectionTopicUnlockStates,
} from '@/lib/teoriaTopicUnlock';
import { SEQUENTIAL_LOCK_FOR_STUDENTS } from '@/lib/theoryLockConfig';

export default function TheoryTopicList({
  sectionSlug,
  sectionTitle,
  sectionDescription,
  sectionAccent = '#2563eb',
  topics,
}) {
  const { userRole, session } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const { topicProgressByHref } = useTeoriaProgress(
    session?.user?.id,
    session?.access_token,
  );

  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');

  const progressByHref = topicProgressByHref ?? {};

  const unlockByHref = useMemo(() => {
    const states = getTeoriaSectionTopicUnlockStates(topics, progressByHref, isStudent);
    return Object.fromEntries(states.map((state) => [state.href, state]));
  }, [topics, progressByHref, isStudent]);

  const sectionSummary = useMemo(
    () => getTeoriaSectionProgressSummary(topics, progressByHref),
    [topics, progressByHref],
  );

  const toggle = useCallback(
    (lvl) =>
      setSelected((prev) =>
        prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl],
      ),
    [],
  );

  const clear = useCallback(() => {
    setSelected([]);
    setQuery('');
  }, []);

  const filtered = useMemo(
    () => filterTopics(topics, { selectedLevels: selected, query }),
    [topics, selected, query],
  );

  return (
    <main className="shell teoria-page theory-topics-page">
      <PageHero
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/teoria">Theory</Link>
            <span aria-hidden>›</span>
            <span>{sectionTitle}</span>
          </nav>
        }
        eyebrow={sectionTitle}
        title={sectionTitle}
        description={
          sectionDescription ||
          'Filter by level, search by title, and explore topics in this area.'
        }
        mascotVariant={4}
        mascotWidth={140}
        accent="violet"
        stats={[
          { value: String(topics.length), label: 'Topics' },
          { value: String(filtered.length), label: 'Showing' },
        ]}
      />

      <div className="theory-section-progress">
        <ExamTheoryProgressBar
          percent={sectionSummary.percent}
          label={`Progreso ${sectionTitle}`}
          size="md"
          accentColor={sectionAccent}
        />
        <p className="theory-section-progress__hint">
          {sectionSummary.completedTopics}/{sectionSummary.topicsTotal} temas completados · media
          del apartado
          {isStudent && SEQUENTIAL_LOCK_FOR_STUDENTS
            ? ' · completa cada tema al 100% para desbloquear el siguiente'
            : ''}
        </p>
      </div>

      <TeoriaFilterToolbar
        selectedLevels={selected}
        onToggleLevel={toggle}
        query={query}
        onQueryChange={setQuery}
        onClear={clear}
        filteredCount={filtered.length}
        totalCount={topics.length}
      />

      {filtered.length === 0 ? (
        <EmptyState onReset={clear} />
      ) : (
        <ul className="topic-grid theory-topic-grid">
          {filtered.map((topic, index) => {
            const unlock = unlockByHref[topic.href];
            const isLocked = Boolean(unlock?.locked);
            const percent = unlock?.percent ?? progressByHref[topic.href] ?? 0;

            return (
              <li
                key={`${topic.href}-${index}`}
                className={isLocked ? 'theory-topic-item is-locked' : 'theory-topic-item'}
              >
                {isLocked ? (
                  <>
                    <div
                      className="card theory-topic-card card--disabled"
                      aria-disabled="true"
                    >
                      <TopicCardBody topic={topic} percent={percent} accentColor={sectionAccent} />
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
                    <TopicCardBody topic={topic} percent={percent} accentColor={sectionAccent} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <TeoriaGlobalStyles />
      <TheoryTopicListStyles />
    </main>
  );
}

function TopicCardBody({ topic, percent, accentColor }) {
  return (
    <>
      <div className="card__title">{topic.text}</div>
      <ExamTheoryProgressBar
        percent={percent}
        label={topic.text}
        size="sm"
        accentColor={accentColor}
      />
      <div className="card__levels">
        {topic.levels.map((level) => (
          <span key={level} className="pill" aria-label={`Level ${level}`}>
            {level}
          </span>
        ))}
      </div>
    </>
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

function TheoryTopicListStyles() {
  return (
    <style jsx global>{`
      .theory-topics-page .theory-section-progress {
        margin: 0 0 18px;
        padding: 14px 16px;
        border-radius: 16px;
        background: linear-gradient(180deg, #f5f3ff 0%, #f8fafc 100%);
        border: 1px solid rgba(124, 58, 237, 0.15);
      }
      .theory-topics-page .theory-section-progress__hint {
        margin: 8px 0 0;
        font-size: 0.82rem;
        color: #5a6b7d;
        line-height: 1.45;
      }
      .theory-topics-page .theory-topic-item {
        position: relative;
        list-style: none;
      }
      .theory-topics-page .theory-topic-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 100%;
      }
      .theory-topics-page .card--disabled {
        cursor: not-allowed;
        opacity: 0.88;
        pointer-events: none;
      }
      .theory-topics-page .theory-topic-item__lock {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        border-radius: 16px;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        font-weight: 700;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        pointer-events: none;
      }
      .theory-topics-page .theory-topic-card__lock-hint {
        margin: 0;
        font-size: 0.75rem;
        color: #94a3b8;
        text-align: center;
        line-height: 1.35;
      }
    `}</style>
  );
}
