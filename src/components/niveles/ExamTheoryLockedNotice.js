'use client';

import Link from 'next/link';

/**
 * Pantalla cuando un estudiante intenta acceder a una parte o tema bloqueado.
 */
export default function ExamTheoryLockedNotice({
  requiredPartName,
  partNumber,
  variant = 'unit',
  backHref = '/niveles?tab=theory',
  backLabel = 'Back to Exam theory',
}) {
  const isTopic = variant === 'topic';

  return (
    <main className="shell exam-theory-locked-page">
      <div className="exam-theory-locked-card">
        <span className="exam-theory-locked-badge" aria-hidden>
          🔒
        </span>
        <h1>Blocked</h1>
        <p>
          {isTopic ? (
            <>
              This topic is locked. Complete{' '}
              <strong>{requiredPartName || 'the previous topic'}</strong> (100%) to unlock it.
            </>
          ) : partNumber ? (
            <>
              Part {partNumber} is locked. Complete{' '}
              <strong>{requiredPartName || 'the previous part'}</strong> (100%) to unlock it.
            </>
          ) : (
            <>
              Complete <strong>{requiredPartName || 'the previous part'}</strong> (100%) to
              continue.
            </>
          )}
        </p>
        <Link href={backHref} className="exam-theory-locked-link">
          {backLabel}
        </Link>
      </div>
      <style jsx>{`
        .exam-theory-locked-page {
          min-height: 70vh;
          display: grid;
          place-items: center;
          padding: 2rem 1rem;
        }
        .exam-theory-locked-card {
          max-width: 420px;
          text-align: center;
          padding: 2rem 1.5rem;
          border-radius: 20px;
          background: var(--card, #fff);
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        }
        .exam-theory-locked-badge {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.75rem;
        }
        h1 {
          margin: 0 0 0.75rem;
          font-size: 1.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #334155;
        }
        p {
          margin: 0 0 1.25rem;
          color: #64748b;
          line-height: 1.55;
        }
        .exam-theory-locked-link {
          display: inline-block;
          padding: 0.65rem 1.25rem;
          border-radius: 12px;
          background: #1cb0f6;
          color: #fff;
          font-weight: 600;
          text-decoration: none;
        }
        .exam-theory-locked-link:hover {
          background: #0ea5e9;
        }
      `}</style>
    </main>
  );
}
