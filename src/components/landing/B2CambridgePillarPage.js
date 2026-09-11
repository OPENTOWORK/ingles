'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
} from 'lucide-react';
import '@/styles/conversion-landing.css';
import '@/styles/pillar-landing.css';

const TOC_ITEMS = [
  { id: 'que-es-b2', label: 'Qué es el B2 Cambridge y a quién le sirve' },
  { id: 'estructura-examen', label: 'Estructura del examen: las 4 partes' },
  { id: 'plan-estudio', label: 'Cómo diseñar tu plan de estudio' },
  { id: 'errores-comunes', label: 'Errores comunes que bajan la nota' },
  { id: 'practica-feedback', label: 'Cómo practicar con feedback inmediato' },
  { id: 'faq', label: 'Preguntas frecuentes' },
];

const EXAM_PARTS = [
  {
    icon: BookOpen,
    title: 'Reading and Use of English',
    text:
      'Combina comprensión lectora con ejercicios de gramática y vocabulario en contexto (rellenar huecos, transformación de frases, texto con errores). Es la parte donde más puntos se pierden por desconocer el formato, no por falta de nivel.',
  },
  {
    icon: PenLine,
    title: 'Writing',
    text:
      'Se piden dos textos: una redacción obligatoria y una segunda tarea a elegir entre varias opciones (email, artículo, reseña, informe). La corrección detallada de cada texto es lo que marca la diferencia entre repetir errores y corregirlos de verdad.',
  },
  {
    icon: Headphones,
    title: 'Listening',
    text:
      'Cuatro audios con acentos y velocidades distintas. La dificultad no suele ser el vocabulario, sino la gestión del tiempo y la anticipación de las preguntas antes de escuchar.',
  },
  {
    icon: Mic,
    title: 'Speaking',
    text:
      'Se realiza por parejas o tríos ante dos examinadores e incluye una conversación inicial, una descripción de imágenes, una tarea colaborativa y una discusión final. La parte donde más ayuda la práctica repetida con feedback específico sobre pronunciación y fluidez.',
  },
];

const STUDY_PLAN_STEPS = [
  {
    title: 'Diagnóstico inicial',
    text:
      'Haz un examen completo o por partes para saber en qué destreza estás más flojo antes de repartir el tiempo de estudio.',
  },
  {
    title: 'Bloques semanales por destreza',
    text:
      'Dedica sesiones específicas a Reading and Use of English, Writing, Listening y Speaking en lugar de mezclar todo cada día.',
  },
  {
    title: 'Corrección inmediata',
    text:
      'Cada ejercicio de writing o speaking debe recibir feedback antes del siguiente; corregir tarde refuerza el error en vez de eliminarlo.',
  },
  {
    title: 'Simulacros completos',
    text:
      'A partir de las 3–4 semanas antes del examen, haz exámenes completos cronometrados para acostumbrarte al ritmo real.',
  },
  {
    title: 'Revisión de errores recurrentes',
    text:
      'Lleva un registro de los mismos fallos (gramaticales, de vocabulario, de gestión del tiempo) para dejar de repetirlos.',
  },
];

const COMMON_MISTAKES = [
  {
    title: 'No gestionar el tiempo',
    text:
      'Quedarse sin tiempo en Reading and Use of English por detenerse demasiado en una pregunta difícil.',
  },
  {
    title: 'Ignorar el formato de la tarea de writing',
    text:
      'Perder puntos por no respetar la estructura esperada (registro, extensión, tipo de texto), aunque el inglés sea correcto.',
  },
  {
    title: 'No practicar con feedback específico',
    text: 'Repetir ejercicios sin saber exactamente qué error se cometió ni por qué.',
  },
  {
    title: 'Descuidar el Speaking por miedo',
    text:
      'Practicar poco la parte oral por incomodidad, cuando es la que más mejora con repetición guiada.',
  },
  {
    title: 'Estudiar solo teoría gramatical',
    text:
      'Centrarse en reglas sin practicar exámenes reales, lo que deja al candidato sin estrategia el día del examen.',
  },
];

