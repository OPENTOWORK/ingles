'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
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
import { useLevelsExamAdminFlow, reloadExamNamesBySlot } from '@/hooks/useLevelsExamAdminFlow';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';

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
  const autoOpenedRef = useRef(false);

  const partRows = useMemo(() => {
    if (!config?.sections || !routeMeta?.section) return [];
    return (config.sections[routeMeta.section] || [])
      .filter((t) => !String(t.text).toLowerCase().includes('speaking lab'))
      .map((topic, index) => {
        const partNumber = parsePartNumber(topic.text) ?? index + 1;
        return {
          id: `part-${partNumber}`,
          nombre: `Parte ${partNumber}`,
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
    onCatalogUpdated: scoring.reloadExamCatalog,
  });
  const { label: timerLabel } = useLevelsCategoryTimer();

  useEffect(() => {
    void (async () => {
      const names = Object.fromEntries([1, 2, 3, 4, 5].map((s) => [s, `Examen ${s}`]));
      try {
        const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
        if (!levelData?.id) {
          setExamNamesBySlot(names);
          return;
        }
        const { data } = await supabase
          .from('levels_examenes')
          .select('id, nombre')
          .eq('level_id', levelData.id);
        const ordered = sortLevelsExamenesRows(data);
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
    const q = searchParams.get('examen');
    if (!q || autoOpenedRef.current || scoring.examPracticeOpen) return;
    autoOpenedRef.current = true;
    scoring.handleSelectExam(selectExamSlot, Number(q));
  }, [searchParams, scoring, selectExamSlot]);

  useEffect(() => {
    if (partRows.length && !selectedPartId) {
      setSelectedPartId(partRows[0].id);
    }
  }, [partRows, selectedPartId]);

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

  const partScoreMetrics = {
    correctCount: 0,
    totalSlots: partRows.length,
    passingCount,
  };

  return (
      <B2ExamPracticeLayout examPracticeOpen={scoring.examPracticeOpen}>
      {slug === 'a2' && adminFlow.isAdmin ? (
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
      <B2ExamPracticeChrome
        examSlot={examSlot}
        onSelectExam={(n) => {
          if (slug === 'a2' && adminFlow.isAdmin) {
            void adminFlow.handleAdminExamSelect(n, (slot) => scoring.handleSelectExam(selectExamSlot, slot));
            return;
          }
          scoring.handleSelectExam(selectExamSlot, n);
        }}
        progressBySlot={scoring.progressBySlot}
        partsInPaper={partRows.length}
        examLabelsBySlot={examNamesBySlot}
        examPracticeOpen={scoring.examPracticeOpen}
        title={title}
        subtitle={scoring.examPracticeOpen ? partsLabel : undefined}
        timerLabel={timerLabel}
        refreshLabel={`Refrescar ${routeMeta.practiceTitle}`}
        loading={false}
        showRefresh={false}
        onRefresh={null}
        partScoreMetrics={partScoreMetrics}
        partsData={scoring.examPracticeOpen ? partRows : []}
        selectedPartId={selectedPartId}
        onSelectPart={(part) => setSelectedPartId(part.id)}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
      >
        {!scoring.examPracticeOpen ? (
          <div
            style={{
              textAlign: 'center',
              maxWidth: '640px',
              margin: '1.5rem auto',
              color: '#4a5568',
              lineHeight: 1.55,
            }}
          >
            <p style={{ margin: 0 }}>
              Elige uno de los <strong>5 exámenes</strong> arriba. Cada examen incluye las{' '}
              <strong>{partRows.length} partes</strong> de esta sección.
            </p>
          </div>
        ) : (
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
                <h2 style={{ marginTop: 0 }}>{selectedPart.nombre}</h2>
                <p style={{ margin: '0 0 1rem', color: '#4a5568' }}>
                  <strong>Pregunta:</strong>
                </p>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.95rem 1rem',
                  }}
                >
                  <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#1a365d' }}>
                    Enunciado
                  </p>
                  <p style={{ margin: 0, lineHeight: 1.6, color: '#1f2937' }}>
                    {selectedPart.displayName} — {examNamesBySlot[examSlot] || `Examen ${examSlot}`}
                  </p>
                  <p style={{ margin: '1rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                    Contenido en preparación. Puedes abrir la ficha de tips de la parte.
                  </p>
                </div>
                <div style={{ marginTop: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link
                    href={`${routeMeta.href}?examen=${examSlot}`}
                    style={{
                      backgroundColor: '#2b6cb0',
                      color: '#fff',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      display: 'inline-block',
                    }}
                  >
                    Abrir práctica del examen
                  </Link>
                  <Link
                    href={applyExamSlotToHref(selectedPart.href, slug, examSlot)}
                    style={{
                      backgroundColor: '#c1f2cd',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#000',
                      fontWeight: 'bold',
                      display: 'inline-block',
                    }}
                  >
                    Abrir parte (tips)
                  </Link>
                </div>
              </div>
            ) : null}
          </section>
        )}
      </B2ExamPracticeChrome>

      <div
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
        }}
      >
        <Link
          href={`/niveles/${slug}/exam-1?examen=${examSlot}`}
          style={{
            textDecoration: 'none',
            color: '#047857',
            fontWeight: 'bold',
            padding: '0.75rem 1.25rem',
            border: '2px solid #059669',
            borderRadius: '6px',
          }}
        >
          ← Full Exam
        </Link>
        <Link
          href={`/niveles/${slug}`}
          style={{
            textDecoration: 'none',
            color: '#0070f3',
            fontWeight: 'bold',
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

export default function LevelSkillPracticePage(props) {
  return (
    <Suspense fallback={<main style={{ padding: '2rem', textAlign: 'center' }}>Cargando…</main>}>
      <LevelSkillPracticePageInner {...props} />
    </Suspense>
  );
}
