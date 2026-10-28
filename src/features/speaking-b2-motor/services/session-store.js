import { randomUUID } from 'crypto';
import { readFileSync, renameSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';
import { getSupabaseAdmin } from '@/lib/aiUsage';
import { createSpeakingB2SessionState } from './coordinator.js';
import {
  createSpeakingAccessToken,
  hashSpeakingAccessToken,
  isSpeakingSessionExpired,
  speakingSessionExpiresAt,
} from './session-auth.js';
import {
  SpeakingStoreConflictError,
  buildSessionWritePayload,
  claimEvaluationInMemory,
  hydrateSpeakingB2Session,
  isMissingRelationError,
  isUniqueViolation,
  partitionSpeakingB2TurnWrites,
  planSpeakingB2TurnWrites,
} from './session-persistence.js';
import { interpretSpeakingB2ChargeRow } from './quota-finalize.js';
import { buildSpeakingB2SessionPlan, summariseRecentSpeakingB2Plans } from './session-plan.js';
import { speakingB2MustPersistStore } from './test-target-guard.js';

const memory = new Map();
const STORE_PATH = path.join(os.tmpdir(), 'dralo-speaking-b2-sessions.json');
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export { SpeakingStoreConflictError, claimEvaluationInMemory };

export function isSpeakingB2PublishedRuntime() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

export class SpeakingStoreUnavailableError extends Error {
  constructor(message = 'Speaking store unavailable') {
    super(message);
    this.name = 'SpeakingStoreUnavailableError';
    this.code = 'STORE_UNAVAILABLE';
  }
}

/** Published / ENGLISH_PROD must persist. Memory is only allowed in isolated local runs. */
export function decideSpeakingB2SessionPersist({ persistRequired, saved, errorMessage } = {}) {
  if (saved) return { persisted: true, allowMemoryFallback: false };
  if (persistRequired) {
    throw new SpeakingStoreUnavailableError(errorMessage || 'Speaking storage is not ready.');
  }
  return { persisted: false, allowMemoryFallback: true };
}

function loadDisk() {
  try {
    return JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeDisk(all) {
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(all));
  renameSync(tmp, STORE_PATH);
}

function prune(all, now = Date.now()) {
  const next = {};
  for (const [id, session] of Object.entries(all)) {
    const created = Date.parse(session.createdAt || '') || 0;
    if (created && now - created > MAX_AGE_MS) continue;
    next[id] = session;
  }
  return next;
}

function remember(session) {
  if (!session?.id) return session;
  memory.set(session.id, session);
  return session;
}

function forget(sessionId) {
  memory.delete(sessionId);
}

export function createSpeakingB2SessionId() {
  return randomUUID();
}

export function saveMemorySession(session) {
  remember(session);
  if (speakingB2MustPersistStore()) return session;
  const all = prune(loadDisk());
  all[session.id] = session;
  writeDisk(all);
  return session;
}

export function getMemorySession(sessionId) {
  const fromMemory = memory.get(sessionId);
  const stored = fromMemory || (speakingB2MustPersistStore() ? null : loadDisk()[sessionId]) || null;
  if (!stored) return null;
  if (isSpeakingSessionExpired(stored)) {
    forget(sessionId);
    return null;
  }
  if (!fromMemory) remember(stored);
  return stored;
}

function requireAdmin(published, admin) {
  if (!admin && published) throw new SpeakingStoreUnavailableError();
  return admin;
}

function throwIfPublishedSchemaMissing(error, published) {
  if (error && isMissingRelationError(error) && published) {
    throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
  }
}

export async function probeSpeakingB2V2Schema(admin) {
  if (!admin) return { ready: false, reason: 'NO_ADMIN' };
  const sessionProbe = await admin
    .from('speaking_b2_sessions')
    .select('id, row_version, evaluation_charged, evaluation_in_flight, pending_report')
    .limit(1);
  if (sessionProbe.error) {
    return { ready: false, reason: sessionProbe.error.message, code: sessionProbe.error.code };
  }
  const chargeProbe = await admin.from('speaking_b2_quota_charges').select('session_id, status').limit(1);
  if (chargeProbe.error) {
    return { ready: false, reason: chargeProbe.error.message, code: chargeProbe.error.code };
  }
  return { ready: true };
}

export async function assertSpeakingB2V2Ready(admin, published = speakingB2MustPersistStore()) {
  const probe = await probeSpeakingB2V2Schema(admin);
  if (!probe.ready && published) {
    throw new SpeakingStoreUnavailableError(probe.reason || 'SCHEMA_V2_REQUIRED');
  }
  return probe;
}

async function fetchSessionRow(admin, sessionId) {
  const { data, error } = await admin
    .from('speaking_b2_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (error) throw new SpeakingStoreUnavailableError(error.message);
  return data || null;
}

async function fetchSessionTurns(admin, sessionId) {
  const { data, error } = await admin
    .from('speaking_b2_turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_index', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) {
    throwIfPublishedSchemaMissing(error, speakingB2MustPersistStore());
    if (isMissingRelationError(error)) return [];
    throw new SpeakingStoreUnavailableError(error.message);
  }
  return data || [];
}

async function fetchSessionAssessment(admin, sessionId) {
  const { data, error } = await admin
    .from('speaking_b2_assessments')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (error) {
    throwIfPublishedSchemaMissing(error, speakingB2MustPersistStore());
    if (isMissingRelationError(error)) return null;
    throw new SpeakingStoreUnavailableError(error.message);
  }
  return data || null;
}

export async function loadSessionFromSupabase(sessionId, admin = getSupabaseAdmin()) {
  if (!admin || !sessionId) return null;
  const row = await fetchSessionRow(admin, sessionId);
  if (!row) return null;
  const [turns, assessment] = await Promise.all([
    fetchSessionTurns(admin, sessionId),
    fetchSessionAssessment(admin, sessionId),
  ]);
  const session = hydrateSpeakingB2Session(row, turns, assessment);
  if (isSpeakingSessionExpired(session)) return null;
  return session;
}

/**
 * Published runtimes load from Supabase only. The temp JSON file is never
 * consulted in production / Vercel, even if a leftover file exists.
 */
export async function loadSpeakingB2Session(sessionId) {
  const published = speakingB2MustPersistStore();
  const admin = getSupabaseAdmin();

  if (published) {
    requireAdmin(true, admin);
    const session = await loadSessionFromSupabase(sessionId, admin);
    return session ? remember(session) : null;
  }

  const local = getMemorySession(sessionId);
  if (local) return local;
  if (!admin) return null;
  try {
    const session = await loadSessionFromSupabase(sessionId, admin);
    return session ? saveMemorySession(session) : null;
  } catch (error) {
    if (error instanceof SpeakingStoreUnavailableError) return null;
    throw error;
  }
}

/** Best effort: a failed lookup only means the plan cannot avoid repeats. */
async function loadRecentSpeakingB2Plans(admin, userId, limit = 4) {
  if (!admin || !userId) return summariseRecentSpeakingB2Plans([]);
  try {
    const { data, error } = await admin
      .from('speaking_b2_sessions')
      .select('metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return summariseRecentSpeakingB2Plans([]);
    return summariseRecentSpeakingB2Plans(data || []);
  } catch {
    return summariseRecentSpeakingB2Plans([]);
  }
}

export async function createPersistedSession({ userId, examCode, fixtureMode = false, localHour = null }) {
  const id = createSpeakingB2SessionId();
  const accessToken = createSpeakingAccessToken();
  const createdAt = new Date().toISOString();
  const published = speakingB2MustPersistStore();
  const admin = getSupabaseAdmin();
  const plan = fixtureMode
    ? null
    : buildSpeakingB2SessionPlan({
        examCode,
        localHour,
        recent: await loadRecentSpeakingB2Plans(admin, userId),
      });
  const sessionDraft = {
    id,
    persisted: false,
    evaluationCharged: false,
    evaluationInFlight: false,
    evaluationLockAt: null,
    report: null,
    pendingReport: null,
    answerInFlight: false,
    fixtureMode: Boolean(fixtureMode),
    accessTokenHash: hashSpeakingAccessToken(accessToken),
    rowVersion: 1,
    ...createSpeakingB2SessionState({ examCode, userId }),
    plan,
    createdAt,
    expiresAt: speakingSessionExpiresAt(createdAt),
  };

  if (admin) {
    const insertRow = {
      id,
      user_id: userId,
      exam_code: examCode,
      state: sessionDraft.state,
      started_at: createdAt,
      access_token_hash: sessionDraft.accessTokenHash,
      expires_at: sessionDraft.expiresAt,
      row_version: 1,
      evaluation_charged: false,
      evaluation_in_flight: false,
      metadata: buildSessionWritePayload(sessionDraft).v2.metadata,
    };
    try {
      let { data, error } = await admin
        .from('speaking_b2_sessions')
        .insert(insertRow)
        .select('id')
        .maybeSingle();
      if (error && isMissingRelationError(error)) {
        if (published) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
        delete insertRow.row_version;
        delete insertRow.evaluation_charged;
        delete insertRow.evaluation_in_flight;
        ({ data, error } = await admin
          .from('speaking_b2_sessions')
          .insert(insertRow)
          .select('id')
          .maybeSingle());
      }
      if (error || !data) {
        decideSpeakingB2SessionPersist({
          persistRequired: published,
          saved: false,
          errorMessage: error?.message,
        });
      } else {
        sessionDraft.persisted = decideSpeakingB2SessionPersist({
          persistRequired: published,
          saved: true,
        }).persisted;
        return { session: saveMemorySession(sessionDraft), accessToken };
      }
    } catch (error) {
      if (error instanceof SpeakingStoreUnavailableError) throw error;
      decideSpeakingB2SessionPersist({ persistRequired: published, saved: false, errorMessage: error?.message });
    }
  } else if (published) {
    throw new SpeakingStoreUnavailableError();
  }

  sessionDraft.persisted = false;
  decideSpeakingB2SessionPersist({ persistRequired: published, saved: false });
  return { session: saveMemorySession(sessionDraft), accessToken };
}

async function writeSessionToSupabase(admin, session, published) {
  const payloads = buildSessionWritePayload(session);
  const expectedVersion = session.rowVersion || 1;

  const attempt = async (payload, withVersion) => {
    let query = admin.from('speaking_b2_sessions').update(payload).eq('id', session.id);
    if (withVersion && payload.row_version != null) {
      query = query.eq('row_version', expectedVersion);
    }
    return query.select('id, row_version').maybeSingle();
  };

  let { data, error } = await attempt(payloads.v2, true);
  if (error && isMissingRelationError(error)) {
    if (published) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
    ({ data, error } = await attempt(payloads.legacy, false));
  }
  if (error) {
    if (published) throw new SpeakingStoreUnavailableError(error.message);
    return session;
  }
  if (!data) {
    throw new SpeakingStoreConflictError();
  }
  session.rowVersion = data.row_version || payloads.v2.row_version;
  session.persisted = true;
  return session;
}

export async function updatePersistedSession(session) {
  const published = speakingB2MustPersistStore();
  const admin = getSupabaseAdmin();

  if (published) {
    requireAdmin(true, admin);
    const next = await writeSessionToSupabase(admin, session, true);
    return remember(next);
  }

  saveMemorySession(session);
  if (!admin || !session.persisted) return session;
  try {
    return await writeSessionToSupabase(admin, session, false);
  } catch (error) {
    if (error instanceof SpeakingStoreConflictError) throw error;
    return session;
  }
}

export function assertSessionOwner(session, userId) {
  if (!session) return false;
  if (!session.userId) return Boolean(userId === null || userId === undefined);
  if (!userId) return false;
  return session.userId === userId;
}

export async function persistSpeakingB2Turns(session) {
  const published = speakingB2MustPersistStore();
  const admin = getSupabaseAdmin();
  if (!admin || !session?.persisted || !Array.isArray(session.turns)) {
    if (published && session?.persisted) throw new SpeakingStoreUnavailableError();
    return { persisted: false };
  }

  const { data: existing, error: readError } = await admin
    .from('speaking_b2_turns')
    .select('id, session_id, turn_index, transcript, spoken_text, audio_path, role, question_id')
    .eq('session_id', session.id);
  if (readError) {
    if (published) throw new SpeakingStoreUnavailableError(readError.message);
    return { persisted: false };
  }

  const { upserts } = planSpeakingB2TurnWrites(existing || [], session.turns, session.id);
  if (!upserts.length) return { persisted: true, skipped: true };

  const { inserts, updates } = partitionSpeakingB2TurnWrites(upserts, existing || []);

  if (inserts.length) {
    const { error } = await admin.from('speaking_b2_turns').insert(inserts);
    if (error && !isUniqueViolation(error)) {
      console.error('[speaking-b2/turns] insert', error.code, error.message, error.details || '');
      if (isMissingRelationError(error)) {
        if (published) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
        return { persisted: false };
      }
      if (published) throw new SpeakingStoreUnavailableError(error.message);
      return { persisted: false };
    }
  }

  for (const row of updates) {
    const { session_id: sessionId, turn_index: turnIndex, ...patch } = row;
    const { error } = await admin
      .from('speaking_b2_turns')
      .update(patch)
      .eq('session_id', sessionId)
      .eq('turn_index', turnIndex);
    if (error) {
      console.error('[speaking-b2/turns] update', error.code, error.message, error.details || '');
      if (isMissingRelationError(error)) {
        if (published) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
        return { persisted: false };
      }
      if (published) throw new SpeakingStoreUnavailableError(error.message);
      return { persisted: false };
    }
  }

  return { persisted: true };
}

export async function persistAssessmentAndIssues({ session, assessment, issues, recommendations }) {
  const published = speakingB2MustPersistStore();
  const admin = getSupabaseAdmin();
  if (!admin || !session.persisted) {
    if (published && session.persisted) throw new SpeakingStoreUnavailableError();
    return { persisted: false };
  }

  const row = {
    session_id: session.id,
    user_id: session.userId,
    grammar_vocabulary: assessment.scores.grammarVocabulary,
    discourse_management: assessment.scores.discourseManagement,
    pronunciation: assessment.scores.pronunciation,
    interactive_communication: assessment.scores.interactiveCommunication,
    global_achievement: assessment.scores.globalAchievement,
    official_cambridge: false,
    evidence: assessment.evidence,
    payload: assessment,
  };

  const { data, error } = await admin
    .from('speaking_b2_assessments')
    .upsert(row, { onConflict: 'session_id' })
    .select('id')
    .maybeSingle();
  if (error || !data) {
    if (published) throw new SpeakingStoreUnavailableError(error?.message);
    return { persisted: false };
  }

  if (issues?.length) {
    const { error: issueError } = await admin.from('speaking_b2_issues').upsert(
      issues.map((issue) => ({
        id: issue.id,
        session_id: session.id,
        assessment_id: data.id,
        question_id: issue.questionId || null,
        code: issue.code,
        original_text: issue.originalText,
        excerpt: issue.excerpt,
        suggestion: issue.suggestion,
        explanation: issue.explanation,
        severity: issue.severity,
        confidence: issue.confidence,
        evidence: issue.evidence,
        audio_start_ms: issue.audioStartMs,
        skill_to_reinforce: issue.skillToReinforce,
      })),
      { onConflict: 'id' },
    );
    if (issueError && published) throw new SpeakingStoreUnavailableError(issueError.message);
  }
  if (recommendations?.length) {
    const { error: recError } = await admin.from('speaking_b2_recommendations').upsert(
      recommendations.map((item, index) => ({
        session_id: session.id,
        sort_order: index,
        title: item.title,
        body: item.body,
      })),
      { onConflict: 'session_id,sort_order' },
    );
    if (recError && published) throw new SpeakingStoreUnavailableError(recError.message);
  }
  return { persisted: true, assessmentId: data.id };
}

export async function claimSpeakingB2Evaluation(session) {
  const published = speakingB2MustPersistStore();
  const admin = getSupabaseAdmin();
  if (!admin || !session?.persisted) {
    return claimEvaluationInMemory(session);
  }

  const now = new Date().toISOString();
  const stale = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const nextVersion = (Number(session.rowVersion) || 1) + 1;

  let { data, error } = await admin
    .from('speaking_b2_sessions')
    .update({
      evaluation_in_flight: true,
      evaluation_lock_at: now,
      row_version: nextVersion,
      updated_at: now,
    })
    .eq('id', session.id)
    .eq('evaluation_charged', false)
    .or(`evaluation_in_flight.eq.false,evaluation_lock_at.lt.${stale}`)
    .in('state', ['FINISHING', 'PROCESSING'])
    .select('*')
    .maybeSingle();

  if (error && isMissingRelationError(error)) {
    if (published) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
    return claimEvaluationInMemory(session);
  }
  if (error) {
    if (published) throw new SpeakingStoreUnavailableError(error.message);
    return claimEvaluationInMemory(session);
  }
  if (!data) {
    const latest = await loadSessionFromSupabase(session.id, admin);
    if (latest?.report) return { ok: false, code: 'ALREADY_COMPLETED', session: latest };
    return { ok: false, code: 'IN_FLIGHT' };
  }
  const claimed = hydrateSpeakingB2Session(data, session.turns, null);
  claimed.turns = session.turns;
  claimed.pendingReport = session.pendingReport;
  claimed.report = session.report;
  claimed.evaluationInFlight = true;
  claimed.evaluationLockAt = now;
  claimed.rowVersion = data.row_version || nextVersion;
  remember(claimed);
  return { ok: true, session: claimed };
}

export async function claimSpeakingB2QuotaCharge({ sessionId, userId }) {
  const published = speakingB2MustPersistStore();
  const admin = getSupabaseAdmin();
  if (!admin) {
    if (published) throw new SpeakingStoreUnavailableError();
    return { ok: true, skipped: true };
  }
  const { data, error } = await admin
    .from('speaking_b2_quota_charges')
    .insert({
      session_id: sessionId,
      user_id: userId,
      usage_key: 'speaking_correction',
      status: 'claimed',
    })
    .select('session_id')
    .maybeSingle();
  if (error && isUniqueViolation(error)) {
    const existing = await admin
      .from('speaking_b2_quota_charges')
      .select('session_id, status')
      .eq('session_id', sessionId)
      .maybeSingle();
    const parsed = interpretSpeakingB2ChargeRow(existing.data);
    if (parsed.already) return { ok: true, already: true };
    return { ok: false, code: 'CHARGE_PENDING', unknownConsume: parsed.unknownConsume };
  }
  if (error && isMissingRelationError(error)) {
    if (published) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
    return { ok: true, skipped: true };
  }
  if (error) {
    if (published) throw new SpeakingStoreUnavailableError(error.message);
    return { ok: false, error };
  }
  return { ok: true, already: false, claimed: Boolean(data) };
}

export async function confirmSpeakingB2QuotaCharge(sessionId) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: true, skipped: true };
  const { error } = await admin
    .from('speaking_b2_quota_charges')
    .update({ status: 'consumed', consumed_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('status', 'claimed');
  if (error && isMissingRelationError(error)) {
    if (speakingB2MustPersistStore()) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
    return { ok: true, skipped: true };
  }
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function releaseSpeakingB2QuotaCharge(sessionId) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: true, skipped: true };
  const { error } = await admin
    .from('speaking_b2_quota_charges')
    .delete()
    .eq('session_id', sessionId)
    .in('status', ['claimed', 'reserved', 'failed']);
  if (error && isMissingRelationError(error)) {
    if (speakingB2MustPersistStore()) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
    return { ok: true, skipped: true };
  }
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function finalizeSpeakingB2QuotaCharge({
  session,
  userId,
  periodType,
  periodKey,
  limit,
  dailyAction = null,
  dailyDate = null,
  dailyLimit = null,
}) {
  const published = speakingB2MustPersistStore();
  const admin = getSupabaseAdmin();
  if (!speakingSessionHasReport(session)) {
    return { ok: false, status: 409, body: { code: 'NO_REPORT' } };
  }
  if (session.evaluationCharged) {
    return { ok: true, already: true };
  }
  if (!admin) {
    if (published) throw new SpeakingStoreUnavailableError();
    return { ok: true, skipped: true };
  }
  await assertSpeakingB2V2Ready(admin, published);
  const { data, error } = await admin.rpc('speaking_b2_consume_session_quota', {
    p_session_id: session.id,
    p_user_id: userId,
    p_usage_key: 'speaking_correction',
    p_period_type: periodType || 'month',
    p_period_key: periodKey || new Date().toISOString().slice(0, 7),
    p_limit: limit ?? null,
    p_daily_action: dailyAction,
    p_daily_date: dailyDate,
    p_daily_limit: dailyLimit ?? null,
  });
  if (error) {
    if (isMissingRelationError(error) || error.code === '42883') {
      if (published) throw new SpeakingStoreUnavailableError(error.message || 'SCHEMA_V2_REQUIRED');
      return { ok: false, status: 503, body: { code: 'SCHEMA_V2_REQUIRED' } };
    }
    if (published) throw new SpeakingStoreUnavailableError(error.message);
    return { ok: false, status: 503, body: { code: 'STORE_UNAVAILABLE' } };
  }
  const payload = data && typeof data === 'object' ? data : {};
  if (!payload.ok) {
    return {
      ok: false,
      status:
        payload.code === 'PLAN_LIMIT_REACHED' ||
        payload.code === 'DAILY_LIMIT_REACHED' ||
        payload.code === 'PLAN_FEATURE_LOCKED'
          ? 429
          : payload.code === 'AUTH_REQUIRED'
            ? 401
            : 409,
      body: { code: payload.code || 'CHARGE_FAILED' },
    };
  }
  return {
    ok: true,
    already: Boolean(payload.already),
    consumed: Boolean(payload.consumed),
    evaluationCharged: true,
    rowVersion: payload.rowVersion,
  };
}

function speakingSessionHasReport(session) {
  return Boolean(session?.pendingReport || session?.report);
}
