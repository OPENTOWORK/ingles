'use client';

import Link from 'next/link';
import NivelesSectionHeader from '@/components/niveles/NivelesSectionHeader';
import { EXAM_PRACTICE_HEADER } from '@/data/levelHubSectionMeta';

const LINK_ICONS = {
  'exam-mode': '📝',
  reading: '📘',
  writing: '✍️',
  listening: '🎧',
  speaking: '🗣️',
  'reading-writing': '📖',
};

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

export default function ExamPracticeHubSection({ examLinks = [], isStudent }) {
  if (!examLinks.length) return null;

  return (
    <section className="exam-practice-hub" data-tour="level-exam-practice">
      <NivelesSectionHeader
        eyebrow={EXAM_PRACTICE_HEADER.eyebrow}
        title={EXAM_PRACTICE_HEADER.title}
        count={examLinks.length}
        description={EXAM_PRACTICE_HEADER.description}
      />

      <div className="exam-practice-hub__grid">
        {examLinks.map((exam) => {
          const blockedForStudent = isStudent && !exam.enabledForStudents;
          const kind = classifyExamLink(exam.href, exam.text);
          const label = cleanLinkLabel(exam.text);
          const icon = LINK_ICONS[kind] || '📋';
          const isExamMode = kind === 'exam-mode';

          const kindClass = `exam-practice-hub__card--${kind}`;

          if (blockedForStudent) {
            return (
              <div
                key={exam.href}
                className={`exam-practice-hub__card exam-practice-hub__card--disabled ${kindClass}${
                  isExamMode ? ' exam-practice-hub__card--featured' : ''
                }`}
                aria-disabled="true"
              >
                <ExamPracticeCardInner icon={icon} label={label} badge="Coming soon" />
              </div>
            );
          }

          return (
            <Link
              key={exam.href}
              href={exam.href}
              className={`exam-practice-hub__card ${kindClass}${
                isExamMode ? ' exam-practice-hub__card--featured' : ''
              }`}
              {...(isExamMode ? { 'data-tour': 'level-exam-mode' } : {})}
            >
              <ExamPracticeCardInner
                icon={icon}
                label={label}
                hint={isExamMode ? 'Full timed simulation' : 'Practice this paper'}
              />
            </Link>
          );
        })}
      </div>

      <ExamPracticeHubStyles />
    </section>
  );
}

function ExamPracticeCardInner({ icon, label, hint, badge }) {
  return (
    <>
      <span className="exam-practice-hub__icon-wrap" aria-hidden>
        <span className="exam-practice-hub__icon">{icon}</span>
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
      .niveles-level-page .exam-practice-hub__grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      @media (min-width: 640px) {
        .niveles-level-page .exam-practice-hub__grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 900px) {
        .niveles-level-page .exam-practice-hub__grid {
          display: flex;
          flex-wrap: nowrap;
          align-items: stretch;
        }
        .niveles-level-page .exam-practice-hub__card {
          flex: 1 1 0;
          min-width: 0;
        }
      }
      .niveles-level-page .exam-practice-hub__card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        min-height: 118px;
        padding: 16px 18px 14px;
        border-radius: 18px;
        border: 1px solid rgba(226, 232, 240, 0.9);
        background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%);
        text-decoration: none;
        color: inherit;
        box-shadow:
          0 2px 0 rgba(255, 255, 255, 0.9) inset,
          0 8px 24px rgba(15, 23, 42, 0.07);
        overflow: hidden;
        transition:
          transform 0.22s ease,
          box-shadow 0.22s ease,
          border-color 0.22s ease;
      }
      .niveles-level-page .exam-practice-hub__card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--exam-card-accent, #2563eb);
        opacity: 0.85;
      }
      .niveles-level-page .exam-practice-hub__card:hover {
        transform: translateY(-4px);
        box-shadow:
          0 2px 0 rgba(255, 255, 255, 0.95) inset,
          0 16px 36px color-mix(in srgb, var(--exam-card-accent, #2563eb) 22%, transparent);
      }
      .niveles-level-page .exam-practice-hub__card--exam-mode {
        --exam-card-accent: #4f46e5;
        background: linear-gradient(155deg, #eef2ff 0%, #ffffff 48%, #f5f3ff 100%);
        border-color: rgba(99, 102, 241, 0.28);
      }
      .niveles-level-page .exam-practice-hub__card--reading,
      .niveles-level-page .exam-practice-hub__card--reading-writing {
        --exam-card-accent: #2563eb;
        background: linear-gradient(155deg, #eff6ff 0%, #ffffff 50%, #f0f9ff 100%);
        border-color: rgba(37, 99, 235, 0.22);
      }
      .niveles-level-page .exam-practice-hub__card--writing {
        --exam-card-accent: #dc2626;
        background: linear-gradient(155deg, #fef2f2 0%, #ffffff 50%, #fff7ed 100%);
        border-color: rgba(220, 38, 38, 0.2);
      }
      .niveles-level-page .exam-practice-hub__card--listening {
        --exam-card-accent: #d97706;
        background: linear-gradient(155deg, #fffbeb 0%, #ffffff 50%, #fff7ed 100%);
        border-color: rgba(217, 119, 6, 0.22);
      }
      .niveles-level-page .exam-practice-hub__card--speaking {
        --exam-card-accent: #db2777;
        background: linear-gradient(155deg, #fdf2f8 0%, #ffffff 50%, #faf5ff 100%);
        border-color: rgba(219, 39, 119, 0.2);
      }
      .niveles-level-page .exam-practice-hub__card--featured {
        box-shadow:
          0 2px 0 rgba(255, 255, 255, 0.95) inset,
          0 10px 28px rgba(79, 70, 229, 0.14);
      }
      .niveles-level-page .exam-practice-hub__card--featured:hover {
        box-shadow:
          0 2px 0 rgba(255, 255, 255, 0.95) inset,
          0 18px 40px rgba(79, 70, 229, 0.22);
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
        width: 2.85rem;
        height: 2.85rem;
        border-radius: 14px;
        background: color-mix(in srgb, var(--exam-card-accent, #2563eb) 16%, white);
        border: 1px solid color-mix(in srgb, var(--exam-card-accent, #2563eb) 28%, transparent);
        box-shadow: 0 6px 14px color-mix(in srgb, var(--exam-card-accent, #2563eb) 18%, transparent);
      }
      .niveles-level-page .exam-practice-hub__icon {
        font-size: 1.65rem;
        line-height: 1;
      }
      .niveles-level-page .exam-practice-hub__card--featured .exam-practice-hub__icon-wrap {
        width: 3rem;
        height: 3rem;
      }
      .niveles-level-page .exam-practice-hub__card--featured .exam-practice-hub__icon {
        font-size: 1.8rem;
      }
      .niveles-level-page .exam-practice-hub__label {
        font-size: 0.95rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #0f172a;
        line-height: 1.25;
        padding-right: 1.75rem;
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
        right: 14px;
        bottom: 14px;
        display: inline-grid;
        place-items: center;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 999px;
        font-size: 0.95rem;
        font-weight: 800;
        color: #fff;
        background: var(--exam-card-accent, #2563eb);
        box-shadow: 0 4px 10px color-mix(in srgb, var(--exam-card-accent, #2563eb) 35%, transparent);
        transition: transform 0.2s ease;
      }
      .niveles-level-page .exam-practice-hub__card:hover .exam-practice-hub__arrow {
        transform: translateX(2px);
      }
    `}</style>
  );
}
