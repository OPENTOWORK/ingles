'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useExamModeStatistics } from '@/hooks/useExamModeStatistics';
import { buildExamModePracticeHref } from '@/utils/examModeSession';
import { getNivelesLevelHub } from '@/data/nivelesLevelHub';
import { getB2PartPassingPoints } from '@/utils/levelsB2PartScoring';
import { getExamSectionPartTitle } from '@/utils/formatLevelsPartDisplayName';
import TheoryLevelStars from '@/components/theory/TheoryLevelStars';
import { starsFromLevelsEarnedMax } from '@/lib/levelsStars';
import styles from './ExamModeResultsView.module.css';

function resolveSectionScoreDisplay(scores) {
  if (!scores) return { correct: 0, total: 0 };
  const v2 = Number(scores.scoringVersion) === 2;
  return {
    correct: Math.max(
      0,
      Number(v2 ? (scores.pointsEarned ?? scores.correct) : scores.correct) || 0,
    ),
    total: Math.max(
      0,
      Number(v2 ? (scores.maxPoints ?? scores.total) : scores.total) || 0,
    ),
  };
}

function resolveSectionStars(scores) {
  const { correct, total } = resolveSectionScoreDisplay(scores);
  return starsFromLevelsEarnedMax(correct, total);
}

function rowSkillKey(title = '') {
  const t = title.toLowerCase();
  if (t.includes('reading') || t.includes('use of english')) return 'reading';
  if (t.includes('writing')) return 'writing';
  if (t.includes('listening')) return 'listening';
  if (t.includes('speaking')) return 'speaking';
  return 'general';
}

function resolvePartBadge(partNum, part, sectionScoringV2) {
  const v2 = part.scoringVersion === 2 || sectionScoringV2;
  const earned = Math.max(0, Number(v2 ? (part.pointsEarned ?? part.correct) : part.correct) || 0);
  const passingThreshold = v2 ? getB2PartPassingPoints(Number(partNum)) : part.passing;

  if (passingThreshold == null) return null;

  const attempted =
    part.complete === true ||
    part.essaySubmitted === true ||
    Number(part.evaluated ?? part.questionsAnswered ?? 0) > 0;

  if (earned >= passingThreshold) {
    return { variant: 'pass', label: 'Pass' };
  }
  if (attempted) {
    return { variant: 'fail', label: 'Not pass' };
  }
  return { variant: 'pending', label: 'Pending' };
}

const SECTION_ICON_CLASS = {
  'Reading and Use of English': styles['cardIcon--reading'],
  'Use of English': styles['cardIcon--reading'],
  Reading: styles['cardIcon--reading'],
  'Reading and Writing': styles['cardIcon--reading'],
  Writing: styles['cardIcon--writing'],
  Listening: styles['cardIcon--listening'],
  Speaking: styles['cardIcon--speaking'],
};

const SECTION_CARD_CLASS = {
  'Reading and Use of English': styles['card--reading'],
  'Use of English': styles['card--reading'],
  Reading: styles['card--reading'],
  Writing: styles['card--writing'],
  Listening: styles['card--listening'],
  Speaking: styles['card--speaking'],
};

const IMPROVE_ITEM_CLASS = {
  reading: styles['improveItem--reading'],
  writing: styles['improveItem--writing'],
  listening: styles['improveItem--listening'],
  speaking: styles['improveItem--speaking'],
  general: styles['improveItem--general'],
};

function scoreTone(pct) {
  if (pct >= 60) return 'high';
  if (pct >= 35) return 'mid';
  return 'low';
}

function ProgressRing({ pct, tone, label = 'Overall', compact = false }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const fgClass =
    tone === 'high'
      ? styles['ringFg--high']
      : tone === 'mid'
        ? styles['ringFg--mid']
        : styles['ringFg--low'];

  return (
    <div
      className={`${styles.ringWrap}${compact ? ` ${styles.ringWrapCompact}` : ''}`}
      aria-hidden="true"
    >
      <svg className={styles.ringSvg} viewBox="0 0 120 120">
        <circle className={styles.ringBg} cx="60" cy="60" r={r} />
        <circle
          className={`${styles.ringFg} ${fgClass}`}
          cx="60"
          cy="60"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.ringCenter}>
        <span className={styles.ringPct}>{pct}%</span>
        <span className={styles.ringLabel}>{label}</span>
      </div>
    </div>
  );
}

