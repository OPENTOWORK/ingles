'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { buildExamStatisticsFromLevels } from '@/lib/examStatisticsFromLevels';
import { useLevelsPracticeData } from '@/hooks/useLevelsPracticeData';
import { useExamModeProfileCharts } from '@/hooks/useExamModeProfileCharts';
import { PROFILE_CEFR_LEVELS } from '@/lib/aggregateLevelsStatsByPart';
import { EXAM_STATS_SECTION_META as SECTION_META } from '@/data/levelSkillThemeColors';
import './ExamStatistics.css';

const LevelsStatsChartsCarousel = dynamic(
  () => import('@/components/perfil/LevelsStatsChartsCarousel'),
  {
    ssr: false,
    loading: () => <p className="exam-stats__empty">Loading chart…</p>,
  },
);

const PERFORMANCE_LEVELS = [
  { min: 90, label: 'Excellent', bg: '#dcfce7', text: '#166534' },
  { min: 80, label: 'Very good', bg: '#e0f2fe', text: '#0369a1' },
  { min: 70, label: 'Good', bg: '#fef9c3', text: '#a16207' },
  { min: 60, label: 'Fair', bg: '#ffedd5', text: '#c2410c' },
  { min: 0, label: 'In progress', bg: '#fee2e2', text: '#b91c1c' },
];

const EMPTY_STATS = {
  totalExams: 0,
  completedExams: 0,
  averageScore: 0,
  bestScore: 0,
  totalTime: 0,
  sections: {
    reading: { attempts: 0, averageScore: 0, bestScore: 0, totalTime: 0 },
    writing: { attempts: 0, averageScore: 0, bestScore: 0, totalTime: 0 },
    listening: { attempts: 0, averageScore: 0, bestScore: 0, totalTime: 0 },
    speaking: { attempts: 0, averageScore: 0, bestScore: 0, totalTime: 0 },
  },
  hasData: false,
};

function getPerformance(percentage) {
  return PERFORMANCE_LEVELS.find((l) => percentage >= l.min) || PERFORMANCE_LEVELS.at(-1);
}

function levelHasPracticeData(levelSlug, levelsData) {
  if (!levelsData?.estadisticas?.length) return false;
  const { preguntaLevel = {} } = levelsData;
  return levelsData.estadisticas.some((row) => {
    const slug = String(preguntaLevel[row.pregunta_id] || 'b2')
      .toLowerCase()
      .match(/\b(a2|b1|b2|c1|c2)\b/)?.[1];
    return slug === levelSlug;
  });
}

