'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import SkipLinks from '@/components/SkipLinks';
import DatabaseSetup from '@/components/DatabaseSetup';
import UserOnboarding from '@/components/UserOnboarding';
import { checkDatabaseHealthCached } from '@/utils/databaseHealthCache';
import { useUserRole } from '@/context/UserRoleContext';
import TrainingCefrLevelCard from '@/components/training/TrainingCefrLevelCard';
import { useTrainingCefrStarProgressMap } from '@/hooks/useTrainingCefrStarProgress';
import { getMaxStarsForCefrLevel } from '@/utils/trainingStarsProgress';
import { NIVELES_CEFR_ORDER } from '@/lib/placementLevelAccess';
import { CEFR_LEVEL_COLORS } from '@/constants/cefrLevelColors';
import DeferredBelowFold from '@/components/DeferredBelowFold';
import DashboardSectionPlaceholder from '@/components/DashboardSectionPlaceholder';
import ui from '@/components/training/training-ui.module.css';

const sortedLevels = NIVELES_CEFR_ORDER.map((level) => ({
  level,
  accent: CEFR_LEVEL_COLORS[level],
}));

const TrainingDashboardStack = dynamic(
  () =>
    import('@/components/training/TrainingDashboardStack').then(
      (mod) => mod.TrainingDashboardStack,
    ),
  {
    ssr: false,
    loading: () => (
      <div className={ui.dashboardStack}>
        <DashboardSectionPlaceholder label="Loading progress…" />
        <DashboardSectionPlaceholder label="Loading recommendations…" />
      </div>
    ),
  },
);

export default function TrainingHome() {
  const router = useRouter();
  const { session } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const starProgressMap = useTrainingCefrStarProgressMap();
  const defaultMaxStars = getMaxStarsForCefrLevel();

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    setUser(session.user);
    setLoading(false);

    const runBackgroundChecks = () => {
      void (async () => {
        const health = await checkDatabaseHealthCached();
        if (!health?.healthy) {
          setShowDatabaseSetup(true);
        }
        await checkOnboardingStatus(session.user.id);
      })();
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(runBackgroundChecks, { timeout: 2500 });
    } else {
      window.setTimeout(runBackgroundChecks, 200);
    }
  }, [router, session]);

  const checkOnboardingStatus = async (userId) => {
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (data?.id) return;
    } catch {
      /* offline or missing table */
    }

    try {
      const localData = localStorage.getItem('user_preferences');
      if (localData) {
        const preferences = JSON.parse(localData);
        if (preferences.onboarding_completed && preferences.user_id === userId) {
          return;
        }
      }
    } catch {
      /* ignore */
    }

    setShowOnboarding(true);
  };

  if (loading) {
    return <p className={ui.subtitle} style={{ textAlign: 'center', padding: '3rem' }}>Loading…</p>;
  }

  if (showDatabaseSetup) {
    return <DatabaseSetup onSetupComplete={() => setShowDatabaseSetup(false)} />;
  }

  if (showOnboarding) {
    return <UserOnboarding userId={user?.id} onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <>
      <SkipLinks />
      <main id="main-content" className={ui.page}>
        <header className={ui.headerRow}>
          <div className={ui.headerText}>
            <p className={ui.eyebrow}>Training</p>
            <h1 className={ui.title}>Choose your practice level</h1>
            <p className={ui.subtitle}>
              Structured exercises aligned with CEFR levels. Track progress with stars as you complete each path.
            </p>
          </div>
        </header>

        <div id="level-selection" className={ui.levelGrid}>
          {sortedLevels.map(({ level, accent }) => {
            const levelKey = level.toLowerCase();
            const progress = starProgressMap[levelKey] ?? {
              earned: 0,
              max: defaultMaxStars,
              percent: 0,
            };

            return (
              <TrainingCefrLevelCard
                key={level}
                level={level}
                accent={accent}
                earned={progress.earned}
                max={progress.max}
                percent={progress.percent}
                href={`/training/${levelKey}`}
              />
            );
          })}
        </div>

        <DeferredBelowFold
          delayMs={1200}
          fallback={
            <div className={ui.dashboardStack}>
              <DashboardSectionPlaceholder label="Loading progress…" />
              <DashboardSectionPlaceholder label="Loading recommendations…" />
            </div>
          }
        >
          <div id="progress-dashboard" className={ui.dashboardStack}>
            <TrainingDashboardStack userId={user?.id} />
          </div>
        </DeferredBelowFold>
      </main>
    </>
  );
}