function HeroStatsSummary({
  stats,
  overallTone,
  ringLabel,
  inline = false,
  hideRing = false,
  overallStars = null,
}) {
  const stars =
    overallStars ?? starsFromLevelsEarnedMax(stats.correct, stats.displayTotal);

  return (
    <div
      className={`${styles.summary}${inline ? ` ${styles.summaryInline}` : ''}${
        hideRing ? ` ${styles.summaryNoRing}` : ''
      }`}
    >
      {!hideRing ? (
        <div className={styles.summaryHeroCluster}>
          <ProgressRing pct={stats.pct} tone={overallTone} label={ringLabel} compact={inline} />
          <div className={styles.summaryStarsBlock}>
            <TheoryLevelStars stars={stars} size={inline ? 'sm' : 'md'} variant="gold" />
            <span className={styles.summaryStarsLabel}>
              {stats.correct}/{stats.displayTotal} items
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.summaryStarsOnly}>
          <TheoryLevelStars stars={stars} size="sm" variant="gold" />
        </div>
      )}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {stats.correct}/{stats.displayTotal}
          </span>
          <span className={styles.statLabel}>Items correct</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {stats.sectionsCompleted}/{stats.sectionsCount}
          </span>
          <span className={styles.statLabel}>Sections done</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {stats.sectionsPassed}/{stats.sectionsCount}
          </span>
          <span className={styles.statLabel}>Sections ≥ {stats.passThreshold}%</span>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ row, examSlot, onRepeatSection, onRepeatPart, rescoreBusy }) {
  const status = row.status || 'locked';
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const tone = scoreTone(row.pct);
  const iconClass = SECTION_ICON_CLASS[row.title] || styles['cardIcon--default'];
  const parts = row.scores?.byPart || {};
  const isWritingSection = row.title === 'Writing';
  const showWritingRescoreHint = isWritingSection && isCompleted && rescoreBusy;
  const partEntries = Object.entries(parts).sort(([a], [b]) => Number(a) - Number(b));
  const sectionStars = isCompleted ? resolveSectionStars(row.scores) : 0;

  return (
    <article
      className={`${styles.card}${partEntries.length > 0 ? ` ${styles.cardWithParts}` : ''}${
        SECTION_CARD_CLASS[row.title] ? ` ${SECTION_CARD_CLASS[row.title]}` : ''
      }`}
    >
      <div className={styles.cardHead}>
        <div className={`${styles.cardIcon} ${iconClass}`} aria-hidden="true">
          {row.emoji || '📋'}
        </div>
        <div className={styles.cardMain}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>{row.title}</h3>
            <div
              className={`${styles.cardTitleActions}${
                partEntries.length > 0 ? ` ${styles.cardTitleActionsAligned}` : ''
              }`}
            >
              {isCompleted ? (
                <TheoryLevelStars stars={sectionStars} size="sm" variant="gold" />
              ) : null}
              {isCompleted ? (
                <button
                  type="button"
                  className={`${styles.repeatSectionBtn}${
                    partEntries.length > 0 ? ` ${styles.repeatSectionBtnHeader}` : ''
                  }`}
                  onClick={() => onRepeatSection?.(row.key, row.href)}
                >
                  Repetir sección
                </button>
              ) : null}
              {partEntries.length > 0 ? (
                <p className={styles.cardScoreFraction}>
                  {row.scores?.scoringVersion === 2 ? (
                    <>
                      {row.scores?.pointsEarned ?? row.scores?.correct ?? 0}
                      <span> / {row.scores?.maxPoints ?? row.scores?.total ?? 0}</span>
                    </>
                  ) : (
                    <>
                      {row.scores?.correct ?? 0}
                      <span> / {row.scores?.total ?? 0}</span>
                    </>
                  )}
                </p>
              ) : (
                <p className={styles.cardScore}>
                  {row.scores?.scoringVersion === 2 ? (
                    <>
                      {row.scores?.pointsEarned ?? row.scores?.correct ?? 0}
                      <span> / {row.scores?.maxPoints ?? row.scores?.total ?? 0}</span>
                    </>
                  ) : (
                    <>
                      {row.scores?.correct ?? 0}
                      <span> / {row.scores?.total ?? 0}</span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressFill} ${
                row.pct === 0
                  ? styles['progressFill--zero']
                  : styles[`progressFill--${tone}`]
              }`}
              style={{ width: `${Math.max(row.pct, row.scores?.total > 0 ? 4 : 0)}%` }}
              role="progressbar"
              aria-valuenow={row.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${row.title} score`}
            />
          </div>
          {!isCompleted ? (
            <p className={styles.cardPendingHint}>
              {isActive
                ? 'Finish this section to update your score.'
                : 'Complete previous sections first.'}
            </p>
          ) : null}
          {showWritingRescoreHint ? (
            <p className={styles.cardPendingHint}>
              Correcting your writing with Dralo AI…
            </p>
          ) : null}
        </div>
      </div>

      {partEntries.length > 0 ? (
        <div className={styles.parts}>
          <p className={styles.partsLabel}>Breakdown by part</p>
          <ul className={styles.partsList}>
            {partEntries.map(([partNum, p]) => {
              const badge = resolvePartBadge(partNum, p, row.scores?.scoringVersion === 2);
              const showReview = isCompleted;
              const partReviewHref = buildExamModePracticeHref(row.href, examSlot, {
                review: true,
                part: Number(partNum),
              });
              return (
                <li key={partNum} className={styles.partRow}>
                  <span className={styles.partName}>
                    {getExamSectionPartTitle(Number(partNum), row.partMin, 'en') || `Part ${partNum}`}
                  </span>
                  {showReview ? (
                    <button
                      type="button"
                      className={styles.partRepeatBtn}
                      onClick={() => onRepeatPart?.(row.key, row.href, Number(partNum))}
                    >
                      Repetir parte
                    </button>
                  ) : (
                    <span className={styles.partCellEmpty} aria-hidden="true" />
                  )}
                  {showReview ? (
                    <Link href={partReviewHref} className={styles.partReviewBtn}>
                      Revisar
                    </Link>
                  ) : (
                    <span className={styles.partCellEmpty} aria-hidden="true" />
                  )}
                  <span className={styles.partScore}>
                    {p.scoringVersion === 2 || row.scores?.scoringVersion === 2
                      ? `${p.pointsEarned ?? p.correct}/${p.maxPoints ?? p.total}`
                      : `${p.correct}/${p.total}`}
                  </span>
                  {badge ? (
                    <span
                      className={`${styles.badge} ${styles[`badge--${badge.variant}`]}`}
                    >
                      {badge.label}
                    </span>
                  ) : (
                    <span className={styles.partCellEmpty} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function formatAttemptDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function ExamModeResultsViewInner({ slug }) {
  const config = getNivelesLevelHub(slug);
  const searchParams = useSearchParams();
  const examSlot = Math.min(5, Math.max(1, Number(searchParams.get('examen') || 1)));
  const { rows, stats, generalStats, attemptHistory, session, ready, repeatExam, repeatSection, repeatPart, rescoreBusy } =
    useExamModeStatistics(slug, examSlot);

  const overallTone = scoreTone(stats.pct);
  const examLabel = `Test ${examSlot}`;
  const ringLabel = stats.allComplete ? 'Overall' : stats.hasStarted ? 'So far' : 'Overall';
  const showInlineHeroStats = stats.hasStarted && !stats.allComplete;

  const overallScoreDisplay = useMemo(() => {
    let correct = 0;
    let total = 0;
    for (const row of rows) {
      if (row.status !== 'completed') continue;
      const display = resolveSectionScoreDisplay(row.scores);
      correct += display.correct;
      total += display.total;
    }
    return {
      correct,
      total,
      stars: starsFromLevelsEarnedMax(correct, total),
    };
  }, [rows]);

  const sectionMetaBySkill = useMemo(() => {
    const map = {};
    for (const row of rows) {
      if (row.status !== 'completed') continue;
      const skill = rowSkillKey(row.title);
      const { correct, total } = resolveSectionScoreDisplay(row.scores);
      map[skill] = {
        correct,
        total,
        stars: starsFromLevelsEarnedMax(correct, total),
      };
    }
    return map;
  }, [rows]);

  const showGeneralStats = generalStats.totalAttempts > 0;

  if (!config) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Level not configured.</p>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Loading your results…</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            Exam mode ·{' '}
            {stats.allComplete ? 'Final results' : stats.hasStarted ? 'Live statistics' : 'Statistics preview'}
          </p>
          <div className={showInlineHeroStats ? styles.heroTitleRow : undefined}>
            <h1 className={styles.title}>
              {config.cefr} — {examLabel}
            </h1>
            {showInlineHeroStats ? (
              <ProgressRing
                pct={stats.pct}
                tone={overallTone}
                label={ringLabel}
                compact
              />
            ) : null}
          </div>
          <p className={styles.subtitle}>
            {stats.allComplete
              ? 'Your full score breakdown and areas to improve before your next attempt.'
              : stats.hasStarted
                ? 'Track your progress section by section. Scores update as you finish each paper.'
                : 'This is what your scores will look like. All values start at zero until you complete each section.'}
          </p>

          {stats.allComplete ? (
            <div
              className={`${styles.verdict} ${
                stats.examPassed ? styles['verdict--pass'] : styles['verdict--fail']
              }`}
            >
              <span className={styles.verdictIcon} aria-hidden="true">
                {stats.examPassed ? '✓' : '!'}
              </span>
              <div>
                <p className={styles.verdictTitle}>
                  {stats.examPassed ? 'Exam passed' : 'Exam not passed'}
                </p>
                <p className={styles.verdictText}>
                  {stats.examPassed
                    ? `You reached at least ${stats.passThreshold}% in all ${stats.sectionsCount} sections.`
                    : `${stats.sectionsPassed} of ${stats.sectionsCount} sections met the ${stats.passThreshold}% pass mark.`}
                </p>
              </div>
            </div>
          ) : stats.hasStarted ? (
            <div className={`${styles.verdict} ${styles['verdict--progress']} ${styles.verdictWithStats}`}>
              <span className={styles.verdictIcon} aria-hidden="true">
                …
              </span>
              <p className={styles.verdictTitle}>Exam in progress</p>
              <HeroStatsSummary
                stats={stats}
                overallTone={overallTone}
                ringLabel={ringLabel}
                inline
                hideRing
                overallStars={overallScoreDisplay.stars}
              />
            </div>
          ) : (
            <div className={`${styles.verdict} ${styles['verdict--pending']}`}>
              <span className={styles.verdictIcon} aria-hidden="true">
                0
              </span>
              <div>
                <p className={styles.verdictTitle}>Not started yet</p>
                <p className={styles.verdictText}>
                  Start the exam to fill in these scores. Pass mark: {stats.passThreshold}% per
                  section.
                </p>
              </div>
            </div>
          )}

          {!showInlineHeroStats ? (
            <HeroStatsSummary
              stats={stats}
              overallTone={overallTone}
              ringLabel={ringLabel}
              overallStars={overallScoreDisplay.stars}
            />
          ) : null}

          {showGeneralStats ? (
            <div className={styles.dbStats}>
              <p className={styles.dbStatsLabel}>All attempts (saved in your account)</p>
              <div className={styles.dbStatsRow}>
                <span>
                  <strong>{generalStats.totalAttempts}</strong> attempts
                </span>
                <span>
                  <strong>{generalStats.bestPct}%</strong> best score
                </span>
                <span>
                  <strong>{generalStats.averagePct}%</strong> average
                </span>
                <span>
                  <strong>{generalStats.completedAttempts}</strong> full exams
                </span>
              </div>
            </div>
          ) : null}
        </header>

        {attemptHistory.length > 0 ? (
          <section className={styles.history}>
            <h2 className={styles.sectionsTitle}>Previous attempts</h2>
            <ul className={styles.historyList}>
              {attemptHistory.map((attempt) => (
                <li key={attempt.id} className={styles.historyItem}>
                  <div className={styles.historyMain}>
                    <p className={styles.historyDate}>{formatAttemptDate(attempt.archivedAt)}</p>
                    <p className={styles.historyScore}>
                      {attempt.summary?.correct ?? 0}
                      <span> / {attempt.summary?.displayTotal ?? attempt.summary?.total ?? 0}</span>
                      <span className={styles.historyPct}> ({attempt.summary?.pct ?? 0}%)</span>
                    </p>
                  </div>
                  <p className={styles.historyMeta}>
                    {attempt.summary?.sectionsCompleted ?? 0}/{attempt.summary?.sectionsCount ?? 4}{' '}
                    sections
                    {attempt.summary?.allComplete
                      ? attempt.summary?.examPassed
                        ? ' · Passed'
                        : ' · Completed'
                      : ' · Partial'}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className={styles.improve}>
          <h2 className={styles.sectionsTitle}>What to improve</h2>
          {stats.improvementTips.length > 0 ? (
            <ul className={styles.improveList}>
              {stats.improvementTips.map((item) => (
                <li
                  key={item.skill}
                  className={`${styles.improveItem}${
                    IMPROVE_ITEM_CLASS[item.skill] ? ` ${IMPROVE_ITEM_CLASS[item.skill]}` : ''
                  }`}
                >
                  <div className={styles.improveHead}>
                    <p className={styles.improveSkill}>{item.title}</p>
                    {sectionMetaBySkill[item.skill] ? (
                      <div className={styles.improveStars}>
                        <TheoryLevelStars
                          stars={sectionMetaBySkill[item.skill].stars}
                          size="sm"
                          variant="gold"
                        />
                        <span className={styles.improveScore}>
                          {sectionMetaBySkill[item.skill].correct}/
                          {sectionMetaBySkill[item.skill].total}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <p className={styles.improveTip}>{item.tip}</p>
                </li>
              ))}
            </ul>
          ) : stats.allComplete && stats.examPassed ? (
            <p className={styles.improveAllClear}>
              Strong performance across all sections. Keep practising under exam conditions to stay
              sharp.
            </p>
          ) : null}
        </section>

        <h2 className={styles.sectionsTitle}>
          {stats.hasStarted ? 'Current attempt' : 'Results by paper'}
        </h2>
        <div className={styles.grid}>
          {rows.map((row) => (
            <SectionCard
              key={row.key}
              row={row}
              examSlot={examSlot}
              onRepeatSection={repeatSection}
              onRepeatPart={repeatPart}
              rescoreBusy={rescoreBusy}
            />
          ))}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            onClick={() => repeatExam()}
            className={`${styles.footerLink} ${styles['footerLink--repeat']}`}
          >
            Repeat exam
          </button>
          <Link
            href={`/niveles/${slug}/exam-mode?examen=${examSlot}`}
            className={`${styles.footerLink} ${styles['footerLink--secondary']}`}
          >
            Exam menu
          </Link>
          <Link
            href={`/niveles/${slug}`}
            className={`${styles.footerLink} ${styles['footerLink--primary']}`}
          >
            Back to {config.cefr} hub
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default function ExamModeResultsView({ slug }) {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <p className={styles.loading}>Loading your results…</p>
        </main>
      }
    >
      <ExamModeResultsViewInner slug={slug} />
    </Suspense>
  );
}
