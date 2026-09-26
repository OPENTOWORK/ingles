/** Free Training lives: cap and one-life regen. Safe to import from client and server. */

export const TRAINING_LIVES_MAX = 3;
export const TRAINING_LIFE_REGEN_HOURS = 10;
export const TRAINING_LIFE_REGEN_MS = TRAINING_LIFE_REGEN_HOURS * 60 * 60 * 1000;

/**
 * Grant every life whose timer has elapsed. One life is scheduled at a time;
 * further lives wait another full interval after each grant.
 * @param {{ lives: number, nextLifeAt?: string | null }} state
 * @param {number} nowMs
 * @param {{ max?: number, regenMs?: number }} [options]
 */
export function applyTrainingLifeRegen(state, nowMs, options = {}) {
  const max = options.max ?? TRAINING_LIVES_MAX;
  const regenMs = options.regenMs ?? TRAINING_LIFE_REGEN_MS;
  let lives = Math.max(0, Math.min(max, Number(state?.lives) || 0));

  if (lives >= max) return { lives: max, nextLifeAt: null };

  const rawNext = state?.nextLifeAt ? new Date(state.nextLifeAt).getTime() : NaN;
  if (!Number.isFinite(rawNext)) {
    return { lives, nextLifeAt: new Date(nowMs + regenMs).toISOString() };
  }

  if (nowMs < rawNext) return { lives, nextLifeAt: new Date(rawNext).toISOString() };

  const steps = Math.min(max - lives, Math.floor((nowMs - rawNext) / regenMs) + 1);
  lives += steps;
  if (lives >= max) return { lives: max, nextLifeAt: null };

  return { lives, nextLifeAt: new Date(rawNext + steps * regenMs).toISOString() };
}

/**
 * Spend one life after regen. A running timer is kept so the next life
 * still arrives on the original schedule.
 * @returns {{ allowed: boolean, lives: number, nextLifeAt: string | null }}
 */
export function loseTrainingLife(state, nowMs, options = {}) {
  const current = applyTrainingLifeRegen(state, nowMs, options);
  if (current.lives <= 0) {
    return { allowed: false, lives: 0, nextLifeAt: current.nextLifeAt };
  }

  const regenMs = options.regenMs ?? TRAINING_LIFE_REGEN_MS;
  const lives = current.lives - 1;
  const nextLifeAt = current.nextLifeAt || new Date(nowMs + regenMs).toISOString();
  return { allowed: true, lives, nextLifeAt };
}

/** Short wait label, e.g. "9h 5m". */
export function formatTrainingLifeWait(nextLifeAt, now = Date.now()) {
  const ms = new Date(nextLifeAt).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return 'a moment';
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
