import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canFinalizeSpeakingB2Quota,
  describeSpeakingB2QuotaCrashWindow,
  interpretSpeakingB2ChargeRow,
} from '../services/quota-finalize.js';

describe('speaking B2 quota state machine (unit)', () => {
  it('does not treat a claimed row as a completed consume', () => {
    const claimed = interpretSpeakingB2ChargeRow({ status: 'claimed' });
    assert.equal(claimed.state, 'pending');
    assert.equal(claimed.already, false);
    assert.equal(claimed.canConsume, false);
    assert.equal(claimed.unknownConsume, true);

    const consumed = interpretSpeakingB2ChargeRow({ status: 'consumed' });
    assert.equal(consumed.already, true);
    assert.equal(consumed.canConsume, false);

    const failed = interpretSpeakingB2ChargeRow({ status: 'failed' });
    assert.equal(failed.canConsume, true);
    assert.equal(failed.already, false);
  });

  it('refuses to charge when there is no report', () => {
    assert.equal(canFinalizeSpeakingB2Quota({ evaluationCharged: false }).ok, false);
    assert.equal(canFinalizeSpeakingB2Quota({ pendingReport: { scores: {} } }).ok, true);
    assert.equal(canFinalizeSpeakingB2Quota({ evaluationCharged: true, pendingReport: {} }).already, true);
  });

  it('documents crash windows without inventing exactly-once for the split JS path', () => {
    const claimed = describeSpeakingB2QuotaCrashWindow('after_claimed_row_before_counter');
    assert.equal(claimed.claimedMeansConsumed, false);
    const split = describeSpeakingB2QuotaCrashWindow('after_counter_before_consumed_row');
    assert.equal(split.exactlyOnce, false);
    const tx = describeSpeakingB2QuotaCrashWindow('after_consume_transaction');
    assert.equal(tx.exactlyOnce, true);
  });
});
