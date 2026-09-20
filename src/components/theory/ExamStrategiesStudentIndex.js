'use client';

import Link from 'next/link';
import { getExamStrategiesStudentIndex } from '@/data/examStrategiesStudentIndex';

function normalizePath(path = '') {
  const raw = String(path || '').split('?')[0].split('#')[0];
  if (!raw || raw === '/') return '/';
  return raw.replace(/\/$/, '');
}

function hrefMatchesActive(href, activeHref) {
  if (!href || !activeHref) return false;
  return normalizePath(href) === normalizePath(activeHref);
}

function chapterTreeIsActive(chapter, activeHref) {
  if (chapter.href && hrefMatchesActive(chapter.href, activeHref)) return true;
  if (chapter.children?.length) {
    return chapter.children.some((child) => chapterTreeIsActive(child, activeHref));
  }
  return false;
}

/**
 * @param {'hub' | 'sidebar'} variant
 * hub: lista ancha en la página del skill; sidebar: columna izquierda en capítulos y tips.
 */
export default function ExamStrategiesStudentIndex({
  sectionSlug,
  sectionAccent = '#38bdf8',
  variant = 'hub',
  activeHref = '',
}) {
  const chapters = getExamStrategiesStudentIndex(sectionSlug);
  if (!chapters?.length) return null;

  const isSidebar = variant === 'sidebar';
  const sectionClass = isSidebar
    ? 'exam-strategies-index exam-strategies-index--sidebar'
    : 'exam-strategies-index exam-strategies-index--hub';

  return (
    <section className={sectionClass} aria-labelledby="exam-strategies-index-title">
      <header className="exam-strategies-index__head">
        <h2 id="exam-strategies-index-title" className="exam-strategies-index__title">
          {isSidebar ? 'In this section' : 'Index'}
        </h2>
      </header>

      <ol className="exam-strategies-index__list">
        {chapters.map((chapter) => (
          <IndexChapterItem
            key={chapter.href || `${chapter.label}-${chapter.partName || ''}`}
            chapter={chapter}
            activeHref={activeHref}
            isSidebar={isSidebar}
          />
        ))}
      </ol>
    </section>
  );
}

function IndexChapterItem({ chapter, activeHref, isSidebar, nested = false }) {
  if (chapter.children?.length) {
    const groupActive = chapterTreeIsActive(chapter, activeHref);
    return (
      <li
        className={`exam-strategies-index__item exam-strategies-index__item--group${
          nested ? ' exam-strategies-index__item--nested' : ''
        }${groupActive ? ' exam-strategies-index__item--active-group' : ''}`}
      >
        <div className="exam-strategies-index__group-head">
          <span className="exam-strategies-index__group-label">{chapter.label}</span>
          {chapter.partName ? (
            <span className="exam-strategies-index__part-name">{chapter.partName}</span>
          ) : null}
        </div>
        <ol className="exam-strategies-index__sublist">
          {chapter.children.map((child) => (
            <IndexChapterItem
              key={child.href || child.label}
              chapter={child}
              activeHref={activeHref}
              isSidebar={isSidebar}
              nested
            />
          ))}
        </ol>
      </li>
    );
  }

  if (!chapter.href) {
    return (
      <li className={`exam-strategies-index__item${nested ? ' exam-strategies-index__item--nested' : ''}`}>
        <span className="exam-strategies-index__link exam-strategies-index__link--static">
          <ChapterLinkText chapter={chapter} />
        </span>
      </li>
    );
  }

  const isActive = hrefMatchesActive(chapter.href, activeHref);

  return (
    <li
      className={`exam-strategies-index__item${nested ? ' exam-strategies-index__item--nested' : ''}${
        isActive ? ' exam-strategies-index__item--current' : ''
      }`}
    >
      <Link
        href={chapter.href}
        className={`exam-strategies-index__link${isActive ? ' exam-strategies-index__link--active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <ChapterLinkText chapter={chapter} />
        {!isSidebar ? <span className="exam-strategies-index__link-cta">Open →</span> : null}
      </Link>
    </li>
  );
}

function ChapterLinkText({ chapter }) {
  return (
    <span className="exam-strategies-index__link-text">
      <span className="exam-strategies-index__link-label">{chapter.label}</span>
      {chapter.partName ? (
        <span className="exam-strategies-index__part-name">{chapter.partName}</span>
      ) : null}
    </span>
  );
}
