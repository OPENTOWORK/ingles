'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { performLogout } from '@/utils/logout';
import { useUserRole } from '@/context/UserRoleContext';
import { getUserProgress } from '@/utils/getUserProgress';
import AchievementNotification from '@/components/AchievementNotification';

const ProgressDashboard = dynamic(() => import('@/components/ProgressDashboard'), {
  ssr: false,
});
const AdaptiveLearningDashboard = dynamic(
  () => import('@/components/AdaptiveLearningDashboard'),
  { ssr: false },
);
const ExamStatistics = dynamic(() => import('@/components/ExamStatistics'), { ssr: false });
const LevelsEstadisticasPanel = dynamic(
  () => import('@/components/LevelsEstadisticasPanel'),
  { ssr: false },
);
import ProfileComingSoon from '@/components/perfil/ProfileComingSoon';
import ProfilePrivateTutorPanel from '@/components/perfil/ProfilePrivateTutorPanel';
import ProfileTabsNav from '@/components/perfil/ProfileTabsNav';

const ProfileExamDatesPanel = dynamic(
  () => import('@/components/perfil/ProfileExamDatesPanel'),
  {
    ssr: false,
    loading: () => (
      <div className="profile-section">
        <p className="section-desc">Cargando fechas de examen…</p>
      </div>
    ),
  },
);

const StudyActivityHeatmap = dynamic(
  () => import('@/components/perfil/StudyActivityHeatmap'),
  {
    ssr: false,
    loading: () => (
      <div className="profile-section">
        <p className="section-desc">Cargando actividad de estudio…</p>
      </div>
    ),
  },
);

const ProfileGeneralStats = dynamic(
  () => import('@/components/perfil/ProfileGeneralStats'),
  { ssr: false },
);

const ProfileSkillAnalysis = dynamic(
  () => import('@/components/perfil/ProfileSkillAnalysis'),
  { ssr: false },
);

const ProfileAchievementsCarousel = dynamic(
  () => import('@/components/perfil/ProfileAchievementsCarousel'),
  { ssr: false },
);

const ProfileGoalsPanel = dynamic(
  () => import('@/components/perfil/ProfileGoalsPanel'),
  { ssr: false },
);
import SiteMascot from '@/components/SiteMascot';
import { offlineFirstDatabase } from '@/utils/offlineFirstDatabase';
import { progressTracker } from '@/utils/progressTracker';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell,
  BarChart, Bar, AreaChart, Area
} from 'recharts';

const PROFILE_TABS = [
  { id: 'overview', label: '📊 Resumen', studentAllowed: true },
  { id: 'mis-datos', label: '👤 Mis datos', studentAllowed: true },
  { id: 'progress', label: '📈 Progreso' },
  { id: 'achievements', label: '🏆 Logros' },
  { id: 'goals', label: '🎯 Objetivos' },
  { id: 'integrated', label: '🔗 Estadísticas Integradas' },
  { id: 'settings', label: '⚙️ Configuración' },
  { id: 'study-tools', label: '🛠️ Herramientas' },
  { id: 'social', label: '👥 Social' },
  { id: 'analytics', label: '📊 Analytics' },
  { id: 'ai-tools', label: '🤖 IA Tools' },
  { id: 'study-planner', label: '📅 Planificador' },
  { id: 'gamification', label: '🎮 Gamificación' },
  { id: 'community', label: '🌐 Comunidad' },
  { id: 'exam-dates', label: '📅 Fechas de examen' },
  { id: 'private-tutor', label: '👨‍🏫 Consigue tu profesor particular' },
];

