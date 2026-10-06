import AbCta from '@/components/landing/ab/AbCta';
import {
  AbCards,
  AbFaq,
  AbFinal,
  AbHero,
  AbOffer,
  AbPage,
  AbQuote,
  AbSplit,
  AbSteps,
  AbTrust,
  ReadingPreview,
} from '@/components/landing/ab/AbShell';
import FoundingSlotsStatus from '@/components/landing/ab/FoundingSlotsStatus';
import {
  CONDITION_SUMMARY,
  FOUNDING_OFFER,
  buildRegisterHref,
} from '@/lib/abExperiment';

function Cta({ source }) {
  return (
    <AbCta
      href={buildRegisterHref({ pageType: 'campaign', variant: 'b', source })}
      pageType="campaign"
      variant="b"
      source={source}
    >
      Crear mi cuenta gratis
    </AbCta>
  );
}

const FAQ = [
  {
    q: '¿El Plus de esta promo se paga?',
    a: `No, si entras entre los ${FOUNDING_OFFER.total} primeros y respondes el formulario. Si no lo respondes en el plazo, el Plus se retira y te quedas en el plan gratuito.`,
  },
  {
    q: '¿Cuándo llega ese formulario?',
    a: `A los ${FOUNDING_OFFER.delayDays} días. Desde entonces tienes ${FOUNDING_OFFER.responseDays} días para completarlo.`,
  },
  {
    q: '¿Hace falta tarjeta en el alta?',
    a: 'No. El registro no tiene campo de tarjeta.',
  },
  {
    q: '¿Dralo da la clase?',
    a: 'No. La clase la da tu academia o tu profesora. Dralo practica y señala el fallo.',
  },
];

export default function CampaignVisual({ source = 'direct' }) {
  return (
    <AbPage pageType="campaign" variant="b" source={source} tone="product">
      <AbHero
        kicker="Mira el producto"
        title="Practica exámenes del B2 y descubre qué necesitas mejorar."
        lead="Tu academia explica. Dralo te pone la tarea y marca, sobre lo que tú has escrito, qué ha fallado. Writing es donde eso se ve con más claridad."
        actions={<Cta source={source} />}
        extra={
          <AbTrust
            items={['Sin tarjeta', 'Feedback sobre tu texto', `${FOUNDING_OFFER.total} plazas de Plan Plus`]}
          />
        }
        visual={<ReadingPreview />}
      />

      <AbQuote
        label="La duda"
        text="“Estoy estudiando, pero no sé si lo estoy haciendo suficientemente bien para aprobar.”"
        note="La clase enseña el tema. Entre clase y clase hace falta ver el error concreto, no solo hacer más ejercicios."
      />

      <AbCards
        title="Todo lo que necesitas para practicar el B2"
        lead="Cuatro pruebas. El comentario aparece en lo que acabas de hacer."
        items={[
          {
            tone: 'purple',
            title: 'Practica',
            text: 'Reading and Use of English, Writing, Listening y Speaking, con el tipo de tarea del examen.',
          },
          {
            tone: 'orange',
            title: 'Corrige',
            text: 'En Writing la marca cae sobre tu texto: contenido, organización, logro comunicativo y lengua.',
          },
          {
            tone: 'green',
            title: 'Mejora',
            text: 'Ves el fallo, reescribes esa parte y repites otra tarea parecida.',
          },
        ]}
      />

      <AbSteps
        title="Así funciona"
        lead="De la tarea al siguiente intento."
        steps={[
          { title: 'Regístrate', text: 'Nombre, correo y contraseña. Sin tarjeta.' },
          { title: 'Elige la parte', text: 'Empieza por la prueba que más se te atasca.' },
          { title: 'Haz la tarea', text: 'Escribes, lees o respondes como en el examen.' },
          { title: 'Mira la marca', text: 'El comentario es sobre tu respuesta, no una plantilla.' },
        ]}
      />

      <AbSplit
        title="Así comenta Dralo un writing"
        text="La corrección señala palabras concretas y explica el fallo. No es una profesora. Es la pantalla de Writing."
        points={[
          'Content, Communicative Achievement, Organisation y Language',
          'Errores concretos de lo que has escrito',
          'La nota de la imagen es del ejemplo, no un resultado real',
        ]}
        media={
          <figure className="ab-photo">
            <img
              src="/ab/writing-feedback.png"
              alt="Pantalla de Writing de Dralo: un texto marcado y un comentario sobre un error de gramática"
              width="1440"
              height="900"
            />
          </figure>
        }
      />

      <AbSplit
        flip
        title="Speaking también se practica con imágenes"
        text="En la parte de fotos comparas dos escenas. Estas dos salen de la práctica de Speaking. No son un anuncio ni un resultado."
        media={
          <div className="ab-photo-pair">
            <figure className="ab-photo">
              <img
                src="/b2-speaking/exam-1/photo-a.png"
                alt="Dos estudiantes revisando apuntes juntos en una biblioteca"
                width="1200"
                height="800"
              />
            </figure>
            <figure className="ab-photo">
              <img
                src="/b2-speaking/exam-1/photo-b.png"
                alt="Un estudiante escribiendo en un escritorio, de noche, junto a un portátil"
                width="1200"
                height="800"
              />
            </figure>
          </div>
        }
      />

      <AbOffer
        title={`Plan Plus gratis para los primeros ${FOUNDING_OFFER.total}`}
        text={CONDITION_SUMMARY}
        cta={<Cta source={source} />}
        seats={<FoundingSlotsStatus variant="badge" />}
      />

      <AbFaq title="Antes de registrarte" items={FAQ} />

      <AbFinal
        title="Tu preparación continúa fuera de clase."
        text="Entra, escribe una tarea y mira la marca sobre tu texto."
        cta={<Cta source={source} />}
      />
    </AbPage>
  );
}
