'use client';

import { useExam } from '@/context/ExamContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import ExamExitWarning from '@/components/ExamExitWarning';
import ExamTimer from '@/components/ExamTimer';
import AdvancedProgress from '@/components/AdvancedProgress';
import QuickNavigation from '@/components/QuickNavigation';
import EnhancedFeedback from '@/components/EnhancedFeedback';
import '@/styles/quick-exam-navigation.css';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-5';
const TOTAL_TIME = 90 * 60;

const questions = [
  {
    id: 31,
    question: "In the first paragraph, what is Caitlin's main point about the island?",
    options: {
      A: "It can be dangerous to try to cross from the mainland.",
      B: "It is much smaller than it looks from the mainland.",
      C: "It is only completely cut off at certain times.",
      D: "It can be a difficult place for people to live in."
    },
    answer: "C",
    explanation: "The text states that 'when there's a high tide and the water rises a half a metre or so above the road and nothing can pass until the tide goes out again a few hours later, then you know it's an island.' This shows the island is only completely cut off at certain times (during high tide)."
  },
  {
    id: 32,
    question: "What does Caitlin suggest about her father?",
    options: {
      A: "His writing prevents him from doing things he wants to with his family.",
      B: "His initial reaction to his son's request is different from usual.",
      C: "His true feelings are easily hidden from his daughter.",
      D: "His son's arrival is one event he will take time off for."
    },
    answer: "B",
    explanation: "The text mentions that despite 'typical sighs and moans', Caitlin 'could tell by the sparkle in his eyes that he was really looking forward to seeing Dominic.' This suggests his initial reaction was different from his usual complaints."
  },
  {
    id: 33,
    question: "Caitlin emphasises her feelings of discomfort because she",
    options: {
      A: "is embarrassed that she doesn't understand what her brother is talking about.",
      B: "feels confused about why she can't relate to her brother any more.",
      C: "is upset by the unexpected change in her brother's behaviour.",
      D: "feels foolish that her brother's attention is so important to her."
    },
    answer: "C",
    explanation: "The text describes Dominic's behavior as 'jabbering like a mad thing' and mentions that Caitlin felt 'uncomfortable' because 'someone you like, someone close to you, suddenly starts acting like a complete idiot.' This shows she was upset by the unexpected change in his behavior."
  },
  {
    id: 34,
    question: "In the fourth paragraph, what is Caitlin's purpose in describing the island?",
    options: {
      A: "To express her positive feelings about it",
      B: "To explain how the road was built",
      C: "To illustrate what kind of weather was usual",
      D: "To describe her journey home"
    },
    answer: "D",
    explanation: "The fourth paragraph describes the journey back to the island: 'As we approached the island on that Friday afternoon' and describes the Stand (the causeway) and the visual details of their approach home."
  },
  {
    id: 35,
    question: "In 'because of that' in line 31, 'that' refers to the fact that",
    options: {
      A: "locals think it is odd to walk anywhere.",
      B: "it is easier for people to take the bus than walk.",
      C: "people have everything they need on the island.",
      D: "there is nowhere in particular to walk to from the island."
    },
    answer: "B",
    explanation: "The text states 'If they're going to Moulton they tend to take the bus' and then says 'So islanders don't walk because of that.' The 'that' refers to the fact that it's easier to take the bus than walk."
  },
  {
    id: 36,
    question: "What do we learn about Caitlin's reactions to the boy?",
    options: {
      A: "She felt his air of confidence contrasted with his physical appearance.",
      B: "She was able to come up with a reason for him being there.",
      C: "She realised her first impression of him was inaccurate.",
      D: "She thought she had seen him somewhere before."
    },
    answer: "A",
    explanation: "The text describes the boy as having 'something sleek about him, a graceful strength that showed in his balance, the way he held himself, the way he walked' which contrasts with his physical appearance being 'on the small side' and 'not exactly muscular'."
  }
];

