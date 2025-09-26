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
const PART_ID = 'part-17';
const TOTAL_TIME = 90 * 60;

const discussionTopics = [
  {
    id: 1,
    title: "Environmental Issues",
    description: "Discuss the environmental challenges shown in the image and their potential solutions.",
    questions: [
      "What environmental problems can you see in the image?",
      "How do these issues affect people's daily lives?",
      "What solutions would you propose to address these problems?"
    ]
  },
  {
    id: 2,
    title: "Urban Development",
    description: "Talk about the urban planning and development aspects visible in the image.",
    questions: [
      "What aspects of urban planning are evident in this image?",
      "How has urbanization affected the area shown?",
      "What improvements would you suggest for better urban living?"
    ]
  },
  {
    id: 3,
    title: "Social Impact",
    description: "Consider the social implications and community aspects shown in the image.",
    questions: [
      "How do these developments affect the local community?",
      "What social challenges might arise from this situation?",
      "How could the community work together to improve things?"
    ]
  },
  {
    id: 4,
    title: "Economic Factors",
    description: "Discuss the economic implications and business aspects visible in the image.",
    questions: [
      "What economic opportunities do you see in this image?",
      "How might these developments affect local businesses?",
      "What economic benefits or challenges might arise?"
    ]
  },
  {
    id: 5,
    title: "Future Planning",
    description: "Consider the long-term implications and future planning for the area.",
    questions: [
      "What do you think this area will look like in 10 years?",
      "What long-term planning would you recommend?",
      "How can we ensure sustainable development here?"
    ]
  }
];

