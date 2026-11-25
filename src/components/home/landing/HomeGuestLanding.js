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
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Target,
} from 'lucide-react';
import { APP_ROUTES } from '@/config/appRoutes';
import DraloTagline from '@/components/DraloTagline';
import { PRO_LAUNCH_COPY } from '@/lib/proLaunchOffer.rules';
import {
  formatEuroAmount,
  activeHomeOffer,
  homeBandCta,
  homeHeroCta,
  isBlackFridayOfferActive,
  PLUS_BLACK_FRIDAY_UNTIL_LABEL,
  PLUS_MONTHLY_PRICE,
  PLUS_OFFER_UNTIL_LABEL,
  plusAnnualRenewalCopy,
  plusBlackFridayAccessCopy,
} from '@/data/financialPlanConfig';
import { SESSION_HINT_CLASS } from '@/lib/sessionHint';
import { buildSignupHref, withAcquisitionParams } from '@/lib/signupTracking';
import { sitePublicPath } from '@/utils/sitePublicPath';
import { landingFont } from './landingFont';
import { PracticePickerMock, ResultsMock, ReviewMock, WritingFeedbackMock } from './LandingMocks';
import './home-guest-landing.css';

const TRY_EXERCISE_HREF = '/exam-practice/b2/exam-reading-and-use-of-english/?examen=1';
const WRITING_PRACTICE_HREF = '/exam-practice/b2/exam-writing/';
const CONTACT_EMAIL = 'support@dralo.es';
const TOUR_VIDEO_SRC = sitePublicPath('/dralo-tour.mp4?v=5');
const TOUR_POSTER_SRC = sitePublicPath('/dralo-tour-poster.webp?v=5');
const TOUR_SHOTS = [
  {
    src: '/home/feedback-reading.jpg',
    alt: 'Reading: la respuesta incorrecta queda en rojo y Dralo explica por qué otra opción es la correcta.',
  },
  {
    src: '/home/feedback-listening.jpg',
    alt: 'Listening: la opción elegida en rojo, la correcta en verde y la explicación debajo.',
  },
  {
    src: '/home/feedback-speaking.jpg',
    alt: 'Speaking: las dos fotos del long turn, el audio del examinador y el botón para empezar a hablar.',
  },
  {
    src: '/home/feedback-writing.jpg',
    alt: 'Writing: el enunciado del essay y el texto escrito, listo para corregir con Dralo.',
  },
  {
    src: '/home/feedback-quiz.jpg',
    alt: 'Quiz de gramática: la respuesta fallida, la correcta en verde y la explicación.',
  },
  {
    src: '/home/feedback-quiz-vocab.jpg',
    alt: 'Quiz de vocabulario: la opción correcta marcada y la explicación del significado.',
  },
  {
    src: '/home/feedback-training.jpg',
    alt: 'Training: respuesta incorrecta, con la solución y el motivo al momento.',
  },
  {
    src: '/home/feedback-training-gap.jpg',
    alt: 'Training: el hueco correcto en verde y la explicación de la gramática.',
  },
];

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

const reviewDateFormat = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeZone: 'Europe/Madrid',
});

function reviewFromApi(row) {
  const created = row.createdAt ? new Date(row.createdAt) : null;
  const when = created && !Number.isNaN(created.getTime()) ? reviewDateFormat.format(created) : '';
  return {
    key: row.id,
    name: row.name,
    initial: row.initial,
    text: row.text,
    meta: when ? `Reseña en Dralo · ${when}` : 'Reseña en Dralo',
    stars: Number(row.stars) || 5,
  };
}

function ReviewCard({ review, hidden }) {
  const score = Math.max(1, Math.min(5, Number(review.stars) || 5));
  return (
    <article
      className="hl-review"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      <div className="hl-review__head">
        <span className="hl-review__avatar" aria-hidden="true">{review.initial}</span>
        <h3>{review.name}</h3>
      </div>
      <span className="hl-review__stars" aria-label={`${score} de 5 estrellas`}>
        {'★'.repeat(score)}
        <span className="hl-review__stars-empty">{'☆'.repeat(5 - score)}</span>
      </span>
      <p>“{review.text}”</p>
      <span className="hl-review__meta">{review.meta}</span>
    </article>
  );
}

