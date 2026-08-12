/**
 * Global-rollout smoke: real OpenAI + real ENGLISH_PROD writing_* persistence.
 *
 * Usage:
 *   node --experimental-strip-types --no-warnings --loader ./scripts/alias-loader.mjs scripts/run-writing-v3-e2e.mjs
 */
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import { createWritingEngineMemoryDb } from '../src/features/writing/services/persistence/writing-engine-memory-db.ts';
import {
  createSupabaseWritingEngineDb,
  createWritingEngineRepository,
} from '../src/features/writing/services/persistence/writing-engine.repository.ts';
import { runWritingEngine } from '../src/features/writing/services/orchestration/writing-engine.service.ts';
import { WRITING_V3_BETA_MODEL_CONFIG } from '../src/features/writing/config/writing-v3-flags.ts';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '../src/lib/supabaseEnv.js';

loadEnvLocal();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'docs', 'writing-v3', 'beta');
const OUT_JSON = path.join(OUT_DIR, 'e2e-last-run.json');

const TASK = `Write an essay in 140–190 words.

In your English class you have been talking about technology.
Now your English teacher has asked you to write an essay.

Write an essay using all the notes and give reasons for your point of view.

Notes
Write about:
1. communication
2. work
3. ................... (your own idea)

Essay question: Is technology making our lives easier?`;

const RESPONSE = `Technology is everywhere today and many people believe it makes life easier. In my opinion, technology helps us in many ways, but it also creates some problems.

Firstly, communication is faster than ever. We can send messages to friends in other countries in seconds, and video calls let families stay in contact. This saves time and money.

Secondly, technology is useful for work. People can work from home, share documents online and find information quickly. For students, online dictionaries and translation tools are also helpful.

However, technology can make us lazy. Some people spend too many hours looking at screens and forget about exercise or meeting friends face to face. Also, when systems fail, people do not know what to do.

In conclusion, technology makes many tasks easier, but we should use it carefully so it does not control our free time.`;

if (!process.env.OPENAI_API_KEY?.trim()) {
  console.error('OPENAI_API_KEY required');
  process.exit(2);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });

let persistence = 'memory';
let repository = createWritingEngineRepository(createWritingEngineMemoryDb());

const serviceKey = getSupabaseServiceRoleKey()?.trim();
const supabaseUrl = getSupabaseUrl();
if (serviceKey && supabaseUrl) {
  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const probe = await client.from('writing_submissions').select('id').limit(1);
  if (!probe.error) {
    repository = createWritingEngineRepository(createSupabaseWritingEngineDb(client));
    persistence = 'supabase_prod';
  } else {
    console.warn('Supabase probe failed, using memory:', probe.error.message);
  }
}

// Prefer a real auth user when writing to prod so FK to auth.users succeeds.
let userId = '00000000-0000-4000-8000-0000000000e2';
if (persistence === 'supabase_prod') {
  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Use a fixed test marker user from auth if available via env, else look up none —
  // insert requires a valid auth.users id.
  const envUser = process.env.WRITING_V3_E2E_USER_ID?.trim();
  if (envUser) {
    userId = envUser;
  } else {
    // Fallback: pick any auth user id via REST is not available; require env for prod persist.
    console.warn(
      'WRITING_V3_E2E_USER_ID not set — using memory persist for FK safety',
    );
    repository = createWritingEngineRepository(createWritingEngineMemoryDb());
    persistence = 'memory';
  }
}

const result = await runWritingEngine(
  {
    user_id: userId,
    candidate_response: RESPONSE,
    structured_exam_context: TASK,
    writing_type: 'essay',
    submission_source: 'skill_practice',
    persist: true,
    model_config: WRITING_V3_BETA_MODEL_CONFIG,
    execution_label: 'global_rollout_smoke',
  },
  { openai, repository },
);

const artefact = {
  generated_at: new Date().toISOString(),
  ok: result.ok,
  engine: 'v3',
  model: WRITING_V3_BETA_MODEL_CONFIG,
  persistence,
  global_rollout: true,
  kill_switch_default: 'ON',
  submission_id: result.submission_id,
  execution_id: result.execution_id,
  usage_summary: result.usage_summary,
  usage: result.usage,
  error: result.ok ? null : result.error,
  code: result.ok ? null : result.code,
  candidate_response: result.ok ? result.candidate_response : RESPONSE,
  task_prompt_snapshot: result.ok ? result.task_prompt_snapshot : TASK,
  feedback_payload: result.ok ? result.feedback_payload : null,
  scores: result.ok ? result.scores : null,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(artefact, null, 2), 'utf8');
console.log(
  JSON.stringify(
    {
      ok: result.ok,
      out: OUT_JSON,
      persistence,
      execution_id: result.execution_id,
      scores: result.ok ? result.scores : null,
      cost_usd: result.usage_summary?.cost_usd ?? null,
      total_tokens: result.usage_summary?.total_tokens ?? null,
      latency_ms: result.usage_summary?.latency_ms ?? null,
      error: result.ok ? null : result.error,
    },
    null,
    2,
  ),
);

process.exit(result.ok ? 0 : 1);
