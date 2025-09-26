'use client';

import { useState, useEffect, useCallback } from 'react';

export default function ExamTimer({ 
  totalTime = 90 * 60, // 90 minutos por defecto
  onTimeUp, 
  onWarning,
  sectionName = "Reading",
  isActive = true 
}) {
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(isActive);
  const [warnings, setWarnings] = useState({
    tenMin: false,
    fiveMin: false,
    oneMin: false
  });

  // Función para formatear tiempo
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Función para obtener el color del timer
  const getTimerColor = () => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 50) return '#28a745'; // Verde
    if (percentage > 20) return '#ffc107'; // Amarillo
    return '#dc3545'; // Rojo
  };

  // Función para obtener el estado del timer
  const getTimerState = () => {
    if (timeLeft === 0) return 'finished';
    if (timeLeft <= 60) return 'critical';
    if (timeLeft <= 300) return 'warning';
    return 'normal';
  };

  // Efecto principal del timer
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          const newTime = time - 1;
          
          // Alertas de tiempo
          if (newTime === 600 && !warnings.tenMin) { // 10 minutos
            setWarnings(prev => ({ ...prev, tenMin: true }));
            onWarning && onWarning('tenMin', '10 minutos restantes');
          } else if (newTime === 300 && !warnings.fiveMin) { // 5 minutos
            setWarnings(prev => ({ ...prev, fiveMin: true }));
            onWarning && onWarning('fiveMin', '5 minutos restantes');
          } else if (newTime === 60 && !warnings.oneMin) { // 1 minuto
            setWarnings(prev => ({ ...prev, oneMin: true }));
            onWarning && onWarning('oneMin', '1 minuto restante');
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      onTimeUp && onTimeUp();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onTimeUp, onWarning, warnings]);

  // Pausar/reanudar timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Resetear timer
  const resetTimer = () => {
    setTimeLeft(totalTime);
    setIsRunning(false);
    setWarnings({ tenMin: false, fiveMin: false, oneMin: false });
  };

  const timerState = getTimerState();

  return (
    <div className="exam-timer">
      <div className="timer-header">
        <h3>⏰ {sectionName}</h3>
        <div className="timer-controls">
          <button 
            className="timer-control-btn"
            onClick={toggleTimer}
            title={isRunning ? 'Pausar' : 'Reanudar'}
          >
            {isRunning ? '⏸️' : '▶️'}
          </button>
          <button 
            className="timer-control-btn"
            onClick={resetTimer}
            title="Resetear"
          >
            🔄
          </button>
        </div>
      </div>
      
      <div className={`timer-display timer-display--${timerState}`}>
        <div className="timer-time" style={{ color: getTimerColor() }}>
          {formatTime(timeLeft)}
        </div>
        <div className="timer-progress">
          <div 
            className="timer-progress-bar"
            style={{ 
              width: `${(timeLeft / totalTime) * 100}%`,
              backgroundColor: getTimerColor()
            }}
          />
        </div>
      </div>

      {warnings.tenMin && (
        <div className="timer-warning timer-warning--ten">
          ⚠️ 10 minutos restantes
        </div>
      )}
      {warnings.fiveMin && (
        <div className="timer-warning timer-warning--five">
          🚨 5 minutos restantes
        </div>
      )}
      {warnings.oneMin && (
        <div className="timer-warning timer-warning--one">
          🔥 ¡Solo 1 minuto!
        </div>
      )}

      {timeLeft === 0 && (
        <div className="timer-finished">
          ⏰ ¡Tiempo agotado!
        </div>
      )}
    </div>
  );
}


