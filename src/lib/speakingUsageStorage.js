const KEY_PREFIX = 'dralo_speaking_usage';

function todayUtcDateString() {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(userId) {
  return `${KEY_PREFIX}_${userId}_${todayUtcDateString()}`;
}

/** @returns {{ used?: number, limit?: number, atLimit?: boolean } | null} */
export function loadSpeakingUsageLocal(userId) {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

/** @param {string} userId @param {{ used?: number, limit?: number, atLimit?: boolean }} payload */
export function saveSpeakingUsageLocal(userId, payload) {
  if (!userId || typeof window === 'undefined' || !payload) return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

/**
 * Prefer the higher used count so UI never shows more credits than the user really has left.
 * @param {object | null | undefined} apiStatus
 * @param {object | null | undefined} localStatus
 */
export function mergeSpeakingUsageStatus(apiStatus, localStatus) {
  if (!apiStatus && !localStatus) return null;
  if (!localStatus) return apiStatus ?? null;
  if (!apiStatus) {
    const limit = localStatus.limit ?? 3;
    const used = localStatus.used ?? 0;
    const atLimit = Boolean(localStatus.atLimit || used >= limit);
    return {
      action: 'exam_speaking_feedback',
      limit,
      used,
      remaining: atLimit ? 0 : Math.max(0, limit - used),
      unlimited: false,
      atLimit,
    };
  }

  if (apiStatus.unlimited) return apiStatus;

  const limit = apiStatus.limit ?? localStatus.limit ?? 3;
  const used = Math.max(apiStatus.used ?? 0, localStatus.used ?? 0);
  const atLimit = Boolean(apiStatus.atLimit || localStatus.atLimit || used >= limit);
  const remaining = atLimit ? 0 : Math.max(0, limit - used);

  return {
    ...apiStatus,
    limit,
    used,
    remaining,
    atLimit,
    unavailable: false,
  };
}
