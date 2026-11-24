import {
  getPlanBySlug,
  getPlanMonthlyPrice,
  PLUS_ANNUAL_BF_END_DATE,
  PLUS_ANNUAL_BF_PRICE,
  PLUS_ANNUAL_REGULAR_PRICE,
  PLUS_OFFER_END_DATE,
} from '@/data/financialPlanConfig';
import { SITE_URL } from '@/lib/siteSeo';

/** Fecha de inicio que Search Console pide en cada Offer. */
export const PLAN_PLUS_OFFER_VALID_FROM = '2026-11-21';

/**
 * Mascota de Dralo ya publicada en /public/mascot/3.png (1024×1024).
 * Misma imagen que usa la home.
 */
export const PLAN_PLUS_PRODUCT_IMAGE_PATH = '/mascot/3.png';

const PRODUCT_DESCRIPTION =
  'Plataforma para preparar el Cambridge B2 First: practica las partes del examen, recibe feedback sobre tus respuestas y entiende tus errores.';

function schemaPrice(amount) {
  return Number(amount).toFixed(2);
}

/**
 * Un solo Product, con las tres ofertas de la tarjeta:
 * mensual, anual de lista y anual de Black Friday.
 * Los importes salen de las mismas constantes que /precios.
 */
export function planPlusProductJsonLd() {
  const plan = getPlanBySlug('premium');
  const availability = 'https://schema.org/OnlineOnly';
  const annualUrl = `${SITE_URL}/precios/?facturacion=anual`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Dralo Plan Plus',
    description: PRODUCT_DESCRIPTION,
    image: `${SITE_URL}${PLAN_PLUS_PRODUCT_IMAGE_PATH}`,
    brand: { '@type': 'Brand', name: 'Dralo' },
    offers: [
      {
        '@type': 'Offer',
        name: 'Plan Plus mensual',
        price: schemaPrice(getPlanMonthlyPrice(plan, 'monthly')),
        priceCurrency: 'EUR',
        availability,
        validFrom: PLAN_PLUS_OFFER_VALID_FROM,
        priceValidUntil: PLUS_OFFER_END_DATE,
        url: `${SITE_URL}/precios/`,
      },
      {
        '@type': 'Offer',
        name: 'Plan Plus anual',
        price: schemaPrice(PLUS_ANNUAL_REGULAR_PRICE),
        priceCurrency: 'EUR',
        availability,
        validFrom: PLAN_PLUS_OFFER_VALID_FROM,
        priceValidUntil: '2026-12-31',
        url: annualUrl,
      },
      {
        '@type': 'Offer',
        name: 'Plan Plus anual Black Friday',
        price: schemaPrice(PLUS_ANNUAL_BF_PRICE),
        priceCurrency: 'EUR',
        availability,
        validFrom: PLAN_PLUS_OFFER_VALID_FROM,
        priceValidUntil: PLUS_ANNUAL_BF_END_DATE,
        url: annualUrl,
      },
    ],
  };
}

export function planPlusProductJsonLdScript() {
  return JSON.stringify(planPlusProductJsonLd()).replace(/</g, '\\u003c');
}
