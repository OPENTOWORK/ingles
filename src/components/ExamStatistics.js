'use client';

import { useState, useEffect } from 'react';
import './ExamStatistics.css';

const SECTION_META = {
  reading: { label: 'Reading', color: '#2563eb' },
  writing: { label: 'Writing', color: '#7c3aed' },
  listening: { label: 'Listening', color: '#0891b2' },
  speaking: { label: 'Speaking', color: '#ea580c' },
};

const PERFORMANCE_LEVELS = [
  { min: 90, label: 'Excelente', bg: '#dcfce7', text: '#166534' },
  { min: 80, label: 'Muy bueno', bg: '#e0f2fe', text: '#0369a1' },
  { min: 70, label: 'Bueno', bg: '#fef9c3', text: '#a16207' },
  { min: 60, label: 'Regular', bg: '#ffedd5', text: '#c2410c' },
  { min: 0, label: 'En progreso', bg: '#fee2e2', text: '#b91c1c' },
];

function getPerformance(percentage) {
  return PERFORMANCE_LEVELS.find((l) => percentage >= l.min) || PERFORMANCE_LEVELS.at(-1);
}

export default function ExamStatistics({ userId = 'default' }) {
  const [statistics, setStatistics] = useState({
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
  });

  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    loadStatistics();
  }, [userId, timeRange]);

  const loadStatistics = () => {
    const stats = calculateStatisticsFromLocalStorage();
    setStatistics(stats);
  };

  const calculateStatisticsFromLocalStorage = () => {
    const stats = {
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
    };

    for (let i = 1; i <= 12; i++) {
      const examId = `exam-${i}`;
      const examData = loadExamData(examId);

      if (examData && Object.keys(examData.answers || {}).length > 0) {
        stats.totalExams++;

        const examStats = calculateExamStats(examData);
        stats.completedExams += examStats.isCompleted ? 1 : 0;
        stats.totalTime += examStats.totalTime;

        if (examStats.score > stats.bestScore) {
          stats.bestScore = examStats.percentage;
        }

        updateSectionStats(stats, examStats);

        stats.recentAttempts.push({
          examId,
          score: examStats.score,
          totalQuestions: examStats.totalQuestions,
          percentage: examStats.percentage,
          date: examData.date || new Date(),
          timeSpent: examStats.totalTime,
        });
      }
    }

    if (stats.recentAttempts.length > 0) {
      stats.averageScore =
        stats.recentAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
        stats.recentAttempts.length;
      const bestFromAttempts = Math.max(...stats.recentAttempts.map((a) => a.percentage));
      if (bestFromAttempts > stats.bestScore) stats.bestScore = bestFromAttempts;
    }

    analyzeStrengthsAndWeaknesses(stats);
    return stats;
  };

  const loadExamData = (examId) => {
    try {
      const answers = localStorage.getItem(`examAnswers_${examId}`);
      const globalStart = localStorage.getItem(`examGlobalStart_${examId}`);
      const sectionTimers = localStorage.getItem(`examSectionTimers_${examId}`);

      if (answers || globalStart || sectionTimers) {
        return {
          answers: answers ? JSON.parse(answers) : {},
          globalStart: globalStart ? JSON.parse(globalStart) : null,
          sectionTimers: sectionTimers ? JSON.parse(sectionTimers) : {},
          date: globalStart ? new Date(JSON.parse(globalStart)) : new Date(),
        };
      }
    } catch (error) {
      console.warn(`Error loading data for ${examId}:`, error);
    }
    return null;
  };

  const calculateExamStats = (examData) => {
    const answers = examData.answers || {};
    let totalQuestions = 0;
    let correctAnswers = 0;

    Object.values(answers).forEach((partAnswers) => {
      if (partAnswers && typeof partAnswers === 'object') {
        totalQuestions += Object.keys(partAnswers).length;
        correctAnswers += Object.keys(partAnswers).length;
      }
    });

    const percentage =
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const isCompleted = totalQuestions >= 17;

    return {
      score: correctAnswers,
      totalQuestions,
      percentage,
      isCompleted,
      totalTime: calculateTotalTime(examData.sectionTimers),
    };
  };

  const calculateTotalTime = (sectionTimers) => {
    if (!sectionTimers) return 0;
    return Object.values(sectionTimers).reduce((sum, time) => sum + (time || 0), 0);
  };

  const updateSectionStats = (stats, examStats) => {
    const sections = ['reading', 'writing', 'listening', 'speaking'];
    sections.forEach((section) => {
      const prev = stats.sections[section];
      const attempts = prev.attempts + 1;
      stats.sections[section] = {
        ...prev,
        attempts,
        averageScore: (prev.averageScore * prev.attempts + examStats.percentage) / attempts,
        bestScore: Math.max(prev.bestScore, examStats.percentage),
      };
    });
  };

  const analyzeStrengthsAndWeaknesses = (stats) => {
    const sections = Object.entries(stats.sections);
    const sortedSections = sections.sort((a, b) => b[1].averageScore - a[1].averageScore);

    stats.strengths = sortedSections
      .filter(([, s]) => s.attempts > 0)
      .slice(0, 2)
      .map(([section]) => section);

    stats.weaknesses = sortedSections
      .filter(([, s]) => s.attempts > 0)
      .slice(-2)
      .map(([section]) => section);

    stats.improvementAreas = [
      'Practica más ejercicios de gramática',
      'Amplía tu vocabulario académico',
      'Refuerza la comprensión auditiva',
      'Desarrolla técnicas de escritura',
    ];
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const hasData = statistics.totalExams > 0;
  const recent = statistics.recentAttempts.slice(0, 5);

  const kpis = [
    {
      key: 'started',
      icon: '📚',
      value: statistics.totalExams,
      label: 'Exámenes iniciados',
      tone: 'blue',
    },
    {
      key: 'completed',
      icon: '✅',
      value: statistics.completedExams,
      label: 'Completados',
      tone: 'green',
    },
    {
      key: 'average',
      icon: '🎯',
      value: `${Math.round(statistics.averageScore)}%`,
      label: 'Puntuación media',
      tone: 'violet',
    },
    {
      key: 'best',
      icon: '🏆',
      value: `${Math.round(statistics.bestScore)}%`,
      label: 'Mejor puntuación',
      tone: 'amber',
    },
  ];

  return (
    <section className="exam-stats" aria-labelledby="exam-stats-title">
      <header className="exam-stats__header">
        <div className="exam-stats__title-wrap">
          <h2 id="exam-stats-title">Estadísticas de exámenes</h2>
          <p className="exam-stats__subtitle">
            Resumen de tu actividad en exámenes de práctica (datos guardados en este dispositivo).
          </p>
        </div>
        <div className="exam-stats__filter">
          <label htmlFor="exam-stats-range">Periodo</label>
          <select
            id="exam-stats-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="exam-stats__select"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="all">Todo el tiempo</option>
          </select>
        </div>
      </header>

      <div className="exam-stats__kpis">
        {kpis.map((kpi) => (
          <article
            key={kpi.key}
            className={`exam-stats__kpi exam-stats__kpi--${kpi.tone}`}
          >
            <span className="exam-stats__kpi-icon" aria-hidden>
              {kpi.icon}
            </span>
            <div className="exam-stats__kpi-body">
              <span className="exam-stats__kpi-value">{kpi.value}</span>
              <span className="exam-stats__kpi-label">{kpi.label}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="exam-stats__sections">
        <h3 className="exam-stats__block-title">Rendimiento por sección</h3>
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
                    <span className="exam-stats__metric-label">Intentos</span>
                  </div>
                  <div className="exam-stats__metric">
                    <span className="exam-stats__metric-value">{pct}%</span>
                    <span className="exam-stats__metric-label">Media</span>
                  </div>
                  <div className="exam-stats__metric">
                    <span className="exam-stats__metric-value">
                      {Math.round(sectionStats.bestScore)}%
                    </span>
                    <span className="exam-stats__metric-label">Mejor</span>
                  </div>
                </div>
                <div className="exam-stats__progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
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
          <h3>Intentos recientes</h3>
          {recent.length > 0 ? (
            <div className="exam-stats__attempts">
              {recent.map((attempt, index) => {
                const performance = getPerformance(attempt.percentage);
                return (
                  <div key={index} className="exam-stats__attempt">
                    <div>
                      <div className="exam-stats__attempt-name">
                        {attempt.examId.replace('exam-', 'Examen ')}
                      </div>
                      <div className="exam-stats__attempt-date">
                        {attempt.date.toLocaleDateString('es-ES', {
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
                        {attempt.score}/{attempt.totalQuestions}
                      </div>
                    </div>
                    <div className="exam-stats__attempt-time">{formatTime(attempt.timeSpent)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="exam-stats__empty">
              {hasData
                ? 'No hay intentos recientes en este periodo.'
                : (
                  <>
                    Aún no has realizado exámenes de práctica. Empieza en{' '}
                    <a href="/niveles">Niveles</a>.
                  </>
                )}
            </p>
          )}
        </div>

        <div className="exam-stats__panel">
          <h3>Análisis de rendimiento</h3>
          <div className="exam-stats__insights">
            <div className="exam-stats__insight-card exam-stats__insight-card--strength">
              <h4>Fortalezas</h4>
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
                  Completa exámenes para identificar tus puntos fuertes.
                </p>
              )}
            </div>
            <div className="exam-stats__insight-card exam-stats__insight-card--improve">
              <h4>Áreas de mejora</h4>
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
          <span className="exam-stats__time-label">Tiempo total</span>
          <span className="exam-stats__time-value">{formatTime(statistics.totalTime)}</span>
        </div>
        <div className="exam-stats__time-item">
          <span className="exam-stats__time-label">Media por examen</span>
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
