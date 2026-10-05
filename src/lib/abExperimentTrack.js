import { AB_EVENTS, readAttributionFromSearch } from '@/lib/abExperiment';

const STORAGE_KEY = 'dralo_ab_attribution';
const START_FLAG = 'dralo_ab_registration_start';

function analyticsAllowed() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem('dralo_cookie_consent');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.preferences?.analytics);
  } catch {
    return false;
  }
}

export function rememberAbAttribution(attribution) {
  if (typeof window === 'undefined' || !attribution?.variant || !attribution?.pageType) return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        pageType: attribution.pageType,
        variant: attribution.variant,
        source: attribution.source === 'b2-guide' ? 'b2-guide' : 'direct',
      }),
    );
  } catch {
    /* almacenamiento no disponible */
  }
}

export function readRememberedAttribution() {
  if (typeof window === 'undefined') return null;
  const fromUrl = readAttributionFromSearch(window.location.search);
  if (fromUrl) return fromUrl;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.variant !== 'a' && parsed?.variant !== 'b') return null;
    if (parsed?.pageType !== 'guide' && parsed?.pageType !== 'campaign') return null;
    return {
      pageType: parsed.pageType,
      variant: parsed.variant,
      source: parsed.source === 'b2-guide' ? 'b2-guide' : 'direct',
    };
  } catch {
    return null;
  }
}

const recentEvents = new Map();

/**
 * Envía el evento al dataLayer que ya usa GTM/GA4.
 * Solo con consentimiento de analítica. No incluye datos personales.
 */
export function trackAbEvent(eventName, attribution) {
  if (typeof window === 'undefined' || !attribution?.variant || !attribution?.pageType) return;
  if (!Object.values(AB_EVENTS).includes(eventName)) return;
  if (!analyticsAllowed()) return;

  const payload = {
    event: eventName,
    page_type: attribution.pageType,
    variant: String(attribution.variant).toUpperCase(),
    ab_source: attribution.source === 'b2-guide' ? 'b2-guide' : 'direct',
    ab_experiment: true,
  };

  const dedupeKey = `${payload.event}|${payload.page_type}|${payload.variant}|${payload.ab_source}`;
  const now = Date.now();
  const previous = recentEvents.get(dedupeKey) || 0;
  if (payload.event === AB_EVENTS.pageView && now - previous < 1500) return;
  recentEvents.set(dedupeKey, now);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      page_type: payload.page_type,
      variant: payload.variant,
      ab_source: payload.ab_source,
      ab_experiment: true,
    });
  }
}

export function trackRegistrationStart(attribution) {
  if (!attribution || typeof window === 'undefined') return;
  rememberAbAttribution(attribution);
  const flag = `${attribution.pageType}:${attribution.variant}:${attribution.source}`;
  try {
    if (window.sessionStorage.getItem(START_FLAG) === flag) return;
    window.sessionStorage.setItem(START_FLAG, flag);
  } catch {
    /* si no hay sessionStorage, el evento puede repetirse en esta visita */
  }
  trackAbEvent(AB_EVENTS.registrationStart, attribution);
}

export function trackRegistrationComplete() {
  const attribution = readRememberedAttribution();
  if (!attribution) return;
  trackAbEvent(AB_EVENTS.registrationComplete, attribution);
}
