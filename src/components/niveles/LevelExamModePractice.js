'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import { useLevelExamPracticeSlot } from '@/hooks/useLevelExamPracticeSlot';
import { useExamModeSession } from '@/hooks/useExamModeSession';
import {
  buildExamModePracticeHref,
  isExamModeComplete,
  resetExamModeSession,
  resolveExamModeSectionScoreDisplay,
} from '@/utils/examModeSession';
import { getCambridgeSectionDurationMinutes } from '@/data/cambridgeExamTimings';
import { getLevelFullExamSections, getNivelesLevelHub } from '@/data/nivelesLevelHub';
import { supabase } from '@/utils/supabaseClient';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot } from '@/utils/levelsLevelCache';
import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { filterVisibleExamenes } from '@/utils/levelsExamVisibility';
import { clearExamSlotPuntuaciones } from '@/lib/fetchExamModeSlotStats';
import { shouldClearExamSlotPuntuacionesOnRepeat } from '@/lib/b2ScoringV2FeatureFlag';
import { useLevelsExamAdminFlow, buildExamSlotPickerProps, getAvailableExamSlots } from '@/hooks/useLevelsExamAdminFlow';
import { useExamModePickerProgress } from '@/hooks/useExamModePickerProgress';
import { useExamSlotPlanGating } from '@/hooks/useExamSlotPlanGating';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import ExamPracticeLevelPicker from '@/components/niveles/ExamPracticeLevelPicker';
import ExamPracticeReportError from '@/components/exam/ExamPracticeReportError';
import { formatExamSlotDisplayLabel } from '@/utils/formatExamDisplayLabel';
import TheoryLevelStars from '@/components/theory/TheoryLevelStars';
import { starsFromLevelsEarnedMax } from '@/lib/levelsStars';
import { PASS_THRESHOLD } from '@/utils/examModeStats';
import { useUserRole } from '@/context/UserRoleContext';
import { isExamModeSectionKeyBlockedForStudent } from '@/constants/studentFeatureAccess';

