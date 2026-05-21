'use client';

import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import PageHero from '@/components/PageHero';

/**
 * Hub de nivel: PageHero + secciones de tips + enlaces Exam Practice (sin selector de tests).
 */
export default function LevelHubPage({ config }) {
  const { userRole: roleName } = useUserRole();
  const isAdmin = roleName === 'admin' || roleName === 'administrador';
  const isStudent = !isAdmin;

  const topicCount = Object.values(config.sections).reduce(
    (n, topics) => n + topics.length,
    0,
  );

  const pageClass = `niveles-level-page niveles-level-page--${config.slug}`;

  return (
    <main className={`shell ${pageClass}`}>
      <PageHero
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/niveles">Levels</Link>
            <span aria-hidden="true">/</span>
            <span>{config.cefr}</span>
          </nav>
        }
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        showMascot
        mascotVariant={config.mascotVariant}
        mascotWidth={146}
        accent={config.accent}
        stats={[{ value: String(topicCount), label: 'Practice topics' }]}
      />

      <div className="sections">
        {Object.entries(config.sections).map(([title, topics]) => (
          <LevelSection
            key={title}
            title={title}
            topics={topics}
            isStudent={isStudent}
            levelEnabled={config.enabledForStudents !== false}
          />
        ))}
      </div>

      <section className="exam-section">
        <div className="section__head">
          <h2>Exam Practice</h2>
          <span className="count">{(config.examLinks || []).length}</span>
        </div>
        <div className="exam-grid">
          {(config.examLinks || []).map((exam) => {
            const blockedForStudent = isStudent && !exam.enabledForStudents;
            if (blockedForStudent) {
              return (
                <div
                  key={exam.href}
                  className="exam-card exam-card-disabled"
                  aria-disabled="true"
                >
                  <span>{exam.text}</span>
                  <small className="exam-card-badge">Coming soon</small>
                </div>
              );
            }
            return (
              <Link key={exam.href} href={exam.href} className="exam-card">
                {exam.text}
              </Link>
            );
          })}
        </div>
      </section>

      <LevelHubStyles />
    </main>
  );
}

function LevelSection({ title, topics, isStudent, levelEnabled }) {
  const showComingSoon = isStudent && !levelEnabled;

  return (
    <section className="section">
      <div className="section__head">
        <h2>{title}</h2>
        <span className="count">{topics.length}</span>
        <span className="section__subtitle">Description and interactive tips</span>
      </div>
      <ul className="grid">
        {topics.map((topic) =>
          showComingSoon ? (
            <li key={topic.href}>
              <div className="card card--disabled" aria-disabled="true">
                <div className="card__title">{topic.text}</div>
                <small className="card__badge">Coming soon</small>
              </div>
            </li>
          ) : (
            <li key={topic.href}>
              <Link href={topic.href} className="card">
                <div className="card__title">{topic.text}</div>
              </Link>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function LevelHubStyles() {
  return (
    <style jsx global>{`
      .niveles-level-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .niveles-level-page.shell {
        min-height: 100svh;
        max-width: 1100px;
        margin: 0 auto;
        padding: clamp(20px, 4vw, 32px) clamp(14px, 3vw, 20px);
      }
      .niveles-level-page .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #64748b;
      }
      .niveles-level-page .breadcrumb a {
        color: #0ea5e9;
        text-decoration: none;
        font-weight: 600;
      }
      .niveles-level-page .breadcrumb a:hover {
        text-decoration: underline;
      }
      .niveles-level-page .sections {
        display: flex;
        flex-direction: column;
        gap: 28px;
        margin-top: 1.5rem;
      }
      .niveles-level-page .section {
        padding: 6px;
      }
      .niveles-level-page .section__head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        flex-wrap: wrap;
      }
      .niveles-level-page .section__head h2 {
        margin: 0;
        font-size: 22px;
        color: var(--text);
      }
      .niveles-level-page .count {
        display: inline-grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        border: 1px solid #eaeaea;
        background: var(--card);
        font-size: 12px;
        color: #666;
      }
      .niveles-level-page .section__subtitle {
        font-size: 0.9rem;
        color: #666;
        font-style: italic;
        margin-left: 4px;
      }
      .niveles-level-page .grid {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      @media (min-width: 640px) {
        .niveles-level-page .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 980px) {
        .niveles-level-page .grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .niveles-level-page .card {
        display: block;
        height: 100%;
        border: 1px solid #eaeaea;
        border-radius: 18px;
        background: var(--card);
        padding: 18px;
        transition:
          transform 0.2s,
          box-shadow 0.2s,
          border-color 0.2s;
        text-decoration: none;
      }
      .niveles-level-page .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.1);
        border-color: #0070f3;
        background: #b0d6fa;
      }
      .niveles-level-page .card:focus {
        outline: none;
        box-shadow: 0 0 0 6px rgba(0, 112, 243, 0.35);
      }
      .niveles-level-page .card--disabled {
        cursor: not-allowed;
        filter: grayscale(0.15);
        opacity: 0.9;
        background: #f1f5f9;
        pointer-events: none;
      }
      .niveles-level-page .card__title {
        font-size: 16px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--text);
      }
      .niveles-level-page .card__badge {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #64748b;
      }
      .niveles-level-page .exam-section {
        margin-top: 2rem;
        padding: 6px;
      }
      .niveles-level-page .exam-grid {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }
      .niveles-level-page .exam-card {
        background: #d1fae5;
        color: #047857;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        font-weight: bold;
        text-decoration: none;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .niveles-level-page .exam-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .niveles-level-page .exam-card-disabled {
        background: #e5e7eb;
        color: #6b7280;
        cursor: not-allowed;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2rem;
        filter: grayscale(0.2);
      }
      .niveles-level-page .exam-card-badge {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
    `}</style>
  );
}
