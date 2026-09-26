/** Clasifica de dónde llegó una visita: buscador, red social, IA o anuncio. */

const PAID_MEDIUM = /^(cpc|ppc|paid|paid[_-]?social|ads?|display|cpm|cpa)$/i;

const OWN_HOSTS = new Set([
  'dralo.es',
  'www.dralo.es',
  'localhost',
  '127.0.0.1',
]);

const SOURCE_LABELS = {
  google_ads: 'Anuncio Google',
  instagram_ads: 'Anuncio Instagram',
  meta_ads: 'Anuncio Meta',
  tiktok_ads: 'Anuncio TikTok',
  ads: 'Anuncio',
  google: 'Google',
  bing: 'Bing',
  yahoo: 'Yahoo',
  duckduckgo: 'DuckDuckGo',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  twitter: 'X / Twitter',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  ai: 'IA',
  referral: 'Otro sitio',
  utm: 'Campaña',
  direct: 'Directo',
};

const AI_HOSTS = [
  'chatgpt.com',
  'chat.openai.com',
  'openai.com',
  'perplexity.ai',
  'gemini.google.com',
  'bard.google.com',
  'copilot.microsoft.com',
  'claude.ai',
  'you.com',
  'poe.com',
  'phind.com',
  'meta.ai',
  'grok.x.ai',
];

function hostFromUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw, raw.startsWith('http') ? undefined : 'https://placeholder.invalid');
    return url.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

function readLandingUrl(landingPage) {
  const raw = String(landingPage || '').trim();
  if (!raw) return null;
  try {
    return new URL(raw, 'https://www.dralo.es');
  } catch {
    return null;
  }
}

function isOwnHost(host) {
  if (!host) return false;
  if (OWN_HOSTS.has(host)) return true;
  return host.endsWith('.dralo.es');
}

function looksLikeAi(source, host) {
  if (/chatgpt|openai|perplexity|claude|gemini|copilot|grok|phind/.test(source)) return true;
  return AI_HOSTS.some((item) => host === item || host.endsWith(`.${item}`));
}

/**
 * @param {{
 *   referrer?: string,
 *   landingPage?: string,
 *   utmSource?: string,
 *   utmMedium?: string,
 *   utmCampaign?: string,
 *   gclid?: string,
 * }} input
 */
export function classifyTrafficSource(input = {}) {
  const landing = readLandingUrl(input.landingPage);
  const utmSource = String(input.utmSource || landing?.searchParams.get('utm_source') || '')
    .trim()
    .toLowerCase();
  const utmMedium = String(input.utmMedium || landing?.searchParams.get('utm_medium') || '')
    .trim()
    .toLowerCase();
  const utmCampaign = String(input.utmCampaign || landing?.searchParams.get('utm_campaign') || '')
    .trim()
    .toLowerCase();
  const gclid = String(input.gclid || landing?.searchParams.get('gclid') || '').trim();
  const fbclid = landing?.searchParams.get('fbclid') || '';
  const ttclid = landing?.searchParams.get('ttclid') || '';
  const msclkid = landing?.searchParams.get('msclkid') || '';
  const refHost = hostFromUrl(input.referrer);
  const paid = PAID_MEDIUM.test(utmMedium) || Boolean(gclid) || Boolean(msclkid);

  let key = 'direct';
  let medium = 'direct';

  if (gclid || (paid && /google|adwords/.test(utmSource))) {
    key = 'google_ads';
    medium = 'cpc';
  } else if (paid && /instagram|ig/.test(utmSource)) {
    key = 'instagram_ads';
    medium = 'paid_social';
  } else if (fbclid || (paid && /facebook|meta|fb/.test(utmSource))) {
    key = 'meta_ads';
    medium = 'paid_social';
  } else if (ttclid || (paid && /tiktok/.test(utmSource))) {
    key = 'tiktok_ads';
    medium = 'paid_social';
  } else if (paid) {
    key = 'ads';
    medium = utmMedium || 'cpc';
  } else if (/instagram|ig/.test(utmSource) || /instagram/.test(refHost)) {
    key = 'instagram';
    medium = 'social';
  } else if (/facebook|fb|meta/.test(utmSource) || /facebook|fb\.com/.test(refHost)) {
    key = 'facebook';
    medium = 'social';
  } else if (/tiktok/.test(utmSource) || /tiktok/.test(refHost)) {
    key = 'tiktok';
    medium = 'social';
  } else if (
    /twitter|^x$/.test(utmSource) ||
    refHost === 't.co' ||
    refHost === 'x.com' ||
    refHost === 'twitter.com' ||
    refHost.endsWith('.twitter.com')
  ) {
    key = 'twitter';
    medium = 'social';
  } else if (/linkedin/.test(utmSource) || /linkedin/.test(refHost)) {
    key = 'linkedin';
    medium = 'social';
  } else if (/youtube|youtu\.be/.test(utmSource) || /youtube|youtu\.be/.test(refHost)) {
    key = 'youtube';
    medium = 'social';
  } else if (looksLikeAi(utmSource, refHost)) {
    key = 'ai';
    medium = 'referral';
  } else if (/google/.test(refHost) || utmSource === 'google') {
    key = 'google';
    medium = 'organic';
  } else if (/bing/.test(refHost) || utmSource === 'bing') {
    key = 'bing';
    medium = 'organic';
  } else if (/yahoo/.test(refHost)) {
    key = 'yahoo';
    medium = 'organic';
  } else if (/duckduckgo/.test(refHost)) {
    key = 'duckduckgo';
    medium = 'organic';
  } else if (refHost && !isOwnHost(refHost)) {
    key = 'referral';
    medium = 'referral';
  } else if (utmSource) {
    key = 'utm';
    medium = utmMedium || 'campaign';
  }

  return {
    key,
    medium,
    campaign: utmCampaign || null,
    referrerHost: refHost && !isOwnHost(refHost) ? refHost : null,
    label: trafficSourceLabel(key, { utmSource, referrerHost: refHost }),
  };
}

