'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { useUserRole } from '@/context/UserRoleContext';
import { getUserProgress } from '@/utils/getUserProgress';
const dynamicImport = (loader) =>
  dynamic(() => loader().then((mod) => mod.default), { ssr: false });

const ProgressDashboard = dynamicImport(() => import('@/components/ProgressDashboard'));
const AdaptiveLearningDashboard = dynamicImport(
  () => import('@/components/AdaptiveLearningDashboard'),
);
import ExamStatistics from '@/components/ExamStatistics';
const LevelsPartTimePerformancePanel = dynamicImport(
  () => import('@/components/LevelsPartTimePerformancePanel'),
);
const ProfilePrivateTutorPanel = dynamicImport(
  () => import('@/components/perfil/ProfilePrivateTutorPanel'),
);
const ProfileProgressCharts = dynamicImport(
  () => import('@/components/perfil/ProfileProgressCharts'),
);
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';
import ProfileSubscriptionCard from '@/components/perfil/ProfileSubscriptionCard';
import ProfileStudyNotesPanel from '@/components/perfil/ProfileStudyNotesPanel';
import ProfileFavouriteExercisesPanel from '@/components/perfil/ProfileFavouriteExercisesPanel';
import ProfileStudyPlannerPanel from '@/components/perfil/ProfileStudyPlannerPanel';
import ProfileComingSoon from '@/components/perfil/ProfileComingSoon';
import ProfileTabsNav from '@/components/perfil/ProfileTabsNav';
import { PROFILE_TABS, PROFILE_TAB_LABELS, isStudentHiddenProfileTab, getVisibleProfileTabs } from '@/components/perfil/profileTabsConfig';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import ProfileAvatarUpload from '@/components/perfil/ProfileAvatarUpload';
import {
  getMascotAvatarPath,
  isCustomProfilePhotoUrl,
  resolveProfileAvatarDisplay,
} from '@/lib/profileDefaultAvatar';
import { authMetadataPlanSlug, getPlanBySlug, getPlanProfileDisplay } from '@/data/financialPlanConfig';
import { canViewPricing } from '@/utils/pricingAccess';
import { getPersonalizedRecommendations } from '@/utils/adaptiveLearning';

const ProfileExamDatesPanel = dynamic(
  () => import('@/components/perfil/ProfileExamDatesPanel').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="profile-section">
        <p className="section-desc">Loading exam dates…</p>
      </div>
    ),
  },
);

const StudyActivityHeatmap = dynamic(
  () => import('@/components/perfil/StudyActivityHeatmap').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="profile-section">
        <p className="section-desc">Loading study activity…</p>
      </div>
    ),
  },
);

const UserErrorTrackerPanel = dynamicImport(
  () => import('@/components/profile/UserErrorTrackerPanel'),
);

const ProfileSkillAnalysis = dynamicImport(
  () => import('@/components/perfil/ProfileSkillAnalysis'),
);

const ProfileAchievementsCarousel = dynamicImport(
  () => import('@/components/perfil/ProfileAchievementsCarousel'),
);

const ProfileGoalsPanel = dynamicImport(
  () => import('@/components/perfil/ProfileGoalsPanel'),
);
const DraloLevelProgressSection = dynamic(
  () => import('@/components/dralo/DraloLevelProgressSection'),
  {
    ssr: false,
    loading: () => (
      <div className="dralo-level-card dralo-level-card--loading">
        <p className="dralo-level-card__status">Loading your Dralo experience…</p>
      </div>
    ),
  },
);
import SiteMascot from '@/components/SiteMascot';
import { TrendingUp } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import {
  hydrateProfileMockData,
  PROFILE_MOCK_TABS,
} from '@/lib/profileMockHydration';

