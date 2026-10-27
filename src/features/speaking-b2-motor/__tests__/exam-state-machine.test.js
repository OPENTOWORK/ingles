import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canTransitionSpeakingB2,
  transitionSpeakingB2,
  isTerminalSpeakingB2State,
} from '../domain/exam-state-machine.js';

describe('speaking B2 state machine', () => {
  it('allows the Part 1 happy path', () => {
    const path = [
      ['READY', 'AUDIO_CHECK'],
      ['AUDIO_CHECK', 'INTRODUCTION'],
      ['INTRODUCTION', 'LISTENING'],
      ['LISTENING', 'TURN_VALIDATION'],
      ['TURN_VALIDATION', 'ASKING'],
      ['ASKING', 'LISTENING'],
      ['TURN_VALIDATION', 'FINISHING'],
      ['FINISHING', 'PROCESSING'],
      ['PROCESSING', 'COMPLETED'],
    ];
    for (const [from, to] of path) {
      assert.equal(canTransitionSpeakingB2(from, to), true, `${from} → ${to}`);
    }
  });

  it('rejects examiner improvisation jumps', () => {
    assert.equal(canTransitionSpeakingB2('READY', 'COMPLETED'), false);
    assert.equal(canTransitionSpeakingB2('PROCESSING', 'ASKING'), false);
    assert.throws(() => transitionSpeakingB2('READY', 'ASKING'), /Invalid speaking state/);
  });

  it('marks terminal states', () => {
    assert.equal(isTerminalSpeakingB2State('COMPLETED'), true);
    assert.equal(isTerminalSpeakingB2State('ABORTED'), true);
    assert.equal(isTerminalSpeakingB2State('LISTENING'), false);
  });
});
