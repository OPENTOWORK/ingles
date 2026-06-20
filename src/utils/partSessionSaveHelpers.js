import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';
import { inferSectionTitleFromPart } from '@/data/levelExamPartMap';

export function formatPartProgressScoreLabel(progress) {
  if (!progress || typeof progress !== 'object') return null;

  const isV2 = Number(progress.scoringVersion) === 2;
  const correct = isV2
    ? progress.puntosObtenidos ?? progress.pointsEarned ?? progress.correct
    : progress.correct ?? progress.correctCount;
  const total = isV2
    ? progress.puntosMaximos ?? progress.maxPoints ?? progress.total
    : progress.questionTotal ?? progress.total ?? progress.totalSlots;

  if (total == null || total <= 0) return null;

  const safeCorrect = Math.max(0, Number(correct) || 0);
  const pct = Math.round((100 * safeCorrect) / total);
  const passLabel = progress.passed ? 'passed' : 'not passed';
  return `${safeCorrect}/${total} · ${passLabel} (${pct}%)`;
}

export function resolvePartScorePercent(progress) {
  if (!progress || typeof progress !== 'object') return null;
  const isV2 = Number(progress.scoringVersion) === 2;
  const correct = isV2
    ? progress.puntosObtenidos ?? progress.pointsEarned ?? progress.correct
    : progress.correct ?? progress.correctCount;
  const total = isV2
    ? progress.puntosMaximos ?? progress.maxPoints ?? progress.total
    : progress.questionTotal ?? progress.total ?? progress.totalSlots;
  if (!total || total <= 0 || correct == null) return null;
  return Math.round((100 * Math.max(0, Number(correct) || 0)) / total);
}

export function buildPartSessionHistoryEntry({
  levelSlug = 'b2',
  partNumber,
  examSlot = null,
  seconds,
  skillRoute = null,
  scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
  progress = null,
  sectionTitle = null,
  scoreLabel = null,
}) {
  const section =
    sectionTitle || inferSectionTitleFromPart(levelSlug, partNumber) || 'Practice';

  return {
    examSlot: examSlot ?? null,
    partNumber: Number(partNumber) || null,
    levelSlug: String(levelSlug || 'b2').toLowerCase(),
    skillRoute: skillRoute || null,
    sectionTitle: section,
    scoreSource: scoreSource || LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
    seconds: Math.round(Number(seconds) || 0),
    scoreLabel: scoreLabel || formatPartProgressScoreLabel(progress),
    scorePercent: resolvePartScorePercent(progress),
    passed: progress?.passed ?? null,
    recordedAt: new Date().toISOString(),
  };
}

export function scoreSourceModeLabel(scoreSource, lang = 'en') {
  const en = lang === 'en';
  return scoreSource === LEVELS_SCORE_SOURCE.EXAM_MODE
    ? en
      ? 'Exam mode'
      : 'Modo examen'
    : en
      ? 'Skills mode'
      : 'Modo skills';
}
