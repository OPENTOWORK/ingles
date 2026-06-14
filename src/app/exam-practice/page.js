import Link from 'next/link';
import { SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = {
  title: SEO_PAGE_META.examPractice.title,
  description: SEO_PAGE_META.examPractice.description,
  alternates: { canonical: '/exam-practice/' },
};

const LEVELS = [
  { code: 'A2', name: 'Elementary', color: '#58cc02' },
  { code: 'B1', name: 'Intermediate', color: '#ff9900' },
  { code: 'B2', name: 'Upper-Intermediate', color: '#1cb0f6' },
  { code: 'C1', name: 'Advanced', color: '#8e44ad' },
  { code: 'C2', name: 'Mastery', color: '#e74c3c' },
];

export default function ExamPracticeLandingPage() {
  return (
    <main className="shell public-seo-page">
      <header className="public-seo-page__hero">
        <p className="public-seo-page__eyebrow">CEFR exam practice</p>
        <h1>Practica exámenes de inglés por nivel</h1>
        <p className="public-seo-page__lead">
          Simulacros por habilidad, exam mode con cronómetro y práctica parte a parte — Reading, Use
          of English, Writing, Listening y Speaking.
        </p>
        <ul className="public-seo-page__benefits">
          <li>Ejercicios alineados con exámenes Cambridge (A2–C2)</li>
          <li>Feedback inmediato y herramientas de estudio</li>
          <li>Elige tu nivel y empieza sin compromiso</li>
        </ul>
        <div className="public-seo-page__actions">
          <Link href="/niveles/" className="home-cta__btn home-cta__btn--inline">
            Ver niveles disponibles
          </Link>
          <Link href="/login/" className="public-seo-page__secondary-link">
            Iniciar sesión para guardar progreso
          </Link>
        </div>
      </header>

      <section className="public-seo-page__section" aria-labelledby="levels-heading">
        <h2 id="levels-heading">Niveles disponibles</h2>
        <ul className="area-grid niveles-grid">
          {LEVELS.map((level) => (
            <li key={level.code}>
              <Link href={`/niveles/${level.code.toLowerCase()}/`} className="area-card">
                <div className="area-card__head">
                  <span
                    className="area-card__icon"
                    style={{ background: level.color }}
                    aria-hidden
                  >
                    {level.code}
                  </span>
                  <span className="area-card__title">{level.name}</span>
                </div>
                <span className="area-card__desc">Mock exams, timed papers and part practice.</span>
                <span className="area-card__meta">Explorar {level.code} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
