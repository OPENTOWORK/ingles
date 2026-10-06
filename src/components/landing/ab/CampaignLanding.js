import AbCta from '@/components/landing/ab/AbCta';
import {
  AbCards,
  AbFaq,
  AbFinal,
  AbHero,
  AbOffer,
  AbPage,
  AbSteps,
  AbTrust,
  OfferPreview,
} from '@/components/landing/ab/AbShell';
import FoundingSlotsStatus from '@/components/landing/ab/FoundingSlotsStatus';
import CampaignVisual from '@/components/landing/ab/CampaignVisual';
import {
  AB_CTA_LABEL,
  CAMPAIGN_FAQ,
  CONDITION_SUMMARY,
  FOUNDING_OFFER,
  PLUS_HIGHLIGHTS,
  PLUS_PUBLIC_PRICE,
  buildRegisterHref,
  normalizeAbVariant,
} from '@/lib/abExperiment';

function Cta({ source, children }) {
  return (
    <AbCta
      href={buildRegisterHref({ pageType: 'campaign', variant: 'a', source })}
      pageType="campaign"
      variant="a"
      source={source}
    >
      {children || AB_CTA_LABEL}
    </AbCta>
  );
}

export default function CampaignLanding({ variant = 'a', source = 'direct' }) {
  const key = normalizeAbVariant(variant);
  const origin = source === 'b2-guide' ? 'b2-guide' : 'direct';
  if (key === 'b') return <CampaignVisual source={origin} />;

  return (
    <AbPage pageType="campaign" variant="a" source={origin} tone="offer">
      <AbHero
        kicker="Promoción de registro"
        title={`Plan Plus gratis para siempre para los primeros ${FOUNDING_OFFER.total} registros`}
        lead="Recibes el plan de práctica de Dralo sin cuota mensual. La condición va junto a la oferta, no al final."
        actions={<Cta source={origin} />}
        extra={
          <>
            <p className="ab-lead">{CONDITION_SUMMARY}</p>
            <AbTrust
              items={[
                'Sin tarjeta en el alta',
                `Formulario a los ${FOUNDING_OFFER.delayDays} días`,
                `${FOUNDING_OFFER.total} plazas`,
              ]}
            />
          </>
        }
        visual={
          <OfferPreview>
            <FoundingSlotsStatus variant="badge" />
          </OfferPreview>
        }
      />

      <AbCards
        title="Qué cambia al registrarte"
        lead="La plaza es el Plan Plus. No es un curso nuevo ni sustituye a tu academia."
        items={[
          {
            tone: 'purple',
            title: 'El plan, sin cuota',
            text: `Si entras entre los ${FOUNDING_OFFER.total} primeros, el Plan Plus no se cobra.`,
          },
          {
            tone: 'orange',
            title: 'Una condición',
            text: `A los ${FOUNDING_OFFER.delayDays} días llega un formulario. Tienes ${FOUNDING_OFFER.responseDays} días para responderlo.`,
          },
          {
            tone: 'green',
            title: 'Si no respondes',
            text: 'El Plan Plus se retira y la cuenta pasa al plan gratuito. El progreso se queda.',
          },
        ]}
      />

      <AbSteps
        title="Cómo funciona la promoción"
        lead="Tres pasos. El alta pide nombre, correo y contraseña."
        steps={[
          { title: 'Te registras', text: 'El formulario no pide tarjeta.' },
          {
            title: 'Entras en el Plus',
            text: `Si quedas entre los ${FOUNDING_OFFER.total} primeros, el plan no se cobra.`,
          },
          { title: 'Conservas la plaza', text: CONDITION_SUMMARY },
        ]}
      />

      <AbOffer
        title="Qué incluye el Plan Plus"
        text={
          PLUS_PUBLIC_PRICE.startsWith('[')
            ? 'El catálogo público marca el precio del plan. En esta promoción, la plaza no se cobra si cumples la condición.'
            : `En el catálogo público el Plan Plus figura a ${PLUS_PUBLIC_PRICE}. En esta promoción no se cobra si cumples la condición.`
        }
        points={PLUS_HIGHLIGHTS.length ? PLUS_HIGHLIGHTS : ['[COMPLETAR FUNCIONES PLAN PLUS]']}
        cta={<Cta source={origin} />}
        seats={<FoundingSlotsStatus variant="headline" />}
      />

      <AbFaq title="Preguntas frecuentes" items={CAMPAIGN_FAQ} />

      <AbFinal
        title="Registra tu plaza"
        text={CONDITION_SUMMARY}
        cta={<Cta source={origin} />}
      />
    </AbPage>
  );
}
