'use client';

import Link from 'next/link';
import ExamSkillIcon from '@/components/exam/ExamSkillIcon';
import NivelesSectionHeader from '@/components/niveles/NivelesSectionHeader';
import { EXAM_PRACTICE_HEADER } from '@/data/levelHubSectionMeta';

function classifyExamLink(href = '', text = '') {
  const h = href.toLowerCase();
  const t = text.toLowerCase();
  if (h.includes('exam-mode') || t.includes('exam mode')) return 'exam-mode';
  if (h.includes('writing') || t.includes('writing')) return 'writing';
  if (h.includes('listening') || t.includes('listening')) return 'listening';
  if (h.includes('speaking') || t.includes('speaking')) return 'speaking';
  if (t.includes('reading &') || t.includes('reading and')) return 'reading';
  return 'reading';
}

function cleanLinkLabel(text = '') {
  return String(text)
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '')
    .trim();
}

function getExamLinkMeta(exam) {
  const kind = classifyExamLink(exam.href, exam.text);
  return {
    kind,
    label: cleanLinkLabel(exam.text),
    isExamMode: kind === 'exam-mode',
    kindClass: `exam-practice-hub__card--${kind}`,
  };
}

function ExamPracticeCard({ exam, isStudent, variant = 'skill' }) {
  const blockedForStudent = isStudent && !exam.enabledForStudents;
  const { kind, kindClass, label, isExamMode } = getExamLinkMeta(exam);
  const isBanner = variant === 'banner';
  const cardClass = [
    'exam-practice-hub__card',
    kindClass,
    isBanner ? 'exam-practice-hub__card--banner' : '',
    isExamMode ? 'exam-practice-hub__card--featured' : '',
    blockedForStudent ? 'exam-practice-hub__card--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inner = isBanner ? (
    <ExamModeBannerInner
      kind={kind}
      label={label}
      hint="Full timed simulation"
      badge={blockedForStudent ? 'Coming soon' : null}
    />
  ) : (
    <ExamPracticeCardInner
      kind={kind}
      label={label}
      hint="Practice this paper"
      badge={blockedForStudent ? 'Coming soon' : null}
    />
  );

  if (blockedForStudent) {
    return (
      <div className={cardClass} aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={exam.href}
      className={cardClass}
      {...(isExamMode ? { 'data-tour': 'level-exam-mode' } : {})}
    >
      {inner}
    </Link>
  );
}

export default function ExamPracticeHubSection({ examLinks = [], isStudent }) {
  if (!examLinks.length) return null;

  const examModeLink = examLinks.find((exam) => getExamLinkMeta(exam).isExamMode);
  const skillLinks = examLinks.filter((exam) => !getExamLinkMeta(exam).isExamMode);

  return (
    <section className="exam-practice-hub" data-tour="level-exam-practice">
      <NivelesSectionHeader
        eyebrow={EXAM_PRACTICE_HEADER.eyebrow}
        title={EXAM_PRACTICE_HEADER.title}
        count={examLinks.length}
        description={EXAM_PRACTICE_HEADER.description}
      />

      {examModeLink ? (
        <div className="exam-practice-hub__exam-mode">
          <ExamPracticeCard exam={examModeLink} isStudent={isStudent} variant="banner" />
        </div>
      ) : null}

      {skillLinks.length > 0 ? (
        <div className="exam-practice-hub__skills-grid">
          {skillLinks.map((exam) => (
            <ExamPracticeCard key={exam.href} exam={exam} isStudent={isStudent} />
          ))}
        </div>
      ) : null}

      <ExamPracticeHubStyles />
    </section>
  );
}

function ExamModeBannerInner({ kind, label, hint, badge }) {
  return (
    <div className="exam-practice-hub__banner-inner">
      <span className="exam-practice-hub__icon-wrap" aria-hidden>
        <ExamSkillIcon theme={kind} size="md" />
      </span>
      <div className="exam-practice-hub__banner-copy">
        <span className="exam-practice-hub__label">{label}</span>
        {badge ? (
          <span className="exam-practice-hub__badge">{badge}</span>
        ) : hint ? (
          <span className="exam-practice-hub__hint">{hint}</span>
        ) : null}
      </div>
      {!badge ? (
        <span className="exam-practice-hub__arrow exam-practice-hub__arrow--banner" aria-hidden>
          →
        </span>
      ) : null}
    </div>
  );
}

function ExamPracticeCardInner({ kind, label, hint, badge }) {
  return (
    <>
      <span className="exam-practice-hub__icon-wrap" aria-hidden>
        <ExamSkillIcon theme={kind} size="md" />
      </span>
      <span className="exam-practice-hub__label">{label}</span>
      {badge ? (
        <span className="exam-practice-hub__badge">{badge}</span>
      ) : hint ? (
        <span className="exam-practice-hub__hint">{hint}</span>
      ) : null}
      {!badge ? (
        <span className="exam-practice-hub__arrow" aria-hidden>
          →
        </span>
      ) : null}
    </>
  );
}

function ExamPracticeHubStyles() {
  return (
    <style jsx global>{`
      .niveles-level-page .exam-practice-hub {
        margin-top: 1.5rem;
        margin-bottom: 0.25rem;
        padding: 6px;
      }
      .niveles-level-page .exam-practice-hub__exam-mode {
        margin-bottom: 14px;
      }
      .niveles-level-page .exam-practice-hub__skills-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      @media (min-width: 640px) {
        .niveles-level-page .exam-practice-hub__skills-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 900px) {
        .niveles-level-page .exam-practice-hub__skills-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
      .niveles-level-page .exam-practice-hub__card--banner {
        width: 100%;
        min-height: 96px;
        padding: 18px 22px;
      }
      .niveles-level-page .exam-practice-hub__banner-inner {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
      }
      .niveles-level-page .exam-practice-hub__banner-copy {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        min-width: 0;
      }
      .niveles-level-page .exam-practice-hub__card--banner .exam-practice-hub__label {
        font-size: clamp(1.05rem, 2vw, 1.2rem);
        padding-right: 0;
      }
      .niveles-level-page .exam-practice-hub__card--banner .exam-practice-hub__hint {
        font-size: 0.88rem;
      }
      .niveles-level-page .exam-practice-hub__arrow--banner {
        position: static;
        flex: 0 0 auto;
        width: 2.25rem;
        height: 2.25rem;
        font-size: 1.05rem;
      }
      .niveles-level-page .exam-practice-hub__card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        min-height: 112px;
        padding: 16px 16px 14px;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        text-decoration: none;
        color: inherit;
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 6px 18px rgba(15, 23, 42, 0.05);
        overflow: hidden;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          border-color 0.2s ease;
      }
      .niveles-level-page .exam-practice-hub__card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--exam-card-accent, #2563eb);
        opacity: 0.9;
      }
      .niveles-level-page .exam-practice-hub__card:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--exam-card-accent, #2563eb) 35%, #e2e8f0);
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 12px 28px color-mix(in srgb, var(--exam-card-accent, #2563eb) 14%, transparent);
      }
      .niveles-level-page .exam-practice-hub__card--exam-mode {
        --exam-card-accent: #4f46e5;
        background: linear-gradient(155deg, #f5f7ff 0%, #ffffff 100%);
        border-color: rgba(99, 102, 241, 0.22);
      }
      .niveles-level-page .exam-practice-hub__card--reading,
      .niveles-level-page .exam-practice-hub__card--reading-writing {
        --exam-card-accent: #2563eb;
        background: linear-gradient(155deg, #f8fbff 0%, #ffffff 100%);
        border-color: rgba(37, 99, 235, 0.18);
      }
      .niveles-level-page .exam-practice-hub__card--writing {
        --exam-card-accent: #059669;
        background: linear-gradient(155deg, #f7fdf9 0%, #ffffff 100%);
        border-color: rgba(5, 150, 105, 0.18);
      }
      .niveles-level-page .exam-practice-hub__card--listening {
        --exam-card-accent: #d97706;
        background: linear-gradient(155deg, #fffdf8 0%, #ffffff 100%);
        border-color: rgba(217, 119, 6, 0.18);
      }
      .niveles-level-page .exam-practice-hub__card--speaking {
        --exam-card-accent: #db2777;
        background: linear-gradient(155deg, #fffbfd 0%, #ffffff 100%);
        border-color: rgba(219, 39, 119, 0.18);
      }
      .niveles-level-page .exam-practice-hub__card--featured {
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 8px 22px rgba(79, 70, 229, 0.12);
      }
      .niveles-level-page .exam-practice-hub__card--featured:hover {
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 14px 32px rgba(79, 70, 229, 0.18);
      }
      .niveles-level-page .exam-practice-hub__card--disabled {
        cursor: not-allowed;
        opacity: 0.72;
        filter: grayscale(0.15);
        pointer-events: none;
        background: #f1f5f9;
      }
      .niveles-level-page .exam-practice-hub__icon-wrap {
        display: inline-grid;
        place-items: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 10px;
        background: color-mix(in srgb, var(--exam-card-accent, #2563eb) 10%, white);
        border: 1px solid color-mix(in srgb, var(--exam-card-accent, #2563eb) 22%, #e2e8f0);
        color: var(--exam-card-accent, #2563eb);
      }
      .niveles-level-page .exam-practice-hub__icon-wrap .exam-skill-icon {
        --skill-accent: var(--exam-card-accent, #2563eb);
        color: var(--exam-card-accent, #2563eb);
        background: transparent;
        border: none;
      }
      .niveles-level-page .exam-practice-hub__card--featured .exam-practice-hub__icon-wrap {
        width: 2.65rem;
        height: 2.65rem;
      }
      .niveles-level-page .exam-practice-hub__label {
        font-size: 0.92rem;
        font-weight: 700;
        letter-spacing: -0.015em;
        color: #0f172a;
        line-height: 1.3;
        padding-right: 1.65rem;
      }
      .niveles-level-page .exam-practice-hub__card--featured .exam-practice-hub__label {
        font-size: 1.02rem;
      }
      .niveles-level-page .exam-practice-hub__hint {
        font-size: 0.8rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--exam-card-accent, #475569) 55%, #64748b);
        line-height: 1.35;
      }
      .niveles-level-page .exam-practice-hub__badge {
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748b;
      }
      .niveles-level-page .exam-practice-hub__arrow {
        position: absolute;
        right: 12px;
        bottom: 12px;
        display: inline-grid;
        place-items: center;
        width: 1.55rem;
        height: 1.55rem;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--exam-card-accent, #2563eb);
        background: color-mix(in srgb, var(--exam-card-accent, #2563eb) 10%, white);
        border: 1px solid color-mix(in srgb, var(--exam-card-accent, #2563eb) 18%, #e2e8f0);
        transition: transform 0.18s ease, background 0.18s ease;
      }
      .niveles-level-page .exam-practice-hub__card:hover .exam-practice-hub__arrow {
        transform: translateX(1px);
        background: color-mix(in srgb, var(--exam-card-accent, #2563eb) 16%, white);
      }
    `}</style>
  );
}
