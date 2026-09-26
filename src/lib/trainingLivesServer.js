import { getPlanBySlug } from '@/data/financialPlanConfig';
import { getSupabaseAdmin } from '@/lib/aiUsage';
import {
  TRAINING_LIFE_REGEN_HOURS,
  TRAINING_LIFE_REGEN_MS,
  TRAINING_LIVES_MAX,
  applyTrainingLifeRegen,
  loseTrainingLife,
} from '@/lib/trainingLives';

const LIFE_POOLS = {
  training: {
    table: 'training_lives',
    capKey: 'trainingLives',
    hoursKey: 'trainingLifeRegenHours',
  },
  quiz: {
    table: 'quiz_lives',
    capKey: 'quizLives',
    hoursKey: 'quizLifeRegenHours',
  },
};

function poolConfig(pool) {
  return LIFE_POOLS[pool] || LIFE_POOLS.training;
}

function planLifeRules(planSlug, pool = 'training') {
  const entitlements = getPlanBySlug(planSlug).entitlements || {};
  const { capKey, hoursKey } = poolConfig(pool);
  const cap = entitlements[capKey];
  if (cap == null) return { unlimited: true, max: null, regenMs: null, regenHours: null };
  const max = Number(cap);
  const hours = Number(entitlements[hoursKey]) || TRAINING_LIFE_REGEN_HOURS;
  return {
    unlimited: false,
    max: Number.isFinite(max) ? max : TRAINING_LIVES_MAX,
    regenMs: hours * 60 * 60 * 1000 || TRAINING_LIFE_REGEN_MS,
    regenHours: hours,
  };
}

function publicState(rules, livesState) {
  if (rules.unlimited) {
    return {
      unlimited: true,
      lives: null,
      max: null,
      nextLifeAt: null,
      regenHours: null,
    };
  }
  return {
    unlimited: false,
    lives: livesState.lives,
    max: rules.max,
    nextLifeAt: livesState.nextLifeAt,
    regenHours: rules.regenHours,
  };
}

async function readRow(db, userId, table) {
  const { data, error } = await db
    .from(table)
    .select('lives, next_life_at, version')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message || '');
    const wrapped = new Error(error.message || `${table} read failed`);
    wrapped.code = missing ? 'MISSING_TABLE' : 'READ_FAILED';
    throw wrapped;
  }
  return data;
}

async function writeRow(db, userId, row, next, nowMs, table) {
  const payload = {
    lives: next.lives,
    next_life_at: next.nextLifeAt,
    version: (row?.version ?? 0) + 1,
    updated_at: new Date(nowMs).toISOString(),
  };

  if (!row) {
    const { error } = await db.from(table).insert({ user_id: userId, ...payload, version: 1 });
    if (!error) return { ok: true };
    if (error.code === '23505') return { ok: false, conflict: true };
    throw error;
  }

  const { data, error } = await db
    .from(table)
    .update(payload)
    .eq('user_id', userId)
    .eq('version', row.version)
    .select('user_id')
    .maybeSingle();
  if (error) throw error;
  return { ok: Boolean(data), conflict: !data };
}

function fullState(max) {
  return { lives: max, nextLifeAt: null };
}

function rowState(row) {
  return { lives: Number(row.lives) || 0, nextLifeAt: row.next_life_at };
}

/**
 * Current lives for a student. Staff and unlimited plans skip the table.
 * @param {{ planSlug: string, applyLimits: boolean }} ctx
 */
export async function readTrainingLives(userId, ctx, pool = 'training') {
  const table = poolConfig(pool).table;
  const rules = !ctx?.applyLimits ? { unlimited: true } : planLifeRules(ctx.planSlug, pool);
  if (rules.unlimited) return publicState(rules);

  const db = getSupabaseAdmin();
  if (!db) {
    const error = new Error('Supabase admin unavailable');
    error.code = 'NO_DB';
    throw error;
  }

  const now = Date.now();
  const row = await readRow(db, userId, table);
  if (!row) return publicState(rules, fullState(rules.max));

  const regenerated = applyTrainingLifeRegen(rowState(row), now, {
    max: rules.max,
    regenMs: rules.regenMs,
  });
  const changed =
    regenerated.lives !== Number(row.lives) ||
    (regenerated.nextLifeAt || null) !== (row.next_life_at || null);

  if (changed) {
    await writeRow(db, userId, row, regenerated, now, table);
  }

  return publicState(rules, regenerated);
}

/**
 * Spend one life. Unlimited plans return without writing.
 * @param {{ planSlug: string, applyLimits: boolean }} ctx
 */
export async function spendTrainingLife(userId, ctx, pool = 'training') {
  const table = poolConfig(pool).table;
  const rules = !ctx?.applyLimits ? { unlimited: true } : planLifeRules(ctx.planSlug, pool);
  if (rules.unlimited) return { spent: false, ...publicState(rules) };

  const db = getSupabaseAdmin();
  if (!db) {
    const error = new Error('Supabase admin unavailable');
    error.code = 'NO_DB';
    throw error;
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const now = Date.now();
    const row = await readRow(db, userId, table);
    const base = row ? rowState(row) : fullState(rules.max);
    const next = loseTrainingLife(base, now, { max: rules.max, regenMs: rules.regenMs });

    if (!next.allowed) {
      return { spent: false, code: 'NO_LIVES', ...publicState(rules, next) };
    }

    const written = await writeRow(db, userId, row, next, now, table);
    if (written.ok) return { spent: true, ...publicState(rules, next) };
  }

  const error = new Error('training life update conflicted');
  error.code = 'CONFLICT';
  throw error;
}
