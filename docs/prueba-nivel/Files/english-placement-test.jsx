import { useState, useRef, useEffect } from "react";

const TEACHER_PROMPT = `You are Sarah, an experienced English language teacher at a language academy. Your role is to evaluate student placement test results and provide warm, encouraging, professional feedback.

You will receive:
1. The student's name
2. Their answers to a 20-question multiple choice grammar/vocabulary test
3. The correct answers

YOUR TASK:
1. Calculate the score (correct answers out of 20)
2. Determine the CEFR level based on score:
   - 0-5: A1 (Beginner)
   - 6-9: A2 (Elementary)  
   - 10-13: B1 (Pre-Intermediate)
   - 14-17: B2 (Intermediate/Upper-Intermediate)
   - 18-20: C1/C2 (Advanced)
3. Write a personalised evaluation in this EXACT JSON format (no markdown, no backticks, just raw JSON):

{
  "score": <number>,
  "total": 20,
  "level": "<A1/A2/B1/B2/C1>",
  "levelName": "<Beginner/Elementary/Pre-Intermediate/Intermediate/Upper-Intermediate/Advanced>",
  "greeting": "<Warm personalised opening using the student's name>",
  "summary": "<2-3 sentences summarising their overall performance in an encouraging tone>",
  "strengths": ["<strength 1 based on which questions they got right>", "<strength 2>"],
  "areasToImprove": ["<area 1 based on wrong answers>", "<area 2>"],
  "recommendation": "<2-3 sentences recommending the specific course level and what they will learn there>",
  "encouragement": "<Short motivational closing message, warm and personal>",
  "wrongQuestions": [<list of question numbers the student got wrong, e.g. 3, 7, 12>]
}

Be specific about grammar points tested (e.g. "present perfect", "comparatives", "modal verbs"). Reference actual question topics when giving strengths and areas to improve. Keep the tone warm but professional, like a real teacher who wants the student to succeed.`;

const QUESTIONS = [
  {
    id: 1,
    question: "Maria and Fernando ___ Spanish.",
    options: ["is", "isn't", "am", "are"],
    correct: "d",
    topic: "verb to be",
    level: "A1"
  },
  {
    id: 2,
    question: "My parents have got four ___.",
    options: ["childs", "childrens", "children", "child"],
    correct: "c",
    topic: "irregular plurals",
    level: "A1"
  },
  {
    id: 3,
    question: "I ___ up at 7 o'clock every day.",
    options: ["get usually", "get sometimes", "usually get", "get never"],
    correct: "c",
    topic: "adverb position",
    level: "A1"
  },
  {
    id: 4,
    question: "She ___ a black T-shirt today.",
    options: ["wears", "doesn't wear", "are wearing", "is wearing"],
    correct: "d",
    topic: "present continuous",
    level: "A2"
  },
  {
    id: 5,
    question: "Where ___ last Saturday?",
    options: ["you go", "do you go", "did you go", "does he go"],
    correct: "c",
    topic: "past simple questions",
    level: "A2"
  },
  {
    id: 6,
    question: "He's more ___ than his sisters.",
    options: ["taller", "big", "oldest", "intelligent"],
    correct: "d",
    topic: "comparatives",
    level: "A2"
  },
  {
    id: 7,
    question: "We ___ a coffee in the café when we saw Tim.",
    options: ["had", "was having", "are having", "were having"],
    correct: "d",
    topic: "past continuous",
    level: "A2"
  },
  {
    id: 8,
    question: "What ___ to do next weekend?",
    options: ["do you go", "are you going", "did they go", "are they doing"],
    correct: "b",
    topic: "future plans",
    level: "A2"
  },
  {
    id: 9,
    question: "___ you ever met a famous person?",
    options: ["Do", "Did", "Has", "Have"],
    correct: "d",
    topic: "present perfect",
    level: "B1"
  },
  {
    id: 10,
    question: "They've never ___ to a big city.",
    options: ["saw", "gone", "seen", "been"],
    correct: "d",
    topic: "present perfect with never",
    level: "B1"
  },
  {
    id: 11,
    question: "If he ___ the exam, he'll go to university.",
    options: ["won't pass", "will pass", "is passing", "passes"],
    correct: "a",
    topic: "first conditional",
    level: "B1"
  },
  {
    id: 12,
    question: "The book ___ in 1954.",
    options: ["is written", "were written", "was written", "wrote"],
    correct: "c",
    topic: "passive voice",
    level: "B1"
  },
  {
    id: 13,
    question: "I went to the shop ___ some chocolate.",
    options: ["for to buy", "to buy", "to buying", "for buying"],
    correct: "b",
    topic: "infinitive of purpose",
    level: "B1"
  },
  {
    id: 14,
    question: "If you went to school earlier, you ___ late every day.",
    options: ["will arrive", "wouldn't arrive", "didn't arrive", "would arrive"],
    correct: "b",
    topic: "second conditional",
    level: "B2"
  },
  {
    id: 15,
    question: "She ___ for Bill for an hour – he's late!",
    options: ["is waiting", "waits", "was waiting", "has been waiting"],
    correct: "d",
    topic: "present perfect continuous",
    level: "B2"
  },
  {
    id: 16,
    question: "They ___ live in Warsaw before they went to London.",
    options: ["use to", "were", "had used to", "used to"],
    correct: "d",
    topic: "used to",
    level: "B1"
  },
  {
    id: 17,
    question: "He told me he ___ at 8 o'clock.",
    options: ["arriving", "has arrived", "was arriving", "arrive"],
    correct: "c",
    topic: "reported speech",
    level: "B2"
  },
  {
    id: 18,
    question: "If you ___ told me she was going to the party, I wouldn't have gone.",
    options: ["would have", "has", "have", "had"],
    correct: "d",
    topic: "third conditional",
    level: "B2"
  },
  {
    id: 19,
    question: "They don't know the answer, ___?",
    options: ["aren't they", "don't they", "do they", "are they"],
    correct: "c",
    topic: "question tags",
    level: "B2"
  },
  {
    id: 20,
    question: "They asked us ___ Jason last week.",
    options: ["have we seen", "have you seen", "if we had seen", "did you see"],
    correct: "c",
    topic: "reported questions",
    level: "B2"
  }
];

