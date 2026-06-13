'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import { B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { useLevelExamPracticeSlot } from '@/hooks/useLevelExamPracticeSlot';
import { useLevelExamScoringSession } from '@/hooks/useLevelExamScoringSession';
import {
  getLevelFullExamPartRange,
  getLevelFullExamSections,
  getNivelesLevelHub,
} from '@/data/nivelesLevelHub';
import { supabase } from '@/utils/supabaseClient';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot } from '@/utils/levelsLevelCache';
import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { filterVisibleExamenes } from '@/utils/levelsExamVisibility';
import { getAvailableExamSlots } from '@/hooks/useLevelsExamAdminFlow';
import { starsFromApprovedPartsCount } from '@/utils/levelsB2PartScoring';
import ExamPracticeReportError from '@/components/exam/ExamPracticeReportError';

function countApprovedInRange(partsMap, partMin, partMax) {
  let n = 0;
  for (let p = partMin; p <= partMax; p += 1) {
    if (partsMap?.[p]?.passed) n += 1;
  }
  return n;
}

function LevelFullExamPracticeInner({ slug }) {
  const config = getNivelesLevelHub(slug);
  const searchParams = useSearchParams();
  const { examSlot, selectExamSlot } = useLevelExamPracticeSlot(slug);
  const { partMin, partMax, partsCount } = getLevelFullExamPartRange(slug);
  const scoring = useLevelExamScoringSession({ slug, partMin, partMax });
  const categoryTimer = useLevelsCategoryTimer();
  const [examNamesBySlot, setExamNamesBySlot] = useState({});
  const [catalogError, setCatalogError] = useState('');
  const autoOpenedFromUrlRef = useRef(false);

  const fullExamSections = useMemo(() => getLevelFullExamSections(slug), [slug]);

  const loadExamCatalog = useCallback(async () => {
    setCatalogError('');
    try {
      const { data: levelData, error: levelError } = await getCachedLevelBySlug(supabase, slug);
      if (levelError || !levelData?.id) {
        setExamNamesBySlot({});
        return;
      }
      const { data, error } = await supabase
        .from('levels_examenes')
        .select('id, nombre, modelo')
        .eq('level_id', levelData.id);
      if (error) throw error;
      const ordered = sortLevelsExamenesRows(filterVisibleExamenes(data));
      const idsBySlot = await getCachedExamenIdsBySlot(supabase, levelData.id);
      const names = {};
      Object.entries(idsBySlot).forEach(([slot, id]) => {
        const row = ordered.find((r) => r.id === id);
        names[Number(slot)] = row?.nombre?.trim() || `Examen ${slot}`;
      });
      setExamNamesBySlot(names);
    } catch (e) {
      setCatalogError(e?.message || 'No se pudieron cargar los exámenes.');
      setExamNamesBySlot({});
    }
  }, [slug]);

  useEffect(() => {
    void loadExamCatalog();
  }, [loadExamCatalog]);

  const { examPracticeOpen, handleSelectExam, refreshPuntuacionesProgress } = scoring;

  useEffect(() => {
    const q = searchParams.get('examen');
    if (!q || autoOpenedFromUrlRef.current || examPracticeOpen) return;
    autoOpenedFromUrlRef.current = true;
    handleSelectExam(selectExamSlot, Number(q));
  }, [searchParams, examPracticeOpen, handleSelectExam, selectExamSlot]);

  useEffect(() => {
    if (!examPracticeOpen) return;
    void refreshPuntuacionesProgress();
  }, [examPracticeOpen, examSlot, refreshPuntuacionesProgress]);

  const slotProgress = scoring.progressBySlot[examSlot] || {};
  const approvedParts = Number(slotProgress.approvedParts) || 0;
  const stars = starsFromApprovedPartsCount(approvedParts, partsCount);
  const totalCorrect = Number(slotProgress.correct) || 0;
  const totalItems = Number(slotProgress.total) || 0;
  const examComplete = approvedParts >= partsCount;
  const examLabel = examNamesBySlot[examSlot] || `Examen ${examSlot}`;

  const sectionCards = useMemo(
    () =>
      fullExamSections.map((section) => {
        const approved = countApprovedInRange(
          slotProgress.parts,
          section.partMin,
          section.partMax,
        );
        const done = approved >= section.partsInSection;
        return { ...section, approved, done };
      }),
    [fullExamSections, slotProgress.parts],
  );

  if (!config) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Nivel no configurado.</p>
      </main>
    );
  }

  return (
    <B2ExamPracticeLayout examPracticeOpen={examPracticeOpen}>
      <B2ExamSlotProgressPicker
        value={examSlot}
        onSelect={(n) => handleSelectExam(selectExamSlot, n)}
        progressBySlot={scoring.progressBySlot}
        partsInPaper={partsCount}
        examLabelsBySlot={examNamesBySlot}
        availableSlots={getAvailableExamSlots(scoring.examenIdBySlot)}
      />

      {catalogError ? (
        <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600, marginTop: '1rem' }}>
          {catalogError}
        </p>
      ) : null}

      {!examPracticeOpen ? (
        <div
          style={{
            textAlign: 'center',
            maxWidth: '640px',
            margin: '1.5rem auto 0',
            color: '#4a5568',
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            Elige uno de los <strong>exámenes disponibles</strong>. Cada examen incluye las secciones del{' '}
            <strong>{config.cefr}</strong> ({config.examName}).
          </p>
        </div>
      ) : (
        <>
          <h1 style={{ textAlign: 'center', margin: '0.5rem 0 0' }}>
            {config.cefr} Full Exam — {examLabel}
          </h1>
          <p
            style={{
              textAlign: 'center',
              margin: '0.35rem 0 0',
              color: '#4a5568',
              fontSize: '1rem',
            }}
          >
            Completa las secciones del examen {examSlot}.
          </p>

          <LevelsCategoryTimer
            categoryLabel={`Sesión: Full Exam ${examSlot}`}
            timeLabel={categoryTimer.label}
            isRunning={categoryTimer.isRunning}
            isPaused={categoryTimer.isPaused}
            isIdle={categoryTimer.isIdle}
            onStart={categoryTimer.start}
            onPause={categoryTimer.pause}
            onResume={categoryTimer.resume}
          />

          <LevelsPartScorePanel
            correctCount={totalCorrect}
            totalSlots={totalItems || partsCount}
            passingCount={Math.max(1, Math.ceil(partsCount * 0.6))}
          />

          <div
            style={{
              textAlign: 'center',
              margin: '0.75rem auto 1.25rem',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: examComplete ? '#d1fae5' : '#f0fff4',
              border: `1px solid ${examComplete ? '#059669' : '#a7f3d0'}`,
              maxWidth: '520px',
              color: '#065f46',
              fontWeight: 600,
            }}
          >
            Progreso del examen: {approvedParts}/{partsCount} partes aprobadas
            <span style={{ marginLeft: '0.5rem' }} aria-label={`${stars} de 3 estrellas`}>
              {'★'.repeat(Math.round(stars))}
              {'☆'.repeat(3 - Math.round(stars))}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
              maxWidth: '960px',
              margin: '0 auto 2rem',
              width: '100%',
            }}
          >
            {sectionCards.map((section) => {
              const sectionHref = `${section.href}?examen=${examSlot}`;
              return (
                <div key={section.key}>
                  <Link
                    href={sectionHref}
                    style={{
                      display: 'block',
                      padding: '1.15rem 1.25rem',
                      borderRadius: '14px',
                      border: `2px solid ${section.done ? '#059669' : '#a7f3d0'}`,
                      background: section.done
                        ? 'linear-gradient(180deg, #d1fae5 0%, #ecfdf5 100%)'
                        : 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)',
                      textDecoration: 'none',
                      color: '#065f46',
                      boxShadow: '0 2px 10px rgba(4, 120, 87, 0.1)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>{section.emoji}</div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{section.title}</h3>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#047857' }}>
                      {section.partsLabel}
                    </p>
                    <p
                      style={{
                        margin: '0.65rem 0 0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: section.done ? '#065f46' : '#2f855a',
                      }}
                    >
                      {section.done
                        ? `✓ Completado (${section.approved}/${section.partsInSection})`
                        : `Progreso: ${section.approved}/${section.partsInSection} partes`}
                    </p>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#047857',
                      }}
                    >
                      Ir a practicar →
                    </span>
                  </Link>
                  <div style={{ marginTop: '0.45rem', textAlign: 'right' }}>
                    <ExamPracticeReportError
                      context={{
                        levelSlug: slug,
                        skillRoute: section.key,
                        examSlot,
                        sectionTitle: section.title,
                        practiceMode: 'full-exam-hub',
                        hub: true,
                        url: sectionHref,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link
          href={`/niveles/${slug}`}
          style={{
            textDecoration: 'none',
            color: '#0070f3',
            fontWeight: 'bold',
            display: 'inline-block',
            padding: '0.75rem 1.25rem',
            border: '2px solid #0070f3',
            borderRadius: '6px',
          }}
        >
          ← Volver a {config.cefr}
        </Link>
      </div>
    </B2ExamPracticeLayout>
  );
}

export default function LevelFullExamPractice({ slug }) {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center' }}>Cargando examen…</main>
      }
    >
      <LevelFullExamPracticeInner slug={slug} />
    </Suspense>
  );
}
