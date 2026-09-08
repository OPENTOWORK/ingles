'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpen, MessageSquare, Target, TrendingUp } from 'lucide-react';
import '@/styles/conversion-landing.css';

const FOUNDING_SLOTS_POLL_MS = 45_000;

const PILLARS = [
  {
    icon: BookOpen,
    title: 'Practica',
    text: 'Entrena las diferentes partes del examen (Reading, Writing, Speaking, Use of English).',
  },
  {
    icon: MessageSquare,
    title: 'Feedback',
    text: 'Recibe información inmediata sobre tu desempeño.',
  },
  {
    icon: Target,
    title: 'Errores',
    text: 'Identifica exactamente qué necesitas mejorar.',
  },
  {
    icon: TrendingUp,
    title: 'Progreso',
    text: 'Comprueba cómo evolucionas antes del gran día.',
  },
];

const FAQ_ITEMS = [
  {
    q: '¿De verdad es gratis?',
    a:
      'Sí. Al registrarte entre los primeros 50 usuarios, obtienes el Plan Plus sin coste. A los 30 días te pediremos rellenar un breve formulario para confirmar tu plaza y mantener el acceso gratuito de forma permanente.',
  },
  {
    q: '¿Sustituye a mi academia?',
    a: 'No. Dralo está pensado como complemento: tu academia enseña, Dralo te ayuda a entrenar entre clases.',
  },
  {
    q: '¿Cuánto tiempo tengo que dedicarle?',
    a: 'El que tú quieras. Puedes practicar cuando tengas tiempo, a tu ritmo.',
  },
  {
    q: '¿Qué partes del examen puedo practicar?',
    a: 'Reading, Writing, Speaking y Use of English.',
  },
];

function useRegistroHref() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  return qs ? `/registro?${qs}` : '/registro';
}