export default function ExamStatistics({ userId, embedded = false }) {
  const [statistics, setStatistics] = useState(EMPTY_STATS);
  const [timeRange, setTimeRange] = useState('all');
  const [viewMode, setViewMode] = useState('sections');
  const [levelSlug, setLevelSlug] = useState('b2');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { data: levelsData, loading: levelsLoading, error: levelsError } = useLevelsPracticeData(
    userId,
  );

  const {
    charts: examModeCharts,
    loading: examModeChartsLoading,
    error: examModeChartsError,
  } = useExamModeProfileCharts(userId);

  useEffect(() => {
    if (!userId) {
      setStatistics(EMPTY_STATS);
      setLoading(false);
      setError('');
      return undefined;
    }

    if (levelsLoading) {
      setLoading(true);
      return undefined;
    }

    if (levelsError) {
      setError(levelsError);
      setStatistics(EMPTY_STATS);
      setLoading(false);
      return undefined;
    }

    if (!levelsData) {
      setLoading(false);
      return undefined;
    }

    setError('');
    setStatistics(
      buildExamStatisticsFromLevels({
        ...levelsData,
        timeRange,
        levelFilter: levelSlug,
      }),
    );
    setLoading(false);
  }, [userId, timeRange, levelSlug, levelsData, levelsLoading, levelsError]);

  const accuracyTotals = useMemo(() => {
    return (levelsData?.estadisticas || []).reduce(
      (acc, row) => ({
        evaluadas: acc.evaluadas + (row.respuestas_evaluadas || 0),
        correctas: acc.correctas + (row.respuestas_correctas || 0),
      }),
      { evaluadas: 0, correctas: 0 },
    );
  }, [levelsData]);

  const pctGlobal =
    accuracyTotals.evaluadas > 0
      ? Math.round((100 * accuracyTotals.correctas) / accuracyTotals.evaluadas)
      : null;

  const levelTabs = useMemo(() => {
    return PROFILE_CEFR_LEVELS.map((slug) => {
      const chartSlide = examModeCharts.find((c) => c.levelSlug === slug);
      return {
        slug,
        label: slug.toUpperCase(),
        hasData: chartSlide?.hasData || levelHasPracticeData(slug, levelsData),
      };
    });
  }, [examModeCharts, levelsData]);

  if (loading) {
    return (
      <section className="exam-stats" aria-labelledby="exam-stats-title">
        <p className="exam-stats__empty">Loading exam statistics…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="exam-stats" aria-labelledby="exam-stats-title">
        <p className="exam-stats__empty">{error}</p>
      </section>
    );
  }

  const showAccuracyRing = embedded && pctGlobal != null && (levelsData?.estadisticas?.length ?? 0) > 0;

  return (
    <section
      className={`exam-stats${embedded ? ' exam-stats--embedded' : ''}`}
      aria-labelledby={embedded ? undefined : 'exam-stats-title'}
    >
      <header className="exam-stats__header">
        {!embedded ? (
          <div className="exam-stats__title-wrap">
            <h2 id="exam-stats-title">Exam statistics</h2>
          </div>
        ) : null}
        <div className="exam-stats__header-actions">
          <div className="exam-stats__filter">
            <label htmlFor="exam-stats-range">Period</label>
            <select
              id="exam-stats-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="exam-stats__select"
            >
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>
          </div>
          {showAccuracyRing ? (
            <div
              className="exam-stats__accuracy-ring"
              style={{
                background: `conic-gradient(#2563eb ${pctGlobal * 3.6}deg, #e2e8f0 0deg)`,
              }}
              aria-label={`Overall accuracy: ${pctGlobal}%`}
            >
              <div className="exam-stats__accuracy-ring-inner">
                <span className="exam-stats__accuracy-value">{pctGlobal}%</span>
                <span className="exam-stats__accuracy-label">accuracy</span>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className="exam-stats__toolbar">
        <div className="exam-stats__view-toggle" role="tablist" aria-label="Chart view">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'sections'}
            className={`exam-stats__view-btn${viewMode === 'sections' ? ' is-active' : ''}`}
            onClick={() => setViewMode('sections')}
          >
            By section
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'parts'}
            className={`exam-stats__view-btn${viewMode === 'parts' ? ' is-active' : ''}`}
            onClick={() => setViewMode('parts')}
          >
            By part
          </button>
        </div>

        <div className="exam-stats__level-tabs" role="tablist" aria-label="CEFR level">
          {levelTabs.map((level) => (
            <button
              key={level.slug}
              type="button"
              role="tab"
              aria-selected={levelSlug === level.slug}
              className={`exam-stats__level-tab${levelSlug === level.slug ? ' is-active' : ''}${
                level.hasData ? '' : ' is-empty'
              }`}
              onClick={() => setLevelSlug(level.slug)}
            >
              {level.label}
              {!level.hasData ? <span className="exam-stats__level-tab-note">No data</span> : null}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'sections' ? (
        <div className="exam-stats__sections">
          <h3 className="exam-stats__block-title">
            Performance by section · {levelSlug.toUpperCase()}
          </h3>
          <div className="exam-stats__section-grid">
            {Object.entries(statistics.sections).map(([section, sectionStats]) => {
              const meta = SECTION_META[section] || { label: section, color: '#64748b' };
              const performance = getPerformance(sectionStats.averageScore);
              const pct = Math.min(100, Math.round(sectionStats.averageScore));

              return (
                <article key={section} className="exam-stats__section-card">
                  <div className="exam-stats__section-top">
                    <h4 className="exam-stats__section-name">
                      <span
                        className="exam-stats__section-dot"
                        style={{ backgroundColor: meta.color }}
                      />
                      {meta.label}
                    </h4>
                    <span
                      className="exam-stats__badge"
                      style={{
                        backgroundColor: performance.bg,
                        color: performance.text,
                      }}
                    >
                      {performance.label}
                    </span>
                  </div>
                  <div className="exam-stats__metrics">
                    <div className="exam-stats__metric">
                      <span className="exam-stats__metric-value">{sectionStats.attempts}</span>
                      <span className="exam-stats__metric-label">Attempts</span>
                    </div>
                    <div className="exam-stats__metric">
                      <span className="exam-stats__metric-value">{pct}%</span>
                      <span className="exam-stats__metric-label">Average</span>
                    </div>
                    <div className="exam-stats__metric">
                      <span className="exam-stats__metric-value">
                        {Math.round(sectionStats.bestScore)}%
                      </span>
                      <span className="exam-stats__metric-label">Best</span>
                    </div>
                  </div>
                  <div
                    className="exam-stats__progress"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="exam-stats__progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : examModeChartsLoading ? (
        <p className="exam-stats__empty">Loading exam mode chart…</p>
      ) : examModeChartsError ? (
        <p className="exam-stats__empty">{examModeChartsError}</p>
      ) : (
        <LevelsStatsChartsCarousel
          charts={examModeCharts}
          variant="exam-mode"
          activeLevelSlug={levelSlug}
          onLevelChange={setLevelSlug}
          hideLevelChrome
        />
      )}
    </section>
  );
}
