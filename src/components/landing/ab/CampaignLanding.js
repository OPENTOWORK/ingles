import AbCta from '@/components/landing/ab/AbCta';
import AbTracker from '@/components/landing/ab/AbTracker';
import FoundingSlotsStatus from '@/components/landing/ab/FoundingSlotsStatus';
import {
  AB_CTA_LABEL,
  CAMPAIGN_FAQ,
  CONDITION_SUMMARY,
  FOUNDING_OFFER,
  PAPERS,
  PLUS_HIGHLIGHTS,
  PLUS_LIST_PRICE,
  PLUS_PUBLIC_PRICE,
  PLUS_REGULAR_PRICE,
  PRACTICE_LOOP,
  buildRegisterHref,
  normalizeAbVariant,
} from '@/lib/abExperiment';
import CampaignVisual from '@/components/landing/ab/CampaignVisual';
import './ab-landing.css';

function Cta({ variant, source }) {
  return (
    <AbCta
      href={buildRegisterHref({ pageType: 'campaign', variant, source })}
      pageType="campaign"
      variant={variant}
      source={source}
    >
      {AB_CTA_LABEL}
    </AbCta>
  );
}

function PlusBlock() {
  return (
    <section className="ab-section" id="plan-plus">
      <h2>Qué incluye el Plan Plus</h2>
      {PLUS_HIGHLIGHTS.length ? (
        <ul className="ab-plain-list">
          {PLUS_HIGHLIGHTS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>[COMPLETAR FUNCIONES PLAN PLUS]</p>
      )}
      <p className="ab-price">{`Precio público actual: ${PLUS_PUBLIC_PRICE}.`}</p>
      <p className="ab-price">{`Precio regular de catálogo: ${PLUS_REGULAR_PRICE}.`}</p>
      <p className="ab-price">{`Precio de lista: ${PLUS_LIST_PRICE}.`}</p>
      <p className="ab-price">Precio habitual: [COMPLETAR PRECIO]</p>
    </section>
  );
}

function Loop() {
  return (
    <section className="ab-section" id="como-practica">
      <h2>Practicar, ver el error y volver a practicar</h2>
      <p>
        Tu academia te enseña. Dralo te ayuda a practicar fuera de clase. El recorrido es siempre el
        mismo:
      </p>
      <ol className="ab-loop">
        {PRACTICE_LOOP.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}

function Papers() {
  return (
    <section className="ab-section" id="pruebas">
      <h2>Las cuatro pruebas del B2</h2>
      <ul className="ab-papers">
        {PAPERS.map((paper) => (
          <li key={paper.name}>
            <strong>{paper.name}</strong> — {paper.weight}
          </li>
        ))}
      </ul>
      <p>Use of English va dentro de Reading and Use of English. No es una quinta prueba.</p>
    </section>
  );
}

function WritingProof() {
  return (
    <section className="ab-section" id="writing">
      <h2>Writing: el feedback es sobre tu texto</h2>
      <div className="ab-writing">
        <p>
          Escribes la tarea y la corrección de Writing comenta ese texto. Revisa cuatro criterios que
          ya usa el producto: Content, Communicative Achievement, Organisation y Language. También
          marca errores concretos de lo que has escrito.
        </p>
        <ol>
          <li>Escribes el essay, el email o la tarea que toque.</li>
          <li>Recibes comentarios sobre ese texto, no una plantilla genérica.</li>
          <li>Ves qué ha fallado y vuelves a escribir esa parte.</li>
        </ol>
        <p>
          El comentario se parece al tipo de análisis que podría hacer una profesora sobre tu
          respuesta. Lo hace la corrección de Writing de Dralo. No es una profesora y no sustituye a
          la clase.
        </p>
      </div>
    </section>
  );
}

function Audience() {
  return (
    <>
      <section className="ab-section" id="para-quien">
        <h2>Para quién es</h2>
        <p>
          Para quien ya estudia B2 First con academia o profesora y quiere practicar entre clases
          con un feedback que señale el error.
        </p>
      </section>
      <section className="ab-section" id="para-quien-no">
        <h2>Para quién no es</h2>
        <p>
          Para quien busca que Dralo sustituya a la academia, o quien quiere un certificado sin
          practicar las cuatro pruebas.
        </p>
      </section>
    </>
  );
}

function HowItWorks() {
  return (
    <section className="ab-section" id="como-funciona">
      <h2>Cómo funciona la promoción</h2>
      <ol className="ab-plain-list">
        <li>Te registras. El alta no pide tarjeta.</li>
        <li>
          Si entras entre los primeros {FOUNDING_OFFER.total} registros, recibes el Plan Plus sin
          cuota.
        </li>
        <li>{CONDITION_SUMMARY}</li>
      </ol>
    </section>
  );
}

function Faq() {
  return (
    <section className="ab-section" id="faq">
      <h2>Preguntas frecuentes</h2>
      <div className="ab-faq">
        {CAMPAIGN_FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function WhatIsDralo() {
  return (
    <section className="ab-section" id="que-es-dralo">
      <h2>Qué es Dralo</h2>
      <p>
        Dralo es la práctica entre clases. Sirve para hacer tareas de examen, recibir feedback,
        ver el error y seguir el progreso. La academia o la profesora siguen siendo quienes
        enseñan.
      </p>
    </section>
  );
}

export default function CampaignLanding({ variant = 'a', source = 'direct' }) {
  const key = normalizeAbVariant(variant);
  const origin = source === 'b2-guide' ? 'b2-guide' : 'direct';
  if (key === 'b') return <CampaignVisual source={origin} />;

  return (
    <article className="ab-landing ab-landing--campaign ab-landing--text" lang="es">
      <script
        dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='es'" }}
      />
      <AbTracker pageType="campaign" variant={key} source={origin} />
      <header className="ab-hero">
        <div className="ab-wrap">
          <p className="ab-kicker">Promoción de registro</p>
          <h1>{`Plan Plus gratis para siempre para los primeros ${FOUNDING_OFFER.total} registros`}</h1>
          <p className="ab-lead">
            Recibes el Plan Plus, el plan de práctica de Dralo, sin cuota mensual. La condición
            va junto a la oferta, no al final.
          </p>
          <p className="ab-condition">
            <strong>Condición.</strong> {CONDITION_SUMMARY}
          </p>
          <Cta variant="a" source={origin} />
          <FoundingSlotsStatus />
        </div>
      </header>
      <div className="ab-wrap">
        <PlusBlock />
        <WhatIsDralo />
        <Loop />
        <Papers />
        <WritingProof />
        <Audience />
        <HowItWorks />
        <Faq />

        <section className="ab-section ab-final" id="cta-final">
          <h2>Registra tu plaza</h2>
          <p>{CONDITION_SUMMARY}</p>
          <Cta variant="a" source={origin} />
        </section>
      </div>
    </article>
  );
}
