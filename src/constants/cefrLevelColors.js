/** CEFR level colors — same palette as /niveles (Levels hub). */
export const CEFR_LEVEL_COLORS = {
  A2: '#58cc02',
  B1: '#ff9900',
  B2: '#1cb0f6',
  C1: '#8e44ad',
  C2: '#e74c3c',
};

export const CEFR_LEVEL_LABELS = {
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
};

/** @param {string} level e.g. "a2" | "A2" */
export function getCefrLevelColor(level) {
  const key = String(level || '').toUpperCase();
  return CEFR_LEVEL_COLORS[key] || '#64748b';
}

/** @param {string} level */
export function getCefrLevelLabel(level) {
  const key = String(level || '').toUpperCase();
  return CEFR_LEVEL_LABELS[key] || 'Practice';
}
