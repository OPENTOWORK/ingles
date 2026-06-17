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
  loadExamModeSession,
  resetExamModeSession,
} from '@/utils/examModeSession';
import { archiveExamModeAttempt } from '@/utils/examModeAttemptHistory';
import { getCambridgeSectionDurationMinutes } from '@/data/cambridgeExamTimings';
import { getLevelFullExamSections, getNivelesLevelHub } from '@/data/nivelesLevelHub';
import { supabase } from '@/utils/supabaseClient';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot } from '@/utils/levelsLevelCache';
import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { filterVisibleExamenes } from '@/utils/levelsExamVisibility';
import { useLevelsExamAdminFlow, buildExamSlotPickerProps } from '@/hooks/useLevelsExamAdminFlow';
import { useLevelsExamRegenerationListener } from '@/hooks/useLevelsExamRegenerationListener';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import ExamPracticeLevelPicker from '@/components/niveles/ExamPracticeLevelPicker';
import ExamPracticeReportError from '@/components/exam/ExamPracticeReportError';
import ExamSkillIcon from '@/components/exam/ExamSkillIcon';

function formatMinutes(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}min`;
  return `${min} min`;
}

function sectionSkillTheme(title) {
  const t = String(title || '').toLowerCase();
  if (t.includes('writing')) return 'writing';
  if (t.includes('listening')) return 'listening';
  if (t.includes('speaking')) return 'speaking';
  return 'reading';
}

function LevelExamModePracticeInner({ slug }) {
  const config = getNivelesLevelHub(slug);
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const q = searchParams.get('examen');
    if (!q || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    selectExamSlot(Number(q));
    setPickedSlot(true);
  }, [searchParams, selectExamSlot]);

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
        names[Number(slot)] = row?.nombre?.trim() || `Test ${slot}`;
      });
      setExamNamesBySlot(names);
    } catch {
      setExamNamesBySlot({});
    }
  }, [slug]);

  useEffect(() => {
    void loadExamCatalog();
  }, [loadExamCatalog]);

  useLevelsExamRegenerationListener({
    slug,
    examSlot,
    onRegenerated: loadExamCatalog,
  });

  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot,
    adminFlow,
    onSelectSlot: (slot) => {
      selectExamSlot(slot);
      setPickedSlot(true);
    },
  });

  const handlePickExam = useCallback(
    (n) => {
      selectExamSlot(n);
      setPickedSlot(true);
    },
    [selectExamSlot],
  );

  const handleViewStatistics = useCallback(
    (slot) => {
      router.push(`/niveles/${slug}/exam-mode/results?examen=${slot}`);
    },
    [router, slug],
  );

  const handleRepeatExamSlot = useCallback(
    async (slot) => {
      const ok = window.confirm(
        'Start a new attempt? Your current progress will be cleared, but this attempt will be saved in your exam statistics.',
      );
      if (!ok) return;
      const slotSession = loadExamModeSession(slug, slot, userId);
      if (slotSession) {
        await archiveExamModeAttempt({ slug, examSlot: slot, userId, session: slotSession });
      }
      resetExamModeSession(slug, slot, userId);
      if (slot === examSlot) {
        resetExam();
      }
      selectExamSlot(slot);
      setPickedSlot(true);
      router.push(`/niveles/${slug}/exam-mode?examen=${slot}`);
    },
    [slug, userId, examSlot, resetExam, selectExamSlot, router],
  );

  const repeatCurrentExam = useCallback(() => {
    void repeatExam();
  }, [repeatExam]);

  const examComplete = session ? isExamModeComplete(session) : false;
  const statsHref = `/niveles/${slug}/exam-mode/results?examen=${examSlot}`;
  const examLabel = examNamesBySlot[examSlot] || `Test ${examSlot}`;

  const displaySections = ready
    ? session?.sections
    : sections.map((s, idx) => ({ ...s, status: idx === 0 ? 'active' : 'locked' }));
  const completedSections = (displaySections || []).filter((s) => s.status === 'completed').length;
  const totalSections = displaySections?.length || sections.length;
  const progressPct = totalSections ? Math.round((completedSections / totalSections) * 100) : 0;

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
        <>
          <ExamPracticeLevelPicker
            variant="strip"
            activeLevel={slug}
            linkForLevel={(level) => `/niveles/${level.slug}/exam-mode`}
          />

          <B2ExamSlotProgressPicker
            value={examSlot}
            onSelect={handlePickExam}
            progressBySlot={{}}
            partsInPaper={sections.length}
            examLabelsBySlot={examNamesBySlot}
            lang="en"
            onViewStatistics={handleViewStatistics}
            onRepeatExam={handleRepeatExamSlot}
            {...examSlotPickerProps}
          />

          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '1.5rem auto 0', color: '#4a5568' }}>
          <h1 style={{ margin: '0 0 0.75rem', color: '#1a365d' }}>
            {slug === 'b2' ? 'B2 Full Exam Simulation' : `Exam mode — ${config.cefr}`}
          </h1>
          {slug === 'b2' ? (
            <p style={{ margin: '0 0 1.25rem', color: '#4a5568', lineHeight: 1.65, maxWidth: '42rem' }}>
              Complete the exam under timed conditions. Feedback is shown at the end.
            </p>
          ) : null}
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            Choose one of the <strong>available tests</strong>. You will complete each paper under official exam-style time limits.
            Answers are hidden until you finish the full exam. Your progress is saved so you can continue later.
          </p>
        </div>
        </>
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
                  <span className="exam-mode-session__exam-tag">{examLabel}</span>
                </div>
                <h1 className="exam-mode-session__title">
                  {slug === 'b2' ? 'B2 Full Exam Simulation' : `${config.cefr} Exam Simulation`}
                </h1>
                <p className="exam-mode-session__lead">
                  Complete each paper in order under timed conditions. Feedback is released when you
                  finish the full exam — sections lock once submitted.
                </p>
              </div>
              <div className="exam-mode-session__actions">
                <Link href={statsHref} className="exam-mode-session__btn exam-mode-session__btn--ghost">
                  Statistics
                </Link>
                <button
                  type="button"
                  className="exam-mode-session__btn exam-mode-session__btn--outline"
                  onClick={repeatCurrentExam}
                >
                  Repeat exam
                </button>
              </div>
            </div>

            <div className="exam-mode-session__progress-wrap">
              <div className="exam-mode-session__progress-label">
                <span>Progress</span>
                <strong>
                  {completedSections} of {totalSections} papers complete
                </strong>
              </div>
              <div
                className="exam-mode-session__progress-track"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Exam progress"
              >
                <div
                  className="exam-mode-session__progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </header>

          {examComplete && session?.resultsReleased ? (
            <div className="exam-mode-session__complete-banner">
              <p>You have completed this exam.</p>
              <div className="exam-mode-session__complete-actions">
                <Link
                  href={`/niveles/${slug}/exam-mode/results?examen=${examSlot}`}
                  className="exam-mode-session__btn exam-mode-session__btn--success"
                >
                  View results & review errors
                </Link>
                <button
                  type="button"
                  className="exam-mode-session__btn exam-mode-session__btn--outline"
                  onClick={repeatCurrentExam}
                >
                  Repeat exam
                </button>
              </div>
            </div>
          ) : null}

          <ol className="exam-mode-session__timeline">
            {displaySections?.map((sec, idx) => {
              const mins = getCambridgeSectionDurationMinutes(slug, sec.title);
              const status = sec.status || (idx === 0 ? 'active' : 'locked');
              const isLocked = status === 'locked';
              const isDone = status === 'completed';
              const isActive = status === 'active';
              const href = buildExamModePracticeHref(sec.href, examSlot);
              const skill = sectionSkillTheme(sec.title);

              const cardClass = [
                'exam-mode-session__card',
                isActive ? 'exam-mode-session__card--active' : '',
                isDone ? 'exam-mode-session__card--completed' : '',
                isLocked ? 'exam-mode-session__card--locked' : '',
              ]
                .filter(Boolean)
                .join(' ');

              const itemClass = [
                'exam-mode-session__timeline-item',
                isDone ? 'exam-mode-session__timeline-item--completed' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <li key={sec.key} className={itemClass}>
                  <div className={cardClass}>
                    <div className={`exam-mode-session__icon-wrap exam-mode-session__icon-wrap--${skill}`}>
                      <ExamSkillIcon theme={skill} size="md" />
                    </div>
                    <div className="exam-mode-session__body">
                      <p className="exam-mode-session__section-title">{sec.title}</p>
                      <p className="exam-mode-session__section-meta">
                        {sec.partsLabel || `Parts ${sec.partMin}–${sec.partMax}`} · {formatMinutes(mins)}
                      </p>
                      {isDone && sec.scores ? (
                        <p className="exam-mode-session__section-score">
                          Saved — {sec.scores.correct}/{sec.scores.total} items
                        </p>
                      ) : null}
                    </div>
                    <div className="exam-mode-session__aside">
                      {isLocked ? (
                        <span className="exam-mode-session__status exam-mode-session__status--locked">
                          Locked
                        </span>
                      ) : isDone ? (
                        <span className="exam-mode-session__status exam-mode-session__status--done">
                          Done ✓
                        </span>
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
            })}
          </ol>

          <footer className="exam-mode-session__footer">
            <button
              type="button"
              className="exam-mode-session__footer-link"
              onClick={() => setPickedSlot(false)}
            >
              ← Choose another exam
            </button>
            <Link href="/niveles/b2" className="exam-mode-session__footer-link">
              Back to exam practice
            </Link>
          </footer>
        </div>
      )}
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
