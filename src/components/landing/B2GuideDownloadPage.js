import Link from 'next/link';
import B2GuideDownloadForm from '@/components/landing/B2GuideDownloadForm';
import '@/styles/conversion-landing.css';
import '@/styles/b2-guide-landing.css';

const BENEFITS = [
  {
    title: 'Conoce el examen',
    text: 'Qué te pide cada parte y cómo se evalúa.',
    icon: 'book',
  },
  {
    title: 'Organiza tu estudio',
    text: 'Con un plan de 12 o 6 semanas.',
    icon: 'calendar',
  },
  {
    title: 'Practica con un objetivo',
    text: 'Estrategias y recursos para avanzar.',
    icon: 'target',
  },
];

const FEATURES = [
  {
    title: 'El examen, parte por parte',
    text: 'Reading and Use of English, Writing, Listening y Speaking.',
    icon: 'book',
  },
  {
    title: 'Tu plan de preparación',
    text: 'Una ruta de 12 semanas y una alternativa de 6.',
    icon: 'calendar',
  },
  {
    title: 'Estrategias de examen',
    text: 'Gestiona el tiempo y evita errores frecuentes.',
    icon: 'target',
  },
  {
    title: 'Writing y Speaking',
    text: 'Estructuras, checklists y frases útiles.',
    icon: 'pen',
  },
  {
    title: 'Gramática y vocabulario',
    text: 'Repasa estructuras B2, colocaciones y phrasal verbs.',
    icon: 'book',
  },
  {
    title: 'Progreso y recta final',
    text: 'Registra tus errores y prepara el día del examen.',
    icon: 'chart',
  },
];

function Icon({ name }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (name === 'calendar') {
    return (
      <svg {...common}>
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
      </svg>
    );
  }
  if (name === 'target') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'pen') {
    return (
      <svg {...common}>
        <path d="M4 20l4.2-1.1L19 8.1a2 2 0 0 0 0-2.8l-.3-.3a2 2 0 0 0-2.8 0L5.1 15.8 4 20z" />
        <path d="M13.5 6.5l4 4" />
      </svg>
    );
  }
  if (name === 'chart') {
    return (
      <svg {...common}>
        <path d="M4 19h16" />
        <path d="M7 16v-4M12 16V8M17 16v-6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M6 5.5h9.5A2.5 2.5 0 0 1 18 8v11.5H8.5A2.5 2.5 0 0 1 6 17V5.5z" />
      <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H16" />
      <path d="M9 9h6M9 12.5h6" />
    </svg>
  );
}

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
      <header className="b2-guide__top">
        <Link href="/" className="b2-guide__brand">
          DRALO
        </Link>
        <p className="b2-guide__top-label">Guía B2 First</p>
        <Link href="/" className="b2-guide__top-link">
          Ir a DRALO →
        </Link>
      </header>

      <div className="b2-guide__shell">
        <section className="b2-guide__hero">
          <div className="b2-guide__hero-copy">
            <p className="b2-guide__kicker">Guía gratuita · B2 First</p>
            <h1>
              Deja de estudiar a ciegas.
              <span> Prepara tu B2 con un plan.</span>
            </h1>
            <p className="b2-guide__lead">
              Descubre qué te pide cada parte del examen y organiza tu preparación con una ruta clara.
            </p>
            <DownloadLink>
              Quiero la guía gratis <span aria-hidden="true">→</span>
            </DownloadLink>
            <p className="b2-guide__micro">PDF gratuito · Plan de 12 o 6 semanas</p>
          </div>
          <div className="b2-guide__art" aria-hidden="true">
            <div className="b2-guide__sheet b2-guide__sheet--back">
              <strong>1. El examen, parte por parte</strong>
              <span>Cómo se evalúa cada una y qué practicar primero.</span>
              <ul>
                <li>Reading and Use of English</li>
                <li>Writing</li>
                <li>Listening</li>
                <li>Speaking</li>
              </ul>
            </div>
            <div className="b2-guide__sheet b2-guide__sheet--mid">
              <strong>Tu plan de 12 semanas</strong>
              <span>Lunes a viernes, una hora al día.</span>
            </div>
            <div className="b2-guide__book">
              <p>Dralo Academy</p>
              <h2>La guía completa del B2 First</h2>
              <ul>
                <li>Reading</li>
                <li>Writing</li>
                <li>Listening</li>
                <li>Speaking</li>
              </ul>
              <img src="/mascot/6.png" alt="" />
            </div>
          </div>
        </section>

        <ul className="b2-guide__benefits">
          {BENEFITS.map((item) => (
            <li key={item.title}>
              <span className="b2-guide__icon">
                <Icon name={item.icon} />
              </span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>

        <section className="b2-guide__block" aria-labelledby="b2-guide-contents">
          <h2 id="b2-guide-contents">Todo lo que necesitas para empezar con claridad.</h2>
          <p className="b2-guide__sub">
            Una guía para pasar de «tengo que estudiar» a saber qué hacer hoy.
          </p>
          <div className="b2-guide__grid">
            {FEATURES.map((item) => (
              <section key={item.title} className="b2-guide__feature">
                <span className="b2-guide__icon">
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="b2-guide__plans" aria-labelledby="b2-guide-plans">
          <div>
            <h2 id="b2-guide-plans">
              Tu preparación, <span>con una dirección clara.</span>
            </h2>
            <p>
              Empieza por conocer el examen, detecta qué partes te cuestan más y sigue una ruta de
              práctica.
            </p>
          </div>
          <div className="b2-guide__plan">
            <span className="b2-guide__icon">
              <Icon name="calendar" />
            </span>
            <h3>12 semanas</h3>
            <p>Construye una rutina paso a paso.</p>
            <span className="b2-guide__bar" />
          </div>
          <div className="b2-guide__plan">
            <span className="b2-guide__icon">
              <Icon name="calendar" />
            </span>
            <h3>6 semanas</h3>
            <p>Prioriza si tu examen está más cerca.</p>
            <span className="b2-guide__bar b2-guide__bar--short" />
          </div>
        </section>
      </div>

      <section className="b2-guide__band" aria-labelledby="b2-guide-band">
        <div className="b2-guide__shell b2-guide__band-grid">
          <div className="b2-guide__band-copy">
            <h2 id="b2-guide-band">
              Menos improvisación.
              <span> Más claridad para tu B2.</span>
            </h2>
            <p>
              Recibe la guía y ten a mano tu plan, las estrategias y los recursos cuando te pongas a
              estudiar.
            </p>
          </div>
          <B2GuideDownloadForm />
        </div>
      </section>

      <section className="b2-guide__practice">
        <div className="b2-guide__shell">
          <h2>Del plan a la práctica.</h2>
          <p>Pon en práctica lo aprendido con DRALO.</p>
          <Link href="/" className="b2-guide__button">
            Conocer DRALO <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <footer className="b2-guide__foot">
        <div className="b2-guide__shell b2-guide__foot-row">
          <div>
            <p className="b2-guide__brand">DRALO</p>
            <p>Learn. Practise. Improve.</p>
          </div>
          <nav aria-label="Legal">
            <Link href="/politica-privacidad">Privacidad</Link>
            <Link href="/politica-cookies">Cookies</Link>
            <Link href="/contacto">Contacto</Link>
          </nav>
        </div>
      </footer>
    </article>
  );
}
