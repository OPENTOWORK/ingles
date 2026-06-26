'use client';

import { useState } from 'react';
import { getExamTheoryPartGroups } from '@/data/examTheoryPartTips';
import { isNivelesLevelComingSoonForUser } from '@/constants/studentFeatureAccess';
import ExamPartNavCard from '@/components/exam/ExamPartNavCard';
import cardStyles from '@/components/exam/ExamPartNavCard.module.css';
import {
  formatExamPartNavLabels,
  getExamSectionSkillTheme,
} from '@/utils/examPartNavTheme';

function truncateDescription(text, max = 160) {
  const t = String(text || '').trim();
  if (!t || t.length <= max) return t;
  const cut = t.slice(0, max).trim();
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export default function ExamTheoryPartTipsSection({
  sectionSlug,
  sectionAccent = '#2563eb',
  userRole = '',
}) {
  const groups = getExamTheoryPartGroups(sectionSlug);
  const [levelFilter, setLevelFilter] = useState(/** @type {string | null} */ (null));

  const isLevelLockedForUser = (cefr) => isNivelesLevelComingSoonForUser(userRole, cefr);

  const skillTheme = getExamSectionSkillTheme(sectionSlug);

  if (!groups.length) return null;

  const totalParts = groups.reduce((n, g) => n + g.parts.length, 0);
  const visibleGroups = levelFilter ? groups.filter((g) => g.cefr === levelFilter) : [];

  const toggleLevel = (cefr) => {
    if (isLevelLockedForUser(cefr)) return;
    setLevelFilter((prev) => (prev === cefr ? null : cefr));
  };

  return (
    <section className="exam-theory-parts" aria-labelledby="exam-theory-parts-title">
      <header className="exam-theory-parts__head">
        <div>
          <p className="exam-theory-parts__eyebrow">By exam level</p>
          <h2 id="exam-theory-parts-title" className="exam-theory-parts__title">
            Description &amp; interactive tips
          </h2>
          <p className="exam-theory-parts__intro">
            Choose a CEFR level to see parts with task format, strategies, common mistakes, and
            practice links.
          </p>
        </div>
        <span className="exam-theory-parts__count" aria-label={`${totalParts} parts`}>
          {totalParts}
        </span>
      </header>

      <div
        className="exam-theory-parts__filters"
        role="group"
        aria-label="Filter by exam level"
      >
        {groups.map((group) => {
          const locked = isLevelLockedForUser(group.cefr);
          return (
            <button
              key={group.cefr}
              type="button"
              className={`exam-theory-parts__filter${
                levelFilter === group.cefr ? ' exam-theory-parts__filter--active' : ''
              }${locked ? ' exam-theory-parts__filter--locked' : ''}`}
              aria-pressed={levelFilter === group.cefr}
              aria-disabled={locked || undefined}
              disabled={locked}
              onClick={() => toggleLevel(group.cefr)}
            >
              {group.cefr}
              <span className="exam-theory-parts__filter-count">{group.parts.length}</span>
            </button>
          );
        })}
      </div>

      {!levelFilter ? (
        <p className="exam-theory-parts__hint">Select a level above to view the parts.</p>
      ) : null}

      {visibleGroups.map((group) => (
        <div key={group.levelSlug} className="exam-theory-parts__level">
          <h3 className="exam-theory-parts__level-title">
            <span className="exam-theory-parts__level-badge">{group.cefr}</span>
            {group.cefr} · {group.parts.length} part{group.parts.length === 1 ? '' : 's'}
          </h3>
          <ul className={`${cardStyles.partList} exam-theory-parts__list`}>
            {group.parts.map((part) => {
              const labels = formatExamPartNavLabels(part, truncateDescription);
              return (
                <li key={part.href}>
                  <ExamPartNavCard
                    href={part.href}
                    partNumber={labels.partNumber}
                    partName={labels.partName}
                    partDesc={labels.partDesc}
                    meta="Tips & strategies"
                    skillTheme={skillTheme}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <ExamTheoryPartTipsStyles accent={sectionAccent} />
    </section>
  );
}

function ExamTheoryPartTipsStyles({ accent }) {
  return (
    <style jsx global>{`
      .exam-theory-topics-page .exam-theory-parts {
        margin: 0 0 28px;
        padding: 20px 20px 8px;
        border-radius: 18px;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, ${accent} 8%, #ffffff) 0%,
          #f8fafc 100%
        );
        border: 1px solid color-mix(in srgb, ${accent} 20%, #e2e8f0);
        box-shadow: 0 4px 24px color-mix(in srgb, ${accent} 8%, transparent);
      }
      .exam-theory-topics-page .exam-theory-parts__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
      }
      .exam-theory-topics-page .exam-theory-parts__filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 16px;
      }
      .exam-theory-topics-page .exam-theory-parts__filter {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0.5rem 0.9rem;
        border-radius: 999px;
        border: 1px solid #e2e8f0;
        background: #fff;
        font-size: 0.88rem;
        font-weight: 700;
        color: #334155;
        cursor: pointer;
        transition:
          background 0.2s,
          border-color 0.2s,
          color 0.2s,
          box-shadow 0.2s;
      }
      .exam-theory-topics-page .exam-theory-parts__filter:hover {
        border-color: color-mix(in srgb, ${accent} 40%, #e2e8f0);
        background: color-mix(in srgb, ${accent} 6%, white);
      }
      .exam-theory-topics-page .exam-theory-parts__filter--active {
        border-color: color-mix(in srgb, ${accent} 55%, #e2e8f0);
        background: color-mix(in srgb, ${accent} 14%, white);
        color: ${accent};
        box-shadow: 0 4px 14px color-mix(in srgb, ${accent} 18%, transparent);
      }
      .exam-theory-topics-page .exam-theory-parts__filter-count {
        display: inline-grid;
        place-items: center;
        min-width: 1.35rem;
        height: 1.35rem;
        padding: 0 5px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.06);
        font-size: 0.72rem;
        font-weight: 800;
      }
      .exam-theory-topics-page .exam-theory-parts__filter--active .exam-theory-parts__filter-count {
        background: color-mix(in srgb, ${accent} 22%, white);
      }
      .exam-theory-topics-page .exam-theory-parts__filter--locked {
        cursor: not-allowed;
        opacity: 0.48;
        background: #f1f5f9;
        color: #94a3b8;
        border-color: #e2e8f0;
        box-shadow: none;
      }
      .exam-theory-topics-page .exam-theory-parts__filter--locked:hover {
        border-color: #e2e8f0;
        background: #f1f5f9;
      }
      .exam-theory-topics-page .exam-theory-parts__hint {
        margin: 0 0 8px;
        font-size: 0.88rem;
        color: #94a3b8;
        font-style: italic;
      }
      .exam-theory-topics-page .exam-theory-parts__eyebrow {
        margin: 0 0 6px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: ${accent};
      }
      .exam-theory-topics-page .exam-theory-parts__title {
        margin: 0;
        font-size: clamp(1.2rem, 2.4vw, 1.45rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text);
      }
      .exam-theory-topics-page .exam-theory-parts__intro {
        margin: 10px 0 0;
        max-width: 640px;
        font-size: 0.92rem;
        line-height: 1.55;
        color: #5a6b7d;
      }
      .exam-theory-topics-page .exam-theory-parts__count {
        flex: 0 0 auto;
        display: inline-grid;
        place-items: center;
        min-width: 36px;
        height: 36px;
        padding: 0 10px;
        border-radius: 999px;
        background: color-mix(in srgb, ${accent} 12%, white);
        border: 1px solid color-mix(in srgb, ${accent} 28%, transparent);
        font-size: 0.82rem;
        font-weight: 800;
        color: ${accent};
      }
      .exam-theory-topics-page .exam-theory-parts__level {
        margin-bottom: 18px;
      }
      .exam-theory-topics-page .exam-theory-parts__level:last-child {
        margin-bottom: 8px;
      }
      .exam-theory-topics-page .exam-theory-parts__level-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 12px;
        font-size: 0.95rem;
        font-weight: 700;
        color: #334155;
      }
      .exam-theory-topics-page .exam-theory-parts__level-badge {
        display: inline-grid;
        place-items: center;
        min-width: 2.1rem;
        height: 1.65rem;
        padding: 0 8px;
        border-radius: 8px;
        background: color-mix(in srgb, ${accent} 14%, white);
        color: ${accent};
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }
      .exam-theory-topics-page .exam-theory-parts__list {
        max-width: min(100%, 680px);
      }
    `}</style>
  );
}
