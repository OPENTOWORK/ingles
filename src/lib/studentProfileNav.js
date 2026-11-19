import { PROFILE_TABS } from '@/components/perfil/profileTabsConfig';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { APP_ROUTES } from '@/config/appRoutes';

/** Student profile sidebar. Order is the navigation order. */
export const STUDENT_PROFILE_SECTIONS = [
  { id: 'overview', group: 'Learning', label: 'Overview' },
  { id: 'exam-statistics', group: 'Learning', label: 'Exam Statistics' },
  { id: 'error-analytics', group: 'Learning', label: 'Error Analytics' },
  { id: 'training-experience', group: 'Learning', label: 'Training Experience' },
  { id: 'account', group: 'Profile', label: 'Your Account' },
  { id: 'subscription', group: 'Profile', label: 'Subscription' },
  { id: 'settings', group: 'Profile', label: 'Settings' },
];

const SECTION_IDS = new Set(STUDENT_PROFILE_SECTIONS.map((section) => section.id));
const LEGACY_TAB_IDS = new Set(PROFILE_TABS.map((tab) => tab.id));

const SECTION_ALIASES = {
  account: 'account',
  'mis-datos': 'account',
};

export function isStudentSidebarSection(tabId) {
  return SECTION_IDS.has(tabId);
}

export function studentProfileHref(tabId) {
  if (!tabId || tabId === 'overview') return '/profile/';
  return `/profile/?tab=${encodeURIComponent(tabId)}`;
}

/**
 * Map a profile query to the section that should open.
 * Known tool tabs stay on their own addresses. Unknown values open Overview.
 * The shared invite link still opens the referral form, which now lives on Subscription.
 */
export function resolveStudentProfileTab(tab, { invite = false } = {}) {
  const value = typeof tab === 'string' ? tab.trim() : '';
  if (invite && (!value || value === 'settings' || value === 'subscription' || value === 'mis-datos')) {
    return 'subscription';
  }
  if (!value || value === 'overview') return 'overview';
  if (SECTION_ALIASES[value]) return SECTION_ALIASES[value];
  if (SECTION_IDS.has(value)) return value;
  if (LEGACY_TAB_IDS.has(value)) return value;
  return 'overview';
}

export function studentProfileHeading(tabId) {
  return STUDENT_PROFILE_SECTIONS.find((section) => section.id === tabId) || null;
}

/** Honest empty state for the new Error Analytics page. */
export const SKILL_ANALYSIS_COMING_SOON = 'Skill analysis coming soon';

export function profileHelpHref() {
  return `${APP_ROUTES.contact}/`;
}

/**
 * Students do not choose a shell until the signed-in role has settled.
 * A missing session is ready (guest). An unresolved role is not a student shell.
 */
export function resolveProfileShell({ session, userRole = '', roleSettledForUserId = null } = {}) {
  const userId = session?.user?.id ?? null;
  const roleReady = !userId || roleSettledForUserId === userId;
  return {
    roleReady,
    isStudent: Boolean(userId) && roleReady && usesStudentContentRestrictions(userRole),
  };
}

/** Address written when a student selects a sidebar section. */
export function buildStudentProfileHistoryUrl(currentHref, tabId) {
  const url = new URL(currentHref, 'http://localhost');
  if (!tabId || tabId === 'overview') url.searchParams.delete('tab');
  else url.searchParams.set('tab', tabId);
  if (tabId !== 'subscription') url.searchParams.delete('invite');
  return `${url.pathname}${url.search}`;
}

export function reduceStudentDrawer(state, action) {
  if (action.type === 'viewport') {
    return {
      ...state,
      isMobile: action.isMobile,
      open: action.isMobile ? state.open : false,
    };
  }
  if (action.type === 'toggle') return { ...state, open: !state.open };
  if (action.type === 'close') return { ...state, open: false };
  return state;
}

export function studentDrawerKeyAction(key) {
  if (key === 'Escape') return 'close';
  if (key === 'Tab') return 'trap';
  if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') return 'move';
  return null;
}

export function sidebarLinkIndexAfterKey(index, count, key) {
  if (count <= 0 || index < 0) return index;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowDown') return (index + 1) % count;
  if (key === 'ArrowUp') return (index - 1 + count) % count;
  return index;
}