const EMPTY_PROGRESS = { exams: [], training: [], theory: [], stats: {} };

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(EMPTY_PROGRESS);
  const [statsLoading, setStatsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [biography, setBiography] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [mascotVariant, setMascotVariant] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [placementLevel, setPlacementLevel] = useState(null);
  const [personalSaveMessage, setPersonalSaveMessage] = useState('');
  const [personalSaveError, setPersonalSaveError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [invitingFriend, setInvitingFriend] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteFlowActive, setDeleteFlowActive] = useState(false);
  const [deleteCodeSentAt, setDeleteCodeSentAt] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [sendingDeleteCode, setSendingDeleteCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameSaveMessage, setNameSaveMessage] = useState('');
  const [nameSaveError, setNameSaveError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: true });
  const [theme, setTheme] = useState('light');
  const [studyTimer, setStudyTimer] = useState({ isRunning: false, time: 0, sessionTime: 0 });
  const [studyHistory, setStudyHistory] = useState([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [studyRecommendations, setStudyRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [progressComparison, setProgressComparison] = useState({});
  const [studyGroups, setStudyGroups] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [studyPlan, setStudyPlan] = useState({ topics: [] });
  const [studyMusic, setStudyMusic] = useState({ isPlaying: false, currentTrack: null, tracks: [] });
  const [studyBreaks, setStudyBreaks] = useState({ enabled: true, interval: 25, breakTime: 5 });
  const [groupChat, setGroupChat] = useState([]);
  const [studyStreaks, setStudyStreaks] = useState({});
  const [studyRewards, setStudyRewards] = useState([]);
  const [studyThemes, setStudyThemes] = useState({ current: 'default', available: [] });
  const [aiInsights, setAiInsights] = useState([]);
  const [integratedStats, setIntegratedStats] = useState({
    progressData: null,
    adaptiveData: null,
    achievements: [],
    audioHistory: [],
    performanceMetrics: {}
  });

  const router = useRouter();
  const { userRole, session: layoutSession } = useUserRole();
  const isStudent = usesStudentContentRestrictions(userRole);
  const { applyLimits, progressTracking, loading: planLoading, planSlug } = usePlanEntitlements();
  const showProgressTracking = !applyLimits || progressTracking;
  const showFreePlanUpgrade = !planLoading && applyLimits && !progressTracking;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab) {
      const valid = PROFILE_TABS.find((t) => t.id === tab);
      if (valid && !(isStudent && isStudentHiddenProfileTab(tab, true))) {
        setActiveTab(tab);
        return;
      }
    }
    if (isStudent && isStudentHiddenProfileTab(activeTab, true)) {
      setActiveTab('overview');
    }
  }, [isStudent, activeTab]);

  const integratedStatsLoadedRef = useRef(false);
  const recommendationsLoadedRef = useRef(false);
  const mockHydratedTabsRef = useRef(new Set());
  const statsFetchedRef = useRef(false);

  const loadIntegratedStats = async (userId) => {
    try {
      const [{ offlineFirstDatabase }, { progressTracker }] = await Promise.all([
        import('@/utils/offlineFirstDatabase'),
        import('@/utils/progressTracker'),
      ]);

      const [progressData, achievements] = await Promise.all([
        offlineFirstDatabase.getUserProgress(userId),
        offlineFirstDatabase.getUserAchievements(userId),
        offlineFirstDatabase.getUserOverallProgress(userId),
      ]);

      const adaptiveData = await progressTracker.getUserSkillProgress(
        userId,
        'A2',
        'listening',
        'basico',
      );

      setIntegratedStats({
        progressData,
        adaptiveData,
        achievements,
        audioHistory: [],
        performanceMetrics: {
          totalExercises: progressData?.length || 0,
          totalScore: progressData?.reduce((sum, p) => sum + p.score, 0) || 0,
          averageScore:
            progressData?.length > 0
              ? Math.round(
                  progressData.reduce((sum, p) => sum + p.score, 0) / progressData.length,
                )
              : 0,
          totalTime: progressData?.reduce((sum, p) => sum + p.time_spent, 0) || 0,
        },
      });
    } catch (error) {
      console.warn('Error loading integrated stats:', error);
    }
  };
  const [studyMotivation, setStudyMotivation] = useState({});
  const [studyChallenges, setStudyChallenges] = useState([]);
  const [studyLeaderboard, setStudyLeaderboard] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { user: authUser } = await getClientAuth();
      if (!authUser) {
        router.replace('/login');
        return;
      }

      setUser(authUser);

      const userId = authUser.id;
      const [{ data: userRow }, { data: profileRow }, { data: preferencesRow }, { data: placementRow }] =
        await Promise.all([
        supabase.from('user_profiles').select('nombre, email').eq('id', userId).single(),
        supabase
          .from('profiles')
          .select('id, user_id, fecha_nacimiento, idioma_preferido, biografia, foto_url, mascot_variant')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase.from('user_preferences').select('notificaciones, recordatorios').eq('user_id', userId).single(),
        supabase
          .from('placement_results')
          .select('nivel_asignado')
          .eq('user_id', userId)
          .order('fecha', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const localSettings = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem(`profile_settings_${authUser.id}`) || '{}')
        : {};
      setFullName(userRow?.nombre || authUser?.user_metadata?.name || '');
      setBirthDate(profileRow?.fecha_nacimiento || '');
      setPreferredLanguage(profileRow?.idioma_preferido || 'en');
      setBiography(profileRow?.biografia || '');
      const customPhoto =
        (isCustomProfilePhotoUrl(profileRow?.foto_url) && profileRow.foto_url) || '';

      let assignedMascot = profileRow?.mascot_variant ?? null;
      if (assignedMascot == null && !customPhoto) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (token) {
            const res = await fetch('/api/perfil/ensure-default-avatar', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const payload = await res.json();
              assignedMascot = payload?.mascotVariant ?? null;
            }
          }
        } catch {
          /* fallback below */
        }
      }

      setCustomAvatarUrl(customPhoto);
      setMascotVariant(assignedMascot);
      setPlacementLevel(placementRow?.nivel_asignado || null);
      setNotifications({
        email: Boolean(preferencesRow?.notificaciones ?? true),
        push: Boolean(preferencesRow?.recordatorios ?? true),
      });
      setTheme(localSettings?.theme || 'light');

      setLoading(false);
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (!user?.id || loading) return;
    if (activeTab !== 'progress' && activeTab !== 'exam-dates') return;
    if (statsFetchedRef.current) return;

    let cancelled = false;
    statsFetchedRef.current = true;
    setStatsLoading(true);

    getUserProgress(user.id)
      .then((userProgress) => {
        if (!cancelled) setStats(userProgress);
      })
      .catch(() => {
        if (!cancelled) statsFetchedRef.current = false;
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, activeTab, loading]);

  useEffect(() => {
    if (!layoutSession?.access_token || !showProgressTracking || activeTab !== 'overview') {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/perfil/estadisticas-generales', {
          headers: { Authorization: `Bearer ${layoutSession.access_token}` },
        });
        const json = await res.json();
        if (cancelled || !res.ok || !json?.summary) return;
        setStats((prev) => ({
          ...(prev || { exams: [], training: [], theory: [], stats: {} }),
          stats: {
            ...(prev?.stats || {}),
            ...json.summary,
          },
        }));
      } catch {
        /* optional background sync */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [layoutSession?.access_token, showProgressTracking, activeTab]);

  useEffect(() => {
    if (!user?.id || loading || activeTab !== 'integrated') return;
    if (integratedStatsLoadedRef.current) return;
    integratedStatsLoadedRef.current = true;
    void loadIntegratedStats(user.id);
  }, [user?.id, activeTab, loading]);

  useEffect(() => {
    if (!user || loading) return;
    if (!PROFILE_MOCK_TABS.has(activeTab)) return;
    if (mockHydratedTabsRef.current.has(activeTab)) return;
    mockHydratedTabsRef.current.add(activeTab);

    hydrateProfileMockData(activeTab, {
      setStudyHistory,
      setWeeklyChallenges,
      setStudyRecommendations,
      setProgressComparison,
      setStudyGroups,
      setAchievementProgress,
      setFlashcards,
      setStudyPlan,
      setStudyMusic,
      setGroupChat,
      setStudyStreaks,
      setStudyRewards,
      setStudyThemes,
      setAiInsights,
      setStudyMotivation,
      setStudyChallenges,
      setStudyLeaderboard,
    });
  }, [activeTab, user, loading]);

  useEffect(() => {
    if (!user?.id || loading || activeTab !== 'analytics') return undefined;
    if (recommendationsLoadedRef.current) return undefined;

    let cancelled = false;
    recommendationsLoadedRef.current = true;
    setRecommendationsLoading(true);

    (async () => {
      try {
        const recs = await getPersonalizedRecommendations(user.id);
        if (!cancelled) setStudyRecommendations(Array.isArray(recs) ? recs : []);
      } catch {
        if (!cancelled) setStudyRecommendations([]);
      } finally {
        if (!cancelled) setRecommendationsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, activeTab, loading]);

  const handleSaveProfileName = async () => {
    const trimmed = (fullName || '').trim();
    if (!trimmed) {
      setNameSaveError('Enter a name for your profile.');
      setNameSaveMessage('');
      return false;
    }
    if (!user?.id) return false;

    setSaving(true);
    setNameSaveError('');
    setNameSaveMessage('');

    const { error } = await supabase.from('user_profiles').upsert(
      { id: user.id, nombre: trimmed, email: user.email },
      { onConflict: 'id' },
    );

    if (error) {
      console.error('Error saving profile name:', error);
      setNameSaveError('Could not save your name. Please try again.');
      setSaving(false);
      return false;
    }

    try {
      await supabase.auth.updateUser({ data: { name: trimmed } });
    } catch (authError) {
      console.warn('Could not sync auth metadata name:', authError);
    }

    setFullName(trimmed);
    setNameSaveMessage('Name updated successfully.');
    setSaving(false);
    return true;
  };

  const handleSavePersonalData = async () => {
    const trimmed = (fullName || '').trim();
    if (!trimmed) {
      setPersonalSaveError('Enter a name for your profile.');
      setPersonalSaveMessage('');
      return;
    }
    if (!user?.id) return;

    setSaving(true);
    setPersonalSaveError('');
    setPersonalSaveMessage('');
    setNameSaveError('');
    setNameSaveMessage('');

    const { error: nameError } = await supabase.from('user_profiles').upsert(
      { id: user.id, nombre: trimmed, email: user.email },
      { onConflict: 'id' },
    );

    if (nameError) {
      console.error('Error saving profile name:', nameError);
      setPersonalSaveError('Could not save your details. Please try again.');
      setSaving(false);
      return;
    }

    try {
      await supabase.auth.updateUser({ data: { name: trimmed } });
    } catch (authError) {
      console.warn('Could not sync auth metadata name:', authError);
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      fecha_nacimiento: birthDate || null,
      idioma_preferido: preferredLanguage || 'en',
      biografia: (biography || '').trim() || null,
      foto_url: customAvatarUrl || null,
    });

    setSaving(false);

    if (profileError) {
      console.error('Error saving profile details:', profileError);
      setPersonalSaveError('Name saved, but other personal details failed to save.');
      return;
    }

    setFullName(trimmed);
    setPersonalSaveMessage('Personal details saved successfully.');
  };

  const handleAvatarUpload = async (file) => {
    if (!user?.id) return;
    setAvatarUploading(true);
    setAvatarError('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setAvatarError('Session expired. Please sign in again.');
        return;
      }

      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/perfil/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAvatarError(payload?.error || 'Could not upload photo.');
        return;
      }

      if (payload?.avatarUrl) {
        setCustomAvatarUrl(payload.avatarUrl);
        setPersonalSaveMessage('Profile photo updated.');
        setPersonalSaveError('');
      }
    } catch (err) {
      console.error('Avatar upload:', err);
      setAvatarError('Network error while uploading photo.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    const passwordIsStrong =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /\d/.test(newPassword);

    if (!passwordIsStrong) {
      alert('Password must be at least 8 characters with one uppercase letter, one lowercase letter and one number.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert('Error changing password');
    else alert('Password updated successfully');
  };

  const handleSendDeleteCode = async () => {
    if (!user?.email) {
      alert('Could not detect your email to send the code.');
      return;
    }

    setSendingDeleteCode(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      setDeleteFlowActive(true);
      setDeleteCodeSentAt(new Date().toISOString());
      alert('We sent a 6-digit code to your email to confirm deletion.');
    } catch (error) {
      console.error('Error sending delete code:', error);
      alert(error.message || 'Could not send verification code.');
    } finally {
      setSendingDeleteCode(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      alert('Could not identify your account.');
      return;
    }
    if (!deleteCode || deleteCode.length !== 6) {
      alert('Enter the 6-digit code from your email.');
      return;
    }

    setDeletingAccount(true);
    try {
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: deleteCode.trim(),
        type: 'email',
      });

      if (otpError) {
        throw new Error('Invalid or expired code. Request a new one.');
      }

      await supabase.from('user_preferences').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);
      await supabase.from('user_profiles').delete().eq('id', user.id);
      await supabase.auth.updateUser({
        data: {
          account_status: 'deleted',
          account_deleted_at: new Date().toISOString(),
        },
      });

      await supabase.auth.signOut();
      alert('Account deleted successfully.');
      router.push('/registro');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Could not delete account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setSaving(true);
    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      notificaciones: Boolean(notifications.email),
      recordatorios: Boolean(notifications.push)
    });
    localStorage.setItem(`profile_settings_${user.id}`, JSON.stringify({ theme }));
    setSaving(false);
  };

  const handleInviteFriend = async () => {
    const recipient = inviteEmail.trim().toLowerCase();
    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      alert('Enter a valid email for the invitation.');
      return;
    }
    if (!user?.id) {
      alert('Could not validate your session to send the invitation.');
      return;
    }

    setInvitingFriend(true);
    try {
      const accessToken =
        layoutSession?.access_token ||
        (await supabase.auth.getSession()).data?.session?.access_token;
      if (!accessToken) {
        throw new Error('Could not get session to send the invitation.');
      }

      const inviteUrl =
        (typeof process !== 'undefined' &&
          process.env.NEXT_PUBLIC_INVITE_SEND_MAIL_URL?.trim()) ||
        '/api/invitations/send-mail';

      const response = await fetch(inviteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to: recipient,
          message: inviteMessage.trim(),
        }),
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        /* respuesta no JSON */
      }

      if (response.status === 404 && !process.env.NEXT_PUBLIC_INVITE_SEND_MAIL_URL) {
        throw new Error(
          'Email invitations are not available in the static build. Deploy the API or set NEXT_PUBLIC_INVITE_SEND_MAIL_URL.'
        );
      }
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not send invitation.');
      }

      if (payload?.sandbox) {
        alert(
          `Invitation saved in test mode: ${payload.sandbox}\n\nIn production, with dralo.es verified in Resend, it will reach your friend's inbox.`,
        );
      } else {
        alert('Invitation sent successfully.');
      }
      setInviteEmail('');
      setInviteMessage('');
    } catch (error) {
      console.error('Error inviting friend:', error);
      alert(error.message || 'Error sending invitation.');
    } finally {
      setInvitingFriend(false);
    }
  };

  // Funciones del temporizador
  const startTimer = () => {
    setStudyTimer(prev => ({ ...prev, isRunning: true }));
  };

  const stopTimer = () => {
    setStudyTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setStudyTimer({ isRunning: false, time: 0, sessionTime: 0 });
  };

  // Funciones de flashcards
  const addFlashcard = () => {
    const newCard = {
      id: Date.now(),
      front: 'Nueva tarjeta',
      back: 'Definition...',
      category: 'Vocabulary',
      difficulty: 'Medium',
      reviewed: 0,
      correct: 0
    };
    setFlashcards(prev => [newCard, ...prev]);
  };

  const updateFlashcard = (id, updates) => {
    setFlashcards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
  };

  const deleteFlashcard = (id) => {
    setFlashcards(prev => prev.filter(card => card.id !== id));
  };

  // Funciones de música
  const playMusic = (track) => {
    setStudyMusic(prev => ({ ...prev, isPlaying: true, currentTrack: track }));
  };

  const pauseMusic = () => {
    setStudyMusic(prev => ({ ...prev, isPlaying: false }));
  };

  // Funciones de chat
  const sendMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      user: 'You',
      message: message,
      time: 'now',
      group: 'Current Group'
    };
    setGroupChat(prev => [newMessage, ...prev]);
  };

  // Funciones de temas
  const changeTheme = (themeId) => {
    setStudyThemes(prev => ({ ...prev, current: themeId }));
  };

  // Funciones de recompensas
  const claimReward = (rewardId) => {
    setStudyRewards(prev => prev.map(reward => 
      reward.id === rewardId ? { ...reward, earned: true } : reward
    ));
  };

  // Funciones de desafíos
  const startChallenge = (challengeId) => {
    alert(`Starting challenge: ${studyChallenges.find(c => c.id === challengeId)?.title}`);
  };

  // Funciones de hábitos
  const updateHabit = (habitId, updates) => {
    setStudyHabits(prev => prev.map(habit => 
      habit.id === habitId ? { ...habit, ...updates } : habit
    ));
  };

  // Funciones de metas
  if (loading) {
    return (
      <main className="shell perfil-page center">
        <div className="loader" aria-label="Loading" />
      </main>
    );
  }

  if (!user) return null;

  const activeTabMeta = PROFILE_TABS.find((t) => t.id === activeTab);
  const studentTabLocked = isStudent && activeTabMeta && !activeTabMeta.studentAllowed;

  const displayName =
    (fullName || '').trim() ||
    user?.user_metadata?.name?.trim() ||
    user?.email?.split('@')[0] ||
    '';

  const subscriptionSlug = authMetadataPlanSlug(user?.user_metadata?.subscription_plan);
  const subscriptionPlan = getPlanBySlug(subscriptionSlug);
  const subscriptionDisplay = getPlanProfileDisplay(subscriptionPlan);
  const showPricingLink = canViewPricing(userRole);

  const tabsProps = {
    tabs: getVisibleProfileTabs(isStudent),
    activeTab,
    onSelectTab: setActiveTab,
    isStudent,
  };

  const avatarDisplay = resolveProfileAvatarDisplay({
    fotoUrl: customAvatarUrl,
    mascotVariant,
  });
  const mascotFallbackUrl =
    mascotVariant != null ? getMascotAvatarPath(mascotVariant) : null;

  const estimatedLevel = stats.stats?.levelEstimate || placementLevel || null;

  return (
    <main className={`shell perfil-page${activeTab === 'mis-datos' ? ' perfil-page--mis-datos' : ''}`}>
      <ProfileTabsNav {...tabsProps} />
      <header className="header header--mascot">
          <ProfileAvatarUpload
            avatarUrl={avatarDisplay.displayUrl}
            fallbackAvatarUrl={mascotFallbackUrl}
            isDefaultMascot={avatarDisplay.isDefaultMascot}
            displayName={displayName}
            onSelectFile={handleAvatarUpload}
            uploading={avatarUploading}
            error={avatarError}
            size={96}
            className="header__avatar"
          />
          <div className="header__copy">
            <h1>{displayName || user?.email || 'Profile'}</h1>
            <p>Manage your personal information and track your learning progress.</p>
          </div>
          <div className="header__level" aria-label="Estimated level">
            <span className="header__level-icon" aria-hidden>
              <TrendingUp strokeWidth={2} />
            </span>
            <div className="header__level-body">
              <span className="header__level-value">{estimatedLevel ?? '—'}</span>
              <span className="header__level-label">Estimated level</span>
            </div>
          </div>
          <div className="header__mascot" aria-hidden>
            <SiteMascot variant={6} width={130} alt="" />
          </div>
        </header>

      {studentTabLocked ? (
        <ProfileComingSoon section={PROFILE_TAB_LABELS[activeTab]} />
      ) : (
        <>
      {/* Tab: Resumen */}
      {activeTab === 'overview' && (
        <div className="profile-tab-panels">
          {showFreePlanUpgrade ? (
            <section className="profile-plan-upgrade-card" aria-labelledby="profile-plan-upgrade-title">
              <span className="profile-plan-upgrade-card__badge">
                {(subscriptionPlan?.nombre || planSlug || 'free').toUpperCase()} plan
              </span>
              <h2 id="profile-plan-upgrade-title" className="profile-plan-upgrade-card__title">
                Upgrade to unlock your full profile
              </h2>
              <p className="profile-plan-upgrade-card__text">
                You&apos;re on the Free plan. Progress tracking, exam statistics and detailed
                analytics are included in Plus and Premium.
              </p>
              <Link href="/precios" className="profile-plan-upgrade-card__cta">
                View plans
              </Link>
            </section>
          ) : null}

          {!isStudent ? (
            <ProfileCollapsibleSection title="Dralo IA — Experience">
              <DraloLevelProgressSection
                accessToken={layoutSession?.access_token}
                lang="en"
              />
            </ProfileCollapsibleSection>
          ) : null}

          {showProgressTracking ? (
            <>
              <ProfileCollapsibleSection
                title="Exam statistics"
                className="profile-section--nested-exam-stats profile-section--exam-practice-combined"
              >
                <ExamStatistics userId={user?.id} embedded />
              </ProfileCollapsibleSection>

              <ProfileCollapsibleSection title="Study activity">
                <StudyActivityHeatmap accessToken={layoutSession?.access_token} />
              </ProfileCollapsibleSection>

              <ProfileCollapsibleSection title="Practice times">
                <LevelsPartTimePerformancePanel userId={user?.id} />
              </ProfileCollapsibleSection>
            </>
          ) : null}
        </div>
      )}

      {/* Tab: Progreso */}
      {activeTab === 'progress' && (
        <div className="profile-tab-panels">
          <ProfileSkillAnalysis userId={user?.id} />
          <ProfileProgressCharts stats={stats} loading={statsLoading} />
        </div>
      )}

      {/* Tab: Logros */}
      {activeTab === 'achievements' && (
        <ProfileCollapsibleSection title="Achievements & badges">
<ProfileAchievementsCarousel userId={user?.id} />
</ProfileCollapsibleSection>
      )}

      {/* Tab: Objetivos */}
      {activeTab === 'goals' && (
        <ProfileCollapsibleSection title="My goals">
<ProfileGoalsPanel userId={user?.id} />
</ProfileCollapsibleSection>
      )}

      {activeTab === 'integrated' && (
        <>
          {/* Dashboard de Progreso Integrado */}
          <ProfileCollapsibleSection title="Progress dashboard">
<ProgressDashboard userId={user?.id} />
</ProfileCollapsibleSection>

          {/* Aprendizaje Adaptativo */}
          <ProfileCollapsibleSection title="Adaptive learning">
<AdaptiveLearningDashboard userId={user?.id} />
</ProfileCollapsibleSection>

          {/* Métricas de Rendimiento */}
          <ProfileCollapsibleSection title="Performance metrics">
<div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">📚</div>
                <div className="metric-value">{integratedStats.performanceMetrics.totalExercises || 0}</div>
                <div className="metric-label">Exercises completed</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🎯</div>
                <div className="metric-value">{integratedStats.performanceMetrics.averageScore || 0}%</div>
                <div className="metric-label">Average score</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">⏱️</div>
                <div className="metric-value">{Math.round((integratedStats.performanceMetrics.totalTime || 0) / 60)}m</div>
                <div className="metric-label">Total time</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🏆</div>
                <div className="metric-value">{integratedStats.achievements?.length || 0}</div>
                <div className="metric-label">Achievements unlocked</div>
              </div>
            </div>
</ProfileCollapsibleSection>

          {/* Logros Recientes */}
          {integratedStats.achievements && integratedStats.achievements.length > 0 && (
            <ProfileCollapsibleSection title="Recent achievements">
<div className="achievements-grid">
                {integratedStats.achievements.slice(0, 6).map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-icon">{achievement.icon || '🏆'}</div>
                    <div className="achievement-title">{achievement.title}</div>
                    <div className="achievement-description">{achievement.description}</div>
                    <div className="achievement-points">+{achievement.points} points</div>
                  </div>
                ))}
              </div>
</ProfileCollapsibleSection>
          )}

          {/* Análisis de Habilidades */}
          {integratedStats.adaptiveData && (
            <ProfileCollapsibleSection title="Skills analysis">
<div className="skill-analysis">
                <div className="skill-item">
                  <div className="skill-name">Listening</div>
                  <div className="skill-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${integratedStats.adaptiveData.completionRate || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{integratedStats.adaptiveData.completionRate || 0}%</span>
                  </div>
                </div>
                
                <div className="skill-item">
                  <div className="skill-name">Reading</div>
                  <div className="skill-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                    <span className="progress-text">75%</span>
                  </div>
                </div>
                
                <div className="skill-item">
                  <div className="skill-name">Speaking</div>
                  <div className="skill-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                    <span className="progress-text">60%</span>
                  </div>
                </div>
                
                <div className="skill-item">
                  <div className="skill-name">Writing</div>
                  <div className="skill-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: '45%' }}
                      ></div>
                    </div>
                    <span className="progress-text">45%</span>
                  </div>
                </div>
              </div>
</ProfileCollapsibleSection>
          )}
        </>
      )}

      {activeTab === 'mis-datos' && (
        <div className="mis-datos-panel">
          <ProfileCollapsibleSection title="Your account">
            <dl className="mis-datos-facts">
              <div className="mis-datos-fact">
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div className="mis-datos-fact">
                <dt>Joined</dt>
                <dd>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </dd>
              </div>
              {!isStudent ? (
                <>
                  <div className="mis-datos-fact">
                    <dt>Level (placement)</dt>
                    <dd>{placementLevel || 'No placement test yet'}</dd>
                  </div>
                  {placementLevel ? (
                    <div className="mis-datos-fact">
                      <dt>Goals plan</dt>
                      <dd>
                        <Link href="/plan-objetivos" className="mis-datos-link">
                          View or complete survey →
                        </Link>
                      </dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
          </ProfileCollapsibleSection>

          <ProfileCollapsibleSection title="My subscription">
            <Suspense fallback={<p className="section-desc">Loading subscription…</p>}>
              <ProfileSubscriptionCard
                plan={subscriptionPlan}
                description={subscriptionDisplay.descripcionCorta}
                highlights={subscriptionDisplay.highlights}
                badge={subscriptionDisplay.badge}
                showPricingLink={showPricingLink}
              />
            </Suspense>
          </ProfileCollapsibleSection>

          <ProfileCollapsibleSection
            title="Personal details"
            className="profile-name-section"
          >
            <div className="mis-datos-form">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-display-name">
                Full name
              </label>
              <input
                id="profile-display-name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setPersonalSaveMessage('');
                  setPersonalSaveError('');
                }}
                className="form-input"
                placeholder="Your name"
                maxLength={80}
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-birth-date">
                Date of birth
              </label>
              <input
                id="profile-birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setPersonalSaveMessage('');
                  setPersonalSaveError('');
                }}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-bio">
                About you (optional)
              </label>
              <textarea
                id="profile-bio"
                value={biography}
                onChange={(e) => {
                  setBiography(e.target.value);
                  setPersonalSaveMessage('');
                  setPersonalSaveError('');
                }}
                className="form-input"
                rows={4}
                maxLength={500}
                placeholder="E.g. Preparing for B2 First in June, listening is my weak point…"
              />
            </div>
            </div>
            {personalSaveError ? (
              <p className="form-hint form-hint--error">{personalSaveError}</p>
            ) : null}
            {personalSaveMessage ? (
              <p className="form-hint form-hint--success">{personalSaveMessage}</p>
            ) : null}
            <button
              type="button"
              onClick={handleSavePersonalData}
              className="action-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save personal details'}
            </button>
          </ProfileCollapsibleSection>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="profile-settings-panel">
          <ProfileCollapsibleSection title="Security">
            <div className="form-group">
              <label className="form-label">New password</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>
            <button type="button" onClick={handlePasswordChange} className="action-btn">
              🔑 Update password
            </button>
          </ProfileCollapsibleSection>

          <ProfileCollapsibleSection title="Notifications">
            <div className="settings-grid">
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  />
                  📧 Email notifications
                </label>
              </div>
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  />
                  🔔 Notifications Push
                </label>
              </div>
            </div>
            <button type="button" onClick={handleSettingsUpdate} className="action-btn" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save settings'}
            </button>
          </ProfileCollapsibleSection>

          <ProfileCollapsibleSection title="Invite a friend — get 2 months free">
            <p className="profile-settings-panel__intro profile-settings-panel__intro--promo">
              Invite a friend and get 2 months free when they sign up. Send them an email
              invitation to join you and practise on Dralo.
            </p>
            <div className="form-group">
              <label className="form-label">Friend's email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="form-input"
                placeholder="friend@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Custom message (optional)</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="form-input"
                rows={4}
                placeholder="Hi! Join me to practise English on English Practice."
              />
            </div>
            <button type="button" onClick={handleInviteFriend} className="action-btn" disabled={invitingFriend}>
              {invitingFriend ? 'Sending invitation...' : 'Send invitation'}
            </button>
          </ProfileCollapsibleSection>

          <ProfileCollapsibleSection
            title="Delete account"
            className="profile-collapse--danger"
            description="Permanent — requires email verification"
          >
            <p className="profile-settings-panel__danger-intro">
              This action cannot be undone. To confirm, we will send a 6-digit code to your account email.
            </p>
            <div className="profile-settings-panel__danger-actions">
              <button
                type="button"
                onClick={handleSendDeleteCode}
                className="action-btn profile-settings-panel__danger-btn"
                disabled={sendingDeleteCode || deletingAccount}
              >
                {sendingDeleteCode ? 'Sending code...' : 'Send confirmation code'}
              </button>
              {deleteFlowActive && (
                <div className="profile-settings-panel__danger-form">
                  <div className="form-group">
                    <label className="form-label">Verification code (6 digits)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="form-input"
                      placeholder="123456"
                    />
                    <small className="profile-settings-panel__danger-hint">
                      Code sent to {user?.email}. {deleteCodeSentAt ? 'If it expires, request a new one.' : ''}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="action-btn profile-settings-panel__danger-btn profile-settings-panel__danger-btn--confirm"
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? 'Deleting...' : 'Confirm account deletion'}
                  </button>
                </div>
              )}
            </div>
          </ProfileCollapsibleSection>
        </div>
      )}

      {/* Tab: Herramientas de Estudio */}
      {activeTab === 'study-tools' && (
        <>
          {/* Temporizador de Estudio */}
          <ProfileCollapsibleSection title="Study timer">
<div className="timer-container">
              <div className="timer-display">
                <div className="timer-time">
                  {Math.floor(studyTimer.sessionTime / 60)}:{(studyTimer.sessionTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="timer-label">Session time</div>
              </div>
              <div className="timer-controls">
                <button 
                  onClick={studyTimer.isRunning ? stopTimer : startTimer}
                  className={`timer-btn ${studyTimer.isRunning ? 'timer-stop' : 'timer-start'}`}
                >
                  {studyTimer.isRunning ? '⏸️ Pause' : '▶️ Start'}
                </button>
                <button onClick={resetTimer} className="timer-btn timer-reset">
                  🔄 Reset
                </button>
              </div>
            </div>
</ProfileCollapsibleSection>

          <ProfileStudyNotesPanel lang="en" />

          <ProfileFavouriteExercisesPanel lang="en" />

          {/* Historial de Estudio */}
          <ProfileCollapsibleSection title="Study history">
<div className="history-table">
              <div className="history-header">
                <div>Date</div>
                <div>Duration</div>
                <div>Exercises</div>
                <div>Score</div>
                <div>Type</div>
              </div>
              {studyHistory.map((session, index) => (
                <div key={index} className="history-row">
                  <div>{session.date}</div>
                  <div>{session.duration} min</div>
                  <div>{session.exercises}</div>
                  <div className={`score ${session.score >= 80 ? 'score-good' : session.score >= 60 ? 'score-medium' : 'score-low'}`}>
                    {session.score}%
                  </div>
                  <div>{session.type}</div>
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>
        </>
      )}

      {/* Tab: Social */}
      {activeTab === 'social' && (
        <>
          {/* Comparación de Progreso */}
          <ProfileCollapsibleSection title="Progress comparison">
<div className="comparison-stats">
              <div className="comparison-card">
                <div className="comparison-label">Your score</div>
                <div className="comparison-value">{progressComparison.userScore}%</div>
              </div>
              <div className="comparison-card">
                <div className="comparison-label">Overall average</div>
                <div className="comparison-value">{progressComparison.averageScore}%</div>
              </div>
              <div className="comparison-card">
                <div className="comparison-label">Percentile</div>
                <div className="comparison-value">{progressComparison.percentile}%</div>
              </div>
              <div className="comparison-card">
                <div className="comparison-label">Ranking</div>
                <div className="comparison-value">{progressComparison.rank}</div>
              </div>
            </div>
</ProfileCollapsibleSection>

          {/* Grupos de Estudio */}
          <ProfileCollapsibleSection title="Study groups">
<div className="groups-grid">
              {studyGroups.map((group) => (
                <div key={group.id} className="group-card">
                  <div className="group-name">{group.name}</div>
                  <div className="group-members">{group.members} members</div>
                  <div className="group-level">{group.level}</div>
                  <div className="group-activity">Last activity: {group.lastActivity}</div>
                  <button className="join-group-btn">Join</button>
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>

          {/* Desafíos Semanales */}
          <ProfileCollapsibleSection title="Weekly challenges">
<div className="challenges-grid">
              {weeklyChallenges.map((challenge) => (
                <div key={challenge.id} className="challenge-card">
                  <div className="challenge-title">{challenge.title}</div>
                  <div className="challenge-description">{challenge.description}</div>
                  <div className="challenge-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{challenge.progress}/{challenge.target}</div>
                  </div>
                  <div className="challenge-reward">Reward: {challenge.reward}</div>
                  <div className="challenge-deadline">Deadline: {challenge.deadline}</div>
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>
        </>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <>
          {/* Recomendaciones Inteligentes */}
          <ProfileCollapsibleSection title="Smart recommendations">
<div className="recommendations-grid">
              {recommendationsLoading ? (
                <p className="section-desc">Loading your personalised recommendations…</p>
              ) : studyRecommendations.length === 0 ? (
                <p className="section-desc">
                  Complete a few practice sessions and we&apos;ll suggest what to study next.
                </p>
              ) : (
                studyRecommendations.map((rec, index) => (
                <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                  <div className="recommendation-type">{rec.type}</div>
                  {rec.skill ? <div className="recommendation-skill">{rec.skill}</div> : null}
                  <div className="recommendation-message">{rec.message}</div>
                  <div className="recommendation-priority">Priority: {rec.priority}</div>
                </div>
              ))
              )}
            </div>
</ProfileCollapsibleSection>

          {/* Progreso de Logros */}
          <ProfileCollapsibleSection title="Achievement progress">
<div className="achievement-progress-grid">
              {Object.entries(achievementProgress).map(([name, progress]) => (
                <div key={name} className="achievement-progress-card">
                  <div className="achievement-name">{name}</div>
                  <div className="achievement-description">{progress.description}</div>
                  <div className="achievement-progress-bar">
                    <div 
                      className="achievement-progress-fill" 
                      style={{ width: `${(progress.current / progress.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="achievement-progress-text">
                    {progress.current}/{progress.target}
                  </div>
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>

          {/* Estadísticas Avanzadas */}
          <ProfileCollapsibleSection title="Advanced statistics">
<div className="advanced-stats">
              <div className="stat-item">
                <div className="stat-label">Average time per session</div>
                <div className="stat-value">42 minutes</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Best streak</div>
                <div className="stat-value">12 days</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Exercises completed today</div>
                <div className="stat-value">8</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Weekly improvement</div>
                <div className="stat-value">+15%</div>
              </div>
            </div>
</ProfileCollapsibleSection>
        </>
      )}

      {/* Tab: IA Tools */}
      {activeTab === 'ai-tools' && (
        <>
          {/* Insights de IA */}
          <ProfileCollapsibleSection title="AI insights">
<div className="ai-insights-grid">
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`ai-insight-card ${insight.type}`}>
                  <div className="insight-header">
                    <div className="insight-title">{insight.title}</div>
                    <div className="insight-confidence">{insight.confidence}% confidence</div>
                  </div>
                  <div className="insight-description">{insight.description}</div>
                  <div className="insight-type-badge">{insight.type}</div>
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>

          {/* Planificador Inteligente */}
          <ProfileCollapsibleSection title="Smart study plan">
<div className="study-plan-container">
              <div className="plan-overview">
                <div className="plan-item">
                  <div className="plan-label">Daily goal</div>
                  <div className="plan-value">{studyPlan.dailyGoal} min</div>
                </div>
                <div className="plan-item">
                  <div className="plan-label">Weekly goal</div>
                  <div className="plan-value">{studyPlan.weeklyGoal} min</div>
                </div>
                <div className="plan-item">
                  <div className="plan-label">Current streak</div>
                  <div className="plan-value">{studyPlan.currentStreak} days</div>
                </div>
              </div>
              <div className="next-session">
                <h3>Next session</h3>
                <div className="session-info">
                  <div className="session-title">{studyPlan.nextSession}</div>
                  <div className="session-details">
                    <span>Estimated time: {studyPlan.estimatedTime} min</span>
                    <span>Difficulty: {studyPlan.difficulty}</span>
                  </div>
                  <div className="session-topics">
                    {(studyPlan.topics || []).map((topic, index) => (
                      <span key={index} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
</ProfileCollapsibleSection>

          {/* Música de Estudio */}
          <ProfileCollapsibleSection title="Study music">
<div className="music-player">
              <div className="current-track">
                {studyMusic.currentTrack ? (
                  <div className="track-info">
                    <div className="track-name">{studyMusic.currentTrack.name}</div>
                    <div className="track-artist">{studyMusic.currentTrack.artist}</div>
                    <div className="track-duration">{studyMusic.currentTrack.duration}</div>
                  </div>
                ) : (
                  <div className="no-track">Select a track</div>
                )}
              </div>
              <div className="music-controls">
                <button 
                  onClick={studyMusic.isPlaying ? pauseMusic : () => playMusic(studyMusic.tracks?.[0])}
                  disabled={!studyMusic.tracks?.length}
                  className="music-btn"
                >
                  {studyMusic.isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
              </div>
              <div className="music-tracks">
                {(studyMusic.tracks || []).map((track) => (
                  <div key={track.id} className="track-item">
                    <div className="track-details">
                      <div className="track-name">{track.name}</div>
                      <div className="track-artist">{track.artist}</div>
                      <div className="track-genre">{track.genre}</div>
                    </div>
                    <div className="track-duration">{track.duration}</div>
                    <button onClick={() => playMusic(track)} className="play-track-btn">▶️</button>
                  </div>
                ))}
              </div>
            </div>
</ProfileCollapsibleSection>
        </>
      )}

      {activeTab === 'study-planner' && (
        <ProfileStudyPlannerPanel
          userId={user?.id ?? null}
          statsSummary={{
            levelEstimate: stats.stats?.levelEstimate ?? 'B2',
            studyStreak: stats.stats?.studyStreak ?? 0,
            totalStudyMinutes: stats.stats?.totalStudyMinutes ?? 0,
          }}
        />
      )}

      {/* Tab: Gamificación */}
      {activeTab === 'gamification' && (
        <>
          {/* Sistema de Recompensas */}
          <ProfileCollapsibleSection title="Rewards system">
<div className="rewards-grid">
              {studyRewards.map((reward) => (
                <div key={reward.id} className={`reward-card ${reward.earned ? 'earned' : 'locked'}`}>
                  <div className="reward-icon">🏆</div>
                  <div className="reward-name">{reward.name}</div>
                  <div className="reward-description">{reward.description}</div>
                  <div className="reward-points">{reward.points} points</div>
                  {reward.earned ? (
                    <button className="claim-btn">✅ Claimed</button>
                  ) : (
                    <button onClick={() => claimReward(reward.id)} className="claim-btn">
                      🎁 Claim
                    </button>
                  )}
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>

          {/* Desafíos Especiales */}
          <ProfileCollapsibleSection title="Special challenges">
<div className="challenges-special-grid">
              {studyChallenges.map((challenge) => (
                <div key={challenge.id} className={`challenge-special-card ${challenge.difficulty.toLowerCase()}`}>
                  <div className="challenge-icon">⚡</div>
                  <div className="challenge-title">{challenge.title}</div>
                  <div className="challenge-description">{challenge.description}</div>
                  <div className="challenge-reward">Reward: {challenge.reward}</div>
                  <div className="challenge-difficulty">{challenge.difficulty}</div>
                  <button onClick={() => startChallenge(challenge.id)} className="start-challenge-btn">
                    🚀 Start challenge
                  </button>
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>

          {/* Tabla de Clasificación */}
          <ProfileCollapsibleSection title="Leaderboard">
<div className="leaderboard">
              <div className="leaderboard-header">
                <div>Rank</div>
                <div>User</div>
                <div>Score</div>
                <div>Level</div>
                <div>Streak</div>
              </div>
              {studyLeaderboard.map((player) => (
                <div key={player.rank} className={`leaderboard-row ${player.name === 'You' ? 'current-user' : ''}`}>
                  <div className="rank">#{player.rank}</div>
                  <div className="player-name">{player.name}</div>
                  <div className="player-score">{player.score}</div>
                  <div className="player-level">{player.level}</div>
                  <div className="player-streak">{player.streak} days</div>
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>

          {/* Motivación */}
          <ProfileCollapsibleSection title="Motivation">
<div className="motivation-container">
              <div className="motivation-level">
                <div className="motivation-label">Motivation level</div>
                <div className="motivation-value">{studyMotivation.currentLevel}%</div>
                <div className="motivation-change">+{studyMotivation.weeklyChange}% this week</div>
              </div>
              <div className="motivational-quote">
                <div className="quote-text">"{studyMotivation.motivationalQuote}"</div>
              </div>
              <div className="next-milestone">
                <div className="milestone-label">Next milestone</div>
                <div className="milestone-text">{studyMotivation.nextMilestone}</div>
                <div className="milestone-progress">
                  <div 
                    className="milestone-fill" 
                    style={{ width: `${studyMotivation.progressToMilestone}%` }}
                  ></div>
                </div>
                <div className="milestone-percentage">{studyMotivation.progressToMilestone}%</div>
              </div>
            </div>
</ProfileCollapsibleSection>
        </>
      )}

      {/* Tab: Dates de examen */}
      {activeTab === 'exam-dates' ? (
        <ProfileExamDatesPanel
          key="exam-dates-panel"
          levelEstimate={stats.stats?.levelEstimate ?? 'B1'}
          completedExams={stats.stats?.completedExams ?? 0}
          studyStreak={stats.stats?.studyStreak ?? 0}
          totalStudyMinutes={stats.stats?.totalStudyMinutes ?? 0}
        />
      ) : null}

      {activeTab === 'private-tutor' && (
        <ProfilePrivateTutorPanel
          userRole={userRole}
          accessToken={layoutSession?.access_token}
        />
      )}

      {activeTab === 'error-tracker' && (
        <UserErrorTrackerPanel userId={user?.id ?? null} />
      )}

      {/* Tab: Comunidad */}
      {activeTab === 'community' && (
        <>
          {/* Chat de Grupos */}
          <ProfileCollapsibleSection title="Group chat">
<div className="chat-container">
              <div className="chat-messages">
                {groupChat.map((message) => (
                  <div key={message.id} className={`chat-message ${message.user === 'You' ? 'own-message' : 'other-message'}`}>
                    <div className="message-header">
                      <div className="message-user">{message.user}</div>
                      <div className="message-time">{message.time}</div>
                    </div>
                    <div className="message-content">{message.message}</div>
                    <div className="message-group">{message.group}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="message-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button className="send-btn">📤</button>
              </div>
            </div>
</ProfileCollapsibleSection>

          {/* Flashcards */}
          <ProfileCollapsibleSection
            title="🃏 Flashcards"
            actions={
              <button type="button" onClick={addFlashcard} className="add-flashcard-btn">
                + New card
              </button>
            }
          >
            <div className="flashcards-grid">
              {flashcards.map((card) => (
                <div key={card.id} className="flashcard">
                  <div className="flashcard-header">
                    <div className="flashcard-category">{card.category}</div>
                    <div className="flashcard-difficulty">{card.difficulty}</div>
                    <button onClick={() => deleteFlashcard(card.id)} className="delete-flashcard-btn">🗑️</button>
                  </div>
                  <div className="flashcard-content">
                    <div className="flashcard-front">
                      <input
                        type="text"
                        value={card.front}
                        onChange={(e) => updateFlashcard(card.id, { front: e.target.value })}
                        className="flashcard-input"
                      />
                    </div>
                    <div className="flashcard-back">
                      <textarea
                        value={card.back}
                        onChange={(e) => updateFlashcard(card.id, { back: e.target.value })}
                        className="flashcard-textarea"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flashcard-stats">
                    <div className="stat">Reviewed: {card.reviewed}</div>
                    <div className="stat">Correct: {card.correct}</div>
                    <div className="stat">Accuracy: {card.reviewed > 0 ? Math.round((card.correct / card.reviewed) * 100) : 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          </ProfileCollapsibleSection>

          {/* Temas Visuales */}
          <ProfileCollapsibleSection title="Visual themes">
<div className="themes-grid">
              {studyThemes.available.map((theme) => (
                <div 
                  key={theme.id} 
                  className={`theme-card ${studyThemes.current === theme.id ? 'active' : ''}`}
                  onClick={() => changeTheme(theme.id)}
                >
                  <div 
                    className="theme-preview" 
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` 
                    }}
                  ></div>
                  <div className="theme-name">{theme.name}</div>
                  {studyThemes.current === theme.id && (
                    <div className="theme-active">✓ Active</div>
                  )}
                </div>
              ))}
            </div>
</ProfileCollapsibleSection>
        </>
      )}
        </>
      )}

      <GlobalStyles />
    </main>
  );
}

// ====== Estilos (styled-jsx global + locales) ======
function GlobalStyles() {
  return (
    <style jsx global>{`
      .perfil-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .perfil-page.shell {
        min-height: calc(100svh - 4rem);
        width: 100%;
        max-width: 1320px;
        margin: 0 auto;
        padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
        box-sizing: border-box;
      }
      .center{display:grid;place-items:center}
      .header h1{font-size:44px;margin:0 0 6px;color:var(--text)}
      .header p{margin:0;color:#666}
      .section-desc{margin:-8px 0 16px;color:#64748b;font-size:15px;line-height:1.5}
      .profile-plan-upgrade-card{margin:0 0 20px;padding:22px 24px;border-radius:16px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);border:1px solid #c7d2fe;box-shadow:0 8px 24px rgba(79,70,229,.08)}
      .profile-plan-upgrade-card__badge{display:inline-block;margin-bottom:10px;padding:4px 10px;border-radius:999px;background:#1e293b;color:#f8fafc;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
      .profile-plan-upgrade-card__title{margin:0 0 8px;font-size:1.35rem;line-height:1.3;color:#0f172a}
      .profile-plan-upgrade-card__text{margin:0 0 16px;max-width:52ch;color:#475569;font-size:0.95rem;line-height:1.55}
      .profile-plan-upgrade-card__cta{display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:10px;background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);color:#fff;font-weight:700;text-decoration:none;box-shadow:0 6px 18px rgba(37,99,235,.28)}
      .profile-plan-upgrade-card__cta:hover{text-decoration:none;filter:brightness(1.05)}
      .form-hint{margin:0 0 12px;font-size:14px}
      .form-hint--error{color:#dc2626}
      .form-hint--success{color:#16a34a}
      .mis-datos-panel{width:100%}
      .mis-datos-panel .profile-section:not(.profile-section--collapsible):not(.profile-collapse){padding:28px 32px}
      .mis-datos-panel .profile-section.profile-section--collapsible,.mis-datos-panel .profile-collapse{padding:0}
      .mis-datos-panel .section-head h2{font-size:24px}
      .mis-datos-panel .section-desc{font-size:16px;margin-bottom:22px}
      .mis-datos-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 32px;margin:0}
      @media (min-width:720px){.mis-datos-facts{grid-template-columns:repeat(4,minmax(0,1fr))}}
      .mis-datos-fact dt{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin:0 0 6px}
      .mis-datos-fact dd{margin:0;font-size:16px;color:var(--text);font-weight:500;line-height:1.4}
      .mis-datos-link{color:#0070f3;font-weight:600;text-decoration:none}
      .mis-datos-link:hover{text-decoration:underline}
      .mis-datos-form{display:grid;grid-template-columns:1fr;gap:4px 24px}
      @media (min-width:640px){
        .mis-datos-form{grid-template-columns:repeat(2,minmax(0,1fr))}
        .mis-datos-form .form-group:has(#profile-bio){grid-column:1/-1}
      }
      .mis-datos-panel .profile-name-section .form-input{font-size:16px;padding:14px 16px}
      .mis-datos-panel .profile-name-section textarea.form-input{min-height:120px}
      .mis-datos-panel .profile-name-section .action-btn{margin-top:8px;padding:14px 24px;font-size:16px}
      @media (max-width:639px){.mis-datos-facts{grid-template-columns:1fr}}
      .header--mascot{display:flex;flex-wrap:wrap;align-items:center;gap:20px 32px;margin-bottom:0}
      .header__avatar{flex:0 0 auto}
      .header__avatar .profile-avatar__error{max-width:140px;font-size:12px;text-align:center}
      .header__copy{flex:1 1 240px;min-width:0}
      .header__level{flex:0 0 auto;display:flex;align-items:center;gap:14px;padding:16px 20px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;min-width:148px}
      .header__level-icon{flex-shrink:0;width:42px;height:42px;display:grid;place-items:center;border-radius:11px;background:#f5f3ff;color:#7c3aed}
      .header__level-icon svg{width:20px;height:20px}
      .header__level-body{display:flex;flex-direction:column;gap:2px;min-width:0}
      .header__level-value{font-size:1.45rem;font-weight:700;color:#0f172a;letter-spacing:-0.02em;line-height:1.15}
      .header__level-label{font-size:0.8125rem;color:#64748b;font-weight:500;line-height:1.35}
      .header__mascot{flex:0 0 auto;line-height:0;filter:drop-shadow(0 8px 18px rgba(0,0,0,.12))}

      .profile-avatar{display:flex;flex-direction:column;align-items:center;gap:6px}
      .profile-avatar__input{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      .profile-avatar__button{position:relative;display:block;padding:0;border:3px solid #0070f3;border-radius:50%;background:#e8f2ff;cursor:pointer;overflow:hidden;transition:transform .2s,box-shadow .2s}
      .profile-avatar__button:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,112,243,.28)}
      .profile-avatar__button:disabled{opacity:.75;cursor:wait}
      .profile-avatar__img{width:100%;height:100%;object-fit:cover;display:block}
      .profile-avatar__img--mascot{object-fit:contain;padding:8%;background:linear-gradient(145deg,#eef6ff 0%,#dbeafe 100%)}
      .profile-avatar__placeholder{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.65rem;font-weight:700;color:#1e40af;background:linear-gradient(145deg,#dbeafe 0%,#bfdbfe 100%)}
      .profile-avatar__overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.42);color:#fff;font-size:1.35rem;opacity:0;transition:opacity .2s}
      .profile-avatar__button:hover .profile-avatar__overlay,.profile-avatar__button:focus-visible .profile-avatar__overlay{opacity:1}
      .profile-avatar__error{margin:0;font-size:13px;color:#dc2626;text-align:center;line-height:1.4}
      .profile-avatar-row{display:flex;flex-wrap:wrap;align-items:center;gap:20px 24px;margin-bottom:20px;padding:16px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}
      .profile-avatar-row__hint{margin:0;flex:1 1 200px;font-size:14px;color:#64748b;line-height:1.5}
      
      .tabs{display:flex;flex-wrap:wrap;gap:8px;padding:16px}
      .tab{padding:12px 20px;border-radius:12px;border:1px solid #eaeaea;background:white;color:var(--text);cursor:pointer;transition:.2s;font-weight:500}
      .tab:hover{transform:translateY(-1px);border-color:#0070f3;background:#b0d6fa}
      .tab--active{background:#0070f3;border-color:transparent;color:white;box-shadow:0 8px 20px rgba(0,112,243,.35)}
      .tab--locked{opacity:.85}
      .tab--locked:not(.tab--active){background:#f8fafc;border-color:#e2e8f0;color:#64748b;cursor:not-allowed}
      .tab--locked:not(.tab--active):hover{transform:none;border-color:#e2e8f0;background:#f8fafc}
      .tab--locked.tab--active{background:#64748b;border-color:transparent;color:#fff;box-shadow:0 6px 16px rgba(100,116,139,.35);cursor:not-allowed}

      .profile-coming-soon{margin:22px 0;padding:48px 28px;border:1px dashed #c7d2fe;border-radius:16px;background:linear-gradient(180deg,#fff 0%,#f8fafc 100%);text-align:center}
      .profile-coming-soon__badge{display:inline-block;margin-bottom:12px;padding:6px 14px;border-radius:999px;background:linear-gradient(135deg,#e0e7ff 0%,#c7d2fe 100%);color:#3730a3;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
      .profile-coming-soon__title{margin:0 0 10px;font-size:22px;color:var(--text)}
      .profile-coming-soon__text{margin:0 auto;max-width:32rem;color:#64748b;line-height:1.55;font-size:15px}
      
      .profile-tab-panels{display:flex;flex-direction:column;gap:10px;margin:4px 0 28px;width:100%}
      .profile-tab-panels__charts-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .profile-section{margin:22px 0;padding:24px;border:1px solid #eaeaea;border-radius:16px;background:var(--card);box-shadow:0 2px 6px rgba(0,0,0,0.1)}
      .profile-section.profile-section--collapsible,.profile-section.profile-collapse{margin:0;padding:0;background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:12px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 4px 14px rgba(15,23,42,.04)}
      .profile-section.profile-collapse--open{border-color:rgba(0,112,243,.22);box-shadow:0 1px 2px rgba(0,112,243,.06),0 8px 24px rgba(0,112,243,.08)}
      .section-head{display:flex;align-items:center;gap:8px;margin-bottom:20px}
      
      /* Formularios */
      .form-group{margin-bottom:20px}
      .form-label{display:block;margin-bottom:8px;font-weight:600;color:var(--text)}
      .form-input{padding:12px 16px;font-size:16px;border:1px solid #eaeaea;border-radius:12px;background:white;color:var(--text);outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
      .form-input:focus{border-color:#0070f3;box-shadow:0 0 0 6px rgba(0,112,243,.35)}
      .action-btn{padding:12px 20px;background:#0070f3;color:white;font-weight:600;border:none;border-radius:12px;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 10px 24px rgba(0,112,243,.35)}
      .action-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,112,243,.4)}
      .action-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none}
      
      /* Estadísticas */
      .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .stat-card{display:flex;align-items:center;gap:16px;padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .stat-icon{font-size:32px}
      .stat-content{flex:1}
      .stat-number{font-size:24px;font-weight:700;color:var(--text);margin-bottom:4px}
      .stat-label{font-size:14px;color:#666}
      
      .study-activity-section .section-desc{margin-top:4px}
      
      /* Habilidades */
      .skills-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}
      .skill-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center;transition:transform .2s,box-shadow .2s}
      .skill-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .skill-name{font-weight:600;margin-bottom:8px;color:var(--text)}
      .skill-score{font-size:24px;font-weight:700;color:#0070f3;margin-bottom:4px}
      .skill-improvement{font-size:12px;color:#28a745;margin-bottom:4px}
      .skill-exercises{font-size:12px;color:#666}
      
      /* Gráficos */
      .empty-chart{display:grid;place-items:center;text-align:center;padding:48px;border:1px dashed #eaeaea;border-radius:16px;background:white}
      .empty-icon{font-size:36px;margin-bottom:6px}
      
      /* Badges */
      .badges-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .badge-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center;transition:transform .2s,box-shadow .2s}
      .badge-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .badge-earned{border-color:#28a745;background:linear-gradient(135deg,#d4edda,#c3e6cb)}
      .badge-locked{opacity:0.6;background:#f8f9fa}
      .badge-icon{font-size:32px;margin-bottom:8px}
      .badge-name{font-weight:600;margin-bottom:8px;color:var(--text)}
      .badge-description{font-size:14px;color:#666;margin-bottom:8px}
      .badge-date{font-size:12px;color:#28a745}
      
      /* Objetivos */
      .goals-container{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:20px}
      .goal-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white}
      .goal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .goal-header h3{margin:0;font-size:18px;color:var(--text)}
      .goal-progress{font-weight:600;color:#0070f3}
      .goal-bar{width:100%;height:8px;background:#eaeaea;border-radius:4px;overflow:hidden;margin-bottom:12px}
      .goal-fill{height:100%;background:#0070f3;transition:width .3s}
      .goal-input{padding:8px 12px;border:1px solid #eaeaea;border-radius:8px;width:80px;text-align:center}
      
      /* Settings */
      .settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px}
      .setting-item{padding:16px;border:1px solid #eaeaea;border-radius:12px;background:white}
      .setting-label{display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:500}
      .setting-label input{margin:0}
      
      .btn{margin-top:10px;padding:10px 14px;border-radius:12px;background:#0070f3;border:none;color:white;cursor:pointer;box-shadow:0 10px 24px rgba(0,112,243,.35);text-decoration:none;display:inline-block}
      .loader{width:48px;height:48px;border-radius:50%;border:3px solid rgba(0,112,243,.2);border-top-color:#0070f3;animation:spin 1s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
      
      /* Temporizador */
      .timer-container{padding:20px;background:white;border-radius:12px;text-align:center}
      .timer-display{margin-bottom:20px}
      .timer-time{font-size:48px;font-weight:700;color:#0070f3;margin-bottom:8px}
      .timer-label{font-size:16px;color:#666}
      .timer-controls{display:flex;gap:12px;justify-content:center}
      .timer-btn{padding:12px 24px;border:none;border-radius:12px;font-weight:600;cursor:pointer;transition:transform .2s,box-shadow .2s}
      .timer-start{background:#28a745;color:white}
      .timer-stop{background:#dc3545;color:white}
      .timer-reset{background:#6c757d;color:white}
      .timer-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.2)}
      
      /* Notas de estudio */
      .add-note-btn{padding:8px 16px;background:#0070f3;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;margin-left:auto}
      .notes-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
      .note-card{padding:16px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .note-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .note-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .note-title-input{font-size:18px;font-weight:600;border:none;background:transparent;color:var(--text);outline:none;flex:1}
      .delete-note-btn{background:none;border:none;cursor:pointer;font-size:16px}
      .note-content-input{width:100%;border:none;background:transparent;color:var(--text);outline:none;resize:vertical;font-family:inherit;margin-bottom:12px}
      .note-footer{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#666}
      .note-tags{display:flex;gap:4px}
      .note-tag{padding:2px 6px;background:#e9ecef;border-radius:4px;font-size:10px}
      
      /* Exercises favoritos */
      .favorites-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
      .favorite-card{padding:16px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .favorite-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .favorite-title{font-weight:600;margin-bottom:8px;color:var(--text)}
      .favorite-type{font-size:14px;color:#666;margin-bottom:4px}
      .favorite-difficulty{font-size:14px;color:#0070f3;margin-bottom:4px}
      .favorite-last-used{font-size:12px;color:#666;margin-bottom:12px}
      .remove-favorite-btn{padding:6px 12px;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px}
      
      /* Historial de estudio */
      .history-table{background:white;border-radius:12px;overflow:hidden}
      .history-header{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;background:#f8f9fa;padding:12px;font-weight:600;color:var(--text)}
      .history-row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;padding:12px;border-bottom:1px solid #eaeaea;transition:background .2s}
      .history-row:hover{background:#f8f9fa}
      .history-row:last-child{border-bottom:none}
      .score{padding:4px 8px;border-radius:4px;font-weight:600;text-align:center}
      .score-good{background:#d4edda;color:#155724}
      .score-medium{background:#fff3cd;color:#856404}
      .score-low{background:#f8d7da;color:#721c24}
      
      /* Comparación de progreso */
      .comparison-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .comparison-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center;transition:transform .2s,box-shadow .2s}
      .comparison-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .comparison-label{font-size:14px;color:#666;margin-bottom:8px}
      .comparison-value{font-size:24px;font-weight:700;color:#0070f3}
      
      /* Grupos de estudio */
      .groups-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
      .group-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .group-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .group-name{font-weight:600;margin-bottom:8px;color:var(--text)}
      .group-members{font-size:14px;color:#666;margin-bottom:4px}
      .group-level{font-size:14px;color:#0070f3;margin-bottom:4px}
      .group-activity{font-size:12px;color:#666;margin-bottom:12px}
      .join-group-btn{padding:8px 16px;background:#0070f3;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px}
      
      /* Desafíos semanales */
      .challenges-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
      .challenge-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .challenge-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .challenge-title{font-weight:600;margin-bottom:8px;color:var(--text)}
      .challenge-description{font-size:14px;color:#666;margin-bottom:12px}
      .challenge-progress{margin-bottom:12px}
      .progress-bar{width:100%;height:8px;background:#eaeaea;border-radius:4px;overflow:hidden;margin-bottom:4px}
      .progress-fill{height:100%;background:#0070f3;transition:width .3s}
      .progress-text{font-size:12px;color:#666;text-align:center}
      .challenge-reward{font-size:12px;color:#28a745;margin-bottom:4px}
      .challenge-deadline{font-size:12px;color:#666}
      
      /* Recomendaciones */
      .recommendations-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
      .recommendation-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .recommendation-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .recommendation-card.priority-high{border-left:4px solid #dc3545}
      .recommendation-card.priority-medium{border-left:4px solid #ffc107}
      .recommendation-card.priority-low{border-left:4px solid #28a745}
      .recommendation-type{font-size:12px;color:#666;margin-bottom:4px}
      .recommendation-skill{font-weight:600;margin-bottom:8px;color:var(--text)}
      .recommendation-message{font-size:14px;color:#666;margin-bottom:8px}
      .recommendation-priority{font-size:12px;color:#666}
      
      /* Progreso de logros */
      .achievement-progress-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
      .achievement-progress-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .achievement-progress-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .achievement-name{font-weight:600;margin-bottom:8px;color:var(--text)}
      .achievement-description{font-size:14px;color:#666;margin-bottom:12px}
      .achievement-progress-bar{width:100%;height:8px;background:#eaeaea;border-radius:4px;overflow:hidden;margin-bottom:8px}
      .achievement-progress-fill{height:100%;background:#0070f3;transition:width .3s}
      .achievement-progress-text{font-size:12px;color:#666;text-align:center}
      
      /* Calendario */
      .calendar-container{padding:20px;background:white;border-radius:12px}
      .calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
      .calendar-day{padding:12px;border:1px solid #eaeaea;border-radius:8px;min-height:80px;background:white;transition:transform .2s,box-shadow .2s}
      .calendar-day:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.1)}
      .calendar-day.has-events{border-color:#0070f3;background:#f8f9ff}
      .day-number{font-weight:600;margin-bottom:4px;color:var(--text)}
      .day-events{display:flex;flex-direction:column;gap:2px}
      .day-event{padding:2px 4px;border-radius:4px;font-size:10px;color:white}
      .day-event.study{background:#0070f3}
      .day-event.quiz{background:#28a745}
      
      /* Estadísticas avanzadas */
      .advanced-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .stat-item{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center;transition:transform .2s,box-shadow .2s}
      .stat-item:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .stat-label{font-size:14px;color:#666;margin-bottom:8px}
      .stat-value{font-size:24px;font-weight:700;color:#0070f3}
      
      /* Responsive */
      @media (max-width: 768px) {
        .tabs{flex-direction:column}
        .tab{text-align:center}
        .stats-grid{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
        .profile-tab-panels__charts-row{grid-template-columns:1fr}
        .skills-grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}
        .badges-grid{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
        .goals-container{grid-template-columns:1fr}
        .timer-controls{flex-direction:column}
        .notes-grid{grid-template-columns:1fr}
        .favorites-grid{grid-template-columns:1fr}
        .history-header,.history-row{grid-template-columns:1fr;gap:8px}
        .comparison-stats{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
        .groups-grid{grid-template-columns:1fr}
        .challenges-grid{grid-template-columns:1fr}
        .recommendations-grid{grid-template-columns:1fr}
        .achievement-progress-grid{grid-template-columns:1fr}
        .calendar-grid{grid-template-columns:repeat(3,1fr)}
        .advanced-stats{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
      }
      
      /* IA Tools */
      .ai-insights-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
      .ai-insight-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .ai-insight-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .ai-insight-card.performance{border-left:4px solid #28a745}
      .ai-insight-card.weakness{border-left:4px solid #dc3545}
      .ai-insight-card.strength{border-left:4px solid #0070f3}
      .insight-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .insight-title{font-weight:600;color:var(--text)}
      .insight-confidence{font-size:12px;color:#666;background:#f8f9fa;padding:4px 8px;border-radius:4px}
      .insight-description{font-size:14px;color:#666;margin-bottom:12px}
      .insight-type-badge{font-size:12px;color:#666;background:#e9ecef;padding:4px 8px;border-radius:4px;display:inline-block}
      
      /* Plan de estudio */
      .study-plan-container{display:grid;grid-template-columns:1fr 1fr;gap:24px}
      .plan-overview{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
      .plan-item{padding:16px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center}
      .plan-label{font-size:14px;color:#666;margin-bottom:8px}
      .plan-value{font-size:24px;font-weight:700;color:#0070f3}
      .next-session{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white}
      .next-session h3{margin:0 0 16px;color:var(--text)}
      .session-title{font-weight:600;margin-bottom:8px;color:var(--text)}
      .session-details{display:flex;gap:16px;margin-bottom:12px;font-size:14px;color:#666}
      .session-topics{display:flex;gap:8px;flex-wrap:wrap}
      .topic-tag{padding:4px 8px;background:#e9ecef;border-radius:4px;font-size:12px;color:#666}
      
      /* Música */
      .music-player{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white}
      .current-track{padding:16px;background:#f8f9fa;border-radius:8px;margin-bottom:16px}
      .track-info{text-align:center}
      .track-name{font-weight:600;margin-bottom:4px;color:var(--text)}
      .track-artist{font-size:14px;color:#666;margin-bottom:4px}
      .track-duration{font-size:12px;color:#666}
      .no-track{text-align:center;color:#666;font-style:italic}
      .music-controls{text-align:center;margin-bottom:20px}
      .music-btn{padding:12px 24px;background:#0070f3;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600}
      .music-tracks{display:flex;flex-direction:column;gap:8px}
      .track-item{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #eaeaea;border-radius:8px;background:white}
      .track-details{flex:1}
      .track-name{font-weight:600;margin-bottom:2px;color:var(--text)}
      .track-artist{font-size:14px;color:#666;margin-bottom:2px}
      .track-genre{font-size:12px;color:#666}
      .play-track-btn{padding:6px 12px;background:#28a745;color:white;border:none;border-radius:6px;cursor:pointer}
      
      /* Metas de estudio */
      .goals-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
      .goal-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .goal-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .goal-card.high{border-left:4px solid #dc3545}
      .goal-card.medium{border-left:4px solid #ffc107}
      .goal-card.low{border-left:4px solid #28a745}
      .goal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .goal-title{font-weight:600;color:var(--text)}
      .goal-priority{font-size:12px;padding:4px 8px;border-radius:4px;background:#e9ecef;color:#666}
      .goal-description{font-size:14px;color:#666;margin-bottom:12px}
      .goal-progress-bar{width:100%;height:8px;background:#eaeaea;border-radius:4px;overflow:hidden;margin-bottom:8px}
      .goal-progress-fill{height:100%;background:#0070f3;transition:width .3s}
      .goal-progress-text{font-size:12px;color:#666;text-align:center}
      .goal-deadline{font-size:12px;color:#666;text-align:center}
      
      /* Hábitos */
      .habits-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
      .habit-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .habit-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .habit-name{font-weight:600;margin-bottom:8px;color:var(--text)}
      .habit-frequency{font-size:14px;color:#666;margin-bottom:4px}
      .habit-streak{font-size:14px;color:#0070f3;margin-bottom:4px}
      .habit-difficulty{font-size:12px;color:#666;margin-bottom:12px}
      .streak-bar{width:100%;height:6px;background:#eaeaea;border-radius:3px;overflow:hidden}
      .streak-fill{height:100%;background:#28a745;transition:width .3s}
      
      /* Progreso detallado */
      .progress-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .progress-item{display:flex;align-items:center;gap:16px;padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .progress-item:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .progress-icon{font-size:32px}
      .progress-content{flex:1}
      .progress-label{font-size:14px;color:#666;margin-bottom:4px}
      .progress-value{font-size:24px;font-weight:700;color:#0070f3}
      
      /* Recompensas */
      .rewards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .reward-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center;transition:transform .2s,box-shadow .2s}
      .reward-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .reward-card.earned{border-color:#28a745;background:linear-gradient(135deg,#d4edda,#c3e6cb)}
      .reward-card.locked{opacity:0.6;background:#f8f9fa}
      .reward-icon{font-size:32px;margin-bottom:8px}
      .reward-name{font-weight:600;margin-bottom:8px;color:var(--text)}
      .reward-description{font-size:14px;color:#666;margin-bottom:8px}
      .reward-points{font-size:12px;color:#0070f3;margin-bottom:12px}
      .claim-btn{padding:8px 16px;background:#0070f3;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px}
      
      /* Desafíos especiales */
      .challenges-special-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
      .challenge-special-card{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center;transition:transform .2s,box-shadow .2s}
      .challenge-special-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .challenge-special-card.hard{border-color:#dc3545}
      .challenge-special-card.medium{border-color:#ffc107}
      .challenge-special-card.easy{border-color:#28a745}
      .challenge-icon{font-size:32px;margin-bottom:8px}
      .challenge-title{font-weight:600;margin-bottom:8px;color:var(--text)}
      .challenge-description{font-size:14px;color:#666;margin-bottom:8px}
      .challenge-reward{font-size:12px;color:#28a745;margin-bottom:4px}
      .challenge-difficulty{font-size:12px;color:#666;margin-bottom:12px}
      .start-challenge-btn{padding:8px 16px;background:#0070f3;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px}
      
      /* Tabla de clasificación */
      .leaderboard{background:white;border-radius:12px;overflow:hidden}
      .leaderboard-header{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;background:#f8f9fa;padding:12px;font-weight:600;color:var(--text)}
      .leaderboard-row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;padding:12px;border-bottom:1px solid #eaeaea;transition:background .2s}
      .leaderboard-row:hover{background:#f8f9fa}
      .leaderboard-row.current-user{background:#e3f2fd;border-left:4px solid #0070f3}
      .leaderboard-row:last-child{border-bottom:none}
      .rank{font-weight:600;color:#0070f3}
      .player-name{font-weight:600;color:var(--text)}
      .player-score{color:#28a745;font-weight:600}
      .player-level{color:#666}
      .player-streak{color:#ffc107;font-weight:600}
      
      /* Motivación */
      .motivation-container{display:grid;grid-template-columns:1fr 2fr 1fr;gap:24px}
      .motivation-level{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center}
      .motivation-label{font-size:14px;color:#666;margin-bottom:8px}
      .motivation-value{font-size:36px;font-weight:700;color:#0070f3;margin-bottom:4px}
      .motivation-change{font-size:12px;color:#28a745}
      .motivational-quote{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center}
      .quote-text{font-size:16px;font-style:italic;color:var(--text);line-height:1.5}
      .next-milestone{padding:20px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center}
      .milestone-label{font-size:14px;color:#666;margin-bottom:8px}
      .milestone-text{font-weight:600;margin-bottom:12px;color:var(--text)}
      .milestone-progress{width:100%;height:8px;background:#eaeaea;border-radius:4px;overflow:hidden;margin-bottom:8px}
      .milestone-fill{height:100%;background:#0070f3;transition:width .3s}
      .milestone-percentage{font-size:12px;color:#666}
      
      /* Chat */
      .chat-container{border:1px solid #eaeaea;border-radius:12px;background:white;overflow:hidden}
      .chat-messages{height:300px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
      .chat-message{padding:12px;border-radius:8px;max-width:80%}
      .own-message{background:#0070f3;color:white;margin-left:auto}
      .other-message{background:#f8f9fa;color:var(--text)}
      .message-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:12px}
      .message-user{font-weight:600}
      .message-time{opacity:0.7}
      .message-content{margin-bottom:4px}
      .message-group{font-size:10px;opacity:0.7}
      .chat-input{display:flex;gap:8px;padding:16px;border-top:1px solid #eaeaea}
      .message-input{flex:1;padding:8px 12px;border:1px solid #eaeaea;border-radius:8px;outline:none}
      .send-btn{padding:8px 12px;background:#0070f3;color:white;border:none;border-radius:8px;cursor:pointer}
      
      /* Flashcards */
      .add-flashcard-btn{padding:8px 16px;background:#0070f3;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;margin-left:auto}
      .flashcards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
      .flashcard{padding:16px;border:1px solid #eaeaea;border-radius:12px;background:white;transition:transform .2s,box-shadow .2s}
      .flashcard:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .flashcard-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .flashcard-category{font-size:12px;background:#e9ecef;padding:4px 8px;border-radius:4px;color:#666}
      .flashcard-difficulty{font-size:12px;color:#666}
      .delete-flashcard-btn{background:none;border:none;cursor:pointer;font-size:16px}
      .flashcard-content{margin-bottom:12px}
      .flashcard-front{margin-bottom:8px}
      .flashcard-input{width:100%;padding:8px;border:1px solid #eaeaea;border-radius:6px;font-weight:600;outline:none}
      .flashcard-textarea{width:100%;padding:8px;border:1px solid #eaeaea;border-radius:6px;outline:none;resize:vertical;font-family:inherit}
      .flashcard-stats{display:flex;gap:12px;font-size:12px;color:#666}
      .stat{background:#f8f9fa;padding:4px 8px;border-radius:4px}
      
      /* Temas */
      .themes-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}
      .theme-card{padding:16px;border:1px solid #eaeaea;border-radius:12px;background:white;text-align:center;cursor:pointer;transition:transform .2s,box-shadow .2s}
      .theme-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)}
      .theme-card.active{border-color:#0070f3;background:#f8f9ff}
      .theme-preview{width:100%;height:60px;border-radius:8px;margin-bottom:8px}
      .theme-name{font-weight:600;margin-bottom:4px;color:var(--text)}
      .theme-active{font-size:12px;color:#0070f3;font-weight:600}
      
      /* Responsive adicional */
      @media (max-width: 768px) {
        .study-plan-container{grid-template-columns:1fr}
        .plan-overview{grid-template-columns:1fr}
        .motivation-container{grid-template-columns:1fr}
        .leaderboard-header,.leaderboard-row{grid-template-columns:1fr;gap:8px}
        .chat-message{max-width:100%}
        .flashcards-grid{grid-template-columns:1fr}
        .themes-grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}
      }

      /* Estilos para componentes integrados */
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin: 20px 0;
      }

      .metric-card {
        padding: 20px;
        border: 1px solid #eaeaea;
        border-radius: 12px;
        background: white;
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }

      .metric-icon {
        font-size: 2rem;
        margin-bottom: 8px;
      }

      .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #0070f3;
        margin-bottom: 4px;
      }

      .metric-label {
        font-size: 0.9rem;
        color: #666;
      }

      .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin: 20px 0;
      }

      .achievement-card {
        padding: 16px;
        border: 1px solid #eaeaea;
        border-radius: 12px;
        background: white;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .achievement-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }

      .achievement-icon {
        font-size: 2rem;
        margin-bottom: 8px;
        text-align: center;
      }

      .achievement-title {
        font-weight: bold;
        color: var(--text);
        margin-bottom: 4px;
        text-align: center;
      }

      .achievement-description {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 8px;
        text-align: center;
      }

      .achievement-points {
        font-size: 0.8rem;
        color: #28a745;
        font-weight: bold;
        text-align: center;
        background: #f8f9fa;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .skill-analysis {
        display: grid;
        gap: 16px;
        margin: 20px 0;
      }

      .skill-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid #eaeaea;
        border-radius: 12px;
        background: white;
      }

      .skill-name {
        min-width: 100px;
        font-weight: bold;
        color: var(--text);
      }

      .skill-progress {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .progress-bar {
        flex: 1;
        height: 8px;
        background: #f0f0f0;
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #0070f3, #28a745);
        transition: width 0.3s ease;
      }

      .progress-text {
        min-width: 40px;
        font-weight: bold;
        color: var(--text);
        text-align: right;
      }

      /* Responsive para componentes integrados */
      @media (max-width: 768px) {
        .metrics-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
        
        .achievements-grid {
          grid-template-columns: 1fr;
        }
        
        .skill-item {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }
        
        .skill-name {
          min-width: auto;
          text-align: center;
        }
      }
    `}</style>
  );
}
