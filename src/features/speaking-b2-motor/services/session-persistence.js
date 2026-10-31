/**
 * Pure helpers for Speaking B2 persistence. The I/O lives in session-store.js.
 * These functions are what the multi-instance tests exercise without Supabase.
 */

export const SPEAKING_B2_EVAL_LOCK_MS = 2 * 60 * 1000;
export const SPEAKING_B2_TERMINAL_STATES = new Set(['COMPLETED', 'ABORTED', 'FAILED']);

export class SpeakingStoreConflictError extends Error {
  constructor(message = 'Speaking session was updated elsewhere') {
    super(message);
    this.name = 'SpeakingStoreConflictError';
    this.code = 'STORE_CONFLICT';
  }
}

export function isMissingRelationError(error) {
  const code = String(error?.code || '');
  return code === '42P01' || code === '42703' || code === '42P10';
}

export function isUniqueViolation(error) {
  return String(error?.code || '') === '23505';
}

export function buildSpeakingSessionMetadata(session = {}) {
  return {
    examCode: session.examCode || 'SP-EX001',
    fixtureMode: Boolean(session.fixtureMode),
    questionIndex: session.questionIndex || 0,
    currentQuestionId: session.currentQuestionId || null,
    followUpUsed: session.followUpUsed || {},
    followUpPrompt: session.followUpPrompt || null,
    followUpGenerated: Boolean(session.followUpGenerated),
    introAsked: Boolean(session.introAsked),
    reaskCount: session.reaskCount || 0,
    silenceNudges: session.silenceNudges || 0,
    answerInFlight: Boolean(session.answerInFlight),
    evaluationCharged: Boolean(session.evaluationCharged),
    evaluationInFlight: Boolean(session.evaluationInFlight),
    evaluationLockAt: session.evaluationLockAt || null,
    evaluationFailed: Boolean(session.evaluationFailed),
    rowVersion: session.rowVersion || 1,
    boundAt: session.boundAt || null,
    plan: session.plan || null,
  };
}

export function hydrateSpeakingB2Session(row, turns = [], assessment = null) {
  if (!row) return null;
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  const report = row.report ?? metadata.report ?? assessment?.payload ?? null;
  return {
    id: row.id,
    persisted: true,
    userId: row.user_id ?? null,
    examCode: row.exam_code || metadata.examCode || 'SP-EX001',
    state: row.state || 'READY',
    createdAt: row.started_at || row.created_at || new Date().toISOString(),
    expiresAt: row.expires_at || null,
    accessTokenHash: row.access_token_hash || null,
    candidateSpeakingMs: row.candidate_speaking_ms || 0,
    rowVersion: row.row_version ?? metadata.rowVersion ?? 1,
    evaluationCharged: Boolean(row.evaluation_charged ?? metadata.evaluationCharged),
    evaluationInFlight: Boolean(row.evaluation_in_flight ?? metadata.evaluationInFlight),
    evaluationLockAt: row.evaluation_lock_at ?? metadata.evaluationLockAt ?? null,
    evaluationFailed: Boolean(metadata.evaluationFailed),
    report,
    pendingReport: row.pending_report ?? metadata.pendingReport ?? null,
    fixtureMode: Boolean(metadata.fixtureMode),
    questionIndex: metadata.questionIndex || 0,
    currentQuestionId: metadata.currentQuestionId || null,
    followUpUsed: metadata.followUpUsed || {},
    followUpPrompt: metadata.followUpPrompt || null,
    followUpGenerated: Boolean(metadata.followUpGenerated),
    introAsked: Boolean(metadata.introAsked),
    reaskCount: metadata.reaskCount || 0,
    silenceNudges: metadata.silenceNudges || 0,
    answerInFlight: Boolean(metadata.answerInFlight),
    boundAt: metadata.boundAt || null,
    plan: metadata.plan || null,
    turns: (turns || []).map(hydrateSpeakingB2Turn),
  };
}

export function hydrateSpeakingB2Turn(row) {
  return {
    id: row.id,
    role: row.role,
    questionId: row.question_id || null,
    transcript: row.transcript || row.spoken_text || '',
    source: row.transcript_source || 'STT',
    confidence: row.stt_confidence ?? null,
    audioPath: row.audio_path || null,
    validation: row.validation || null,
    turnIndex: row.turn_index ?? null,
    uncertain: Boolean(row.validation === 'UNCLEAR' || row.metadata?.uncertain),
    hasAudio: Boolean(row.audio_path),
  };
}

export function serializeSpeakingB2TurnValidation(value) {
  return typeof value === 'string' && value.trim() ? value : null;
}

export function serializeSpeakingB2Turn(turn, index, sessionId) {
  return {
    session_id: sessionId,
    turn_index: index,
    role: turn.role,
    question_id: turn.questionId || null,
    spoken_text: turn.transcript || '',
    transcript: turn.transcript || '',
    stt_confidence: turn.confidence ?? null,
    transcript_source: turn.source || 'STT',
    audio_path: turn.audioPath || null,
    validation: serializeSpeakingB2TurnValidation(turn.validation),
  };
}

/** PostgREST upserts that include `id` plus onConflict(session_id,turn_index) can 400. */
export function stripSpeakingB2TurnId(row) {
  if (!row || typeof row !== 'object') return row;
  const { id, ...rest } = row;
  return rest;
}