function ReviewCarousel() {
  const [paused, setPaused] = useState(false);
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/resenas/')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !Array.isArray(json.reviews) || !json.reviews.length) return;
        setReviews(json.reviews.map(reviewFromApi));
      })
      .catch(() => {});

    function onPublished(event) {
      const row = event.detail;
      if (row?.removedId) {
        setReviews((current) => (current ? current.filter((item) => item.key !== row.removedId) : current));
        return;
      }
      if (!row?.id) return;
      setReviews((current) => {
        const next = [reviewFromApi(row), ...(current || [])];
        const seen = new Set();
        return next.filter((item) => {
          if (seen.has(item.key)) return false;
          seen.add(item.key);
          return true;
        });
      });
    }
    window.addEventListener('dralo-site-review', onPublished);
    return () => {
      cancelled = true;
      window.removeEventListener('dralo-site-review', onPublished);
    };
  }, []);

  if (!reviews?.length) return null;
  const cards = reviews;

  return (
    <section className={`hl-reviews${paused ? ' hl-reviews--paused' : ''}`} aria-labelledby="hl-reviews-title">
      <div className="hl-reviews__head">
        <span className="hl-reviews__badge">Opiniones</span>
        <div className="hl-reviews__title-row">
          <h2 id="hl-reviews-title" className="hl-h2 hl-h2--sm">Quienes practican con Dralo cuentan esto</h2>
          <button
            type="button"
            className="hl-reviews__toggle"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            {paused ? 'Reproducir' : 'Pausa'}
          </button>
        </div>
      </div>
      <div className="hl-reviews__rotator">
        <div className="hl-reviews__track">
          {cards.map((review) => (
            <ReviewCard key={review.key} review={review} />
          ))}
          {cards.map((review) => (
            <ReviewCard key={`${review.key}-copy`} review={review} hidden />
          ))}
        </div>
      </div>
    </section>
  );
}

const WRITING_CHECKS = [
  'El texto se queda en su sitio. Cada marca abre su comentario.',
  'Gramática, vocabulario, ortografía, organización, contenido y lo que ya funciona.',
  'Nota en los cuatro criterios de Cambridge.',
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
    q: '¿Qué incluye el Plan Plus a 3,99 €?',
    a: 'Training y Quiz con vidas ilimitadas, exámenes mensuales, Writing Correction, Speaking Correction, Dralo AI, Exam Strategies y seguimiento de progreso.',
    published: true,
  },
  {
    q: '¿Hasta cuándo está disponible esta oferta?',
    a: `Hasta el ${PLUS_OFFER_UNTIL_LABEL}.`,
    published: true,
  },
  {
    q: '¿Qué incluye la oferta de Black Friday?',
    a: `${plusBlackFridayAccessCopy()}. Disponible hasta el ${PLUS_BLACK_FRIDAY_UNTIL_LABEL}.`,
    published: true,
    offer: 'black-friday',
  },
  {
    q: '¿Se renueva automáticamente?',
    a: `Sí. ${plusAnnualRenewalCopy()}`,
    published: true,
  },
  {
    q: '¿Hasta cuándo puedo contratarla?',
    a: `Hasta el ${PLUS_BLACK_FRIDAY_UNTIL_LABEL}.`,
    published: true,
    offer: 'black-friday',
  },
  {
    q: '¿Puedo seguir pagando mensual?',
    a: `Sí. El Plan Plus a ${formatEuroAmount(PLUS_MONTHLY_PRICE)}/mes está disponible hasta el ${PLUS_OFFER_UNTIL_LABEL}.`,
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
    a: 'El responsable es Dralo Academy SL (nombre comercial Dralo, CIF B05655444). Usamos los datos de la cuenta, el progreso y los ejercicios para prestar el servicio. Las correcciones pueden tratarse con herramientas de inteligencia artificial. Para ejercer tus derechos puedes escribir a support@dralo.es. El detalle está en https://www.dralo.es/politica-privacidad/.',
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

function analyticsAllowed() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem('dralo_cookie_consent');
    const parsed = raw ? JSON.parse(raw) : null;
    return Boolean(parsed?.preferences?.analytics);
  } catch {
    return false;
  }
}

