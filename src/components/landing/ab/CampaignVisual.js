import AbCta from '@/components/landing/ab/AbCta';
import AbTracker from '@/components/landing/ab/AbTracker';
import FoundingSlotsStatus from '@/components/landing/ab/FoundingSlotsStatus';
import {
  AB_CTA_LABEL,
  CONDITION_SUMMARY,
  FOUNDING_OFFER,
  PLUS_HIGHLIGHTS,
  PLUS_LIST_PRICE,
  PLUS_PUBLIC_PRICE,
  PLUS_REGULAR_PRICE,
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
      {AB_CTA_LABEL}
    </AbCta>
  );
}

export default function CampaignVisual({ source = 'direct' }) {
  return (
    <article className="ab-landing ab-landing--campaign ab-landing--visual" lang="es">
      <script
        dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='es'" }}
      />
      <AbTracker pageType="campaign" variant="b" source={source} />
      <header className="ab-hero">
        <div className="ab-wrap ab-hero-grid">
          <div>
            <p className="ab-kicker">Mira el producto</p>
            <h1>Estudias en clase. Aquí ves el fallo en lo que tú has escrito.</h1>
            <p className="ab-lead">
              Tu academia explica. Dralo te pone una tarea de B2 y marca, sobre tu texto, qué ha
              fallado y cómo rehacerlo. Writing es donde eso se ve con más claridad.
            </p>
            <p className="ab-offer-note">
              {`Hay ${FOUNDING_OFFER.total} plazas de Plan Plus sin cuota.`} {CONDITION_SUMMARY}
            </p>
            <Cta source={source} />
            <FoundingSlotsStatus />
          </div>
          <figure className="ab-hero-frame ab-hero-frame--screen">
            <img
              src="/ab/writing-feedback.png"
              alt="Pantalla de Writing de Dralo: un texto marcado y un comentario sobre un error de gramática"
              width="1440"
              height="900"
            />
            <figcaption>Pantalla de la herramienta. El texto es de demostración.</figcaption>
          </figure>
        </div>
      </header>

      <div className="ab-wrap">
        <section className="ab-section" id="writing">
          <h2>Así comenta Dralo un writing</h2>
          <p>
            Escribes la tarea. La corrección señala palabras concretas y explica el fallo: gramática,
            vocabulario, organización o contenido. No es una profesora. Es la pantalla de Writing.
          </p>
          <figure className="ab-figure">
            <img
              src="/ab/writing-criteria.png"
              alt="Criterios de la corrección de Writing: Content, Communicative Achievement, Organisation y Language"
              width="1440"
              height="900"
            />
            <figcaption>
              Los cuatro criterios que usa la corrección. La nota de la imagen es del ejemplo, no un
              resultado real.
            </figcaption>
          </figure>
        </section>

        <section className="ab-section" id="recorrido">
          <h2>El ciclo, en este orden</h2>
          <ol className="ab-loop">
            <li>Haces la tarea</li>
            <li>Ves la marca en tu texto</li>
            <li>Lees por qué falla</li>
            <li>La reescribes</li>
            <li>Repites otra</li>
          </ol>
        </section>

        <section className="ab-section" id="speaking">
          <h2>Speaking también se practica con imágenes</h2>
          <p>
            En la parte de fotos comparas dos escenas. Estas dos salen de la práctica de Speaking
            de Dralo. No son un anuncio ni un resultado.
          </p>
          <div className="ab-photo-pair">
            <figure className="ab-figure">
              <img
                src="/b2-speaking/exam-1/photo-a.png"
                alt="Dos estudiantes revisando apuntes juntos en una biblioteca"
                width="1200"
                height="800"
              />
            </figure>
            <figure className="ab-figure">
              <img
                src="/b2-speaking/exam-1/photo-b.png"
                alt="Un estudiante escribiendo en un escritorio, de noche, junto a un portátil"
                width="1200"
                height="800"
              />
            </figure>
          </div>
        </section>

        <section className="ab-section" id="pruebas">
          <h2>Cuatro pruebas, no cinco</h2>
          <ul className="ab-papers">
            <li>
              <strong>Reading and Use of English</strong> — 40 %. Gramática y lectura van en la
              misma prueba.
            </li>
            <li>
              <strong>Writing</strong> — 20 %. Dos tareas. Aquí es donde el feedback se ve en la
              pantalla de arriba.
            </li>
            <li>
              <strong>Listening</strong> — 20 %. Cuatro partes de audio.
            </li>
            <li>
              <strong>Speaking</strong> — 20 %. Incluye la comparación de fotos.
            </li>
          </ul>
        </section>

        <section className="ab-section" id="plan-plus">
          <h2>Qué desbloquea el Plan Plus</h2>
          {PLUS_HIGHLIGHTS.length ? (
            <ul className="ab-plain-list">
              {PLUS_HIGHLIGHTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>[COMPLETAR FUNCIONES PLAN PLUS]</p>
          )}
          <p className="ab-price">{`En el catálogo público figura a ${PLUS_PUBLIC_PRICE}.`}</p>
          <p className="ab-price">{`El precio regular guardado es ${PLUS_REGULAR_PRICE} y el de lista ${PLUS_LIST_PRICE}.`}</p>
          <p className="ab-price">Precio habitual: [COMPLETAR PRECIO]</p>
        </section>

        <section className="ab-section" id="encaja">
          <h2>Encaja si ya tienes clase</h2>
          <p>
            Sirve si preparas el B2 con academia o profesora y quieres ver el error entre una clase
            y la siguiente. No sustituye esa clase.
          </p>
          <p>
            No encaja si buscas que Dralo dé el curso entero o si quieres un certificado sin hacer
            las cuatro pruebas.
          </p>
        </section>

        <section className="ab-section" id="pasos">
          <h2>Tres pasos y una condición</h2>
          <ol className="ab-plain-list">
            <li>Creas la cuenta. El formulario pide nombre, correo y contraseña.</li>
            <li>{`Si estás entre los ${FOUNDING_OFFER.total} primeros, el Plan Plus no se cobra.`}</li>
            <li>{CONDITION_SUMMARY}</li>
          </ol>
        </section>

        <section className="ab-section" id="faq">
          <h2>Antes de registrarte</h2>
          <div className="ab-faq">
            <details>
              <summary>¿El Plus de esta promo se paga?</summary>
              <p>
                {`No, si entras entre los ${FOUNDING_OFFER.total} primeros y respondes el formulario. Si no lo respondes en el plazo, el Plus se retira y te quedas en el plan gratuito.`}
              </p>
            </details>
            <details>
              <summary>¿Cuándo llega ese formulario?</summary>
              <p>
                {`A los ${FOUNDING_OFFER.delayDays} días. Desde entonces tienes ${FOUNDING_OFFER.responseDays} días para completarlo.`}
              </p>
            </details>
            <details>
              <summary>¿Hace falta tarjeta en el alta?</summary>
              <p>No. El registro no tiene campo de tarjeta.</p>
            </details>
            <details>
              <summary>¿Dralo da la clase?</summary>
              <p>No. La clase la da tu academia o tu profesora. Dralo practica y señala el fallo.</p>
            </details>
          </div>
        </section>

        <section className="ab-section ab-final" id="cta-final">
          <h2>Entra y mira tu primer texto corregido</h2>
          <p>{CONDITION_SUMMARY}</p>
          <Cta source={source} />
        </section>
      </div>
    </article>
  );
}
