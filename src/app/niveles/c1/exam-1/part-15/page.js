'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

export default function Part15() {
  const part = 'part-15';
  const { answers, updateAnswer } = useExam();

  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState(() => answers?.[part]?.response || "");
  const [feedback, setFeedback] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [showImage, setShowImage] = useState(false);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const instructions = [
    "Now, in this part of the test you’re going to do something together. Here are some pictures of people in different situations.",
    "First, I’d like you to look at pictures A and B and talk together about how common these situations are in your country.",
    "You have about a minute for this, so don’t worry if I interrupt you.",
    "Now look at all the pictures. I’d like you to imagine that a television documentary is being produced on working in the food industry.",
    "These pictures show some of the issues that are being considered.",
    "Talk together about the different issues related to working in the food industry that these pictures show.",
    "Then decide which issue might stimulate most interest.",
    "You have about three minutes to talk about this."
  ];

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

  return (
    <main style={{
      padding: "2rem",
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#e8f4ff",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center" }}>Part 15: Speaking – Collaborative Task</h1>

      <p style={{
        maxWidth: "750px",
        margin: "0 auto",
        fontSize: "1rem",
        color: "#333",
        textAlign: "center"
      }}>
        Look at the image below. Then press play to hear the instructions and respond using your voice.
      </p>

      {/* Imagen solo visible después de pulsar Play */}
      {showImage && (
        <section style={{ margin: "2rem auto", maxWidth: "800px", textAlign: "center" }}>
          <img
            src="/images/imagen-speaking-c1-exam1.jpg"
            alt="Speaking Part 2 - Food Industry"
            style={{
              width: "100%",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
          />
        </section>
      )}

      {/* Controles */}
      <section style={{ margin: "2rem auto", maxWidth: "700px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button onClick={speakInstructions} style={buttonStyle}>
            🔊 Play Instructions
          </button>
          <button
            onClick={startRecording}
            disabled={recording || !showImage}
            style={buttonStyle}
          >
            🎤 {recording ? "Listening..." : "Answer with your voice"}
          </button>
        </div>

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
        <Link href="/niveles/c1/exam-1/part-14">⬅ Back to Part 14</Link>
        <Link href="/niveles/c1/exam-1/part-16">Next ➡️</Link>
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
