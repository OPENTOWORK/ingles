'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  ChartColumnIncreasing,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  CreditCard,
  FileText,
  Gift,
  Lightbulb,
  Target,
} from 'lucide-react';
import { APP_ROUTES } from '@/config/appRoutes';
import DraloTagline from '@/components/DraloTagline';
import { MAX_FOUNDING_SLOT } from '@/lib/foundingMemberPlus.rules';
import {
  FOUNDING_SURVEY_DELAY_DAYS,
  FOUNDING_SURVEY_RESPONSE_DAYS,
} from '@/lib/foundingSurvey.rules';
import { SESSION_HINT_CLASS } from '@/lib/sessionHint';
import { sitePublicPath } from '@/utils/sitePublicPath';
import { landingFont } from './landingFont';
import { PracticePickerMock, ResultsMock, ReviewMock, WritingFeedbackMock } from './LandingMocks';
import './home-guest-landing.css';

const REGISTER_HREF = '/registro';
const TOUR_VIDEO_SRC = sitePublicPath('/dralo-tour.mp4?v=4');
const TOUR_POSTER_SRC = sitePublicPath('/dralo-tour-poster.webp?v=4');
/** Mismo corte que la home de móvil, que sigue mandando por debajo. */
const DESKTOP_MQ = '(min-width: 640px)';

const QUESTIONS = [
  {
    icon: CircleHelp,
    title: '¿Por qué sigues cometiendo los mismos errores?',
    text: 'Identifica tus errores y entiende por qué ocurren.',
  },
  {
    icon: Target,
    title: '¿Qué partes del examen necesitas practicar más?',
    text: 'Descubre en qué áreas debes centrar tu esfuerzo.',
  },
  {
    icon: ChartColumnIncreasing,
    title: '¿Cómo puedes saber si estás progresando?',
    text: 'Sigue tu evolución y ve tus mejoras en los resultados.',
  },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'Practica con formato de examen',
    text: 'Familiarízate con las preguntas y el tipo de ejercicios del B2 First.',
  },
  {
    icon: Lightbulb,
    title: 'Entiende tus errores',
    text: 'Revisa tus resultados y las correcciones con explicaciones claras.',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'Sigue tu progreso',
    text: 'Consulta tus resultados e identifica en qué aspectos necesitas centrarte.',
  },
];

const WRITING_CHECKS = [
  'Corrección de gramática, vocabulario y coherencia.',
  'Comentarios claros y prácticos.',
  'Sugerencias para mejorar tu expresión.',
];

const STEPS = [
  {
    title: 'Elige qué practicar',
    text: 'Accede a las actividades de Reading and Use of English, Writing y Listening.',
    Mock: PracticePickerMock,
  },
  {
    title: 'Revisa tus resultados',
    text: 'Completa las actividades y consulta tus resultados y correcciones.',
    Mock: ReviewMock,
  },
  {
    title: 'Decide en qué centrarte',
    text: 'Utiliza tu progreso para orientar tus siguientes sesiones.',
    Mock: ResultsMock,
  },
];

const FAQ = [
  {
    q: '¿Necesito una tarjeta?',
    a: 'No. El registro pide nombre, correo y contraseña. No hay ningún campo de tarjeta.',
  },
  {
    q: '¿Cómo conservo el Plan Plus gratis?',
    a: `Pruebas Dralo durante ${FOUNDING_SURVEY_DELAY_DAYS} días. Al cumplirse, te enviamos un formulario y tienes ${FOUNDING_SURVEY_RESPONSE_DAYS} días para completarlo. Si lo completas, conservas el Plan Plus gratis para siempre. Si no, tu cuenta pasa al plan gratuito.`,
    offer: true,
  },
  {
    q: '¿Dralo sustituye a mi academia?',
    a: 'No. La academia o la profesora enseñan. Dralo sirve para practicar fuera de clase, ver el feedback y seguir tu progreso.',
  },
];

/** `desktop` es null hasta montar, para no cargar el vídeo en móvil. */
function useLandingViewport() {
  const [view, setView] = useState({ desktop: null, sessionHint: false });

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const sessionHint = document.documentElement.classList.contains(SESSION_HINT_CLASS);
    const sync = () => setView({ desktop: media.matches, sessionHint });
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return view;
}

