export default function ExamSkillHubCardStyles() {
  return (
    <style jsx global>{`
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
      @media (min-width: 900px) {
        .exam-skill-hub .exam-practice-hub__skills-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
      .exam-skill-hub .exam-practice-hub__skills-grid .exam-practice-hub__card {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
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
      .exam-skill-hub .exam-practice-hub__card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--exam-card-accent, #38bdf8);
        opacity: 0.9;
      }
      .exam-skill-hub .exam-practice-hub__card:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--exam-card-accent, #2563eb) 35%, #e2e8f0);
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 12px 28px color-mix(in srgb, var(--exam-card-accent, #2563eb) 14%, transparent);
      }
      .exam-skill-hub .exam-practice-hub__card--exam-mode {
        --exam-card-accent: #4f46e5;
        background: linear-gradient(155deg, #f5f7ff 0%, #ffffff 100%);
        border-color: rgba(99, 102, 241, 0.22);
      }
      .exam-skill-hub .exam-practice-hub__card--reading,
      .exam-skill-hub .exam-practice-hub__card--reading-writing {
        --exam-card-accent: #38bdf8;
        background: linear-gradient(155deg, #f0f9ff 0%, #ffffff 100%);
        border-color: rgba(56, 189, 248, 0.22);
      }
      .exam-skill-hub .exam-practice-hub__card--writing {
        --exam-card-accent: #059669;
        background: linear-gradient(155deg, #f7fdf9 0%, #ffffff 100%);
        border-color: rgba(5, 150, 105, 0.18);
      }
      .exam-skill-hub .exam-practice-hub__card--listening {
        --exam-card-accent: #d97706;
        background: linear-gradient(155deg, #fffdf8 0%, #ffffff 100%);
        border-color: rgba(217, 119, 6, 0.18);
      }
      .exam-skill-hub .exam-practice-hub__card--speaking {
        --exam-card-accent: #db2777;
        background: linear-gradient(155deg, #fffbfd 0%, #ffffff 100%);
        border-color: rgba(219, 39, 119, 0.18);
      }
      .exam-skill-hub .exam-practice-hub__card--featured {
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 8px 22px rgba(79, 70, 229, 0.12);
      }
      .exam-skill-hub .exam-practice-hub__card--featured:hover {
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 14px 32px rgba(79, 70, 229, 0.18);
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
        border-radius: 10px;
        background: color-mix(in srgb, var(--exam-card-accent, #2563eb) 10%, white);
        border: 1px solid color-mix(in srgb, var(--exam-card-accent, #2563eb) 22%, #e2e8f0);
        color: var(--exam-card-accent, #2563eb);
      }
      .exam-skill-hub .exam-practice-hub__icon-wrap .exam-skill-icon {
        --skill-accent: var(--exam-card-accent, #2563eb);
        color: var(--exam-card-accent, #2563eb);
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
        color: #0f172a;
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
        color: color-mix(in srgb, var(--exam-card-accent, #475569) 55%, #64748b);
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
