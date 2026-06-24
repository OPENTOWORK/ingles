'use client';

import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { APP_ROUTES, examStrategiesSkillPath } from '@/config/appRoutes';
import { EXAM_SKILL_SECTION_META } from '@/data/examSkillTheme';
import { MASCOT_EXAM_STRATEGIES_VARIANT } from '@/config/mascotAssets';

const SKILL_META = Object.fromEntries(EXAM_SKILL_SECTION_META.map((s) => [s.slug, s]));

export default function ExamStrategiesChapterView({ skill, chapter, title, intro, content }) {
  const meta = SKILL_META[skill];
  const skillLabel = meta?.key || skill;
  const sectionBackHref = examStrategiesSkillPath(skill);
  const hasContent = Boolean(content);
  const heroAccent = meta?.heroAccent || 'violet';
  const sectionAccent = meta?.accent || '#667eea';

  return (
    <main
      className="shell exam-strategies-chapter-page"
      style={{ '--chapter-accent': sectionAccent }}
    >
      <PageHero
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href={APP_ROUTES.examStrategies}>Exam Strategies</Link>
            <span aria-hidden>›</span>
            <Link href={sectionBackHref}>{skillLabel}</Link>
            <span aria-hidden>›</span>
            <span>{title}</span>
          </nav>
        }
        eyebrow={skillLabel}
        title={title}
        description={intro}
        accent={heroAccent}
        showMascot
        mascotVariant={MASCOT_EXAM_STRATEGIES_VARIANT}
        mascotWidth={128}
      />

      {hasContent ? (
        <div className="exam-strategies-chapter-body">
          <section className="exam-strategies-chapter-card exam-strategies-chapter-card--overview">
            <header className="exam-strategies-chapter-card__head">
              <span className="exam-strategies-chapter-card__icon" aria-hidden>
                📋
              </span>
              <h2 className="exam-strategies-chapter-card__title">Paper overview</h2>
            </header>
            <p className="exam-strategies-chapter-card__lead">{content.overview}</p>
          </section>

          {content.timing?.length ? (
            <section className="exam-strategies-chapter-card">
              <header className="exam-strategies-chapter-card__head">
                <span className="exam-strategies-chapter-card__icon" aria-hidden>
                  ⏱
                </span>
                <h2 className="exam-strategies-chapter-card__title">Suggested timing</h2>
              </header>
              <div className="exam-strategies-chapter-table-wrap">
                <table className="exam-strategies-chapter-table">
                  <thead>
                    <tr>
                      <th scope="col">Section</th>
                      <th scope="col">Time</th>
                      <th scope="col">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.timing.map((row) => (
                      <tr key={row.part}>
                        <td>{row.part}</td>
                        <td>{row.time}</td>
                        <td>{row.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <StrategyListSection icon="🎯" title="General approach" items={content.approach} />
          <StrategyListSection icon="🔗" title="Cross-part tactics" items={content.crossPart} />
          <StrategyListSection
            icon="⚠️"
            title="Common mistakes to avoid"
            items={content.mistakes}
          />

          {content.studyTip ? (
            <section className="exam-strategies-chapter-card exam-strategies-chapter-card--tip">
              <header className="exam-strategies-chapter-card__head">
                <span className="exam-strategies-chapter-card__icon" aria-hidden>
                  💡
                </span>
                <h2 className="exam-strategies-chapter-card__title">Study tip</h2>
              </header>
              <p className="exam-strategies-chapter-card__lead">{content.studyTip}</p>
            </section>
          ) : null}

          {content.nextSteps?.length ? (
            <section className="exam-strategies-chapter-card exam-strategies-chapter-card--next">
              <header className="exam-strategies-chapter-card__head exam-strategies-chapter-card__head--center">
                <h2 className="exam-strategies-chapter-card__title">What to study next</h2>
                <p className="exam-strategies-chapter-card__subtitle">
                  Jump straight to part-specific tips for {skillLabel}.
                </p>
              </header>
              <ul className="exam-strategies-chapter-links">
                {content.nextSteps.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="exam-strategies-chapter-placeholder">
          <p>Content for this chapter is coming soon.</p>
        </div>
      )}

      <footer className="exam-strategies-chapter-footer">
        <Link href={sectionBackHref} className="exam-strategies-chapter-back">
          ← Back to {skillLabel}
        </Link>
      </footer>

      <ExamStrategiesChapterStyles />
    </main>
  );
}

function StrategyListSection({ icon, title, items }) {
  if (!items?.length) return null;
  return (
    <section className="exam-strategies-chapter-card">
      <header className="exam-strategies-chapter-card__head">
        <span className="exam-strategies-chapter-card__icon" aria-hidden>
          {icon}
        </span>
        <h2 className="exam-strategies-chapter-card__title">{title}</h2>
      </header>
      <ul className="exam-strategies-chapter-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ExamStrategiesChapterStyles() {
  return (
    <style jsx global>{`
      .exam-strategies-chapter-page {
        max-width: min(920px, 100%);
        margin: 0 auto;
        padding: 0 1.25rem 3.5rem;
      }

      .exam-strategies-chapter-page .page-hero-wrap__breadcrumb {
        max-width: min(920px, 100%);
        margin: 0 auto 0.75rem;
        padding: 0 0.25rem;
      }

      .exam-strategies-chapter-page .page-hero-wrap__breadcrumb .breadcrumb {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.45rem 0.55rem;
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 0;
        text-align: center;
      }

      .exam-strategies-chapter-page .page-hero-wrap__breadcrumb .breadcrumb :global(a) {
        color: var(--chapter-accent);
        text-decoration: none;
        font-weight: 600;
      }

      .exam-strategies-chapter-page .page-hero-wrap__breadcrumb .breadcrumb :global(a:hover) {
        text-decoration: underline;
      }

      .exam-strategies-chapter-page .page-hero {
        margin-bottom: 1.75rem;
      }

      .exam-strategies-chapter-page .page-hero__inner {
        justify-content: center;
        text-align: center;
      }

      .exam-strategies-chapter-page .page-hero__content {
        margin-left: auto;
        margin-right: auto;
      }

      .exam-strategies-chapter-page .page-hero__desc {
        max-width: 38rem;
        margin-left: auto;
        margin-right: auto;
      }

      .exam-strategies-chapter-body {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
      }

      .exam-strategies-chapter-card {
        padding: 1.35rem 1.5rem 1.45rem;
        border-radius: 18px;
        border: 1px solid #e2e8f0;
        background: #fff;
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 10px 28px rgba(15, 23, 42, 0.06);
      }

      .exam-strategies-chapter-card--overview {
        border-color: color-mix(in srgb, var(--chapter-accent) 35%, #e2e8f0);
        background: linear-gradient(
          165deg,
          color-mix(in srgb, var(--chapter-accent) 8%, #fff) 0%,
          #fff 55%
        );
      }

      .exam-strategies-chapter-card--tip {
        border-color: #bfdbfe;
        background: linear-gradient(165deg, #eff6ff 0%, #fff 70%);
      }

      .exam-strategies-chapter-card--next {
        text-align: center;
      }

      .exam-strategies-chapter-card__head {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-bottom: 0.95rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid color-mix(in srgb, var(--chapter-accent) 22%, #e2e8f0);
      }

      .exam-strategies-chapter-card__head--center {
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
        border-bottom: none;
        padding-bottom: 0.35rem;
        margin-bottom: 1rem;
      }

      .exam-strategies-chapter-card__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 10px;
        background: color-mix(in srgb, var(--chapter-accent) 14%, #fff);
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .exam-strategies-chapter-card__title {
        margin: 0;
        font-size: clamp(1.08rem, 2.2vw, 1.28rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #0f172a;
        line-height: 1.25;
      }

      .exam-strategies-chapter-card__subtitle {
        margin: 0;
        font-size: 0.92rem;
        color: #64748b;
        line-height: 1.45;
      }

      .exam-strategies-chapter-card__lead {
        margin: 0;
        font-size: 1.02rem;
        line-height: 1.68;
        color: #475569;
      }

      .exam-strategies-chapter-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .exam-strategies-chapter-list li {
        position: relative;
        padding: 0.75rem 0.95rem 0.75rem 1.15rem;
        border-radius: 12px;
        background: #f8fafc;
        color: #475569;
        line-height: 1.62;
        font-size: 0.98rem;
      }

      .exam-strategies-chapter-list li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.65rem;
        bottom: 0.65rem;
        width: 3px;
        border-radius: 999px;
        background: var(--chapter-accent);
      }

      .exam-strategies-chapter-table-wrap {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }

      .exam-strategies-chapter-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.92rem;
      }

      .exam-strategies-chapter-table th,
      .exam-strategies-chapter-table td {
        padding: 0.7rem 0.85rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: top;
      }

      .exam-strategies-chapter-table tr:last-child td {
        border-bottom: none;
      }

      .exam-strategies-chapter-table th {
        font-weight: 700;
        color: #334155;
        background: #f8fafc;
        font-size: 0.82rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .exam-strategies-chapter-table td:first-child {
        font-weight: 600;
        color: #1e293b;
        min-width: 9rem;
      }

      .exam-strategies-chapter-table td:nth-child(2) {
        color: color-mix(in srgb, var(--chapter-accent) 70%, #0f172a);
        font-weight: 700;
        white-space: nowrap;
      }

      .exam-strategies-chapter-links {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.55rem 0.7rem;
      }

      .exam-strategies-chapter-links :global(a) {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--chapter-accent) 12%, #fff);
        border: 1px solid color-mix(in srgb, var(--chapter-accent) 28%, #e2e8f0);
        color: color-mix(in srgb, var(--chapter-accent) 75%, #1e1b4b);
        font-size: 0.88rem;
        font-weight: 700;
        text-decoration: none;
        transition: background 0.15s ease, transform 0.15s ease;
      }

      .exam-strategies-chapter-links :global(a:hover) {
        background: color-mix(in srgb, var(--chapter-accent) 20%, #fff);
        transform: translateY(-1px);
      }

      .exam-strategies-chapter-placeholder {
        max-width: 36rem;
        margin: 0 auto 1rem;
        padding: 1.35rem 1.5rem;
        border-radius: 16px;
        border: 1px dashed #cbd5e1;
        background: #f8fafc;
        text-align: center;
      }

      .exam-strategies-chapter-placeholder p {
        margin: 0;
        color: #64748b;
      }

      .exam-strategies-chapter-footer {
        margin-top: 1.75rem;
        text-align: center;
      }

      .exam-strategies-chapter-back {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.55rem 1.1rem;
        border-radius: 999px;
        font-size: 0.92rem;
        font-weight: 700;
        color: #4338ca;
        background: #eef2ff;
        text-decoration: none;
        transition: background 0.15s ease;
      }

      .exam-strategies-chapter-back:hover {
        background: #e0e7ff;
        text-decoration: none;
      }

      body.reading-night-mode .exam-strategies-chapter-card {
        background: #1e293b;
        border-color: #475569;
        box-shadow: none;
      }

      body.reading-night-mode .exam-strategies-chapter-card--overview,
      body.reading-night-mode .exam-strategies-chapter-card--tip {
        background: #1e293b;
      }

      body.reading-night-mode .exam-strategies-chapter-card__title {
        color: #f1f5f9;
      }

      body.reading-night-mode .exam-strategies-chapter-card__subtitle,
      body.reading-night-mode .exam-strategies-chapter-card__lead {
        color: #94a3b8;
      }

      body.reading-night-mode .exam-strategies-chapter-list li {
        background: #0f172a;
        color: #cbd5e1;
      }

      body.reading-night-mode .exam-strategies-chapter-table-wrap {
        border-color: #475569;
      }

      body.reading-night-mode .exam-strategies-chapter-table th {
        background: #0f172a;
        color: #e2e8f0;
      }

      body.reading-night-mode .exam-strategies-chapter-table td {
        color: #cbd5e1;
      }

      body.reading-night-mode .exam-strategies-chapter-table th,
      body.reading-night-mode .exam-strategies-chapter-table td {
        border-color: #475569;
      }

      body.reading-night-mode .exam-strategies-chapter-placeholder {
        background: #1e293b;
        border-color: #475569;
      }

      body.reading-night-mode .exam-strategies-chapter-back {
        background: #312e81;
        color: #c7d2fe;
      }
    `}</style>
  );
}
