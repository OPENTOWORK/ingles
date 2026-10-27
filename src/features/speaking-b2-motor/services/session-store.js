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

const memory = new Map();
const STORE_PATH = path.join(os.tmpdir(), 'dralo-speaking-b2-sessions.json');
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

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

export function createSpeakingB2SessionId() {
  return randomUUID();
}

export function saveMemorySession(session) {
  memory.set(session.id, session);
  const all = prune(loadDisk());
  all[session.id] = session;
  writeDisk(all);
  return session;
}

export function getMemorySession(sessionId) {
  const fromMemory = memory.get(sessionId);
  const stored = fromMemory || loadDisk()[sessionId] || null;
  if (!stored) return null;
  if (isSpeakingSessionExpired(stored)) {
    memory.delete(sessionId);
    return null;
  }
  if (!fromMemory) memory.set(sessionId, stored);
  return stored;
}

export async function createPersistedSession({ userId, examCode, fixtureMode = false }) {
  const id = createSpeakingB2SessionId();
  const accessToken = createSpeakingAccessToken();
  const createdAt = new Date().toISOString();
  const published = isSpeakingB2PublishedRuntime();
  const sessionDraft = {
    id,
    persisted: false,
    evaluationCharged: false,
    evaluationInFlight: false,
    report: null,
    pendingReport: null,
    answerInFlight: false,
    fixtureMode: Boolean(fixtureMode),
    accessTokenHash: hashSpeakingAccessToken(accessToken),
    ...createSpeakingB2SessionState({ examCode, userId }),
    createdAt,
    expiresAt: speakingSessionExpiresAt(createdAt),
  };

  const admin = getSupabaseAdmin();
  if (admin) {
    try {
      const { data, error } = await admin
        .from('speaking_b2_sessions')
        .insert({
          id,
          user_id: userId,
          exam_code: examCode,
          state: sessionDraft.state,
          started_at: createdAt,
          access_token_hash: sessionDraft.accessTokenHash,
          expires_at: sessionDraft.expiresAt,
          metadata: { examCode, fixtureMode: Boolean(fixtureMode) },
        })
        .select('id')
        .maybeSingle();
      if (!error && data) {
        sessionDraft.persisted = true;
        return { session: saveMemorySession(sessionDraft), accessToken };
      }
      if (published) {
        throw new SpeakingStoreUnavailableError();
      }
    } catch (error) {
      if (error instanceof SpeakingStoreUnavailableError) throw error;
      if (published) throw new SpeakingStoreUnavailableError();
    }
  } else if (published) {
    throw new SpeakingStoreUnavailableError();
  }

  return { session: saveMemorySession(sessionDraft), accessToken };
}

export async function updatePersistedSession(session) {
  saveMemorySession(session);
  const admin = getSupabaseAdmin();
  if (!admin || !session.persisted) return session;
  try {
    await admin
      .from('speaking_b2_sessions')
      .update({
        state: session.state,
        candidate_speaking_ms: session.candidateSpeakingMs || 0,
        ended_at: ['COMPLETED', 'ABORTED', 'FAILED'].includes(session.state)
          ? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
        expires_at: session.expiresAt || null,
        access_token_hash: session.accessTokenHash || null,
        metadata: {
          questionIndex: session.questionIndex,
          currentQuestionId: session.currentQuestionId,
          followUpUsed: session.followUpUsed,
          evaluationCharged: session.evaluationCharged || false,
        },
      })
      .eq('id', session.id);
  } catch {
    /* ignore */
  }
  return session;
}

export function assertSessionOwner(session, userId) {
  if (!session) return false;
  if (!session.userId) return Boolean(userId === null || userId === undefined);
  if (!userId) return false;
  return session.userId === userId;
}

export async function persistSpeakingB2Turns(session) {
  const admin = getSupabaseAdmin();
  if (!admin || !session?.persisted || !Array.isArray(session.turns)) return { persisted: false };
  try {
    await admin.from('speaking_b2_turns').delete().eq('session_id', session.id);
    if (!session.turns.length) return { persisted: true };
    const { error } = await admin.from('speaking_b2_turns').insert(
      session.turns.map((turn) => ({
        session_id: session.id,
        role: turn.role,
        question_id: turn.questionId || null,
        spoken_text: turn.transcript || '',
        transcript: turn.transcript || '',
        stt_confidence: turn.confidence ?? null,
        transcript_source: turn.source || 'STT',
        audio_path: turn.audioPath || null,
        validation: turn.validation || null,
      })),
    );
    if (error) return { persisted: false };
    return { persisted: true };
  } catch {
    return { persisted: false };
  }
}

export async function persistAssessmentAndIssues({ session, assessment, issues, recommendations }) {
  const admin = getSupabaseAdmin();
  if (!admin || !session.persisted) return { persisted: false };
  try {
    const { data, error } = await admin
      .from('speaking_b2_assessments')
      .insert({
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
      })
      .select('id')
      .maybeSingle();
    if (error || !data) return { persisted: false };

    if (issues.length) {
      await admin.from('speaking_b2_issues').insert(
        issues.map((issue) => ({
          id: issue.id,
          session_id: session.id,
          assessment_id: data.id,
          question_id: issue.questionId,
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
      );
    }
    if (recommendations.length) {
      await admin.from('speaking_b2_recommendations').insert(
        recommendations.map((item, index) => ({
          session_id: session.id,
          sort_order: index,
          title: item.title,
          body: item.body,
        })),
      );
    }
    return { persisted: true, assessmentId: data.id };
  } catch {
    return { persisted: false };
  }
}
