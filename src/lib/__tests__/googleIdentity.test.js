import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { webcrypto } from 'node:crypto';
import { getGoogleClientId, createGoogleIdTokenNonce } from '@/lib/googleIdentity.js';
import { nativeAuthCallbackTarget } from '@/lib/nativeGoogleAuth.js';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

describe('googleIdentity', () => {
  it('rejects a missing or malformed Google client id', () => {
    assert.equal(getGoogleClientId(), '');
  });

  it('builds a raw nonce and a sha-256 hex hash', async () => {
    const { nonce, hashedNonce } = await createGoogleIdTokenNonce();
    assert.equal(typeof nonce, 'string');
    assert.ok(nonce.length > 20);
    assert.match(hashedNonce, /^[a-f0-9]{64}$/);
    assert.notEqual(nonce, hashedNonce);
  });
});

describe('native google return', () => {
  it('keeps the code and the hash when Google returns to the app', () => {
    assert.equal(
      nativeAuthCallbackTarget('dralo://auth/callback?code=abc'),
      '/auth/callback/?code=abc',
    );
    assert.equal(
      nativeAuthCallbackTarget('dralo://auth/callback?error=access_denied#error'),
      '/auth/callback/?error=access_denied#error',
    );
    assert.equal(nativeAuthCallbackTarget('https://www.dralo.es/auth/callback/?code=abc'), null);
    assert.equal(nativeAuthCallbackTarget('dralo://billing/callback?code=abc'), null);
  });
});
