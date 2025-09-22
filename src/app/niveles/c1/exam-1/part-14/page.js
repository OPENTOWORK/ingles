'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const questions = [
  "Where do you live?",
  "Are you working or studying at the moment?",
  "How much free time do you have at the moment?",
  "How good are you at organising your time?",
  "What would your dream job be?",
  "Do you have much opportunity to travel?",
  "How important is the internet to you?"
];

export default function Part14() {
  const part = 'part-14';
  const { answers, updateAnswer } = useExam();

  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [responses, setResponses] = useState(() => answers?.[part]?.responses || {});
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
      const rec = new webkitSpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const updated = { ...responses, [current]: transcript };
        setResponses(updated);
        setRecording(false);
      };
      rec.onerror = () => {
        alert("There was an error with voice recognition.");
        setRecording(false);
      };
      setRecognition(rec);
    }
  }, [current]);

  useEffect(() => {
    updateAnswer(part, 'responses', responses);
    updateAnswer(part, 'score', Object.keys(responses).length);
  }, [responses]);

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    synth.speak(utter);
  };

  const startRecording = () => {
    if (!recognition) return;
    setRecording(true);
    recognition.start();
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const total = questions.length;
  const completed = Object.keys(responses).length;
  const required = 5;
  const passed = completed >= required;
  const progress = Math.round(((current + 1) / total) * 100);

  return (
    <main style={{
      padding: "2rem",
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#e8f4ff",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center" }}>Part 14: Speaking – Introduction & Interview</h1>

      <p style={{ maxWidth: "750px", margin: "0 auto", fontSize: "1rem", color: "#333", textAlign: "center" }}>
        In this part of the exam, you will answer some personal questions. Click on <strong>Speak Question</strong> to hear the question,
        and respond using your voice. Try to give full answers.
      </p>

      {/* Progress bar */}
      <div style={{
        maxWidth: "600px",
        margin: "1rem auto",
        backgroundColor: "#dbeafe",
        borderRadius: "8px",
        overflow: "hidden",
        height: "18px",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "#60a5fa",
          transition: "width 0.3s"
        }} />
      </div>
      <p style={{ textAlign: "center", fontSize: "0.95rem" }}>Question {current + 1} of {total}</p>

      <section style={{
        maxWidth: "900px",
        margin: "2rem auto",
        display: "flex",
        gap: "2rem",
        alignItems: "flex-start"
      }}>
        <div style={{
          flex: 1,
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h2>Interlocutor:</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <button onClick={() => speak(questions[current])} style={buttonStyle}>
              🔊 Speak Question
            </button>
            <button onClick={startRecording} disabled={recording} style={buttonStyle}>
              🎤 {recording ? "Listening..." : "Answer with your voice"}
            </button>
          </div>

          {responses[current] && (
            <p><strong>Your answer:</strong> {responses[current]}</p>
          )}

          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
            <button onClick={prevQuestion} disabled={current === 0} style={buttonStyle}>⬅ Prev</button>
            <button onClick={nextQuestion} disabled={current >= total - 1} style={buttonStyle}>➡ Next</button>
          </div>
        </div>
      </section>

      <div style={{
        marginTop: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap"
      }}>
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ marginBottom: "0.3rem" }}>Your responses: {completed} / {total}</h3>
          <p style={{ fontSize: "0.95rem", color: "#333", margin: 0 }}>
            🎯 You need <strong>{required}</strong> responses to complete this part.
          </p>
          {completed === total && (
            passed ? (
              <p style={{ color: "green", marginTop: "0.3rem" }}>✅ You completed the interview!</p>
            ) : (
              <p style={{ color: "red", marginTop: "0.3rem" }}>⚠️ You can add more answers to complete the section.</p>
            )
          )}
          <div style={{ marginTop: "0.5rem" }}>
            <Link href="/niveles/c1/exam-1/part-13">⬅ Back to Part 13</Link>
          </div>
        </div>

        <Link href="/niveles/c1/exam-1/part-15" style={{ alignSelf: "flex-end" }}>
          Next ➡️
        </Link>
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: "0.5rem 1.2rem",
  backgroundColor: "#dbeafe",
  border: "1px solid #93c5fd",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};
