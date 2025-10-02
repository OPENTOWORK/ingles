'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamExitWarning({ isOpen, onClose, onSaveAndExit, onExitWithoutSaving, onRestart }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState('');

  if (!isOpen) return null;

  const handleAction = (actionType) => {
    setAction(actionType);
    setShowConfirm(true);
  };

  const confirmAction = () => {
    switch (action) {
      case 'save':
        onSaveAndExit();
        break;
      case 'exit':
        onExitWithoutSaving();
        break;
      case 'restart':
        onRestart();
        break;
      default:
        break;
    }
    setShowConfirm(false);
    onClose();
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setAction('');
  };

  return (
    <div className="exam-exit-overlay">
      <div className="exam-exit-modal">
        <div className="exam-exit-header">
          <h3>⚠️ Salir del Examen</h3>
        </div>
        
        {!showConfirm ? (
          <div className="exam-exit-content">
            <p>¿Qué deseas hacer con tu progreso actual?</p>
            <div className="exam-exit-options">
              <button 
                className="exam-exit-btn exam-exit-btn--save"
                onClick={() => handleAction('save')}
              >
                💾 Guardar y Salir
              </button>
              <button 
                className="exam-exit-btn exam-exit-btn--exit"
                onClick={() => handleAction('exit')}
              >
                🚪 Salir sin Guardar
              </button>
              <button 
                className="exam-exit-btn exam-exit-btn--restart"
                onClick={() => handleAction('restart')}
              >
                🔄 Reiniciar Examen
              </button>
              <button 
                className="exam-exit-btn exam-exit-btn--cancel"
                onClick={onClose}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="exam-exit-content">
            <p className="exam-exit-confirm-text">
              {action === 'save' && '¿Estás seguro de que quieres guardar tu progreso y salir?'}
              {action === 'exit' && '¿Estás seguro de que quieres salir sin guardar? Se perderá todo el progreso.'}
              {action === 'restart' && '¿Estás seguro de que quieres reiniciar el examen? Se perderá todo el progreso actual.'}
            </p>
            <div className="exam-exit-confirm-buttons">
              <button 
                className="exam-exit-btn exam-exit-btn--confirm"
                onClick={confirmAction}
              >
                ✅ Sí, confirmar
              </button>
              <button 
                className="exam-exit-btn exam-exit-btn--cancel"
                onClick={cancelAction}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




















