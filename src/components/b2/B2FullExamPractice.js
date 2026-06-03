'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import { B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { supabase } from '@/utils/supabaseClient';
import { getCachedB2Level, getCachedB2ExamNamesBySlot } from '@/utils/b2LevelCache';
import { getB2PartScoring, starsFromApprovedPartsCount } from '@/utils/levelsB2PartScoring';
import { useLevelsExamAdminFlow, createAdminExamSelectHandler, buildExamSlotPickerProps } from '@/hooks/useLevelsExamAdminFlow';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
export const B2_FULL_EXAM_PART_MIN = 1;
export const B2_FULL_EXAM_PART_MAX = 17;
export const B2_FULL_EXAM_PARTS_COUNT = B2_FULL_EXAM_PART_MAX - B2_FULL_EXAM_PART_MIN + 1;

const FULL_EXAM_SECTIONS = [
  {
    key: 'reading-uoe',
    title: 'Reading and Use of English',
    emoji: '📘',
    partsLabel: 'Parts 1–7',
    href: '/niveles/b2/exam-reading-and-use-of-english',
    partMin: 1,
    partMax: 7,
  },
  {
    key: 'writing',
    title: 'Writing',
    emoji: '✍️',
    partsLabel: 'Partes 8–9',
    href: '/niveles/b2/exam-writing',
    partMin: 8,
    partMax: 9,
  },
  {
    key: 'listening',
    title: 'Listening',
    emoji: '🎧',
    partsLabel: 'Partes 10–13',
    href: '/niveles/b2/exam-listening',
    partMin: 10,
    partMax: 13,
  },
  {
    key: 'speaking',
    title: 'Speaking',
    emoji: '🗣️',
    partsLabel: 'Partes 14–17',
    href: '/niveles/b2/exam-speaking',
    partMin: 14,
    partMax: 17,
  },
];

function countApprovedInRange(partsMap, partMin, partMax) {
  let n = 0;
  for (let p = partMin; p <= partMax; p += 1) {
    if (partsMap?.[p]?.passed) n += 1;
  }
  return n;
}

