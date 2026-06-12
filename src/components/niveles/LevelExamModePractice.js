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
} from '@/utils/examModeSession';
import { getCambridgeSectionDurationMinutes } from '@/data/cambridgeExamTimings';
import { getLevelFullExamSections, getNivelesLevelHub } from '@/data/nivelesLevelHub';
import { supabase } from '@/utils/supabaseClient';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot } from '@/utils/levelsLevelCache';
import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { filterVisibleExamenes } from '@/utils/levelsExamVisibility';
import { clearExamSlotPuntuaciones } from '@/lib/fetchExamModeSlotStats';
import { useLevelsExamAdminFlow, buildExamSlotPickerProps } from '@/hooks/useLevelsExamAdminFlow';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import ExamPracticeReportError from '@/components/exam/ExamPracticeReportError';

function formatMinutes(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}min`;
  return `${min} min`;
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
        'Start this test again? Your previous answers and scores for this test will be cleared.',
      );
      if (!ok) return;
      const examenId = examenIdBySlot[slot];
      if (userId && examenId) {
        await clearExamSlotPuntuaciones(supabase, { userId, examenId });
      }
      resetExamModeSession(slug, slot, userId);
      if (slot === examSlot) {
        resetExam();
      }
      selectExamSlot(slot);
      setPickedSlot(true);
      router.push(`/niveles/${slug}/exam-mode?examen=${slot}`);
    },
    [slug, userId, examSlot, examenIdBySlot, resetExam, selectExamSlot, router],
  );

  const repeatCurrentExam = useCallback(() => {
    void repeatExam({ examenId: examenIdBySlot[examSlot] });
  }, [repeatExam, examenIdBySlot, examSlot]);

  const examComplete = session ? isExamModeComplete(session) : false;
  const statsHref = `/niveles/${slug}/exam-mode/results?examen=${examSlot}`;
  const examLabel = examNamesBySlot[examSlot] || `Test ${examSlot}`;

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

      {!pickedSlot ? (
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
      ) : (
        <div style={{ maxWidth: '720px', margin: '1.5rem auto 0' }}>
          <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#2b6cb0', textTransform: 'uppercase' }}>
              Exam mode
            </p>
            <h1 style={{ margin: '0.35rem 0', color: '#1a365d' }}>
              {slug === 'b2' ? 'B2 Full Exam Simulation' : `${config.cefr} Exam Simulation`}
            </h1>
            <p style={{ margin: '0.5rem 0 0', color: '#4a5568', lineHeight: 1.5 }}>
              Complete the exam under timed conditions. Feedback is shown at the end.
            </p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
              {examLabel} · Complete each section in order. Once you finish a section, you cannot go back until the exam ends.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.65rem',
                justifyContent: 'center',
                marginTop: '1rem',
              }}
            >
              <Link
                href={statsHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  border: '1px solid #bfdbfe',
                }}
              >
                Statistics
              </Link>
              <button
                type="button"
                onClick={repeatCurrentExam}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  background: '#fff',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: '2px solid #2563eb',
                  cursor: 'pointer',
                }}
              >
                Repeat exam
              </button>
            </div>
          </header>

          {examComplete && session?.resultsReleased ? (
            <div
              style={{
                textAlign: 'center',
                padding: '1.25rem',
                borderRadius: '12px',
                background: '#f0fff4',
                border: '2px solid #68d391',
                marginBottom: '1.5rem',
              }}
            >
              <p style={{ margin: '0 0 1rem', fontWeight: 600 }}>You have completed this exam.</p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.65rem',
                  justifyContent: 'center',
                }}
              >
                <Link
                  href={`/niveles/${slug}/exam-mode/results?examen=${examSlot}`}
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    background: '#2f855a',
                    color: '#fff',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  View results & review errors
                </Link>
                <button
                  type="button"
                  onClick={repeatCurrentExam}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    border: '2px solid #2563eb',
                    cursor: 'pointer',
                  }}
                >
                  Repeat exam
                </button>
              </div>
            </div>
          ) : null}

          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.85rem' }}>
            {(ready ? session?.sections : sections.map((s) => ({ ...s, status: 'locked' })))?.map((sec, idx) => {
              const mins = getCambridgeSectionDurationMinutes(slug, sec.title);
              const status = sec.status || (idx === 0 ? 'active' : 'locked');
              const isLocked = status === 'locked';
              const isDone = status === 'completed';
              const isActive = status === 'active';
              const href = buildExamModePracticeHref(sec.href, examSlot);

              return (
                <li key={sec.key}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.15rem',
                      borderRadius: '12px',
                      border: `2px solid ${isActive ? '#63b3ed' : isDone ? '#68d391' : '#e2e8f0'}`,
                      background: isActive ? '#ebf8ff' : isDone ? '#f0fff4' : '#f7fafc',
                      opacity: isLocked ? 0.65 : 1,
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }} aria-hidden="true">
                      {sec.emoji || '📋'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1a365d' }}>{sec.title}</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#4a5568' }}>
                        {sec.partsLabel || `Parts ${sec.partMin}–${sec.partMax}`} · {formatMinutes(mins)}
                      </p>
                      {isDone && sec.scores ? (
                        <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', fontWeight: 600, color: '#2f855a' }}>
                          Saved — {sec.scores.correct}/{sec.scores.total} items
                        </p>
                      ) : null}
                    </div>
                    {isLocked ? (
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#718096' }}>Locked</span>
                    ) : isDone ? (
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2f855a' }}>Done ✓</span>
                    ) : (
                      <Link
                        href={href}
                        style={{
                          padding: '0.55rem 1rem',
                          borderRadius: '8px',
                          background: '#2b6cb0',
                          color: '#fff',
                          fontWeight: 700,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sec.startedAt ? 'Continue' : 'Start'}
                      </Link>
                    )}
                  </div>
                  <div style={{ marginTop: '0.45rem', textAlign: 'right' }}>
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

          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href={`/niveles/${slug}`} style={{ color: '#4a5568' }}>
              ← Back to {config.cefr} hub
            </Link>
          </p>
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
