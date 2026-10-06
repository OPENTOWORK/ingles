import Link from 'next/link';
import AbCta from '@/components/landing/ab/AbCta';
import {
  AbCards,
  AbFaq,
  AbFinal,
  AbHero,
  AbPage,
  AbSteps,
  AbTrust,
  PaperBars,
} from '@/components/landing/ab/AbShell';
import B2GuideVisual from '@/components/landing/ab/B2GuideVisual';
import {
  CAMBRIDGE_OFFICIAL_URL,
  COMMON_MISTAKES,
  GUIDE_FAQ,
  PAPERS,
  STUDY_PLAN,
  guideToCampaignHref,
  normalizeAbVariant,
} from '@/lib/abExperiment';

export default function B2Guide({ variant = 'a' }) {
  const key = normalizeAbVariant(variant);
  if (key === 'b') return <B2GuideVisual />;
  const campaignHref = guideToCampaignHref('a');

  return (
    <AbPage pageType="guide" variant="a" source="direct" tone="guide">
      <AbHero
        kicker="B2 First · Cambridge English"
        title="Cómo preparar el B2 First de Cambridge"
        lead="El examen mira si usas el inglés en lectura, escritura, audio y conversación. Esta guía resume el formato y un modo de prepararlo sin tratar las cuatro pruebas como si pesaran lo mismo."
        actions={
          <AbCta href={campaignHref} pageType="guide" variant="a" source="b2-guide">
            Ver la práctica en Dralo
          </AbCta>
        }
        extra={
          <AbTrust items={['Cuatro pruebas, no cinco', 'Reading pesa el 40 %', 'Grade C desde 160']} />
        }
        visual={<PaperBars papers={PAPERS} />}
      />

      <section className="ab-prose">
        <section>
          <h2>Qué es el B2 First</h2>
          <p>
            Es un examen de Cambridge English de nivel B2. Certifica que puedes entender textos y
            conversaciones de cierta complejidad y escribir o hablar con una organización clara. No
            mide solo gramática suelta.
          </p>
        </section>
        <section>
          <h2>La escala</h2>
          <p>
            En la Cambridge English Scale, el Grade C (aprobado B2) empieza en 160. Un resultado de
            140 a 159 puede certificarse como B1. Con 180 o más, el resultado puede reportarse como
            C1. No hay un porcentaje fijo del examen que, por sí solo, sea el aprobado.
          </p>
        </section>
      </section>

      <AbCards
        columns={2}
        title="Cómo es cada prueba"
        lead="Use of English va dentro de Reading and Use of English. No es una quinta prueba."
        items={PAPERS.map((paper, index) => ({
          tone: ['purple', 'orange', 'blue', 'green'][index],
          title: `${paper.name} · ${paper.weight}`,
          text: paper.detail.replace(/\s*Número de preguntas: \[COMPLETAR\]\./, ''),
        }))}
      />

      <AbSteps
        title="Plan de preparación"
        lead="Empieza por el formato, no por un libro entero."
        steps={STUDY_PLAN.map((step) => ({ title: step.split(':')[0], text: step.split(':').slice(1).join(':').trim() || step }))}
      />

      <AbCards
        title="Errores frecuentes"
        items={[
          { tone: 'orange', title: 'Solo gramática', text: COMMON_MISTAKES[0] },
          { tone: 'purple', title: 'Contar cinco pruebas', text: COMMON_MISTAKES[1] },
          { tone: 'green', title: 'El essay a medias', text: COMMON_MISTAKES[2] },
        ]}
      />

      <section className="ab-prose">
        <section>
          <h2>Más fallos que se repiten</h2>
          <ul className="ab-ticks">
            {COMMON_MISTAKES.slice(3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Cómo practicar después de leer esto</h2>
          <p>
            En Writing, escribes el texto y la corrección comenta lo que has escrito: contenido,
            organización, logro comunicativo y lengua. Es un análisis sobre tu respuesta. No
            sustituye a la clase.
          </p>
          <p>
            Tu academia te enseña. La práctica entre clases es otra parte del trabajo: repetir el
            tipo de tarea y revisar el error concreto.
          </p>
        </section>
      </section>

      <AbFaq title="Preguntas frecuentes" items={GUIDE_FAQ} />

      <AbFinal
        title="Si el formato ya está claro, toca practicarlo"
        text="Dralo no reemplaza a tu profesora ni a tu academia. La página siguiente explica el Plan Plus y la condición para conservarlo."
        cta={
          <AbCta href={campaignHref} pageType="guide" variant="a" source="b2-guide">
            Seguir con la guía práctica
          </AbCta>
        }
      />

      <p className="ab-official">
        <Link href={CAMBRIDGE_OFFICIAL_URL} rel="noopener noreferrer" target="_blank">
          Información oficial de Cambridge English sobre B2 First
        </Link>
      </p>
    </AbPage>
  );
}
