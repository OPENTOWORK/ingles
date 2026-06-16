/**
 * Public feature flag — safe to expose to the client bundle.
 * OFF: production V1 behaviour. ON: local Scoring V2 (no Supabase persistence).
 */
export function isB2ScoringV2Enabled(env = typeof process !== 'undefined' ? process.env : {}) {
  return String(env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED || '').toLowerCase() === 'true';
}

export const B2_SCORING_V2_PERSISTENCE_DISABLED_MSG =
  'Scoring V2 persistence disabled until schema migration';

export const B2_SCORING_V2_EXAM_MODE_SYNC_DISABLED_MSG =
  'Scoring V2 exam-mode server sync disabled until schema migration';

export const B2_SCORING_V2_REPEAT_CLEAR_DISABLED_MSG =
  'Scoring V2: skipping Supabase clear on repeat — local session only';

/** Active scoring version for new sessions / drafts. */
export function getActiveScoringVersion(env = typeof process !== 'undefined' ? process.env : {}) {
  return isB2ScoringV2Enabled(env) ? 2 : 1;
}

/** Block Supabase writes for B2 R&UoE parts 1–7 while V2 is active locally. */
export function isB2RuoeV2SessionPersistenceBlocked(partNumber, env = typeof process !== 'undefined' ? process.env : {}) {
  const pn = Number(partNumber);
  return isB2ScoringV2Enabled(env) && pn >= 1 && pn <= 7;
}

/** Whether section scores payload belongs to B2 R&UoE parts 1–7. */
export function isB2RuoeSectionPartRange(partMin, partMax) {
  const min = Number(partMin);
  const max = Number(partMax);
  return min >= 1 && max <= 7;
}

/**
 * Sync exam-mode session backup to Supabase.
 * V2 ON + B2: blocked (payload may contain V2 point scores).
 * Other levels / V1: allowed.
 */
export function shouldSyncExamModeSessionToServer(session, env = typeof process !== 'undefined' ? process.env : {}) {
  if (!session) return false;
  if (!isB2ScoringV2Enabled(env)) return true;
  if (String(session.slug || '').toLowerCase() !== 'b2') return true;
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.info(B2_SCORING_V2_EXAM_MODE_SYNC_DISABLED_MSG);
  }
  return false;
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
