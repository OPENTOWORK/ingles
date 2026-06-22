import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPEAKING_LLM_HISTORY_MAX_MESSAGES,
  buildLlmHistoryFromStoredTurns,
  buildSpeakingTurnClientPayload,
  estimateLlmHistoryPayloadChars,
  estimateSpeakingTurnClientPayloadChars,
  estimateSpeakingTurnLlmInputChars,
} from '@/features/speaking/services/sessions/speaking-turn-context.js';

function longText(prefix, repeats) {
  return `${prefix} ${'word '.repeat(repeats)}`.trim();
}

test('buildLlmHistoryFromStoredTurns omits the latest user turn for the current transcript', () => {
  const turns = [
    { role: 'USER', text: 'First answer' },
    { role: 'ASSISTANT', text: 'Second question' },
    { role: 'USER', text: 'Latest answer' },
  ];

  const history = buildLlmHistoryFromStoredTurns(turns, { omitLatestUserTurn: true });

  assert.deepEqual(history, [
    { role: 'user', content: 'First answer' },
    { role: 'assistant', content: 'Second question' },
  ]);
});

function buildTurnPair(index) {
  const userText = `U${String(index).padStart(3, '0')}:${'a'.repeat(100)}`;
  const assistantText = `A${String(index).padStart(3, '0')}:${'b'.repeat(100)}`;
  return [
    { role: 'USER', text: userText },
    { role: 'ASSISTANT', text: assistantText },
  ];
}

/** Simulate DB state after saving the current user turn (before LLM reply). */
function withPendingUserTurn(turns, index) {
  return [...turns, { role: 'USER', text: `P${String(index).padStart(3, '0')}:${'c'.repeat(100)}` }];
}

test('LLM history payload stops growing after the configured window is full', () => {
  const turns = [];
  let plateauSize = 0;

  for (let i = 0; i < 12; i += 1) {
    turns.push(...buildTurnPair(i));
    const stored = withPendingUserTurn(turns, i);
    const history = buildLlmHistoryFromStoredTurns(stored, { omitLatestUserTurn: true });
    assert.equal(
      history.length,
      Math.min(SPEAKING_LLM_HISTORY_MAX_MESSAGES, stored.length - 1),
    );
    const size = estimateLlmHistoryPayloadChars(history);
    if (history.length === SPEAKING_LLM_HISTORY_MAX_MESSAGES) {
      if (plateauSize === 0) plateauSize = size;
      else assert.equal(size, plateauSize, 'history JSON size should plateau');
    }
  }

  assert.ok(plateauSize > 0, 'window should have filled during simulation');
});

test('LLM input for a single turn does not grow with total session length once window is full', () => {
  const turns = [];
  let plateauSize = 0;
  const transcript = `current:${'d'.repeat(100)}`;

  for (let i = 0; i < 15; i += 1) {
    turns.push(...buildTurnPair(i));
    const stored = withPendingUserTurn(turns, i);
    const history = buildLlmHistoryFromStoredTurns(stored, { omitLatestUserTurn: true });
    const inputSize = estimateSpeakingTurnLlmInputChars(history, transcript);
    if (history.length === SPEAKING_LLM_HISTORY_MAX_MESSAGES) {
      if (plateauSize === 0) plateauSize = inputSize;
      else assert.equal(inputSize, plateauSize, 'per-turn LLM input should stay bounded');
    }
  }

  assert.ok(plateauSize > 0);
});

test('client turn payload excludes history and stays constant across turns', () => {
  const base = {
    sessionId: 'local_test_session',
    cefr: 'B2',
    mode: 'EXAM',
    prompt: 'Interview practice',
    examPartIndex: 0,
    b2PartNumber: 14,
    taskContext: 'Part 1 context',
  };

  let firstSize = 0;

  for (let i = 0; i < 10; i += 1) {
    const payload = buildSpeakingTurnClientPayload({
      ...base,
      text: longText(`Answer ${i}`, 30),
    });
    assert.equal(Object.hasOwn(payload, 'history'), false);
    const size = estimateSpeakingTurnClientPayloadChars(payload);
    if (i === 0) firstSize = size;
    else assert.equal(size, firstSize, 'client JSON payload size must not grow with turn count');
  }
});

test('legacy client history would grow without the server-side window', () => {
  const legacyHistory = [];
  let legacySize = 0;

  for (let i = 0; i < 6; i += 1) {
    legacyHistory.push(
      { role: 'user', content: longText(`User ${i}`, 40) },
      { role: 'assistant', content: longText(`Assistant ${i}`, 25) },
    );
    const size = JSON.stringify(legacyHistory).length;
    if (i === 0) legacySize = size;
    else assert.ok(size > legacySize, 'sanity check: old approach grows indefinitely');
    legacySize = size;
  }
});
