export type DraloXpTaskKind = 'mcq' | 'open-short' | 'open-medium' | 'open-hard' | 'text';

export type DraloXpAwardInput = {
  correct?: boolean;
  activityId?: string;
  hasOptions?: boolean;
  kind?: DraloXpTaskKind;
  scorePercent?: number;
  stars?: number;
};

const XP_RANGES: Record<DraloXpTaskKind, [number, number]> = {
  mcq: [8, 15],
  'open-short': [10, 18],
  'open-medium': [14, 22],
  'open-hard': [18, 28],
  text: [12, 30],
};

const MCQ_ACTIVITIES = new Set([
  'multiple-choice-cloze',
  'multiple-choice',
  'short-extracts',
  'conversation',
  'multiple-matching',
]);

const OPEN_SHORT_ACTIVITIES = new Set(['word-formation']);

const OPEN_HARD_ACTIVITIES = new Set(['key-word']);

const OPEN_MEDIUM_ACTIVITIES = new Set([
  'open-cloze',
  'gapped-text',
  'sentence-completion',
]);

/** Maps a Dralo AI activity to an XP difficulty bucket. */
export function resolveDraloXpKind(input: DraloXpAwardInput = {}): DraloXpTaskKind {
  if (input.kind) return input.kind;
  if (input.hasOptions) return 'mcq';

  const activityId = String(input.activityId || '').toLowerCase();
  if (MCQ_ACTIVITIES.has(activityId)) return 'mcq';
  if (OPEN_SHORT_ACTIVITIES.has(activityId)) return 'open-short';
  if (OPEN_HARD_ACTIVITIES.has(activityId)) return 'open-hard';
  if (OPEN_MEDIUM_ACTIVITIES.has(activityId)) return 'open-medium';
  return 'open-medium';
}

function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * XP reward for a correct answer (0 if incorrect).
 * Range 0–30 depending on task type; text tasks scale with scorePercent.
 */
export function computeDraloXpReward(input: DraloXpAwardInput = {}): number {
  if (input.correct === false) return 0;

  if (input.stars != null && Number.isFinite(input.stars)) {
    const stars = Math.max(1, Math.min(3, Math.floor(input.stars)));
    return stars === 3 ? 30 : stars === 2 ? 20 : 10;
  }

  const kind = resolveDraloXpKind(input);
  const [min, max] = XP_RANGES[kind];

  if (kind === 'text') {
    const pct = Math.min(100, Math.max(0, Number(input.scorePercent) || 72));
    return Math.round(min + ((max - min) * pct) / 100);
  }

  return randomInRange(min, max);
}
