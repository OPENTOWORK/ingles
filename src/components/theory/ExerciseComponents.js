'use client';
import { useEffect, useState } from 'react';

// Multiple Choice Exercise Component
export const MultipleChoiceExercise = ({ 
  question, 
  options, 
  correctAnswer, 
  explanation, 
  onComplete, 
  isCompleted = false 
}) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    if (selected === null) return;
    
    const isCorrect = selected === correctAnswer;
    const points = isCorrect ? 100 : 0;
    
    setScore(points);
    setShowResult(true);
    onComplete?.(points);
  };

  const handleReset = () => {
    setSelected(null);
    setShowResult(false);
    setScore(0);
  };

  return (
    <div style={{
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      background: isCompleted ? '#f0fff4' : 'white',
      borderColor: isCompleted ? '#68d391' : '#e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#2d3748',
          margin: 0,
          flex: 1
        }}>
          {question}
        </h3>
        {isCompleted && (
          <span style={{
            background: '#68d391',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            ✅ Completed
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {options.map((option, index) => (
          <label
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              border: selected === index ? '2px solid #667eea' : '2px solid #e2e8f0',
              borderRadius: '12px',
              cursor: showResult ? 'default' : 'pointer',
              background: showResult 
                ? (index === correctAnswer ? '#f0fff4' : selected === index ? '#fed7d7' : 'white')
                : selected === index ? '#f7fafc' : 'white',
              transition: 'all 0.2s'
            }}
          >
            <input
              type="radio"
              name="option"
              checked={selected === index}
              onChange={() => !showResult && setSelected(index)}
              style={{ margin: 0 }}
            />
            <span style={{
              color: showResult 
                ? (index === correctAnswer ? '#38a169' : selected === index ? '#e53e3e' : '#4a5568')
                : '#4a5568',
              fontWeight: showResult && index === correctAnswer ? '600' : '400'
            }}>
              {option}
            </span>
            {showResult && index === correctAnswer && (
              <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>✅</span>
            )}
            {showResult && selected === index && index !== correctAnswer && (
              <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>❌</span>
            )}
          </label>
        ))}
      </div>

      {showResult && explanation && (
        <div style={{
          background: score > 0 ? '#f0fff4' : '#fff5f5',
          border: `1px solid ${score > 0 ? '#68d391' : '#fc8181'}`,
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontWeight: '600',
            color: score > 0 ? '#38a169' : '#e53e3e',
            marginBottom: '0.5rem'
          }}>
            {score > 0 ? '🎉 Correct!' : '😔 Incorrect'}
          </div>
          <p style={{ margin: 0, color: '#4a5568', lineHeight: 1.5 }}>
            {explanation}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            style={{
              padding: '0.75rem 1.5rem',
              background: selected !== null ? '#667eea' : '#e2e8f0',
              color: selected !== null ? 'white' : '#a0aec0',
              border: 'none',
              borderRadius: '8px',
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

// Fill in the Blanks Exercise Component
export const FillBlanksExercise = ({ 
  text, 
  blanks, 
  onComplete, 
  isCompleted = false 
}) => {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    const totalBlanks = blanks.length;
    let correctAnswers = 0;

    blanks.forEach((blank, index) => {
      if (answers[index]?.toLowerCase().trim() === blank.answer.toLowerCase().trim()) {
        correctAnswers++;
      }
    });

    const points = Math.round((correctAnswers / totalBlanks) * 100);
    setScore(points);
    setShowResult(true);
    onComplete?.(points);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
    setScore(0);
  };

  const renderText = () => {
    const parts = text.split(/(___\d+___)/g);
    return parts.map((part, index) => {
      const blankMatch = part.match(/^___(\d+)___$/);
      if (blankMatch) {
        const blankIndex = parseInt(blankMatch[1]);
        const blank = blanks[blankIndex];
        if (!blank) return part;
        
        return showResult ? (
          <span 
            key={index}
            style={{
              background: answers[blankIndex]?.toLowerCase().trim() === blank.answer.toLowerCase().trim() 
                ? '#f0fff4' 
                : '#fed7d7',
              border: `2px solid ${answers[blankIndex]?.toLowerCase().trim() === blank.answer.toLowerCase().trim() 
                ? '#68d391' 
                : '#fc8181'}`,
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              color: answers[blankIndex]?.toLowerCase().trim() === blank.answer.toLowerCase().trim() 
                ? '#38a169' 
                : '#e53e3e',
              fontWeight: '500'
            }}
          >
            {answers[blankIndex] || '___'}
          </span>
        ) : (
          <input
            key={index}
            type="text"
            value={answers[blankIndex] || ''}
            onChange={(e) => setAnswers(prev => ({ ...prev, [blankIndex]: e.target.value }))}
            style={{
              border: '2px solid #e2e8f0',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              width: `${Math.max(blank.answer.length * 0.8, 80)}px`,
              textAlign: 'center'
            }}
            placeholder="___"
          />
        );
      }
      return part;
    });
  };

  return (
    <div style={{
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      background: isCompleted ? '#f0fff4' : 'white',
      borderColor: isCompleted ? '#68d391' : '#e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#2d3748',
          margin: 0,
          flex: 1
        }}>
          Fill in the blanks
        </h3>
        {isCompleted && (
          <span style={{
            background: '#68d391',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            ✅ Completed
          </span>
        )}
      </div>

      <div style={{
        background: '#f7fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        fontSize: '1.1rem',
        lineHeight: 1.6,
        color: '#2d3748'
      }}>
        {renderText()}
      </div>

      {showResult && (
        <div style={{
          background: score >= 70 ? '#f0fff4' : '#fff5f5',
          border: `1px solid ${score >= 70 ? '#68d391' : '#fc8181'}`,
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontWeight: '600',
            color: score >= 70 ? '#38a169' : '#e53e3e',
            marginBottom: '0.5rem'
          }}>
            {score >= 70 ? '🎉 Well done!' : '😔 Keep practicing'}
          </div>
          <p style={{ margin: 0, color: '#4a5568' }}>
            Score: {score}% ({Math.round(score / 100 * blanks.length)} of {blanks.length} correct)
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== blanks.length}
            style={{
              padding: '0.75rem 1.5rem',
              background: Object.keys(answers).length === blanks.length ? '#667eea' : '#e2e8f0',
              color: Object.keys(answers).length === blanks.length ? 'white' : '#a0aec0',
              border: 'none',
              borderRadius: '8px',
              cursor: Object.keys(answers).length === blanks.length ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Check Answers
          </button>
        ) : (
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

// True/False Exercise Component
export const TrueFalseExercise = ({ 
  statements, 
  onComplete, 
  isCompleted = false 
}) => {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    const totalStatements = statements.length;
    let correctAnswers = 0;

    statements.forEach((statement, index) => {
      if (answers[index] === statement.isTrue) {
        correctAnswers++;
      }
    });

    const points = Math.round((correctAnswers / totalStatements) * 100);
    setScore(points);
    setShowResult(true);
    onComplete?.(points);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
    setScore(0);
  };

  return (
    <div style={{
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      background: isCompleted ? '#f0fff4' : 'white',
      borderColor: isCompleted ? '#68d391' : '#e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#2d3748',
          margin: 0,
          flex: 1
        }}>
          True or False
        </h3>
        {isCompleted && (
          <span style={{
            background: '#68d391',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            ✅ Completed
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {statements.map((statement, index) => (
          <div key={index} style={{
            padding: '1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            background: showResult 
              ? (answers[index] === statement.isTrue ? '#f0fff4' : '#fed7d7')
              : 'white'
          }}>
            <p style={{
              margin: '0 0 0.75rem 0',
              fontSize: '1rem',
              color: '#2d3748',
              lineHeight: 1.5
            }}>
              {statement.text}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: showResult ? 'default' : 'pointer' }}>
                <input
                  type="radio"
                  name={`statement-${index}`}
                  checked={answers[index] === true}
                  onChange={() => !showResult && setAnswers(prev => ({ ...prev, [index]: true }))}
                  style={{ margin: 0 }}
                />
                <span style={{
                  color: showResult && answers[index] === true
                    ? (statement.isTrue ? '#38a169' : '#e53e3e')
                    : '#4a5568',
                  fontWeight: showResult && answers[index] === true ? '600' : '400'
                }}>
                  True
                </span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: showResult ? 'default' : 'pointer' }}>
                <input
                  type="radio"
                  name={`statement-${index}`}
                  checked={answers[index] === false}
                  onChange={() => !showResult && setAnswers(prev => ({ ...prev, [index]: false }))}
                  style={{ margin: 0 }}
                />
                <span style={{
                  color: showResult && answers[index] === false
                    ? (statement.isTrue ? '#e53e3e' : '#38a169')
                    : '#4a5568',
                  fontWeight: showResult && answers[index] === false ? '600' : '400'
                }}>
                  False
                </span>
              </label>
              
              {showResult && (
                <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>
                  {answers[index] === statement.isTrue ? '✅' : '❌'}
                </span>
              )}
            </div>
            
            {showResult && statement.explanation && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#f7fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#4a5568',
                  lineHeight: 1.4
                }}>
                  <strong>Explanation:</strong> {statement.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showResult && (
        <div style={{
          background: score >= 70 ? '#f0fff4' : '#fff5f5',
          border: `1px solid ${score >= 70 ? '#68d391' : '#fc8181'}`,
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontWeight: '600',
            color: score >= 70 ? '#38a169' : '#e53e3e',
            marginBottom: '0.5rem'
          }}>
            {score >= 70 ? '🎉 Excellent!' : '😔 Review and try again'}
          </div>
          <p style={{ margin: 0, color: '#4a5568' }}>
            Score: {score}% ({Math.round(score / 100 * statements.length)} of {statements.length} correct)
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== statements.length}
            style={{
              padding: '0.75rem 1.5rem',
              background: Object.keys(answers).length === statements.length ? '#667eea' : '#e2e8f0',
              color: Object.keys(answers).length === statements.length ? 'white' : '#a0aec0',
              border: 'none',
              borderRadius: '8px',
              cursor: Object.keys(answers).length === statements.length ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Check Answers
          </button>
        ) : (
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
