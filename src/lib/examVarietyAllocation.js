/**
 * Shared, pure allocation helpers for B1/B2 Reading exam planning.
 * The caller must supply persisted history; this module never assumes a random
 * seed is sufficient to guarantee variety.
 */
const normalise = (value) => String(value ?? '').trim().toLocaleLowerCase('en-GB');

export function assessExamVariety(candidate, history = [], { recentWindow = 5 } = {}) {
  const recent = history.slice(-recentWindow);
  const dimensions = ['topicId', 'contextId', 'genreId', 'titlePatternFamily'];
  const repeated = dimensions.filter((key) => {
    const value = normalise(candidate?.[key]);
    return value && recent.some((entry) => normalise(entry?.[key]) === value);
  });
  return { ok: repeated.length === 0, repeated, recentExamCount: recent.length };
}

export function allocateExamVariety(candidates, history = [], options = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('A non-empty set of exam variety candidates is required.');
  }
  const ranked = candidates.map((candidate, index) => {
    const assessment = assessExamVariety(candidate, history, options);
    return { candidate, index, assessment };
  }).sort((a, b) => a.assessment.repeated.length - b.assessment.repeated.length || a.index - b.index);
  const best = ranked[0];
  if (!best.assessment.ok && options.requireUnique !== false) {
    throw new Error('No candidate satisfies the recent-exam variety constraints.');
  }
  return { ...best.candidate, varietyAssessment: best.assessment };
}
