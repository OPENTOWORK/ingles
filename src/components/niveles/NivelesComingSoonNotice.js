'use client';

import Link from 'next/link';

export default function NivelesComingSoonNotice({ level, skillLabel = null, backHref = '/niveles' }) {
  const message = skillLabel
    ? `${skillLabel} practice for level ${level} is not available yet. Reading, Writing and Exam mode are open on B2.`
    : `Level ${level} is not available yet. B2 is open for student practice — check back later for more levels.`;

  return (
    <main className="shell niveles-coming-soon-page">
      <div className="niveles-coming-soon-card">
        <span className="niveles-coming-soon-badge" aria-hidden>
          🕐
        </span>
        <h1>COMING SOON</h1>
        <p>{message}</p>
        <Link href={backHref} className="niveles-coming-soon-link">
          {skillLabel ? 'Back to exams' : 'Back to levels'}
        </Link>
      </div>
      <style jsx>{`
        .niveles-coming-soon-page {
          min-height: 70vh;
          display: grid;
          place-items: center;
          padding: 2rem 1rem;
        }
        .niveles-coming-soon-card {
          max-width: 440px;
          text-align: center;
          padding: 2rem 1.5rem;
          border-radius: 20px;
          background: var(--card, #fff);
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        }
        .niveles-coming-soon-badge {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.75rem;
        }
        h1 {
          margin: 0 0 0.75rem;
          font-size: 1.5rem;
          letter-spacing: 0.08em;
          color: #334155;
        }
        p {
          margin: 0 0 1.25rem;
          color: #64748b;
          line-height: 1.55;
        }
        .niveles-coming-soon-link {
          display: inline-block;
          padding: 0.65rem 1.25rem;
          border-radius: 12px;
          background: #1cb0f6;
          color: #fff;
          font-weight: 600;
          text-decoration: none;
        }
        .niveles-coming-soon-link:hover {
          background: #0ea5e9;
        }
      `}</style>
    </main>
  );
}
