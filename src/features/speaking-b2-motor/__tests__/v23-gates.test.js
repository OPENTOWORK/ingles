import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  inspectSpeakingB2TestTarget,
  readSpeakingB2TestTargetFromEnv,
  SPEAKING_B2_TEST_AUTH_VALUE,
  speakingB2LooksLikeProduction,
  speakingB2MustPersistStore,
} from '../services/test-target-guard.js';

describe('speaking B2 V2.3 remote and two-Next gates', () => {
  it('refuses ENGLISH_PROD and dralo.es', () => {
    assert.equal(speakingB2LooksLikeProduction('https://qnazrzvwvkwhkfbqsbmr.supabase.co'), true);
    assert.equal(speakingB2LooksLikeProduction('https://www.dralo.es'), true);
    assert.equal(
      inspectSpeakingB2TestTarget({
        url: 'https://qnazrzvwvkwhkfbqsbmr.supabase.co',
        authorized: SPEAKING_B2_TEST_AUTH_VALUE,
        projectRef: 'qnazrzvwvkwhkfbqsbmr',
      }).code,
      'PROD_REFUSED',
    );
  });

  it('does not treat an unauthorized or missing test project as ready', () => {
    assert.equal(inspectSpeakingB2TestTarget({}).code, 'MISSING_TEST_URL');
    assert.equal(
      inspectSpeakingB2TestTarget({
        url: 'https://example.supabase.co',
        projectRef: 'example',
      }).code,
      'NOT_AUTHORIZED',
    );
    assert.equal(readSpeakingB2TestTargetFromEnv({}).ok, false);
  });

  it('accepts only an isolated project whose ref matches the host', () => {
    const ok = inspectSpeakingB2TestTarget({
      url: 'https://abcdtestxxxx.supabase.co',
      projectRef: 'abcdtestxxxx',
      authorized: SPEAKING_B2_TEST_AUTH_VALUE,
    });
    assert.equal(ok.ok, true);
    assert.equal(
      inspectSpeakingB2TestTarget({
        url: 'https://abcdtestxxxx.supabase.co',
        projectRef: 'otherref',
        authorized: SPEAKING_B2_TEST_AUTH_VALUE,
      }).code,
      'REF_MISMATCH',
    );
  });

  it('requires persist when the local app is wired to ENGLISH_PROD', () => {
    assert.equal(
      speakingB2MustPersistStore({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'https://qnazrzvwvkwhkfbqsbmr.supabase.co',
      }),
      true,
    );
  });
});
