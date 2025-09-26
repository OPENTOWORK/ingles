'use client';

import { useState, useEffect } from 'react';
import { useExam } from '@/context/ExamContext';
import { useRouter } from 'next/navigation';

export default function ExamManager({ examId }) {
  const router = useRouter();
  const [hasProgress, setHasProgress] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState('');

  // Función para obtener claves específicas del examen
  const getExamKeys = (examId) => ({
    answers: `examAnswers_${examId}`,
    globalStart: `examGlobalStart_${examId}`,
    sectionTimers: `examSectionTimers_${examId}`,
    lastSaved: `examLastSaved_${examId}`
  });

  useEffect(() => {
    // Verificar si hay progreso guardado para este examen específico
    if (typeof window !== 'undefined') {
      const keys = getExamKeys(examId);
      
      try {
        const savedAnswers = localStorage.getItem(keys.answers);
        const savedStart = localStorage.getItem(keys.globalStart);
        const savedLastSaved = localStorage.getItem(keys.lastSaved);
        
        if (savedAnswers || savedStart) {
          setHasProgress(true);
          
          // Obtener timestamp del último guardado
          if (savedLastSaved) {
            const date = new Date(savedLastSaved);
            if (!isNaN(date.getTime())) {
              setLastSaved(date);
            }
          }
        } else {
          setHasProgress(false);
          setLastSaved(null);
        }
      } catch (error) {
        console.warn(`Error checking progress for ${examId}:`, error);
        setHasProgress(false);
        setLastSaved(null);
      }
    }
  }, [examId]);

  const handleLoadExam = () => {
    // Navegar a la primera parte del examen específico
    const examNumber = examId.replace('exam-', '');
    router.push(`/niveles/c1/exam-${examNumber}/part-1`);
  };

  const handleRestartExam = () => {
    setAction('restart');
    setShowConfirm(true);
  };

  const confirmAction = () => {
    if (action === 'restart') {
      // Limpiar todo el progreso de este examen específico
      const keys = getExamKeys(examId);
      
      if (typeof window !== 'undefined') {
        Object.values(keys).forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      // Navegar a la primera parte de este examen específico
      const examNumber = examId.replace('exam-', '');
      router.push(`/niveles/c1/exam-${examNumber}/part-1`);
    }
    
    setShowConfirm(false);
    setAction('');
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setAction('');
  };

  const startNewExam = () => {
    const examNumber = examId.replace('exam-', '');
    router.push(`/niveles/c1/exam-${examNumber}/part-1`);
  };

  return (
    <div className="exam-manager">
      <div className="exam-manager-header">
        <h3>📋 Gestión del Examen</h3>
      </div>
      
      <div className="exam-manager-content">
        {hasProgress ? (
          <div className="exam-manager-progress">
            <div className="progress-info">
              <h4>💾 Progreso Guardado</h4>
              <p>Hay un examen en progreso.</p>
              {lastSaved && (
                <p className="last-saved">
                  Último guardado: {lastSaved.toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="exam-manager-actions">
              <button 
                className="exam-manager-btn exam-manager-btn--load"
                onClick={handleLoadExam}
              >
                📂 Continuar Examen
              </button>
              <button 
                className="exam-manager-btn exam-manager-btn--restart"
                onClick={handleRestartExam}
              >
                🔄 Reiniciar Examen
              </button>
            </div>
          </div>
        ) : (
          <div className="exam-manager-new">
            <div className="new-exam-info">
              <h4>🆕 Nuevo Examen</h4>
              <p>No hay progreso guardado. Puedes comenzar un nuevo examen.</p>
            </div>
            
            <div className="exam-manager-actions">
              <button 
                className="exam-manager-btn exam-manager-btn--start"
                onClick={startNewExam}
              >
                🚀 Comenzar Examen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="exam-exit-overlay">
          <div className="exam-exit-modal">
            <div className="exam-exit-header">
              <h3>⚠️ Confirmar Acción</h3>
            </div>
            <div className="exam-exit-content">
              <p className="exam-exit-confirm-text">
                ¿Estás seguro de que quieres reiniciar el examen? Se perderá todo el progreso actual.
              </p>
              <div className="exam-exit-confirm-buttons">
                <button 
                  className="exam-exit-btn exam-exit-btn--confirm"
                  onClick={confirmAction}
                >
                  ✅ Sí, reiniciar
                </button>
                <button 
                  className="exam-exit-btn exam-exit-btn--cancel"
                  onClick={cancelAction}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