const DRALO_TOOLS = [
  {
    title: 'Corrector de Writing con IA',
    text:
      'Corrige tus textos al instante, señala errores concretos y explica cómo mejorarlos.',
  },
  {
    title: 'Práctica de Listening',
    text: 'Ejercicios con distintos acentos y niveles de dificultad progresivos.',
  },
  {
    title: 'Speaking Coach',
    text: 'Practica la parte oral con feedback sobre fluidez y contenido.',
  },
  {
    title: 'Grammar Coach y Pronunciation Coach',
    text: 'Refuerzan justo los puntos débiles detectados en tu práctica.',
    links: [
      { href: '/dralo-ai/grammar-coach', label: 'Grammar Coach' },
      { href: '/dralo-ai/pronunciation-coach', label: 'Pronunciation Coach' },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: '¿Cuánto tiempo se tarda en preparar el B2 First?',
    a:
      'Depende del punto de partida, pero como referencia general, quien ya tiene un nivel B1 sólido suele necesitar entre 3 y 6 meses de preparación específica del formato de examen, con estudio regular y práctica de cada destreza por separado.',
  },
  {
    q: '¿Se puede preparar el B2 Cambridge sin academia?',
    a:
      'Sí, siempre que la preparación incluya práctica de exámenes reales, corrección de writing y speaking, y no solo repaso de gramática. Lo que marca la diferencia no es el formato (presencial u online) sino recibir feedback específico sobre cada error.',
  },
  {
    q: '¿Cuál es la parte más difícil del B2 First?',
    a:
      'Varía según el candidato, pero Reading and Use of English suele ser donde más puntos se pierden por gestión del tiempo, y Speaking es donde más candidatos evitan practicar por inseguridad, lo que retrasa su mejora en esa destreza.',
  },
  {
    q: '¿Qué nota se necesita para aprobar el B2 First?',
    a:
      'Cambridge English usa una escala de 160 a 190 puntos; en términos generales, se necesita un resultado equivalente a B2 (normalmente en torno al 60% del total) para obtener el certificado, y una puntuación más alta puede certificar directamente nivel C1.',
  },
  {
    q: '¿Cómo puedo practicar Speaking si no tengo con quién?',
    a:
      'Herramientas con corrección automática de pronunciación y fluidez, como el Speaking Coach de Dralo, permiten practicar la parte oral de forma guiada aunque no tengas un compañero de estudio disponible.',
  },
];

function useRegistroHref() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  return qs ? `/registro?${qs}` : '/registro';
}

function PillarCta({ children, className = '' }) {
  const registroHref = useRegistroHref();
  return (
    <Link href={registroHref} className={`conversion-landing__cta ${className}`.trim()}>
      {children}
      <ArrowRight size={18} aria-hidden />
    </Link>
  );
}

