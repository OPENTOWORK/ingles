'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  ChartColumnIncreasing,
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  CreditCard,
  Gift,
  Pause,
  Play,
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
const TRY_EXERCISE_HREF = '/exam-practice/b2/exam-reading-and-use-of-english/?examen=1';
const WRITING_PRACTICE_HREF = '/exam-practice/b2/exam-writing/';
const CONTACT_EMAIL = 'draloenglish@gmail.com';
const TOUR_VIDEO_SRC = sitePublicPath('/dralo-tour.mp4?v=4');
const TOUR_POSTER_SRC = sitePublicPath('/dralo-tour-poster.webp?v=4');

const PAIRS = [
  {
    icon: CircleHelp,
    question: '¿Por qué sigues cometiendo los mismos errores?',
    benefitTitle: 'Entiende tus errores',
    benefit: 'revisa tus resultados y las correcciones con explicaciones claras.',
  },
  {
    icon: Target,
    question: '¿Qué partes del examen necesitas practicar más?',
    benefitTitle: 'Practica con formato de examen',
    benefit: 'familiarízate con las preguntas y el tipo de ejercicios del B2 First.',
  },
  {
    icon: ChartColumnIncreasing,
    question: '¿Cómo puedes saber si estás progresando?',
    benefitTitle: 'Sigue tu progreso',
    benefit: 'consulta tus resultados e identifica en qué aspectos necesitas centrarte.',
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
    published: true,
  },
  {
    q: '¿Cómo conservo el Plan Plus gratis?',
    a: `Pruebas Dralo durante ${FOUNDING_SURVEY_DELAY_DAYS} días. Al cumplirse, te enviamos un formulario con preguntas sobre qué te parece la web y qué se puede mejorar, y tienes ${FOUNDING_SURVEY_RESPONSE_DAYS} días para completarlo. Si lo completas, conservas el Plan Plus gratis para siempre. Si no, tu cuenta pasa al plan gratuito.`,
    offer: true,
    published: true,
  },
  {
    q: '¿Qué incluye el plan gratuito y qué el Plus?',
    a: 'En el plan gratuito hay 1 examen de prueba, 1 corrección de Writing al mes, Training y Quiz con 3 vidas (se recupera 1 cada 10 horas) y Exam Strategies. El Plan Plus incluye 10 exámenes al mes, 10 correcciones de Writing al mes con corrección avanzada, Training y Quiz con vidas ilimitadas, seguimiento del progreso y 30 consultas a Dralo Assistant al día.',
    published: true,
  },
  {
    q: '¿Cómo se corrige mi Writing y cuánto tarda?',
    a: 'La política de privacidad y los términos de uso describen la corrección como automática y asistida por herramientas de inteligencia artificial. En la corrección verás marcas de gramática, vocabulario y contenido. No hay un plazo de respuesta publicado.',
    published: true,
  },
  {
    q: '¿Es un producto oficial de Cambridge?',
    a: 'No. Los términos de uso dicen que Dralo no constituye un organismo certificador oficial ni garantiza la obtención de títulos, certificados o resultados concretos en exámenes oficiales.',
    published: true,
  },
  {
    q: '¿Funciona en el móvil?',
    a: 'Sí. Puedes practicar desde el navegador del móvil, con la misma cuenta.',
    published: true,
  },
  {
    q: '¿Qué hacéis con mis datos?',
    a: 'El responsable es Servipacar SL (nombre comercial Dralo, CIF B82133760). Usamos los datos de la cuenta, el progreso y los ejercicios para prestar el servicio. Las correcciones pueden tratarse con herramientas de inteligencia artificial. Para ejercer tus derechos puedes escribir a draloenglish@gmail.com. El detalle está en https://www.dralo.es/politica-privacidad/.',
    published: true,
  },
  {
    q: '¿Dralo sustituye a mi academia?',
    a: 'No. La academia o la profesora enseñan. Dralo sirve para practicar fuera de clase, ver el feedback y seguir tu progreso.',
    published: true,
  },
];

function publishedFaq(items, offerOpen) {
  return items.filter((item) => item.published && (offerOpen || !item.offer));
}

function faqJsonLd(items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }).replace(/</g, '\\u003c');
}

