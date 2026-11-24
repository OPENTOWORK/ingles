import {
  PLUS_ANNUAL_REGULAR_PRICE,
  PLUS_BLACK_FRIDAY_UNTIL_LABEL,
  formatEuroAmount,
  isBlackFridayOfferActive,
  plusBlackFridayAccessCopy,
} from '@/data/financialPlanConfig';

/** Tarjeta del plan de marketing. Activa mientras la oferta de la home sigue vigente. */
export function buildBlackFridayCampaign(now = new Date()) {
  const active = isBlackFridayOfferActive(now);
  return {
    id: 'black-friday-plus-year',
    nombre: 'Black Friday · Plan Plus anual',
    descripcion: `${plusBlackFridayAccessCopy()}, en lugar de ${formatEuroAmount(PLUS_ANNUAL_REGULAR_PRICE)}. Sale en la home, en precios y dentro de la cuenta.`,
    estado: active ? 'activa' : 'inactiva',
    enlace: '/precios/?facturacion=anual',
    meta: active ? `Hasta el ${PLUS_BLACK_FRIDAY_UNTIL_LABEL}` : `Cerrada el ${PLUS_BLACK_FRIDAY_UNTIL_LABEL}`,
  };
}

/** En el plan, todavía no en la web. */
export function buildPlusFreeMonthCampaign() {
  return {
    id: 'plus-free-month',
    nombre: 'Te regalamos un mes gratis con tu Plan Plus',
    descripcion: 'En diciembre, un mes gratis con el Plan Plus. Todavía no está publicada.',
    estado: 'sin_publicar',
    enlace: '',
    meta: '1–31 dic 2026',
  };
}
