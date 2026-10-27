import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertSpeakingSessionAccess,
  authorizeSpeakingSession,
  bindGuestSessionToUser,
  createSpeakingAccessToken,
  hashSpeakingAccessToken,
  isSpeakingSessionExpired,
  sanitizeSpeakingLog,
  speakingSessionExpiresAt,
} from '../services/session-auth.js';

function freshSession(extra = {}) {
  const createdAt = new Date().toISOString();
  return {
    createdAt,
    expiresAt: speakingSessionExpiresAt(createdAt),
    ...extra,
  };
}

describe('speaking B2 session authorization', () => {
  it('rejects a session when only the UUID is known', () => {
    const token = createSpeakingAccessToken();
    const session = freshSession({
      id: '11111111-1111-1111-1111-111111111111',
      userId: null,
      accessTokenHash: hashSpeakingAccessToken(token),
    });
    assert.equal(assertSpeakingSessionAccess(session, { userId: null, accessToken: '' }), false);
    assert.equal(authorizeSpeakingSession(session, { accessToken: '' }).status, 403);
  });

  it('accepts a guest session only with the access token', () => {
    const token = createSpeakingAccessToken();
    const session = freshSession({
      id: '22222222-2222-2222-2222-222222222222',
      userId: null,
      accessTokenHash: hashSpeakingAccessToken(token),
    });
    assert.equal(assertSpeakingSessionAccess(session, { accessToken: token }), true);
    assert.equal(assertSpeakingSessionAccess(session, { accessToken: 'deadbeef' }), false);
  });

  it('rejects another authenticated user even with a valid-looking token', () => {
    const token = createSpeakingAccessToken();
    const session = freshSession({
      id: '33333333-3333-3333-3333-333333333333',
      userId: 'owner-1',
      accessTokenHash: hashSpeakingAccessToken(token),
    });
    assert.equal(assertSpeakingSessionAccess(session, { userId: 'owner-1', accessToken: token }), true);
    assert.equal(assertSpeakingSessionAccess(session, { userId: 'intruder', accessToken: token }), false);
    assert.equal(assertSpeakingSessionAccess(session, { userId: null, accessToken: token }), false);
  });

  it('does not let one session token open another session', () => {
    const tokenA = createSpeakingAccessToken();
    const tokenB = createSpeakingAccessToken();
    const sessionB = freshSession({
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      userId: null,
      accessTokenHash: hashSpeakingAccessToken(tokenB),
    });
    assert.equal(assertSpeakingSessionAccess(sessionB, { accessToken: tokenA }), false);
  });

  it('rejects expired sessions', () => {
    const token = createSpeakingAccessToken();
    const session = {
      id: '44444444-4444-4444-4444-444444444444',
      userId: null,
      accessTokenHash: hashSpeakingAccessToken(token),
      createdAt: '2020-01-01T00:00:00.000Z',
      expiresAt: '2020-01-02T00:00:00.000Z',
    };
    assert.equal(isSpeakingSessionExpired(session), true);
    assert.equal(authorizeSpeakingSession(session, { accessToken: token }).status, 410);
  });

  it('binds a guest session once and then rejects another user', () => {
    const session = freshSession({ userId: null });
    assert.equal(bindGuestSessionToUser(session, 'user-a').bound, true);
    assert.equal(session.userId, 'user-a');
    assert.equal(bindGuestSessionToUser(session, 'user-b').code, 'FORBIDDEN');
    assert.equal(session.userId, 'user-a');
  });

  it('never logs token material', () => {
    const cleaned = sanitizeSpeakingLog({ accessToken: 'secret', accessTokenHash: 'hash', id: 'x' });
    assert.equal(cleaned.accessToken, undefined);
    assert.equal(cleaned.accessTokenHash, undefined);
    assert.equal(cleaned.id, 'x');
  });
});
