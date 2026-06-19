/** Matches --skill-accent / --skill-surface-2 in globals.css (skills practice). */
export const LEVEL_SKILL_CHART_COLORS = {
  reading: {
    barColor: '#2563eb',
    emptyColor: '#eff6ff',
    zoneColor: '#dbeafe',
  },
  writing: {
    barColor: '#059669',
    emptyColor: '#ecfdf5',
    zoneColor: '#d1fae5',
  },
  listening: {
    barColor: '#d97706',
    emptyColor: '#fffbeb',
    zoneColor: '#fef3c7',
  },
  speaking: {
    barColor: '#db2777',
    emptyColor: '#fdf2f8',
    zoneColor: '#fce7f3',
  },
};

/** @param {keyof typeof LEVEL_SKILL_CHART_COLORS} skillKey */
export function buildSkillChartZone(from, to, label, skillKey) {
  const theme = LEVEL_SKILL_CHART_COLORS[skillKey] || LEVEL_SKILL_CHART_COLORS.reading;
  return {
    from,
    to,
    label,
    color: theme.zoneColor,
    barColor: theme.barColor,
    emptyColor: theme.emptyColor,
  };
}

/** Section cards in profile exam statistics (Performance by section). */
export const EXAM_STATS_SECTION_META = {
  reading: { label: 'Reading and Use of English', color: LEVEL_SKILL_CHART_COLORS.reading.barColor },
  writing: { label: 'Writing', color: LEVEL_SKILL_CHART_COLORS.writing.barColor },
  listening: { label: 'Listening', color: LEVEL_SKILL_CHART_COLORS.listening.barColor },
  speaking: { label: 'Speaking', color: LEVEL_SKILL_CHART_COLORS.speaking.barColor },
};
