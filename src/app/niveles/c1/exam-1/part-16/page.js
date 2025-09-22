'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

export default function Part16() {
  const part = 'part-16';
  const { answers, updateAnswer } = useExam();

  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState(() => answers?.[part]?.response || "");
  const [feedback, setFeedback] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [showCard, setShowCard] = useState(false);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const instructions = [
    "Now, in this part of the test you’re each going to talk on your own for about two minutes.",
    "You need to listen while your partner is speaking because you’ll be asked to comment afterwards.",
    "So, Candidate A, I’m going to give you a card with a question written on it and I’d like you to tell us what you think.",
    "There are also some ideas on the card for you to use if you like.",
    "All right? Here is your card."
  ];

  const taskCard = {
    question: "Which is preferable, making your own decisions or asking others for advice?",
    topics: [
      "in education",
      "at work",
      "at different ages"
    ]
  };

  useEffect(() => {
    if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
      const rec = new webkitSpeechRecognition();
      rec.lang = 'en-US';
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
      updateAnswer(part, 'response', response);
      updateAnswer(part, 'score', response.trim() ? 1 : 0);
    }
  }, [response]);

  const speakInstructions = () => {
    const text = instructions.join(" ");
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-GB';
    synth.speak(utter);

    // Mostrar card
    setShowCard(true);

    // Empezar grabación automáticamente
    startRecording();

    // Detener grabación después de 2 minutos (120000 ms)
    timeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 120000);
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
    if (lower.includes("depends") || lower.includes("age") || lower.includes("situation")) {
      setFeedback({ correct: true, message: "✔ Good reasoning! You included context in your answer." });
    } else if (text.length < 15) {
      setFeedback({ correct: false, message: "✘ Try to develop your ideas more." });
    } else {
      setFeedback({ correct: false, message: "✘ Mention specific areas like education or work." });
    }
  };

  return (
    <main style={{
      padding: "2rem",
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#e8f4ff",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center" }}>Part 16: Speaking – Long Turn (Decisions)</h1>

      <p style={{
        maxWidth: "750px",
        margin: "0 auto",
        fontSize: "1rem",
        color: "#333",
        textAlign: "center"
      }}>
        Press play to hear your instructions. Then answer the question below using your voice.
      </p>

      {/* Botón de instrucciones */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button onClick={speakInstructions} style={buttonStyle}>
          🔊 Play Instructions
        </button>
      </div>

      {/* Task Card (visible tras instrucciones) */}
      {showCard && (
        <section style={{
          margin: "2rem auto",
          maxWidth: "700px",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3>Task 1(a)</h3>
          <p><strong>{taskCard.question}</strong></p>
          <ul>
            {taskCard.topics.map((topic, idx) => (
              <li key={idx}>• {topic}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Grabación y respuesta */}
      <section style={{ margin: "2rem auto", maxWidth: "700px", textAlign: "center" }}>
        <button
          onClick={startRecording}
          disabled={recording || !showCard}
          style={buttonStyle}
        >
          🎤 {recording ? "Listening..." : "Answer with your voice"}
        </button>

        {response && (
          <div style={{ marginTop: "1.2rem" }}>
            <p><strong>Your response:</strong> {response}</p>
            {feedback && (
              <p style={{
                color: feedback.correct ? "#155724" : "#721c24",
                backgroundColor: feedback.correct ? "#d4edda" : "#f8d7da",
                border: `1px solid ${feedback.correct ? "#c3e6cb" : "#f5c6cb"}`,
                borderRadius: "6px",
                padding: "0.5rem",
                marginTop: "0.5rem"
              }}>
                {feedback.message}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Navegación */}
      <div style={{
        marginTop: "3rem",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <Link href="/niveles/c1/exam-1/part-15">⬅ Back to Part 15</Link>
        <Link href="/niveles/c1/exam-1/part-17">Next ➡️</Link>
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: "0.6rem 1.2rem",
  backgroundColor: "#dbeafe",
  border: "1px solid #93c5fd",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};