const LEVEL_COLORS = {
  A1: { bg: "#E1F5EE", text: "#0F6E56", border: "#5DCAA5", name: "Beginner" },
  A2: { bg: "#E6F1FB", text: "#185FA5", border: "#378ADD", name: "Elementary" },
  B1: { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27", name: "Pre-Intermediate" },
  B2: { bg: "#EEEDFE", text: "#534AB7", border: "#7F77DD", name: "Intermediate" },
  C1: { bg: "#FCEBEB", text: "#A32D2D", border: "#E24B4A", name: "Advanced" },
};

const ProgressBar = ({ current, total }) => (
  <div style={{ width: "100%", height: 6, background: "#E1F5EE", borderRadius: 99, overflow: "hidden", marginBottom: 24 }}>
    <div style={{ height: "100%", width: `${(current / total) * 100}%`, background: "linear-gradient(90deg, #1D9E75, #378ADD)", borderRadius: 99, transition: "width 0.4s ease" }} />
  </div>
);

export default function PlacementTest() {
  const [step, setStep] = useState("welcome");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const nameRef = useRef();

  useEffect(() => {
    if (step === "welcome" && nameRef.current) nameRef.current.focus();
  }, [step]);

  const handleAnswer = (letter) => {
    setSelected(letter);
    setTimeout(() => {
      const newAnswers = { ...answers, [QUESTIONS[currentQ].id]: letter };
      setAnswers(newAnswers);
      setSelected(null);
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        evaluateTest(newAnswers);
      }
    }, 420);
  };

  const evaluateTest = async (finalAnswers) => {
    setStep("loading");
    setLoading(true);
    setError(null);

    const answerSummary = QUESTIONS.map(q => ({
      question: q.id,
      text: q.question,
      topic: q.topic,
      studentAnswer: finalAnswers[q.id] || "no answer",
      correctAnswer: q.correct,
      isCorrect: finalAnswers[q.id] === q.correct
    }));

    const userMessage = `Student name: ${studentName}

Here are the test results:
${answerSummary.map(a => `Q${a.question} (${a.topic}): Student answered "${a.studentAnswer}" - Correct answer is "${a.correctAnswer}" - ${a.isCorrect ? "CORRECT" : "WRONG"}`).join("\n")}

Please evaluate this student and return the JSON evaluation.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: TEACHER_PROMPT,
          messages: [{ role: "user", content: userMessage }]
        })
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setStep("result");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setStep("test");
    }
    setLoading(false);
  };

  const restart = () => {
    setStep("welcome");
    setStudentName("");
    setStudentEmail("");
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setError(null);
    setSelected(null);
  };

  if (step === "welcome") return <WelcomeScreen name={studentName} email={studentEmail} setName={setStudentName} setEmail={setStudentEmail} onStart={() => setStep("test")} nameRef={nameRef} />;
  if (step === "loading") return <LoadingScreen />;
  if (step === "test") return <TestScreen question={QUESTIONS[currentQ]} questionIndex={currentQ} total={QUESTIONS.length} onAnswer={handleAnswer} selected={selected} error={error} />;
  if (step === "result" && result) return <ResultScreen result={result} name={studentName} onRestart={restart} questions={QUESTIONS} answers={answers} />;
  return null;
}

function WelcomeScreen({ name, email, setName, setEmail, onStart, nameRef }) {
  const canStart = name.trim().length > 1;
  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 560, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "#E1F5EE", marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
        </div>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 28, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>English Level Test</h1>
        <p style={{ color: "#5F5E5A", fontSize: 15, margin: 0, lineHeight: 1.6 }}>20 questions · ~10 minutes · Instant results</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #D3D1C7", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[["📖", "Grammar & Vocabulary", "From A1 to B2+"], ["🤖", "AI Teacher Feedback", "Personalised report"], ["⚡", "Instant Results", "No waiting"], ["🎯", "CEFR Levels", "A1 to C1"]].map(([icon, title, sub]) => (
            <div key={title} style={{ background: "#F1EFE8", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 11, color: "#888780" }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444441", marginBottom: 6 }}>Your name *</label>
          <input ref={nameRef} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. María García" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #D3D1C7", borderRadius: 10, fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#1D9E75"} onBlur={e => e.target.style.borderColor = "#D3D1C7"} onKeyDown={e => e.key === "Enter" && canStart && onStart()} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444441", marginBottom: 6 }}>Email <span style={{ color: "#888780", fontWeight: 400 }}>(optional – to receive your report)</span></label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. maria@email.com" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #D3D1C7", borderRadius: 10, fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#1D9E75"} onBlur={e => e.target.style.borderColor = "#D3D1C7"} />
        </div>

        <button onClick={onStart} disabled={!canStart} style={{ width: "100%", padding: "14px", background: canStart ? "linear-gradient(135deg, #1D9E75, #185FA5)" : "#D3D1C7", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: canStart ? "pointer" : "not-allowed", transition: "all 0.2s", letterSpacing: 0.3 }}>
          Start the Test →
        </button>
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#888780" }}>Your results are evaluated by AI based on three professional EFL placement tests.</p>
    </div>
  );
}

function TestScreen({ question, questionIndex, total, onAnswer, selected, error }) {
  const letters = ["a", "b", "c", "d"];
  const levelColor = { A1: "#1D9E75", A2: "#378ADD", B1: "#EF9F27", B2: "#7F77DD", C1: "#E24B4A" };
  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 560, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#888780" }}>Question {questionIndex + 1} of {total}</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: levelColor[question.level] + "22", color: levelColor[question.level], letterSpacing: 0.5 }}>{question.level}</span>
      </div>
      <ProgressBar current={questionIndex} total={total} />

      {error && <div style={{ background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#A32D2D" }}>⚠️ {error} — your progress is saved.</div>}

      <div style={{ background: "#fff", border: "1px solid #D3D1C7", borderRadius: 16, padding: "1.75rem", marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", margin: "0 0 1.5rem", lineHeight: 1.5 }}>{question.question}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map((opt, i) => {
            const letter = letters[i];
            const isSelected = selected === letter;
            return (
              <button key={letter} onClick={() => !selected && onAnswer(letter)} disabled={!!selected} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: isSelected ? "2px solid #1D9E75" : "1.5px solid #D3D1C7", borderRadius: 12, background: isSelected ? "#E1F5EE" : "#fff", cursor: selected ? "default" : "pointer", transition: "all 0.15s", textAlign: "left", fontSize: 15, color: isSelected ? "#0F6E56" : "#2C2C2A", transform: isSelected ? "scale(1.01)" : "scale(1)" }}>
                <span style={{ minWidth: 28, height: 28, borderRadius: "50%", background: isSelected ? "#1D9E75" : "#F1EFE8", color: isSelected ? "#fff" : "#5F5E5A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{letter.toUpperCase()}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#B4B2A9" }}>Click an option to answer · {total - questionIndex - 1} questions remaining</p>
    </div>
  );
}

function LoadingScreen() {
  const [dot, setDot] = useState(0);
  const messages = ["Checking your answers…", "Analysing your grammar knowledge…", "Preparing your personalised report…", "Almost ready…"];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t1 = setInterval(() => setDot(d => (d + 1) % 4), 400);
    const t2 = setInterval(() => setMsgIdx(m => (m + 1) % messages.length), 1800);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);
  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 560, margin: "0 auto", padding: "4rem 1rem", textAlign: "center" }}>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #E1F5EE, #E6F1FB)", marginBottom: 24 }}>
        <span style={{ fontSize: 36 }}>🤖</span>
      </div>
      <h2 style={{ fontSize: 22, color: "#1a1a2e", marginBottom: 8 }}>Your AI teacher is reviewing your test</h2>
      <p style={{ fontSize: 15, color: "#5F5E5A", marginBottom: 32, minHeight: 24 }}>{messages[msgIdx]}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i === dot % 3 ? "#1D9E75" : "#D3D1C7", transition: "background 0.3s" }} />
        ))}
      </div>
    </div>
  );
}

function ResultScreen({ result, name, onRestart, questions, answers }) {
  const level = result.level || "B1";
  const lc = LEVEL_COLORS[level] || LEVEL_COLORS["B1"];
  const pct = Math.round((result.score / result.total) * 100);
  const wrongQs = result.wrongQuestions || [];

  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ background: lc.bg, border: `2px solid ${lc.border}`, borderRadius: 20, padding: "1.75rem", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: lc.text, textTransform: "uppercase", marginBottom: 4 }}>Your English Level</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: lc.text, lineHeight: 1, marginBottom: 4 }}>{result.level}</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: lc.text, marginBottom: 16 }}>{result.levelName}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: lc.text }}>{result.score}/{result.total}</div>
            <div style={{ fontSize: 12, color: lc.text, opacity: 0.8 }}>correct answers</div>
          </div>
          <div style={{ width: 1, background: lc.border, opacity: 0.4 }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: lc.text }}>{pct}%</div>
            <div style={{ fontSize: 12, color: lc.text, opacity: 0.8 }}>score</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #D3D1C7", borderRadius: 16, padding: "1.5rem", marginBottom: 16 }}>
        <p style={{ fontSize: 15, color: "#2C2C2A", lineHeight: 1.7, margin: "0 0 8px", fontStyle: "italic" }}>"{result.greeting}"</p>
        <p style={{ fontSize: 14, color: "#444441", lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#EAF3DE", border: "1px solid #C0DD97", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#3B6D11", marginBottom: 10 }}>✅ Your strengths</div>
          {result.strengths?.map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: "#27500A", marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid #97C459" }}>
              {s}
            </div>
          ))}
        </div>
        <div style={{ background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#854F0B", marginBottom: 10 }}>📚 Focus areas</div>
          {result.areasToImprove?.map((a, i) => (
            <div key={i} style={{ fontSize: 13, color: "#633806", marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid #EF9F27" }}>
              {a}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: 14, padding: "1.25rem", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: lc.text, marginBottom: 8 }}>🎯 Our recommendation for you</div>
        <p style={{ fontSize: 14, color: lc.text, lineHeight: 1.7, margin: 0 }}>{result.recommendation}</p>
      </div>

      {wrongQs.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #D3D1C7", borderRadius: 14, padding: "1.25rem", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#444441", marginBottom: 12 }}>🔍 Questions to review</div>
          {wrongQs.map(qNum => {
            const q = questions.find(q => q.id === qNum);
            if (!q) return null;
            const letters = ["a", "b", "c", "d"];
            const correctIdx = letters.indexOf(q.correct);
            return (
              <div key={qNum} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "0.5px solid #F1EFE8" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>Q{q.id}: {q.question}</div>
                <div style={{ fontSize: 12, color: "#888780", marginBottom: 3 }}>Your answer: <span style={{ color: "#A32D2D", fontWeight: 600 }}>{answers[q.id]?.toUpperCase() || "–"}) {q.options[letters.indexOf(answers[q.id])] || "no answer"}</span></div>
                <div style={{ fontSize: 12, color: "#888780" }}>Correct: <span style={{ color: "#0F6E56", fontWeight: 600 }}>{q.correct.toUpperCase()}) {q.options[correctIdx]}</span> <span style={{ color: "#B4B2A9" }}>({q.topic})</span></div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background: "#EEEDFE", border: "1px solid #AFA9EC", borderRadius: 14, padding: "1.25rem", marginBottom: 20, textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#3C3489", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{result.encouragement}"</p>
        <p style={{ fontSize: 12, color: "#7F77DD", margin: "8px 0 0", fontWeight: 600 }}>— Sarah, English Academy Teacher</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <button onClick={onRestart} style={{ padding: "12px 28px", background: "transparent", border: "1.5px solid #D3D1C7", borderRadius: 12, fontSize: 14, color: "#444441", cursor: "pointer", marginRight: 12 }}>
          Retake the test
        </button>
        <button onClick={() => window.print && window.print()} style={{ padding: "12px 28px", background: "linear-gradient(135deg, #1D9E75, #185FA5)", border: "none", borderRadius: 12, fontSize: 14, color: "#fff", cursor: "pointer", fontWeight: 600 }}>
          Save my results 📄
        </button>
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#B4B2A9", marginTop: 16 }}>Contact us to enrol in your recommended course</p>
    </div>
  );
}
