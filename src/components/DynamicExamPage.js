'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';
import exams from '@/data/exams';

export default function DynamicExamPage() {
  const params = useParams();
  const router = useRouter();
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  
  const { level, exam, part } = params;
  const examData = exams[level]?.[exam]?.[part];
  
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  const EXAM_ID = exam;
  const PART_ID = part;
  const TOTAL_TIME = 90 * 60; // 90 minutes for reading parts

  useEffect(() => {
    if (!examData) {
      router.push('/404');
      return;
    }

    if (!globalStart) {
      setGlobalStart(new Date());
    }

    const stored = answers?.[EXAM_ID]?.[PART_ID] || {};
    setUserAnswers(stored);
    setSelectedAnswers(stored);
    
    // Initialize feedback based on exam type
    initializeFeedback(stored);
  }, [examData, answers, globalStart, setGlobalStart, EXAM_ID, PART_ID]);

  const initializeFeedback = (stored) => {
    if (!examData) return;
    
    const initialFeedback = {};
    
    switch (examData.type) {
      case 'multiple-choice-cloze':
      case 'reading-comprehension':
        examData.questions.forEach(q => {
          const userAnswer = stored[q.id] || stored[q.number];
          if (userAnswer) {
            initialFeedback[q.id || q.number] = {
              correct: userAnswer === q.answer,
              correctAnswer: q.answer
            };
          }
        });
        break;
        
      case 'open-cloze':
      case 'word-formation':
        examData.questions.forEach(q => {
          const userAnswer = stored[q.id]?.trim().toLowerCase();
          if (userAnswer) {
            initialFeedback[q.id] = {
              correct: userAnswer === q.answer.toLowerCase(),
              correctAnswer: q.answer
            };
          }
        });
        break;
        
      case 'key-word-transformation':
        examData.questions.forEach(q => {
          const userAnswer = stored[q.id]?.trim().toUpperCase();
          if (userAnswer) {
            initialFeedback[q.id] = {
              correct: userAnswer === q.answer.toUpperCase(),
              correctAnswer: q.answer
            };
          }
        });
        break;
        
      case 'gapped-text':
      case 'multiple-matching':
        Object.entries(stored).forEach(([num, val]) => {
          const correctAnswer = examData.correctAnswers?.[num];
          if (correctAnswer) {
            initialFeedback[num] = {
              correct: val === correctAnswer,
              correctAnswer: correctAnswer
            };
          }
        });
        break;
    }
    
    setFeedback(initialFeedback);
  };

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
    updateAnswer(EXAM_ID, PART_ID, questionId, value);
  };

  const handleSubmitAnswer = (questionId, correctAnswer) => {
    const userAnswer = userAnswers[questionId];
    if (!userAnswer) return;

    let isCorrect = false;
    let processedUserAnswer = userAnswer;

    switch (examData.type) {
      case 'open-cloze':
      case 'word-formation':
        processedUserAnswer = userAnswer.trim().toLowerCase();
        isCorrect = processedUserAnswer === correctAnswer.toLowerCase();
        break;
      case 'key-word-transformation':
        processedUserAnswer = userAnswer.trim().toUpperCase();
        isCorrect = processedUserAnswer === correctAnswer.toUpperCase();
        break;
      case 'multiple-choice-cloze':
      case 'reading-comprehension':
      case 'gapped-text':
      case 'multiple-matching':
        isCorrect = userAnswer === correctAnswer;
        break;
    }

    setFeedback(prev => ({
      ...prev,
      [questionId]: {
        correct: isCorrect,
        correctAnswer: correctAnswer
      }
    }));
  };

  const handleSelectOption = (questionId, option) => {
    if (feedback[questionId]) return; // Already answered
    
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
    handleAnswerChange(questionId, option);
    
    const question = examData.questions.find(q => (q.id || q.number) === questionId);
    if (question) {
      handleSubmitAnswer(questionId, question.answer);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    if (!globalStart) return TOTAL_TIME;
    const elapsed = Math.floor((Date.now() - globalStart) / 1000);
    return Math.max(0, TOTAL_TIME - elapsed);
  };

  const renderMultipleChoiceQuestion = (question) => {
    const questionId = question.id || question.number;
    const selected = selectedAnswers[questionId];
    const feedbackData = feedback[questionId];

    return (
      <div key={questionId} style={{ background: '#f9f9f9', marginBottom: '2rem', padding: '1rem', borderRadius: '8px' }}>
        <p><strong>{questionId}.</strong> {question.question || question.text}</p>
        {(question.options || []).map((option, index) => {
          const optionKey = Array.isArray(question.options) ? 
            String.fromCharCode(65 + index) : // A, B, C, D for arrays
            Object.keys(question.options)[index]; // Use object keys
          
          const optionText = Array.isArray(question.options) ? option : question.options[optionKey];
          const isCorrect = optionKey === question.answer;
          const isUserAnswer = optionKey === selected;
          
          let bg = '#e0e0e0';
          if (feedbackData) {
            if (isUserAnswer && isCorrect) bg = '#d4edda';
            else if (isUserAnswer) bg = '#f8d7da';
            else if (isCorrect) bg = '#d4edda';
          }

          return (
            <div key={optionKey} style={{ marginBottom: '0.4rem' }}>
              <button
                onClick={() => handleSelectOption(questionId, optionKey)}
                disabled={!!feedbackData}
                style={{
                  backgroundColor: bg,
                  color: '#000',
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  cursor: feedbackData ? 'default' : 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}>
                {optionKey}. {optionText}
              </button>
            </div>
          );
        })}
        {feedbackData && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', borderRadius: '4px', 
                       backgroundColor: feedbackData.correct ? '#d4edda' : '#f8d7da' }}>
            <strong>{feedbackData.correct ? '✓ Correct!' : '✗ Incorrect'}</strong>
            {!feedbackData.correct && (
              <div>Correct answer: <strong>{feedbackData.correctAnswer}</strong></div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderOpenClozeeQuestion = (question, index) => {
    const questionId = question.id;
    const feedbackData = feedback[questionId];

    return (
      <div key={questionId} style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          <strong>({questionId})</strong>
        </label>
        <input
          type="text"
          value={userAnswers[questionId] || ''}
          onChange={(e) => handleAnswerChange(questionId, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !feedbackData) {
              handleSubmitAnswer(questionId, question.answer);
            }
          }}
          disabled={!!feedbackData}
          style={{
            padding: '0.5rem',
            border: `2px solid ${feedbackData ? (feedbackData.correct ? 'green' : 'red') : '#ddd'}`,
            borderRadius: '4px',
            width: '200px'
          }}
        />
        <button
          onClick={() => handleSubmitAnswer(questionId, question.answer)}
          disabled={!!feedbackData || !userAnswers[questionId]}
          style={{
            marginLeft: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: feedbackData || !userAnswers[questionId] ? 'default' : 'pointer'
          }}>
          Check
        </button>
        {feedbackData && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {feedbackData.correct ? (
              <span style={{ color: 'green' }}>✓ Correct!</span>
            ) : (
              <span style={{ color: 'red' }}>✗ Incorrect. Answer: <strong>{feedbackData.correctAnswer}</strong></span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderWordFormationQuestion = (question, index) => {
    const questionId = question.id;
    const feedbackData = feedback[questionId];

    return (
      <div key={questionId} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>({questionId})</strong> Base word: <strong>{question.baseWord}</strong>
        </div>
        <input
          type="text"
          value={userAnswers[questionId] || ''}
          onChange={(e) => handleAnswerChange(questionId, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !feedbackData) {
              handleSubmitAnswer(questionId, question.answer);
            }
          }}
          disabled={!!feedbackData}
          placeholder="Enter the transformed word"
          style={{
            padding: '0.5rem',
            border: `2px solid ${feedbackData ? (feedbackData.correct ? 'green' : 'red') : '#ddd'}`,
            borderRadius: '4px',
            width: '200px'
          }}
        />
        <button
          onClick={() => handleSubmitAnswer(questionId, question.answer)}
          disabled={!!feedbackData || !userAnswers[questionId]}
          style={{
            marginLeft: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: feedbackData || !userAnswers[questionId] ? 'default' : 'pointer'
          }}>
          Check
        </button>
        {feedbackData && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {feedbackData.correct ? (
              <span style={{ color: 'green' }}>✓ Correct!</span>
            ) : (
              <span style={{ color: 'red' }}>✗ Incorrect. Answer: <strong>{feedbackData.correctAnswer}</strong></span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderKeyWordTransformation = (question, index) => {
    const questionId = question.id;
    const feedbackData = feedback[questionId];

    return (
      <div key={questionId} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>{questionId}.</strong> {question.text}
        </div>
        <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Key word: <span style={{ textDecoration: 'underline' }}>{question.keyword}</span>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          {question.secondSentence}
        </div>
        <input
          type="text"
          value={userAnswers[questionId] || ''}
          onChange={(e) => handleAnswerChange(questionId, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !feedbackData) {
              handleSubmitAnswer(questionId, question.answer);
            }
          }}
          disabled={!!feedbackData}
          placeholder="Complete the sentence (3-6 words)"
          style={{
            padding: '0.5rem',
            border: `2px solid ${feedbackData ? (feedbackData.correct ? 'green' : 'red') : '#ddd'}`,
            borderRadius: '4px',
            width: '300px'
          }}
        />
        <button
          onClick={() => handleSubmitAnswer(questionId, question.answer)}
          disabled={!!feedbackData || !userAnswers[questionId]}
          style={{
            marginLeft: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: feedbackData || !userAnswers[questionId] ? 'default' : 'pointer'
          }}>
          Check
        </button>
        {feedbackData && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {feedbackData.correct ? (
              <span style={{ color: 'green' }}>✓ Correct!</span>
            ) : (
              <span style={{ color: 'red' }}>✗ Incorrect. Answer: <strong>{feedbackData.correctAnswer}</strong></span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!examData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Exam not found</h1>
        <p>The requested exam part could not be found.</p>
        <Link href="/niveles">
          <button style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Back to Levels
          </button>
        </Link>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining();

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>{examData.title}</h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>{examData.instructions}</p>
      </div>

      {examData.timeLimit && (
        <div style={{
          textAlign: "right",
          fontSize: "0.95rem",
          fontWeight: "bold",
          color: timeRemaining <= 60 ? "red" : "#333",
          marginBottom: "1rem"
        }}>
          ⏳ Time remaining: {formatTime(timeRemaining)}
        </div>
      )}

      {examData.passageTitle && (
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{examData.passageTitle}</h2>
      )}

      {examData.passageDescription && (
        <p style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '1rem', color: '#666' }}>
          {examData.passageDescription}
        </p>
      )}

      {examData.passage && (
        <section style={{ background: "#fefefe", padding: "1rem", borderRadius: "6px", lineHeight: 1.6, marginBottom: "2rem", boxShadow: "0 0 4px rgba(0,0,0,0.1)" }}>
          {examData.passageTitle && <h3>Reading Text</h3>}
          {examData.passage.split('\n\n').map((paragraph, index) => (
            <p key={index} dangerouslySetInnerHTML={{ 
              __html: paragraph.replace(/\*\*\((\d+)\)\*\*/g, '<strong>($1)</strong>')
                               .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            }} />
          ))}
        </section>
      )}

      {examData.passages && (
        <section style={{ background: "#f0f8ff", padding: "1rem", borderRadius: "8px", lineHeight: "1.6", marginBottom: "2rem" }}>
          <h3>Reading Passages</h3>
          {Object.entries(examData.passages).map(([key, text]) => (
            <p key={key}><strong>{key}</strong> {text}</p>
          ))}
        </section>
      )}

      <div style={{ marginBottom: '2rem' }}>
        {examData.type === 'multiple-choice-cloze' && examData.questions.map(renderMultipleChoiceQuestion)}
        {examData.type === 'reading-comprehension' && examData.questions.map(renderMultipleChoiceQuestion)}
        {examData.type === 'open-cloze' && examData.questions.map(renderOpenClozeeQuestion)}
        {examData.type === 'word-formation' && examData.questions.map(renderWordFormationQuestion)}
        {examData.type === 'key-word-transformation' && examData.questions.map(renderKeyWordTransformation)}
        
        {examData.type === 'gapped-text' && (
          <div>
            <h3>Choose from options A-G:</h3>
            <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              {Object.entries(examData.options || {}).map(([key, text]) => (
                <div key={key} style={{ marginBottom: '1rem', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}>
                  <strong>{key}.</strong> {text}
                </div>
              ))}
            </div>
            <h3>Questions:</h3>
            {Object.entries(examData.correctAnswers || {}).map(([questionNum, correctAnswer]) => {
              const selected = selectedAnswers[questionNum];
              const feedbackData = feedback[questionNum];
              
              return (
                <div key={questionNum} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f0f0f0' }}>
                  <p><strong>({questionNum})</strong> Choose the correct option for gap {questionNum}</p>
                  <select
                    value={selected || ''}
                    onChange={(e) => {
                      handleSelectOption(questionNum, e.target.value);
                      handleSubmitAnswer(questionNum, correctAnswer);
                    }}
                    disabled={!!feedbackData}
                    style={{ 
                      padding: '0.5rem', 
                      width: '200px',
                      fontSize: '1rem',
                      backgroundColor: feedbackData ? (feedbackData.correct ? '#d4edda' : '#f8d7da') : 'white'
                    }}
                  >
                    <option value="">-- Select an option --</option>
                    {Object.keys(examData.options || {}).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {feedbackData && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      {feedbackData.correct ? (
                        <span style={{ color: 'green' }}>✓ Correct!</span>
                      ) : (
                        <span style={{ color: 'red' }}>✗ Incorrect. Answer: <strong>{feedbackData.correctAnswer}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {examData.type === 'multiple-matching' && (
          <div>
            <h3>Questions:</h3>
            {Object.entries(examData.questions || {}).map(([questionNum, questionText]) => {
              const selected = selectedAnswers[questionNum];
              const feedbackData = feedback[questionNum];
              const correctAnswer = examData.correctAnswers?.[questionNum];
              
              return (
                <div key={questionNum} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <p><strong>{questionNum}.</strong> Which section {questionText}</p>
                  <div>
                    {['A', 'B', 'C', 'D'].map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          handleSelectOption(questionNum, option);
                          handleSubmitAnswer(questionNum, correctAnswer);
                        }}
                        disabled={!!feedbackData}
                        style={{
                          margin: '0.25rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: selected === option ? (feedbackData?.correct ? '#d4edda' : '#f8d7da') : '#e0e0e0',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          cursor: feedbackData ? 'default' : 'pointer'
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {feedbackData && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      {feedbackData.correct ? (
                        <span style={{ color: 'green' }}>✓ Correct!</span>
                      ) : (
                        <span style={{ color: 'red' }}>✗ Incorrect. Answer: <strong>{feedbackData.correctAnswer}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href={`/niveles/${level}/${exam}`}>
          <button style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', marginRight: '1rem' }}>
            Back to Exam
          </button>
        </Link>
        {/* Add navigation to next part if available */}
        <Link href={`/niveles/${level}/${exam}/part-${parseInt(part.split('-')[1]) + 1}`}>
          <button style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Next Part
          </button>
        </Link>
      </div>
    </main>
  );
}