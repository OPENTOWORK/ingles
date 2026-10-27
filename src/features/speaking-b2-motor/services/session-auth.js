import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export const SPEAKING_B2_SESSION_HEADER = 'x-speaking-session';
export const SPEAKING_B2_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function createSpeakingAccessToken() {
  return randomBytes(32).toString('hex');
}

export function hashSpeakingAccessToken(token) {
  return createHash('sha256').update(String(token || ''), 'utf8').digest('hex');
}

export function speakingSessionExpiresAt(createdAt = new Date()) {
  return new Date(new Date(createdAt).getTime() + SPEAKING_B2_SESSION_TTL_MS).toISOString();
}

export function isSpeakingSessionExpired(session, now = Date.now()) {
  const expires = Date.parse(session?.expiresAt || '');
  if (Number.isFinite(expires)) return now >= expires;
  const created = Date.parse(session?.createdAt || '');
  if (!Number.isFinite(created)) return true;
  return now - created >= SPEAKING_B2_SESSION_TTL_MS;
}

export function readSpeakingAccessToken(req, body = {}) {
  const header = req?.headers?.get?.(SPEAKING_B2_SESSION_HEADER);
  if (header && String(header).trim()) return String(header).trim();
  if (body?.accessToken) return String(body.accessToken).trim();
  return '';
}

function hashesEqual(left, right) {
  const a = Buffer.from(String(left || ''), 'utf8');
  const b = Buffer.from(String(right || ''), 'utf8');
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

/**
 * Session-scoped bearer token. It is issued once, stored only as a hash,
 * and remains valid for this session until expiry. It is not a one-time token
 * and it cannot authorize any other session.
 */
export function assertSpeakingSessionAccess(session, { userId = null, accessToken = '' } = {}) {
  if (!session) return false;
  if (isSpeakingSessionExpired(session)) return false;
  if (!session.accessTokenHash || !accessToken) return false;
  if (!hashesEqual(session.accessTokenHash, hashSpeakingAccessToken(accessToken))) return false;
  if (session.userId) {
    if (!userId) return false;
    return session.userId === userId;
  }
  return true;
}

export function authorizeSpeakingSession(session, { userId = null, accessToken = '' } = {}) {
  if (!session) return { ok: false, status: 404, error: 'Session not found', code: 'NOT_FOUND' };
  if (isSpeakingSessionExpired(session)) {
    return { ok: false, status: 410, error: 'Session expired', code: 'EXPIRED' };
  }
  if (!assertSpeakingSessionAccess(session, { userId, accessToken })) {
    return { ok: false, status: 403, error: 'Forbidden', code: 'FORBIDDEN' };
  }
  return { ok: true };
}

export function bindGuestSessionToUser(session, userId) {
  if (!session || !userId) {
    return { ok: false, status: 401, error: 'Inicia sesión para ver el informe.', code: 'AUTH_REQUIRED' };
  }
  if (!session.userId) {
    session.userId = userId;
    session.boundAt = new Date().toISOString();
    return { ok: true, bound: true };
  }
  if (session.userId !== userId) {
    return { ok: false, status: 403, error: 'Forbidden', code: 'FORBIDDEN' };
  }
  return { ok: true, bound: false };
}

export function sanitizeSpeakingLog(value) {
  if (!value || typeof value !== 'object') return value;
  const next = { ...value };
  delete next.accessToken;
  delete next.accessTokenHash;
  return next;
}
