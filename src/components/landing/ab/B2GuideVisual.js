import Link from 'next/link';
import AbCta from '@/components/landing/ab/AbCta';
import {
  AbCards,
  AbFaq,
  AbFinal,
  AbHero,
  AbPage,
  AbSplit,
  AbSteps,
} from '@/components/landing/ab/AbShell';
import { CAMBRIDGE_OFFICIAL_URL, guideToCampaignHref } from '@/lib/abExperiment';

const HREF = guideToCampaignHref('b');

function ToPractice({ children }) {
  return (
    <AbCta href={HREF} pageType="guide" variant="b" source="b2-guide">
      {children || 'Practicar con Dralo'}
    </AbCta>
  );
}

const FAQ = [
  {
    q: '¿Cuántas pruebas tiene?',
    a: 'Cuatro. Use of English va dentro de Reading and Use of English.',
  },
  {
    q: '¿Pesan lo mismo?',
    a: 'No. Reading and Use of English es el 40 %. Las otras tres, el 20 % cada una.',
  },
  {
    q: '¿Desde qué puntuación es B2?',
    a: 'Grade C desde 160. 140–159 puede salir como B1. 180 o más puede salir como C1.',
  },
];

export default function B2GuideVisual() {
  return (
    <AbPage pageType="guide" variant="b" source="direct" tone="photos">
      <AbHero
        kicker="Guía visual del B2 First"
        title="Ya sabes que hay un examen. Mira cómo es cada prueba."
        lead="Cuatro partes, y Reading and Use of English pesa el doble que cada una de las otras. Al lado, una foto de la tarea de Speaking: comparar dos escenas."
        actions={<ToPractice />}
        visual={
          <figure className="ab-photo">
            <img
              src="/b2-speaking/exam-2/photo-a.png"
              alt="Dos mujeres hablando en la terraza de un café, con dos tazas sobre la mesa"
              width="1536"
              height="1024"
            />
            <figcaption>Foto de la práctica de Speaking. No es un resultado de examen.</figcaption>
          </figure>
        }
      />

      <AbCards
        title="El peso del examen"
        lead="En la Cambridge English Scale, el Grade C empieza en 160."
        items={[
          { tone: 'purple', title: 'Reading and Use of English · 40 %', text: 'Una sola hoja, siete partes, 52 preguntas y 75 minutos. Las cuatro primeras son huecos de gramática y vocabulario. Las tres últimas son textos.' },
          { tone: 'orange', title: 'Writing · 20 %', text: 'Dos textos en 80 minutos. El primero es un essay obligatorio, entre 140 y 190 palabras. El segundo lo eliges entre tres opciones.' },
          { tone: 'blue', title: 'Listening · 20 %', text: 'Cuatro audios, unos 40 minutos, más el tiempo de pasar respuestas. Cada grabación suena dos veces, salvo algunos fragmentos de la primera parte.' },
          { tone: 'green', title: 'Speaking · 20 %', text: 'Unos 14 minutos y cuatro partes, casi siempre en pareja. En una de ellas comparas dos fotos y dices en qué se parecen.' },
        ]}
        columns={2}
      />

      <AbSplit
        title="La tarea de las dos fotos"
        text="Comparas las escenas, dices en qué se parecen y en qué no, y respondes a lo que te preguntan. Una frase memorizada que no encaja se nota enseguida."
        media={
          <div className="ab-photo-pair">
            <figure className="ab-photo">
              <img
                src="/b2-speaking/exam-3/photo-a.png"
                alt="Una mujer pedaleando en bicicleta por una carretera entre colinas"
                width="1536"
                height="1024"
              />
            </figure>
            <figure className="ab-photo">
              <img
                src="/b2-speaking/exam-3/photo-b.png"
                alt="Un hombre nadando a crol en una piscina cubierta"
                width="1536"
                height="1024"
              />
            </figure>
          </div>
        }
      />

      <AbSteps
        title="Por dónde empezar esta semana"
        lead="Una tarea corta de cada prueba. Anota el tipo de fallo, no la teoría."
        steps={[
          { title: 'Una de cada', text: 'Sin mirar el libro antes.' },
          { title: 'El fallo que se repite', text: 'Tiempo, no contestar, o no pillar el audio.' },
          { title: 'Reescribe el writing', text: 'Usando solo ese comentario.' },
          { title: 'Junta las cuatro', text: 'Cuando ya no te pierdes en el formato.' },
        ]}
      />

      <AbFaq title="Preguntas frecuentes" items={FAQ} />

      <AbFinal
        title="Ya sabes qué tienes que preparar. Ahora toca hacerlo."
        text="Pasa de mirar el formato a hacer una tarea y ver el comentario."
        cta={<ToPractice>Practicar con Dralo</ToPractice>}
      />

      <p className="ab-official">
        <Link href={CAMBRIDGE_OFFICIAL_URL} rel="noopener noreferrer" target="_blank">
          Información oficial de Cambridge English sobre B2 First
        </Link>
      </p>
    </AbPage>
  );
}
