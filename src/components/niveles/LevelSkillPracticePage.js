'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';
import ExamPracticeProgressPanel from '@/components/exam/ExamPracticeProgressPanel';
import ExamPracticeSessionSideRail from '@/components/exam/ExamPracticeSessionSideRail';
import ReadingPracticeChrome from '@/components/exam/ReadingPracticeChrome';
import { ReadingPracticeSessionProvider, useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import { useLevelExamPracticeSlot } from '@/hooks/useLevelExamPracticeSlot';
import { useLevelExamScoringSession } from '@/hooks/useLevelExamScoringSession';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import {
  applyExamSlotToHref,
  getLevelExamSkillRoute,
  getNivelesLevelHub,
} from '@/data/nivelesLevelHub';
import { formatPartsLabel, getExamSkillPartRange } from '@/data/levelExamPartMap';
import { supabase } from '@/utils/supabaseClient';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot } from '@/utils/levelsLevelCache';
import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { filterVisibleExamenes } from '@/utils/levelsExamVisibility';
import { useLevelsExamAdminFlow, reloadExamNamesBySlot, buildExamSlotPickerProps } from '@/hooks/useLevelsExamAdminFlow';
import { createLevelsExamCatalogUpdatedHandler } from '@/utils/levelsExamRegenerationSync';
import { invalidateLevelsPracticeCache } from '@/hooks/useLevelsPracticeData';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import { getSkillPracticeThemeKey } from '@/utils/skillPartFirstProgress';
import { runKeepPracticingSkillFlow } from '@/utils/skillPracticeNavigation';