/** dataLayer/gtag ya usados por GA4. Solo con consentimiento de analítica. */
function trackHomeEvent(eventName) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem('dralo_cookie_consent');
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed?.preferences?.analytics) return;
  } catch {
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName });
  if (typeof window.gtag === 'function') window.gtag('event', eventName);
}

/** No cargar el vídeo hasta saber si la cookie de sesión va a ocultar la landing. */
function useLandingViewport() {
  const [view, setView] = useState({ ready: false, sessionHint: false });

  useEffect(() => {
    setView({
      ready: true,
      sessionHint: document.documentElement.classList.contains(SESSION_HINT_CLASS),
    });
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
          const rawRemaining = data?.remaining;
          const remaining = Number(rawRemaining);
          if (rawRemaining == null || rawRemaining === '' || !Number.isInteger(remaining) || remaining < 0) {
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
  if (slots.status === 'unknown') return null;
  if (slots.status === 'ready' && (slots.soldOut || slots.remaining === 0)) {
    return (
      <p className="hl-slots hl-slots--sold-out" role="status">
        <span className="hl-slots__kicker">
          <span className="hl-slots__dot" aria-hidden="true" />
          Agotado
        </span>
        <span className="hl-slots__count">
          <strong className="hl-slots__num hl-slots__num--word">Agotadas</strong>
        </span>
        <span className="hl-slots__of">Las {MAX_FOUNDING_SLOT} plazas iniciales ya están asignadas.</span>
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

function HeroTourVideo({ active }) {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const userPaused = useRef(false);
  const playedOnce = useRef(false);
  const [motion, setMotion] = useState('pending');
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotion(query.matches ? 'reduce' : 'ok');
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || motion !== 'ok' || !active || userPaused.current) return undefined;
    video.play().catch(() => {});
    return undefined;
  }, [motion, active]);

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video || motion === 'pending') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          video.pause();
          return;
        }
        if (motion === 'ok' && !userPaused.current) video.play().catch(() => {});
      },
      { threshold: 0.25 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [motion, active]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
      return;
    }
    userPaused.current = true;
    video.pause();
  };

  return (
    <>
    <div className="hl-video" ref={frameRef}>
      <img
        className="hl-video__poster"
        src={TOUR_POSTER_SRC}
        alt=""
        width={1280}
        height={720}
        fetchPriority="high"
        decoding="async"
      />
      {active && motion !== 'pending' ? (
          <video
          ref={videoRef}
          className="hl-video__media"
          muted
          autoPlay={motion === 'ok'}
          loop
          playsInline
          preload="metadata"
          poster={TOUR_POSTER_SRC}
          data-started={started ? 'true' : 'false'}
          aria-describedby="hl-hero-caption"
          onPlay={() => {
            setStarted(true);
            setPlaying(true);
            playedOnce.current = true;
            trackHomeEvent('hero_video_play');
          }}
          onPause={() => {
            setPlaying(false);
            if (playedOnce.current) trackHomeEvent('hero_video_pause');
          }}
        >
          <source src={TOUR_VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}
    </div>
    <button
      type="button"
      className="hl-video__toggle"
      aria-pressed={playing}
      onClick={toggle}
      disabled={!active || motion === 'pending'}
    >
      {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      {playing ? 'Pausa' : 'Reproducir'}
    </button>
    </>
  );
}

/**
 * Home sin sesión, en ordenador y en móvil.
 * `pending`: aún no se sabe si hay sesión; se pinta por si es un invitado.
 */
export default function HomeGuestLanding({ pending = false, prioritizeLcp = false }) {
  const { ready, sessionHint } = useLandingViewport();
  const visible = ready && !(pending && sessionHint);
  const slots = useFoundingSlots(visible);
  const offerOpen = !(slots.status === 'ready' && slots.soldOut);
  const faq = publishedFaq(FAQ, offerOpen);

  return (
    <div className={`home-landing ${landingFont.variable}${pending ? ' home-landing--pending' : ''}`}>
      {prioritizeLcp ? (
        <link rel="preload" as="image" href={TOUR_POSTER_SRC} fetchPriority="high" />
      ) : null}
      <header className="hl-header">
        <div className="hl-container hl-header__bar">
          <div className="hl-brand">
            <Link href="/" className="hl-logo">
              Dralo Academy
            </Link>
            <DraloTagline className="hl-logo-tagline" />
          </div>
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
            <Link href="/contacto/" className="hl-nav__link hl-nav__link--wide">
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
              <div className="hl-hero__ctas">
                <Link
                  href={REGISTER_HREF}
                  className="hl-btn hl-btn--primary hl-btn--lg"
                  onClick={() => trackHomeEvent('cta_hero_register')}
                >
                  Empieza gratis
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link
                  href={TRY_EXERCISE_HREF}
                  className="hl-btn hl-btn--ghost hl-btn--lg"
                  onClick={() => trackHomeEvent('cta_hero_try_exercise')}
                >
                  Prueba un ejercicio sin registrarte
                </Link>
              </div>
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
              <HeroTourVideo active={visible} />
              <Image
                src={sitePublicPath('/mascot/3.png')}
                alt=""
                width={220}
                height={220}
                sizes="220px"
                className="hl-hero__mascot"
              />
            </div>
            <figcaption id="hl-hero-caption" className="hl-hero__caption">
              Descubre cómo practicar con DRALO
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id="plan-plus"
        className={`hl-container hl-offer${offerOpen ? '' : ' hl-offer--sold-out'}`}
        aria-labelledby="hl-offer-title"
      >
        {offerOpen ? (
          <span className="hl-gift" aria-hidden="true">
            <Gift />
          </span>
        ) : null}
        <div>
          <h2 id="hl-offer-title" className="hl-offer__title">
            {offerOpen ? 'Tu Plan Plus gratis para siempre' : 'Plazas agotadas'}
          </h2>
          <p className="hl-offer__text">
            {offerOpen
              ? `Para los primeros ${MAX_FOUNDING_SLOT} registros que cumplan las condiciones.`
              : `Las ${MAX_FOUNDING_SLOT} plazas iniciales de Plan Plus ya están asignadas.`}
          </p>
        </div>
        <SlotsBox slots={slots} />
      </section>

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
              qué necesitas mejorar para el B2 First, la respuesta no siempre está clara.
            </p>
          </div>
          <ul className="hl-qcards">
            {PAIRS.map(({ icon: Icon, question, benefitTitle, benefit }) => (
              <li key={question} className="hl-qcard">
                <span className="hl-icon-badge" aria-hidden="true">
                  <Icon />
                </span>
                <h3 className="hl-qcard__title">{question}</h3>
                <p className="hl-qcard__text">
                  <strong className="hl-qcard__benefit">{benefitTitle}:</strong> {benefit}
                </p>
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
            <Link
              href={WRITING_PRACTICE_HREF}
              className="hl-btn hl-btn--primary hl-writing__cta"
              onClick={() => trackHomeEvent('cta_writing_try')}
            >
              Prueba la corrección de Writing
              <ArrowRight aria-hidden="true" />
            </Link>
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
                formulario con preguntas sobre qué te parece la web y qué se puede mejorar:
                complétalo en los {FOUNDING_SURVEY_RESPONSE_DAYS} días siguientes para conservar el
                Plan Plus gratis. Si no lo completas, tu cuenta pasa al plan gratuito.
              </p>
            </div>
            <Link
              href={REGISTER_HREF}
              className="hl-btn hl-btn--primary hl-btn--lg"
              onClick={() => trackHomeEvent('cta_plan_register')}
            >
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

      {faq.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(faq) }} />
      ) : null}

      <section id="preguntas-frecuentes" className="hl-section hl-section--flush" aria-labelledby="hl-faq-title">
        <div className="hl-container">
          <div className="hl-faq__head">
            <h2 id="hl-faq-title" className="hl-h2 hl-h2--sm">
              Preguntas frecuentes
            </h2>
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
          <Link
            href={REGISTER_HREF}
            className="hl-btn hl-btn--light hl-btn--lg"
            onClick={() => trackHomeEvent('cta_final_register')}
          >
            Crear mi cuenta gratis
            <ArrowRight aria-hidden="true" />
          </Link>
          <p className="hl-final__contact">
            Contacto:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </section>
    </div>
  );
}