function formatMinutes(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}min`;
  return `${min} min`;
}

function resolveSectionScoreDisplay(scores) {
  return resolveExamModeSectionScoreDisplay(scores);
}

function resolveSectionStars(scores) {
  const { correct, total } = resolveSectionScoreDisplay(scores);
  return starsFromLevelsEarnedMax(correct, total);
}

function sectionIconClass(title = '') {
  const t = title.toLowerCase();
  if (t.includes('reading') || t.includes('use of english')) {
    return 'exam-mode-session__icon-wrap--reading';
  }
  if (t.includes('writing')) return 'exam-mode-session__icon-wrap--writing';
  if (t.includes('listening')) return 'exam-mode-session__icon-wrap--listening';
  if (t.includes('speaking')) return 'exam-mode-session__icon-wrap--speaking';
  return '';
}

function LevelExamModePracticeInner({ slug }) {
  const config = getNivelesLevelHub(slug);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userRole } = useUserRole();
  const { examSlot, selectExamSlot } = useLevelExamPracticeSlot(slug);
  const { session, ready, repeatExam, userId, resetExam } = useExamModeSession(slug, examSlot);
  const [examNamesBySlot, setExamNamesBySlot] = useState({});
  const [examenIdBySlot, setExamenIdBySlot] = useState({});
  const [pickedSlot, setPickedSlot] = useState(false);
  const adminFlow = useLevelsExamAdminFlow({
    slug,
    examenIdBySlot,
    onCatalogUpdated: async () => {
      await loadExamCatalog();
    },
  });
  const autoOpenedRef = useRef(false);

  const sections = useMemo(() => getLevelFullExamSections(slug), [slug]);
  const playableSectionCount = useMemo(
    () => sections.filter((section) => !isExamModeSectionKeyBlockedForStudent(userRole, section.key)).length,
    [sections, userRole],
  );
  const availableSlots = useMemo(() => getAvailableExamSlots(examenIdBySlot), [examenIdBySlot]);
  const { progressBySlot, refreshProgress } = useExamModePickerProgress({
    slug,
    userId,
    availableSlots,
  });
  const planGating = useExamSlotPlanGating(progressBySlot);
  const lockedSlots = planGating.lockedSlots;
  const handleLockedSlotClick = planGating.onLockedSlotClick;

  const handlePickExam = useCallback(
    (n) => {
      planGating.wrapSelectHandler((slot) => {
        selectExamSlot(slot);
        setPickedSlot(true);
      })(n);
    },
    [planGating, selectExamSlot],
  );

  useEffect(() => {
    refreshProgress();
  }, [session, pickedSlot, refreshProgress]);

  useEffect(() => {
    const q = searchParams.get('examen');
    if (!q || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    void handlePickExam(Number(q));
  }, [searchParams, handlePickExam]);

  const loadExamCatalog = useCallback(async () => {
    try {
      const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
      if (!levelData?.id) return;
      const { data } = await supabase
        .from('levels_examenes')
        .select('id, nombre, modelo')
        .eq('level_id', levelData.id);
      const ordered = sortLevelsExamenesRows(filterVisibleExamenes(data));
      const idsBySlot = await getCachedExamenIdsBySlot(supabase, levelData.id);
      setExamenIdBySlot(idsBySlot);
      const names = {};
      Object.entries(idsBySlot).forEach(([slot, id]) => {
        const row = ordered.find((r) => r.id === id);
        names[Number(slot)] = formatExamSlotDisplayLabel(row?.nombre, slot);
      });
      setExamNamesBySlot(names);
    } catch {
      setExamNamesBySlot({});
    }
  }, [slug]);

  useEffect(() => {
    void loadExamCatalog();
  }, [loadExamCatalog]);

  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot,
    adminFlow,
    onSelectSlot: (slot) => {
      void handlePickExam(slot);
    },
  });

  const handleViewStatistics = useCallback(
    (slot) => {
      router.push(`/niveles/${slug}/exam-mode/results?examen=${slot}`);
    },
    [router, slug],
  );

  const handleRepeatExamSlot = useCallback(
    async (slot) => {
      const ok = window.confirm(
        'Start this test again? Your previous answers and scores for this test will be cleared.',
      );
      if (!ok) return;
      const examenId = examenIdBySlot[slot];
      if (userId && examenId && shouldClearExamSlotPuntuacionesOnRepeat(slug)) {
        await clearExamSlotPuntuaciones(supabase, { userId, examenId });
      }
      resetExamModeSession(slug, slot, userId, userRole);
      if (slot === examSlot) {
        resetExam();
      }
      refreshProgress();
      selectExamSlot(slot);
      setPickedSlot(true);
      router.push(`/niveles/${slug}/exam-mode?examen=${slot}`);
    },
    [slug, userId, examSlot, examenIdBySlot, resetExam, selectExamSlot, router, refreshProgress, userRole],
  );

  const repeatCurrentExam = useCallback(() => {
    void repeatExam({ examenId: examenIdBySlot[examSlot] });
  }, [repeatExam, examenIdBySlot, examSlot]);

  const examComplete = session ? isExamModeComplete(session, userRole) : false;
  const statsHref = `/niveles/${slug}/exam-mode/results?examen=${examSlot}`;
  const examLabel = examNamesBySlot[examSlot] || formatExamSlotDisplayLabel(null, examSlot);

  const overallExamScore = useMemo(() => {
    if (!session?.sections?.length) return { correct: 0, total: 0, stars: 0 };
    let correct = 0;
    let total = 0;
    for (const sec of session.sections) {
      if (isExamModeSectionKeyBlockedForStudent(userRole, sec.key)) continue;
      if (sec.status !== 'completed' || !sec.scores) continue;
      const display = resolveSectionScoreDisplay(sec.scores);
      correct += display.correct;
      total += display.total;
    }
    return {
      correct,
      total,
      stars: starsFromLevelsEarnedMax(correct, total),
    };
  }, [session, userRole]);

  const examPassed = useMemo(() => {
    if (!session?.sections?.length) return false;
    const playable = session.sections.filter(
      (sec) => !isExamModeSectionKeyBlockedForStudent(userRole, sec.key),
    );
    const allComplete = playable.every((sec) => sec.status === 'completed');
    if (!allComplete) return false;
    return playable.every((sec) => {
      const { correct, total } = resolveSectionScoreDisplay(sec.scores);
      if (total <= 0) return false;
      return Math.round((correct / total) * 100) >= PASS_THRESHOLD;
    });
  }, [session, userRole]);

  const completedSections = useMemo(() => {
    if (!session?.sections?.length) return 0;
    return session.sections.filter(
      (sec) =>
        sec.status === 'completed' && !isExamModeSectionKeyBlockedForStudent(userRole, sec.key),
    ).length;
  }, [session, userRole]);

  const sectionProgressPct =
    playableSectionCount > 0
      ? Math.round((completedSections / playableSectionCount) * 100)
      : 0;

  if (!config) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Level not configured.</p>
      </main>
    );
  }

  return (
    <B2ExamPracticeLayout examPracticeOpen={pickedSlot}>
      {adminFlow.canRegenerateExams ? (
        <A2ExamGenerationStatus
          generating={adminFlow.generating}
          genError={adminFlow.genError}
          genProgress={adminFlow.genProgress}
          genStep={adminFlow.genStep}
          genTotal={adminFlow.genTotal}
          genEtaSeconds={adminFlow.genEtaSeconds}
          genPartLabel={adminFlow.genPartLabel}
          onDismissError={adminFlow.clearGenError}
        />
      ) : null}

      {!pickedSlot ? (
        <div className="exam-mode-landing levels-b2-page-content">
          <div className="exam-mode-landing__hero">
            <span className="exam-mode-landing__eyebrow">Exam mode</span>
            <h1 className="exam-mode-landing__title">
              {slug === 'b2' ? 'B2 Full Exam Simulation' : `Exam mode — ${config.cefr}`}
            </h1>
            <p className="exam-mode-landing__lead">
              Complete the exam under timed conditions. Feedback is shown at the end.
            </p>
            <ul className="exam-mode-landing__features">
              <li className="exam-mode-landing__feature">
                <span className="exam-mode-landing__feature-icon" aria-hidden="true">
                  ⏱
                </span>
                Official time limits
              </li>
              <li className="exam-mode-landing__feature">
                <span className="exam-mode-landing__feature-icon" aria-hidden="true">
                  🔒
                </span>
                Answers hidden until the end
              </li>
              <li className="exam-mode-landing__feature">
                <span className="exam-mode-landing__feature-icon" aria-hidden="true">
                  💾
                </span>
                Progress saved
              </li>
            </ul>
          </div>

          <ExamPracticeLevelPicker
            variant="strip"
            activeLevel={slug}
            linkForLevel={(level) => `/niveles/${level.slug}/exam-mode`}
          />

          <B2ExamSlotProgressPicker
            value={examSlot}
            onSelect={(n) => void handlePickExam(n)}
            progressBySlot={progressBySlot}
            partsInPaper={playableSectionCount || sections.length}
            examLabelsBySlot={examNamesBySlot}
            lang="en"
            className="levels-b2-exam-picker--exam-mode"
            onViewStatistics={handleViewStatistics}
            onRepeatExam={handleRepeatExamSlot}
            lockedSlots={lockedSlots}
            onLockedSlotClick={handleLockedSlotClick}
            {...examSlotPickerProps}
          />

        </div>
      ) : (
        <div className="exam-mode-session">
          <ExamPracticeLevelPicker
            variant="strip"
            activeLevel={slug}
            linkForLevel={(level) => `/niveles/${level.slug}/exam-mode`}
          />

          <header className="exam-mode-session__header">
            <div className="exam-mode-session__header-top">
              <div>
                <div className="exam-mode-session__badge-row">
                  <span className="exam-mode-session__eyebrow">Exam mode</span>
                </div>
                <h1 className="exam-mode-session__title">{examLabel}</h1>
                <p className="exam-mode-session__lead">
                  Complete each section in order. Once you finish a section, you cannot go back until the exam ends.
                </p>
              </div>
              {!(examComplete && session?.resultsReleased) ? (
                <div className="exam-mode-session__actions">
                  <Link href={statsHref} className="exam-mode-session__btn exam-mode-session__btn--outline">
                    Statistics
                  </Link>
                  <button
                    type="button"
                    onClick={repeatCurrentExam}
                    className="exam-mode-session__btn exam-mode-session__btn--outline"
                  >
                    Repeat exam
                  </button>
                </div>
              ) : null}
            </div>

            {!examComplete ? (
              <div className="exam-mode-session__progress-wrap">
                <div className="exam-mode-session__progress-label">
                  <span>Sections completed</span>
                  <strong>
                    {completedSections}/{playableSectionCount || sections.length}
                  </strong>
                </div>
                <div
                  className="exam-mode-session__progress-track"
                  role="progressbar"
                  aria-valuenow={sectionProgressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Exam progress"
                >
                  <div
                    className="exam-mode-session__progress-fill"
                    style={{ width: `${sectionProgressPct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </header>

          {examComplete && session?.resultsReleased ? (
            <div
              className={`exam-mode-session__complete-banner${
                examPassed ? '' : ' exam-mode-session__complete-banner--failed'
              }`}
            >
              <p>{examPassed ? 'You have completed this exam.' : 'Exam not passed'}</p>
              <div className="exam-mode-session__complete-score">
                <TheoryLevelStars stars={overallExamScore.stars} size="md" variant="gold" />
                <span className="exam-mode-session__complete-score-label">
                  {overallExamScore.correct}/{overallExamScore.total} items
                </span>
              </div>
              <div className="exam-mode-session__complete-actions">
                <Link
                  href={`/niveles/${slug}/exam-mode/results?examen=${examSlot}`}
                  className="exam-mode-session__btn exam-mode-session__btn--review"
                >
                  View results & review errors
                </Link>
                <button
                  type="button"
                  onClick={repeatCurrentExam}
                  className="exam-mode-session__btn exam-mode-session__btn--repeat"
                >
                  Repeat exam
                </button>
              </div>
            </div>
          ) : null}

          <ol className="exam-mode-session__timeline">
            {(ready ? session?.sections : sections.map((s) => ({ ...s, status: 'locked' })))?.map(
              (sec, idx) => {
                const mins = getCambridgeSectionDurationMinutes(slug, sec.title);
                const status = sec.status || (idx === 0 ? 'active' : 'locked');
                const isBlocked =
                  status === 'blocked' || isExamModeSectionKeyBlockedForStudent(userRole, sec.key);
                const isLocked = !isBlocked && status === 'locked';
                const isDone = !isBlocked && status === 'completed';
                const isActive = !isBlocked && status === 'active';
                const href = buildExamModePracticeHref(sec.href, examSlot);
                const sectionScore = resolveSectionScoreDisplay(sec.scores);
                const sectionStars = isDone ? resolveSectionStars(sec.scores) : 0;
                const cardState = isBlocked
                  ? 'blocked'
                  : isActive
                    ? 'active'
                    : isDone
                      ? 'completed'
                      : 'locked';

                return (
                  <li
                    key={sec.key}
                    className={`exam-mode-session__timeline-item${
                      isDone ? ' exam-mode-session__timeline-item--completed' : ''
                    }`}
                  >
                    <div className={`exam-mode-session__card exam-mode-session__card--${cardState}`}>
                      <div
                        className={`exam-mode-session__icon-wrap ${sectionIconClass(sec.title)}`.trim()}
                      >
                        <span aria-hidden="true">{sec.emoji || '📋'}</span>
                      </div>
                      <div className="exam-mode-session__body">
                        <p className="exam-mode-session__section-title">{sec.title}</p>
                        <p className="exam-mode-session__section-meta">
                          {sec.partsLabel || `Parts ${sec.partMin}–${sec.partMax}`} ·{' '}
                          {formatMinutes(mins)}
                        </p>
                        {isDone && sec.scores ? (
                          <p className="exam-mode-session__section-score">
                            Saved — {sectionScore.correct}/{sectionScore.total} items
                          </p>
                        ) : null}
                      </div>
                      <div className="exam-mode-session__aside">
                        {isBlocked ? (
                          <span className="exam-mode-session__status exam-mode-session__status--blocked">
                            Coming soon
                          </span>
                        ) : isLocked ? (
                          <span className="exam-mode-session__status exam-mode-session__status--locked">
                            Locked
                          </span>
                        ) : isDone ? (
                          <>
                            <TheoryLevelStars stars={sectionStars} size="sm" variant="gold" />
                            <span className="exam-mode-session__status exam-mode-session__status--done">
                              Done ✓
                            </span>
                          </>
                        ) : (
                          <Link href={href} className="exam-mode-session__cta">
                            {sec.startedAt ? 'Continue' : 'Start'}
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="exam-mode-session__report">
                      <ExamPracticeReportError
                        context={{
                          levelSlug: slug,
                          skillRoute: 'exam-mode',
                          examSlot,
                          sectionTitle: sec.title,
                          practiceMode: 'exam-mode-hub',
                          hub: true,
                          url: href,
                        }}
                      />
                    </div>
                  </li>
                );
              },
            )}
          </ol>

          <footer className="exam-mode-session__footer">
            <Link href={`/niveles/${slug}`} className="exam-mode-session__footer-link">
              ← Back to exam practice
            </Link>
          </footer>
        </div>
      )}
      {planGating.planUpgradeModal}
    </B2ExamPracticeLayout>
  );
}

export default function LevelExamModePractice({ slug }) {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
          Loading exam mode…
        </main>
      }
    >
      <LevelExamModePracticeInner slug={slug} />
    </Suspense>
  );
}
