'use client';

/** Marco común de Tests, Placement Test y Quick Test. */
export default function TestsBranchStyles() {
  return (
    <style jsx global>{`
      .tests-branch.shell {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100svh;
        width: 100%;
        max-width: none;
        margin: 0 auto;
        padding: var(--levels-b2-page-padding-y) var(--levels-b2-page-padding-x);
        box-sizing: border-box;
      }
      .tests-branch .tests-panel {
        background: #fff;
        color: #1d1857;
        border: 1px solid rgba(106, 75, 232, 0.16);
        border-radius: 16px;
        padding: 1.25rem 1.35rem;
        box-shadow: 0 10px 28px rgba(76, 56, 170, 0.08);
      }
      body.reading-night-mode .tests-branch .tests-panel {
        background: var(--card);
        color: var(--text);
        border-color: rgba(255, 255, 255, 0.08);
      }
      .tests-branch .tests-panel + .tests-panel {
        margin-top: 1rem;
      }
      .tests-choices {
        display: grid;
        gap: 1.25rem;
        grid-template-columns: 1fr;
      }
      @media (min-width: 800px) {
        .tests-choices {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .tests-choice,
      .tests-choice:hover,
      .tests-choice:focus,
      .tests-choice:hover span {
        text-decoration: none;
      }
      .tests-choice {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-height: 240px;
        margin-right: 0;
        padding: 1.75rem 1.6rem 1.5rem;
        border-radius: 22px;
        box-sizing: border-box;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }
      .tests-choice:hover {
        transform: translateY(-3px);
      }
      .tests-choice--solid {
        background: linear-gradient(145deg, #6a4be8 0%, #5634d6 100%);
        color: #fff;
        border: 2px solid #5634d6;
        box-shadow: 0 16px 36px rgba(86, 52, 214, 0.28);
      }
      .tests-choice--light {
        background: #fff;
        color: #3b1d9a;
        border: 2px solid #6a4be8;
        box-shadow: 0 12px 28px rgba(106, 75, 232, 0.12);
      }
      .tests-choice__kicker {
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .tests-choice--solid .tests-choice__kicker {
        color: rgba(255, 255, 255, 0.82);
      }
      .tests-choice--light .tests-choice__kicker {
        color: #6a4be8;
      }
      .tests-choice__title {
        margin-top: 0.55rem;
        font-size: clamp(1.7rem, 2.4vw, 2.15rem);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }
      .tests-choice__text {
        margin-top: 0.75rem;
        max-width: 28rem;
        font-size: 1.05rem;
        line-height: 1.45;
      }
      .tests-choice--solid .tests-choice__text {
        color: rgba(255, 255, 255, 0.92);
      }
      .tests-choice--light .tests-choice__text {
        color: #4c1d95;
      }
      .tests-choice__go {
        margin-top: auto;
        padding-top: 1.4rem;
        font-size: 0.95rem;
        font-weight: 800;
      }
      .tests-choice--light .tests-choice__go {
        color: #6a4be8;
      }
      .tests-branch .opt {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.7rem 0.85rem;
        border: 1px solid rgba(106, 75, 232, 0.18);
        border-radius: 12px;
        background: #f8f5ff;
        cursor: pointer;
      }
      .tests-branch .opt:hover,
      .tests-branch .opt.selected {
        border-color: #6a4be8;
        background: #efe9ff;
      }
      body.reading-night-mode .tests-branch .opt {
        background: transparent;
        color: var(--text);
      }
      .tests-branch .tests-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.1rem;
      }
      .tests-branch .tests-kicker {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #6a4be8;
      }
      .tests-intro {
        max-width: 720px;
        padding: 1.75rem 1.7rem 1.6rem;
        border-radius: 22px;
        border: 2px solid #6a4be8;
        background: #fff;
        color: #3b1d9a;
        box-shadow: 0 12px 28px rgba(106, 75, 232, 0.12);
      }
      .tests-intro__title {
        margin: 0.45rem 0 0;
        font-size: clamp(1.55rem, 2.2vw, 2rem);
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: #3b1d9a;
      }
      .tests-intro__lead {
        margin: 0.85rem 0 0;
        max-width: 38rem;
        font-size: 1.02rem;
        line-height: 1.55;
        color: #4c1d95;
      }
      .tests-intro__stats {
        display: flex;
        gap: 0.75rem;
        margin: 1.25rem 0 0;
        padding: 0;
        list-style: none;
      }
      .tests-intro__stats li {
        display: flex;
        flex-direction: column;
        min-width: 7.5rem;
        padding: 0.75rem 0.9rem;
        border-radius: 14px;
        background: #f4f0ff;
      }
      .tests-intro__stats strong {
        font-size: 1.35rem;
        line-height: 1;
        color: #5634d6;
      }
      .tests-intro__stats span {
        margin-top: 0.3rem;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #6a4be8;
      }
      .tests-intro__error {
        margin: 1rem 0 0;
        color: #7c3aed;
        font-weight: 700;
      }
      .tests-start {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 1.35rem;
        padding: 0.85rem 1.35rem;
        border: 0;
        border-radius: 999px;
        background: #6a4be8;
        color: #fff;
        font: inherit;
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
        text-decoration: none;
      }
      .tests-start:hover,
      .tests-start:focus {
        background: #5634d6;
        color: #fff;
        text-decoration: none;
      }
      .tests-start:disabled {
        opacity: 0.65;
        cursor: progress;
      }
    `}</style>
  );
}