function ConversionUrgencyBanner() {
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId = 0;

    async function refreshAvailability() {
      try {
        const res = await fetch(`/api/founding-member/slots?_=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' },
        });
        if (!res.ok) throw new Error('availability_fetch_failed');
        const data = await res.json();
        if (cancelled) return;
        setAvailability(data);
        if (data?.soldOut && intervalId) {
          window.clearInterval(intervalId);
          intervalId = 0;
        }
      } catch {
        if (!cancelled) setAvailability(null);
      }
    }

    void refreshAvailability();
    intervalId = window.setInterval(refreshAvailability, FOUNDING_SLOTS_POLL_MS);
    const onFocus = () => void refreshAvailability();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const remaining = availability?.remaining;
  const slotsLabel =
    typeof remaining === 'number'
      ? remaining === 1
        ? '1 plaza'
        : `${remaining} plazas`
      : 'plazas limitadas';

  return (
    <div className="conversion-landing__urgency" role="status" aria-live="polite">
      <strong>Oferta de lanzamiento:</strong> los primeros 50 registros se llevan el Plan Plus{' '}
      <span className="conversion-landing__urgency-gratis">GRATIS</span> para siempre. Quedan{' '}
      <strong>{slotsLabel}</strong>.
    </div>
  );
}

function ConversionCta({ children, className = '' }) {
  const registroHref = useRegistroHref();
  return (
    <Link href={registroHref} className={`conversion-landing__cta ${className}`.trim()}>
      {children}
      <ArrowRight size={18} aria-hidden />
    </Link>
  );
}

function ConversionLandingContent() {
  return (
    <div className="conversion-landing">
      <ConversionUrgencyBanner />

      <div className="conversion-landing__shell">
        <section className="conversion-landing__hero" aria-labelledby="conversion-hero-title">
          <h1 id="conversion-hero-title" className="conversion-landing__hero-title">
            Tu academia te prepara. Dralo te ayuda a entrenar.
          </h1>
          <p className="conversion-landing__hero-lead">
            Practica las partes del B2 First de Cambridge, recibe feedback inmediato y descubre
            exactamente qué necesitas mejorar antes del examen.
          </p>
          <ConversionCta>Regístrate gratis y consigue el Plan Plus para siempre</ConversionCta>
          <p className="conversion-landing__microcopy">
            Solo quedan plazas para los primeros 50 registros. Sin tarjeta. Sin compromiso.
          </p>
        </section>

        <section className="conversion-landing__section" aria-labelledby="conversion-problem">
          <h2 id="conversion-problem" className="conversion-landing__section-title">
            ¿Estás preparando el B2 y no sabes si realmente estás listo?
          </h2>
          <p className="conversion-landing__section-lead">
            Vas a clase, haces los ejercicios, entiendes la teoría… pero cuando piensas en el día del
            examen aparece la misma duda:
          </p>
          <blockquote className="conversion-landing__quote">
            &ldquo;Estoy estudiando, pero no sé si lo estoy haciendo suficientemente bien para
            aprobar.&rdquo;
          </blockquote>
          <p className="conversion-landing__section-lead">
            El problema no es que no sepas inglés. El problema es que preparar un examen como el B2
            no termina cuando acaba la clase: necesitas practicar por tu cuenta, detectar tus errores
            y saber si estás progresando. Y eso, muchas veces, no lo tienes.
          </p>
        </section>

        <section className="conversion-landing__section" aria-labelledby="conversion-solution">
          <h2 id="conversion-solution" className="conversion-landing__section-title">
            Dralo es tu entrenamiento diario para el B2 Cambridge
          </h2>
          <p className="conversion-landing__section-lead">
            No es una academia. No es un curso de inglés desde cero. Es la herramienta que usas entre
            clase y clase para practicar de verdad, con feedback inmediato y sabiendo en todo momento
            qué te falta por mejorar.
          </p>
          <p className="conversion-landing__section-lead">
            <strong>No competimos con tu academia. La complementamos.</strong>
          </p>
        </section>

        <section className="conversion-landing__section" aria-labelledby="conversion-pillars">
          <h2 id="conversion-pillars" className="conversion-landing__section-title">
            Qué vas a conseguir con Dralo
          </h2>
          <div className="conversion-landing__pillars">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <article key={title} className="conversion-landing__pillar">
                <div className="conversion-landing__pillar-icon" aria-hidden>
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="conversion-landing__offer" aria-labelledby="conversion-offer">
          <h2 id="conversion-offer">
            Plan Plus GRATIS para siempre, solo para los 50 primeros
          </h2>
          <p className="conversion-landing__section-lead" style={{ textAlign: 'center', color: '#7c2d12' }}>
            Estamos lanzando Dralo y queremos que los primeros usuarios formen parte de esto desde el
            minuto uno.
          </p>
          <p className="conversion-landing__section-lead" style={{ fontWeight: 700, color: '#9a3412' }}>
            Así funciona:
          </p>
          <ol className="conversion-landing__steps">
            <li>
              <span className="conversion-landing__step-num">1</span>
              <span>Te registras hoy — es gratis y no necesitas tarjeta.</span>
            </li>
            <li>
              <span className="conversion-landing__step-num">2</span>
              <span>Practicas con el Plan Plus desde el primer día, sin restricciones.</span>
            </li>
            <li>
              <span className="conversion-landing__step-num">3</span>
              <span>
                A los 30 días, solo tienes que rellenar un breve formulario para confirmar tu plaza —
                y el Plan Plus se queda contigo gratis para siempre.
              </span>
            </li>
          </ol>
          <div style={{ marginTop: '1.25rem' }}>
            <ConversionCta>Quiero mi plaza gratis</ConversionCta>
            <p className="conversion-landing__microcopy conversion-landing__microcopy--dark">
              Plazas limitadas a los primeros 50 registros. Sin permanencia, sin sorpresas.
            </p>
          </div>
        </section>

        <section className="conversion-landing__section" aria-labelledby="conversion-how">
          <h2 id="conversion-how" className="conversion-landing__section-title">
            Empezar a practicar te lleva menos de 2 minutos
          </h2>
          <ol className="conversion-landing__steps" style={{ maxWidth: '36rem' }}>
            <li>
              <span className="conversion-landing__step-num">1</span>
              <span>Regístrate con tu email.</span>
            </li>
            <li>
              <span className="conversion-landing__step-num">2</span>
              <span>
                Haz tu primera actividad — así detectamos tu nivel real y tus áreas de mejora.
              </span>
            </li>
            <li>
              <span className="conversion-landing__step-num">3</span>
              <span>Recibe feedback al instante y sigue tu progreso cada vez que practiques.</span>
            </li>
          </ol>
          <div style={{ marginTop: '1.25rem' }}>
            <ConversionCta>Empezar ahora</ConversionCta>
          </div>
        </section>

        <section className="conversion-landing__section" aria-labelledby="conversion-audience">
          <h2 id="conversion-audience" className="conversion-landing__section-title">
            Para quién es Dralo (y para quién no)
          </h2>
          <div className="conversion-landing__split">
            <div className="conversion-landing__list-card">
              <h3>Dralo es para ti si:</h3>
              <ul>
                <li>
                  Ya estás preparando el B2 First de Cambridge (en una academia, por tu cuenta, o
                  ambas).
                </li>
                <li>Quieres practicar fuera de clase, cuando tú puedas.</li>
                <li>Necesitas saber en qué estás fallando, no solo hacer más ejercicios.</li>
              </ul>
            </div>
            <div className="conversion-landing__list-card conversion-landing__list-card--no">
              <h3>Dralo NO es:</h3>
              <ul>
                <li>Una academia de inglés.</li>
                <li>Un curso para aprender inglés desde cero.</li>
                <li>Una biblioteca de ejercicios sin más.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="conversion-landing__section" aria-labelledby="conversion-faq">
          <h2 id="conversion-faq" className="conversion-landing__section-title">
            Preguntas frecuentes
          </h2>
          <div className="conversion-landing__faq">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="conversion-landing__final" aria-labelledby="conversion-final">
          <h2 id="conversion-final">
            No dejes tu preparación solo en manos de la clase.
          </h2>
          <p>
            Empieza a entrenar hoy y asegúrate el Plan Plus gratis para siempre — solo quedan plazas
            para los primeros 50 registros.
          </p>
          <ConversionCta className="conversion-landing__cta--light">
            Reservar mi plaza gratis
          </ConversionCta>
          <p className="conversion-landing__microcopy">
            Sin tarjeta. Sin compromiso. Cancelas cuando quieras.
          </p>
        </section>

        <p className="conversion-landing__footer-note">
          <Link href="/politica-privacidad">Privacidad</Link>
          ·
          <Link href="/politica-cookies">Cookies</Link>
          ·
          <Link href="/aviso-legal">Aviso legal</Link>
        </p>
      </div>
    </div>
  );
}

export default function ConversionLandingPage() {
  return (
    <Suspense fallback={<div className="conversion-landing" style={{ minHeight: '50vh' }} />}>
      <ConversionLandingContent />
    </Suspense>
  );
}
