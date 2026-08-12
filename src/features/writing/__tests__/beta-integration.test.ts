/**
 * Phase 10 → global rollout — feature flag, routing, and integration boundaries.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  isWritingEngineV3FlagEnabled,
  resolveWritingV3Access,
  getWritingEngineV3ModelConfig,
  WRITING_V3_BETA_MODEL_ID,
} from '../config/writing-v3-flags';
import { resolveWritingV3TaskType } from '../services/orchestration/task-type-resolve';
import { summariseProviderUsage } from '../services/orchestration/openai-runtime-client';
import { createWritingEngineMemoryDb } from '../services/persistence/writing-engine-memory-db';
import {
  createWritingEngineRepository,
  PROTECTED_LEGACY_TABLES,
} from '../services/persistence/writing-engine.repository';
import { runWritingEngine } from '../services/orchestration/writing-engine.service';
import { WRITING_ENGINE_VERSION } from '../domain/engine-version';

const ROOT = process.cwd();

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function withEnv(vars, fn) {
  const prev = {};
  for (const [k, v] of Object.entries(vars)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test('A — kill switch OFF forces legacy for everyone', () => {
  withEnv({ DRALO_WRITING_ENGINE_V3_ENABLED: 'false' }, () => {
    assert.equal(isWritingEngineV3FlagEnabled(), false);
    const access = resolveWritingV3Access({
      userId: 'u1',
      email: 'student@example.com',
      roleName: 'student',
    });
    assert.equal(access.allowed, false);
    assert.equal(access.reason, 'kill_switch_off');
  });
});

test('B — default (unset) enables global v3 for any authenticated user', () => {
  withEnv(
    {
      DRALO_WRITING_ENGINE_V3_ENABLED: undefined,
      DRALO_WRITING_V3_ENABLED: undefined,
    },
    () => {
      assert.equal(isWritingEngineV3FlagEnabled(), true);
      const student = resolveWritingV3Access({
        userId: 'student-1',
        email: 'student@example.com',
        roleName: 'student',
      });
      assert.equal(student.allowed, true);
      assert.equal(student.reason, 'global_rollout');
    },
  );
});

test('C — client cannot force engine; handler ignores force params (source)', () => {
  const src = read('src/lib/aiActionHandlers.js');
  assert.match(src, /Client cannot force engine choice/);
  assert.match(src, /void body\.forceWritingV3/);
  assert.match(src, /fallback_from: 'v3'/);
  assert.match(src, /evaluateCambridgeEssay/);
});

test('D — B2 panel renders WritingFeedbackPage for v3 payload', () => {
  const src = read('src/components/b2/B2WritingLongFormAiPanel.js');
  assert.match(src, /WritingFeedbackPage/);
  assert.match(src, /engine === 'v3'/);
  assert.match(src, /feedback_payload/);
});

test('E — v3 and legacy UI branches stay mutually exclusive', () => {
  const src = read('src/components/b2/B2WritingLongFormAiPanel.js');
  assert.ok(src.includes('!v3Payload && aiFeedback'));
});

test('F — memory persistence keeps candidate_response', async () => {
  const db = createWritingEngineMemoryDb();
  const repo = createWritingEngineRepository(db);
  const submission = await repo.createSubmission({
    user_id: 'u1',
    submission_source: 'skill_practice',
    task_type: 'essay',
    task_prompt_snapshot: 'Write an essay about technology.',
    task_context_snapshot: {},
    candidate_response: 'Technology helps communication and work every day.',
    candidate_response_hash: 'sha256:abc',
    word_count: 8,
  });
  assert.equal(String(submission.candidate_response), 'Technology helps communication and work every day.');
});

test('G — history overlay remains after marks frozen', () => {
  const src = read('src/features/writing/services/orchestration/writing-engine.service.ts');
  assert.match(src, /History overlay AFTER marks are frozen/);
  assert.match(src, /HISTORY_MARK_DRIFT/);
});

test('H — v3 learner surface has no CEFR/pass/readiness UI controls', () => {
  const page = read('src/components/writing/v3/WritingFeedbackPage.js');
  const withoutBlockComments = page.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(withoutBlockComments, /\bCEFR\b/i);
  assert.doesNotMatch(withoutBlockComments, /\bpass mark\b/i);
  assert.doesNotMatch(withoutBlockComments, /readiness/i);
  assert.ok(PROTECTED_LEGACY_TABLES.includes('levels_puntuaciones'));
});

test('I — provider usage summary requires provider_reported tokens', () => {
  const summary = summariseProviderUsage([
    {
      execution_id: 'e1',
      stage: 'assessment',
      attempt: 1,
      requested_model: WRITING_V3_BETA_MODEL_ID,
      actual_model: WRITING_V3_BETA_MODEL_ID,
      prompt_version: '1.0.0',
      input_tokens: 100,
      output_tokens: 50,
      total_tokens: 150,
      latency_ms: 12,
      retry: false,
      provider_metadata: { id: 'chatcmpl_x' },
      cost_usd: 0.001,
      cost_basis: { token_source: 'provider_reported' },
    },
  ]);
  assert.equal(summary.token_source, 'provider_reported');
  assert.equal(summary.total_tokens, 150);
});

test('J — cambridgeEssayFeedback.js is not rewritten by v3 orchestrator', () => {
  const legacy = read('src/lib/cambridgeEssayFeedback.js');
  assert.ok(!legacy.includes('runWritingEngine'));
  assert.ok(!legacy.includes('DRALO_WRITING_ENGINE_V3_ENABLED'));
  const orch = read('src/features/writing/services/orchestration/writing-engine.service.ts');
  assert.ok(!orch.includes('evaluateCambridgeEssay'));
  assert.ok(!orch.includes('OPENAI_ASSISTANT_ID_CAMBRIDGE'));
});

test('K — normal students receive v3 when kill switch is on', () => {
  withEnv({ DRALO_WRITING_ENGINE_V3_ENABLED: 'true' }, () => {
    const access = resolveWritingV3Access({
      userId: 'student-99',
      email: 'any@example.com',
      roleName: 'student',
    });
    assert.equal(access.allowed, true);
    assert.equal(access.reason, 'global_rollout');
  });
});

test('model config pins dated snapshot by default', () => {
  withEnv(
    {
      DRALO_WRITING_ENGINE_MODEL: undefined,
      DRALO_WRITING_ENGINE_V3_MODEL: undefined,
    },
    () => {
      const cfg = getWritingEngineV3ModelConfig();
      assert.equal(cfg.model, WRITING_V3_BETA_MODEL_ID);
      assert.equal(cfg.temperature, 0);
    },
  );
});

test('resolveWritingV3TaskType maps email and essay', () => {
  assert.equal(resolveWritingV3TaskType({ writingType: 'essay' }), 'essay');
  assert.equal(resolveWritingV3TaskType({ writingType: 'email' }), 'informal_email');
});

test('orchestrator refuses empty candidate without inventing a score', async () => {
  const result = await runWritingEngine(
    { user_id: 'u1', candidate_response: '   ', persist: false },
    { openai: {} as never },
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, 'MISSING_RESPONSE');
});

test('engine version remains 3.0.0', () => {
  assert.equal(WRITING_ENGINE_VERSION, '3.0.0');
});

test('API evaluate route uses kill switch + global access', () => {
  const src = read('src/app/api/writing/evaluate/route.js');
  assert.match(src, /isWritingEngineV3FlagEnabled/);
  assert.match(src, /resolveWritingV3AccessForUser/);
  assert.match(src, /evaluateWritingV3/);
  assert.match(src, /emergency kill switch/);
});

test('no beta allowlist gating remains in flag module', () => {
  const src = read('src/features/writing/config/writing-v3-flags.ts');
  assert.ok(!src.includes('DRALO_WRITING_ENGINE_V3_ROLES'));
  assert.ok(!src.includes('email_allowlist'));
  assert.match(src, /global_rollout/);
});
