'use client';

/**
 * Shared geometry for the Exam Practice surfaces.
 * Skill-specific colours remain driven by data-skill-theme.
 */
export default function ExamPracticeSurfaceStyles() {
  return (
    <style jsx global>{`
      .levels-b2-practice,
      .exam-practice-level-hub {
        --practice-surface-radius: 22px;
        --practice-card-radius: 18px;
        --practice-accent: #32b8f4;
        --practice-accent-soft: #eef9ff;
        --practice-border: color-mix(in srgb, var(--practice-accent) 24%, #dbe5ef);
      }

      .levels-b2-practice[data-skill-theme='reading'] {
        --practice-accent: #32b8f4;
        --practice-accent-soft: #eef9ff;
      }

      .levels-b2-practice[data-skill-theme='writing'] {
        --practice-accent: #1b9a62;
        --practice-accent-soft: #f4faf6;
      }

      .levels-b2-practice[data-skill-theme='listening'] {
        --practice-accent: #ef8b24;
        --practice-accent-soft: #fff7ed;
      }

      .levels-b2-practice[data-skill-theme='speaking'] {
        --practice-accent: #e83e8c;
        --practice-accent-soft: #fff1f7;
      }

      /* Main practice bubbles: one complete rounded outline, never a square corner. */
      .levels-b2-practice__header,
      .levels-b2-practice__work-panel,
      .levels-exam-module-nav,
      .levels-exam-split-card,
      .levels-exam-practice-page,
      .phone-practice-step__item,
      .phone-practice-step__scroll,
      .phone-practice-step__actions {
        border-radius: var(--practice-surface-radius) !important;
        background-clip: padding-box;
        isolation: isolate;
      }

      /* Skill header, part cards and exercise cards share the hub card. */
      .levels-b2-practice--skill-compact .levels-b2-practice__header {
        border: 1px solid #e8e4f7 !important;
        border-top-width: 1px !important;
        border-top-color: #e8e4f7 !important;
        border-radius: 18px !important;
        background: #ffffff !important;
        box-shadow: 0 10px 28px rgba(76, 56, 170, 0.07) !important;
        overflow: hidden;
      }

      .levels-b2-practice--skill-compact .phone-practice-step__item,
      .levels-b2-practice--skill-compact .levels-exam-split-card {
        border: 1px solid #e8e4f7 !important;
        background: #ffffff !important;
        box-shadow: 0 10px 28px rgba(76, 56, 170, 0.07) !important;
      }

      .levels-b2-practice--skill-compact .phone-practice-step__item:hover,
      .levels-b2-practice--skill-compact .phone-practice-step__item--current {
        background: #ffffff !important;
        border-color: color-mix(in srgb, var(--skill-accent, var(--practice-accent)) 32%, #e8e4f7) !important;
        box-shadow: 0 14px 32px rgba(76, 56, 170, 0.12) !important;
      }

      .levels-b2-practice--skill-compact .levels-b2-practice__header::before,
      .levels-b2-practice--skill-compact .levels-b2-practice__header::after {
        display: none !important;
        content: none !important;
      }

      .levels-exam-module-nav {
        border: 1px solid #e8e4f7 !important;
        background: #ffffff !important;
        box-shadow: 0 10px 28px rgba(76, 56, 170, 0.07) !important;
      }

      /* Choose Part cards and exercise cards use the same corner language. */
      .phone-practice-step__list > li,
      .phone-practice-step__item,
      .levels-exam-split-card,
      .levels-exam-practice-page {
        overflow: hidden;
      }

      .phone-practice-step__item,
      .levels-exam-split-card {
        border-radius: var(--practice-card-radius) !important;
      }

      .phone-practice-step__item::before,
      .phone-practice-step__item::after,
      .levels-exam-split-card::before,
      .levels-exam-split-card::after {
        border-radius: inherit;
      }

      /* Level hub bubbles: shared rounding, original skill colours untouched. */
      .exam-practice-hub__quadrant-inner,
      .exam-practice-hub__card,
      .exam-practice-hub__quiz-game .exam-practice-hub__card,
      .page-hero {
        border-radius: var(--practice-surface-radius) !important;
        background-clip: padding-box;
        isolation: isolate;
      }

      .exam-practice-level-hub .page-hero,
      .exam-practice-level-hub .exam-practice-hub__quadrant-inner {
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      .exam-practice-hub__card {
        border-radius: var(--practice-card-radius) !important;
        overflow: hidden;
      }

      .exam-practice-hub__card::before,
      .exam-practice-hub__card::after {
        border-radius: inherit;
      }

      /* Prevent a child background from visually squaring off any corner. */
      .levels-b2-practice__work-panel > :first-child,
      .levels-exam-split-card > :first-child,
      .exam-practice-hub__quadrant-inner > :first-child {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
      }

      .levels-b2-practice__work-panel > :last-child,
      .levels-exam-split-card > :last-child,
      .exam-practice-hub__quadrant-inner > :last-child {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
      }

      body.reading-night-mode .levels-b2-practice--skill-compact .levels-b2-practice__header,
      body.reading-night-mode .levels-exam-module-nav {
        background: #172132 !important;
        border-color: #475569 !important;
      }

      @media (max-width: 640px) {
        .levels-b2-practice,
        .exam-practice-level-hub {
          --practice-surface-radius: 18px;
          --practice-card-radius: 16px;
        }

        .levels-b2-practice__header,
        .levels-b2-practice__work-panel,
        .levels-exam-module-nav,
        .phone-practice-step__item,
        .exam-practice-hub__quadrant-inner,
        .exam-practice-hub__card,
        .page-hero {
          border-radius: var(--practice-surface-radius) !important;
        }

        .exam-practice-level-hub .levels-b2-page-content {
          border-radius: 18px;
        }

        .exam-practice-level-hub .page-hero,
        .exam-practice-level-hub .exam-practice-hub__quadrant-inner {
          border-radius: 0 !important;
        }

        .phone-practice-step__item,
        .exam-practice-hub__card {
          border-radius: var(--practice-card-radius) !important;
        }
      }
    `}</style>
  );
}
