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
import SiteMascot from '@/components/SiteMascot';
import TrainingCefrLevelCard from '@/components/training/TrainingCefrLevelCard';
import { useTrainingCefrStarProgressMap } from '@/hooks/useTrainingCefrStarProgress';
import { getMaxStarsForCefrLevel } from '@/utils/trainingStarsProgress';
import DeferredBelowFold from '@/components/DeferredBelowFold';
import DashboardSectionPlaceholder from '@/components/DashboardSectionPlaceholder';

const ProgressDashboard = dynamic(() => import('@/components/ProgressDashboard'), {
  ssr: false,
  loading: () => <DashboardSectionPlaceholder label="Cargando progreso…" />,
});

const AdaptiveLearningDashboard = dynamic(
  () => import('@/components/AdaptiveLearningDashboard'),
  {
    ssr: false,
    loading: () => <DashboardSectionPlaceholder label="Cargando recomendaciones…" />,
  },
);

const sortedLevels = [
  { level: 'B1', color: '#ff9900', emoji: '😄' },
  { level: 'C1', color: '#8e44ad', emoji: '😌' },
  { level: 'A2', color: '#58cc02', emoji: '☺️' },
  { level: 'B2', color: '#1cb0f6', emoji: '😊' },
  { level: 'C2', color: '#e74c3c', emoji: '😉' },
];

export default function TrainingHome() {
  const router = useRouter();
  const { userRole, session } = useUserRole();
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

    void (async () => {
      const health = await checkDatabaseHealthCached();
      if (!health?.healthy) {
        setShowDatabaseSetup(true);
      }
      await checkOnboardingStatus(session.user.id);
    })();
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
      /* offline o tabla ausente */
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

  const handleDatabaseSetupComplete = () => {
    setShowDatabaseSetup(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando...</p>;

  if (showDatabaseSetup) {
    return <DatabaseSetup onSetupComplete={handleDatabaseSetupComplete} />;
  }

  if (showOnboarding) {
    return <UserOnboarding userId={user?.id} onComplete={handleOnboardingComplete} />;
  }

  const isStudent = userRole === 'student' || userRole === 'alumno';

  return (
    <>
      <SkipLinks />
      <main
        id="main-content"
        style={{
          padding: '2rem',
          fontFamily: 'Segoe UI, sans-serif',
          textAlign: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f0f8ff, #e6f0ff)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem 2rem',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ lineHeight: 0, filter: 'drop-shadow(0 6px 14px rgba(28,176,246,.35))' }}>
            <SiteMascot variant={2} width={120} alt="" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🎯 Choose Your Practice Level</h1>
            <p style={{ color: '#444', margin: 0 }}>
              Start training your English with interactive exercises by level.
            </p>
          </div>
        </div>

        <div
          id="level-selection"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            maxWidth: '900px',
            margin: '0 auto 2.5rem',
          }}
        >
          {sortedLevels.map(({ level, color, emoji }) => {
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
                color={color}
                emoji={emoji}
                earned={progress.earned}
                max={progress.max}
                percent={progress.percent}
                locked={isStudent}
                href={`/training/${levelKey}`}
              />
            );
          })}
        </div>

        <DeferredBelowFold
          delayMs={800}
          fallback={
            <>
              <div style={{ marginBottom: '1.5rem', maxWidth: '1000px', margin: '0 auto 1.5rem' }}>
                <DashboardSectionPlaceholder label="Cargando progreso…" />
              </div>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <DashboardSectionPlaceholder label="Cargando recomendaciones…" />
              </div>
            </>
          }
        >
          <div
            id="progress-dashboard"
            style={{ marginBottom: '2rem', maxWidth: '1000px', margin: '0 auto 2rem' }}
          >
            <ProgressDashboard userId={user?.id} />
          </div>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AdaptiveLearningDashboard userId={user?.id} />
          </div>
        </DeferredBelowFold>
      </main>
    </>
  );
}
