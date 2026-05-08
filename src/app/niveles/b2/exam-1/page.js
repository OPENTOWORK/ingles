'use client';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';
import SimpleExamManager from '@/components/SimpleExamManager';
import '@/styles/exam-styles.css';

// ====== Página ======
export default function B2ExamHomePage() {
  const { answers } = useExam();

  return (
    <main className="shell exam-page">
      <header className="header">
        <h1>B2 English Exam Practice</h1>
        <p>Welcome to the B2 English exam practice page.</p>
      </header>

      {/* Gestión del Examen */}
      <SimpleExamManager examId="exam-1" />

      {/* Información */}
      <section className="info-section">
        <div className="info-content">
          <p>
            This platform is designed to help you prepare for the full Reading and Use of English paper, structured in the same format as the official exam.
          </p>
          <p>
            Each full exam consists of <strong>7 parts</strong>, testing your understanding of grammar, vocabulary, collocations, paraphrasing, and reading comprehension.
            You will receive immediate feedback and know exactly which answers you got right or wrong.
          </p>
          <p>
            Select any of the <strong>12 full exams</strong> below to begin your training. Each exam starts from Part 1 and guides you all the way through Part 7.
          </p>
          <p>
            Practicing consistently is the key to success. Let's get started!
          </p>
        </div>
      </section>

      {/* Exámenes */}
      <section className="exams-section">
        <div className="section__head">
          <h2>Available Exams</h2>
          <span className="count">12</span>
        </div>
        <div className="exams-grid">
          {[...Array(12)].map((_, i) => {
            const examKey = `exam-${i + 1}`;
            const progress = Object.keys(answers?.[examKey] || {}).length;
            const finished = progress >= 7;

            return (
              <Link
                key={i}
                href={`/niveles/b2/exam-${i + 1}`}
                className={`exam-card ${finished ? 'exam-card--completed' : ''}`}
              >
                <div className="exam-card__title">Exam {i + 1}</div>
                <div className="exam-card__status">
                  {finished ? '✅ Completed' : `Progress: ${progress}/7`}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Navegación */}
      <div className="navigation">
        <Link href="/niveles/b2" className="back-link">
          ← Back to B2 Overview
        </Link>
      </div>

      <GlobalStyles />
    </main>
  );
}

// ====== Estilos (styled-jsx global + locales) ======
function GlobalStyles() {
  return (
    <style jsx global>{`
      .exam-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell{min-height:100svh;max-width:1100px;margin:0 auto;padding:32px 20px}
      .header h1{font-size:44px;margin:0 0 6px;color:var(--text)}
      .header p{margin:0;color:#666;max-width:800px;margin:0 auto;text-align:center;font-size:1.1rem}
      .info-section{margin:2rem 0;padding:6px}
      .info-content{max-width:800px;margin:0 auto;line-height:1.6;color:#333}
      .info-content p{margin-bottom:1rem}
      .exams-section{margin:2rem 0;padding:6px}
      .section__head{display:flex;align-items:center;gap:8px;margin-bottom:10px}
      .section__head h2{margin:0;font-size:22px;color:var(--text)}
      .count{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9999px;border:1px solid #eaeaea;background:var(--card);font-size:12px;color:#666}
      .exams-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;justify-items:center;max-width:700px;margin:0 auto}
      .exam-card{background:#c1f2cd;padding:1rem;border-radius:8px;text-decoration:none;color:#000;font-weight:bold;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);transition:transform 0.2s ease,background 0.2s}
      .exam-card:hover{transform:scale(1.03)}
      .exam-card--completed{background:#a7f3d0}
      .exam-card__title{font-size:16px;margin-bottom:4px}
      .exam-card__status{font-size:0.9rem;color:#333}
      .navigation{text-align:center;margin-top:2rem}
      .back-link{text-decoration:none;color:#0070f3;font-weight:bold;display:inline-block;padding:0.75rem 1.25rem;border:2px solid #0070f3;border-radius:6px;transition:background 0.3s,color 0.3s}
      .back-link:hover{background:#0070f3;color:#fff}
    `}</style>
  );
}
