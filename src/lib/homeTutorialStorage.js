const TUTORIAL_KEY = 'dralo_home_tutorial_v1';
const VISIT_KEY = 'dralo_home_visit_count';
const SESSION_SHOWN_KEY = 'dralo_tutorial_shown_session';

export function getHomeVisitCount() {
  if (typeof window === 'undefined') return 0;
  return parseInt(window.localStorage.getItem(VISIT_KEY) || '0', 10) || 0;
}

/** Increments visit count; call once per home page load. */
export function recordHomeVisit() {
  if (typeof window === 'undefined') return 0;
  const next = getHomeVisitCount() + 1;
  window.localStorage.setItem(VISIT_KEY, String(next));
  return next;
}

export function getTutorialState() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(TUTORIAL_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveTutorialState(patch) {
  if (typeof window === 'undefined') return;
  const prev = getTutorialState();
  window.localStorage.setItem(
    TUTORIAL_KEY,
    JSON.stringify({
      version: 1,
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function markTutorialCompleted() {
  saveTutorialState({ completed: true });
  markTutorialShownThisSession();
}

export function markTutorialDismissed() {
  saveTutorialState({ dismissed: true });
  markTutorialShownThisSession();
}

export function markTutorialShownThisSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
}

export function wasTutorialShownThisSession() {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(SESSION_SHOWN_KEY) === '1';
}

/** Returning visitors (2nd+ home visit) who have not finished the tour. */
export function shouldAutoShowTutorial(visitCount) {
  const state = getTutorialState();
  if (state.completed) return false;
  if (wasTutorialShownThisSession()) return false;
  return visitCount >= 2;
}

export function resetTutorialForReplay() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_SHOWN_KEY);
  saveTutorialState({ completed: false, dismissed: false });
}