const PROFILE_TAB_LABELS = Object.fromEntries(
  PROFILE_TABS.map((t) => [t.id, t.label.replace(/^[^\s]+\s/, '')]),
);

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
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
  const [studyNotes, setStudyNotes] = useState([]);
  const [studyTimer, setStudyTimer] = useState({ isRunning: false, time: 0, sessionTime: 0 });
  const [studyHistory, setStudyHistory] = useState([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [studyRecommendations, setStudyRecommendations] = useState([]);
  const [studyCalendar, setStudyCalendar] = useState([]);
  const [progressComparison, setProgressComparison] = useState({});
  const [favoriteExercises, setFavoriteExercises] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [studyPlan, setStudyPlan] = useState({});
  const [studyMusic, setStudyMusic] = useState({ isPlaying: false, currentTrack: null });
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

  // Función para cargar estadísticas integradas
  const loadIntegratedStats = async (userId) => {
    try {
      // Cargar datos del sistema offline-first
      const [progressData, achievements, overallProgress] = await Promise.all([
        offlineFirstDatabase.getUserProgress(userId),
        offlineFirstDatabase.getUserAchievements(userId),
        offlineFirstDatabase.getUserOverallProgress(userId)
      ]);

      // Cargar datos adaptativos
      const adaptiveData = await progressTracker.getUserSkillProgress(userId, 'A2', 'listening', 'basico');

      setIntegratedStats({
        progressData,
        adaptiveData,
        achievements,
        audioHistory: [], // Se puede implementar después
        performanceMetrics: {
          totalExercises: progressData?.length || 0,
          totalScore: progressData?.reduce((sum, p) => sum + p.score, 0) || 0,
          averageScore: progressData?.length > 0 ? Math.round(progressData.reduce((sum, p) => sum + p.score, 0) / progressData.length) : 0,
          totalTime: progressData?.reduce((sum, p) => sum + p.time_spent, 0) || 0
        }
      });
    } catch (error) {
      console.warn('Error loading integrated stats:', error);
    }
  };
  const [studyGoals, setStudyGoals] = useState([]);
  const [studyHabits, setStudyHabits] = useState([]);
  const [studyMotivation, setStudyMotivation] = useState({});
  const [studyProgress, setStudyProgress] = useState({});
  const [studyChallenges, setStudyChallenges] = useState([]);
  const [studyLeaderboard, setStudyLeaderboard] = useState([]);
  const router = useRouter();
  const { userRole, session: layoutSession } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';

  useEffect(() => {
    const fetchData = async () => {
      const { user: authUser } = await getClientAuth();
      if (!authUser) {
        router.replace('/login');
        return;
      }

      setUser(authUser);

      const userId = authUser.id;
      const [{ data: userRow }, { data: profileRow }, { data: preferencesRow }] = await Promise.all([
        supabase.from('user_profiles').select('nombre, email').eq('id', userId).single(),
        supabase
          .from('profiles')
          .select('id, user_id, fecha_nacimiento, idioma_preferido, biografia')
          .eq('user_id', userId)
          .single(),
        supabase.from('user_preferences').select('notificaciones, recordatorios').eq('user_id', userId).single(),
      ]);

      const localSettings = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem(`profile_settings_${authUser.id}`) || '{}')
        : {};
      setFullName(userRow?.nombre || authUser?.user_metadata?.name || '');
      setBirthDate(profileRow?.fecha_nacimiento || '');
      setNotifications({
        email: Boolean(preferencesRow?.notificaciones ?? true),
        push: Boolean(preferencesRow?.recordatorios ?? true),
      });
      setTheme(localSettings?.theme || 'light');

      await Promise.all([
        getUserProgress(authUser.id).then((userProgress) => {
          setStats(userProgress);
        }),
        loadIntegratedStats(authUser.id),
      ]);

      // Simular datos adicionales (en una app real vendrían de la BD)
      // Análisis por habilidades
      // Notas de estudio
      setStudyNotes([
        { id: 1, title: 'Present Perfect vs Past Simple', content: 'Remember: Present Perfect for unfinished time, Past Simple for finished time', date: '2024-01-15', tags: ['grammar', 'tenses'] },
        { id: 2, title: 'Phrasal Verbs List', content: 'Look up, look after, look forward to, look into', date: '2024-01-14', tags: ['vocabulary', 'phrasal-verbs'] },
        { id: 3, title: 'Writing Structure', content: 'Introduction -> Body paragraphs -> Conclusion', date: '2024-01-13', tags: ['writing', 'structure'] }
      ]);

      // Historial de estudio
      setStudyHistory([
        { date: '2024-01-15', duration: 45, exercises: 12, score: 85, type: 'Grammar Practice' },
        { date: '2024-01-14', duration: 30, exercises: 8, score: 92, type: 'Reading Comprehension' },
        { date: '2024-01-13', duration: 60, exercises: 15, score: 78, type: 'Writing Practice' },
        { date: '2024-01-12', duration: 25, exercises: 6, score: 88, type: 'Vocabulary Quiz' },
        { date: '2024-01-11', duration: 40, exercises: 10, score: 90, type: 'Listening Test' }
      ]);

      // Desafíos semanales
      setWeeklyChallenges([
        { id: 1, title: 'Grammar Master', description: 'Complete 20 grammar exercises', progress: 15, target: 20, reward: 'Grammar Badge', deadline: '2024-01-21' },
        { id: 2, title: 'Vocabulary Builder', description: 'Learn 50 new words', progress: 32, target: 50, reward: 'Vocabulary Badge', deadline: '2024-01-21' },
        { id: 3, title: 'Speed Reader', description: 'Complete 5 reading exercises in under 30 minutes', progress: 3, target: 5, reward: 'Speed Badge', deadline: '2024-01-21' }
      ]);

      // Recomendaciones de estudio
      setStudyRecommendations([
        { type: 'weakness', skill: 'Speaking', message: 'Your speaking score is lower. Try more speaking exercises!', priority: 'high' },
        { type: 'strength', skill: 'Listening', message: 'Great listening skills! Consider advanced listening materials.', priority: 'medium' },
        { type: 'improvement', skill: 'Writing', message: 'Writing improved 8% this week. Keep practicing!', priority: 'low' }
      ]);

      // Calendario de estudio
      const calendarData = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const hasEvent = Math.random() > 0.7;
        if (hasEvent) {
          calendarData.push({
            date: date.toISOString().split('T')[0],
            events: [
              { title: 'Grammar Review', time: '10:00', type: 'study' },
              { title: 'Vocabulary Quiz', time: '15:00', type: 'quiz' }
            ]
          });
        }
      }
      setStudyCalendar(calendarData);

      // Comparación de progreso
      setProgressComparison({
        userScore: 85,
        averageScore: 72,
        percentile: 78,
        rank: 'Top 25%',
        improvement: '+12%'
      });

      // Ejercicios favoritos
      setFavoriteExercises([
        { id: 1, title: 'Present Perfect Practice', type: 'Grammar', difficulty: 'Medium', lastUsed: '2024-01-15' },
        { id: 2, title: 'Business Vocabulary', type: 'Vocabulary', difficulty: 'Hard', lastUsed: '2024-01-14' },
        { id: 3, title: 'Listening Comprehension', type: 'Listening', difficulty: 'Easy', lastUsed: '2024-01-13' }
      ]);

      // Grupos de estudio
      setStudyGroups([
        { id: 1, name: 'Advanced English Learners', members: 24, level: 'B2-C1', lastActivity: '2 hours ago' },
        { id: 2, name: 'Grammar Enthusiasts', members: 18, level: 'All Levels', lastActivity: '1 day ago' }
      ]);

      // Progreso de logros
      setAchievementProgress({
        'Grammar Guru': { current: 45, target: 50, description: 'Complete 50 grammar exercises' },
        'Speed Demon': { current: 2, target: 5, description: 'Complete 5 exams under 30 minutes' },
        'Perfectionist': { current: 0, target: 1, description: 'Get 100% on any exam' }
      });

      // Tarjetas de memoria (Flashcards)
      setFlashcards([
        { id: 1, front: 'Serendipity', back: 'The occurrence of events by chance in a happy way', category: 'Vocabulary', difficulty: 'Hard', reviewed: 3, correct: 2 },
        { id: 2, front: 'Present Perfect', back: 'Used for actions that started in the past and continue to the present', category: 'Grammar', difficulty: 'Medium', reviewed: 5, correct: 4 },
        { id: 3, front: 'Ubiquitous', back: 'Present, appearing, or found everywhere', category: 'Vocabulary', difficulty: 'Hard', reviewed: 2, correct: 1 },
        { id: 4, front: 'Phrasal Verb: Look up', back: 'To search for information in a book or on a computer', category: 'Grammar', difficulty: 'Easy', reviewed: 7, correct: 6 }
      ]);

      // Plan de estudio inteligente
      setStudyPlan({
        dailyGoal: 60, // minutos
        weeklyGoal: 420, // minutos
        currentStreak: 7,
        nextSession: 'Grammar Review',
        estimatedTime: 25,
        difficulty: 'Medium',
        topics: ['Present Perfect', 'Vocabulary', 'Reading Comprehension']
      });

      // Música de estudio
      setStudyMusic({
        isPlaying: false,
        currentTrack: null,
        tracks: [
          { id: 1, name: 'Focus Flow', artist: 'Study Beats', duration: '2:30:00', genre: 'Ambient' },
          { id: 2, name: 'Concentration', artist: 'Brain Waves', duration: '1:45:00', genre: 'Classical' },
          { id: 3, name: 'Deep Focus', artist: 'Study Music', duration: '3:00:00', genre: 'Electronic' }
        ]
      });

      // Chat de grupos
      setGroupChat([
        { id: 1, user: 'Maria', message: 'Anyone up for a grammar challenge?', time: '2 min ago', group: 'Advanced English Learners' },
        { id: 2, user: 'John', message: 'Great job on the vocabulary quiz!', time: '5 min ago', group: 'Grammar Enthusiasts' },
        { id: 3, user: 'Sarah', message: 'Study session at 3 PM today?', time: '10 min ago', group: 'Advanced English Learners' }
      ]);

      // Rachas avanzadas
      setStudyStreaks({
        current: 7,
        longest: 15,
        weekly: 5,
        monthly: 22,
        total: 156
      });

      // Recompensas
      setStudyRewards([
        { id: 1, name: 'Coffee Break', description: 'Unlock after 30 minutes of study', earned: true, points: 50 },
        { id: 2, name: 'Study Buddy', description: 'Invite a friend to study together', earned: false, points: 100 },
        { id: 3, name: 'Night Owl', description: 'Study after 10 PM', earned: true, points: 75 },
        { id: 4, name: 'Early Bird', description: 'Study before 7 AM', earned: false, points: 100 }
      ]);

      // Temas visuales
      setStudyThemes({
        current: 'default',
        available: [
          { id: 'default', name: 'Default', colors: { primary: '#0070f3', secondary: '#eaeaea' } },
          { id: 'dark', name: 'Dark Mode', colors: { primary: '#00d4ff', secondary: '#1a1a1a' } },
          { id: 'nature', name: 'Nature', colors: { primary: '#28a745', secondary: '#f8f9fa' } },
          { id: 'sunset', name: 'Sunset', colors: { primary: '#ff6b35', secondary: '#fff5f5' } }
        ]
      });

      // Insights de IA
      setAiInsights([
        { id: 1, type: 'performance', title: 'Peak Performance Time', description: 'You perform best between 10 AM - 12 PM', confidence: 85 },
        { id: 2, type: 'weakness', title: 'Grammar Focus Needed', description: 'Spend 20% more time on grammar exercises', confidence: 92 },
        { id: 3, type: 'strength', title: 'Vocabulary Master', description: 'Your vocabulary is improving 15% faster than average', confidence: 78 }
      ]);

      // Metas de estudio
      setStudyGoals([
        { id: 1, title: 'Complete B2 Level', description: 'Finish all B2 exercises', progress: 65, deadline: '2024-03-15', priority: 'high' },
        { id: 2, title: 'Daily Study Habit', description: 'Study 30 minutes every day', progress: 80, deadline: '2024-02-28', priority: 'medium' },
        { id: 3, title: 'Grammar Mastery', description: 'Achieve 90% in grammar tests', progress: 45, deadline: '2024-04-01', priority: 'high' }
      ]);

      // Hábitos de estudio
      setStudyHabits([
        { id: 1, name: 'Morning Review', frequency: 'Daily', streak: 12, difficulty: 'Easy' },
        { id: 2, name: 'Vocabulary Practice', frequency: '3x/week', streak: 8, difficulty: 'Medium' },
        { id: 3, name: 'Grammar Focus', frequency: '2x/week', streak: 5, difficulty: 'Hard' }
      ]);

      // Motivación
      setStudyMotivation({
        currentLevel: 85,
        weeklyChange: 12,
        motivationalQuote: 'Every expert was once a beginner. Every pro was once an amateur.',
        nextMilestone: '100 hours of study',
        progressToMilestone: 78
      });

      // Progreso detallado
      setStudyProgress({
        totalHours: 78,
        averageSession: 42,
        improvementRate: 15,
        consistency: 85,
        focusScore: 92
      });

      // Desafíos especiales
      setStudyChallenges([
        { id: 1, title: 'Speed Challenge', description: 'Complete 10 exercises in 15 minutes', reward: 'Speed Badge', difficulty: 'Hard' },
        { id: 2, title: 'Accuracy Challenge', description: 'Get 95% accuracy in 5 consecutive tests', reward: 'Precision Badge', difficulty: 'Medium' },
        { id: 3, title: 'Endurance Challenge', description: 'Study for 2 hours straight', reward: 'Marathon Badge', difficulty: 'Hard' }
      ]);

      // Tabla de clasificación
      setStudyLeaderboard([
        { rank: 1, name: 'Maria', score: 1250, level: 'C1', streak: 12 },
        { rank: 2, name: 'John', score: 1180, level: 'B2', streak: 8 },
        { rank: 3, name: 'Sarah', score: 1100, level: 'B2', streak: 15 },
        { rank: 4, name: 'You', score: 950, level: 'B1', streak: 7 },
        { rank: 5, name: 'Alex', score: 890, level: 'B1', streak: 5 }
      ]);

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    void performLogout();
  };

  const handleSaveProfileName = async () => {
    const trimmed = (fullName || '').trim();
    if (!trimmed) {
      setNameSaveError('Introduce un nombre para tu perfil.');
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
      setNameSaveError('No se pudo guardar el nombre. Inténtalo de nuevo.');
      setSaving(false);
      return false;
    }

    try {
      await supabase.auth.updateUser({ data: { name: trimmed } });
    } catch (authError) {
      console.warn('Could not sync auth metadata name:', authError);
    }

    setFullName(trimmed);
    setNameSaveMessage('Nombre actualizado correctamente.');
    setSaving(false);
    return true;
  };

  const handleProfileUpdate = async () => {
    const nameOk = await handleSaveProfileName();
    if (!nameOk) return;

    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      fecha_nacimiento: birthDate || null,
    });
    setSaving(false);

    if (error) {
      console.error('Error saving profile details:', error);
      setNameSaveError('El nombre se guardó, pero hubo un error al guardar la fecha de nacimiento.');
    }
  };

  const handlePasswordChange = async () => {
    const passwordIsStrong =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /\d/.test(newPassword);

    if (!passwordIsStrong) {
      alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert('Error changing password');
    else alert('Password updated successfully');
  };

  const handleSendDeleteCode = async () => {
    if (!user?.email) {
      alert('No se pudo detectar tu email para enviar el codigo.');
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
      alert('Te hemos enviado un codigo de 6 cifras al correo para confirmar la eliminacion.');
    } catch (error) {
      console.error('Error sending delete code:', error);
      alert(error.message || 'No se pudo enviar el codigo de verificacion.');
    } finally {
      setSendingDeleteCode(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      alert('No se pudo identificar tu cuenta.');
      return;
    }
    if (!deleteCode || deleteCode.length !== 6) {
      alert('Introduce el codigo de 6 cifras recibido por email.');
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
        throw new Error('Codigo no valido o caducado. Solicita uno nuevo.');
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
      alert('Cuenta eliminada correctamente.');
      router.push('/registro');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.message || 'No se pudo eliminar la cuenta.');
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
      alert('Introduce un email válido para la invitación.');
      return;
    }
    if (!user?.id) {
      alert('No se pudo validar tu sesión para enviar la invitación.');
      return;
    }

    setInvitingFriend(true);
    try {
      const accessToken =
        layoutSession?.access_token ||
        (await supabase.auth.getSession()).data?.session?.access_token;
      if (!accessToken) {
        throw new Error('No se pudo obtener sesión para enviar la invitación.');
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
          'La invitación por email no está disponible en la versión estática. Despliega la API o define NEXT_PUBLIC_INVITE_SEND_MAIL_URL.'
        );
      }
      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo enviar la invitación.');
      }

      alert('Invitación enviada correctamente.');
      setInviteEmail('');
      setInviteMessage('');
    } catch (error) {
      console.error('Error inviting friend:', error);
      alert(error.message || 'Error enviando invitación.');
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

  // Función para añadir nota
  const addStudyNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Nueva Nota',
      content: 'Escribe tu nota aquí...',
      date: new Date().toISOString().split('T')[0],
      tags: []
    };
    setStudyNotes(prev => [newNote, ...prev]);
  };

  // Función para actualizar nota
  const updateStudyNote = (id, updates) => {
    setStudyNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
  };

  // Función para eliminar nota
  const deleteStudyNote = (id) => {
    setStudyNotes(prev => prev.filter(note => note.id !== id));
  };

  // Función para añadir ejercicio favorito
  const toggleFavoriteExercise = (exercise) => {
    setFavoriteExercises(prev => {
      const exists = prev.find(fav => fav.id === exercise.id);
      if (exists) {
        return prev.filter(fav => fav.id !== exercise.id);
      } else {
        return [...prev, { ...exercise, lastUsed: new Date().toISOString().split('T')[0] }];
      }
    });
  };

  // Funciones de flashcards
  const addFlashcard = () => {
    const newCard = {
      id: Date.now(),
      front: 'Nueva tarjeta',
      back: 'Definición...',
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
    alert(`Iniciando desafío: ${studyChallenges.find(c => c.id === challengeId)?.title}`);
  };

  // Funciones de hábitos
  const updateHabit = (habitId, updates) => {
    setStudyHabits(prev => prev.map(habit => 
      habit.id === habitId ? { ...habit, ...updates } : habit
    ));
  };

  // Funciones de metas
  const updateGoal = (goalId, updates) => {
    setStudyGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  // Datos para gráfico de distribución por niveles
  const levelDistribution = stats ? [
    { name: 'A2', value: stats.stats.levelCounts?.A2 || 0, color: '#82ca9d' },
    { name: 'B1', value: stats.stats.levelCounts?.B1 || 0, color: '#ffc658' },
    { name: 'B2', value: stats.stats.levelCounts?.B2 || 0, color: '#ff7300' },
    { name: 'C1', value: stats.stats.levelCounts?.C1 || 0, color: '#00ff00' },
    { name: 'C2', value: stats.stats.levelCounts?.C2 || 0, color: '#ff0000' }
  ] : [];

  if (loading) {
    return (
      <main className="shell perfil-page center">
        <div className="loader" aria-label="Cargando" />
      </main>
    );
  }

  if (!user || !stats) return null;

  const activeTabMeta = PROFILE_TABS.find((t) => t.id === activeTab);
  const studentTabLocked = isStudent && activeTabMeta && !activeTabMeta.studentAllowed;

  const displayName =
    (fullName || '').trim() ||
    user?.user_metadata?.name?.trim() ||
    user?.email?.split('@')[0] ||
    '';

  const tabsProps = {
    tabs: PROFILE_TABS,
    activeTab,
    onSelectTab: setActiveTab,
    isStudent,
  };

  return (
    <main className="shell perfil-page">
      <ProfileTabsNav {...tabsProps} />
      <header className="header header--mascot">
          <div className="header__copy">
            <h1>
              👤 Mi Perfil
              {displayName ? (
                <span className="profile-header__display-name"> — {displayName}</span>
              ) : null}
            </h1>
            <p>Gestiona tu información personal y revisa tu progreso de aprendizaje.</p>
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
        <>
          {/* Estadísticas agregadas de todas las tablas *estadisticas* en Supabase */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📊 Estadísticas Generales</h2>
            </div>
            <ProfileGeneralStats
              accessToken={layoutSession?.access_token}
              onSummaryLoaded={(summary) => {
                setStats((prev) => ({
                  ...(prev || { exams: [], training: [], theory: [], stats: {} }),
                  stats: {
                    ...(prev?.stats || {}),
                    ...summary,
                  },
                }));
              }}
            />
          </section>

          {/* Estadísticas de Exámenes */}
          <ExamStatistics userId={user?.id} />

          {/* Estadísticas Levels B2 (solo visibles para el propio usuario; RLS en Supabase) */}
          <LevelsEstadisticasPanel userId={user?.id} />

          {/* Actividad de estudio (último año, datos reales) */}
          <section className="profile-section study-activity-section">
            <div className="section-head">
              <h2>📅 Actividad de Estudio</h2>
              <p className="section-desc">
                Tu constancia durante el último año. Pasa el cursor sobre cada día para ver minutos y sesiones.
              </p>
            </div>
            <StudyActivityHeatmap accessToken={layoutSession?.access_token} />
          </section>

          {/* Acciones rápidas */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🚀 Acciones Rápidas</h2>
            </div>
            <div className="quick-actions">
              <Link href="/training" className="quick-action-btn primary">
                💪 Entrenar
              </Link>
              <Link href="/niveles" className="quick-action-btn">
                📚 Ver Niveles
              </Link>
              <Link href="/teoria" className="quick-action-btn">
                📖 Teoría
              </Link>
              <Link href="/prueba-nivel" className="quick-action-btn">
                🧪 Prueba de Nivel
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Tab: Progreso */}
      {activeTab === 'progress' && (
        <>
          <ProfileSkillAnalysis userId={user?.id} />

          {/* Gráficos de progreso */}
          <div className="charts-section">
            <section className="profile-section chart-section">
              <div className="section-head">
                <h2>📈 Evolución de Puntuaciones</h2>
              </div>
        {stats.exams.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.exams.map(e => ({
              fecha: new Date(e.date).toLocaleDateString(),
              puntuación: e.total_score,
            }))}>
                    <CartesianGrid stroke="#eaeaea" />
              <XAxis dataKey="fecha" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
                    <Area type="monotone" dataKey="puntuación" stroke="#0070f3" fill="#0070f3" fillOpacity={0.3} />
                  </AreaChart>
          </ResponsiveContainer>
        ) : (
                <div className="empty-chart">
                  <div className="empty-icon">📊</div>
          <p>No hay datos suficientes para mostrar la gráfica.</p>
                  <Link href="/training" className="btn">🚀 Comenzar Entrenamiento</Link>
                </div>
        )}
      </section>

            <section className="profile-section chart-section">
              <div className="section-head">
                <h2>🎯 Distribución por Niveles</h2>
              </div>
              {levelDistribution.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={levelDistribution.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {levelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">
                  <div className="empty-icon">🎯</div>
                  <p>Completa algunos exámenes para ver la distribución por niveles.</p>
                </div>
              )}
            </section>
          </div>

        </>
      )}

      {/* Tab: Logros */}
      {activeTab === 'achievements' && (
        <section className="profile-section">
          <div className="section-head">
            <h2>🏆 Logros y Badges</h2>
          </div>
          <ProfileAchievementsCarousel userId={user?.id} />
        </section>
      )}

      {/* Tab: Objetivos */}
      {activeTab === 'goals' && (
        <section className="profile-section">
          <div className="section-head">
            <h2>🎯 Mis Objetivos</h2>
          </div>
          <ProfileGoalsPanel userId={user?.id} />
        </section>
      )}

      {/* Tab: Configuración */}
      {activeTab === 'integrated' && (
        <>
          {/* Dashboard de Progreso Integrado */}
          <section className="profile-section">
            <div className="section-header">
              <h2>📊 Dashboard de Progreso</h2>
              <p>Estadísticas completas de tu aprendizaje</p>
            </div>
            <ProgressDashboard userId={user?.id} />
          </section>

          {/* Aprendizaje Adaptativo */}
          <section className="profile-section">
            <div className="section-header">
              <h2>🤖 Aprendizaje Adaptativo</h2>
              <p>Recomendaciones personalizadas basadas en IA</p>
            </div>
            <AdaptiveLearningDashboard userId={user?.id} />
          </section>

          {/* Métricas de Rendimiento */}
          <section className="profile-section">
            <div className="section-header">
              <h2>⚡ Métricas de Rendimiento</h2>
              <p>Análisis detallado de tu desempeño</p>
            </div>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">📚</div>
                <div className="metric-value">{integratedStats.performanceMetrics.totalExercises || 0}</div>
                <div className="metric-label">Ejercicios Completados</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🎯</div>
                <div className="metric-value">{integratedStats.performanceMetrics.averageScore || 0}%</div>
                <div className="metric-label">Puntuación Promedio</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">⏱️</div>
                <div className="metric-value">{Math.round((integratedStats.performanceMetrics.totalTime || 0) / 60)}m</div>
                <div className="metric-label">Tiempo Total</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🏆</div>
                <div className="metric-value">{integratedStats.achievements?.length || 0}</div>
                <div className="metric-label">Logros Desbloqueados</div>
              </div>
            </div>
          </section>

          {/* Logros Recientes */}
          {integratedStats.achievements && integratedStats.achievements.length > 0 && (
            <section className="profile-section">
              <div className="section-header">
                <h2>🏆 Logros Recientes</h2>
                <p>Tus logros más recientes</p>
              </div>
              
              <div className="achievements-grid">
                {integratedStats.achievements.slice(0, 6).map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-icon">{achievement.icon || '🏆'}</div>
                    <div className="achievement-title">{achievement.title}</div>
                    <div className="achievement-description">{achievement.description}</div>
                    <div className="achievement-points">+{achievement.points} puntos</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Análisis de Habilidades */}
          {integratedStats.adaptiveData && (
            <section className="profile-section">
              <div className="section-header">
                <h2>📈 Análisis de Habilidades</h2>
                <p>Progreso detallado por habilidad</p>
              </div>
              
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
            </section>
          )}
        </>
      )}

      {activeTab === 'mis-datos' && (
        <>
          <section className="profile-section">
            <div className="section-header">
              <h2>👋 Bienvenido, {displayName || user.email}</h2>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Cerrar Sesión
              </button>
            </div>
          </section>

          <section className="profile-section profile-name-section">
            <div className="section-head">
              <h2>✏️ Nombre de perfil</h2>
            </div>
            <p className="section-desc">
              Este nombre aparece en tu perfil y en el panel de administración.
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-display-name">
                Nombre visible
              </label>
              <input
                id="profile-display-name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setNameSaveMessage('');
                  setNameSaveError('');
                }}
                className="form-input"
                placeholder="Tu nombre"
                maxLength={80}
                autoComplete="name"
              />
            </div>
            {nameSaveError ? <p className="form-hint form-hint--error">{nameSaveError}</p> : null}
            {nameSaveMessage ? <p className="form-hint form-hint--success">{nameSaveMessage}</p> : null}
            <button
              type="button"
              onClick={handleSaveProfileName}
              className="action-btn"
              disabled={saving}
            >
              {saving ? 'Guardando...' : '💾 Guardar nombre'}
            </button>
          </section>
        </>
      )}

      {activeTab === 'settings' && (
        <>
          {/* Información personal */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📝 Información Personal</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                className="form-input"
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de nacimiento</label>
              <input 
                type="date" 
                value={birthDate} 
                onChange={e => setBirthDate(e.target.value)} 
                className="form-input"
              />
            </div>
            <button onClick={handleProfileUpdate} className="action-btn" disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </section>

          {/* Seguridad */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🔐 Seguridad</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="form-input"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button onClick={handlePasswordChange} className="action-btn">
              🔑 Actualizar Contraseña
            </button>
          </section>

          <section className="profile-section" style={{ border: '1px solid #fecaca', background: '#fff5f5' }}>
            <div className="section-head">
              <h2>🗑️ Eliminar cuenta</h2>
            </div>
            <p style={{ marginTop: 0, color: '#7f1d1d' }}>
              Esta accion es irreversible. Para confirmar, te enviaremos un codigo de 6 cifras al correo de tu cuenta.
            </p>

            <button
              onClick={handleSendDeleteCode}
              className="action-btn"
              disabled={sendingDeleteCode || deletingAccount}
              style={{ background: '#b91c1c' }}
            >
              {sendingDeleteCode ? 'Enviando codigo...' : 'Enviar codigo de confirmacion'}
            </button>

            {deleteFlowActive && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Codigo de verificacion (6 cifras)</label>
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
                <small style={{ color: '#7f1d1d', marginTop: '0.5rem' }}>
                  Codigo enviado a {user?.email}. {deleteCodeSentAt ? 'Si caduca, solicita uno nuevo.' : ''}
                </small>
                <button
                  onClick={handleDeleteAccount}
                  className="action-btn"
                  disabled={deletingAccount}
                  style={{ marginTop: '0.8rem', background: '#991b1b' }}
                >
                  {deletingAccount ? 'Eliminando...' : 'Confirmar eliminacion de cuenta'}
                </button>
              </div>
            )}
          </section>

          {/* Notificaciones */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🔔 Notificaciones</h2>
            </div>
            <div className="settings-grid">
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  />
                  📧 Notificaciones por Email
                </label>
              </div>
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                  />
                  🔔 Notificaciones Push
                </label>
              </div>
            </div>
            <button onClick={handleSettingsUpdate} className="action-btn" disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar Configuración'}
            </button>
          </section>

          <section className="profile-section">
            <div className="section-head">
              <h2>📨 Invitar amigos</h2>
            </div>
            <p style={{ marginTop: 0, color: '#334155' }}>
              Envía una invitación por correo para que tus amigos se unan a practicar contigo.
            </p>
            <div className="form-group">
              <label className="form-label">Email de tu amigo</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="form-input"
                placeholder="amigo@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mensaje personalizado (opcional)</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="form-input"
                rows={4}
                placeholder="¡Hola! Te invito a practicar inglés conmigo en English Practice."
              />
            </div>
            <button onClick={handleInviteFriend} className="action-btn" disabled={invitingFriend}>
              {invitingFriend ? 'Enviando invitación...' : 'Enviar invitación'}
            </button>
          </section>
        </>
      )}

      {/* Tab: Herramientas de Estudio */}
      {activeTab === 'study-tools' && (
        <>
          {/* Temporizador de Estudio */}
          <section className="profile-section">
            <div className="section-head">
              <h2>⏱️ Temporizador de Estudio</h2>
            </div>
            <div className="timer-container">
              <div className="timer-display">
                <div className="timer-time">
                  {Math.floor(studyTimer.sessionTime / 60)}:{(studyTimer.sessionTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="timer-label">Tiempo de Sesión</div>
              </div>
              <div className="timer-controls">
                <button 
                  onClick={studyTimer.isRunning ? stopTimer : startTimer}
                  className={`timer-btn ${studyTimer.isRunning ? 'timer-stop' : 'timer-start'}`}
                >
                  {studyTimer.isRunning ? '⏸️ Pausar' : '▶️ Iniciar'}
                </button>
                <button onClick={resetTimer} className="timer-btn timer-reset">
                  🔄 Reiniciar
                </button>
              </div>
            </div>
          </section>

          {/* Notas de Estudio */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📝 Mis Notas de Estudio</h2>
              <button onClick={addStudyNote} className="add-note-btn">+ Nueva Nota</button>
            </div>
            <div className="notes-grid">
              {studyNotes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) => updateStudyNote(note.id, { title: e.target.value })}
                      className="note-title-input"
                    />
                    <button 
                      onClick={() => deleteStudyNote(note.id)}
                      className="delete-note-btn"
                    >
                      🗑️
                    </button>
                  </div>
                  <textarea
                    value={note.content}
                    onChange={(e) => updateStudyNote(note.id, { content: e.target.value })}
                    className="note-content-input"
                    rows={4}
                  />
                  <div className="note-footer">
                    <div className="note-date">{note.date}</div>
                    <div className="note-tags">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="note-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ejercicios Favoritos */}
          <section className="profile-section">
            <div className="section-head">
              <h2>⭐ Ejercicios Favoritos</h2>
            </div>
            <div className="favorites-grid">
              {favoriteExercises.map((exercise) => (
                <div key={exercise.id} className="favorite-card">
                  <div className="favorite-title">{exercise.title}</div>
                  <div className="favorite-type">{exercise.type}</div>
                  <div className="favorite-difficulty">{exercise.difficulty}</div>
                  <div className="favorite-last-used">Último uso: {exercise.lastUsed}</div>
                  <button 
                    onClick={() => toggleFavoriteExercise(exercise)}
                    className="remove-favorite-btn"
                  >
                    ❌ Quitar de Favoritos
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Historial de Estudio */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📚 Historial de Estudio</h2>
            </div>
            <div className="history-table">
              <div className="history-header">
                <div>Fecha</div>
                <div>Duración</div>
                <div>Ejercicios</div>
                <div>Puntuación</div>
                <div>Tipo</div>
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
          </section>
        </>
      )}

      {/* Tab: Social */}
      {activeTab === 'social' && (
        <>
          {/* Comparación de Progreso */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📊 Comparación de Progreso</h2>
            </div>
            <div className="comparison-stats">
              <div className="comparison-card">
                <div className="comparison-label">Tu Puntuación</div>
                <div className="comparison-value">{progressComparison.userScore}%</div>
              </div>
              <div className="comparison-card">
                <div className="comparison-label">Promedio General</div>
                <div className="comparison-value">{progressComparison.averageScore}%</div>
              </div>
              <div className="comparison-card">
                <div className="comparison-label">Percentil</div>
                <div className="comparison-value">{progressComparison.percentile}%</div>
              </div>
              <div className="comparison-card">
                <div className="comparison-label">Ranking</div>
                <div className="comparison-value">{progressComparison.rank}</div>
              </div>
            </div>
          </section>

          {/* Grupos de Estudio */}
          <section className="profile-section">
            <div className="section-head">
              <h2>👥 Grupos de Estudio</h2>
            </div>
            <div className="groups-grid">
              {studyGroups.map((group) => (
                <div key={group.id} className="group-card">
                  <div className="group-name">{group.name}</div>
                  <div className="group-members">{group.members} miembros</div>
                  <div className="group-level">{group.level}</div>
                  <div className="group-activity">Última actividad: {group.lastActivity}</div>
                  <button className="join-group-btn">Unirse</button>
                </div>
              ))}
            </div>
          </section>

          {/* Desafíos Semanales */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🏆 Desafíos Semanales</h2>
            </div>
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
                  <div className="challenge-reward">Recompensa: {challenge.reward}</div>
                  <div className="challenge-deadline">Fecha límite: {challenge.deadline}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <>
          {/* Recomendaciones Inteligentes */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🤖 Recomendaciones Inteligentes</h2>
            </div>
            <div className="recommendations-grid">
              {studyRecommendations.map((rec, index) => (
                <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                  <div className="recommendation-type">{rec.type}</div>
                  <div className="recommendation-skill">{rec.skill}</div>
                  <div className="recommendation-message">{rec.message}</div>
                  <div className="recommendation-priority">Prioridad: {rec.priority}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Progreso de Logros */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🎯 Progreso de Logros</h2>
            </div>
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
          </section>

          {/* Calendario de Estudio */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📅 Calendario de Estudio</h2>
            </div>
            <div className="calendar-container">
              <div className="calendar-grid">
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayEvents = studyCalendar.find(day => day.date === dateStr);
                  
                  return (
                    <div key={i} className={`calendar-day ${dayEvents ? 'has-events' : ''}`}>
                      <div className="day-number">{date.getDate()}</div>
                      {dayEvents && (
                        <div className="day-events">
                          {dayEvents.events.map((event, eventIndex) => (
                            <div key={eventIndex} className={`day-event ${event.type}`}>
                              {event.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Estadísticas Avanzadas */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📈 Estadísticas Avanzadas</h2>
            </div>
            <div className="advanced-stats">
              <div className="stat-item">
                <div className="stat-label">Tiempo Promedio por Sesión</div>
                <div className="stat-value">42 minutos</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Mejor Racha</div>
                <div className="stat-value">12 días</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Ejercicios Completados Hoy</div>
                <div className="stat-value">8</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Mejora Semanal</div>
                <div className="stat-value">+15%</div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Tab: IA Tools */}
      {activeTab === 'ai-tools' && (
        <>
          {/* Insights de IA */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🤖 Insights de Inteligencia Artificial</h2>
            </div>
            <div className="ai-insights-grid">
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`ai-insight-card ${insight.type}`}>
                  <div className="insight-header">
                    <div className="insight-title">{insight.title}</div>
                    <div className="insight-confidence">{insight.confidence}% confianza</div>
                  </div>
                  <div className="insight-description">{insight.description}</div>
                  <div className="insight-type-badge">{insight.type}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Planificador Inteligente */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📅 Plan de Estudio Inteligente</h2>
            </div>
            <div className="study-plan-container">
              <div className="plan-overview">
                <div className="plan-item">
                  <div className="plan-label">Meta Diaria</div>
                  <div className="plan-value">{studyPlan.dailyGoal} min</div>
                </div>
                <div className="plan-item">
                  <div className="plan-label">Meta Semanal</div>
                  <div className="plan-value">{studyPlan.weeklyGoal} min</div>
                </div>
                <div className="plan-item">
                  <div className="plan-label">Racha Actual</div>
                  <div className="plan-value">{studyPlan.currentStreak} días</div>
                </div>
              </div>
              <div className="next-session">
                <h3>Próxima Sesión</h3>
                <div className="session-info">
                  <div className="session-title">{studyPlan.nextSession}</div>
                  <div className="session-details">
                    <span>Tiempo estimado: {studyPlan.estimatedTime} min</span>
                    <span>Dificultad: {studyPlan.difficulty}</span>
                  </div>
                  <div className="session-topics">
                    {studyPlan.topics.map((topic, index) => (
                      <span key={index} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Música de Estudio */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🎵 Música de Estudio</h2>
            </div>
            <div className="music-player">
              <div className="current-track">
                {studyMusic.currentTrack ? (
                  <div className="track-info">
                    <div className="track-name">{studyMusic.currentTrack.name}</div>
                    <div className="track-artist">{studyMusic.currentTrack.artist}</div>
                    <div className="track-duration">{studyMusic.currentTrack.duration}</div>
                  </div>
                ) : (
                  <div className="no-track">Selecciona una pista</div>
                )}
              </div>
              <div className="music-controls">
                <button 
                  onClick={studyMusic.isPlaying ? pauseMusic : () => playMusic(studyMusic.tracks[0])}
                  className="music-btn"
                >
                  {studyMusic.isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
                </button>
              </div>
              <div className="music-tracks">
                {studyMusic.tracks.map((track) => (
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
          </section>
        </>
      )}

      {/* Tab: Planificador */}
      {activeTab === 'study-planner' && (
        <>
          {/* Metas de Estudio */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🎯 Mis Metas de Estudio</h2>
            </div>
            <div className="goals-grid">
              {studyGoals.map((goal) => (
                <div key={goal.id} className={`goal-card ${goal.priority}`}>
                  <div className="goal-header">
                    <div className="goal-title">{goal.title}</div>
                    <div className="goal-priority">{goal.priority}</div>
                  </div>
                  <div className="goal-description">{goal.description}</div>
                  <div className="goal-progress-bar">
                    <div 
                      className="goal-progress-fill" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="goal-progress-text">{goal.progress}% completado</div>
                  <div className="goal-deadline">Fecha límite: {goal.deadline}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Hábitos de Estudio */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📈 Hábitos de Estudio</h2>
            </div>
            <div className="habits-grid">
              {studyHabits.map((habit) => (
                <div key={habit.id} className="habit-card">
                  <div className="habit-name">{habit.name}</div>
                  <div className="habit-frequency">{habit.frequency}</div>
                  <div className="habit-streak">Racha: {habit.streak} días</div>
                  <div className="habit-difficulty">{habit.difficulty}</div>
                  <div className="habit-progress">
                    <div className="streak-bar">
                      <div 
                        className="streak-fill" 
                        style={{ width: `${(habit.streak / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Progreso Detallado */}
          <section className="profile-section">
            <div className="section-head">
              <h2>📊 Progreso Detallado</h2>
            </div>
            <div className="progress-stats">
              <div className="progress-item">
                <div className="progress-icon">⏱️</div>
                <div className="progress-content">
                  <div className="progress-label">Horas Totales</div>
                  <div className="progress-value">{studyProgress.totalHours}h</div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-icon">📈</div>
                <div className="progress-content">
                  <div className="progress-label">Tasa de Mejora</div>
                  <div className="progress-value">+{studyProgress.improvementRate}%</div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-icon">🎯</div>
                <div className="progress-content">
                  <div className="progress-label">Consistencia</div>
                  <div className="progress-value">{studyProgress.consistency}%</div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-icon">🧠</div>
                <div className="progress-content">
                  <div className="progress-label">Puntuación de Enfoque</div>
                  <div className="progress-value">{studyProgress.focusScore}%</div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Tab: Gamificación */}
      {activeTab === 'gamification' && (
        <>
          {/* Sistema de Recompensas */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🏆 Sistema de Recompensas</h2>
            </div>
            <div className="rewards-grid">
              {studyRewards.map((reward) => (
                <div key={reward.id} className={`reward-card ${reward.earned ? 'earned' : 'locked'}`}>
                  <div className="reward-icon">🏆</div>
                  <div className="reward-name">{reward.name}</div>
                  <div className="reward-description">{reward.description}</div>
                  <div className="reward-points">{reward.points} puntos</div>
                  {reward.earned ? (
                    <button className="claim-btn">✅ Reclamado</button>
                  ) : (
                    <button onClick={() => claimReward(reward.id)} className="claim-btn">
                      🎁 Reclamar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Desafíos Especiales */}
          <section className="profile-section">
            <div className="section-head">
              <h2>⚡ Desafíos Especiales</h2>
            </div>
            <div className="challenges-special-grid">
              {studyChallenges.map((challenge) => (
                <div key={challenge.id} className={`challenge-special-card ${challenge.difficulty.toLowerCase()}`}>
                  <div className="challenge-icon">⚡</div>
                  <div className="challenge-title">{challenge.title}</div>
                  <div className="challenge-description">{challenge.description}</div>
                  <div className="challenge-reward">Recompensa: {challenge.reward}</div>
                  <div className="challenge-difficulty">{challenge.difficulty}</div>
                  <button onClick={() => startChallenge(challenge.id)} className="start-challenge-btn">
                    🚀 Iniciar Desafío
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Tabla de Clasificación */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🏅 Tabla de Clasificación</h2>
            </div>
            <div className="leaderboard">
              <div className="leaderboard-header">
                <div>Rank</div>
                <div>Usuario</div>
                <div>Puntuación</div>
                <div>Nivel</div>
                <div>Racha</div>
              </div>
              {studyLeaderboard.map((player) => (
                <div key={player.rank} className={`leaderboard-row ${player.name === 'You' ? 'current-user' : ''}`}>
                  <div className="rank">#{player.rank}</div>
                  <div className="player-name">{player.name}</div>
                  <div className="player-score">{player.score}</div>
                  <div className="player-level">{player.level}</div>
                  <div className="player-streak">{player.streak} días</div>
                </div>
              ))}
            </div>
          </section>

          {/* Motivación */}
          <section className="profile-section">
            <div className="section-head">
              <h2>💪 Motivación</h2>
            </div>
            <div className="motivation-container">
              <div className="motivation-level">
                <div className="motivation-label">Nivel de Motivación</div>
                <div className="motivation-value">{studyMotivation.currentLevel}%</div>
                <div className="motivation-change">+{studyMotivation.weeklyChange}% esta semana</div>
              </div>
              <div className="motivational-quote">
                <div className="quote-text">"{studyMotivation.motivationalQuote}"</div>
              </div>
              <div className="next-milestone">
                <div className="milestone-label">Próximo Hito</div>
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
          </section>
        </>
      )}

      {/* Tab: Fechas de examen */}
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

      {/* Tab: Comunidad */}
      {activeTab === 'community' && (
        <>
          {/* Chat de Grupos */}
          <section className="profile-section">
            <div className="section-head">
              <h2>💬 Chat de Grupos</h2>
            </div>
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
                  placeholder="Escribe tu mensaje..." 
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
          </section>

          {/* Flashcards */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🃏 Tarjetas de Memoria</h2>
              <button onClick={addFlashcard} className="add-flashcard-btn">+ Nueva Tarjeta</button>
            </div>
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
                    <div className="stat">Revisado: {card.reviewed}</div>
                    <div className="stat">Correcto: {card.correct}</div>
                    <div className="stat">Precisión: {card.reviewed > 0 ? Math.round((card.correct / card.reviewed) * 100) : 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Temas Visuales */}
          <section className="profile-section">
            <div className="section-head">
              <h2>🎨 Temas Visuales</h2>
            </div>
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
                    <div className="theme-active">✓ Activo</div>
                  )}
                </div>
              ))}
            </div>
          </section>
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
      .shell{min-height:100svh;max-width:1100px;margin:0 auto;padding:32px 20px}
      .center{display:grid;place-items:center}
      .header h1{font-size:44px;margin:0 0 6px;color:var(--text)}
      .profile-header__display-name{font-weight:600;color:#0070f3}
      .header p{margin:0;color:#666}
      .section-desc{margin:-8px 0 16px;color:#64748b;font-size:15px;line-height:1.5}
      .form-hint{margin:0 0 12px;font-size:14px}
      .form-hint--error{color:#dc2626}
      .form-hint--success{color:#16a34a}
      .header--mascot{display:flex;flex-wrap:wrap;align-items:center;gap:20px 32px;margin-bottom:8px}
      .header__copy{flex:1 1 240px;min-width:0}
      .header__mascot{flex:0 0 auto;line-height:0;filter:drop-shadow(0 8px 18px rgba(0,0,0,.12))}
      
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
      
      .profile-section{margin:22px 0;padding:24px;border:1px solid #eaeaea;border-radius:16px;background:var(--card);box-shadow:0 2px 6px rgba(0,0,0,0.1)}
      .section-head{display:flex;align-items:center;gap:8px;margin-bottom:20px}
      .section-head h2{margin:0;font-size:22px;color:var(--text)}
      .section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
      .section-header h2{margin:0;font-size:22px;color:var(--text)}
      .logout-btn{padding:8px 16px;background:#e74c3c;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;transition:transform .2s}
      .logout-btn:hover{transform:translateY(-1px)}
      
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
      .charts-section{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:22px}
      .chart-section{min-height:400px}
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
      
      /* Configuración */
      .settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px}
      .setting-item{padding:16px;border:1px solid #eaeaea;border-radius:12px;background:white}
      .setting-label{display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:500}
      .setting-label input{margin:0}
      
      /* Acciones rápidas */
      .quick-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
      .quick-action-btn{display:block;padding:16px 20px;text-align:center;text-decoration:none;border:1px solid #eaeaea;border-radius:12px;background:white;color:var(--text);transition:transform .2s,box-shadow .2s,border-color .2s;font-weight:600}
      .quick-action-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1);border-color:#0070f3;background:#b0d6fa}
      .quick-action-btn.primary{background:#0070f3;color:white;border-color:transparent}
      .quick-action-btn.primary:hover{background:#0056b3;box-shadow:0 18px 40px rgba(0,112,243,.4)}
      
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
      
      /* Ejercicios favoritos */
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
        .charts-section{grid-template-columns:1fr}
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
