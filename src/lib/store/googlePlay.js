/**
 * Verificación de suscripciones de Google Play (solo servidor).
 * El token de compra no se fía del móvil: se consulta a Play con la cuenta
 * de servicio del desarrollador.
 */
import { createSign } from 'crypto';
import { readFileSync } from 'fs';
import { STORE_PACKAGE_NAME } from './products.js';

const PLAY_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const ACTIVE_STATES = new Set([
  'SUBSCRIPTION_STATE_ACTIVE',
  'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
]);

function readServiceAccount() {
  const inline = (process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON || '').trim();
  if (inline) return JSON.parse(inline);
  const file = (process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_FILE || '').trim();
  if (!file) return null;
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function isGooglePlayVerificationConfigured() {
  try {
    const account = readServiceAccount();
    return Boolean(account?.client_email && account?.private_key);
  } catch {
    return false;
  }
}

async function playAccessToken(account) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: account.client_email,
      scope: PLAY_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url');
  const payload = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(payload);
  const assertion = `${payload}.${signer.sign(account.private_key).toString('base64url')}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    throw new Error('Google Play no autorizó la verificación de la compra.');
  }
  return body.access_token;
}

/**
 * Traduce la respuesta de purchases.subscriptionsv2 a un acceso de Dralo.
 * Una cancelación mantiene el plan hasta la fecha de expiración.
 */
export function entitlementFromGoogleSubscription(body, requestedProductId) {
  const state = String(body?.subscriptionState || '');
  const lines = Array.isArray(body?.lineItems) ? body.lineItems : [];
  const line = lines.find((item) => item?.productId === requestedProductId) || lines[0] || null;
  const expiresMs = line?.expiryTime ? Date.parse(line.expiryTime) : NaN;
  const stillInPeriod = Number.isFinite(expiresMs) && expiresMs > Date.now();
  const canceledButPaid = state === 'SUBSCRIPTION_STATE_CANCELED' && stillInPeriod;
  const active = ACTIVE_STATES.has(state) || canceledButPaid;

  let status = 'canceled';
  if (state === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD') status = 'past_due';
  else if (active) status = 'active';

  return {
    active,
    status,
    cancelAtPeriodEnd: canceledButPaid,
    productId: line?.productId || null,
    expiresAt: Number.isFinite(expiresMs) ? new Date(expiresMs).toISOString() : null,
    transactionId: body?.latestOrderId || null,
    acknowledgementState: body?.acknowledgementState || null,
  };
}

export async function verifyGooglePurchase(purchaseToken, requestedProductId) {
  const account = readServiceAccount();
  if (!account?.client_email || !account?.private_key) {
    const error = new Error('Falta la cuenta de servicio de Google Play en el servidor.');
    error.status = 503;
    throw error;
  }
  if (!purchaseToken) {
    const error = new Error('Google Play no devolvió el comprobante de la compra.');
    error.status = 400;
    throw error;
  }

  const accessToken = await playAccessToken(account);
  const url =
    'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' +
    `${encodeURIComponent(STORE_PACKAGE_NAME)}/purchases/subscriptionsv2/tokens/` +
    encodeURIComponent(purchaseToken);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error('Google Play no reconoce esa suscripción.');
    error.status = 402;
    throw error;
  }

  const entitlement = entitlementFromGoogleSubscription(body, requestedProductId);
  if (
    entitlement.acknowledgementState &&
    entitlement.acknowledgementState !== 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED' &&
    entitlement.productId
  ) {
    await fetch(
      'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' +
        `${encodeURIComponent(STORE_PACKAGE_NAME)}/purchases/subscriptions/` +
        `${encodeURIComponent(entitlement.productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      },
    ).catch(() => {});
  }

  return entitlement;
}