function parsePartNumber(text) {
  const m = String(text || '').match(/Part\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function LevelSkillPracticePageInner({ slug, skillRoute }) {
  const config = getNivelesLevelHub(slug);
  const routeMeta = getLevelExamSkillRoute(slug, skillRoute);
  const searchParams = useSearchParams();
  const { examSlot, selectExamSlot } = useLevelExamPracticeSlot(slug);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [examNamesBySlot, setExamNamesBySlot] = useState({});
  const bootstrapRef = useRef(false);

  const partRows = useMemo(() => {
    if (!config?.sections || !routeMeta?.section) return [];
    return (config.sections[routeMeta.section] || [])
      .filter((t) => !String(t.text).toLowerCase().includes('speaking lab'))
      .map((topic, index) => {
        const partNumber = parsePartNumber(topic.text) ?? index + 1;
        return {
          id: `part-${partNumber}`,
          nombre: `Part ${partNumber}`,
          partNumber,
          displayName: topic.text.replace(/^Part\s*\d+:\s*/i, '').trim() || topic.text,
          href: topic.href,
        };
      });
  }, [config?.sections, routeMeta?.section]);

  const skillPartRange = useMemo(
    () => getExamSkillPartRange(slug, skillRoute),
    [slug, skillRoute],
  );
  const partMin = skillPartRange.partMin;
  const partMax = skillPartRange.partMax;

  const scoring = useLevelExamScoringSession({ slug, partMin, partMax });
  const adminFlow = useLevelsExamAdminFlow({
    slug,
    examenIdBySlot: scoring.examenIdBySlot,
    onCatalogUpdated: createLevelsExamCatalogUpdatedHandler([
      scoring.reloadExamCatalog,
      async () => {
        const uid = await getSessionUserId();
        if (uid) invalidateLevelsPracticeCache(uid);
      },
    ]),
  });
  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot: scoring.examenIdBySlot,
    adminFlow,
    onSelectSlot: (slot) => scoring.handleSelectExam(selectExamSlot, slot),
  });
  const categoryTimer = useLevelsCategoryTimer();
  const skillTheme = getSkillPracticeThemeKey(skillRoute);
  const examModeActive = Boolean(searchParams.get('examMode'));

  useEffect(() => {
    void (async () => {
      const names = {};
      try {
        const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
        if (!levelData?.id) {
          setExamNamesBySlot(names);
          return;
        }
        const { data } = await supabase
          .from('levels_examenes')
          .select('id, nombre, modelo')
          .eq('level_id', levelData.id);
        const ordered = sortLevelsExamenesRows(filterVisibleExamenes(data));
        const idsBySlot = await getCachedExamenIdsBySlot(supabase, levelData.id);
        Object.entries(idsBySlot).forEach(([slot, id]) => {
          const row = ordered.find((r) => r.id === id);
          names[Number(slot)] = row?.nombre?.trim() || `Examen ${slot}`;
        });
      } catch {
        /* fallback names */
      }
      setExamNamesBySlot(names);
    })();
  }, [slug]);

  useEffect(() => {
    if (examModeActive || bootstrapRef.current) return;

    const qExam = searchParams.get('examen');
    const slot =
      qExam && Number.isFinite(Number(qExam)) && Number(qExam) > 0 ? Number(qExam) : 1;

    if (!scoring.examPracticeOpen) {
      scoring.handleSelectExam(selectExamSlot, slot);
    }

    bootstrapRef.current = true;
  }, [examModeActive, searchParams, scoring, selectExamSlot]);

  useEffect(() => {
    if (partRows.length && !selectedPartId) {
      const qPart = searchParams.get('part');
      const fromQuery = qPart ? partRows.find((p) => p.partNumber === Number(qPart)) : null;
      setSelectedPartId((fromQuery || partRows[0]).id);
    }
  }, [partRows, selectedPartId, searchParams]);

  const handleSelectExamSlot = useCallback(
    (slot) => {
      scoring.handleSelectExam(selectExamSlot, slot);
    },
    [scoring, selectExamSlot],
  );

  const handleSelectPart = useCallback(
    (part) => {
      setSelectedPartId(part.id);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('part', String(part.partNumber));
        window.history.replaceState(null, '', url.pathname + url.search);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [],
  );

  const handleKeepPracticing = useCallback(() => {
    const currentPart =
      partRows.find((p) => p.id === selectedPartId) || partRows[0];
    runKeepPracticingSkillFlow({
      examSlot,
      examenIdBySlot: scoring.examenIdBySlot,
      partNumber: currentPart?.partNumber ?? partMin,
      progressBySlot: scoring.progressBySlot,
      onSelectExamSlot: (slot) => {
        void scoring.refreshPuntuacionesProgress();
        handleSelectExamSlot(slot);
      },
      onAdvanceToNextPart: () => {
        const current = currentPart?.partNumber ?? partRows[0]?.partNumber ?? 1;
        const idx = partRows.findIndex((p) => p.partNumber === current);
        const next = idx >= 0 && idx < partRows.length - 1 ? partRows[idx + 1] : partRows[0];
        if (next) {
          handleSelectPart(next);
          handleSelectExamSlot(1);
        }
      },
    });
  }, [
    examSlot,
    scoring,
    handleSelectExamSlot,
    partRows,
    selectedPartId,
    partMin,
    handleSelectPart,
  ]);

  if (!config || !routeMeta) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Práctica no configurada.</p>
      </main>
    );
  }

  const title = `${config.cefr} ${routeMeta.practiceTitle}`;
  const partsLabel = formatPartsLabel(partMin, partMax);
  const selectedPart = partRows.find((p) => p.id === selectedPartId) || partRows[0];
  const passingCount = Math.max(1, Math.ceil(partRows.length * 0.6));
  const isSkillPracticeSession = scoring.examPracticeOpen && !examModeActive;
  const readingSession = useReadingPracticeSession();
  const PracticeChrome = isSkillPracticeSession ? ReadingPracticeChrome : B2ExamPracticeChrome;
  const showPracticeSideRail = isSkillPracticeSession;

  const partScoreMetrics = {
    correctCount: 0,
    totalSlots: partRows.length,
    passingCount,
  };

  const reportErrorContext = useMemo(() => {
    if (!scoring.examPracticeOpen || !selectedPart) return null;
    return {
      levelSlug: slug,
      skillRoute,
      partNumber: selectedPart.partNumber,
      examSlot,
      practiceMode: 'part-practice',
    };
  }, [scoring.examPracticeOpen, selectedPart, slug, skillRoute, examSlot]);

  return (
    <B2ExamPracticeLayout examPracticeOpen={scoring.examPracticeOpen}>
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
      <PracticeChrome
        examSlot={examSlot}
        onSelectExam={handleSelectExamSlot}
        progressBySlot={scoring.progressBySlot}
        partsInPaper={partRows.length}
        examLabelsBySlot={examNamesBySlot}
        {...(examModeActive ? examSlotPickerProps : {})}
        examPracticeOpen={scoring.examPracticeOpen}
        suppressExamSlotPicker={!examModeActive}
        partTabsVariant={!examModeActive ? 'excel' : 'default'}
        practiceReady={scoring.examPracticeOpen}
        title={title}
        subtitle={scoring.examPracticeOpen ? partsLabel : undefined}
        compactSkillHeader={!examModeActive}
        showLevelPicker={isSkillPracticeSession}
        levelSlug={slug}
        skillRoute={skillRoute}
        skillPracticeTheme={skillTheme}
        timerLabel={categoryTimer.label}
        timerControls={categoryTimer}
        refreshLabel={`Refrescar ${routeMeta.practiceTitle}`}
        loading={false}
        showRefresh={false}
        onRefresh={null}
        partScoreMetrics={partScoreMetrics}
        partsData={scoring.examPracticeOpen ? partRows : []}
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
        getPartTabLabel={(part) => part.nombre}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
        reportErrorContext={reportErrorContext}
      >
        {!scoring.examPracticeOpen ? (
          <p style={{ textAlign: 'center', margin: '2rem 0', color: '#64748b' }}>Loading practice…</p>
        ) : (
          <div
            className={`levels-listening-practice-layout${
              showPracticeSideRail ? ' levels-listening-practice-layout--with-strategy' : ''
            }${readingSession.focusMode ? ' levels-listening-practice-layout--focus' : ''}`}
          >
            <div
              className={`levels-listening-practice-main${isSkillPracticeSession ? ` ${readingSession.readingAreaClassName}` : ''}`}
              style={isSkillPracticeSession ? readingSession.readingAreaStyle : undefined}
            >
          <section style={{ maxWidth: '700px', margin: '0 auto' }}>
            {selectedPart ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <h2 style={{ marginTop: 0 }}>{selectedPart.displayName}</h2>
                <p style={{ margin: '0 0 1rem', color: '#4a5568', lineHeight: 1.55 }}>
                  Practice content for this part opens from the dedicated exercise view. Use the tabs
                  above to switch parts and <strong>Next exercise</strong> to try another variant.
                </p>
                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <a
                    href={applyExamSlotToHref(selectedPart.href, slug, examSlot)}
                    style={{
                      backgroundColor: '#047857',
                      color: '#fff',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      display: 'inline-block',
                    }}
                  >
                    Open full part practice
                  </a>
                </div>
              </div>
            ) : null}
          </section>

        {isSkillPracticeSession ? (
          <B2ExamPracticeModuleNav
            slug={slug}
            partNumber={selectedPart?.partNumber ?? partMin}
            pagePartMax={partMax}
            pagePartMin={partMin}
            examSlot={examSlot}
            examenIdBySlot={scoring.examenIdBySlot}
            progressBySlot={scoring.progressBySlot}
            onSelectExamSlot={(slot) => {
              void scoring.refreshPuntuacionesProgress();
              handleSelectExamSlot(slot);
            }}
            skillPracticeMode
            skillPracticeTheme={skillTheme}
            onContinueInPage={handleKeepPracticing}
            lang="en"
          />
        ) : null}
            </div>
            {showPracticeSideRail ? (
              <ExamPracticeSessionSideRail
                progress={
                  <ExamPracticeProgressPanel
                    slug={slug}
                    examSlot={examSlot}
                    partMin={partMin}
                    partMax={partMax}
                    progressSlot={scoring.progressBySlot[examSlot]}
                    examLabel={examNamesBySlot[examSlot]}
                    lang="en"
                    enabled={scoring.examPracticeOpen}
                  />
                }
                lang="en"
              />
            ) : null}
          </div>
        )}

      </PracticeChrome>
    </B2ExamPracticeLayout>
  );
}

export default function LevelSkillPracticePage(props) {
  return (
    <Suspense fallback={<main style={{ padding: '2rem', textAlign: 'center' }}>Cargando…</main>}>
      <ReadingPracticeSessionProvider>
        <LevelSkillPracticePageInner {...props} />
      </ReadingPracticeSessionProvider>
    </Suspense>
  );
}
