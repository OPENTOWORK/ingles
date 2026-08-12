/**
 * Chat Completions client for live Writing v3 runs.
 * Captures provider-reported usage only — never text-length estimates.
 * Does not use Assistants or OPENAI_ASSISTANT_ID_*.
 */
import type OpenAI from 'openai';
import type { ModelConfigSnapshot } from '../../domain/types';

export type WritingV3Stage =
  | 'task_analysis'
  | 'observation'
  | 'assessment'
  | 'feedback_composition';

export type WritingV3UsageRecord = {
  execution_id: string | null;
  stage: WritingV3Stage;
  attempt: number;
  requested_model: string;
  actual_model: string | null;
  prompt_version: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  latency_ms: number;
  retry: boolean;
  provider_metadata: Record<string, unknown>;
  cost_usd: number | null;
  cost_basis: Record<string, unknown>;
};

type JsonSchemaSpec = {
  name: string;
  strict?: boolean;
  schema: Record<string, unknown>;
};

export interface WritingV3LlmRequest {
  system: string;
  user: string;
  model_config: ModelConfigSnapshot;
  json_schema: JsonSchemaSpec;
}

export interface WritingV3OpenAiClient {
  generate(request: WritingV3LlmRequest): Promise<unknown>;
  lastPayload: unknown | null;
}

/** Published list prices for cost_basis (USD per 1M tokens). Not estimates of tokens. */
const COST_PER_MILLION: Record<string, { input: number; output: number }> = {
  'gpt-4o-2024-08-06': { input: 2.5, output: 10 },
  'gpt-4o': { input: 2.5, output: 10 },
};

function estimateCostUsd(
  model: string,
  inputTokens: number | null,
  outputTokens: number | null,
): { cost_usd: number | null; cost_basis: Record<string, unknown> } {
  const rates = COST_PER_MILLION[model] ?? COST_PER_MILLION['gpt-4o'];
  const cost_basis = {
    pricing_source: 'openai_list_price_usd_per_1m_tokens',
    model_key: model,
    input_usd_per_1m: rates.input,
    output_usd_per_1m: rates.output,
    token_source: 'provider_reported',
  };
  if (inputTokens == null || outputTokens == null) {
    return { cost_usd: null, cost_basis };
  }
  const cost_usd =
    (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output;
  return { cost_usd, cost_basis };
}

export function createWritingV3OpenAiClient(
  openai: OpenAI,
  context: {
    stage: WritingV3Stage;
    attempt: number;
    execution_id?: string | null;
    prompt_version?: string | null;
    usageLog: WritingV3UsageRecord[];
  },
): WritingV3OpenAiClient {
  const client: WritingV3OpenAiClient = {
    lastPayload: null,
    async generate(request) {
      const requestedModel = request.model_config.snapshot_id ?? request.model_config.model;
      const start = Date.now();

      const completion = await openai.chat.completions.create({
        model: requestedModel,
        temperature: request.model_config.temperature ?? 0,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: request.json_schema.name,
            strict: request.json_schema.strict ?? true,
            schema: request.json_schema.schema,
          },
        },
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.user },
        ],
      });

      const latency_ms = Date.now() - start;
      const content = completion.choices?.[0]?.message?.content ?? '';
      const usage = completion.usage;
      const actual = completion.model ?? null;
      const input_tokens = usage?.prompt_tokens ?? null;
      const output_tokens = usage?.completion_tokens ?? null;
      const total_tokens = usage?.total_tokens ?? null;
      const { cost_usd, cost_basis } = estimateCostUsd(
        actual || requestedModel,
        input_tokens,
        output_tokens,
      );

      context.usageLog.push({
        execution_id: context.execution_id ?? null,
        stage: context.stage,
        attempt: context.attempt,
        requested_model: requestedModel,
        actual_model: actual,
        prompt_version: context.prompt_version ?? null,
        input_tokens,
        output_tokens,
        total_tokens,
        latency_ms,
        retry: context.attempt > 1,
        provider_metadata: {
          id: completion.id,
          system_fingerprint: completion.system_fingerprint ?? null,
          finish_reason: completion.choices?.[0]?.finish_reason ?? null,
        },
        cost_usd,
        cost_basis,
      });

      if (!content.trim()) {
        throw new Error(`empty model response for ${context.stage}`);
      }

      const parsed = JSON.parse(content);
      client.lastPayload = parsed;
      return parsed;
    },
  };
  return client;
}

export function summariseProviderUsage(usageLog: WritingV3UsageRecord[]): {
  token_source: 'provider_reported';
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  actual_models: Record<string, string>;
  usage_by_stage: Record<string, unknown>;
  latency_ms: number;
  latency_by_stage: Record<string, number>;
  cost_usd: number;
  cost_basis: Record<string, unknown>;
} {
  let input_tokens = 0;
  let output_tokens = 0;
  let total_tokens = 0;
  let latency_ms = 0;
  let cost_usd = 0;
  const actual_models: Record<string, string> = {};
  const usage_by_stage: Record<string, unknown> = {};
  const latency_by_stage: Record<string, number> = {};
  const cost_basis: Record<string, unknown> = {
    token_source: 'provider_reported',
    stages: [],
  };

  for (const row of usageLog) {
    if (typeof row.input_tokens === 'number') input_tokens += row.input_tokens;
    if (typeof row.output_tokens === 'number') output_tokens += row.output_tokens;
    if (typeof row.total_tokens === 'number') total_tokens += row.total_tokens;
    latency_ms += row.latency_ms;
    if (typeof row.cost_usd === 'number') cost_usd += row.cost_usd;
    if (row.actual_model) actual_models[row.stage] = row.actual_model;
    latency_by_stage[`${row.stage}:${row.attempt}`] = row.latency_ms;
    usage_by_stage[`${row.stage}:${row.attempt}`] = {
      requested_model: row.requested_model,
      actual_model: row.actual_model,
      prompt_version: row.prompt_version,
      input_tokens: row.input_tokens,
      output_tokens: row.output_tokens,
      total_tokens: row.total_tokens,
      latency_ms: row.latency_ms,
      retry: row.retry,
      provider_metadata: row.provider_metadata,
      cost_usd: row.cost_usd,
    };
    (cost_basis.stages as unknown[]).push({
      stage: row.stage,
      attempt: row.attempt,
      ...row.cost_basis,
      cost_usd: row.cost_usd,
    });
  }

  if (total_tokens !== input_tokens + output_tokens) {
    total_tokens = input_tokens + output_tokens;
  }

  return {
    token_source: 'provider_reported',
    input_tokens,
    output_tokens,
    total_tokens,
    actual_models,
    usage_by_stage,
    latency_ms,
    latency_by_stage,
    cost_usd,
    cost_basis,
  };
}
