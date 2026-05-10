'use client';
import Link from 'next/link';

// ====== Datos ======
const SECTIONS = {
  "Reading": [
    { text: "Part 1: Multiple choice (signs and messages)", href: "/niveles/b1/reading-and-use-of-english/part-1" },
    { text: "Part 2: Matching (people to texts)", href: "/niveles/b1/reading-and-use-of-english/part-2" },
    { text: "Part 3: Multiple choice (long text)", href: "/niveles/b1/reading-and-use-of-english/part-3" },
    { text: "Part 4: Gapped text (sentences)", href: "/niveles/b1/reading-and-use-of-english/part-4" },
    { text: "Part 5: Multiple choice cloze", href: "/niveles/b1/reading-and-use-of-english/part-5" },
    { text: "Part 6: Open cloze", href: "/niveles/b1/reading-and-use-of-english/part-6" },
  ],
  "Writing": [
    { text: "Part 1: Email (about 100 words)", href: "/niveles/b1/writing/part-1" },
    { text: "Part 2: Article or story (about 100 words)", href: "/niveles/b1/writing/part-2" },
  ],
  "Listening": [
    { text: "Part 1: Multiple choice (short texts)", href: "/niveles/b1/listening/part-1" },
    { text: "Part 2: Multiple choice (monologue)", href: "/niveles/b1/listening/part-2" },
    { text: "Part 3: Gap-fill (notes)", href: "/niveles/b1/listening/part-3" },
    { text: "Part 4: Multiple choice (interview)", href: "/niveles/b1/listening/part-4" },
  ],
  "Speaking": [
    { text: "Speaking Lab (AI) — Practice / Exam", href: "/niveles/speaking-lab/b1/" },
    { text: "Part 1: Personal information", href: "/niveles/b1/speaking/part-1" },
    { text: "Part 2: Simulated situation", href: "/niveles/b1/speaking/part-2" },
    { text: "Part 3: Describe photograph", href: "/niveles/b1/speaking/part-3" },
    { text: "Part 4: General conversation", href: "/niveles/b1/speaking/part-4" },
  ],
};

const EXAM_LINKS = [
  { text: "📝 Full Exam", href: "/niveles/b1/exam-1" },
  { text: "📖 Reading", href: "/niveles/b1/exam-reading" },
  { text: "✍️ Writing", href: "/niveles/b1/exam-writing" },
  { text: "🎧 Listening", href: "/niveles/b1/exam-listening" },
  { text: "🗣️ Speaking", href: "/niveles/b1/exam-speaking" },
];

// ====== Página ======
export default function B1Page() {
  return (
    <main className="shell b1-page">
      <header className="header">
        <h1>B1 Exam: Preliminary (PET)</h1>
        <p>This is an intermediate level qualification that shows you can use everyday written and spoken English.</p>
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
      .b1-page {
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
