/**
 * Lightweight operational telemetry for Writing v3 global rollout.
 * Queryable via service-role SQL / logs — not a dashboard UI.
 */
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export async function getWritingV3ExecutionTelemetry(options: {
  sinceIso?: string;
  limit?: number;
} = {}) {
  const key = getSupabaseServiceRoleKey()?.trim();
  const url = getSupabaseUrl();
  if (!key || !url) {
    return { ok: false as const, error: 'no_service_role' };
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let query = client
    .from('writing_engine_executions')
    .select(
      'id, status, validation_status, retry_count, input_tokens, output_tokens, total_tokens, latency_ms, cost_usd, failure_stage, started_at, completed_at, usage_by_stage, actual_models',
    )
    .order('started_at', { ascending: false })
    .limit(options.limit ?? 200);

  if (options.sinceIso) {
    query = query.gte('started_at', options.sinceIso);
  }

  const { data, error } = await query;
  if (error) return { ok: false as const, error: error.message };

  const rows = data || [];
  const completed = rows.filter((r) => r.status === 'completed');
  const failed = rows.filter((r) => r.status === 'failed');
  const num = (value: unknown) => (typeof value === 'number' ? value : 0);
  const sum = (picker: (r: (typeof rows)[number]) => unknown) =>
    rows.reduce((acc, r) => acc + num(picker(r)), 0);

  return {
    ok: true as const,
    sample_size: rows.length,
    total_executions: rows.length,
    completed_executions: completed.length,
    failed_executions: failed.length,
    average_retry_count: rows.length === 0 ? 0 : sum((r) => r.retry_count) / rows.length,
    average_tokens: rows.length === 0 ? 0 : sum((r) => r.total_tokens) / rows.length,
    average_latency_ms: rows.length === 0 ? 0 : sum((r) => r.latency_ms) / rows.length,
    average_cost_usd: rows.length === 0 ? 0 : sum((r) => r.cost_usd) / rows.length,
    failure_stages: failed.reduce((acc: Record<string, number>, r) => {
      const stage = String(r.failure_stage || 'unknown');
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {}),
  };
}
