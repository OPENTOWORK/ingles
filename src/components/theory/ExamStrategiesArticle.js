'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ExamStrategiesChapterStyles from '@/components/theory/ExamStrategiesChapterStyles';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import { EXAM_SKILL_SECTION_META } from '@/data/examSkillTheme';
import { getExamStrategiesStudentIndex } from '@/data/examStrategiesStudentIndex';
import { APP_ROUTES, examStrategiesSkillPath } from '@/config/appRoutes';

const SKILL_META = Object.fromEntries(EXAM_SKILL_SECTION_META.map((s) => [s.slug, s]));

const DEFAULT_TIMING_COLUMNS = ['Section', 'Time', 'Note'];

/**
 * Página de Exam Strategies (capítulos «Overall Strategy» y fichas «Part N Tips»).
 * Mismo formato y color de skill en ambos casos.
 *
 * @typedef {{ part: string, time: string, note?: string }} TimingRow
 */
export default function ExamStrategiesArticle({
  skillSlug,
  title,
  intro,
  content,
  breadcrumb = [],
  backHref,
  backLabel,
  prevHref,
  prevLabel = '← Previous part',
  nextHref,
  nextLabel = 'Next part →',
  children,
}) {
  const meta = SKILL_META[skillSlug];
  const skillLabel = meta?.key || 'Exam Strategies';
  const heroAccent = meta?.heroAccent || 'violet';
  const sectionAccent = meta?.accent || '#667eea';
  const hasContent = Boolean(content);
  const timingColumns = content?.timingColumns || DEFAULT_TIMING_COLUMNS;
  const hasSkillIndex = Boolean(getExamStrategiesStudentIndex(skillSlug));
  const resolvedBackHref =
    backHref ??
    (hasSkillIndex ? examStrategiesSkillPath(skillSlug) : `${APP_ROUTES.examStrategies}/`);

  return (
    <main
      className="shell content-hub-shell teoria-page exam-strategies-chapter-page niveles-level-page--b2"
      style={{ '--chapter-accent': sectionAccent, '--exam-skill-accent': sectionAccent }}
    >
      <div className="levels-b2-page-content">
        <PageHero
          breadcrumb={
            breadcrumb.length > 0 ? (
              <nav className="breadcrumb" aria-label="Breadcrumb">
                {breadcrumb.map((crumb, index) => (
                  <Fragment key={`${crumb.label}-${index}`}>
                    {index > 0 ? <span aria-hidden>›</span> : null}
                    {crumb.href ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </Fragment>
                ))}
              </nav>
            ) : undefined
          }
          backHref={resolvedBackHref}
          backLabel={backLabel || 'Back'}
          contentAlign="left"
          eyebrow={skillLabel}
          title={title}
          description={intro}
          accent={heroAccent}
        />

        {hasContent ? (
          <div className="exam-strategies-chapter-body">
            {content.overview ? (
              <ArticleCard
                icon="📋"
                title={content.overviewTitle || 'Paper overview'}
                variant="overview"
              >
                <p className="exam-strategies-chapter-card__lead">{content.overview}</p>
              </ArticleCard>
            ) : null}

            {content.timing?.length ? (
              <ArticleCard icon="⏱" title={content.timingTitle || 'Suggested timing'}>
                <div className="exam-strategies-chapter-table-wrap">
                  <table className="exam-strategies-chapter-table">
                    <thead>
                      <tr>
                        {timingColumns.map((column) => (
                          <th key={column} scope="col">
                            {column}
                          </th>
                        ))}
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
              </ArticleCard>
            ) : null}

            <ArticleListCard
              icon="🎯"
              title={content.approachTitle || 'General approach'}
              items={content.approach}
            />
            <ArticleListCard
              icon="🔗"
              title={content.crossPartTitle || 'Cross-part tactics'}
              items={content.crossPart}
            />
            <ArticleListCard
              icon="⚠️"
              title="Common mistakes to avoid"
              items={content.mistakes}
            />

            {content.studyTip ? (
              <ArticleCard icon="💡" title="Study tip" variant="tip">
                <p className="exam-strategies-chapter-card__lead">{content.studyTip}</p>
              </ArticleCard>
            ) : null}

            {children}
          </div>
        ) : (
          <div className="exam-strategies-chapter-placeholder">
            <p>Content for this chapter is coming soon.</p>
          </div>
        )}

        <footer className="exam-strategies-chapter-footer">
          {prevHref ? (
            <Link href={prevHref} className="exam-strategies-chapter-step">
              {prevLabel}
            </Link>
          ) : null}

          <Link href={resolvedBackHref} className="exam-strategies-chapter-back">
            {backLabel || 'Back'}
          </Link>

          {nextHref ? (
            <Link href={nextHref} className="exam-strategies-chapter-step">
              {nextLabel}
            </Link>
          ) : null}
        </footer>

        <ExamStrategiesChapterStyles />
        <TeoriaGlobalStyles />
      </div>
    </main>
  );
}

function ArticleCard({ icon, title, variant, children }) {
  const variantClass = variant ? ` exam-strategies-chapter-card--${variant}` : '';
  return (
    <section className={`exam-strategies-chapter-card${variantClass}`}>
      <header className="exam-strategies-chapter-card__head">
        <span className="exam-strategies-chapter-card__icon" aria-hidden>
          {icon}
        </span>
        <h2 className="exam-strategies-chapter-card__title">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function ArticleListCard({ icon, title, items }) {
  if (!items?.length) return null;
  return (
    <ArticleCard icon={icon} title={title}>
      <ul className="exam-strategies-chapter-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </ArticleCard>
  );
}
