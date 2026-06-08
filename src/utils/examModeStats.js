const PASS_THRESHOLD = 60;

function sectionSkillKey(title = '') {
  const t = title.toLowerCase();
  if (t.includes('reading') || t.includes('use of english')) return 'reading';
  if (t.includes('writing')) return 'writing';
  if (t.includes('listening')) return 'listening';
  if (t.includes('speaking')) return 'speaking';
  return 'general';
}

const IMPROVEMENT_TIPS = {
  reading:
    'Focus on timed reading practice, vocabulary in context, and Use of English transformations (parts 1–4).',
  writing:
    'Practice both writing tasks under time pressure: plan quickly, check word count, and review linking words.',
  listening:
    'Listen to varied accents daily, preview questions before each recording, and note distractors in multiple-choice items.',
  speaking:
    'Record yourself on typical B2 prompts, extend answers with examples, and work on fluency plus accurate grammar.',
  general: 'Review the sections where you scored below the pass mark and redo those parts in practice mode.',
};

/**
 * @param {Array<{ title: string, pct: number, scores: { correct: number, total: number, byPart?: Record<number, { correct: number, total: number, passing?: number }> }, status?: string }>} rows
 */
export function computeExamModeStats(rows, { passThreshold = PASS_THRESHOLD } = {}) {
  let correct = 0;
  let total = 0;
  let sectionsPassed = 0;
  let sectionsCompleted = 0;
  const weakSections = [];
  const weakParts = [];

  let maxTotal = 0;
  for (const row of rows) {
    maxTotal += row.scores?.total || 0;
  }

  for (const row of rows) {
    const completed = row.status === 'completed';
    if (!completed) continue;

    sectionsCompleted += 1;
    const scores = row.scores || { correct: 0, total: 0, byPart: {} };
    correct += scores.correct || 0;
    total += scores.total || 0;

    const pct = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
    const passed = scores.total > 0 && pct >= passThreshold;
    if (passed) sectionsPassed += 1;
    else if (scores.total > 0) {
      weakSections.push({ title: row.title, pct, skill: sectionSkillKey(row.title) });
    }

    const parts = scores.byPart || {};
    for (const [partNum, p] of Object.entries(parts)) {
      if (p.passing != null && p.correct < p.passing) {
        weakParts.push({
          section: row.title,
          partNum: Number(partNum),
          correct: p.correct,
          total: p.total,
          passing: p.passing,
        });
      }
    }
  }

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const allComplete = rows.length > 0 && rows.every((r) => r.status === 'completed');
  const examPassed = allComplete && sectionsPassed === rows.length;
  const inProgress = sectionsCompleted > 0 && !allComplete;
  const hasStarted = sectionsCompleted > 0;

  const tips = [];
  const seenSkills = new Set();
  for (const w of [...weakSections].sort((a, b) => a.pct - b.pct)) {
    if (seenSkills.has(w.skill)) continue;
    seenSkills.add(w.skill);
    tips.push({ skill: w.skill, title: w.title, tip: IMPROVEMENT_TIPS[w.skill] || IMPROVEMENT_TIPS.general });
  }
  if (tips.length === 0 && allComplete && !examPassed) {
    tips.push({ skill: 'general', title: 'Overall', tip: IMPROVEMENT_TIPS.general });
  }

  return {
    correct,
    total,
    maxTotal,
    displayTotal: total > 0 ? total : maxTotal,
    pct,
    sectionsPassed,
    sectionsCount: rows.length,
    sectionsCompleted,
    passThreshold,
    examPassed,
    allComplete,
    inProgress,
    hasStarted,
    improvementTips: tips,
    weakParts: weakParts.sort((a, b) => a.correct / a.total - b.correct / b.total),
  };
}

export { PASS_THRESHOLD };
