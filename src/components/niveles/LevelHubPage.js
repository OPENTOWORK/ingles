'use client';

import PageHero from '@/components/PageHero';
import ExamPracticeHubSection from '@/components/niveles/ExamPracticeHubSection';
import StarsWayHubTabs from '@/components/niveles/StarsWayHubTabs';
import { useUserRole } from '@/context/UserRoleContext';
import { isNivelesLevelComingSoonForUser, usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { isAdminRole } from '@/utils/authRoles';
import NivelesComingSoonNotice from '@/components/niveles/NivelesComingSoonNotice';

/**
 * Hub de nivel: PageHero + Exam Practice (simulacros por paper).
 * Tips por parte → /niveles → Exam theory.
 */
export default function LevelHubPage({ config }) {
  const { userRole: roleName } = useUserRole();
  const isStudent = usesStudentContentRestrictions(roleName);
  const showStarsWayHub = isAdminRole(roleName);

  if (isNivelesLevelComingSoonForUser(roleName, config.cefr)) {
    return <NivelesComingSoonNotice level={config.cefr} />;
  }

  const pageClass = `niveles-level-page niveles-level-page--${config.slug}`;
  const isB2Hub = config.slug === 'b2';

  const hubBody = (
    <>
      <div data-tour="level-hub-hero">
        <PageHero
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          showMascot
          mascotVariant={config.mascotVariant}
          mascotWidth={146}
          accent={config.accent}
          stats={config.heroStats ?? (isB2Hub ? [] : [{ value: 'Exam or skills', label: '' }])}
        />
      </div>

      {isB2Hub ? (
        <ExamPracticeHubSection
          examLinks={config.examLinks}
          isStudent={isStudent}
          skillsQuadrant
          sectionTitle={config.practiceSectionTitle}
          quadrantFooter={showStarsWayHub ? <StarsWayHubTabs embedded /> : null}
        />
      ) : (
        <ExamPracticeHubSection examLinks={config.examLinks} isStudent={isStudent} />
      )}
    </>
  );

  return (
    <main className={`shell ${pageClass}`}>
      {isB2Hub ? <div className="levels-b2-page-content">{hubBody}</div> : hubBody}

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
      .niveles-level-page--b2.shell {
        max-width: none;
        width: 100%;
        padding: var(--levels-b2-page-padding-y) var(--levels-b2-page-padding-x);
        box-sizing: border-box;
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
      .niveles-level-page--b2 .page-hero__desc {
        max-width: 100%;
        text-wrap: balance;
      }
    `}</style>
  );
}
