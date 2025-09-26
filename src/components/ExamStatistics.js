'use client';

import { useState, useEffect } from 'react';

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
      speaking: { attempts: 0, averageScore: 0, bestScore: 0, totalTime: 0 }
    },
    recentAttempts: [],
    strengths: [],
    weaknesses: [],
    improvementAreas: []
  });

  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'

  useEffect(() => {
    loadStatistics();
  }, [userId, timeRange]);

  const loadStatistics = () => {
    // Cargar estadísticas desde localStorage
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
        speaking: { attempts: 0, averageScore: 0, bestScore: 0, totalTime: 0 }
      },
      recentAttempts: [],
      strengths: [],
      weaknesses: [],
      improvementAreas: []
    };

    // Analizar datos de todos los exámenes
    for (let i = 1; i <= 12; i++) {
      const examId = `exam-${i}`;
      const examData = loadExamData(examId);
      
      if (examData && Object.keys(examData.answers || {}).length > 0) {
        stats.totalExams++;
        
        const examStats = calculateExamStats(examData);
        stats.completedExams += examStats.isCompleted ? 1 : 0;
        stats.totalTime += examStats.totalTime;
        
        if (examStats.score > stats.bestScore) {
          stats.bestScore = examStats.score;
        }

        // Actualizar estadísticas por sección
        updateSectionStats(stats, examStats);
        
        // Agregar a intentos recientes
        stats.recentAttempts.push({
          examId,
          score: examStats.score,
          totalQuestions: examStats.totalQuestions,
          percentage: examStats.percentage,
          date: examData.date || new Date(),
          timeSpent: examStats.totalTime
        });
      }
    }

    // Calcular promedios
    if (stats.totalExams > 0) {
      stats.averageScore = stats.recentAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / stats.recentAttempts.length;
    }

    // Analizar fortalezas y debilidades
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
          date: globalStart ? new Date(JSON.parse(globalStart)) : new Date()
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
    
    // Contar preguntas y respuestas correctas
    Object.values(answers).forEach(partAnswers => {
      if (partAnswers && typeof partAnswers === 'object') {
        totalQuestions += Object.keys(partAnswers).length;
        // Asumir que todas las respuestas son correctas por ahora
        // En un sistema real, esto vendría de la base de datos
        correctAnswers += Object.keys(partAnswers).length;
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const isCompleted = totalQuestions >= 17; // Asumiendo 17 preguntas por examen

    return {
      score: correctAnswers,
      totalQuestions,
      percentage,
      isCompleted,
      totalTime: calculateTotalTime(examData.sectionTimers)
    };
  };

  const calculateTotalTime = (sectionTimers) => {
    if (!sectionTimers) return 0;
    return Object.values(sectionTimers).reduce((sum, time) => sum + (time || 0), 0);
  };

  const updateSectionStats = (stats, examStats) => {
    // Actualizar estadísticas por sección
    // Por simplicidad, asumimos que cada examen tiene todas las secciones
    const sections = ['reading', 'writing', 'listening', 'speaking'];
    sections.forEach(section => {
      stats.sections[section].attempts++;
      stats.sections[section].averageScore = 
        (stats.sections[section].averageScore * (stats.sections[section].attempts - 1) + examStats.percentage) / 
        stats.sections[section].attempts;
      
      if (examStats.percentage > stats.sections[section].bestScore) {
        stats.sections[section].bestScore = examStats.percentage;
      }
    });
  };

  const analyzeStrengthsAndWeaknesses = (stats) => {
    const sections = Object.entries(stats.sections);
    
    // Ordenar por puntuación promedio
    const sortedSections = sections.sort((a, b) => b[1].averageScore - a[1].averageScore);
    
    stats.strengths = sortedSections.slice(0, 2).map(([section]) => section);
    stats.weaknesses = sortedSections.slice(-2).map(([section]) => section);
    
    // Áreas de mejora
    stats.improvementAreas = [
      'Practica más ejercicios de gramática',
      'Mejora tu vocabulario académico',
      'Entrena la comprensión auditiva',
      'Desarrolla técnicas de escritura'
    ];
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Excelente', color: '#28a745' };
    if (percentage >= 80) return { level: 'Muy Bueno', color: '#17a2b8' };
    if (percentage >= 70) return { level: 'Bueno', color: '#ffc107' };
    if (percentage >= 60) return { level: 'Regular', color: '#fd7e14' };
    return { level: 'Necesita Mejorar', color: '#dc3545' };
  };

  return (
    <div className="exam-statistics">
      <div className="statistics-header">
        <h2>📊 Estadísticas de Exámenes</h2>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="all">Todo el tiempo</option>
          </select>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="main-stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-icon">📚</div>
          <div className="stat-number">{statistics.totalExams}</div>
          <div className="stat-label">Exámenes Iniciados</div>
        </div>
        
        <div className="stat-card stat-card--success">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{statistics.completedExams}</div>
          <div className="stat-label">Completados</div>
        </div>
        
        <div className="stat-card stat-card--info">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">{Math.round(statistics.averageScore)}%</div>
          <div className="stat-label">Puntuación Promedio</div>
        </div>
        
        <div className="stat-card stat-card--warning">
          <div className="stat-icon">🏆</div>
          <div className="stat-number">{Math.round(statistics.bestScore)}%</div>
          <div className="stat-label">Mejor Puntuación</div>
        </div>
      </div>

      {/* Estadísticas por sección */}
      <div className="section-stats">
        <h3>📈 Rendimiento por Sección</h3>
        <div className="section-grid">
          {Object.entries(statistics.sections).map(([section, stats]) => {
            const performance = getPerformanceLevel(stats.averageScore);
            return (
              <div key={section} className="section-card">
                <div className="section-header">
                  <h4>{section.charAt(0).toUpperCase() + section.slice(1)}</h4>
                  <span 
                    className="performance-level"
                    style={{ color: performance.color }}
                  >
                    {performance.level}
                  </span>
                </div>
                <div className="section-metrics">
                  <div className="metric">
                    <span className="metric-label">Intentos:</span>
                    <span className="metric-value">{stats.attempts}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Promedio:</span>
                    <span className="metric-value">{Math.round(stats.averageScore)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Mejor:</span>
                    <span className="metric-value">{Math.round(stats.bestScore)}%</span>
                  </div>
                </div>
                <div className="section-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${stats.averageScore}%`,
                        backgroundColor: performance.color
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Intentos recientes */}
      <div className="recent-attempts">
        <h3>🕒 Intentos Recientes</h3>
        <div className="attempts-list">
          {statistics.recentAttempts.slice(0, 5).map((attempt, index) => {
            const performance = getPerformanceLevel(attempt.percentage);
            return (
              <div key={index} className="attempt-item">
                <div className="attempt-info">
                  <div className="attempt-exam">{attempt.examId.replace('exam-', 'Examen ')}</div>
                  <div className="attempt-date">{attempt.date.toLocaleDateString()}</div>
                </div>
                <div className="attempt-score">
                  <span 
                    className="score-percentage"
                    style={{ color: performance.color }}
                  >
                    {attempt.percentage}%
                  </span>
                  <div className="score-details">
                    {attempt.score}/{attempt.totalQuestions}
                  </div>
                </div>
                <div className="attempt-time">
                  {formatTime(attempt.timeSpent)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Análisis de rendimiento */}
      <div className="performance-analysis">
        <div className="analysis-section">
          <h3>💪 Fortalezas</h3>
          <div className="strengths-list">
            {statistics.strengths.map((strength, index) => (
              <div key={index} className="strength-item">
                <span className="strength-icon">✅</span>
                <span className="strength-text">{strength.charAt(0).toUpperCase() + strength.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-section">
          <h3>🎯 Áreas de Mejora</h3>
          <div className="improvement-list">
            {statistics.improvementAreas.map((area, index) => (
              <div key={index} className="improvement-item">
                <span className="improvement-icon">📈</span>
                <span className="improvement-text">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de tiempo */}
      <div className="time-summary">
        <h3>⏱️ Resumen de Tiempo</h3>
        <div className="time-stats">
          <div className="time-stat">
            <span className="time-label">Tiempo Total:</span>
            <span className="time-value">{formatTime(statistics.totalTime)}</span>
          </div>
          <div className="time-stat">
            <span className="time-label">Tiempo Promedio por Examen:</span>
            <span className="time-value">
              {statistics.completedExams > 0 
                ? formatTime(statistics.totalTime / statistics.completedExams)
                : '0m'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


