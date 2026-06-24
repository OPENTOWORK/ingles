'use client';

import Link from 'next/link';
import { getExamStrategiesStudentIndex } from '@/data/examStrategiesStudentIndex';

export default function ExamStrategiesStudentIndex({ sectionSlug, sectionAccent = '#38bdf8' }) {
  const chapters = getExamStrategiesStudentIndex(sectionSlug);
  if (!chapters?.length) return null;

  return (
    <section className="exam-strategies-index" aria-labelledby="exam-strategies-index-title">
      <header className="exam-strategies-index__head">
        <h2 id="exam-strategies-index-title" className="exam-strategies-index__title">
          Index
        </h2>
        <p className="exam-strategies-index__intro">
          Open a chapter for overall strategy or part-specific tips.
        </p>
      </header>

      <ol className="exam-strategies-index__list">
        {chapters.map((chapter) => (
          <IndexChapterItem
            key={chapter.label}
            chapter={chapter}
            sectionAccent={sectionAccent}
          />
        ))}
      </ol>

      <ExamStrategiesStudentIndexStyles accent={sectionAccent} />
    </section>
  );
}

function IndexChapterItem({ chapter, sectionAccent, nested = false }) {
  if (chapter.children?.length) {
    return (
      <li className={`exam-strategies-index__item${nested ? ' exam-strategies-index__item--nested' : ''}`}>
        <span className="exam-strategies-index__group-label">{chapter.label}</span>
        <ol className="exam-strategies-index__sublist">
          {chapter.children.map((child) => (
            <IndexChapterItem
              key={child.label}
              chapter={child}
              sectionAccent={sectionAccent}
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
          {chapter.label}
        </span>
      </li>
    );
  }

  return (
    <li className={`exam-strategies-index__item${nested ? ' exam-strategies-index__item--nested' : ''}`}>
      <Link href={chapter.href} className="exam-strategies-index__link">
        <span className="exam-strategies-index__link-label">{chapter.label}</span>
        <span className="exam-strategies-index__link-cta" style={{ color: sectionAccent }}>
          Open →
        </span>
      </Link>
    </li>
  );
}

function ExamStrategiesStudentIndexStyles({ accent }) {
  return (
    <style jsx global>{`
      .exam-theory-topics-page .exam-strategies-index {
        margin: 0 0 28px;
        padding: 20px;
        border-radius: 18px;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, ${accent} 8%, #ffffff) 0%,
          #f8fafc 100%
        );
        border: 1px solid color-mix(in srgb, ${accent} 20%, #e2e8f0);
        box-shadow: 0 4px 24px color-mix(in srgb, ${accent} 8%, transparent);
      }
      .exam-theory-topics-page .exam-strategies-index__head {
        margin-bottom: 16px;
      }
      .exam-theory-topics-page .exam-strategies-index__eyebrow {
        margin: 0 0 6px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: ${accent};
      }
      .exam-theory-topics-page .exam-strategies-index__title {
        margin: 0;
        font-size: clamp(1.2rem, 2.4vw, 1.45rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text);
      }
      .exam-theory-topics-page .exam-strategies-index__intro {
        margin: 10px 0 0;
        max-width: 640px;
        font-size: 0.92rem;
        line-height: 1.55;
        color: #5a6b7d;
      }
      .exam-theory-topics-page .exam-strategies-index__list,
      .exam-theory-topics-page .exam-strategies-index__sublist {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .exam-theory-topics-page .exam-strategies-index__sublist {
        margin-top: 10px;
        padding-left: 14px;
        border-left: 2px solid color-mix(in srgb, ${accent} 28%, #e2e8f0);
      }
      .exam-theory-topics-page .exam-strategies-index__group-label {
        display: block;
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--text);
      }
      .exam-theory-topics-page .exam-strategies-index__link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        background: #fff;
        text-decoration: none;
        transition:
          transform 0.2s,
          box-shadow 0.2s,
          border-color 0.2s;
      }
      .exam-theory-topics-page .exam-strategies-index__link:hover {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, ${accent} 45%, #e2e8f0);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
      }
      .exam-theory-topics-page .exam-strategies-index__link--static {
        display: block;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        background: #fff;
        font-weight: 700;
        color: var(--text);
      }
      .exam-theory-topics-page .exam-strategies-index__link-label {
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--text);
      }
      .exam-theory-topics-page .exam-strategies-index__link-cta {
        flex: 0 0 auto;
        font-size: 0.8rem;
        font-weight: 700;
      }
    `}</style>
  );
}