export default function Part17Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [showResult, setShowResult] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [currentTopic, setCurrentTopic] = useState(1);
  const [discussionNotes, setDiscussionNotes] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
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
    const savedNotes = {};
    discussionTopics.forEach(topic => {
      const notes = stored[topic.id];
      if (notes) {
        savedNotes[topic.id] = notes;
      }
    });
    setDiscussionNotes(savedNotes);
  }, [answers]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setDiscussionNotes(prev => ({
          ...prev,
          [currentTopic]: transcript
        }));
        updateAnswer(EXAM_ID, PART_ID, currentTopic, transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognition);
    }
  }, [currentTopic, updateAnswer]);

  const handleNotesChange = (topicId, notes) => {
    setDiscussionNotes(prev => ({
      ...prev,
      [topicId]: notes
    }));
    updateAnswer(EXAM_ID, PART_ID, topicId, notes);
  };

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
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

  // Función para navegar a un tema específico
  const handleNavigateToTopic = (topicId) => {
    setCurrentTopic(topicId);
    const element = document.getElementById(`topic-${topicId}`);
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
      'part-13': 'Listening - Part 1',
      'part-14': 'Speaking - Part 1',
      'part-15': 'Listening - Part 1',
      'part-16': 'Speaking - Part 2',
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

  const total = discussionTopics.length;
  const answered = Object.keys(discussionNotes).length;
  const progress = Math.round((answered / total) * 100);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.speaking, 0);

  return (
    <div className="shell">
      <ExamExitWarning />
      
      <div className="exam-header">
        <div className="header">
          <h1>Part 17: Speaking - General discussion</h1>
          <p>Cambridge C1 Advanced - Speaking</p>
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
            questions={discussionTopics}
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
          <span className="timer-text">Time remaining for Speaking: {formatTime(timeRemaining)}</span>
        </div>

        {/* Instructions with modern styling */}
        <div className="instructions-section">
          <p className="instructions-text">
            In this part of the test, you will have a discussion with your partner about the image shown below. You need to discuss the various topics and themes visible in the image, giving your opinions and exchanging ideas. The discussion should last about 4 minutes.
          </p>
        </div>

        {/* Image section */}
        <div className="image-section">
          <h2>Discussion Image</h2>
          <div className="image-container">
            <img 
              src="/images/speaking-part2-discussion.jpg" 
              alt="Discussion image showing various urban and environmental themes"
              className="discussion-image"
            />
            <div className="image-caption">
              <p>Look at this image and discuss the various topics and themes you can see with your partner.</p>
            </div>
          </div>
        </div>

        {/* Discussion topics */}
        <div className="topics-container">
          <h2>Discussion Topics</h2>
          <p className="topics-intro">
            Use these topics to guide your discussion. You don't need to cover all topics, but try to have a natural conversation about the themes that interest you most.
          </p>

          {discussionTopics.map((topic) => {
            const notes = discussionNotes[topic.id] || '';
            const hasNotes = notes.trim().length > 0;

            return (
              <div key={topic.id} className="topic" id={`topic-${topic.id}`}>
                <div className="topic-header">
                  <h3>Topic {topic.id}: {topic.title}</h3>
                  {hasNotes && (
                    <div className="topic-status">
                      <span className="status-badge answered">✅ Discussed</span>
                    </div>
                  )}
                </div>
                
                <div className="topic-content">
                  <div className="topic-description">
                    <p><strong>Description:</strong> {topic.description}</p>
                  </div>
                  
                  <div className="discussion-questions">
                    <h4>💬 Discussion Questions:</h4>
                    <ul>
                      {topic.questions.map((question, idx) => (
                        <li key={idx}>{question}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="notes-section">
                    <div className="notes-controls">
                      <button
                        className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!recognition}
                      >
                        {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                      </button>
                      <span className="recording-status">
                        {isRecording ? '🔴 Recording...' : '⏸️ Not recording'}
                      </span>
                    </div>

                    <textarea
                      className="notes-textarea"
                      placeholder="Record your discussion notes here or type them manually..."
                      value={notes}
                      onChange={(e) => handleNotesChange(topic.id, e.target.value)}
                      rows={4}
                    />

                    {notes && (
                      <div className="notes-feedback">
                        <div className="notes-stats">
                          <span>Words: {notes.split(' ').filter(word => word.length > 0).length}</span>
                          <span>Characters: {notes.length}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {hasNotes && (
                    <div className="topic-feedback">
                      <div className="feedback-actions">
                        <button
                          className={`btn ${showExplanation[topic.id] ? 'btn-info' : 'btn-secondary'}`}
                          onClick={() => setShowExplanation(prev => ({ ...prev, [topic.id]: !prev[topic.id] }))}
                        >
                          📘 {showExplanation[topic.id] ? 'Ocultar consejos' : 'Ver consejos de discusión'}
                        </button>
                      </div>

                      {showExplanation[topic.id] && (
                        <div className="explanation">
                          <div className="explanation-header">
                            <h4>📖 Consejos para la Discusión</h4>
                            <div className="explanation-status">
                              <span className="status-info">💬 Tus notas están guardadas</span>
                            </div>
                          </div>
                          
                          <div className="explanation-content">
                            <div className="discussion-tips">
                              <p><strong>Consejos para una buena discusión:</strong></p>
                              <ul>
                                <li>Expresa tu opinión claramente usando "I think...", "In my opinion...", "I believe..."</li>
                                <li>Pide la opinión de tu compañero: "What do you think?", "Do you agree?", "How do you feel about...?"</li>
                                <li>Da ejemplos específicos para apoyar tus puntos</li>
                                <li>Usa conectores como "However", "On the other hand", "Furthermore"</li>
                                <li>Mantén un tono conversacional y natural</li>
                              </ul>
                            </div>
                            
                            <div className="learning-tip">
                              <p><strong>💡 Consejo:</strong> En las discusiones, es importante mostrar que puedes intercambiar ideas de manera fluida y respetuosa.</p>
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
          <h3>Your progress: {answered} / {total} topics discussed</h3>
          <p className="score-info">
            🎯 Complete your discussion notes to finish this part of the exam.
          </p>
          {answered === total && (
            <p className="score-passed">✅ You have completed the discussion topics!</p>
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
              className={`nav-part-btn ${partNum === 17 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-16" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/resultado" className="btn btn-primary">
            Finish Exam ➡️
          </Link>
        </div>
      </div>

      <QuickNavigation 
        questions={discussionTopics}
        answers={partAnswers}
        currentQuestion={currentTopic}
        onNavigate={handleNavigateToTopic}
        sectionName={`${getSectionName(PART_ID)}`}
      />
    </div>
  );
}