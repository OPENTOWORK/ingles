/**
 * Lógica pura de first touch / last touch.
 * first touch nunca se sobrescribe una vez establecido.
 */

function hasAcquisitionSignal(fields = {}) {
  return Boolean(
    fields.source ||
      fields.medium ||
      fields.campaign ||
      fields.content ||
      fields.term ||
      fields.utm_source ||
      fields.utm_medium ||
      fields.utm_campaign ||
      fields.utm_content ||
      fields.utm_term ||
      fields.gclid ||
      fields.gbraid ||
      fields.wbraid,
  );
}

function pickAcquisition(fields = {}) {
  return {
    source: fields.source || fields.utm_source || null,
    medium: fields.medium || fields.utm_medium || null,
    campaign: fields.campaign || fields.utm_campaign || null,
    content: fields.content || fields.utm_content || null,
    term: fields.term || fields.utm_term || null,
    utm_source: fields.utm_source || null,
    utm_medium: fields.utm_medium || null,
    utm_campaign: fields.utm_campaign || null,
    utm_content: fields.utm_content || null,
    utm_term: fields.utm_term || null,
    gclid: fields.gclid || null,
    gbraid: fields.gbraid || null,
    wbraid: fields.wbraid || null,
    landing_page: fields.landing_page || fields.page_url || null,
    timestamp: fields.event_timestamp || fields.timestamp || new Date().toISOString(),
  };
}

/**
 * @param {object|null} existingProfile - fila actual de marketing_acquisition_profiles
 * @param {object} incoming - datos del evento actual
 * @returns {{ firstTouch: object|null, lastTouch: object|null, patch: object }}
 */
export function computeAcquisitionPatch(existingProfile, incoming = {}) {
  const patch = {};
  const incomingAcq = pickAcquisition(incoming);
  const hasSignal = hasAcquisitionSignal(incoming);

  const firstAlreadySet = Boolean(existingProfile?.first_timestamp);

  if (!firstAlreadySet && hasSignal) {
    patch.first_source = incomingAcq.source;
    patch.first_medium = incomingAcq.medium;
    patch.first_campaign = incomingAcq.campaign;
    patch.first_content = incomingAcq.content;
    patch.first_term = incomingAcq.term;
    patch.first_landing_page = incomingAcq.landing_page;
    patch.first_timestamp = incomingAcq.timestamp;
    patch.first_utm_source = incomingAcq.utm_source;
    patch.first_utm_medium = incomingAcq.utm_medium;
    patch.first_utm_campaign = incomingAcq.utm_campaign;
    patch.first_utm_content = incomingAcq.utm_content;
    patch.first_utm_term = incomingAcq.utm_term;
    patch.first_gclid = incomingAcq.gclid;
    patch.first_gbraid = incomingAcq.gbraid;
    patch.first_wbraid = incomingAcq.wbraid;
  }

  if (hasSignal) {
    patch.last_source = incomingAcq.source;
    patch.last_medium = incomingAcq.medium;
    patch.last_campaign = incomingAcq.campaign;
    patch.last_content = incomingAcq.content;
    patch.last_term = incomingAcq.term;
    patch.last_landing_page = incomingAcq.landing_page;
    patch.last_timestamp = incomingAcq.timestamp;
    patch.last_utm_source = incomingAcq.utm_source;
    patch.last_utm_medium = incomingAcq.utm_medium;
    patch.last_utm_campaign = incomingAcq.utm_campaign;
    patch.last_utm_content = incomingAcq.utm_content;
    patch.last_utm_term = incomingAcq.utm_term;
    patch.last_gclid = incomingAcq.gclid;
    patch.last_gbraid = incomingAcq.gbraid;
    patch.last_wbraid = incomingAcq.wbraid;
  }

  if (incoming.event_name === 'generate_lead' && !existingProfile?.lead_created_at) {
    patch.lead_created_at = incoming.event_timestamp;
  }
  if (incoming.event_name === 'lead_qualified' && !existingProfile?.lead_qualified_at) {
    patch.lead_qualified_at = incoming.event_timestamp;
  }
  if (incoming.event_name === 'customer_created' && !existingProfile?.customer_created_at) {
    patch.customer_created_at = incoming.event_timestamp;
    patch.converted_at = incoming.event_timestamp;
  }
  if (incoming.event_name === 'purchase' && !existingProfile?.converted_at) {
    patch.converted_at = incoming.event_timestamp;
  }

  return {
    firstTouch: firstAlreadySet ? null : hasSignal ? incomingAcq : null,
    lastTouch: hasSignal ? incomingAcq : null,
    patch,
  };
}

export function shouldSkipDuplicatePageView({ existingEvent, incoming, windowMs = 5000 }) {
  if (!existingEvent || incoming.event_name !== 'page_view') return false;
  const existingTs = new Date(existingEvent.event_timestamp).getTime();
  const incomingTs = new Date(incoming.event_timestamp).getTime();
  if (Number.isNaN(existingTs) || Number.isNaN(incomingTs)) return false;
  if (Math.abs(incomingTs - existingTs) > windowMs) return false;
  return (existingEvent.page_url || '') === (incoming.page_url || '');
}
