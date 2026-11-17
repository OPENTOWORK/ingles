/** El Checkout y el portal no pueden cargarse dentro del iframe de la vista app. */
export const STRIPE_OPEN_MESSAGE = 'dralo-open-stripe';

const STRIPE_HOSTS = new Set(['checkout.stripe.com', 'billing.stripe.com']);

export function isStripeHostedUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && STRIPE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function isEmbeddedFrame() {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Abre Stripe. En la web cambia esta pestaña. Dentro de la vista app, el marco
 * no guarda las cookies de Stripe, así que la página de fuera abre el pago.
 */
export function redirectToStripe(url) {
  if (!isStripeHostedUrl(url)) {
    throw new Error('La URL de pago no es válida.');
  }
  if (typeof window === 'undefined') return;

  if (!isEmbeddedFrame()) {
    window.location.assign(url);
    return;
  }

  try {
    window.parent.postMessage({ type: STRIPE_OPEN_MESSAGE, url }, '*');
  } catch {
    /* el marco no tiene ventana padre */
  }

  try {
    window.top.location.assign(url);
    return;
  } catch {
    /* el marco no puede mover la ventana de fuera */
  }

  const popup = window.open(url, '_blank', 'noopener');
  if (!popup) window.location.assign(url);
}