/** dataLayer/gtag ya usados por GA4. Solo con consentimiento de analítica. */
function trackHomeEvent(eventName) {
  if (!analyticsAllowed()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName });
  if (typeof window.gtag === 'function') window.gtag('event', eventName);
}

function trackHomeCta(ctaId, destination) {
  if (!analyticsAllowed()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cta_click',
    cta_id: ctaId,
    cta_destination: destination,
  });
}

function withSrc(href, src, search) {
  const [path, query = ''] = String(href || '').split('?');
  const params = new URLSearchParams(query);
  params.set('src', src);
  return withAcquisitionParams(`${path}?${params.toString()}`, search);
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

function useSignupHrefs() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch(window.location.search);
  }, []);

  return {
    search,
    hero: buildSignupHref(search, 'hero'),
    promo: buildSignupHref(search, 'promo_25'),
    plan: buildSignupHref(search, 'promo_25'),
    other: buildSignupHref(search, 'otros'),
  };
}

const SEEK_KEY_STEPS = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 };

function formatClock(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function HeroTourVideo({ active }) {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const userPaused = useRef(false);
  const playedOnce = useRef(false);
  const [motion, setMotion] = useState('pending');
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [progress, setProgress] = useState({ time: 0, duration: 0 });
  const seekable = fullscreen && active && motion !== 'pending';

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

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!seekable || !video) return undefined;
    let raf = 0;
    const read = () => {
      const time = video.currentTime || 0;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      setProgress((prev) => (prev.time === time && prev.duration === duration ? prev : { time, duration }));
    };
    const loop = () => {
      read();
      raf = requestAnimationFrame(loop);
    };
    const events = ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'];
    events.forEach((name) => video.addEventListener(name, read));
    read();
    if (playing) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      events.forEach((name) => video.removeEventListener(name, read));
    };
  }, [seekable, playing]);

  const seekTo = (value) => {
    const video = videoRef.current;
    if (!video || !progress.duration) return;
    const time = Math.min(Math.max(value, 0), progress.duration);
    video.currentTime = time;
    setProgress((prev) => ({ ...prev, time }));
    setStarted(true);
  };

  const onSeekKey = (event) => {
    const step = SEEK_KEY_STEPS[event.key];
    if (!step) return;
    event.preventDefault();
    seekTo((videoRef.current?.currentTime || 0) + step);
  };

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

  const toggleFullscreen = () => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement === frame) {
      document.exitFullscreen?.().catch(() => {});
      return;
    }
    frame.requestFullscreen?.().catch(() => {});
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
      <div className="hl-video__bar">
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
        {seekable ? (
          <div className="hl-video__seek">
            <input
              type="range"
              className="hl-video__range"
              min={0}
              max={progress.duration}
              step={0.1}
              value={Math.min(progress.time, progress.duration)}
              onChange={(event) => seekTo(Number(event.target.value))}
              onKeyDown={onSeekKey}
              disabled={!progress.duration}
              aria-label="Posición del vídeo"
              aria-valuetext={`${formatClock(progress.time)} de ${formatClock(progress.duration)}`}
              style={{
                '--hl-seek': `${progress.duration ? (progress.time / progress.duration) * 100 : 0}%`,
              }}
            />
            <span className="hl-video__time" aria-hidden="true">
              {formatClock(progress.time)} / {formatClock(progress.duration)}
            </span>
          </div>
        ) : null}
        <button
          type="button"
          className="hl-video__fullscreen"
          aria-pressed={fullscreen}
          aria-label={fullscreen ? 'Salir de pantalla completa' : 'Maximizar'}
          onClick={toggleFullscreen}
        >
          {fullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
        </button>
      </div>
    </div>
    </>
  );
}

