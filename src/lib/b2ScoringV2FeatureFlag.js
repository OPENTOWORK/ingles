/**
 * Public feature flag — safe to expose to the client bundle.
 * OFF: production V1 behaviour. ON: Scoring V2 with Supabase persistence.
 */
export function isB2ScoringV2Enabled(env = typeof process !== 'undefined' ? process.env : {}) {
  return String(env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED || '').toLowerCase() === 'true';
}

export const B2_SCORING_V2_REPEAT_CLEAR_DISABLED_MSG =
  'Scoring V2: skipping Supabase clear on repeat — local session only';

/** Active scoring version for new sessions / drafts. */
export function getActiveScoringVersion(env = typeof process !== 'undefined' ? process.env : {}) {
  return isB2ScoringV2Enabled(env) ? 2 : 1;
}

/** B2 R&UoE parts 1–7 persistence is allowed when V2 is active (schema supports V2 columns). */
export function isB2RuoeV2SessionPersistenceBlocked(partNumber, env = typeof process !== 'undefined' ? process.env : {}) {
  void partNumber;
  void env;
  return false;
}

/** Whether section scores payload belongs to B2 R&UoE parts 1–7. */
export function isB2RuoeSectionPartRange(partMin, partMax) {
  const min = Number(partMin);
  const max = Number(partMax);
  return min >= 1 && max <= 7;
}

/**
 * Sync exam-mode session backup to Supabase.
 * Allowed for all levels including B2 with V2 point scores.
 */
export function shouldSyncExamModeSessionToServer(session, env = typeof process !== 'undefined' ? process.env : {}) {
  void session;
  void env;
  return true;
}

/**
 * Clearing levels_puntuaciones on "repeat exam".
 * V2 ON + B2: blocked (must not delete V1 progress).
 */
export function shouldClearExamSlotPuntuacionesOnRepeat(slug, env = typeof process !== 'undefined' ? process.env : {}) {
  if (String(slug || '').toLowerCase() === 'b2' && isB2ScoringV2Enabled(env)) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.info(B2_SCORING_V2_REPEAT_CLEAR_DISABLED_MSG);
    }
    return false;
  }
  return true;
}

/** Stored session/draft scoringVersion must match active flag version. */
export function isExamModeSessionScoringCompatible(session, env = typeof process !== 'undefined' ? process.env : {}) {
  if (!session) return true;
  const stored = Number(session.scoringVersion) || 1;
  const active = getActiveScoringVersion(env);
  return stored === active;
}

/** @param {object|null|undefined} scores */
export function attachScoringVersionToExamModeScores(scores, env = typeof process !== 'undefined' ? process.env : {}) {
  if (!scores || typeof scores !== 'object') return scores;
  return {
    ...scores,
    scoringVersion: scores.scoringVersion ?? getActiveScoringVersion(env),
  };
}
