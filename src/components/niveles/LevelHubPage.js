'use client';

import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { isStaffRole } from '@/lib/placementLevelAccess';
import { isNivelesLevelComingSoonForUser, isStudentRole } from '@/constants/studentFeatureAccess';
import NivelesComingSoonNotice from '@/components/niveles/NivelesComingSoonNotice';
import PageHero from '@/components/PageHero';
import ExamPracticeHubSection from '@/components/niveles/ExamPracticeHubSection';

/**
 * Hub de nivel: PageHero + Exam Practice (simulacros por paper).
 * Tips por parte → /niveles → Exam theory.
 */
export default function LevelHubPage({ config }) {
  const { userRole: roleName } = useUserRole();
  const isStudent = isStudentRole(roleName) && !isStaffRole(roleName);

  if (isNivelesLevelComingSoonForUser(roleName, config.cefr)) {
    return <NivelesComingSoonNotice level={config.cefr} />;
  }

  const paperCount = config.examLinks?.length ?? 0;

  const pageClass = `niveles-level-page niveles-level-page--${config.slug}`;

  return (
    <main className={`shell ${pageClass}`}>
      <div data-tour="level-hub-hero">
        <PageHero
          breadcrumb={
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/niveles/b2">Levels</Link>
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
          stats={[{ value: String(paperCount), label: 'Practice papers' }]}
        />
      </div>

      <ExamPracticeHubSection examLinks={config.examLinks} isStudent={isStudent} />

      <LevelHubStyles />
    </main>
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
      .niveles-level-page .niveles-section-head {
        margin-bottom: 18px;
        padding: 18px 20px 16px;
        border-radius: 16px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid rgba(226, 232, 240, 0.95);
        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
      }
      .niveles-level-page .niveles-section-head__row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }
      .niveles-level-page .niveles-section-head__title-wrap {
        min-width: 0;
      }
      .niveles-level-page .niveles-section-head__eyebrow {
        display: block;
        margin-bottom: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #2563eb;
      }
      .niveles-level-page .niveles-section-head__title {
        margin: 0;
        font-size: clamp(1.35rem, 2.8vw, 1.65rem);
        font-weight: 800;
        letter-spacing: -0.025em;
        line-height: 1.15;
        color: var(--text);
      }
      .niveles-level-page .niveles-section-head__count {
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
      .niveles-level-page .niveles-section-head__desc {
        margin: 12px 0 0;
        max-width: 680px;
        font-size: 0.96rem;
        line-height: 1.55;
        color: #5a6b7d;
      }
    `}</style>
  );
}
