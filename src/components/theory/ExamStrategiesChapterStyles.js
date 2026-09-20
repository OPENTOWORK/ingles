'use client';

/**
 * Estilos compartidos del formato Exam Strategies (capítulos y part tips).
 * El color de cada skill se inyecta con `--chapter-accent` en el `<main>`.
 */
export default function ExamStrategiesChapterStyles() {
  return (
    <style jsx global>{`
      .exam-strategies-chapter-page:not(.content-hub-shell) {
        max-width: min(920px, 100%);
        margin: 0 auto;
        padding: 0 1.25rem 3.5rem;
      }

      .shell.content-hub-shell.exam-strategies-chapter-page {
        width: 100%;
        max-width: var(--content-hub-max-width);
        margin: 0 auto;
        padding: var(--content-hub-padding-y) var(--content-hub-padding-x) 3rem;
        box-sizing: border-box;
      }

      .shell.content-hub-shell.exam-strategies-chapter-page .levels-b2-page-content {
        width: 100%;
        max-width: 100%;
        margin-inline: auto;
        box-sizing: border-box;
      }

      .shell.content-hub-shell.exam-strategies-chapter-page .page-hero,
      .shell.content-hub-shell.exam-strategies-chapter-page .exam-strategies-chapter-body,
      .shell.content-hub-shell.exam-strategies-chapter-page .exam-strategies-chapter-placeholder,
      .shell.content-hub-shell.exam-strategies-chapter-page .exam-strategies-chapter-footer,
      .shell.content-hub-shell.exam-strategies-chapter-page .exam-strategies-index {
        width: 100%;
        max-width: 100%;
        margin-inline: 0;
        box-sizing: border-box;
      }

      .exam-strategies-chapter-page .page-hero__mascot,
      .exam-theory-topics-page .page-hero__mascot,
      .niveles-page--theory-hub .page-hero__mascot {
        display: none !important;
      }

      .exam-strategies-chapter-page .page-hero {
        margin-bottom: 1.75rem;
      }

      .exam-strategies-chapter-layout {
        display: grid;
        grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
        gap: clamp(1rem, 2.5vw, 1.75rem);
        align-items: start;
      }

      .exam-strategies-chapter-layout--solo {
        grid-template-columns: minmax(0, 1fr);
      }

      .exam-strategies-chapter-aside {
        min-width: 0;
      }

      .exam-strategies-chapter-main {
        min-width: 0;
      }

      @media (max-width: 900px) {
        .exam-strategies-chapter-layout {
          grid-template-columns: 1fr;
        }

        .exam-strategies-chapter-page .exam-strategies-index--sidebar,
        .exam-theory-topics-page .exam-strategies-index--sidebar {
          position: static;
          max-height: none;
        }
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
        border-color: color-mix(in srgb, var(--chapter-accent) 30%, #e2e8f0);
        background: linear-gradient(
          165deg,
          color-mix(in srgb, var(--chapter-accent) 10%, #fff) 0%,
          #fff 70%
        );
      }

      .exam-strategies-chapter-card__head {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-bottom: 0.95rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid color-mix(in srgb, var(--chapter-accent) 22%, #e2e8f0);
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

      .exam-strategies-chapter-chip {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--chapter-accent) 12%, #fff);
        border: 1px solid color-mix(in srgb, var(--chapter-accent) 28%, #e2e8f0);
        color: color-mix(in srgb, var(--chapter-accent) 75%, #1e1b4b);
        font-size: 0.88rem;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        transition: background 0.15s ease, transform 0.15s ease;
      }

      .exam-strategies-chapter-chip:hover {
        background: color-mix(in srgb, var(--chapter-accent) 20%, #fff);
        transform: translateY(-1px);
      }

      .exam-strategies-chapter-chip--active {
        background: var(--chapter-accent);
        border-color: var(--chapter-accent);
        color: #fff;
      }

      .exam-strategies-chapter-chip--active:hover {
        background: var(--chapter-accent);
      }

      .exam-strategies-chapter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
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
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
        gap: 0.6rem 0.75rem;
        margin-top: 1.75rem;
      }

      .exam-strategies-chapter-back,
      .exam-strategies-chapter-step {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.55rem 1.1rem;
        border: 1px solid color-mix(in srgb, var(--chapter-accent) 26%, #e2e8f0);
        border-radius: 999px;
        font-size: 0.92rem;
        font-weight: 700;
        font-family: inherit;
        color: color-mix(in srgb, var(--chapter-accent) 78%, #1e1b4b);
        background: color-mix(in srgb, var(--chapter-accent) 10%, #fff);
        text-decoration: none;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .exam-strategies-chapter-back:hover,
      .exam-strategies-chapter-step:hover {
        background: color-mix(in srgb, var(--chapter-accent) 18%, #fff);
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

      body.reading-night-mode .exam-strategies-chapter-back,
      body.reading-night-mode .exam-strategies-chapter-step,
      body.reading-night-mode .exam-strategies-chapter-chip {
        background: color-mix(in srgb, var(--chapter-accent) 28%, #0f172a);
        border-color: color-mix(in srgb, var(--chapter-accent) 45%, #334155);
        color: #e2e8f0;
      }
    `}</style>
  );
}
