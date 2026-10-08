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
import {
  FOUNDING_OFFER,
  PLUS_ENTITLEMENTS,
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
      {children || 'Crear mi cuenta gratis'}
    </AbCta>
  );
}

function conditionText() {
  return `Promoción para los primeros ${FOUNDING_OFFER.total} registros. Para conservar el Plan Plus gratis, completa el formulario que recibirás a los ${FOUNDING_OFFER.delayDays} días. Tendrás ${FOUNDING_OFFER.responseDays} días para responder; si no lo completas, tu cuenta pasará al plan gratuito.`;
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
  const entitlements = PLUS_ENTITLEMENTS || {};
  const primary = ['Práctica B2 First: Reading and Use of English, Writing y Listening'];
  if (Number.isInteger(entitlements.examsPerMonth)) {
    primary.push(`${entitlements.examsPerMonth} exámenes al mes`);
  }
  if (entitlements.writingAdvanced && Number.isInteger(entitlements.writingCorrectionMonthly)) {
    primary.push(`Corrección avanzada de Writing: ${entitlements.writingCorrectionMonthly} al mes`);
  }
  const secondary = [
    'Training: ejercicios de gramática, pregunta a pregunta',
    'Quiz: ronda de preguntas con tiempo',
  ];
  if (entitlements.examStrategies) {
    secondary.push('Exam Strategies: consejos por prueba y por parte');
  }
  if (entitlements.progressTracking === 'advanced') {
    secondary.push('Seguimiento de los resultados de tus prácticas');
  }
  return { primary, secondary };
}

const FAQ = [
  {
    q: '¿Qué incluye el Plan Plus?',
    a: 'La práctica de B2 First que ya está abierta (Reading and Use of English, Writing y Listening), los exámenes del plan, la corrección avanzada de Writing y el seguimiento de tus resultados. Training es la práctica de gramática, pregunta a pregunta. Quiz es una ronda de preguntas con tiempo.',
  },
  {
    q: '¿Qué significa “gratis para siempre”?',
    a: `Si completas el formulario dentro de los ${FOUNDING_OFFER.responseDays} días siguientes a recibirlo, el Plan Plus se mantiene sin cuota mensual. No pasa solo a un cobro.`,
  },
  {
    q: '¿Qué ocurre si no completo el formulario?',
    a: 'El Plan Plus se retira y la cuenta pasa al plan gratuito.',
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
            <p className="ab-offer-line">Consigue el Plan Plus gratis para siempre.</p>
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
        <h2>Qué incluye el Plan Plus</h2>
        <p className="ab-block__lead">
          Estas son las prestaciones del plan que ya puedes usar. La promoción no cambia esos límites.
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
        title="Cómo conseguir y conservar tu Plan Plus"
        steps={[
          {
            title: 'Crea tu cuenta',
            text: `Regístrate sin tarjeta. La promoción está disponible para los primeros ${FOUNDING_OFFER.total} registros.`,
          },
          {
            title: `Prueba Dralo durante ${FOUNDING_OFFER.delayDays} días`,
            text: 'Utiliza tu Plan Plus y descubre cómo encaja en tu preparación.',
          },
          {
            title: 'Completa el formulario',
            text: `Lo recibirás al cumplirse los ${FOUNDING_OFFER.delayDays} días y tendrás ${FOUNDING_OFFER.responseDays} días para responder. Si lo completas dentro del plazo, conservarás el Plan Plus gratis para siempre. Si no, tu cuenta pasará al plan gratuito.`,
          },
        ]}
      />

      <AbFaq title="Preguntas frecuentes" items={FAQ} />

      <AbFinal
        title="Empieza a practicar tu B2 con Dralo"
        text={`La promoción es para los primeros ${FOUNDING_OFFER.total} registros. Para conservar el Plus, responde el formulario en los ${FOUNDING_OFFER.responseDays} días siguientes a recibirlo.`}
        cta={<Cta source={origin} searchParams={searchParams} />}
      />
    </AbPage>
  );
}
