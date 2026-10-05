import Link from 'next/link';
import AbCta from '@/components/landing/ab/AbCta';
import AbTracker from '@/components/landing/ab/AbTracker';
import { CAMBRIDGE_OFFICIAL_URL, guideToCampaignHref } from '@/lib/abExperiment';

const HREF = guideToCampaignHref('b');

function ToPractice() {
  return (
    <AbCta href={HREF} pageType="guide" variant="b" source="b2-guide">
      Practicar con Dralo
    </AbCta>
  );
}

export default function B2GuideVisual() {
  return (
    <article className="ab-landing ab-landing--guide ab-landing--visual" lang="es">
      <script
        dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='es'" }}
      />
      <AbTracker pageType="guide" variant="b" source="direct" />
      <header className="ab-hero">
        <div className="ab-wrap ab-hero-grid">
          <div>
            <p className="ab-kicker">Guía visual del B2 First</p>
            <h1>Cómo preparar el B2 First de Cambridge</h1>
            <p className="ab-lead">
              Ya sabes que hay un examen. Esta página te enseña las cuatro pruebas y, al lado, cómo
              se practica cada una. Cuando el formato esté claro, toca hacerlo.
            </p>
            <ToPractice />
          </div>
          <figure className="ab-hero-frame">
            <img
              src="/b2-speaking/exam-2/photo-a.png"
              alt="Dos mujeres hablando en la terraza de un café, con dos tazas sobre la mesa"
              width="1536"
              height="1024"
            />
            <figcaption>Foto de la práctica de Speaking. No es un resultado de examen.</figcaption>
          </figure>
        </div>
      </header>

      <div className="ab-wrap">
        <section className="ab-section" id="que-es">
          <h2>1. Qué es el B2 First</h2>
          <p>
            Es el examen de Cambridge de nivel B2. Mide si usas el inglés en lectura, escritura,
            audio y conversación, no si recitas una lista de gramática.
          </p>
        </section>

        <section className="ab-section" id="como-es">
          <h2>2. Cómo es el examen</h2>
          <p>Cuatro pruebas. Reading and Use of English pesa el doble que cada una de las otras.</p>
          <ul className="ab-papers">
            <li>
              <strong>Reading and Use of English</strong> — 40 %
            </li>
            <li>
              <strong>Writing</strong> — 20 %
            </li>
            <li>
              <strong>Listening</strong> — 20 %
            </li>
            <li>
              <strong>Speaking</strong> — 20 %
            </li>
          </ul>
          <p>
            En la Cambridge English Scale, el Grade C empieza en 160. De 140 a 159 puede figurar
            como B1. Desde 180 puede figurar como C1.
          </p>
          <aside className="ab-bridge">
            <p>Ya sabes qué tienes que preparar. Ahora necesitas practicarlo.</p>
            <ToPractice />
          </aside>
        </section>

        <section className="ab-section" id="reading">
          <h2>3. Reading and Use of English</h2>
          <p>
            Una sola hoja, siete partes, 52 preguntas y 75 minutos. Las cuatro primeras son huecos
            de gramática y vocabulario. Las tres últimas son textos.
          </p>
        </section>

        <section className="ab-section" id="writing">
          <h2>4. Writing</h2>
          <p>
            Dos textos en 80 minutos. El primero es un essay obligatorio, entre 140 y 190 palabras.
            El segundo lo eliges entre tres opciones. Se puntúa el contenido, la organización y el
            lenguaje, no solo que el texto sea largo.
          </p>
          <aside className="ab-bridge">
            <p>Ya sabes qué tienes que preparar. Ahora necesitas practicarlo.</p>
            <ToPractice />
          </aside>
        </section>

        <section className="ab-section" id="listening">
          <h2>5. Listening</h2>
          <p>
            Cuatro audios, unos 40 minutos, más el tiempo de pasar respuestas. Cada grabación suena
            dos veces, salvo algunos fragmentos de la primera parte. Número de preguntas:
            [COMPLETAR].
          </p>
        </section>

        <section className="ab-section" id="speaking">
          <h2>6. Speaking</h2>
          <p>
            Unos 14 minutos y cuatro partes, casi siempre en pareja. En una de ellas comparas dos
            fotos y dices en qué se parecen y en qué no. Este par es de esa tarea.
          </p>
          <div className="ab-photo-pair">
            <figure className="ab-figure">
              <img
                src="/b2-speaking/exam-3/photo-a.png"
                alt="Una mujer pedaleando en bicicleta por una carretera entre colinas"
                width="1536"
                height="1024"
              />
              <figcaption>Foto 1. Ir en bici al aire libre.</figcaption>
            </figure>
            <figure className="ab-figure">
              <img
                src="/b2-speaking/exam-3/photo-b.png"
                alt="Un hombre nadando a crol en una piscina cubierta"
                width="1536"
                height="1024"
              />
              <figcaption>Foto 2. Nadar en una piscina.</figcaption>
            </figure>
          </div>
        </section>

        <section className="ab-section" id="empezar">
          <h2>7. Cómo empezar a prepararlo</h2>
          <p>
            Haz una tarea corta de cada prueba esta semana. Anota solo el tipo de fallo: tiempo,
            no contestar a la pregunta, o no pillar el audio. Empieza por el fallo, no por el libro.
          </p>
        </section>

        <section className="ab-section" id="plan">
          <h2>8. Plan de preparación</h2>
          <ol className="ab-plain-list">
            <li>Una tarea de cada prueba, sin mirar la teoría antes.</li>
            <li>Apunta el fallo que se repite.</li>
            <li>Reescribe el writing usando solo ese comentario.</li>
            <li>Repite Listening y Speaking en días distintos.</li>
            <li>Junta las cuatro cuando ya no te pierdes en el formato.</li>
          </ol>
        </section>

        <section className="ab-section" id="errores">
          <h2>9. Errores frecuentes</h2>
          <ul className="ab-plain-list">
            <li>Estudiar reglas y no cronometrar Reading and Use of English.</li>
            <li>Dejar Speaking para la última semana.</li>
            <li>Entregar un essay al que le falta una de las notas del enunciado.</li>
            <li>Marcar en Listening la opción que repite una palabra del audio.</li>
          </ul>
        </section>

        <section className="ab-section" id="practicar">
          <h2>10. Cómo practicar</h2>
          <p>
            La clase enseña el tema. Fuera de clase hace falta volver a la tarea y ver la marca en
            tu texto. Dralo hace esa segunda parte. No da la clase.
          </p>
          <p>Ya sabes qué tienes que preparar. Ahora necesitas practicarlo.</p>
          <ToPractice />
        </section>

        <section className="ab-section" id="faq">
          <h2>11. FAQ</h2>
          <div className="ab-faq">
            <details>
              <summary>¿Cuántas pruebas tiene?</summary>
              <p>Cuatro. Use of English va dentro de Reading and Use of English.</p>
            </details>
            <details>
              <summary>¿Pesan lo mismo?</summary>
              <p>No. Reading and Use of English es el 40 %. Las otras tres, el 20 % cada una.</p>
            </details>
            <details>
              <summary>¿Desde qué puntuación es B2?</summary>
              <p>Grade C desde 160. 140–159 puede salir como B1. 180 o más puede salir como C1.</p>
            </details>
          </div>
        </section>

        <section className="ab-section ab-final" id="cta-final">
          <h2>12. Siguiente paso</h2>
          <p>Pasa de leer el formato a hacer una tarea y ver el comentario.</p>
          <ToPractice />
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
