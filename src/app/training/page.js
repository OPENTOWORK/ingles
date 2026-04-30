'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import ProgressDashboard from '@/components/ProgressDashboard';
import AdaptiveLearningDashboard from '@/components/AdaptiveLearningDashboard';
import { AccessibilityPanel } from '@/components/AccessibilityProvider';
import SkipLinks from '@/components/SkipLinks';
import DatabaseSetup from '@/components/DatabaseSetup';
import UserOnboarding from '@/components/UserOnboarding';
import { checkDatabaseHealth } from '@/utils/databaseInitializer';
import { getRoleNameByUserId, normalizeRoleName } from '@/utils/authRoles';

const sortedLevels = [
  { level: "A1", color: "#7bed9f", emoji: "😁" },
  { level: "B1", color: "#ff9900", emoji: "😄" },
  { level: "C1", color: "#8e44ad", emoji: "😌" },
  { level: "A2", color: "#58cc02", emoji: "☺️" },
  { level: "B2", color: "#1cb0f6", emoji: "😊" },
  { level: "C2", color: "#e74c3c", emoji: "😉" },
];

export default function TrainingHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
      } else {
        setUser(data.session.user);
        const roleName = await getRoleNameByUserId(data.session.user.id, data.session.user.email);
        setUserRole(normalizeRoleName(roleName));
        
        // Check database health
        const health = await checkDatabaseHealth();
        setDatabaseReady(health.healthy);
        setShowDatabaseSetup(!health.healthy);
        
        // Check if user has completed onboarding
        await checkOnboardingStatus(data.session.user.id);
        
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const checkOnboardingStatus = async (userId) => {
    try {
      // Try database first
      const { data } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (data && data.id) {
        setOnboardingCompleted(true);
        return;
      }
    } catch (error) {
      console.warn('Database check failed, trying localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const localData = localStorage.getItem('user_preferences');
      if (localData) {
        const preferences = JSON.parse(localData);
        if (preferences.onboarding_completed && preferences.user_id === userId) {
          setOnboardingCompleted(true);
          return;
        }
      }
    } catch (error) {
      console.warn('localStorage check failed:', error);
    }

    // If neither database nor localStorage has onboarding data, show onboarding
    setShowOnboarding(true);
  };

  const handleDatabaseSetupComplete = (success) => {
    setShowDatabaseSetup(false);
    if (success) {
      setDatabaseReady(true);
    }
  };

  const handleOnboardingComplete = (userData) => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
    console.log('Onboarding completed with data:', userData);
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando...</p>;

  // Show database setup if needed
  if (showDatabaseSetup) {
    return <DatabaseSetup onSetupComplete={handleDatabaseSetupComplete} />;
  }

  // Show onboarding if needed
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
          padding: "2rem",
          fontFamily: "Segoe UI, sans-serif",
          textAlign: "center",
          minHeight: "100vh",
          background: "linear-gradient(to right, #f0f8ff, #e6f0ff)",
        }}
      >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎯 Choose Your Practice Level</h1>
      <p style={{ color: "#444", marginBottom: "2rem" }}>
        Start training your English with interactive exercises by level.
      </p>

      {/* Progress Dashboard */}
      <div id="progress-dashboard" style={{ marginBottom: "3rem", maxWidth: "1000px", margin: "0 auto 3rem auto" }}>
        <ProgressDashboard userId={user?.id} />
      </div>

      {/* Adaptive Learning Dashboard */}
      <div style={{ marginBottom: "3rem", maxWidth: "1200px", margin: "0 auto 3rem auto" }}>
        <AdaptiveLearningDashboard userId={user?.id} />
      </div>

      <div
        id="level-selection"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {sortedLevels.map(({ level, color, emoji }) => {
          const isLockedForStudent = isStudent;
          const baseCardStyle = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
            borderRadius: "12px",
            backgroundColor: color,
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease",
            minHeight: "150px",
          };

          return (
            <div key={level} style={{ position: "relative" }}>
              {isLockedForStudent ? (
                <div
                  aria-disabled="true"
                  style={{
                    ...baseCardStyle,
                    cursor: "not-allowed",
                    filter: "grayscale(0.15)",
                  }}
                >
                  <div style={{ fontSize: "2.5rem" }}>{emoji}</div>
                  <div style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>Level {level}</div>
                </div>
              ) : (
                <Link
                  href={`/training/${level.toLowerCase()}`}
                  style={baseCardStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div style={{ fontSize: "2.5rem" }}>{emoji}</div>
                  <div style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>Level {level}</div>
                </Link>
              )}

              {isLockedForStudent && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "12px",
                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    pointerEvents: "none",
                  }}
                >
                  Proximamente disponible
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Accessibility Panel */}
      <div id="accessibility-panel">
        <AccessibilityPanel />
      </div>
      </main>
    </>
  );
}
