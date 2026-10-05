import Link from 'next/link';
import AbCta from '@/components/landing/ab/AbCta';
import AbTracker from '@/components/landing/ab/AbTracker';
import {
  CAMBRIDGE_OFFICIAL_URL,
  COMMON_MISTAKES,
  GUIDE_FAQ,
  PAPERS,
  STUDY_PLAN,
  guideToCampaignHref,
  normalizeAbVariant,
} from '@/lib/abExperiment';
import B2GuideVisual from '@/components/landing/ab/B2GuideVisual';
import './ab-landing.css';

export default function B2Guide({ variant = 'a' }) {
  const key = normalizeAbVariant(variant);
  if (key === 'b') return <B2GuideVisual />;
  const campaignHref = guideToCampaignHref(key);

  return (
    <article className="ab-landing ab-landing--guide ab-landing--text" lang="es">
      <script
        dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='es'" }}
      />
      <AbTracker pageType="guide" variant={key} source="direct" />
      <header className="ab-hero">
        <div className="ab-wrap">
          <p className="ab-kicker">B2 First · Cambridge English</p>
          <h1>Cómo preparar el B2 First de Cambridge</h1>
          <p className="ab-lead">
            El B2 First evalúa si puedes usar el inglés en situaciones reales de estudio, trabajo y
            vida diaria. Esta guía resume el formato y un modo de prepararlo sin tratar las cuatro
            pruebas como si pesaran lo mismo.
          </p>
        </div>
      </header>
      <div className="ab-wrap">

        <section className="ab-section" id="que-es">
          <h2>1. Qué es el B2 First</h2>
          <p>
            B2 First es un examen de Cambridge English de nivel B2 del Marco Común Europeo. Certifica
            que puedes entender textos y conversaciones de cierta complejidad y escribir o hablar con
            una organización clara. No mide solo gramática suelta: mira cómo usas el idioma en cada
            prueba.
          </p>
        </section>

        <section className="ab-section" id="como-es">
          <h2>2. Cómo es el examen</h2>
          <p>El examen tiene cuatro pruebas. No son cinco, y no pesan igual:</p>
          <ul className="ab-papers">
            {PAPERS.map((paper) => (
              <li key={paper.name}>
                <strong>{paper.name}</strong> — {paper.weight}. {paper.detail}
              </li>
            ))}
          </ul>
          <p>
            En la Cambridge English Scale, el Grade C (aprobado B2) empieza en 160. Un resultado de
            140 a 159 puede certificarse como B1. Con 180 o más, el resultado puede reportarse como
            C1. No hay un porcentaje fijo del examen que, por sí solo, sea el aprobado.
          </p>
        </section>

        <section className="ab-section" id="reading">
          <h2>3. Reading and Use of English</h2>
          <p>
            Es una sola prueba y es la que más pesa: el 40 %. Tiene siete partes y 52 preguntas, con
            75 minutos. Las primeras partes se centran en gramática y vocabulario en contexto. Las
            últimas piden leer textos más largos, seguir referencias y reconocer paráfrasis.
          </p>
          <p>
            Conviene hacerla con el reloj. Si las partes de Use of English se comen el tiempo, la
            lectura del final se responde con prisa.
          </p>
        </section>

        <section className="ab-section" id="writing">
          <h2>4. Writing</h2>
          <p>
            Writing pesa el 20 % y tiene dos partes en 80 minutos. La parte 1 es un essay
            obligatorio. La parte 2 se elige entre tres opciones, como article, email, review, report
            o story. En el formato que usa Dralo, cada tarea queda entre 140 y 190 palabras.
          </p>
          <p>
            El essay pide cubrir las notas del enunciado y añadir una idea propia. No llega con
            escribir mucho: hay que responder a lo que pide la tarea             y revisar al final.
          </p>
        </section>

        <section className="ab-section" id="listening">
          <h2>5. Listening</h2>
          <p>
            Listening pesa el 20 %. Son cuatro partes y unos 40 minutos, más el tiempo para pasar las
            respuestas. Se oye cada grabación dos veces, salvo algunos extractos de la parte 1. El
            número exacto de preguntas de la prueba oficial: [COMPLETAR].
          </p>
          <p>
            Las preguntas miran la idea general, el detalle, la actitud o la opinión. Reconocer una
            palabra del audio dentro de una opción no significa que esa opción sea la correcta.
          </p>
        </section>

        <section className="ab-section" id="speaking">
          <h2>6. Speaking</h2>
          <p>
            Speaking pesa el 20 %. Dura unos 14 minutos y tiene cuatro partes, normalmente con dos
            candidatos y dos examinadores. Hay una entrevista breve, una comparación de fotos, una
            tarea en pareja y una discusión sobre el mismo tema.
          </p>
          <p>
            Cuenta tanto lo que dices como cómo respondes a la otra persona. Una respuesta memorizada
            que no encaja con la pregunta se nota enseguida.
          </p>
        </section>

        <section className="ab-section" id="empezar">
          <h2>7. Cómo empezar a prepararlo</h2>
          <p>
            Empieza por el formato, no por un libro entero. Haz una tarea corta de cada prueba y
            anota el fallo: tiempo, vocabulario, no contestar a la pregunta, o no entender el audio.
            Ese diagnóstico evita estudiar solo la destreza que ya se te da bien.
          </p>
          <p>
            Tu academia te enseña. La práctica entre clases es otra parte del trabajo: repetir el
            tipo de tarea del examen y revisar el error concreto.
          </p>
        </section>

        <section className="ab-section" id="plan">
          <h2>8. Plan de preparación</h2>
          <ol className="ab-plain-list">
            {STUDY_PLAN.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="ab-section" id="errores">
          <h2>9. Errores frecuentes</h2>
          <ul className="ab-plain-list">
            {COMMON_MISTAKES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="ab-section" id="practicar">
          <h2>10. Cómo practicar</h2>
          <p>
            Practica las cuatro pruebas con el tipo de tarea del examen. En Writing, escribe el texto
            y revisa la corrección sobre lo que has escrito: Dralo comenta el contenido, la
            organización, el logro comunicativo y la lengua, y señala errores del propio texto. Es un
            análisis sobre tu respuesta, parecido al tipo de notas que podría dejarte una profesora,
            hecho por la corrección de Writing de Dralo. No sustituye a la clase.
          </p>
          <p>
            Después de cada práctica, mira el error, corrige esa parte y vuelve a hacer una tarea
            parecida. Repetir sin leer el feedback no cambia el resultado.
          </p>
          <p>
            Cuando quieras pasar de la guía a la práctica, la página de la campaña explica el Plan
            Plus y la condición para conservarlo.
          </p>
          <AbCta href={campaignHref} pageType="guide" variant={key} source="b2-guide">
            Ver la práctica en Dralo
          </AbCta>
        </section>

        <section className="ab-section" id="faq">
          <h2>11. FAQ</h2>
          <div className="ab-faq">
            {GUIDE_FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="ab-section ab-final" id="cta-final">
          <h2>12. Siguiente paso</h2>
          <p>
            Si ya tienes el formato claro, el siguiente paso es practicar y ver dónde fallas. Dralo
            no reemplaza a tu profesora ni a tu academia.
          </p>
          <AbCta href={campaignHref} pageType="guide" variant={key} source="b2-guide">
            Seguir con la guía práctica
          </AbCta>
        </section>

        <p className="ab-official">
          <Link href={CAMBRIDGE_OFFICIAL_URL} rel="noopener noreferrer" target="_blank">
            Información oficial de Cambridge English sobre B2 First
          </Link>
        </p>
      </div>
    </article>
  );
}
