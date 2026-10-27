import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  SpeakingStoreUnavailableError,
  isSpeakingB2PublishedRuntime,
} from '../services/session-store.js';

describe('speaking B2 persistence mode', () => {
  it('treats production or Vercel as a published runtime that cannot use the temp JSON store', () => {
    const previousNode = process.env.NODE_ENV;
    const previousVercel = process.env.VERCEL;
    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    assert.equal(isSpeakingB2PublishedRuntime(), true);
    process.env.NODE_ENV = 'development';
    process.env.VERCEL = '1';
    assert.equal(isSpeakingB2PublishedRuntime(), true);
    process.env.NODE_ENV = 'development';
    delete process.env.VERCEL;
    assert.equal(isSpeakingB2PublishedRuntime(), false);
    process.env.NODE_ENV = previousNode;
    if (previousVercel == null) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
  });

  it('exposes a controlled store error', () => {
    const error = new SpeakingStoreUnavailableError();
    assert.equal(error.code, 'STORE_UNAVAILABLE');
  });
});