export function partitionSpeakingB2TurnWrites(upserts = [], existingRows = []) {
  const existingIndexes = new Set(
    existingRows
      .filter((row) => row.turn_index != null)
      .map((row) => Number(row.turn_index)),
  );
  const inserts = [];
  const updates = [];
  for (const row of upserts) {
    const clean = stripSpeakingB2TurnId(row);
    if (existingIndexes.has(Number(row.turn_index))) updates.push(clean);
    else inserts.push(clean);
  }
  return { inserts, updates };
}

function transcriptLength(row) {
  return String(row?.transcript || row?.spoken_text || '').trim().length;
}

export function incomingTurnIsSafeToWrite(incoming, existing) {
  if (!existing) return true;
  const incomingLen = transcriptLength(incoming);
  const existingLen = transcriptLength(existing);
  if (existingLen > 0 && incomingLen === 0) return false;
  if (existing.audio_path && !incoming.audio_path && incomingLen < existingLen) return false;
  if (existingLen > 0 && incomingLen > 0 && incomingLen < existingLen * 0.4) return false;
  return true;
}

export function mergeTurnWrite(incoming, existing) {
  if (!existing) return incoming;
  return {
    ...incoming,
    id: existing.id,
    audio_path: incoming.audio_path || existing.audio_path || null,
  };
}

/**
 * Plan upserts without DELETE. Extra rows already in the store are kept.
 * A repeated or stale write cannot replace a richer candidate answer.
 */
export function planSpeakingB2TurnWrites(existingRows = [], incomingTurns = [], sessionId) {
  const byIndex = new Map(
    existingRows
      .filter((row) => row.turn_index != null)
      .map((row) => [Number(row.turn_index), row]),
  );
  const upserts = [];
  const skipped = [];
  incomingTurns.forEach((turn, index) => {
    const incoming = serializeSpeakingB2Turn(turn, index, sessionId);
    const existing = byIndex.get(index);
    if (!incomingTurnIsSafeToWrite(incoming, existing)) {
      skipped.push({ turnIndex: index, reason: 'protect-valid-answer' });
      return;
    }
    upserts.push(mergeTurnWrite(incoming, existing));
  });
  return { upserts, skipped };
}

export function claimEvaluationInMemory(session, now = Date.now()) {
  if (!session) return { ok: false, code: 'NOT_FOUND' };
  if (session.evaluationCharged && session.report) {
    return { ok: false, code: 'ALREADY_COMPLETED', session };
  }
  if (session.evaluationInFlight) {
    const lockAt = Date.parse(session.evaluationLockAt || '');
    if (!Number.isFinite(lockAt) || now - lockAt < SPEAKING_B2_EVAL_LOCK_MS) {
      return { ok: false, code: 'IN_FLIGHT' };
    }
  }
  session.evaluationInFlight = true;
  session.evaluationLockAt = new Date(now).toISOString();
  return { ok: true, session };
}

/**
 * Shared-memory claim used to simulate two server processes.
 * The lock lives in `shared`, not in the local session object.
 */
export function createSharedEvaluationClaim(shared) {
  return function claim(session, now = Date.now()) {
    if (shared.evaluationCharged && (shared.report || session.report)) {
      return {
        ok: false,
        code: 'ALREADY_COMPLETED',
        session: { ...session, report: shared.report || session.report, state: 'COMPLETED' },
      };
    }
    if (shared.evaluationInFlight) {
      const lockAt = Date.parse(shared.evaluationLockAt || '');
      if (!Number.isFinite(lockAt) || now - lockAt < SPEAKING_B2_EVAL_LOCK_MS) {
        return { ok: false, code: 'IN_FLIGHT' };
      }
    }
    shared.evaluationInFlight = true;
    shared.evaluationLockAt = new Date(now).toISOString();
    session.evaluationInFlight = true;
    session.evaluationLockAt = shared.evaluationLockAt;
    return { ok: true, session };
  };
}

export function nextSpeakingRowVersion(session) {
  return (Number(session?.rowVersion) || 1) + 1;
}

export function sessionUpdateLost(expectedVersion, storedVersion) {
  if (expectedVersion == null || storedVersion == null) return false;
  return Number(storedVersion) !== Number(expectedVersion);
}

export function buildSessionWritePayload(session) {
  const metadata = buildSpeakingSessionMetadata(session);
  metadata.pendingReport = session.pendingReport || null;
  metadata.report = session.report || null;
  const ended = SPEAKING_B2_TERMINAL_STATES.has(session.state)
    ? session.endedAt || new Date().toISOString()
    : null;
  return {
    v2: {
      state: session.state,
      candidate_speaking_ms: session.candidateSpeakingMs || 0,
      ended_at: ended,
      updated_at: new Date().toISOString(),
      expires_at: session.expiresAt || null,
      access_token_hash: session.accessTokenHash || null,
      user_id: session.userId || null,
      row_version: nextSpeakingRowVersion(session),
      evaluation_charged: Boolean(session.evaluationCharged),
      evaluation_in_flight: Boolean(session.evaluationInFlight),
      evaluation_lock_at: session.evaluationLockAt || null,
      pending_report: session.pendingReport || null,
      report: session.report || null,
      metadata,
    },
    legacy: {
      state: session.state,
      candidate_speaking_ms: session.candidateSpeakingMs || 0,
      ended_at: ended,
      updated_at: new Date().toISOString(),
      expires_at: session.expiresAt || null,
      access_token_hash: session.accessTokenHash || null,
      user_id: session.userId || null,
      metadata,
    },
  };
}
