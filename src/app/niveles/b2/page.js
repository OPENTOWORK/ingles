'use client';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';

// ====== Datos ======
const SECTIONS = {
  "Reading and Use of English": [
    { text: "Part 1: Multiple-choice cloze", href: "/niveles/b2/reading-and-use-of-english/part-1" },
    { text: "Part 2: Open cloze", href: "/niveles/b2/reading-and-use-of-english/part-2" },
    { text: "Part 3: Word formation", href: "/niveles/b2/reading-and-use-of-english/part-3" },
    { text: "Part 4: Key word transformations", href: "/niveles/b2/reading-and-use-of-english/part-4" },
    { text: "Part 5: Multiple-choice (reading)", href: "/niveles/b2/reading-and-use-of-english/part-5" },
    { text: "Part 6: Gapped text", href: "/niveles/b2/reading-and-use-of-english/part-6" },
    { text: "Part 7: Multiple matching", href: "/niveles/b2/reading-and-use-of-english/part-7" },
  ],
  "Writing": [
    { text: "Part 1: Compulsory essay (140-190 words)", href: "/niveles/b2/writing/part-1" },
    { text: "Part 2: Article, letter, report or review (140-190 words)", href: "/niveles/b2/writing/part-2" },
  ],
  "Listening": [
    { text: "Part 1: Multiple choice (short extracts)", href: "/niveles/b2/listening/part-1" },
    { text: "Part 2: Sentence completion (monologue)", href: "/niveles/b2/listening/part-2" },
    { text: "Part 3: Multiple choice (conversation)", href: "/niveles/b2/listening/part-3" },
    { text: "Part 4: Multiple matching (short monologues)", href: "/niveles/b2/listening/part-4" },
  ],
  "Speaking": [
    { text: "Part 1: Interview", href: "/niveles/b2/speaking/part-1" },
    { text: "Part 2: Long turn (photos)", href: "/niveles/b2/speaking/part-2" },
    { text: "Part 3: Collaborative task", href: "/niveles/b2/speaking/part-3" },
    { text: "Part 4: Discussion", href: "/niveles/b2/speaking/part-4" },
  ],
};

const EXAM_LINKS = [
  { text: "📝 Full Exam", href: "/niveles/b2/exam-1", enabledForStudents: false },
  { text: "📘 Use of English", href: "/niveles/b2/exam-useofenglish", enabledForStudents: true },
  { text: "📖 Reading", href: "/niveles/b2/exam-reading", enabledForStudents: true },
  { text: "✍️ Writing", href: "/niveles/b2/exam-writing", enabledForStudents: true },
  { text: "🎧 Listening", href: "/niveles/b2/exam-listening", enabledForStudents: false },
  { text: "🗣️ Speaking", href: "/niveles/b2/exam-speaking", enabledForStudents: false },
];

// ====== Página ======
export default function B2Page() {
  const { userRole: roleName } = useUserRole();

  const isAdmin = roleName === 'admin' || roleName === 'administrador';
  const isStudent = !isAdmin;

  return (
    <main className="shell b2-page">
      <header className="header">
        <h1>B2 Exam: First (FCE)</h1>
        <p>This is an upper-intermediate level qualification that proves you can use everyday written and spoken English for work or study.</p>
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
          {EXAM_LINKS.map((exam, i) => {
            const blockedForStudent = isStudent && !exam.enabledForStudents;
            if (blockedForStudent) {
              return (
                <div key={i} className="exam-card exam-card-disabled" aria-disabled="true">
                  <span>{exam.text}</span>
                  <small className="exam-card-badge">Próximamente disponible</small>
                </div>
              );
            }
            return (
              <Link key={i} href={exam.href} className="exam-card">
                {exam.text}
              </Link>
            );
          })}
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
      .b2-page {
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
      .exam-card-disabled{
        background:#e5e7eb;
        color:#6b7280;
        cursor:not-allowed;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:0.2rem;
        filter:grayscale(.2);
      }
      .exam-card-badge{
        font-size:0.75rem;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:.02em;
      }
      .note{margin-top:2rem;text-align:center}
      .note p{font-style:italic;color:#666;margin:0}
    `}</style>
  );
}
