'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLevelPartNavLinks } from '@/data/levelExamPartMap';
import { useUserRole } from '@/context/UserRoleContext';
import { buildTeoriaExamPartTipsHref } from '@/lib/examPartTipsHref';
import { examTheoryBackHrefFromPartTipsPath } from '@/lib/nivelesPartTipsRoutes';

export default function ExamPartTipsView({
  levelSlug,
  skillFolder,
  partParam,
  info,
  pathname,
  exercisesConfig,
  getExercise,
}) {
  const router = useRouter();
  const { userRole } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';

  const partNum = parseInt(String(partParam).replace(/^part-/, ''), 10);
  const sectionBackHref = examTheoryBackHrefFromPartTipsPath(pathname);
  const nav = getLevelPartNavLinks(levelSlug, skillFolder, partNum);
  const prevHref = nav.showPrev
    ? buildTeoriaExamPartTipsHref(levelSlug, skillFolder, partNum - 1)
    : null;
  const nextHref = nav.showNext
    ? buildTeoriaExamPartTipsHref(levelSlug, skillFolder, partNum + 1)
    : null;

  const numExercises = exercisesConfig?.[`part-${partNum}`] || 12;
  const [selected, setSelected] = useState(0);
  const exercise = getExercise?.(partNum, selected + 1);

  return (
    <main className="shell exam-part-tips-page">
      <nav className="exam-part-tips-breadcrumb" aria-label="Breadcrumb">
        <Link href="/niveles?tab=theory">Exam theory</Link>
        <span aria-hidden>›</span>
        <Link href={sectionBackHref}>{sectionLabel(skillFolder)}</Link>
        <span aria-hidden>›</span>
        <span>{info.title || `Part ${partNum}`}</span>
      </nav>

      <h1 className="exam-part-tips-title">{info.title || `Part ${partNum}`}</h1>

      {info.description ? (
        <section className="exam-part-tips-hero">
          <h2 className="exam-part-tips-hero__heading">📋 What is this part?</h2>
          <p className="exam-part-tips-hero__desc">{info.description}</p>

          {info.tips ? (
            <div className="exam-part-tips-hero__block">
              <h3>💡 Tips for Success</h3>
              <p>{info.tips}</p>
            </div>
          ) : null}

          {info.commonErrors ? (
            <div className="exam-part-tips-hero__block">
              <h3>⚠️ Common Mistakes to Avoid</h3>
              <p>{info.commonErrors}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {!isStudent && getExercise && exercise ? (
        <>
          <p className="exam-part-tips-exercises-intro">
            Practice exercises for this part below.
          </p>
          <div className="exam-part-tips-exercise-tabs">
            {[...Array(numExercises)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`exam-part-tips-exercise-tab${
                  selected === i ? ' exam-part-tips-exercise-tab--active' : ''
                }`}
              >
                Ejercicio {i + 1}
              </button>
            ))}
          </div>
          <div className="exam-part-tips-exercise-card">
            <h2>{exercise.title}</h2>
            <p>
              <strong>Question:</strong> {exercise.question}
            </p>
            <p>
              <strong>Answer:</strong> {exercise.answer}
            </p>
          </div>
        </>
      ) : null}

      <footer className="exam-part-tips-nav">
        {prevHref ? (
          <button type="button" className="exam-part-tips-nav__btn" onClick={() => router.push(prevHref)}>
            ← Previous part
          </button>
        ) : (
          <span />
        )}

        <Link href={sectionBackHref} className="exam-part-tips-nav__home">
          ← Back to {sectionLabel(skillFolder)}
        </Link>

        {nextHref ? (
          <button type="button" className="exam-part-tips-nav__btn" onClick={() => router.push(nextHref)}>
            Next part →
          </button>
        ) : (
          <span />
        )}
      </footer>

      <style jsx global>{`
        .exam-part-tips-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 2rem 2.5rem;
        }
        .exam-part-tips-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem 0.55rem;
          margin-bottom: 1rem;
          font-size: 0.88rem;
          color: #64748b;
        }
        .exam-part-tips-breadcrumb :global(a) {
          color: #4338ca;
          font-weight: 600;
          text-decoration: none;
        }
        .exam-part-tips-breadcrumb :global(a:hover) {
          text-decoration: underline;
        }
        .exam-part-tips-title {
          margin: 0 0 1.25rem;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
        }
        .exam-part-tips-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          padding: 1.75rem;
          border-radius: 14px;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
        }
        .exam-part-tips-hero__heading {
          margin: 0 0 0.85rem;
          font-size: 1.35rem;
        }
        .exam-part-tips-hero__desc {
          margin: 0 0 1rem;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        .exam-part-tips-hero__block {
          background: rgba(255, 255, 255, 0.15);
          padding: 1.1rem 1.25rem;
          border-radius: 10px;
          margin-top: 0.85rem;
        }
        .exam-part-tips-hero__block h3 {
          margin: 0 0 0.55rem;
          font-size: 1.05rem;
        }
        .exam-part-tips-hero__block p {
          margin: 0;
          line-height: 1.55;
        }
        .exam-part-tips-exercises-intro {
          margin: 0 0 1rem;
          color: #555;
        }
        .exam-part-tips-exercise-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .exam-part-tips-exercise-tab {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          background: #c6f6d5;
          font-weight: 700;
          cursor: pointer;
        }
        .exam-part-tips-exercise-tab--active {
          background: #38a169;
          color: #fff;
        }
        .exam-part-tips-exercise-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
          margin-bottom: 1.5rem;
        }
        .exam-part-tips-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        .exam-part-tips-nav__btn {
          padding: 0.75rem 1.35rem;
          background: #e2e8f0;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }
        .exam-part-tips-nav__home {
          padding: 0.75rem 1.35rem;
          background: #c6f6d5;
          border-radius: 8px;
          font-weight: 700;
          color: #14532d;
          text-decoration: none;
        }
        .exam-part-tips-nav__home:hover {
          background: #9ae6b4;
        }
        body.reading-night-mode .exam-part-tips-page {
          background-color: #0f172a;
          color: #e2e8f0;
        }
        body.reading-night-mode .exam-part-tips-breadcrumb {
          color: #94a3b8;
        }
        body.reading-night-mode .exam-part-tips-exercises-intro {
          color: #94a3b8;
        }
        body.reading-night-mode .exam-part-tips-exercise-card {
          background: #1e293b;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
        }
        body.reading-night-mode .exam-part-tips-nav__btn {
          background: #334155;
          color: #e2e8f0;
        }
        body.reading-night-mode .exam-part-tips-nav__home {
          background: #14532d;
          color: #dcfce7;
        }
        body.reading-night-mode .exam-part-tips-nav__home:hover {
          background: #166534;
        }
      `}</style>
    </main>
  );
}

function sectionLabel(skillFolder) {
  if (skillFolder === 'reading-and-use-of-english') return 'Reading & Use of English';
  if (skillFolder === 'writing') return 'Writing';
  if (skillFolder === 'listening') return 'Listening';
  if (skillFolder === 'speaking') return 'Speaking';
  return 'Exam theory';
}
