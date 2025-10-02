'use client';

import { useState, useEffect } from 'react';

export default function AdvancedProgress({ 
  questions = [],
  answers = {},
  showResult = {},
  sectionName = "Part 1"
}) {
  const [detailedProgress, setDetailedProgress] = useState({});
  const [timePerQuestion, setTimePerQuestion] = useState({});

  // Calcular progreso detallado
  useEffect(() => {
    const progress = {
      total: questions.length,
      answered: Object.keys(answers).length,
      correct: Object.values(showResult).filter(Boolean).length,
      incorrect: Object.values(showResult).filter(val => val === false).length,
      unanswered: questions.length - Object.keys(answers).length
    };

    setDetailedProgress(progress);
  }, [questions.length, answers, showResult]);

  // Calcular porcentajes
  const getPercentages = () => {
    const total = detailedProgress.total || 1;
    return {
      answered: Math.round((detailedProgress.answered / total) * 100),
      correct: Math.round((detailedProgress.correct / total) * 100),
      incorrect: Math.round((detailedProgress.incorrect / total) * 100),
      unanswered: Math.round((detailedProgress.unanswered / total) * 100)
    };
  };

  // Calcular puntuación estimada
  const getEstimatedScore = () => {
    if (detailedProgress.total === 0) return 0;
    const currentScore = detailedProgress.correct;
    const remainingQuestions = detailedProgress.unanswered;
    const averageAccuracy = detailedProgress.answered > 0 
      ? (detailedProgress.correct / detailedProgress.answered) * 100 
      : 0;
    
    const estimatedRemaining = (remainingQuestions * averageAccuracy) / 100;
    return Math.round(currentScore + estimatedRemaining);
  };

  // Calcular tiempo promedio por pregunta
  const getAverageTimePerQuestion = () => {
    const totalTime = Object.values(timePerQuestion).reduce((sum, time) => sum + time, 0);
    const answeredCount = Object.keys(timePerQuestion).length;
    return answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0;
  };

  // Calcular tiempo estimado restante
  const getEstimatedTimeRemaining = () => {
    const avgTime = getAverageTimePerQuestion();
    const remainingQuestions = detailedProgress.unanswered;
    return avgTime * remainingQuestions;
  };

  const percentages = getPercentages();
  const estimatedScore = getEstimatedScore();
  const avgTimePerQuestion = getAverageTimePerQuestion();

  return (
    <div className="advanced-progress">
      <div className="progress-header">
        <h3>📊 Progreso Detallado - {sectionName}</h3>
      </div>

      {/* Estadísticas principales */}
      <div className="progress-stats">
        <div className="stat-card stat-card--answered">
          <div className="stat-number">{detailedProgress.answered}/{detailedProgress.total}</div>
          <div className="stat-label">Respondidas</div>
          <div className="stat-percentage">{percentages.answered}%</div>
        </div>
        
        <div className="stat-card stat-card--correct">
          <div className="stat-number">{detailedProgress.correct}</div>
          <div className="stat-label">Correctas</div>
          <div className="stat-percentage">{percentages.correct}%</div>
        </div>
        
        <div className="stat-card stat-card--incorrect">
          <div className="stat-number">{detailedProgress.incorrect}</div>
          <div className="stat-label">Incorrectas</div>
          <div className="stat-percentage">{percentages.incorrect}%</div>
        </div>
        
        <div className="stat-card stat-card--unanswered">
          <div className="stat-number">{detailedProgress.unanswered}</div>
          <div className="stat-label">Sin responder</div>
          <div className="stat-percentage">{percentages.unanswered}%</div>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="progress-visual">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-segment progress-bar--correct"
            style={{ width: `${percentages.correct}%` }}
            title={`Correctas: ${detailedProgress.correct}`}
          />
          <div 
            className="progress-bar-segment progress-bar--incorrect"
            style={{ width: `${percentages.incorrect}%` }}
            title={`Incorrectas: ${detailedProgress.incorrect}`}
          />
          <div 
            className="progress-bar-segment progress-bar--unanswered"
            style={{ width: `${percentages.unanswered}%` }}
            title={`Sin responder: ${detailedProgress.unanswered}`}
          />
        </div>
      </div>

      {/* Análisis de rendimiento */}
      <div className="performance-analysis">
        <div className="analysis-item">
          <span className="analysis-label">🎯 Puntuación Estimada:</span>
          <span className="analysis-value">{estimatedScore}/{detailedProgress.total}</span>
        </div>
        
        <div className="analysis-item">
          <span className="analysis-label">⏱️ Tiempo Promedio:</span>
          <span className="analysis-value">{avgTimePerQuestion}s por pregunta</span>
        </div>
        
        <div className="analysis-item">
          <span className="analysis-label">📈 Precisión Actual:</span>
          <span className="analysis-value">
            {detailedProgress.answered > 0 
              ? Math.round((detailedProgress.correct / detailedProgress.answered) * 100)
              : 0}%
          </span>
        </div>
        
        <div className="analysis-item">
          <span className="analysis-label">🎖️ Estado:</span>
          <span className={`analysis-value analysis-status--${getPerformanceStatus()}`}>
            {getPerformanceStatusText()}
          </span>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="progress-recommendations">
        <h4>💡 Recomendaciones</h4>
        <ul>
          {getRecommendations().map((rec, index) => (
            <li key={index} className="recommendation-item">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  function getPerformanceStatus() {
    const accuracy = detailedProgress.answered > 0 
      ? (detailedProgress.correct / detailedProgress.answered) * 100 
      : 0;
    
    if (accuracy >= 80) return 'excellent';
    if (accuracy >= 60) return 'good';
    if (accuracy >= 40) return 'fair';
    return 'needs-improvement';
  }

  function getPerformanceStatusText() {
    const status = getPerformanceStatus();
    const statusTexts = {
      'excellent': 'Excelente',
      'good': 'Bueno',
      'fair': 'Regular',
      'needs-improvement': 'Necesita mejorar'
    };
    return statusTexts[status];
  }

  function getRecommendations() {
    const recommendations = [];
    const accuracy = detailedProgress.answered > 0 
      ? (detailedProgress.correct / detailedProgress.answered) * 100 
      : 0;

    if (detailedProgress.unanswered > 0) {
      recommendations.push(`Responde las ${detailedProgress.unanswered} preguntas restantes para completar el examen`);
    }

    if (accuracy < 60 && detailedProgress.answered > 0) {
      recommendations.push('Revisa las explicaciones para mejorar tu comprensión');
    }

    if (avgTimePerQuestion > 120) {
      recommendations.push('Intenta ser más eficiente con el tiempo');
    }

    if (detailedProgress.correct >= detailedProgress.total * 0.6) {
      recommendations.push('¡Excelente trabajo! Mantén este ritmo');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continúa al siguiente nivel');
    }

    return recommendations;
  }
}




















