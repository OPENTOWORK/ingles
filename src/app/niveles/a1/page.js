'use client';
import Link from 'next/link';

// ====== Datos ======
const SECTIONS = {
  "Reading and Writing": [
    { text: "Part 1: Names and pictures", href: "/niveles/a1/reading-and-use-of-english/part-1" },
    { text: "Part 2: Read short sentences", href: "/niveles/a1/reading-and-use-of-english/part-2" },
    { text: "Part 3: Read for specific information", href: "/niveles/a1/reading-and-use-of-english/part-3" },
    { text: "Part 4: Read and write simple words", href: "/niveles/a1/reading-and-use-of-english/part-4" },
    { text: "Part 5: Writing simple sentences", href: "/niveles/a1/reading-and-use-of-english/part-5" },
  ],
  "Listening": [
    { text: "Part 1: Listen and draw lines", href: "/niveles/a1/listening/part-1" },
    { text: "Part 2: Listen and write number/name", href: "/niveles/a1/listening/part-2" },
    { text: "Part 3: Listen and tick the box", href: "/niveles/a1/listening/part-3" },
    { text: "Part 4: Listen and color/draw", href: "/niveles/a1/listening/part-4" },
  ],
  "Speaking": [
    { text: "Part 1: Greetings and personal information", href: "/niveles/a1/speaking/part-1" },
    { text: "Part 2: Describe pictures", href: "/niveles/a1/speaking/part-2" },
  ],
};

const EXAM_LINKS = [
  { text: "📝 Full Exam", href: "/niveles/a1/exam-1" },
  { text: "📖 Reading & Writing", href: "/niveles/a1/exam-reading" },
  { text: "🎧 Listening", href: "/niveles/a1/exam-listening" },
  { text: "🗣️ Speaking", href: "/niveles/a1/exam-speaking" },
];

// ====== Página ======
export default function A1Page() {
  return (
    <main className="shell a1-page">
      <header className="header">
        <h1>A1 Exam: Starters (YLE)</h1>
        <p>This is a beginner level test that shows children can understand basic English in everyday situations.</p>
      </header>

      {/* Contenido */}
      <div className="sections">
        {Object.entries(SECTIONS).map(([title, topics]) => (
          <Section key={title} title={title} topics={topics} />
        ))}
      </div>

      {/* Enlaces de exámenes */}
      <section className="exam-section">
        <div className="section__head">
          <h2>Exam Practice</h2>
          <span className="count">{EXAM_LINKS.length}</span>
        </div>
        <div className="exam-grid">
          {EXAM_LINKS.map((exam, i) => (
            <Link key={i} href={exam.href} className="exam-card">
              {exam.text}
            </Link>
          ))}
        </div>
      </section>

      {/* Nota */}
      <div className="note">
        <p>Interactive examples and exam simulations coming soon.</p>
      </div>

      <GlobalStyles />
    </main>
  );
}

// ====== Subcomponentes ======
function Section({ title, topics }) {
  return (
    <section className="section">
      <div className="section__head">
        <h2>{title}</h2>
        <span className="count">{topics.length}</span>
      </div>
      <ul className="grid">
        {topics.map((topic, i) => (
          <li key={`${topic.href}-${i}`}>
            <Link href={topic.href} className="card">
              <div className="card__title">{topic.text}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ====== Estilos (styled-jsx global + locales) ======
function GlobalStyles() {
  return (
    <style jsx global>{`
      .a1-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell{min-height:100svh;max-width:1100px;margin:0 auto;padding:32px 20px}
      .header h1{font-size:44px;margin:0 0 6px;color:var(--text)}
      .header p{margin:0;color:#666;max-width:700px;margin:0 auto;text-align:center;font-size:1.1rem}
      .sections{display:flex;flex-direction:column;gap:28px}
      .section{padding:6px}
      .section__head{display:flex;align-items:center;gap:8px;margin-bottom:10px}
      .section__head h2{margin:0;font-size:22px;color:var(--text)}
      .count{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9999px;border:1px solid #eaeaea;background:var(--card);font-size:12px;color:#666}
      .grid{list-style:none;margin:0;padding:0;display:grid;gap:12px;grid-template-columns:repeat(1,minmax(0,1fr))}
      @media (min-width:640px){ .grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
      @media (min-width:980px){ .grid{grid-template-columns:repeat(3,minmax(0,1fr));} }
      .card{display:block;height:100%;border:1px solid #eaeaea;border-radius:18px;background:var(--card);padding:18px;transition:transform .2s, box-shadow .2s, border-color .2s}
      .card:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,0,0,.1);border-color:#0070f3;background:#b0d6fa}
      .card:focus{outline:none;box-shadow:0 0 0 6px rgba(0,112,243,.35)}
      .card__title{font-size:16px;font-weight:600;line-height:1.25;color:var(--text)}
      .exam-section{margin-top:3rem;padding:6px}
      .exam-grid{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;margin-top:1rem}
      .exam-card{background:#d1fae5;color:#047857;padding:0.75rem 1.25rem;border-radius:8px;font-weight:bold;text-decoration:none;box-shadow:0 1px 4px rgba(0,0,0,0.1);transition:transform .2s, box-shadow .2s}
      .exam-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.15)}
      .note{margin-top:2rem;text-align:center}
      .note p{font-style:italic;color:#666;margin:0}
    `}</style>
  );
}
