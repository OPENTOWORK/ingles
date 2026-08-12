/**
 * Server wiring for Writing Engine v3 — OpenAI + optional Supabase persistence.
 */
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  createSupabaseWritingEngineDb,
  createWritingEngineRepository,
  type WritingEngineRepository,
} from '../persistence/writing-engine.repository';
import { createWritingEngineMemoryDb } from '../persistence/writing-engine-memory-db';
import { runWritingEngine, type WritingEngineRunInput, type WritingEngineRunResult } from './writing-engine.service';
import { logWritingV3FlagBootOnce } from '../../config/writing-v3-flags';

function createOpenAi(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for Writing Engine v3');
  }
  return new OpenAI({ apiKey });
}

/**
 * Prefer real service-role Supabase when writing_* tables exist.
 * Memory DB only when DRALO_WRITING_ENGINE_V3_MEMORY_PERSIST=true (local/E2E).
 */
export async function createWritingV3Repository(): Promise<{
  repository: WritingEngineRepository | null;
  mode: 'supabase' | 'memory' | 'none';
  detail?: string;
}> {
  const allowMemory =
    String(process.env.DRALO_WRITING_ENGINE_V3_MEMORY_PERSIST || '')
      .trim()
      .toLowerCase() === 'true';

  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const supabaseUrl = getSupabaseUrl();
  if (serviceKey && supabaseUrl) {
    const client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const probe = await client.from('writing_submissions').select('id').limit(1);
    if (!probe.error) {
      return {
        repository: createWritingEngineRepository(createSupabaseWritingEngineDb(client)),
        mode: 'supabase',
      };
    }
    if (allowMemory) {
      return {
        repository: createWritingEngineRepository(createWritingEngineMemoryDb()),
        mode: 'memory',
        detail: `supabase probe failed (${probe.error.message}); using memory`,
      };
    }
    return {
      repository: null,
      mode: 'none',
      detail: `writing_submissions unavailable: ${probe.error.message}`,
    };
  }

  if (allowMemory) {
    return {
      repository: createWritingEngineRepository(createWritingEngineMemoryDb()),
      mode: 'memory',
      detail: 'no service role; memory persist enabled',
    };
  }

  return {
    repository: null,
    mode: 'none',
    detail: 'no SUPABASE_SERVICE_ROLE_KEY and memory persist disabled',
  };
}

export async function evaluateWritingV3(
  input: WritingEngineRunInput,
): Promise<WritingEngineRunResult & { persistence_mode?: string }> {
  logWritingV3FlagBootOnce();
  const openai = createOpenAi();
  const { repository, mode, detail } = await createWritingV3Repository();

  if (input.persist !== false && !repository) {
    return {
      ok: false,
      engine: 'v3',
      error:
        detail ||
        'Writing v3 schema is not available in this environment (R5 OPEN). Migration not applied to production.',
      code: 'PERSISTENCE_UNAVAILABLE',
      status: 503,
      submission_id: null,
      execution_id: null,
      validation_status: null,
      usage: [],
      usage_summary: null,
      persisted: false,
      persistence_mode: mode,
    };
  }

  const result = await runWritingEngine(
    { ...input, persist: input.persist !== false },
    { openai, repository },
  );
  return { ...result, persistence_mode: mode };
}
