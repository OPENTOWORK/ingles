/**
 * OpenAI Chat Completions adapter for calibration runs only.
 * Captures provider-reported usage — never estimates tokens from text length.
 */

import type OpenAI from 'openai';
import type { ModelConfigSnapshot } from '../domain/types';
import type { CalibrationUsageRecord } from './calibration-types';

type JsonSchemaSpec = {
  name: string;
  strict?: boolean;
  schema: Record<string, unknown>;
};

export interface CalibrationLlmRequest {
  system: string;
  user: string;
  model_config: ModelConfigSnapshot;
  json_schema: JsonSchemaSpec;
}

export interface CalibrationOpenAiClient {
  generate(request: CalibrationLlmRequest): Promise<unknown>;
  lastPayload: unknown | null;
}

export function createCalibrationOpenAiClient(
  openai: OpenAI,
  context: {
    stage: CalibrationUsageRecord['stage'];
    case_id: string;
    attempt: number;
    usageLog: CalibrationUsageRecord[];
  },
): CalibrationOpenAiClient {
  const client: CalibrationOpenAiClient = {
    lastPayload: null,
    async generate(request: CalibrationLlmRequest) {
      const requestedModel =
        request.model_config.snapshot_id ?? request.model_config.model;
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

      context.usageLog.push({
        stage: context.stage,
        case_id: context.case_id,
        attempt: context.attempt,
        requested_model: requestedModel,
        actual_model: completion.model ?? null,
        input_tokens: usage?.prompt_tokens ?? null,
        output_tokens: usage?.completion_tokens ?? null,
        total_tokens: usage?.total_tokens ?? null,
        latency_ms,
        provider_metadata: {
          id: completion.id,
          system_fingerprint: completion.system_fingerprint ?? null,
          finish_reason: completion.choices?.[0]?.finish_reason ?? null,
        },
      });

      if (!content.trim()) {
        throw new Error(`empty model response for ${context.stage} / ${context.case_id}`);
      }

      const parsed = JSON.parse(content);
      client.lastPayload = parsed;
      return parsed;
    },
  };
  return client;
}

export function extractMarksFromAssessmentPayload(
  payload: unknown,
): import('./calibration-types').GoldenExpectedMarks | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as {
    assessable?: boolean;
    criteria?: Array<{ criterion?: string; mark?: number }>;
  };
  if (data.assessable === false || !Array.isArray(data.criteria)) return null;
  const by = new Map(
    data.criteria
      .filter((c) => c && typeof c.criterion === 'string' && Number.isInteger(c.mark))
      .map((c) => [c.criterion as string, c.mark as number]),
  );
  for (const key of [
    'content',
    'communicative_achievement',
    'organisation',
    'language',
  ]) {
    if (!by.has(key)) return null;
  }
  return {
    content: by.get('content')!,
    communicative_achievement: by.get('communicative_achievement')!,
    organisation: by.get('organisation')!,
    language: by.get('language')!,
  };
}
