/**
 * Derives levels progress (correct/total/passed) from a speaking feedback report
 * so TEST STARS reflect AI quality, not just interaction count.
 *
 * @param {import('@/features/speaking/domain/schemas').CorrectionReportPayload | null | undefined} report
 * @param {{ total?: number, passing?: number } | null | undefined} partScoring
 * @returns {{ correct: number, total: number, passed: boolean } | null}
 */
export function speakingProgressFromFeedbackReport(report, partScoring = {}) {
  if (!report) return null;

  const cfgTotal = Math.max(1, Number(partScoring.total) || 5);
  const cfgPassing = Math.max(0, Number(partScoring.passing) ?? 3);
  const minRatio = cfgPassing / cfgTotal;

  const b2 = report.b2Speaking;
  if (b2 && Number.isFinite(Number(b2.total)) && Number(b2.maxTotal) > 0) {
    const correct = Math.max(0, Number(b2.total) || 0);
    const total = Math.max(1, Number(b2.maxTotal) || 60);
    return {
      correct,
      total,
      passed: correct >= total * minRatio,
    };
  }

  const criteria = Array.isArray(report.criteria) ? report.criteria : [];
  const scores = criteria
    .map((c) => Number(c?.score))
    .filter((s) => Number.isFinite(s) && s > 0);
  if (scores.length === 0) return null;

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const correct = Math.round(avg * 10) / 10;
  const total = 5;
  return {
    correct,
    total,
    passed: correct >= cfgPassing,
  };
}
