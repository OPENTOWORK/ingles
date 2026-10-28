import Link from 'next/link';
import B2GuideDownloadForm from '@/components/landing/B2GuideDownloadForm';
import '@/styles/conversion-landing.css';
import '@/styles/b2-guide-landing.css';

const FEATURES = [
  {
    title: 'Las 17 partes del examen, explicadas con claridad',
    text: 'Descubre qué te pide cada tarea de Reading and Use of English, Writing, Listening y Speaking. Encontrarás ejemplos, tiempos orientativos y consejos específicos para saber cómo abordarla.',
  },
  {
    title: 'Un plan de estudio de 12 semanas',
    text: 'Organiza la preparación en sesiones concretas, con una rutina de lunes a viernes. El plan avanza desde el diagnóstico y la práctica por partes hasta los simulacros cronometrados.',
  },
  {
    title: '¿Tienes menos tiempo? También hay un plan de 6 semanas',
    text: 'Adapta la preparación si tu examen está más cerca y necesitas priorizar los contenidos y las prácticas más importantes.',
  },
  {
    title: 'Estrategias para cada parte del examen',
    text: 'Aprende a gestionar el tiempo, entender qué busca cada tarea y evitar trampas habituales, como elegir una respuesta porque repite palabras del texto o dejar una pregunta en blanco.',
  },
  {
    title: 'Recursos prácticos para Writing y Speaking',
    text: 'Consulta estructuras para tus textos, checklists de revisión y frases útiles para expresarte, comparar fotos, dar tu opinión y mantener una conversación.',
  },
  {
    title: 'Gramática, vocabulario y errores que conviene revisar',
    text: 'Repasa una lista de estructuras de nivel B2, phrasal verbs, colocaciones y falsos amigos. Identifica errores frecuentes para saber qué corregir en tu práctica.',
  },
  {
    title: 'Una forma de seguir tu progreso y preparar el día del examen',
    text: 'Registra tus resultados y errores para ver en qué partes te conviene centrarte. La guía también incluye recomendaciones para la última semana y el día del examen.',
  },
];

function DownloadLink({ children, className = '' }) {
  return (
    <Link href="#descargar" className={`b2-guide__button ${className}`.trim()}>
      {children}
    </Link>
  );
}

export default function B2GuideDownloadPage() {
  return (
    <article className="b2-guide">
      <div className="b2-guide__shell">
        <header className="b2-guide__hero">
          <p className="b2-guide__kicker">Guía gratuita · B2 First de Cambridge</p>
          <h1>Deja de estudiar a ciegas: prepara el B2 First parte por parte</h1>
          <p className="b2-guide__lead">
            Descarga la guía completa de Dralo y descubre qué te pide cada ejercicio, cómo evitar
            errores frecuentes y cómo organizar hasta 12 semanas de preparación, incluso si solo
            puedes estudiar alrededor de una hora al día.
          </p>
          <DownloadLink>Descargar la guía gratis</DownloadLink>
          <p className="b2-guide__micro">
            Guía gratuita en PDF. Accede a ella y empieza a preparar tu examen.
          </p>
        </header>

        <section className="b2-guide__block" aria-labelledby="b2-guide-contents">
          <h2 id="b2-guide-contents">¿Qué encontrarás en la guía?</h2>
          <div className="b2-guide__grid">
            {FEATURES.map((item) => (
              <section key={item.title} className="b2-guide__card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </section>
            ))}
          </div>
          <p className="b2-guide__actions">
            <DownloadLink>Quiero descargar la guía</DownloadLink>
          </p>
        </section>

        <section className="b2-guide__close" aria-labelledby="b2-guide-close">
          <h2 id="b2-guide-close">Una guía para convertir “tengo que estudiar” en un plan concreto</h2>
          <p>
            No necesitas improvisar cada semana. Empieza por conocer el examen, detecta qué partes
            te cuestan más y sigue una ruta de práctica clara hasta los simulacros finales.
          </p>
          <p>Descarga la guía gratuita y empieza hoy.</p>
          <DownloadLink>Descargar PDF</DownloadLink>
        </section>

        <B2GuideDownloadForm />
      </div>
    </article>
  );
}