export function trafficSourceLabel(key, extra = {}) {
  if (key === 'referral' && extra.referrerHost) return extra.referrerHost;
  if (key === 'utm' && extra.utmSource) return extra.utmSource;
  if (key === 'ads' && extra.utmSource) return `Anuncio (${extra.utmSource})`;
  return SOURCE_LABELS[key] || extra.utmSource || '—';
}

/** Reconstruye la etiqueta a partir de una fila de marketing_acquisition_profiles. */
export function labelFromAcquisitionProfile(profile) {
  if (!profile) return '—';
  const key = String(profile.first_source || '').trim();
  if (SOURCE_LABELS[key]) {
    return trafficSourceLabel(key, {
      utmSource: profile.first_utm_source,
      referrerHost: profile.first_content,
    });
  }
  const classified = classifyTrafficSource({
    referrer: profile.first_content ? `https://${profile.first_content}` : '',
    landingPage: profile.first_landing_page,
    utmSource: profile.first_utm_source || profile.first_source,
    utmMedium: profile.first_utm_medium || profile.first_medium,
    utmCampaign: profile.first_utm_campaign || profile.first_campaign,
    gclid: profile.first_gclid,
  });
  if (classified.key !== 'direct' || profile.first_source || profile.first_utm_source || profile.first_content) {
    return classified.label;
  }
  return '—';
}

const LANDING_RULES = [
  { test: (path) => path.includes('/quiz-game'), label: 'Quiz game' },
  { test: (path) => path.includes('/exam-mode'), label: 'Exam mode' },
  { test: (path) => path.includes('/exam-reading-and-use-of-english'), label: 'Reading and Use of English' },
  { test: (path) => path.includes('/exam-useofenglish') || path.includes('/exam-use-of-english'), label: 'Use of English' },
  { test: (path) => path.includes('/exam-reading'), label: 'Reading' },
  { test: (path) => path.includes('/exam-writing'), label: 'Writing' },
  { test: (path) => path.includes('/exam-listening'), label: 'Listening' },
  { test: (path) => path.includes('/exam-speaking'), label: 'Speaking' },
  { test: (path) => path.startsWith('/exam-practice') || path.startsWith('/niveles'), label: 'Exam Practice' },
  { test: (path) => path.startsWith('/training'), label: 'Training' },
  { test: (path) => path.startsWith('/exam-strategies'), label: 'Exam Strategies' },
  { test: (path) => path.startsWith('/dralo-ai'), label: 'Dralo AI' },
  { test: (path) => path.startsWith('/teoria') || path.startsWith('/exam-theory'), label: 'Theory' },
  { test: (path) => path.startsWith('/registro'), label: 'Registro' },
  { test: (path) => path.startsWith('/login'), label: 'Login' },
  { test: (path) => path.startsWith('/precios') || path.startsWith('/pricing'), label: 'Precios' },
  { test: (path) => path.startsWith('/blog'), label: 'Blog' },
  { test: (path) => path.startsWith('/contacto') || path.startsWith('/contact'), label: 'Contacto' },
  { test: (path) => path.startsWith('/perfil') || path.startsWith('/profile'), label: 'Perfil' },
  { test: (path) => path.startsWith('/prueba-nivel'), label: 'Placement Test' },
  { test: (path) => path.startsWith('/preparar-b2') || path.startsWith('/campana'), label: 'Landing B2' },
  { test: (path) => path.startsWith('/founding'), label: 'Encuesta founding' },
  { test: (path) => path === '/' || path === '', label: 'Home' },
];

function pathFromLanding(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'https://www.dralo.es');
    return (url.pathname.replace(/\/+$/, '') || '/').toLowerCase();
  } catch {
    return raw.split('?')[0].replace(/\/+$/, '').toLowerCase() || '/';
  }
}

/** Sección de Dralo en la que aterrizó la visita. */
export function landingLabelFromPath(value) {
  const path = pathFromLanding(value);
  if (!path) return '—';
  const match = LANDING_RULES.find((rule) => rule.test(path));
  return match?.label || path;
}

export function landingLabelFromAcquisitionProfile(profile) {
  return landingLabelFromPath(profile?.first_landing_page);
}

export function readBrowserTrafficFields() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    landingPage: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    referrer: String(document.referrer || '').slice(0, 500),
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    gclid: params.get('gclid') || '',
  };
}
