import { classifyTrafficSource, trafficSourceLabel } from '@/lib/trafficSource';
import { readMarketingRowsByIds } from '@/lib/marketingMetrics';

const LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;
const CLOCK_TOLERANCE_MS = 2 * 60 * 1000;
const PAID_MEDIUM = /^(cpc|ppc|paid|paid[_-]?social|ads?|display|cpm|cpa)$/i;

function timestamp(value) {
  return value ? Date.parse(value) : NaN;
}

/** Conservative first-touch estimate. A click identifier alone does not prove a paid Meta visit. */
export function registrationSourceLabel(visitor, acquisition) {
  let landing;
  try {
    landing = new URL(acquisition?.first_landing_page || visitor.first_landing_page || '/', 'https://www.dralo.es');
  } catch {
    landing = new URL('https://www.dralo.es');
  }
  const params = landing.searchParams;
  const source = acquisition?.first_utm_source || params.get('utm_source') || '';
  const medium = acquisition?.first_utm_medium || params.get('utm_medium') || '';
  const gclid = acquisition?.first_gclid || params.get('gclid') || params.get('gbraid') || params.get('wbraid') || '';
  const storedSource = visitor.first_source || acquisition?.first_source || '';
  const facebookClick = params.has('fbclid');
  const tiktokClick = params.has('ttclid');
  // The shared classifier treats these as ads; here they only establish platform origin.
  params.delete('fbclid');
  params.delete('ttclid');
  const referrer = visitor.first_referrer ? `https://${visitor.first_referrer}` : '';
  if (source || medium || gclid || referrer || facebookClick || tiktokClick) {
    const classified = classifyTrafficSource({
      landingPage: landing.toString(), referrer,
      utmSource: source || (facebookClick ? 'facebook' : tiktokClick ? 'tiktok' : ''),
      utmMedium: medium, gclid,
    });
    if (classified.key !== 'direct') return classified.label;
  }
  if (storedSource === 'meta_ads' || storedSource === 'instagram_ads' || storedSource === 'tiktok_ads') {
    if (!PAID_MEDIUM.test(medium)) {
      return storedSource === 'instagram_ads' ? 'Instagram (pago no confirmado)'
        : storedSource === 'tiktok_ads' ? 'TikTok (pago no confirmado)' : 'Meta (pago no confirmado)';
    }
  }
  const label = trafficSourceLabel(storedSource, { utmSource: source, referrerHost: visitor.first_referrer });
  return label === '—' ? null : label;
}

/** One registration per user. Ignore visits first recorded after registration and older than 30 days. */
export function registrationSources(users = [], visitors = [], acquisitions = []) {
  const byVisitor = new Map(acquisitions.map((row) => [row.visitor_id, row]));
  const byUser = new Map(users.map((user) => [user.id, user]));
  const candidates = new Map();
  for (const visitor of visitors) {
    const registeredAt = timestamp(byUser.get(visitor.user_id)?.createdAt);
    const seenAt = timestamp(visitor.created_at);
    const acquisition = byVisitor.get(visitor.visitor_id);
    const acquiredAt = timestamp(acquisition?.first_timestamp);
    if (!Number.isFinite(registeredAt) || !Number.isFinite(seenAt)) continue;
    if (seenAt > registeredAt + CLOCK_TOLERANCE_MS || seenAt < registeredAt - LOOKBACK_MS) continue;
    if (Number.isFinite(acquiredAt) && acquiredAt > registeredAt + CLOCK_TOLERANCE_MS) continue;
    const previous = candidates.get(visitor.user_id);
    if (!previous || seenAt < previous.seenAt ||
        (seenAt === previous.seenAt && visitor.visitor_id < previous.visitor.visitor_id)) {
      candidates.set(visitor.user_id, { visitor, acquisition, seenAt });
    }
  }
  return new Map([...candidates].map(([id, candidate]) => [
    id, registrationSourceLabel(candidate.visitor, candidate.acquisition),
  ]));
}

export async function loadRegistrationSources(db, users) {
  const visitors = await readMarketingRowsByIds(users.map((user) => user.id), (ids) => db
    .from('marketing_visitors')
    .select('visitor_id, user_id, created_at, first_source, first_landing_page, first_referrer')
    .in('user_id', ids).order('visitor_id'));
  const acquisitions = await readMarketingRowsByIds(visitors.map((row) => row.visitor_id), (ids) => db
    .from('marketing_acquisition_profiles')
    .select('visitor_id, first_source, first_timestamp, first_landing_page, first_utm_source, first_utm_medium, first_gclid')
    .in('visitor_id', ids).order('visitor_id'));
  return registrationSources(users, visitors, acquisitions);
}