export default function Part5Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [showResult, setShowResult] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const partAnswers = answers?.[EXAM_ID]?.[PART_ID] || {};
  const initializedRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initializedRef.current && !globalStart) {
      setGlobalStart(new Date());
      initializedRef.current = true;
    }
  }, [setGlobalStart]);

  useEffect(() => {
    const stored = answers?.[EXAM_ID]?.[PART_ID] || {};
    setSelectedAnswers(stored);
    const prefeedback = {};
    questions.forEach(q => {
      const selected = stored[q.id];
      if (selected) {
        prefeedback[q.id] = {
          correct: selected === q.answer,
          answer: q.answer
        };
      }
    });
    setShowResult(prefeedback);
  }, [answers?.[EXAM_ID]?.[PART_ID]]);

  const handleSelect = (qId, option) => {
    if (selectedAnswers[qId]) return;
    const updated = { ...selectedAnswers, [qId]: option };
    setSelectedAnswers(updated);
    updateAnswer(EXAM_ID, PART_ID, qId, option);
    
    const correct = option === questions.find(q => q.id === qId)?.answer;
    setShowResult(prev => ({
      ...prev,
      [qId]: {
        correct,
        answer: questions.find(q => q.id === qId)?.answer
      }
    }));
  };

  const handleBackToIndex = (e) => {
    e.preventDefault();
    const isExamRoute = /^\/niveles\/c1\/exam-1\/part-\d+$/.test(pathname);
    if (isExamRoute && globalStart) {
      const confirmLeave = window.confirm(
        "⚠️ Estás a punto de salir del examen.\n\nPerderás todo tu progreso si continúas.\n¿Deseas salir?"
      );
      if (!confirmLeave) return;
      clearAllAnswers();
    }
    router.push("/niveles/c1");
  };

  // Función para navegar a una pregunta específica
  const handleNavigateToQuestion = (questionId) => {
    setCurrentQuestion(questionId);
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Función para obtener el nombre de la sección
  function getSectionName(partId) {
    const sectionNames = {
      'part-1': 'Reading - Part 1',
      'part-2': 'Reading - Part 2',
      'part-3': 'Reading - Part 3',
      'part-4': 'Reading - Part 4',
      'part-5': 'Reading - Part 5',
      'part-6': 'Reading - Part 6',
      'part-7': 'Reading - Part 7',
      'part-8': 'Use of English - Part 1',
      'part-9': 'Use of English - Part 2',
      'part-10': 'Use of English - Part 3',
      'part-11': 'Use of English - Part 4',
      'part-12': 'Writing - Part 1',
      'part-13': 'Writing - Part 2',
      'part-14': 'Writing - Part 2',
      'part-15': 'Listening - Part 1',
      'part-16': 'Listening - Part 2',
      'part-17': 'Speaking - Part 1'
    };
    return sectionNames[partId] || 'Unknown Section';
  }

  // Función para obtener la siguiente parte
  const getNextPart = (currentPart) => {
    const partNumbers = {
      'part-1': 1, 'part-2': 2, 'part-3': 3, 'part-4': 4, 'part-5': 5,
      'part-6': 6, 'part-7': 7, 'part-8': 8, 'part-9': 9, 'part-10': 10,
      'part-11': 11, 'part-12': 12, 'part-13': 13, 'part-14': 14, 'part-15': 15,
      'part-16': 16, 'part-17': 17
    };
    const currentNum = partNumbers[currentPart];
    const nextNum = currentNum + 1;
    if (nextNum <= 17) {
      return `part-${nextNum}`;
    }
    return 'resultado';
  };

  // Función para obtener la parte anterior
  const getPrevPart = (currentPart) => {
    const partNumbers = {
      'part-1': 1, 'part-2': 2, 'part-3': 3, 'part-4': 4, 'part-5': 5,
      'part-6': 6, 'part-7': 7, 'part-8': 8, 'part-9': 9, 'part-10': 10,
      'part-11': 11, 'part-12': 12, 'part-13': 13, 'part-14': 14, 'part-15': 15,
      'part-16': 16, 'part-17': 17
    };
    const currentNum = partNumbers[currentPart];
    const prevNum = currentNum - 1;
    if (prevNum >= 1) {
      return `part-${prevNum}`;
    }
    return null;
  };

  const total = questions.length;
  const answered = Object.keys(selectedAnswers).length;
  const score = questions.filter(q => selectedAnswers[q.id] === q.answer).length;
  const required = Math.ceil(total * 0.6);
  const passed = score >= required;
  const progress = Math.round((answered / total) * 100);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.reading, 0);

  return (
    <div className="shell">
      <ExamExitWarning />
      
      <div className="exam-header">
        <div className="header">
          <h1>Part 5: Use of english - Multiple Choice Reading</h1>
          <p>Cambridge C1 Advanced - Reading</p>
        </div>
        
        <div className="exam-controls">
          <ExamTimer 
            totalTime={TOTAL_TIME}
            sectionName={`${getSectionName(PART_ID)}`}
            onTimeUp={() => {
              alert('¡Tiempo agotado! Serás redirigido al siguiente examen.');
              const nextPart = getNextPart(PART_ID);
              if (nextPart === 'resultado') {
                router.push(`/niveles/c1/exam-1/${nextPart}`);
              } else {
                router.push(`/niveles/c1/exam-1/${nextPart}`);
              }
            }}
            onWarning={(timeLeft) => {
              if (timeLeft <= 300) {
                alert(`¡Atención! Te quedan ${Math.floor(timeLeft / 60)} minutos.`);
              }
            }}
          />
          
          <AdvancedProgress 
            questions={questions}
            answers={partAnswers}
            showResult={showResult}
            sectionName={`${getSectionName(PART_ID)}`}
          />
        </div>
      </div>

      <div className="exam-content">
        {/* Progress bar with modern styling */}
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Progress: {progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timer with modern styling */}
        <div className={`timer-section ${timeRemaining <= 60 ? 'timer-warning' : ''}`}>
          <span className="timer-icon">⏳</span>
          <span className="timer-text">Time remaining for Parts 1–7: {formatTime(timeRemaining)}</span>
        </div>

        {/* Instructions with modern styling */}
        <div className="instructions-section">
          <p className="instructions-text">
            Read the text and answer the multiple-choice questions below. Choose the option (A, B, C, or D) that best fits.
          </p>
        </div>

        {/* Reading text with modern styling */}
        <div className="reading-text-modern">
          <div className="text-content">
            <h2>Reading Text</h2>
            <p>We live on the island of Hale. It's about four kilometres long and two kilometres wide at its broadest point, and it's joined to the mainland by a causeway called the Stand – a narrow road built across the mouth of the river which separates us from the rest of the country. Most of the time you wouldn't know we're on an island because the river mouth between us and the mainland is just a vast stretch of tall grasses and brown mud. But when there's a high tide and the water rises a half a metre or so above the road and nothing can pass until the tide goes out again a few hours later, then you know it's an island.</p>
            <p>We were on our way back from the mainland. My older brother, Dominic, had just finished his first year at university in a town 150 km away. Dominic's train was due in at five and he'd asked for a lift back from the station. Now, Dad normally hates being disturbed when he's writing (which is just about all the time), and he also hates having to go anywhere, but despite the typical sighs and moans – why can't he get a taxi? what's wrong with the bus? – I could tell by the sparkle in his eyes that he was really looking forward to seeing Dominic.</p>
            <p>So, anyway, Dad and I had driven to the mainland and picked up Dominic from the station. He had been talking non-stop from the moment he'd slung his rucksack in the boot and got in the car. University this, university that, writers, books, parties, people, money, gigs…. And when I say talking, I don't mean talking as in having a conversation, I mean talking as in jabbering like a mad thing. I didn't like it … the way he spoke and waved his hands around as if he was some kind of intellectual or something. It was embarrassing. It made me feel uncomfortable – that kind of discomfort you feel when someone you like, someone close to you, suddenly starts acting like a complete idiot. And I didn't like the way he was ignoring me, either. For all the attention I was getting I might as well not have been there. I felt a stranger in my own car.</p>
            <p>As we approached the island on that Friday afternoon, the tide was low and the Stand welcomed us home, stretched out before us, clear and dry, beautifully hazy in the heat – a raised strip of grey concrete bound by white railings and a low footpath on either side, with rough cobbled banks leading down to the water. Beyond the railings, the water was glinting with that wonderful silver light we sometimes get here in the late afternoon which lazes through to the early evening.</p>
            <p>We were about halfway across when I saw the boy. My first thought was how odd it was to see someone walking on the Stand. You don't often see people walking around here. Between Hale and Moulton (the nearest town about thirty kilometres away on the mainland), there's nothing but small cottages, farmland, heathland and a couple of hills. So islanders don't walk because of that. If they're going to Moulton they tend to take the bus. So the only pedestrians you're likely to see around here are walkers or bird-watchers. But even from a distance I could tell that the figure ahead didn't fit into either of these categories. I wasn't sure how I knew, I just did.</p>
            <p>As we drew closer, he became clearer. He was actually a young man rather than a boy. Although he was on the small side, he wasn't as slight as I'd first thought. He wasn't exactly muscular, but he wasn't weedy-looking either. It's hard to explain. There was just something sleek about him, a graceful strength that showed in his balance, the way he held himself, the way he walked…</p>
          </div>
        </div>

        <div className="questions-section-header">
          <h2>Questions</h2>
        </div>

        <div className="questions-container">
          {questions.map((q) => {
            const selected = selectedAnswers[q.id];
            const correct = q.answer;
            const wasAnswered = !!selected;

            return (
              <div key={q.id} className="question" id={`question-${q.id}`}>
                <div className="question-header">
                  <h3>Question {q.id}</h3>
                  {wasAnswered && (
                    <div className="question-status">
                      <span className="status-badge answered">✅ Respondida</span>
                    </div>
                  )}
                </div>
                
                <div className="question-content">
                  <p><strong>{q.id}.</strong> {q.question}</p>
                  
                  <div className="options">
                    {Object.entries(q.options).map(([key, text]) => {
                      const isSelected = selected === key;
                      const isCorrect = key === correct;

                      return (
                        <label key={key} className={`option ${isSelected ? 'selected' : ''} ${wasAnswered ? (isCorrect ? 'correct' : (isSelected ? 'incorrect' : '')) : ''}`}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={key}
                            checked={isSelected}
                            onChange={() => handleSelect(q.id, key)}
                            disabled={wasAnswered}
                          />
                          <span className="option-letter">{key}</span>
                          <span className="option-text">{text}</span>
                          {wasAnswered && isCorrect && (
                            <span className="result-indicator correct">✓</span>
                          )}
                          {wasAnswered && isSelected && !isCorrect && (
                            <span className="result-indicator incorrect">✗</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {selected && (
                    <div className="question-feedback">
                      <div className="feedback-actions">
                        <button
                          className={`btn ${showExplanation[q.id] ? 'btn-info' : 'btn-secondary'}`}
                          onClick={() => setShowExplanation(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        >
                          📘 {showExplanation[q.id] ? 'Ocultar explicación' : 'Obtener explicación'}
                        </button>
                      </div>

                      {showExplanation[q.id] && (
                        <div className="explanation">
                          <div className="explanation-header">
                            <h4>📖 Explicación Detallada</h4>
                            <div className="explanation-status">
                              {selected === correct ? (
                                <span className="status-correct">✅ Correcto</span>
                              ) : (
                                <span className="status-incorrect">❌ Incorrecto</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="explanation-content">
                            <div className="answer-section">
                              <p><strong>Tu respuesta:</strong> <span className="user-answer">{selected}</span></p>
                              <p><strong>Respuesta correcta:</strong> <span className="correct-answer">{correct}</span></p>
                            </div>
                            
                            <div className="explanation-text">
                              <p><strong>Explicación:</strong></p>
                              <p>{q.explanation}</p>
                            </div>
                            
                            <div className="learning-tip">
                              <p><strong>💡 Consejo:</strong> En ejercicios de comprensión lectora, lee cuidadosamente el texto y busca evidencia específica que respalde tu respuesta.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="score-section">
          <h3>Your score: {score} / {total}</h3>
          <p className="score-info">
            🎯 You need <strong>{required}</strong> correct answers to pass.
          </p>
          {answered === total && (
            passed ? (
              <p className="score-passed">✅ You passed the test!</p>
            ) : (
              <p className="score-failed">❌ You did not pass. Try again to improve your score.</p>
            )
          )}
        </div>
      </div>

      {/* Navegación rápida - 17 botones para todas las partes */}
      <div className="quick-exam-navigation">
        <div className="nav-header">
          <h3>📚 Navegación Rápida del Examen</h3>
        </div>
        <div className="nav-buttons-grid">
          {Array.from({ length: 17 }, (_, i) => i + 1).map(partNum => (
            <Link 
              key={partNum} 
              href={`/niveles/c1/exam-1/part-${partNum}`}
              className={`nav-part-btn ${partNum === 5 ? 'current' : ''}`}
            >
              Part {partNum}
            </Link>
          ))}
        </div>
      </div>

      <div className="exam-navigation">
        <div className="nav-buttons">
          <button onClick={handleBackToIndex} className="btn btn-secondary">
            ⬅ Back to C1 Overview
          </button>
          <Link href="/niveles/c1/exam-1/part-4" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-6" className="btn btn-primary">
            Next ➡️
          </Link>
        </div>
      </div>

      <QuickNavigation 
        questions={questions}
        answers={partAnswers}
        currentQuestion={currentQuestion}
        onNavigate={handleNavigateToQuestion}
        sectionName={`${getSectionName(PART_ID)}`}
      />
    </div>
  );
}