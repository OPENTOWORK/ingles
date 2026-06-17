'use client';

import PageHero from '@/components/PageHero';
import StarsWayToB2Section from '@/components/niveles/StarsWayToB2Section';import { useUserRole } from '@/context/UserRoleContext';
import { isNivelesLevelComingSoonForUser } from '@/constants/studentFeatureAccess';
import NivelesComingSoonNotice from '@/components/niveles/NivelesComingSoonNotice';

export default function StarsWayToB2Page({ config }) {
  const { userRole: roleName } = useUserRole();

  if (isNivelesLevelComingSoonForUser(roleName, config.cefr)) {
    return <NivelesComingSoonNotice level={config.cefr} />;
  }

  const pageClass = `niveles-level-page niveles-level-page--${config.slug}`;

  return (
    <main className={`shell ${pageClass}`}>
      <div data-tour="level-hub-hero">
        <PageHero
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          showMascot
          mascotVariant={config.mascotVariant}
          mascotWidth={146}
          accent={config.accent}
          stats={[{ value: '17', label: 'Exam parts' }]}
        />
      </div>

      <StarsWayToB2Section />

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
    `}</style>
  );
}
