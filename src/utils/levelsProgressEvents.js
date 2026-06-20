/** Dispatched on window after a skill-practice part score is persisted. */
export const LEVELS_PART_PROGRESS_SAVED_EVENT = 'levels-part-progress-saved';

export function dispatchLevelsPartProgressSaved(detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(LEVELS_PART_PROGRESS_SAVED_EVENT, { detail }));
}
