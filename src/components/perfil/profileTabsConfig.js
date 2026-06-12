/** Profile tabs (content unchanged; UI grouping only). */
export const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', studentAllowed: true },
  { id: 'mis-datos', label: 'My details', studentAllowed: true },
  { id: 'exam-dates', label: 'Exam dates' },
  { id: 'private-tutor', label: 'Private tutor' },
  { id: 'progress', label: 'Progress' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'goals', label: 'Goals' },
  { id: 'integrated', label: 'Integrated stats' },
  { id: 'study-tools', label: 'Tools', studentAllowed: true },
  { id: 'study-planner', label: 'Planner' },
  { id: 'ai-tools', label: 'AI tools' },
  { id: 'error-tracker', label: 'Error Tracker', studentAllowed: true },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings', studentAllowed: true },
  { id: 'social', label: 'Social' },
  { id: 'community', label: 'Community' },
  { id: 'gamification', label: 'Gamification' },
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
    studentHidden: true,
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'Study tools, planner and AI',
    tabIds: ['study-tools', 'study-planner', 'ai-tools', 'error-tracker'],
  },
  {
    id: 'more',
    title: 'Connect',
    description: 'Social and community',
    tabIds: ['social', 'community'],
    studentHidden: true,
  },
];

const tabById = Object.fromEntries(PROFILE_TABS.map((t) => [t.id, t]));

export function getVisibleProfileTabGroups(isStudent = false) {
  if (!isStudent) return PROFILE_TAB_GROUPS;
  return PROFILE_TAB_GROUPS.filter((group) => !group.studentHidden);
}

export function isStudentHiddenProfileTab(tabId, isStudent = false) {
  if (!isStudent) return false;
  const tab = getProfileTabById(tabId);
  if (tab?.studentHidden) return true;
  const group = PROFILE_TAB_GROUPS.find((g) => g.tabIds.includes(tabId));
  return Boolean(group?.studentHidden);
}

export function getVisibleProfileTabs(isStudent = false) {
  return PROFILE_TABS.filter((tab) => !isStudentHiddenProfileTab(tab.id, isStudent));
}

export function getVisibleTabsInGroup(group, isStudent = false) {
  return group.tabIds
    .map((id) => getProfileTabById(id))
    .filter((tab) => tab && !isStudentHiddenProfileTab(tab.id, isStudent));
}

export function getProfileTabById(id) {
  return tabById[id];
}

export function getProfileGroupForTab(tabId, isStudent = false) {
  const groups = getVisibleProfileTabGroups(isStudent);
  return groups.find((g) => g.tabIds.includes(tabId)) || groups[0];
}

export const PROFILE_TAB_LABELS = Object.fromEntries(
  PROFILE_TABS.map((t) => [t.id, t.label]),
);