function HeroShotCarousel() {
  const count = TOUR_SHOTS.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % count), 4500);
    return () => window.clearInterval(id);
  }, [paused, count]);

  const show = (next) => setIndex(((next % count) + count) % count);
  const shot = TOUR_SHOTS[index];

  return (
    <div
      className="hl-shots"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Así se ve la web"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="hl-shots__frame">
        <img src={sitePublicPath(shot.src)} alt={shot.alt} width={960} height={540} />
      </div>
      <button
        type="button"
        className="hl-shots__nav hl-shots__nav--prev"
        aria-label="Foto anterior"
        onClick={() => show(index - 1)}
      >
        <ChevronRight aria-hidden="true" />
      </button>
      <button
        type="button"
        className="hl-shots__nav hl-shots__nav--next"
        aria-label="Foto siguiente"
        onClick={() => show(index + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </button>
      <div className="hl-shots__dots">
        {TOUR_SHOTS.map((item, itemIndex) => (
          <button
            key={item.src}
            type="button"
            className={itemIndex === index ? 'is-active' : ''}
            aria-label={`Foto ${itemIndex + 1} de ${count}`}
            aria-current={itemIndex === index ? 'true' : undefined}
            onClick={() => show(itemIndex)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Home sin sesión, en ordenador y en móvil.
 * `pending`: aún no se sabe si hay sesión; se pinta por si es un invitado.
 */
export default function HomeGuestLanding({ pending = false, prioritizeLcp = false }) {
  const { ready, sessionHint } = useLandingViewport();
  const visible = ready && !(pending && sessionHint);
  const signupHref = useSignupHrefs();
  const offer = activeHomeOffer();
  const blackFriday = isBlackFridayOfferActive();
  const faq = publishedFaq(FAQ, blackFriday);
  const search = signupHref.search;
  const headerHref = withSrc('/registro/', 'header', search);
  const heroCta = homeHeroCta();
  const heroPrimaryHref = withSrc(heroCta.primary.href, heroCta.primary.src, search);
  const heroSecondaryHref = withSrc(heroCta.secondary.href, heroCta.secondary.src, search);
  const exerciseHref = withSrc(TRY_EXERCISE_HREF, 'hero-ejercicio', search);
  const writingHref = withSrc(WRITING_PRACTICE_HREF, 'writing', search);
  const midCta = homeBandCta('mid');
  const closeCta = homeBandCta('cierre');
  const midPrimaryHref = withSrc(midCta.primary.href, midCta.primary.src, search);
  const midSecondaryHref = midCta.secondary
    ? withSrc(midCta.secondary.href, midCta.secondary.src, search)
    : '';
  const closePrimaryHref = withSrc(closeCta.primary.href, closeCta.primary.src, search);
  const closeSecondaryHref = closeCta.secondary
    ? withSrc(closeCta.secondary.href, closeCta.secondary.src, search)
    : '';
  const topbarHref = offer ? withSrc(offer.href, 'topbar', search) : '';

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
            <a href="#plan-plus" className="hl-nav__link">
              Oferta
            </a>
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
            <Link
              href={headerHref}
              className="hl-btn hl-btn--primary"
              onClick={() => trackHomeCta('header', headerHref)}
            >
              Crear mi cuenta gratis
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {offer ? (
        <div className="hl-offer-stack">
          <p className={`hl-offer-banner${blackFriday ? '' : ' hl-offer-banner--month'}`}>
            <Link href={topbarHref} onClick={() => trackHomeCta('topbar', topbarHref)}>
              {offer.text}
            </Link>
          </p>
        </div>
      ) : null}

      <section id="plan-plus" className="hl-hero" aria-labelledby="hl-hero-title">
        <div className="hl-container hl-hero__grid">
          <div className="hl-hero__intro">
            {offer ? <p className="hl-kicker">{offer.text}</p> : null}
            <h1 id="hl-hero-title" className="hl-hero__title">
              Prepara tu B2 First a tu ritmo y entiende tus errores
            </h1>
            <p className="hl-hero__lead">
              Practica cada parte del examen con formato real, recibe feedback sobre tu Writing y descubre qué necesitas mejorar.
            </p>
            <div className="hl-hero__actions">
              <div className="hl-hero__ctas">
                <Link
                  href={heroPrimaryHref}
                  className="hl-btn hl-btn--primary hl-btn--lg hl-hero__cta"
                  onClick={() => {
                    if (heroCta.primary.href.startsWith('/registro')) trackHomeEvent('cta_hero_register');
                    trackHomeCta(heroCta.primary.src, heroPrimaryHref);
                  }}
                >
                  {heroCta.primary.label}
                </Link>
                <Link
                  href={heroSecondaryHref}
                  className="hl-btn hl-btn--ghost hl-hero__offer"
                  onClick={() => {
                    if (heroCta.secondary.href.startsWith('/registro')) trackHomeEvent('cta_hero_register');
                    trackHomeCta(heroCta.secondary.src, heroSecondaryHref);
                  }}
                >
                  {heroCta.secondary.label}
                </Link>
              </div>
              <p className="hl-hero__fine">{heroCta.microcopy}</p>
              <Link
                href={exerciseHref}
                className="hl-hero__exercise"
                onClick={() => trackHomeCta('hero-ejercicio', exerciseHref)}
              >
                Prueba un ejercicio sin registrarte
              </Link>
            </div>
          </div>
          <HeroShotCarousel />
        </div>
      </section>

      <section className="hl-tour" aria-labelledby="hl-hero-caption">
        <figure className="hl-container hl-tour__figure">
          <div className="hl-tour__stage">
            <HeroTourVideo active={visible} />
            <Image
              src={sitePublicPath('/mascot/3.png')}
              alt=""
              width={220}
              height={220}
              sizes="220px"
              className="hl-tour__mascot"
            />
          </div>
          <figcaption id="hl-hero-caption" className="hl-hero__caption">
            Descubre cómo practicar con DRALO
          </figcaption>
        </figure>
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
              href={writingHref}
              className="hl-btn hl-btn--primary hl-writing__cta"
              onClick={() => {
                trackHomeEvent('cta_writing_try');
                trackHomeCta('writing', writingHref);
              }}
            >
              Prueba la corrección de Writing
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <WritingFeedbackMock />
        </div>
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

      <section id="como-funciona" className="hl-section hl-section--flush hl-section--steps" aria-labelledby="hl-steps-title">
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

      <ReviewCarousel />

      <div className="hl-section hl-bands">
        <section id="condiciones-plan-plus" className="hl-container hl-cta" aria-labelledby="hl-cta-title">
          <div>
            <h2 id="hl-cta-title" className="hl-cta__title">
              {PRO_LAUNCH_COPY.subtitle}
            </h2>
          </div>
          <div className="hl-cta__action">
            <Link
              href={midPrimaryHref}
              className="hl-btn hl-btn--primary hl-btn--lg"
              onClick={() => {
                if (midCta.primary.href.startsWith('/registro')) trackHomeEvent('cta_plan_register');
                trackHomeCta(midCta.primary.src, midPrimaryHref);
              }}
            >
              {midCta.primary.label}
              <ArrowRight aria-hidden="true" />
            </Link>
            {midCta.secondary ? (
              <Link
                href={midSecondaryHref}
                className="hl-btn hl-btn--ghost hl-cta__secondary"
                onClick={() => {
                  trackHomeEvent('cta_plan_register');
                  trackHomeCta(midCta.secondary.src, midSecondaryHref);
                }}
              >
                {midCta.secondary.label}
              </Link>
            ) : null}
            {offer ? <p className="hl-cta__offer">{offer.text}</p> : null}
          </div>
        </section>

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
          <div className="hl-final__actions">
            <Link
              href={closePrimaryHref}
              className="hl-btn hl-btn--light hl-btn--lg"
              onClick={() => {
                if (closeCta.primary.href.startsWith('/registro')) trackHomeEvent('cta_final_register');
                trackHomeCta(closeCta.primary.src, closePrimaryHref);
              }}
            >
              {closeCta.primary.label}
              <ArrowRight aria-hidden="true" />
            </Link>
            {closeCta.secondary ? (
              <Link
                href={closeSecondaryHref}
                className="hl-btn hl-btn--lg hl-final__secondary"
                onClick={() => {
                  trackHomeEvent('cta_final_register');
                  trackHomeCta(closeCta.secondary.src, closeSecondaryHref);
                }}
              >
                {closeCta.secondary.label}
              </Link>
            ) : null}
          </div>
          <p className="hl-final__contact">
            Contacto:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </section>
    </div>
  );
}
