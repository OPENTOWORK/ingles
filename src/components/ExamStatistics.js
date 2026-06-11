'use client';

import { useState, useEffect } from 'react';
import { BarChart3, BookOpen, CircleCheckBig, Trophy } from 'lucide-react';
import { buildExamStatisticsFromLevels } from '@/lib/examStatisticsFromLevels';
import { useLevelsPracticeData } from '@/hooks/useLevelsPracticeData';
import './ExamStatistics.css';

const SECTION_META = {
  reading: { label: 'Reading', color: '#2563eb' },
  writing: { label: 'Writing', color: '#7c3aed' },
  listening: { label: 'Listening', color: '#0891b2' },
  speaking: { label: 'Speaking', color: '#ea580c' },
};

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
  recentAttempts: [],
  strengths: [],
  weaknesses: [],
  improvementAreas: [],
  hasData: false,
};

function getPerformance(percentage) {
  return PERFORMANCE_LEVELS.find((l) => percentage >= l.min) || PERFORMANCE_LEVELS.at(-1);
}

export default function ExamStatistics({ userId, embedded = false }) {
  const [statistics, setStatistics] = useState(EMPTY_STATS);
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { data: levelsData, loading: levelsLoading, error: levelsError } = useLevelsPracticeData(
    userId,
  );

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
      }),
    );
    setLoading(false);
  }, [userId, timeRange, levelsData, levelsLoading, levelsError]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const hasData = statistics.hasData;
  const recent = statistics.recentAttempts.slice(0, 5);

  const kpis = [
    {
      key: 'started',
      Icon: BookOpen,
      value: statistics.totalExams,
      label: 'Exams started',
      tone: 'blue',
    },
    {
      key: 'completed',
      Icon: CircleCheckBig,
      value: statistics.completedExams,
      label: 'Completed',
      tone: 'green',
    },
    {
      key: 'average',
      Icon: BarChart3,
      value: `${Math.round(statistics.averageScore)}%`,
      label: 'Average score',
      tone: 'violet',
    },
    {
      key: 'best',
      Icon: Trophy,
      value: `${Math.round(statistics.bestScore)}%`,
      label: 'Best score',
      tone: 'amber',
    },
  ];

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
      </header>

      <div className="exam-stats__kpis">
        {kpis.map(({ key, Icon, value, label, tone }) => (
          <article key={key} className={`exam-stats__kpi exam-stats__kpi--${tone}`}>
            <span className="exam-stats__kpi-icon" aria-hidden>
              <Icon className="exam-stats__kpi-svg" strokeWidth={2} />
            </span>
            <div className="exam-stats__kpi-body">
              <span className="exam-stats__kpi-value">{value}</span>
              <span className="exam-stats__kpi-label">{label}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="exam-stats__sections">
        <h3 className="exam-stats__block-title">Performance by section</h3>
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

      <div className="exam-stats__two-col">
        <div className="exam-stats__panel">
          <h3>Recent attempts</h3>
          {recent.length > 0 ? (
            <div className="exam-stats__attempts">
              {recent.map((attempt) => {
                const performance = getPerformance(attempt.percentage);
                return (
                  <div key={attempt.id || attempt.label} className="exam-stats__attempt">
                    <div>
                      <div className="exam-stats__attempt-name">{attempt.label}</div>
                      <div className="exam-stats__attempt-date">
                        {attempt.date.toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div>
                      <div
                        className="exam-stats__attempt-score"
                        style={{ color: performance.text }}
                      >
                        {attempt.percentage}%
                      </div>
                      <div className="exam-stats__attempt-detail">
                        {attempt.totalQuestions > 0
                          ? `${attempt.score}/${attempt.totalQuestions}`
                          : attempt.aprobado
                            ? 'Passed'
                            : '—'}
                      </div>
                    </div>
                    <div className="exam-stats__attempt-time">{formatTime(attempt.timeSpent)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="exam-stats__empty">
              {hasData ? (
                'No recent attempts in this period.'
              ) : (
                <>
                  No scores saved yet. Start in{' '}
                  <a href="/niveles">Levels</a>.
                </>
              )}
            </p>
          )}
        </div>

        <div className="exam-stats__panel">
          <h3>Performance analysis</h3>
          <div className="exam-stats__insights">
            <div className="exam-stats__insight-card exam-stats__insight-card--strength">
              <h4>Strengths</h4>
              {statistics.strengths.length > 0 ? (
                <ul className="exam-stats__chip-list">
                  {statistics.strengths.map((strength) => (
                    <li key={strength}>
                      <span className="exam-stats__chip exam-stats__chip--strength">
                        {SECTION_META[strength]?.label ||
                          strength.charAt(0).toUpperCase() + strength.slice(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="exam-stats__empty" style={{ padding: '12px', margin: 0 }}>
                  Complete exam parts to identify your strengths.
                </p>
              )}
            </div>
            <div className="exam-stats__insight-card exam-stats__insight-card--improve">
              <h4>Areas to improve</h4>
              <ul className="exam-stats__tip-list">
                {statistics.improvementAreas.map((area, index) => (
                  <li key={index} className="exam-stats__tip">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="exam-stats__time-bar">
        <div className="exam-stats__time-item">
          <span className="exam-stats__time-label">Total time</span>
          <span className="exam-stats__time-value">{formatTime(statistics.totalTime)}</span>
        </div>
        <div className="exam-stats__time-item">
          <span className="exam-stats__time-label">Average per exam</span>
          <span className="exam-stats__time-value">
            {statistics.completedExams > 0
              ? formatTime(statistics.totalTime / statistics.completedExams)
              : '0m'}
          </span>
        </div>
      </div>
    </section>
  );
}
