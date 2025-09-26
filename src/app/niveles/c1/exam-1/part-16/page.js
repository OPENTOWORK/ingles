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
const PART_ID = 'part-16';
const TOTAL_TIME = 90 * 60;

export default function Part16Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const partAnswers = answers?.[EXAM_ID]?.[PART_ID] || {};
  const initializedRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const instructions = [
    "Now, in this part of the test you're going to do something together. Here are some pictures of people in different situations.",
    "First, I'd like you to look at pictures A and B and talk together about how common these situations are in your country.",
    "You have about a minute for this, so don't worry if I interrupt you.",
    "Now look at all the pictures. I'd like you to imagine that a television documentary is being produced on working in the food industry.",
    "These pictures show some of the issues that are being considered.",
    "Talk together about the different issues related to working in the food industry that these pictures show.",
    "Then decide which issue might stimulate most interest.",
    "You have about three minutes to talk about this."
  ];

  useEffect(() => {
    if (!initializedRef.current && !globalStart) {
      setGlobalStart(new Date());
      initializedRef.current = true;
    }
  }, [setGlobalStart]);

  useEffect(() => {
    const savedResponse = answers?.[EXAM_ID]?.[PART_ID]?.response || "";
    if (savedResponse && !response) {
      setResponse(savedResponse);
    }
  }, [answers?.[EXAM_ID]?.[PART_ID]?.response, response]);

  useEffect(() => {
    if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
      const rec = new webkitSpeechRecognition();
      rec.lang = 'en-GB';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setResponse(transcript);
        evaluateAnswer(transcript);
        setRecording(false);
      };
      rec.onerror = () => {
        alert("There was an error with voice recognition.");
        setRecording(false);
      };
      setRecognition(rec);
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (response) {
      updateAnswer(EXAM_ID, PART_ID, 'response', response);
      updateAnswer(EXAM_ID, PART_ID, 'score', response.trim() ? 1 : 0);
    }
  }, [response]);

  const speakInstructions = () => {
    const text = instructions.join(" ");
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-GB';
    synth.speak(utter);

    // Mostrar imagen
    setShowImage(true);

    // Empezar grabación automáticamente
    startRecording();

    // Detener grabación después de 60 segundos
    timeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 60000);
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setRecording(true);
    setResponse("");
    setFeedback(null);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current && recording) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  const evaluateAnswer = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("restaurant") || lower.includes("kitchen") || lower.includes("chef")) {
      setFeedback({ correct: true, message: "✔ Good! You mentioned relevant vocabulary." });
    } else if (text.length < 10) {
      setFeedback({ correct: false, message: "✘ Please speak in full sentences and expand your ideas." });
    } else {
      setFeedback({ correct: false, message: "✘ Try to include vocabulary related to food industry or teamwork." });
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
          <h1>Part 16: Speaking - Collaborative Task</h1>
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
            questions={[{ id: 1 }]}
            answers={partAnswers}
            showResult={{}}
            sectionName={`${getSectionName(PART_ID)}`}
          />
        </div>
      </div>

      <div className="exam-content">
        {/* Progress bar with modern styling */}
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Speaking Progress</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: response ? '100%' : '0%' }}></div>
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
            Look at the image below. Then press play to hear the instructions and respond using your voice.
            You will be asked to discuss different issues related to working in the food industry.
          </p>
        </div>

        {/* Imagen solo visible después de pulsar Play */}
        {showImage && (
          <div className="reading-text-modern">
            <div className="text-content">
              <h2>Speaking Task Images</h2>
              <img
                src="/images/imagen-speaking-c1-exam1.jpg"
                alt="Speaking Part 2 - Food Industry"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}
              />
            </div>
          </div>
        )}

        <div className="questions-section-header">
          <h2>Speaking Task</h2>
        </div>

        <div className="questions-container">
          <div className="question" id="question-1">
            <div className="question-header">
              <h3>Collaborative Task</h3>
            </div>
            
            <div className="question-content">
              <div className="speaking-controls" style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                <button onClick={speakInstructions} className="btn btn-primary">
                  🔊 Play Instructions
                </button>
                <button
                  onClick={startRecording}
                  disabled={recording || !showImage}
                  className="btn btn-secondary"
                >
                  🎤 {recording ? "Listening..." : "Answer with your voice"}
                </button>
              </div>

              {response && (
                <div className="speaking-response">
                  <h4>Your response:</h4>
                  <p style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    border: '1px solid #dee2e6',
                    marginBottom: '1rem'
                  }}>
                    {response}
                  </p>
                  {feedback && (
                    <div style={{
                      color: feedback.correct ? "#155724" : "#721c24",
                      backgroundColor: feedback.correct ? "#d4edda" : "#f8d7da",
                      border: `1px solid ${feedback.correct ? "#c3e6cb" : "#f5c6cb"}`,
                      borderRadius: "6px",
                      padding: "0.5rem",
                      marginTop: "0.5rem"
                    }}>
                      {feedback.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
              className={`nav-part-btn ${partNum === 16 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-15" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-17" className="btn btn-primary">
            Next ➡️
          </Link>
        </div>
      </div>

      <QuickNavigation 
        questions={[{ id: 1 }]}
        answers={partAnswers}
        currentQuestion={currentQuestion}
        onNavigate={handleNavigateToQuestion}
        sectionName={`${getSectionName(PART_ID)}`}
      />
    </div>
  );
}