/** Plazas del endpoint público. Sin dato no se inventa ninguna cifra. */
function useFoundingSlots(enabled) {
  const [slots, setSlots] = useState({ status: 'loading' });

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    const load = () => {
      fetch(`/api/founding-member/slots/?_=${Date.now()}`, { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('slots'))))
        .then((data) => {
          if (cancelled) return;
          const remaining = Number(data?.remaining);
          if (!Number.isInteger(remaining) || remaining < 0) {
            setSlots({ status: 'unknown' });
            return;
          }
          setSlots({
            status: 'ready',
            remaining,
            soldOut: Boolean(data?.soldOut) || remaining === 0,
          });
        })
        .catch(() => {
          if (!cancelled) setSlots((prev) => (prev.status === 'ready' ? prev : { status: 'unknown' }));
        });
    };

    load();
    const handleVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [enabled]);

  return slots;
}

function SlotsBox({ slots }) {
  if (slots.status === 'unknown') {
    return (
      <p className="hl-slots hl-slots--plain" role="status">
        Plazas limitadas
      </p>
    );
  }

  const loading = slots.status === 'loading';
  const one = slots.remaining === 1;
  return (
    <Link href={REGISTER_HREF} className="hl-slots" role="status" aria-busy={loading}>
      <span className="hl-slots__kicker">
        <span className="hl-slots__dot" aria-hidden="true" />
        {one ? 'Solo queda' : 'Solo quedan'}
      </span>
      <span className="hl-slots__count">
        {loading ? (
          <span className="hl-slots__num hl-slots__num--loading" aria-hidden="true" />
        ) : (
          <strong className="hl-slots__num">{slots.remaining}</strong>
        )}
        <span className="hl-slots__unit">{one ? 'plaza' : 'plazas'}</span>
      </span>
      <span className="hl-slots__of">de las {MAX_FOUNDING_SLOT} iniciales</span>
      <span className="hl-slots__go" aria-hidden="true">
        <ChevronRight />
      </span>
    </Link>
  );
}

/**
 * Home sin sesión en ordenador (desde 640px). En móvil sigue la home de app.
 * `pending`: aún no se sabe si hay sesión; se pinta por si es un invitado.
 */
