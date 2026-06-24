'use client';

export default function NivelesPageStyles() {
  return (
    <style jsx global>{`
      .niveles-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .niveles-page .shell,
      .niveles-page.shell {
        min-height: 100svh;
        max-width: 1100px;
        margin: 0 auto;
        padding: clamp(20px, 4vw, 32px) clamp(14px, 3vw, 20px);
      }
      .niveles-page.center {
        display: grid;
        place-items: center;
      }
      .niveles-page .sections {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }
      .niveles-page .section {
        padding: 6px;
      }
      .niveles-page .niveles-section-head {
        margin-bottom: 18px;
        padding: 18px 20px 16px;
        border-radius: 16px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid rgba(226, 232, 240, 0.95);
        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
      }
      .niveles-page .niveles-section-head__row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }
      .niveles-page .niveles-section-head__title-wrap {
        min-width: 0;
      }
      .niveles-page .niveles-section-head__eyebrow {
        display: block;
        margin-bottom: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #2563eb;
      }
      .niveles-page .niveles-section-head__title {
        margin: 0;
        font-size: clamp(1.35rem, 2.8vw, 1.65rem);
        font-weight: 800;
        letter-spacing: -0.025em;
        line-height: 1.15;
        color: var(--text);
      }
      .niveles-page .niveles-section-head__count {
        flex: 0 0 auto;
        display: inline-grid;
        place-items: center;
        min-width: 36px;
        height: 36px;
        padding: 0 10px;
        border-radius: 999px;
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        border: 1px solid rgba(37, 99, 235, 0.18);
        font-size: 0.82rem;
        font-weight: 800;
        color: #1d4ed8;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
      }
      .niveles-page .niveles-section-head__desc {
        margin: 12px 0 0;
        max-width: 680px;
        font-size: 0.96rem;
        line-height: 1.55;
        color: #5a6b7d;
      }
      .niveles-page .area-card {
        margin-right: 0;
      }
      .niveles-page .area-card__icon {
        font-size: 13px;
        letter-spacing: 0.02em;
      }
      .niveles-page .area-card:hover .area-card__title {
        font-size: 22px;
        transform: none;
      }
      .niveles-page .area-card:hover .area-card__icon {
        transform: scale(1.28);
      }
      .niveles-page .level-item {
        position: relative;
        list-style: none;
      }
      .niveles-page .area-card--disabled {
        position: relative;
        cursor: not-allowed;
        filter: grayscale(0.15);
        opacity: 0.92;
        pointer-events: none;
        background: #f8fafc;
        border-color: #e2e8f0;
      }
      .niveles-page .level-item__lock-badge {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.3rem 0.55rem;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.72);
        color: #fff;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        pointer-events: none;
        backdrop-filter: blur(4px);
      }
      .niveles-page .level-item__lock-badge svg {
        flex-shrink: 0;
      }
      @media (min-width: 640px) {
        .niveles-page .niveles-grid > .level-item:nth-child(5) {
          grid-column: 1 / -1;
          width: calc(50% - 8px);
          justify-self: center;
        }
      }
      @media (min-width: 980px) {
        .niveles-page .niveles-grid {
          grid-template-columns: repeat(6, minmax(0, 1fr));
        }
        .niveles-page .niveles-grid > .level-item {
          grid-column: span 2;
        }
        .niveles-page .niveles-grid > .level-item:nth-child(4) {
          grid-column: 2 / span 2;
        }
        .niveles-page .niveles-grid > .level-item:nth-child(5) {
          grid-column: 4 / span 2;
          width: auto;
          justify-self: stretch;
        }
      }
      .niveles-page .loader {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid rgba(0, 112, 243, 0.2);
        border-top-color: #0070f3;
        animation: niveles-spin 1s linear infinite;
      }
      @keyframes niveles-spin {
        to {
          transform: rotate(360deg);
        }
      }
      .niveles-page .exam-theory-section {
        margin-top: 8px;
      }
      .niveles-page .exam-theory-section__hero {
        margin-bottom: 4px;
      }
      .niveles-page .exam-theory-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
      @media (min-width: 900px) {
        .niveles-page .exam-theory-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
      .niveles-page .exam-theory-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        --exam-theory-accent: #38bdf8;
        border: 1px solid color-mix(in srgb, var(--exam-theory-accent) 20%, #e2e8f0);
        border-top: 3px solid var(--exam-theory-accent);
        background: linear-gradient(
          155deg,
          color-mix(in srgb, var(--exam-theory-accent) 8%, #ffffff) 0%,
          #ffffff 100%
        );
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }
      .niveles-page .exam-theory-card:hover {
        border-color: color-mix(in srgb, var(--exam-theory-accent) 35%, #e2e8f0);
        border-top-color: var(--exam-theory-accent);
        box-shadow: 0 8px 24px color-mix(in srgb, var(--exam-theory-accent) 12%, transparent);
      }
      .niveles-page .exam-theory-global-progress {
        margin-top: 18px;
        padding: 16px 18px;
        border-radius: 16px;
        background: linear-gradient(180deg, #f0f9ff 0%, #ecfdf5 100%);
        border: 1px solid rgba(28, 176, 246, 0.2);
      }
      .niveles-page .exam-theory-global-hint {
        margin: 8px 0 0;
        font-size: 0.82rem;
        color: #5a6b7d;
        line-height: 1.4;
      }
      .niveles-page .exam-theory-item {
        position: relative;
        list-style: none;
      }
      .niveles-page .exam-theory-item__lock {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        pointer-events: none;
      }
      .niveles-page .exam-theory-card__lock-hint {
        margin: 0;
        font-size: 0.78rem;
        color: #94a3b8;
        text-align: center;
        line-height: 1.35;
      }
      .niveles-page .page-hero-wrap__breadcrumb .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 0.75rem;
      }
      .niveles-page .page-hero-wrap__breadcrumb .breadcrumb a {
        color: #38bdf8;
        text-decoration: none;
        font-weight: 600;
      }
      .niveles-page .page-hero-wrap__breadcrumb .breadcrumb a:hover {
        text-decoration: underline;
      }
    `}</style>
  );
}
