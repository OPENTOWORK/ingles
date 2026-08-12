/**
 * Writing Engine v3 global rollout kill switch.
 *
 * Default: ON for all authenticated B2 Writing users.
 * Set DRALO_WRITING_ENGINE_V3_ENABLED=false (or DRALO_WRITING_V3_ENABLED=false)
 * for emergency rollback to legacy only.
 *
 * No role / email / user allowlists in normal routing.
 * Client parameters never control engine authority.
 */
import type { ModelConfigSnapshot } from '../domain/types';
import { TASK_ANALYSIS_BENCHMARK_MODEL } from '../services/analysis/task-analysis.service';

/** Pinned rollout model — calibration baseline; R3 scoring/stability remains OPEN. */
export const WRITING_V3_BETA_MODEL_ID = 'gpt-4o-2024-08-06';

export const WRITING_V3_BETA_MODEL_CONFIG: ModelConfigSnapshot = {
  model: WRITING_V3_BETA_MODEL_ID,
  snapshot_id: WRITING_V3_BETA_MODEL_ID,
  temperature: 0,
  response_format: 'json_schema',
};

function envFlagRaw(): string {
  return (
    process.env.DRALO_WRITING_ENGINE_V3_ENABLED ??
    process.env.DRALO_WRITING_V3_ENABLED ??
    ''
  )
    .trim()
    .toLowerCase();
}

/**
 * Global kill switch.
 * - unset / true / 1 / on / yes → v3 ON (global default)
 * - false / 0 / off / no → emergency legacy fallback
 */
export function isWritingEngineV3FlagEnabled(): boolean {
  const raw = envFlagRaw();
  if (!raw) return true;
  if (raw === '0' || raw === 'false' || raw === 'no' || raw === 'off') return false;
  if (raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on') return true;
  return true;
}

/**
 * Explicit v3 model. Refuses unpinned generic fallbacks.
 */
export function getWritingEngineV3ModelConfig(): ModelConfigSnapshot {
  const fromEnv =
    process.env.DRALO_WRITING_ENGINE_MODEL?.trim() ||
    process.env.DRALO_WRITING_ENGINE_V3_MODEL?.trim() ||
    '';
  if (!fromEnv) {
    return { ...WRITING_V3_BETA_MODEL_CONFIG };
  }
  if (!/-\d{4}-\d{2}-\d{2}$/.test(fromEnv)) {
    throw new Error(
      `DRALO_WRITING_ENGINE_MODEL must be a pinned dated snapshot (got "${fromEnv}")`,
    );
  }
  return {
    model: fromEnv,
    snapshot_id: fromEnv,
    temperature: 0,
    response_format: 'json_schema',
  };
}

export function assertWritingV3ModelIsNotLegacyFallback(config: ModelConfigSnapshot): void {
  const id = config.snapshot_id ?? config.model;
  if (!id || id === 'gpt-4o' || id === 'gpt-4o-mini') {
    throw new Error(`Writing v3 refuses unpinned model "${id || '(empty)'}"`);
  }
  if (id !== TASK_ANALYSIS_BENCHMARK_MODEL.model && !/-\d{4}-\d{2}-\d{2}$/.test(id)) {
    throw new Error(`Writing v3 model is not a dated snapshot: "${id}"`);
  }
}

export type WritingV3AccessDecision = {
  allowed: boolean;
  reason: string;
  flag_enabled: boolean;
  role: string | null;
};

/**
 * Global routing gate. When the kill switch is ON, every authenticated user
 * is allowed. Allowlists are not consulted.
 */
export function resolveWritingV3Access(input: {
  userId?: string | null;
  email?: string | null;
  roleName?: string | null;
}): WritingV3AccessDecision {
  const flag_enabled = isWritingEngineV3FlagEnabled();
  const role = String(input.roleName || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

  if (!flag_enabled) {
    return {
      allowed: false,
      reason: 'kill_switch_off',
      flag_enabled: false,
      role: role || null,
    };
  }

  if (!String(input.userId || '').trim()) {
    return {
      allowed: false,
      reason: 'unauthenticated',
      flag_enabled: true,
      role: role || null,
    };
  }

  return {
    allowed: true,
    reason: 'global_rollout',
    flag_enabled: true,
    role: role || null,
  };
}

let bootLogged = false;

/** One-shot boot log of kill-switch + pinned model. */
export function logWritingV3FlagBootOnce(): void {
  if (bootLogged) return;
  bootLogged = true;
  try {
    const model = getWritingEngineV3ModelConfig();
    console.info(
      '[writing-v3]',
      JSON.stringify({
        DRALO_WRITING_ENGINE_V3_ENABLED: isWritingEngineV3FlagEnabled(),
        mode: 'global_rollout',
        model: model.snapshot_id ?? model.model,
        temperature: model.temperature ?? 0,
        kill_switch:
          'set DRALO_WRITING_ENGINE_V3_ENABLED=false for emergency legacy fallback',
      }),
    );
  } catch (err) {
    console.info('[writing-v3] flag boot log failed', err);
  }
}

/** @deprecated retained for import compatibility — no longer used for gating */
export function getWritingEngineV3AllowedRoles(): string[] {
  return ['*'];
}