export default function HomeGuestLanding({ pending = false }) {
  const { desktop, sessionHint } = useLandingViewport();
  const visible = desktop === true && !(pending && sessionHint);
  const slots = useFoundingSlots(visible);
  const offerOpen = !(slots.status === 'ready' && slots.soldOut);
  const faq = offerOpen ? FAQ : FAQ.filter((item) => !item.offer);

  return (
    <div className={`home-landing ${landingFont.variable}${pending ? ' home-landing--pending' : ''}`}>
      <header className="hl-header">
        <div className="hl-container hl-header__bar">
          <Link href="/" className="hl-logo">
            Dralo Academy
          </Link>
          <nav className="hl-nav" aria-label="Secciones">
            <a href="#como-funciona" className="hl-nav__link">
              Cómo funciona
            </a>
            <Link href={APP_ROUTES.examPracticeDefaultLevel} className="hl-nav__link">
              Práctica B2 First
            </Link>
            {offerOpen ? (
              <a href="#plan-plus" className="hl-nav__link">
                Plan Plus
              </a>
            ) : (
              <Link href="/precios" className="hl-nav__link">
                Plan Plus
              </Link>
            )}
            <a href="#preguntas-frecuentes" className="hl-nav__link hl-nav__link--wide">
              Preguntas frecuentes
            </a>
            <Link href="/precios" className="hl-nav__link">
              Precios
            </Link>
            <Link href="/contacto" className="hl-nav__link hl-nav__link--wide">
              Contacto
            </Link>
          </nav>
          <div className="hl-header__actions">
            <Link href={APP_ROUTES.login} className="hl-btn hl-btn--ghost">
              Iniciar sesión
            </Link>
            <Link href={REGISTER_HREF} className="hl-btn hl-btn--primary">
              Crear mi cuenta gratis
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <section className="hl-hero" aria-labelledby="hl-hero-title">
        <div className="hl-container hl-hero__grid">
          <div className="hl-hero__copy">
            <p className="hl-kicker">Prepara tu B2 First</p>
            <h1 id="hl-hero-title" className="hl-hero__title">
              <span>Practica.</span>
              <span>Entiende tus errores.</span>
              <span className="hl-hero__title-accent">Mejora tu B2.</span>
            </h1>
            <p className="hl-hero__lead">
              Practica con formato de examen y descubre qué necesitas mejorar.
            </p>
            <div className="hl-hero__actions">
              <Link href={REGISTER_HREF} className="hl-btn hl-btn--primary hl-btn--lg">
                Empieza gratis
                <ArrowRight aria-hidden="true" />
              </Link>
              <ul className="hl-hero__notes">
                <li>
                  <CreditCard aria-hidden="true" />
                  Sin tarjeta
                </li>
                <li>
                  <Clock aria-hidden="true" />A tu ritmo
                </li>
              </ul>
            </div>
          </div>

          <figure className="hl-hero__media">
            <div className="hl-hero__stage">
              <div className="hl-video" style={{ backgroundImage: `url(${TOUR_POSTER_SRC})` }}>
                {visible ? (
                  <video
                    className="hl-video__media"
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    poster={TOUR_POSTER_SRC}
                    aria-label="Práctica en Dralo: reading, writing, listening, quiz y training"
                  >
                    <source src={TOUR_VIDEO_SRC} type="video/mp4" />
                  </video>
                ) : null}
              </div>
              <Image
                src={sitePublicPath('/mascot/3.png')}
                alt=""
                width={220}
                height={220}
                sizes="220px"
                className="hl-hero__mascot"
              />
            </div>
            <figcaption className="hl-hero__caption">Descubre cómo practicar con DRALO</figcaption>
            <DraloTagline className="hl-hero__slogan" />
          </figure>
        </div>
      </section>

      {offerOpen ? (
        <section id="plan-plus" className="hl-container hl-offer" aria-labelledby="hl-offer-title">
          <span className="hl-gift" aria-hidden="true">
            <Gift />
          </span>
          <div>
            <h2 id="hl-offer-title" className="hl-offer__title">
              Tu Plan Plus gratis para siempre
            </h2>
            <p className="hl-offer__text">
              Para los primeros {MAX_FOUNDING_SLOT} registros que cumplan las condiciones.
            </p>
          </div>
          <SlotsBox slots={slots} />
        </section>
      ) : null}

      <section className="hl-section" aria-labelledby="hl-problem-title">
        <div className="hl-container hl-problem">
          <div>
            <h2 id="hl-problem-title" className="hl-h2">
              ¿Practicas mucho,
              <br />
              pero no sabes si mejoras?
            </h2>
            <p className="hl-lead">
              Haces ejercicios, repasas gramática, estudias vocabulario... Pero cuando te preguntas
              qué necesitas mejorar para el examen, la respuesta no siempre está clara.
            </p>
          </div>
          <ul className="hl-qcards">
            {QUESTIONS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="hl-qcard">
                <span className="hl-icon-badge" aria-hidden="true">
                  <Icon />
                </span>
                <h3 className="hl-qcard__title">{title}</h3>
                <p className="hl-qcard__text">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hl-section hl-section--flush" aria-labelledby="hl-clear-title">
        <div className="hl-container hl-panel">
          <div className="hl-center">
            <h2 id="hl-clear-title" className="hl-h2">
              Una forma más clara de preparar tu B2
            </h2>
            <p className="hl-lead">
              DRALO reúne herramientas de práctica y seguimiento para ayudarte a prepararte de forma
              organizada.
            </p>
          </div>
          <ul className="hl-features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="hl-feature">
                <span className="hl-icon-badge hl-icon-badge--lg" aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <h3 className="hl-feature__title">{title}</h3>
                  <p className="hl-feature__text">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hl-section" aria-labelledby="hl-writing-title">
        <div className="hl-container hl-writing">
          <div>
            <h2 id="hl-writing-title" className="hl-h2">
              Tu Writing merece más que una nota.
            </h2>
            <p className="hl-lead">
              Recibe correcciones y comentarios detallados para entender qué puedes mejorar.
            </p>
            <ul className="hl-checks">
              {WRITING_CHECKS.map((item) => (
                <li key={item}>
                  <span className="hl-check" aria-hidden="true">
                    <Check />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <WritingFeedbackMock />
        </div>
      </section>

      <section id="como-funciona" className="hl-section hl-section--flush" aria-labelledby="hl-steps-title">
        <div className="hl-container">
          <div className="hl-center">
            <h2 id="hl-steps-title" className="hl-h2">
              Así funciona DRALO
            </h2>
            <p className="hl-lead">
              En solo 3 pasos, empieza a practicar, entiende tus errores y centra tu estudio en lo
              que realmente necesitas.
            </p>
          </div>
          <ol className="hl-steps">
            {STEPS.map(({ title, text, Mock }, index) => (
              <li key={title} className="hl-step">
                <div className="hl-step__head">
                  <span className="hl-step__num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="hl-step__title">{title}</h3>
                    <p className="hl-step__text">{text}</p>
                  </div>
                </div>
                <Mock />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="hl-section hl-bands">
        {offerOpen ? (
          <section className="hl-container hl-cta" aria-labelledby="hl-cta-title">
            <span className="hl-gift hl-gift--lg" aria-hidden="true">
              <Gift />
            </span>
            <div>
              <h2 id="hl-cta-title" className="hl-cta__title">
                Empieza con el Plan Plus gratis para siempre
              </h2>
              <p className="hl-cta__text">
                Prueba DRALO durante {FOUNDING_SURVEY_DELAY_DAYS} días. Después te enviaremos un
                formulario: complétalo en los {FOUNDING_SURVEY_RESPONSE_DAYS} días siguientes para
                conservar el Plan Plus gratis. Si no lo completas, tu cuenta pasa al plan gratuito.
              </p>
            </div>
            <Link href={REGISTER_HREF} className="hl-btn hl-btn--primary hl-btn--lg">
              Quiero empezar gratis
              <ArrowRight aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        <div className="hl-container hl-claim">
          <Image
            src={sitePublicPath('/mascot/8.png')}
            alt=""
            width={210}
            height={210}
            sizes="210px"
            className="hl-claim__mascot"
          />
          <p className="hl-claim__text">
            El complemento de tus clases.
            <span>El impulso de tu práctica.</span>
          </p>
        </div>
      </div>

      <section id="preguntas-frecuentes" className="hl-section hl-section--flush" aria-labelledby="hl-faq-title">
        <div className="hl-container">
          <div className="hl-faq__head">
            <h2 id="hl-faq-title" className="hl-h2 hl-h2--sm">
              Preguntas frecuentes
            </h2>
            <Link href="/contacto/faq" className="hl-faq__all">
              Ver todas las preguntas
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="hl-faq__list">
            {faq.map(({ q, a }) => (
              <details key={q} className="hl-faq__item">
                <summary>
                  <span className="hl-faq__mark" aria-hidden="true">
                    ?
                  </span>
                  <span className="hl-faq__q">{q}</span>
                  <ChevronDown className="hl-faq__chevron" aria-hidden="true" />
                </summary>
                <p className="hl-faq__answer">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="hl-final" aria-labelledby="hl-final-title">
        <div className="hl-container hl-final__inner">
          <h2 id="hl-final-title" className="hl-final__title">
            Tu próxima sesión de estudio empieza aquí.
          </h2>
          <p className="hl-final__text">
            Practica el B2 First, revisa tus errores y utiliza tus resultados para orientar tu
            preparación.
          </p>
          <Link href={REGISTER_HREF} className="hl-btn hl-btn--light hl-btn--lg">
            Crear mi cuenta gratis
            <ArrowRight aria-hidden="true" />
          </Link>
          <p className="hl-final__domain">dralo.es</p>
        </div>
      </section>
    </div>
  );
}