function B2CambridgePillarContent() {
  return (
    <article className="conversion-landing pillar-landing">
      <div className="conversion-landing__shell">
        <header className="conversion-landing__hero pillar-landing__hero" aria-labelledby="pillar-title">
          <p className="pillar-landing__eyebrow">Guía completa · B2 First Cambridge</p>
          <h1 id="pillar-title" className="conversion-landing__hero-title">
            Cómo preparar el B2 Cambridge (First Certificate)
          </h1>
          <p className="conversion-landing__hero-lead">
            Si estás preparando el B2 Cambridge (B2 First), esta guía reúne todo lo que necesitas en un
            solo lugar: cómo es el examen, cómo organizar tu estudio semana a semana, los errores que más
            bajan la nota y cómo practicar cada parte con feedback inmediato en lugar de esperar semanas
            para saber qué has hecho mal.
          </p>
          <PillarCta>Empieza a practicar gratis</PillarCta>
        </header>

        <nav className="pillar-landing__toc" aria-label="En esta guía">
          <h2 className="pillar-landing__toc-title">En esta guía</h2>
          <ol className="pillar-landing__toc-list">
            {TOC_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <section
          id="que-es-b2"
          className="conversion-landing__section pillar-landing__section"
          aria-labelledby="que-es-b2-title"
        >
          <h2 id="que-es-b2-title" className="conversion-landing__section-title">
            Qué es el B2 Cambridge y a quién le sirve
          </h2>
          <p className="conversion-landing__section-lead">
            El B2 First (antes &ldquo;First Certificate in English&rdquo;, FCE) es el título de Cambridge
            English que certifica un nivel B2 del Marco Común Europeo de Referencia. Se usa para acceder a
            programas universitarios, mejorar el CV, cumplir requisitos de idioma en oposiciones o,
            simplemente, tener una prueba objetiva de tu nivel de inglés.
          </p>
          <p className="conversion-landing__section-lead">
            A diferencia de un examen de nivel general, el B2 First evalúa cuatro destrezas por separado
            —comprensión lectora, uso del inglés, expresión escrita, comprensión auditiva y expresión
            oral— y cada una pesa igual en la nota final. Esto significa que no basta con &ldquo;tener buen
            nivel de inglés&rdquo;: hay que preparar el formato del examen en sí.
          </p>
        </section>

        <section
          id="estructura-examen"
          className="conversion-landing__section pillar-landing__section"
          aria-labelledby="estructura-examen-title"
        >
          <h2 id="estructura-examen-title" className="conversion-landing__section-title">
            Estructura del examen: las 4 partes
          </h2>
          <p className="conversion-landing__section-lead">
            Conocer la estructura exacta del examen es el primer paso de cualquier preparación seria. Estas
            son las cuatro partes y qué evalúa cada una:
          </p>
          <div className="conversion-landing__pillars pillar-landing__exam-parts">
            {EXAM_PARTS.map(({ icon: Icon, title, text }) => (
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

        <section
          id="plan-estudio"
          className="conversion-landing__section pillar-landing__section"
          aria-labelledby="plan-estudio-title"
        >
          <h2 id="plan-estudio-title" className="conversion-landing__section-title">
            Cómo diseñar tu plan de estudio para el B2 Cambridge
          </h2>
          <p className="conversion-landing__section-lead">
            Un plan de estudio eficaz para el B2 First no reparte el tiempo a partes iguales entre las
            cuatro destrezas: se basa en tus puntos débiles reales. Una estructura que funciona bien para
            la mayoría de candidatos:
          </p>
          <ol className="conversion-landing__steps pillar-landing__plan-steps">
            {STUDY_PLAN_STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="conversion-landing__step-num">{index + 1}</span>
                <span>
                  <strong>{step.title}:</strong> {step.text}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="errores-comunes"
          className="conversion-landing__section pillar-landing__section"
          aria-labelledby="errores-comunes-title"
        >
          <h2 id="errores-comunes-title" className="conversion-landing__section-title">
            Errores comunes que bajan la nota en el B2 Cambridge
          </h2>
          <ul className="pillar-landing__mistakes">
            {COMMON_MISTAKES.map((item) => (
              <li key={item.title}>
                <strong>{item.title}:</strong> {item.text}
              </li>
            ))}
          </ul>
        </section>

        <section
          id="practica-feedback"
          className="conversion-landing__section pillar-landing__section"
          aria-labelledby="practica-feedback-title"
        >
          <h2 id="practica-feedback-title" className="conversion-landing__section-title">
            Cómo practicar cada parte con feedback inmediato
          </h2>
          <p className="conversion-landing__section-lead">
            La diferencia entre progresar rápido o quedarte estancado casi siempre está en cuánto tardas en
            saber qué has hecho mal. En <strong>Dralo Academy</strong> cada parte del examen tiene su
            propia herramienta de práctica con corrección al momento:
          </p>
          <div className="pillar-landing__tools">
            {DRALO_TOOLS.map((tool) => (
              <article key={tool.title} className="pillar-landing__tool-card">
                <div className="pillar-landing__tool-icon" aria-hidden>
                  <Sparkles size={18} />
                </div>
                <h3>{tool.title}</h3>
                <p>
                  {tool.text}
                  {tool.links?.length ? (
                    <>
                      {' '}
                      {tool.links.map((link, index) => (
                        <span key={link.href}>
                          {index > 0 ? ' y ' : ''}
                          <Link href={link.href}>{link.label}</Link>
                        </span>
                      ))}
                      .
                    </>
                  ) : null}
                </p>
              </article>
            ))}
          </div>
          <p className="conversion-landing__section-lead">
            Todo tu progreso y tus errores quedan registrados en un solo lugar, para que cada sesión de
            estudio se apoye en la anterior en lugar de empezar de cero.
          </p>
          <PillarCta>Empieza a practicar gratis</PillarCta>
        </section>

        <section
          id="faq"
          className="conversion-landing__section pillar-landing__section"
          aria-labelledby="faq-title"
        >
          <h2 id="faq-title" className="conversion-landing__section-title">
            Preguntas frecuentes sobre la preparación del B2 Cambridge
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

        <section className="conversion-landing__final" aria-labelledby="pillar-final">
          <h2 id="pillar-final">¿Listo para empezar?</h2>
          <p>Practica el B2 Cambridge gratis con Dralo y recibe feedback inmediato en cada destreza.</p>
          <PillarCta className="conversion-landing__cta--light">
            Practica el B2 Cambridge gratis con Dralo
          </PillarCta>
        </section>

        <p className="conversion-landing__footer-note">
          <Link href="/politica-privacidad">Privacidad</Link>
          ·
          <Link href="/politica-cookies">Cookies</Link>
          ·
          <Link href="/aviso-legal">Aviso legal</Link>
        </p>
      </div>
    </article>
  );
}

export default function B2CambridgePillarPage() {
  return (
    <Suspense fallback={<div className="conversion-landing" style={{ minHeight: '50vh' }} />}>
      <B2CambridgePillarContent />
    </Suspense>
  );
}
