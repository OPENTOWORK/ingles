import AbCta from '@/components/landing/ab/AbCta';
import {
  AbCards,
  AbFaq,
  AbFinal,
  AbHero,
  AbPage,
  AbSteps,
} from '@/components/landing/ab/AbShell';
import FoundingSlotsStatus from '@/components/landing/ab/FoundingSlotsStatus';
import CampaignVisual from '@/components/landing/ab/CampaignVisual';
import { PRO_LAUNCH_COPY, PRO_LAUNCH_SLOT_LIMIT } from '@/lib/proLaunchOffer.rules';
import {
  buildRegisterHref,
  normalizeAbVariant,
} from '@/lib/abExperiment';

function Cta({ source, searchParams, children }) {
  return (
    <AbCta
      href={buildRegisterHref({ pageType: 'campaign', variant: 'a', source, searchParams })}
      pageType="campaign"
      variant="a"
      source={source}
    >
      {children || PRO_LAUNCH_COPY.cta}
    </AbCta>
  );
}

function conditionText() {
  return `${PRO_LAUNCH_COPY.microcopy} ${PRO_LAUNCH_COPY.previousOfferNote}`;
}

function WritingExample() {
  return (
    <figure className="ab-writing-shot">
      <p className="ab-kicker">Ejemplo de corrección</p>
      <div className="ab-writing-card">
        <p className="ab-writing-card__label">Fragmento</p>
        <p className="ab-writing-card__text">
          Firstly, it is true that eating fast food every day is harmful for our health.{' '}
          <mark>My friend eat hamburgers</mark> three times a week and he always feels tired in the afternoon.
        </p>
        <div className="ab-writing-card__note">
          <p>
            <strong>“My friend eat hamburgers”</strong>
          </p>
          <p className="ab-writing-card__tag">Grammar</p>
          <p>After a singular subject the present simple takes -s.</p>
          <p className="ab-writing-card__try">My friend eats hamburgers</p>
        </div>
      </div>
      <figcaption>
        Ejemplo de la pantalla de Writing. El texto es de muestra, no el de un alumno.
      </figcaption>
    </figure>
  );
}

function planPoints() {
  return {
    primary: [
      'Práctica B2 First: Reading and Use of English, Writing y Listening',
      'Feedback sobre tus respuestas',
    ],
    secondary: ['Seguimiento de los resultados de tus prácticas'],
  };
}

const FAQ = [
  {
    q: '¿Qué incluye esta oferta?',
    a: '3 meses de Plan PREMIUM para practicar Reading and Use of English, Writing y Listening, con feedback sobre tus respuestas. Speaking, Error Tracking y Training no forman parte de lo que esta oferta da por disponible.',
  },
  {
    q: '¿Cuánto dura?',
    a: `${PRO_LAUNCH_COPY.microcopy} Quien ya tenía la oferta anterior no entra en estas plazas.`,
  },
  {
    q: '¿Qué pasa al terminar los 3 meses?',
    a: 'El registro no pide tarjeta y estos 3 meses no se cobran. La condición al cumplirse el plazo no está publicada: la oferta no activa un cobro por sí sola.',
  },
  {
    q: '¿Necesito tarjeta?',
    a: 'No. El registro pide nombre, correo y contraseña. No hay un campo de tarjeta.',
  },
  {
    q: '¿Qué partes del B2 puedo practicar?',
    a: 'Reading and Use of English, Writing y Listening. Use of English no es una prueba aparte: forma parte de Reading and Use of English. Speaking es una prueba del examen; su práctica en Dralo todavía no está abierta.',
  },
  {
    q: '¿Dralo sustituye a una academia o a una profesora?',
    a: 'No. La academia o la profesora enseñan. Dralo sirve para practicar con formato de examen, ver la corrección del Writing y consultar tus resultados.',
  },
];

export default function CampaignLanding({ variant = 'a', source = 'direct', searchParams = null }) {
  const key = normalizeAbVariant(variant);
  const origin = source === 'b2-guide' ? 'b2-guide' : 'direct';
  if (key === 'b') return <CampaignVisual source={origin} />;

  const points = planPoints();
  const condition = conditionText();

  return (
    <AbPage pageType="campaign" variant="a" source={origin} tone="offer">
      <AbHero
        kicker="Práctica B2 First"
        title="Practica tu B2 First y entiende qué necesitas mejorar."
        lead="Practica con formato de examen y mejora tu Writing con correcciones detalladas y explicaciones."
        actions={
          <div className="ab-hero__offer">
            <p className="ab-offer-line">{PRO_LAUNCH_COPY.badge}</p>
            <p className="ab-offer-line">{PRO_LAUNCH_COPY.title}</p>
            <FoundingSlotsStatus variant="sentence" />
            <div className="ab-hero__row">
              <Cta source={origin} searchParams={searchParams} />
              <p className="ab-support">Sin tarjeta.</p>
            </div>
            <p className="ab-condition">{condition}</p>
          </div>
        }
        visual={<WritingExample />}
      />

      <AbCards
        title="Así te ayuda Dralo a preparar el B2"
        items={[
          {
            tone: 'purple',
            title: 'Practica el examen',
            text: 'Entrena con actividades de B2 First y familiarízate con el formato de las preguntas.',
          },
          {
            tone: 'orange',
            title: 'Entiende tus errores',
            text: 'Revisa las correcciones de tu Writing y las explicaciones que te ayudan a mejorar.',
          },
          {
            tone: 'green',
            title: 'Consulta tu progreso',
            text: 'Consulta los resultados de tus prácticas y comprueba cómo evolucionas.',
          },
        ]}
      />

      <section className="ab-block ab-plan">
        <h2>Qué puedes usar con esta oferta</h2>
        <p className="ab-block__lead">
          Practica las partes del examen que ya están abiertas y revisa el feedback. La oferta no añade funciones que todavía están en desarrollo.
        </p>
        <ul className="ab-plan__primary">
          {points.primary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ul className="ab-plan__secondary">
          {points.secondary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <AbSteps
        title="Cómo reservar tu plaza"
        steps={[
          {
            title: 'Crea tu cuenta',
            text: `Regístrate sin tarjeta mientras queden plazas, hasta ${PRO_LAUNCH_SLOT_LIMIT}.`,
          },
          {
            title: 'Empieza con Plan PREMIUM',
            text: 'Practica las partes del examen y revisa el feedback de tus respuestas.',
          },
          {
            title: '3 meses desde el registro',
            text: PRO_LAUNCH_COPY.microcopy,
          },
        ]}
      />

      <AbFaq title="Preguntas frecuentes" items={FAQ} />

      <AbFinal
        title="Empieza a practicar tu B2 con Dralo"
        text={PRO_LAUNCH_COPY.subtitle}
        cta={<Cta source={origin} searchParams={searchParams} />}
      />
    </AbPage>
  );
}
