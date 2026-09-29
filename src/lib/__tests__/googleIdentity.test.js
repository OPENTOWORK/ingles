import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { webcrypto } from 'node:crypto';
import { getGoogleClientId, createGoogleIdTokenNonce } from '@/lib/googleIdentity.js';

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
