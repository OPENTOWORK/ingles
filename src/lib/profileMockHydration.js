/**
 * Deferred mock data for profile tabs (runs only when a tab is first opened).
 */

export function hydrateProfileMockData(tabId, setters) {
  const {
    setStudyHistory,
    setWeeklyChallenges,
    setStudyRecommendations,
    setStudyCalendar,
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
    setStudyGoals,
    setStudyHabits,
    setStudyMotivation,
    setStudyProgress,
    setStudyChallenges,
    setStudyLeaderboard,
  } = setters;

  switch (tabId) {
    case 'study-tools':
      setStudyHistory([
        { date: '2024-01-15', duration: 45, exercises: 12, score: 85, type: 'Grammar Practice' },
        { date: '2024-01-14', duration: 30, exercises: 8, score: 92, type: 'Reading Comprehension' },
        { date: '2024-01-13', duration: 60, exercises: 15, score: 78, type: 'Writing Practice' },
        { date: '2024-01-12', duration: 25, exercises: 6, score: 88, type: 'Vocabulary Quiz' },
        { date: '2024-01-11', duration: 40, exercises: 10, score: 90, type: 'Listening Test' },
      ]);
      setFlashcards([
        { id: 1, front: 'Serendipity', back: 'The occurrence of events by chance in a happy way', category: 'Vocabulary', difficulty: 'Hard', reviewed: 3, correct: 2 },
        { id: 2, front: 'Present Perfect', back: 'Used for actions that started in the past and continue to the present', category: 'Grammar', difficulty: 'Medium', reviewed: 5, correct: 4 },
        { id: 3, front: 'Ubiquitous', back: 'Present, appearing, or found everywhere', category: 'Vocabulary', difficulty: 'Hard', reviewed: 2, correct: 1 },
        { id: 4, front: 'Phrasal Verb: Look up', back: 'To search for information in a book or on a computer', category: 'Grammar', difficulty: 'Easy', reviewed: 7, correct: 6 },
      ]);
      setStudyThemes({
        current: 'default',
        available: [
          { id: 'default', name: 'Default', colors: { primary: '#0070f3', secondary: '#eaeaea' } },
          { id: 'dark', name: 'Dark Mode', colors: { primary: '#00d4ff', secondary: '#1a1a1a' } },
          { id: 'nature', name: 'Nature', colors: { primary: '#28a745', secondary: '#f8f9fa' } },
          { id: 'sunset', name: 'Sunset', colors: { primary: '#ff6b35', secondary: '#fff5f5' } },
        ],
      });
      break;

    case 'social':
      setStudyGroups([
        { id: 1, name: 'Advanced English Learners', members: 24, level: 'B2-C1', lastActivity: '2 hours ago' },
        { id: 2, name: 'Grammar Enthusiasts', members: 18, level: 'All Levels', lastActivity: '1 day ago' },
      ]);
      setGroupChat([
        { id: 1, user: 'Maria', message: 'Anyone up for a grammar challenge?', time: '2 min ago', group: 'Advanced English Learners' },
        { id: 2, user: 'John', message: 'Great job on the vocabulary quiz!', time: '5 min ago', group: 'Grammar Enthusiasts' },
        { id: 3, user: 'Sarah', message: 'Study session at 3 PM today?', time: '10 min ago', group: 'Advanced English Learners' },
      ]);
      setWeeklyChallenges([
        { id: 1, title: 'Grammar Master', description: 'Complete 20 grammar exercises', progress: 15, target: 20, reward: 'Grammar Badge', deadline: '2024-01-21' },
        { id: 2, title: 'Vocabulary Builder', description: 'Learn 50 new words', progress: 32, target: 50, reward: 'Vocabulary Badge', deadline: '2024-01-21' },
        { id: 3, title: 'Speed Reader', description: 'Complete 5 reading exercises in under 30 minutes', progress: 3, target: 5, reward: 'Speed Badge', deadline: '2024-01-21' },
      ]);
      break;

    case 'analytics':
      setAiInsights([
        { id: 1, type: 'performance', title: 'Peak Performance Time', description: 'You perform best between 10 AM - 12 PM', confidence: 85 },
        { id: 2, type: 'weakness', title: 'Grammar Focus Needed', description: 'Spend 20% more time on grammar exercises', confidence: 92 },
        { id: 3, type: 'strength', title: 'Vocabulary Master', description: 'Your vocabulary is improving 15% faster than average', confidence: 78 },
      ]);
      setProgressComparison({
        userScore: 85,
        averageScore: 72,
        percentile: 78,
        rank: 'Top 25%',
        improvement: '+12%',
      });
      setStudyProgress?.({
        totalHours: 78,
        averageSession: 42,
        improvementRate: 15,
        consistency: 85,
        focusScore: 92,
      });
      setStudyMotivation({
        currentLevel: 85,
        weeklyChange: 12,
        motivationalQuote: 'Every expert was once a beginner. Every pro was once an amateur.',
        nextMilestone: '100 hours of study',
        progressToMilestone: 78,
      });
      break;

    case 'ai-tools':
      setAiInsights([
        { id: 1, type: 'performance', title: 'Peak Performance Time', description: 'You perform best between 10 AM - 12 PM', confidence: 85 },
        { id: 2, type: 'weakness', title: 'Grammar Focus Needed', description: 'Spend 20% more time on grammar exercises', confidence: 92 },
        { id: 3, type: 'strength', title: 'Vocabulary Master', description: 'Your vocabulary is improving 15% faster than average', confidence: 78 },
      ]);
      setStudyPlan({
        dailyGoal: 60,
        weeklyGoal: 420,
        currentStreak: 7,
        nextSession: 'Grammar Review',
        estimatedTime: 25,
        difficulty: 'Medium',
        topics: ['Present Perfect', 'Vocabulary', 'Reading Comprehension'],
      });
      setStudyMusic({
        isPlaying: false,
        currentTrack: null,
        tracks: [
          { id: 1, name: 'Focus Flow', artist: 'Study Beats', duration: '2:30:00', genre: 'Ambient' },
          { id: 2, name: 'Concentration', artist: 'Brain Waves', duration: '1:45:00', genre: 'Classical' },
          { id: 3, name: 'Deep Focus', artist: 'Study Music', duration: '3:00:00', genre: 'Electronic' },
        ],
      });
      break;

    case 'gamification':
      setAchievementProgress({
        'Grammar Guru': { current: 45, target: 50, description: 'Complete 50 grammar exercises' },
        'Speed Demon': { current: 2, target: 5, description: 'Complete 5 exams under 30 minutes' },
        'Perfectionist': { current: 0, target: 1, description: 'Get 100% on any exam' },
      });
      setStudyStreaks({
        current: 7,
        longest: 15,
        weekly: 5,
        monthly: 22,
        total: 156,
      });
      setStudyRewards([
        { id: 1, name: 'Coffee Break', description: 'Unlock after 30 minutes of study', earned: true, points: 50 },
        { id: 2, name: 'Study Buddy', description: 'Invite a friend to study together', earned: false, points: 100 },
        { id: 3, name: 'Night Owl', description: 'Study after 10 PM', earned: true, points: 75 },
        { id: 4, name: 'Early Bird', description: 'Study before 7 AM', earned: false, points: 100 },
      ]);
      setStudyChallenges([
        { id: 1, title: 'Speed Challenge', description: 'Complete 10 exercises in 15 minutes', reward: 'Speed Badge', difficulty: 'Hard' },
        { id: 2, title: 'Accuracy Challenge', description: 'Get 95% accuracy in 5 consecutive tests', reward: 'Precision Badge', difficulty: 'Medium' },
        { id: 3, title: 'Endurance Challenge', description: 'Study for 2 hours straight', reward: 'Marathon Badge', difficulty: 'Hard' },
      ]);
      setStudyHabits?.([
        { id: 1, name: 'Morning Review', frequency: 'Daily', streak: 12, difficulty: 'Easy' },
        { id: 2, name: 'Vocabulary Practice', frequency: '3x/week', streak: 8, difficulty: 'Medium' },
        { id: 3, name: 'Grammar Focus', frequency: '2x/week', streak: 5, difficulty: 'Hard' },
      ]);
      break;

    case 'community':
      setStudyLeaderboard([
        { rank: 1, name: 'Maria', score: 1250, level: 'C1', streak: 12 },
        { rank: 2, name: 'John', score: 1180, level: 'B2', streak: 8 },
        { rank: 3, name: 'Sarah', score: 1100, level: 'B2', streak: 15 },
        { rank: 4, name: 'You', score: 950, level: 'B1', streak: 7 },
        { rank: 5, name: 'Alex', score: 890, level: 'B1', streak: 5 },
      ]);
      break;

    default:
      break;
  }
}

export const PROFILE_MOCK_TABS = new Set([
  'study-tools',
  'social',
  'analytics',
  'ai-tools',
  'gamification',
  'community',
]);
