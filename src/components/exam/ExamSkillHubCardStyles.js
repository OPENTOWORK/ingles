export default function ExamSkillHubCardStyles() {
  return (
    <style jsx global>{`
      @media (max-width: 639px) {
        .exam-skill-hub .exam-practice-hub__exam-mode {
          display: none;
        }
      }
      .exam-skill-hub .exam-practice-hub__skills-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      @media (min-width: 640px) {
        .exam-skill-hub .exam-practice-hub__skills-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .exam-skill-hub .exam-practice-hub__skills-grid .exam-practice-hub__card {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: 1fr 2.5rem 8.4rem 1fr;
        align-items: center;
        column-gap: 12px;
        justify-content: stretch;
      }
      .exam-skill-hub .exam-practice-hub__skills-grid .exam-practice-hub__icon-wrap {
        grid-column: 2;
        justify-self: center;
      }
      .exam-skill-hub .exam-practice-hub__skills-grid .exam-practice-hub__label {
        grid-column: 3;
        justify-self: start;
        flex: none;
        text-align: start;
      }
      .exam-skill-hub .exam-practice-hub__skills-grid .exam-practice-hub__card--reading .exam-practice-hub__label {
        flex: none;
        white-space: nowrap;
        text-align: start;
        line-height: 1.2;
      }
      .exam-skill-hub .exam-practice-hub__skills-grid .exam-practice-hub__card-foot:not(:has(.exam-practice-hub__badge)):not(:has(.exam-practice-hub__hint)) {
        display: none;
      }
      .exam-skill-hub .exam-practice-hub__exam-mode {
        display: flex;
        justify-content: center;
      }
      .exam-skill-hub .exam-practice-hub__exam-mode .exam-practice-hub__card {
        width: calc((100% - 12px) / 2);
        max-width: none;
        height: 132px;
        min-height: 132px;
        margin: 0 auto;
        padding: 16px 16px 14px;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: 1fr 2.5rem 8.4rem 1fr;
        align-items: center;
        column-gap: 12px;
        justify-content: stretch;
      }
      .exam-skill-hub .exam-practice-hub__exam-mode .exam-practice-hub__icon-wrap {
        grid-column: 2;
        justify-self: center;
      }
      .exam-skill-hub .exam-practice-hub__exam-mode .exam-practice-hub__label {
        grid-column: 3;
        justify-self: start;
        flex: none;
        text-align: start;
        line-height: 1.2;
      }
      .exam-skill-hub .exam-practice-hub__exam-mode-sub {
        display: block;
        margin-top: 2px;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0;
        line-height: 1.2;
        color: color-mix(in srgb, var(--exam-card-ink, #5b3cc4) 72%, #64748b);
      }
      .exam-skill-hub .exam-practice-hub__exam-mode .exam-practice-hub__card-foot:not(:has(.exam-practice-hub__badge)) {
        display: none;
      }
      .exam-skill-hub .exam-practice-hub__card--banner {
        width: 100%;
        min-height: 96px;
        padding: 18px 22px;
      }
      .exam-skill-hub .exam-practice-hub__banner-inner {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
      }
      .exam-skill-hub .exam-practice-hub__banner-copy {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        min-width: 0;
      }
      .exam-skill-hub .exam-practice-hub__card--banner .exam-practice-hub__label {
        font-size: clamp(1.05rem, 2vw, 1.2rem);
        padding-right: 0;
      }
      .exam-skill-hub .exam-practice-hub__card--banner .exam-practice-hub__hint {
        font-size: 0.88rem;
      }
      .exam-skill-hub .exam-practice-hub__arrow--banner {
        position: static;
        flex: 0 0 auto;
        width: 2.25rem;
        height: 2.25rem;
        font-size: 1.05rem;
      }
      .exam-skill-hub .exam-practice-hub__card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        min-height: 132px;
        padding: 16px 16px 14px;
        border-radius: 18px;
        border: 1px solid #e8e4f7;
        background: #ffffff;
        text-decoration: none;
        color: inherit;
        box-shadow: 0 10px 28px rgba(76, 56, 170, 0.07);
        overflow: hidden;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          border-color 0.2s ease;
      }
      .exam-skill-hub .exam-practice-hub__card::before {
        content: none;
      }
      .exam-skill-hub .exam-practice-hub__card:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--exam-card-accent, #6a4be8) 32%, #e8e4f7);
        box-shadow: 0 14px 32px rgba(76, 56, 170, 0.12);
      }
      .exam-skill-hub .exam-practice-hub__card--reading,
      .exam-skill-hub .exam-practice-hub__card--reading-writing {
        --exam-card-accent: #38bdf8;
        --exam-card-ink: #1e628c;
      }
      .exam-skill-hub .exam-practice-hub__card--writing {
        --exam-card-accent: #1b9a62;
        --exam-card-ink: #1a6b48;
      }
      .exam-skill-hub .exam-practice-hub__card--listening {
        --exam-card-accent: #d97706;
        --exam-card-ink: #a15c12;
      }
      .exam-skill-hub .exam-practice-hub__card--speaking {
        --exam-card-accent: #db2777;
        --exam-card-ink: #b4256c;
      }
      .exam-skill-hub .exam-practice-hub__card--exam-mode {
        --exam-card-accent: #6a4be8;
        --exam-card-ink: #5b3cc4;
      }
      .exam-skill-hub .exam-practice-hub__card--quiz-game {
        --exam-card-accent: #c026d3;
        --exam-card-ink: #a21caf;
      }
      .exam-skill-hub .exam-practice-hub__card--featured {
        box-shadow: 0 10px 28px rgba(76, 56, 170, 0.07);
      }
      .exam-skill-hub .exam-practice-hub__card--featured:hover {
        box-shadow: 0 14px 32px rgba(76, 56, 170, 0.12);
      }
      .exam-skill-hub .exam-practice-hub__card--disabled {
        cursor: not-allowed;
        opacity: 0.72;
        filter: grayscale(0.15);
        pointer-events: none;
        background: #f1f5f9;
      }
      .exam-skill-hub .exam-practice-hub__icon-wrap {
        display: inline-grid;
        place-items: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: color-mix(in srgb, var(--exam-card-accent, #6a4be8) 16%, white);
        border: 0;
        color: var(--exam-card-ink, #6a4be8);
      }
      .exam-skill-hub .exam-practice-hub__icon-wrap svg {
        stroke-width: 2.35;
      }
      .exam-skill-hub .exam-practice-hub__icon-wrap .exam-skill-icon {
        --skill-accent: var(--exam-card-ink, #6a4be8);
        color: var(--exam-card-ink, #6a4be8);
        background: transparent;
        border: none;
      }
      .exam-skill-hub .exam-practice-hub__card--featured .exam-practice-hub__icon-wrap {
        width: 2.65rem;
        height: 2.65rem;
      }
      .exam-skill-hub .exam-practice-hub__label {
        flex: 1;
        font-size: 0.92rem;
        font-weight: 700;
        letter-spacing: -0.015em;
        color: var(--exam-card-ink, #1d1857);
        line-height: 1.3;
        padding-right: 0;
      }
      .exam-skill-hub .exam-practice-hub__card-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        margin-top: auto;
        min-height: 1.55rem;
      }
      .exam-skill-hub .exam-practice-hub__card-foot .exam-practice-hub__hint {
        flex: 1;
        min-width: 0;
      }
      .exam-skill-hub .exam-practice-hub__card-foot .exam-practice-hub__arrow {
        position: static;
        flex: 0 0 auto;
      }
      .exam-skill-hub .exam-practice-hub__card--featured .exam-practice-hub__label {
        font-size: 1.02rem;
      }
      .exam-skill-hub .exam-practice-hub__hint {
        font-size: 0.8rem;
        font-weight: 600;
        color: #514e6c;
        line-height: 1.35;
      }
      .exam-skill-hub .exam-practice-hub__badge {
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748b;
      }
      .exam-skill-hub .exam-practice-hub__arrow {
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
      .exam-skill-hub .exam-practice-hub__card:hover .exam-practice-hub__arrow {
        transform: translateX(1px);
        background: color-mix(in srgb, var(--exam-card-accent, #2563eb) 16%, white);
      }
    `}</style>
  );
}
