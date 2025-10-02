'use client';

import { useState } from 'react';

export default function EnhancedFeedback({ 
  question,
  userAnswer,
  correctAnswer,
  explanation,
  showFeedback,
  onToggleFeedback
}) {
  const [showTips, setShowTips] = useState(false);
  const [showReferences, setShowReferences] = useState(false);

  const isCorrect = userAnswer === correctAnswer;
  const hasAnswered = userAnswer !== undefined && userAnswer !== '';

  // Generar tips contextuales basados en el tipo de pregunta
  const getContextualTips = () => {
    const tips = [];
    
    if (question.type === 'cloze') {
      tips.push('💡 En ejercicios de cloze, lee todo el texto primero para entender el contexto');
      tips.push('🔍 Presta atención a las palabras que rodean el espacio en blanco');
      tips.push('📝 Considera la gramática y el significado de la frase completa');
    }
    
    if (question.type === 'multiple-choice') {
      tips.push('❌ Elimina las opciones que claramente no encajan');
      tips.push('🎯 Busca palabras clave en la pregunta');
      tips.push('🔄 Lee todas las opciones antes de decidir');
    }
    
    if (question.difficulty === 'hard') {
      tips.push('⏰ No te quedes demasiado tiempo en una pregunta difícil');
      tips.push('📚 Revisa las reglas gramaticales relacionadas');
    }
    
    return tips;
  };

  // Generar referencias gramaticales
  const getGrammarReferences = () => {
    const references = [];
    
    // Analizar el contenido de la pregunta para sugerir referencias
    const questionText = question.text?.toLowerCase() || '';
    
    if (questionText.includes('been') || questionText.includes('have')) {
      references.push({
        topic: 'Present Perfect',
        description: 'Tiempo verbal que conecta el pasado con el presente',
        example: 'I have been working here for 5 years'
      });
    }
    
    if (questionText.includes('if') || questionText.includes('would')) {
      references.push({
        topic: 'Conditionals',
        description: 'Estructuras condicionales en inglés',
        example: 'If I had time, I would help you'
      });
    }
    
    if (questionText.includes('the') || questionText.includes('a')) {
      references.push({
        topic: 'Articles',
        description: 'Uso de artículos definidos e indefinidos',
        example: 'The book on the table is mine'
      });
    }
    
    return references;
  };

  // Obtener explicación detallada
  const getDetailedExplanation = () => {
    if (!explanation) return null;
    
    return (
      <div className="explanation-content">
        <h4>📖 Explicación Detallada</h4>
        <p className="explanation-text">{explanation}</p>
        
        {isCorrect ? (
          <div className="explanation-feedback explanation-feedback--correct">
            <span className="feedback-icon">✅</span>
            <span className="feedback-text">¡Excelente! Has elegido la respuesta correcta.</span>
          </div>
        ) : hasAnswered ? (
          <div className="explanation-feedback explanation-feedback--incorrect">
            <span className="feedback-icon">❌</span>
            <span className="feedback-text">
              No es correcto. La respuesta correcta es <strong>{correctAnswer}</strong>.
            </span>
          </div>
        ) : (
          <div className="explanation-feedback explanation-feedback--unanswered">
            <span className="feedback-icon">❓</span>
            <span className="feedback-text">La respuesta correcta es <strong>{correctAnswer}</strong>.</span>
          </div>
        )}
      </div>
    );
  };

  // Obtener análisis de la respuesta
  const getAnswerAnalysis = () => {
    if (!hasAnswered) return null;
    
    return (
      <div className="answer-analysis">
        <h4>🔍 Análisis de tu Respuesta</h4>
        <div className="analysis-grid">
          <div className="analysis-item">
            <span className="analysis-label">Tu respuesta:</span>
            <span className={`analysis-value ${isCorrect ? 'correct' : 'incorrect'}`}>
              {userAnswer}
            </span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Respuesta correcta:</span>
            <span className="analysis-value correct">{correctAnswer}</span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Estado:</span>
            <span className={`analysis-value status-${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? 'Correcto ✅' : 'Incorrecto ❌'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const contextualTips = getContextualTips();
  const grammarReferences = getGrammarReferences();

  return (
    <div className="enhanced-feedback">
      <div className="feedback-header">
        <h3>📚 Feedback Detallado</h3>
        <button 
          className="feedback-toggle-btn"
          onClick={onToggleFeedback}
        >
          {showFeedback ? 'Ocultar' : 'Mostrar'} Feedback
        </button>
      </div>

      {showFeedback && (
        <div className="feedback-content">
          {/* Explicación principal */}
          {getDetailedExplanation()}
          
          {/* Análisis de respuesta */}
          {getAnswerAnalysis()}
          
          {/* Tips contextuales */}
          <div className="contextual-tips">
            <div className="tips-header">
              <h4>💡 Tips para este tipo de pregunta</h4>
              <button 
                className="tips-toggle-btn"
                onClick={() => setShowTips(!showTips)}
              >
                {showTips ? 'Ocultar' : 'Mostrar'} Tips
              </button>
            </div>
            
            {showTips && (
              <div className="tips-list">
                {contextualTips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    {tip}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Referencias gramaticales */}
          {grammarReferences.length > 0 && (
            <div className="grammar-references">
              <div className="references-header">
                <h4>📖 Referencias Gramaticales</h4>
                <button 
                  className="references-toggle-btn"
                  onClick={() => setShowReferences(!showReferences)}
                >
                  {showReferences ? 'Ocultar' : 'Mostrar'} Referencias
                </button>
              </div>
              
              {showReferences && (
                <div className="references-list">
                  {grammarReferences.map((ref, index) => (
                    <div key={index} className="reference-item">
                      <div className="reference-topic">{ref.topic}</div>
                      <div className="reference-description">{ref.description}</div>
                      <div className="reference-example">
                        <strong>Ejemplo:</strong> {ref.example}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Recomendaciones de estudio */}
          <div className="study-recommendations">
            <h4>📚 Recomendaciones de Estudio</h4>
            <div className="recommendations-list">
              {!isCorrect && hasAnswered && (
                <div className="recommendation-item">
                  <span className="recommendation-icon">📝</span>
                  <span className="recommendation-text">
                    Revisa las reglas gramaticales relacionadas con esta pregunta
                  </span>
                </div>
              )}
              
              {question.difficulty === 'hard' && (
                <div className="recommendation-item">
                  <span className="recommendation-icon">🎯</span>
                  <span className="recommendation-text">
                    Practica más ejercicios de este nivel de dificultad
                  </span>
                </div>
              )}
              
              <div className="recommendation-item">
                <span className="recommendation-icon">🔄</span>
                <span className="recommendation-text">
                  Intenta explicar la respuesta en tus propias palabras
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




















