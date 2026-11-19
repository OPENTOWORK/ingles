/**
 * Recuerda el Checkout pagado y lo une a la cuenta cuando ya hay sesión.
 */
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { supabase } from '@/utils/supabaseClient';

const STORAGE_KEY = 'dralo_paid_checkout';
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

export function rememberPaidCheckout(sessionId) {
  const id = String(sessionId || '').trim();
  if (!SESSION_ID.test(id) || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* el navegador puede bloquear el almacenamiento */
  }
}

export function readPaidCheckout() {
  if (typeof window === 'undefined') return '';
  try {
    const id = window.localStorage.getItem(STORAGE_KEY) || '';
    return SESSION_ID.test(id) ? id : '';
  } catch {
    return '';
  }
}

export function rememberPaidCheckoutFromSearch(search) {
  const id = new URLSearchParams(String(search || '')).get('session_id');
  if (id) rememberPaidCheckout(id);
}

/** Devuelve el id si se activó el plan, null si no había pago pendiente, o lanza si falló. */
export async function claimRememberedCheckout() {
  const sessionId = readPaidCheckout();
  if (!sessionId) return null;
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) return null;

  const res = await fetch(buildClientApiUrl('/api/stripe/claim-checkout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ sessionId }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(payload.error || 'No se pudo activar el plan.');
    error.reason = payload.reason;
    throw error;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ya está activado */
  }
  return sessionId;
}
