'use client';

import { useState } from 'react';
import { useExamPracticeSlotProgress } from '@/hooks/useExamPracticeSlotProgress';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import { formatExamSlotDisplayLabel } from '@/utils/formatExamDisplayLabel';
import ExamPracticePartScoreHistorySection from '@/components/exam/ExamPracticePartScoreHistorySection';

function pct(correct, total) {
  if (!total) return null;
  return Math.round((100 * correct) / total);
}

/**
 * Desplegable Progress — progreso real desde levels_puntuaciones + levels_estadisticas.
 */
export default function ExamPracticeProgressPanel({
  slug = 'b2',
  examSlot = 1,
  partMin = 1,
  partMax = 7,
  progressSlot = null,
  examLabel = '',
  focusPartNumber = null,
  progressBySlot = null,
  examLabelsBySlot = {},
  skillRoute = null,
  passing = null,
  lang = 'en',
  enabled = true,
}) {
  const en = lang === 'en';
  const [open, setOpen] = useState(false);
  const { applyLimits, progressTracking, loading: planLoading } = usePlanEntitlements();
  const showProgress = enabled && (!applyLimits || progressTracking);
  const { signedIn, loading, estadisticasByPart } = useExamPracticeSlotProgress({
    slug,
    examSlot,
    enabled: showProgress,
  });

  if (!showProgress && !planLoading) {
    return (
      <aside className="levels-listening-strategy levels-listening-strategy--progress">
        <div className="levels-listening-strategy__body">
          <p className="levels-listening-strategy__upgrade-hint">
            {en
              ? 'Progress tracking is included in Plus and Premium plans.'
              : 'El seguimiento de progreso está incluido en los planes Plus y Premium.'}{' '}
            <a href="/precios">{en ? 'View plans' : 'Ver planes'}</a>
          </p>
        </div>
      </aside>
    );
  }

  const partsCount = partMax - partMin + 1;
  const approved = progressSlot?.approvedParts ?? 0;
  const stars = progressSlot?.stars ?? 0;
  const parts = progressSlot?.parts || {};

  const labels = {
    title: en ? 'Progress' : 'Progreso',
    exam: en ? 'Current test' : 'Examen actual',
    overall: en ? 'Overall' : 'Global',
    partsPassed: en ? 'parts passed' : 'partes aprobadas',
    part: en ? 'Part' : 'Parte',
    saved: en ? 'Saved score' : 'Puntuación guardada',
    passed: en ? 'Passed' : 'Aprobada',
    notYet: en ? 'Not saved yet' : 'Sin guardar',
    activity: en ? 'Activity (levels_estadisticas)' : 'Actividad (levels_estadisticas)',
    accesses: en ? 'accesses' : 'accesos',
    attempts: en ? 'attempts' : 'intentos',
    accuracy: en ? 'best accuracy' : 'mejor precisión',
    signIn: en
      ? 'Sign in to see your saved progress from Supabase.'
      : 'Inicia sesión para ver tu progreso guardado en Supabase.',
    loading: en ? 'Loading progress…' : 'Cargando progreso…',
    source: en
      ? 'Scores from levels_puntuaciones · activity from levels_estadisticas'
      : 'Puntuaciones de levels_puntuaciones · actividad de levels_estadisticas',
  };

  return (
    <aside className="levels-listening-strategy levels-listening-strategy--progress">
      <button
        type="button"
        className="levels-listening-strategy__toggle levels-listening-strategy__toggle--progress"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{labels.title}</span>
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>

      {open ? (
        <div className="levels-listening-strategy__body">
          {!signedIn ? (
            <p className="levels-listening-strategy__muted">{labels.signIn}</p>
          ) : loading ? (
            <p className="levels-listening-strategy__muted">{labels.loading}</p>
          ) : (
            <>
              {focusPartNumber && progressBySlot ? (
                <ExamPracticePartScoreHistorySection
                  partNumber={focusPartNumber}
                  examSlot={examSlot}
                  progressBySlot={progressBySlot}
                  slug={slug}
                  skillRoute={skillRoute}
                  lang={lang}
                />
              ) : null}

              <section>
                <h3 className="levels-listening-strategy__heading">{labels.exam}</h3>
                <p className="levels-listening-strategy__exam-label">
                  {examLabel || formatExamSlotDisplayLabel(null, examSlot)}
                </p>
              </section>

              <section>
                <h3 className="levels-listening-strategy__heading">{labels.overall}</h3>
                <p>
                  <strong>
                    {approved}/{partsCount}
                  </strong>{' '}
                  {labels.partsPassed}
                </p>
                <p className="levels-listening-strategy__stars" aria-label={`${stars} / 3 stars`}>
                  {'★'.repeat(Math.round(stars))}
                  {'☆'.repeat(3 - Math.round(stars))}
                </p>
              </section>

              <section>
                <h3 className="levels-listening-strategy__heading">
                  {en ? 'By part (levels_puntuaciones)' : 'Por parte (levels_puntuaciones)'}
                </h3>
                <ul className="levels-listening-strategy__progress-list">
                  {Array.from({ length: partsCount }, (_, i) => partMin + i).map((partNumber) => {
                    const saved = parts[partNumber];
                    const activity = estadisticasByPart[partNumber];
                    return (
                      <li key={partNumber} className="levels-listening-strategy__progress-item">
                        <span className="levels-listening-strategy__progress-part">
                          {labels.part} {partNumber}
                        </span>
                        {saved?.total ? (
                          <span
                            className={
                              saved.passed
                                ? 'levels-listening-strategy__progress-score levels-listening-strategy__progress-score--pass'
                                : 'levels-listening-strategy__progress-score'
                            }
                          >
                            {saved.correct}/{saved.total}
                            {saved.passed ? ` · ${labels.passed}` : ''}
                          </span>
                        ) : (
                          <span className="levels-listening-strategy__progress-score levels-listening-strategy__progress-score--empty">
                            {labels.notYet}
                          </span>
                        )}
                        {activity?.evaluadas > 0 ? (
                          <span className="levels-listening-strategy__progress-meta">
                            {activity.accesos} {labels.accesses} · {activity.intentos} {labels.attempts}
                            {activity.mejorPct != null
                              ? ` · ${labels.accuracy} ${activity.mejorPct}%`
                              : activity.evaluadas > 0
                                ? ` · ${labels.accuracy} ${pct(activity.correctas, activity.evaluadas)}%`
                                : ''}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>

              <p className="levels-listening-strategy__source">{labels.source}</p>
            </>
          )}
        </div>
      ) : null}
    </aside>
  );
}
