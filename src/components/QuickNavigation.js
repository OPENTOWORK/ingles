'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickNavigation({ 
  questions = [],
  answers = {},
  currentQuestion = 1,
  onNavigate,
  sectionName = "Part 1"
}) {
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [isMinimized, setIsMinimized] = useState(false);

  // Cargar marcadores y estado de minimizado desde localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`bookmarks_${sectionName}`);
    const savedFlags = localStorage.getItem(`flags_${sectionName}`);
    const savedMinimized = localStorage.getItem(`navMinimized_${sectionName}`);
    
    if (savedBookmarks) {
      setBookmarkedQuestions(new Set(JSON.parse(savedBookmarks)));
    }
    if (savedFlags) {
      setFlaggedQuestions(new Set(JSON.parse(savedFlags)));
    }
    if (savedMinimized) {
      setIsMinimized(JSON.parse(savedMinimized));
    }
  }, [sectionName]);

  // Guardar marcadores en localStorage
  const saveBookmarks = (bookmarks) => {
    localStorage.setItem(`bookmarks_${sectionName}`, JSON.stringify([...bookmarks]));
  };

  const saveFlags = (flags) => {
    localStorage.setItem(`flags_${sectionName}`, JSON.stringify([...flags]));
  };

  // Toggle minimizado
  const toggleMinimized = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    localStorage.setItem(`navMinimized_${sectionName}`, JSON.stringify(newMinimized));
  };

  // Toggle bookmark
  const toggleBookmark = (questionId) => {
    const newBookmarks = new Set(bookmarkedQuestions);
    if (newBookmarks.has(questionId)) {
      newBookmarks.delete(questionId);
    } else {
      newBookmarks.add(questionId);
    }
    setBookmarkedQuestions(newBookmarks);
    saveBookmarks(newBookmarks);
  };

  // Toggle flag
  const toggleFlag = (questionId) => {
    const newFlags = new Set(flaggedQuestions);
    if (newFlags.has(questionId)) {
      newFlags.delete(questionId);
    } else {
      newFlags.add(questionId);
    }
    setFlaggedQuestions(newFlags);
    saveFlags(newFlags);
  };

  // Navegar a pregunta específica
  const navigateToQuestion = (questionId) => {
    onNavigate && onNavigate(questionId);
  };

  // Obtener estado de la pregunta
  const getQuestionState = (questionId) => {
    const isAnswered = answers[questionId] !== undefined;
    const isBookmarked = bookmarkedQuestions.has(questionId);
    const isFlagged = flaggedQuestions.has(questionId);
    const isCurrent = currentQuestion === questionId;

    return { isAnswered, isBookmarked, isFlagged, isCurrent };
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (currentQuestion > 1) {
              navigateToQuestion(currentQuestion - 1);
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (currentQuestion < questions.length) {
              navigateToQuestion(currentQuestion + 1);
            }
            break;
          case 'b':
            e.preventDefault();
            toggleBookmark(currentQuestion);
            break;
          case 'f':
            e.preventDefault();
            toggleFlag(currentQuestion);
            break;
          case 'm':
            e.preventDefault();
            toggleMinimized();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, questions.length]);

  return (
    <div className={`quick-navigation ${isMinimized ? 'quick-navigation--minimized' : ''}`}>
      <div className="nav-header">
        <div className="nav-header-content">
          <h3>🧭 Navegación Rápida</h3>
          {!isMinimized && (
            <div className="nav-stats">
              <span className="nav-stat">
                📝 {questions.length} preguntas
              </span>
              <span className="nav-stat">
                ✅ {Object.keys(answers).length} respondidas
              </span>
            </div>
          )}
        </div>
        <button 
          className="minimize-btn"
          onClick={toggleMinimized}
          title={`${isMinimized ? 'Expandir' : 'Minimizar'} navegación (Ctrl + M)`}
        >
          {isMinimized ? '📖' : '📄'}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Botones de navegación */}
          <div className="nav-controls">
        <button 
          className="nav-btn nav-btn--prev"
          onClick={() => navigateToQuestion(Math.max(1, currentQuestion - 1))}
          disabled={currentQuestion === 1}
          title="Pregunta anterior (Ctrl + ←)"
        >
          ← Anterior
        </button>
        
        <div className="current-question">
          <span className="question-number">{currentQuestion}</span>
          <span className="question-total">/ {questions.length}</span>
        </div>
        
        <button 
          className="nav-btn nav-btn--next"
          onClick={() => navigateToQuestion(Math.min(questions.length, currentQuestion + 1))}
          disabled={currentQuestion === questions.length}
          title="Pregunta siguiente (Ctrl + →)"
        >
          Siguiente →
        </button>
      </div>

      {/* Grid de preguntas */}
      <div className="questions-grid">
        {questions.map((question, index) => {
          const questionId = index + 1;
          const { isAnswered, isBookmarked, isFlagged, isCurrent } = getQuestionState(questionId);
          
          return (
            <div 
              key={questionId}
              className={`question-item ${
                isCurrent ? 'question-item--current' : ''
              } ${
                isAnswered ? 'question-item--answered' : ''
              } ${
                isFlagged ? 'question-item--flagged' : ''
              }`}
              onClick={() => navigateToQuestion(questionId)}
            >
              <div className="question-number">{questionId}</div>
              
              <div className="question-status">
                {isAnswered && <span className="status-icon status-icon--answered">✅</span>}
                {isFlagged && <span className="status-icon status-icon--flagged">🚩</span>}
                {isBookmarked && <span className="status-icon status-icon--bookmarked">⭐</span>}
              </div>
              
              <div className="question-actions">
                <button 
                  className="action-btn action-btn--bookmark"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(questionId);
                  }}
                  title={`${isBookmarked ? 'Quitar' : 'Agregar'} marcador (Ctrl + B)`}
                >
                  {isBookmarked ? '⭐' : '☆'}
                </button>
                
                <button 
                  className="action-btn action-btn--flag"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFlag(questionId);
                  }}
                  title={`${isFlagged ? 'Quitar' : 'Agregar'} bandera (Ctrl + F)`}
                >
                  {isFlagged ? '🚩' : '🏳️'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen de estado */}
      <div className="nav-summary">
        <div className="summary-item">
          <span className="summary-icon">✅</span>
          <span className="summary-text">
            {Object.keys(answers).length} respondidas
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-icon">🚩</span>
          <span className="summary-text">
            {flaggedQuestions.size} marcadas
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-icon">⭐</span>
          <span className="summary-text">
            {bookmarkedQuestions.size} favoritas
          </span>
        </div>
      </div>

      {/* Atajos de teclado */}
      <div className="keyboard-shortcuts">
        <h4>⌨️ Atajos de Teclado</h4>
        <div className="shortcuts-list">
          <div className="shortcut-item">
            <kbd>Ctrl + ←</kbd>
            <span>Pregunta anterior</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl + →</kbd>
            <span>Pregunta siguiente</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl + B</kbd>
            <span>Marcar/desmarcar</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl + F</kbd>
            <span>Bandera/desmarcar</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl + M</kbd>
            <span>Minimizar/expandir</span>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