function B2FullExamPracticeInner() {
  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
  const scoring = useB2ExamScoringSession({
    partMin: B2_FULL_EXAM_PART_MIN,
    partMax: B2_FULL_EXAM_PART_MAX,
  });
  const { label: timerLabel } = useLevelsCategoryTimer();
  const [examNamesBySlot, setExamNamesBySlot] = useState({});
  const [catalogError, setCatalogError] = useState('');

  useB2AutoOpenExamFromUrl({
    examPracticeOpen: scoring.examPracticeOpen,
    handleSelectExam: scoring.handleSelectExam,
    selectExamSlot,
  });

  const loadExamCatalog = useCallback(async () => {
    setCatalogError('');
    try {
      const { data: levelData, error: levelError } = await getCachedB2Level(supabase);
      if (levelError || !levelData?.id) {
        throw new Error('No se pudo cargar el nivel B2.');
      }
      const names = await getCachedB2ExamNamesBySlot(supabase, levelData.id);
      setExamNamesBySlot(names);
    } catch (e) {
      setCatalogError(e?.message || 'No se pudieron cargar los exámenes.');
    }
  }, []);

  const adminFlow = useLevelsExamAdminFlow({
    slug: 'b2',
    examenIdBySlot: scoring.examenIdBySlot,
    onCatalogUpdated: () => {
      void scoring.reloadExamenCatalog?.();
      void loadExamCatalog();
    },
  });

  const handleSelectExamSlot = useMemo(
    () => createAdminExamSelectHandler(adminFlow, (slot) => scoring.handleSelectExam(selectExamSlot, slot)),
    [adminFlow, scoring, selectExamSlot],
  );
  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot: scoring.examenIdBySlot,
    adminFlow,
    onSelectSlot: (slot) => scoring.handleSelectExam(selectExamSlot, slot),
  });

  useEffect(() => {
    void loadExamCatalog();
  }, [loadExamCatalog]);

  const slotProgress = scoring.progressBySlot[examSlot] || {};
  const approvedParts = Number(slotProgress.approvedParts) || 0;
  const stars = starsFromApprovedPartsCount(approvedParts, B2_FULL_EXAM_PARTS_COUNT);

  const passingThreshold = useMemo(() => {
    let sum = 0;
    for (let p = B2_FULL_EXAM_PART_MIN; p <= B2_FULL_EXAM_PART_MAX; p += 1) {
      sum += getB2PartScoring(p)?.passing ?? 0;
    }
    return sum;
  }, []);

  const totalCorrect = Number(slotProgress.correct) || 0;
  const totalItems = Number(slotProgress.total) || 0;
  const examComplete = approvedParts >= B2_FULL_EXAM_PARTS_COUNT;
  const examLabel = examNamesBySlot[examSlot] || `Examen ${examSlot}`;

  const sectionCards = useMemo(
    () =>
      FULL_EXAM_SECTIONS.map((section) => {
        const partsInSection = section.partMax - section.partMin + 1;
        const approved = countApprovedInRange(slotProgress.parts, section.partMin, section.partMax);
        const done = approved >= partsInSection;
        return { ...section, partsInSection, approved, done };
      }),
    [slotProgress.parts],
  );

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
      <B2ExamSlotProgressPicker
        value={examSlot}
        onSelect={handleSelectExamSlot}
        progressBySlot={scoring.progressBySlot}
        partsInPaper={B2_FULL_EXAM_PARTS_COUNT}
        examLabelsBySlot={examNamesBySlot}
        {...examSlotPickerProps}
      />

      {catalogError ? (
        <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600, marginTop: '1rem' }}>
          {catalogError}
        </p>
      ) : null}

      {!scoring.examPracticeOpen ? (
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '1.5rem auto 0', color: '#4a5568' }}>
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            Elige uno de los <strong>exámenes disponibles</strong> en Supabase. Cada examen incluye las{' '}
            <strong>17 parts</strong> of B2 First (Reading and Use of English, Writing, Listening and Speaking).
            Tu progreso se guarda automáticamente por parte y examen.
          </p>
        </div>
      ) : (
        <>
          <h1 style={{ textAlign: 'center', margin: '0.5rem 0 0' }}>B2 Full Exam — {examLabel}</h1>
          <p style={{ textAlign: 'center', margin: '0.35rem 0 0', color: '#4a5568', fontSize: '1rem' }}>
            Completa las 5 secciones del examen {examSlot}. Mismo contenido y puntuación que en la práctica por
            habilidad.
          </p>

          <LevelsCategoryTimer
            categoryLabel={`Sesión: Full Exam ${examSlot}`}
            timeLabel={timerLabel}
          />

          <LevelsPartScorePanel
            correctCount={totalCorrect}
            totalSlots={totalItems || B2_FULL_EXAM_PARTS_COUNT}
            passingCount={passingThreshold}
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
            Progreso del examen: {approvedParts}/{B2_FULL_EXAM_PARTS_COUNT} partes aprobadas
            <span style={{ marginLeft: '0.5rem' }} aria-label={`${stars} de 3 estrellas`}>
              {'★'.repeat(Math.round(stars))}
              {'☆'.repeat(3 - Math.round(stars))}
            </span>
          </div>

          {examComplete ? (
            <LevelsPartFinishBanner
              passed
              correct={approvedParts}
              total={B2_FULL_EXAM_PARTS_COUNT}
              passing={B2_FULL_EXAM_PARTS_COUNT}
            />
          ) : null}

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
            {sectionCards.map((section) => (
              <Link
                key={section.key}
                href={`${section.href}?examen=${examSlot}`}
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
                  boxShadow: '0 2px 10px rgba(4,120,87,.1)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>{section.emoji}</div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{section.title}</h3>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#047857' }}>{section.partsLabel}</p>
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
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#718096', maxWidth: '640px', margin: '0 auto' }}>
            En cada sección usa el mismo examen ({examLabel}). Al terminar una parte, la puntuación se guarda
            automáticamente y se refleja aquí.
          </p>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link
          href="/niveles/b2"
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
          ← Volver a B2
        </Link>
      </div>
    </B2ExamPracticeLayout>
  );
}

export default function B2FullExamPractice() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando examen completo…</p>
        </main>
      }
    >
      <B2FullExamPracticeInner />
    </Suspense>
  );
}
