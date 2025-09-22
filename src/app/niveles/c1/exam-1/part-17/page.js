'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

export default function Part17() {
  const part = 'part-17';
  const { answers, updateAnswer } = useExam();

  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState(() => answers?.[part]?.response || "");
  const [feedback, setFeedback] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [showCard, setShowCard] = useState(false);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const instructions = [
    "Now Candidate B, it's your turn to be given a question. Here is your card.",
    "Please let Candidate A see your card. Remember Candidate B, you have about two minutes to tell us what you think, and there are some ideas on the card for you to use if you like.",
    "All right? Here is your card."
  ];

  const finalDiscussion = [
    "Now, to finish the test, we’re going to talk about decisions in general.",
    "Nowadays, there are so many products to choose from that it’s impossible to choose. To what extent do you agree?",
    "Who should decide how taxes are spent, government ministers or local people?",
    "Why do jobs that involve taking difficult decisions appeal to some people?",
    "What difficult decisions do you think scientists will face in the future?",
    "What is the best way of deciding how a criminal is punished?",
    "How easy is it to repair a wrong decision?"
  ];

  const taskCard = {
    question: "How much are people’s decisions influenced by the media?",
    topics: ["spending habits", "current affairs", "entertainment"]
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
        setRecording(false);
        evaluateAnswer(transcript);
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

    setShowCard(true);
    startRecording();

    timeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 120000); // 2 minutes
  };

  const speakFinalDiscussion = () => {
    const text = finalDiscussion.join(" ");
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-GB';
    synth.speak(utter);
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
    if (lower.includes("media") && (lower.includes("social") || lower.includes("news") || lower.includes("advertising"))) {
      setFeedback({ correct: true, message: "✔ Well done! You addressed the media influence clearly." });
    } else if (text.length < 15) {
      setFeedback({ correct: false, message: "✘ Try to give more detail and use full sentences." });
    } else {
      setFeedback({ correct: false, message: "✘ Try to include examples or key terms like entertainment or current affairs." });
    }
  };

  return (
    <main style={{
      padding: "2rem",
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#e8f4ff",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center" }}>Part 17: Speaking – Long Turn (Decisions cont.)</h1>

      <p style={{
        maxWidth: "750px",
        margin: "0 auto",
        fontSize: "1rem",
        color: "#333",
        textAlign: "center"
      }}>
        Press play to hear your instructions. Then answer the question below using your voice.
      </p>

      <div style={{ textAlign: "center", margin: "1rem 0" }}>
        <button onClick={speakInstructions} style={buttonStyle}>
          🔊 Play Instructions
        </button>
      </div>

      {showCard && (
        <section style={{
          margin: "2rem auto",
          maxWidth: "700px",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3>Task 1(b)</h3>
          <p><strong>{taskCard.question}</strong></p>
          <ul>
            {taskCard.topics.map((topic, idx) => (
              <li key={idx}>• {topic}</li>
            ))}
          </ul>
        </section>
      )}

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

      <section style={{ margin: "3rem auto", maxWidth: "800px", textAlign: "center" }}>
        <h3>Final Group Discussion</h3>
        <p>Press below to hear some final discussion questions.</p>
        <button onClick={speakFinalDiscussion} style={buttonStyle}>🗣️ Play Final Questions</button>
      </section>

      <div style={{
        marginTop: "3rem",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <Link href="/niveles/c1/exam-1/part-16">⬅ Back to Part 16</Link>
        <Link href="/niveles/c1/exam-1/resultado">Finish ➡️</Link>
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
