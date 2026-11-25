'use client';

import Link from 'next/link';
import { ExamLevelSwitch } from '@/components/niveles/ExamPracticeHubSection';
import { landingFont } from '@/components/home/landing/landingFont';

export default function NivelesComingSoonNotice({ level, skillLabel = null, backHref = '/exam-practice/b2/' }) {
  const message = skillLabel
    ? `${skillLabel} practice for level ${level} is not available yet. Reading, Writing and Exam mode are open on B2.`
    : `Level ${level} is not available yet. B2 is open for student practice — check back later for more levels.`;

  return (
    <main className={`shell niveles-coming-soon-page ${landingFont.variable}`}>
      <div className="niveles-coming-soon-card">
        <p className="niveles-coming-soon-kicker">Practice</p>
        <h1>Coming soon</h1>
        <ExamLevelSwitch levelSlug={level} />
        <p>{message}</p>
        <Link href={backHref} className="niveles-coming-soon-link">
          {skillLabel ? 'Back to exams' : 'Back to levels'}
        </Link>
      </div>
      <style jsx global>{`
        .niveles-coming-soon-page {
          min-height: calc(100vh - var(--site-header-height, 4.5rem));
          display: grid;
          place-items: center;
          padding: 2.5rem 1.25rem;
          background: transparent;
          font-family: var(--font-landing), 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
        }
        .niveles-coming-soon-card {
          width: min(100%, 28rem);
          text-align: center;
          padding: 2rem 1.6rem 1.7rem;
          border-radius: 28px;
          background: #fff;
          border: 1px solid #e8e4f7;
          box-shadow: 0 18px 44px rgba(76, 56, 170, 0.08);
        }
        .niveles-coming-soon-card .niveles-coming-soon-kicker {
          display: inline-flex;
          margin: 0 0 0.85rem;
          padding: 0.28rem 0.7rem;
          border-radius: 999px;
          background: #f0ebff;
          color: #6a4be8;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }
        .niveles-coming-soon-card h1 {
          margin: 0 0 1.1rem;
          color: #1d1857;
          font-size: clamp(1.7rem, 3vw, 2.1rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }
        .niveles-coming-soon-card .exam-practice-hub__levels {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin: 0 0 1.15rem;
        }
        .niveles-coming-soon-card .exam-practice-hub__level {
          margin: 0;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          border: 1px solid #e8e4f7;
          background: #fff;
          color: #5b3cc4;
          font-size: 0.82rem;
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
        }
        .niveles-coming-soon-card .exam-practice-hub__level:hover {
          border-color: color-mix(in srgb, #6a4be8 32%, #e8e4f7);
          background: #f0ebff;
          text-decoration: none;
        }
        .niveles-coming-soon-card .exam-practice-hub__level.is-active {
          background: #6a4be8;
          border-color: #6a4be8;
          color: #fff;
        }
        .niveles-coming-soon-card > p:not(.niveles-coming-soon-kicker) {
          margin: 0 0 1.35rem;
          color: #514e6c;
          font-size: 0.98rem;
          line-height: 1.55;
        }
        .niveles-coming-soon-card .niveles-coming-soon-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2.6rem;
          padding: 0.55rem 1.25rem;
          border-radius: 999px;
          background: #6a4be8;
          color: #fff;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(106, 75, 232, 0.28);
        }
        .niveles-coming-soon-card .niveles-coming-soon-link:hover {
          background: #5b3cc4;
          color: #fff;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
