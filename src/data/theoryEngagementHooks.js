/**
 * Mensajes emergentes para ejercicios de Theory / Exam theory.
 * Rotan según el índice del ejercicio en la sesión.
 */
export const THEORY_ENGAGEMENT_HOOKS = [
  { emoji: '⚡', title: 'Quick burst!', subtitle: 'Break the routine' },
  { emoji: '🎯', title: 'Pop quiz!', subtitle: 'Fast & unexpected — your turn' },
  { emoji: '🔥', title: 'Energy check', subtitle: 'Wake up — one quick win' },
  { emoji: '💬', title: 'Team pulse', subtitle: 'Jump in — every answer counts' },
  { emoji: '✨', title: 'Surprise round', subtitle: 'Stay sharp — go!' },
  { emoji: '🚀', title: 'Momentum boost', subtitle: 'Quick hit before you scroll away' },
  { emoji: '🎲', title: 'Wildcard!', subtitle: 'Unexpected challenge — ready?' },
  { emoji: '👀', title: 'Eyes up!', subtitle: 'Participation mode: ON' },
];

export const THEORY_ENGAGEMENT_RESULT = {
  perfect: { emoji: '🎉', title: 'Nailed it!', subtitle: 'Keep that energy going' },
  good: { emoji: '💪', title: 'Nice try!', subtitle: 'You showed up — that matters' },
  retry: { emoji: '🔄', title: 'Almost!', subtitle: 'Quick reflection, then continue' },
};

export const THEORY_ENGAGEMENT_COMPLETE = {
  emoji: '🏁',
  title: 'Session complete!',
  subtitle: 'You completed all exercises for this level',
};

export function pickEngagementHook(index, total) {
  const hooks = THEORY_ENGAGEMENT_HOOKS;
  const i = total > 0 ? index % hooks.length : 0;
  return { ...hooks[i], index: index + 1, total: Math.max(1, total) };
}

export function pickResultHook(score) {
  if (score >= 100) return THEORY_ENGAGEMENT_RESULT.perfect;
  if (score >= 50) return THEORY_ENGAGEMENT_RESULT.good;
  return THEORY_ENGAGEMENT_RESULT.retry;
}
