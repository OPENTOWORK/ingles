/** Profile tabs (content unchanged; UI grouping only). */
export const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', emoji: '📊', studentAllowed: true },
  { id: 'mis-datos', label: 'My details', emoji: '👤', studentAllowed: true },
  { id: 'exam-dates', label: 'Exam dates', emoji: '📅' },
  { id: 'private-tutor', label: 'Private tutor', emoji: '👨‍🏫' },
  { id: 'progress', label: 'Progress', emoji: '📈' },
  { id: 'achievements', label: 'Achievements', emoji: '🏆' },
  { id: 'goals', label: 'Goals', emoji: '🎯' },
  { id: 'integrated', label: 'Integrated stats', emoji: '🔗' },
  { id: 'study-tools', label: 'Tools', emoji: '🛠️' },
  { id: 'study-planner', label: 'Planner', emoji: '📅' },
  { id: 'ai-tools', label: 'AI tools', emoji: '🤖' },
  { id: 'analytics', label: 'Analytics', emoji: '📊' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
  { id: 'social', label: 'Social', emoji: '👥' },
  { id: 'community', label: 'Community', emoji: '🌐' },
  { id: 'gamification', label: 'Gamification', emoji: '🎮' },
];

export const PROFILE_TAB_GROUPS = [
  {
    id: 'account',
    title: 'Profile',
    description: 'Your account, settings and exam preparation',
    tabIds: ['overview', 'mis-datos', 'settings', 'exam-dates', 'private-tutor'],
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'Tracking, analytics and gamification',
    tabIds: ['progress', 'achievements', 'goals', 'integrated', 'analytics', 'gamification'],
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'Study tools, planner and AI',
    tabIds: ['study-tools', 'study-planner', 'ai-tools'],
  },
  {
    id: 'more',
    title: 'Connect',
    description: 'Social and community',
    tabIds: ['social', 'community'],
  },
];

const tabById = Object.fromEntries(PROFILE_TABS.map((t) => [t.id, t]));

export function getProfileTabById(id) {
  return tabById[id];
}

export function getProfileGroupForTab(tabId) {
  return PROFILE_TAB_GROUPS.find((g) => g.tabIds.includes(tabId)) || PROFILE_TAB_GROUPS[0];
}

export const PROFILE_TAB_LABELS = Object.fromEntries(
  PROFILE_TABS.map((t) => [t.id, t.label]),
);
