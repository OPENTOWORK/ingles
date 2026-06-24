import Link from 'next/link';
import { SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = {
  title: SEO_PAGE_META.examTheory.title,
  description: SEO_PAGE_META.examTheory.description,
  alternates: { canonical: '/exam-strategies/' },
};

export default function ExamTheoryLandingPage() {
  return (
    <main className="shell public-seo-page">
      <header className="public-seo-page__hero">
        <p className="public-seo-page__eyebrow">Exam Strategies</p>
        <h1>Estrategias y tips para exámenes Cambridge</h1>
        <p className="public-seo-page__lead">
          Estrategias por parte del examen, timing, formatos de tarea y errores frecuentes —
          filtrado por nivel CEFR y por habilidad.
        </p>
        <ul className="public-seo-page__benefits">
          <li>Reading, Use of English, Writing, Listening y Speaking</li>
          <li>Tips interactivos por parte del examen</li>
          <li>Contenido alineado con la práctica de Dralo</li>
        </ul>
        <div className="public-seo-page__actions">
          <Link href="/exam-strategies/" className="home-cta__btn home-cta__btn--inline">
            Explorar Exam Strategies
          </Link>
          <Link href="/teoria/" className="public-seo-page__secondary-link">
            Ver teoría general de gramática
          </Link>
        </div>
      </header>

      <section className="public-seo-page__section">
        <h2>¿Qué encontrarás?</h2>
        <p>
          Cada skill del examen incluye explicaciones del formato, consejos prácticos y enlaces a
          ejercicios en Exam Practice. Regístrate cuando quieras guardar progreso o desbloquear
          contenido personalizado.
        </p>
      </section>
    </main>
  );
}
