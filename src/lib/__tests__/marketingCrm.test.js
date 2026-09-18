import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeAcquisitionPatch, shouldSkipDuplicatePageView } from '@/lib/marketing/crm/acquisition.js';
import {
  generateEventPublicId,
  generateVisitorId,
  isValidEventPublicId,
  isValidVisitorId,
} from '@/lib/marketing/crm/constants.js';
import {
  buildIdempotencyKey,
  isValidUuid,
  validateMarketingConsentPayload,
  validateMarketingEventPayload,
} from '@/lib/marketing/crm/validation.js';
import {
  getClientIpFromRequest,
  tryConsumeMarketingIngestRate,
} from '@/lib/marketing/crm/rateLimit.js';

const SAMPLE_USER_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

describe('marketing visitor ids', () => {
  it('generates valid visitor_id', () => {
    const id = generateVisitorId();
    assert.equal(isValidVisitorId(id), true);
    assert.match(id, /^vis_[a-f0-9]{32}$/);
  });

  it('generates valid event public id', () => {
    const id = generateEventPublicId();
    assert.equal(isValidEventPublicId(id), true);
  });
});

describe('validateMarketingEventPayload', () => {
  it('accepts a minimal page_view payload', () => {
    const result = validateMarketingEventPayload({
      event_name: 'page_view',
      visitor_id: generateVisitorId(),
      timestamp: '2026-09-18T10:30:00Z',
      page_url: 'https://example.com/servicios',
    });
    assert.equal(result.ok, true);
    assert.equal(result.data.event_name, 'page_view');
  });

  it('rejects missing event_name', () => {
    const result = validateMarketingEventPayload({ visitor_id: generateVisitorId() });
    assert.equal(result.ok, false);
  });

  it('rejects invalid visitor_id format', () => {
    const result = validateMarketingEventPayload({
      event_name: 'page_view',
      visitor_id: 'bad-id',
    });
    assert.equal(result.ok, false);
  });

  it('rejects invalid timestamp', () => {
    const result = validateMarketingEventPayload({
      event_name: 'page_view',
      timestamp: 'not-a-date',
    });
    assert.equal(result.ok, false);
  });

  it('rejects invalid contact_id UUID', () => {
    const result = validateMarketingEventPayload({
      event_name: 'generate_lead',
      contact_id: 'not-a-uuid',
    });
    assert.equal(result.ok, false);
    assert.match(result.error, /contact_id/);
  });

  it('accepts valid UUID identity fields', () => {
    const result = validateMarketingEventPayload({
      event_name: 'generate_lead',
      contact_id: SAMPLE_USER_ID,
      user_id: SAMPLE_USER_ID,
      lead_id: SAMPLE_USER_ID,
      customer_id: SAMPLE_USER_ID,
    });
    assert.equal(result.ok, true);
    assert.equal(isValidUuid(SAMPLE_USER_ID), true);
  });
});

describe('first touch / last touch', () => {
  it('sets first touch only once', () => {
    const incoming = {
      event_name: 'page_view',
      source: 'google',
      medium: 'cpc',
      utm_source: 'google',
      page_url: '/landing',
      event_timestamp: '2026-09-18T10:00:00Z',
    };

    const first = computeAcquisitionPatch(null, incoming);
    assert.equal(first.patch.first_source, 'google');
    assert.equal(first.patch.last_source, 'google');

    const existing = { first_timestamp: '2026-09-18T10:00:00Z', first_source: 'google' };
    const second = computeAcquisitionPatch(existing, {
      ...incoming,
      source: 'facebook',
      medium: 'social',
      event_timestamp: '2026-09-19T10:00:00Z',
    });

    assert.equal(second.patch.first_source, undefined);
    assert.equal(second.patch.last_source, 'facebook');
  });

  it('keeps first touch on Google Ads when second visit is organic', () => {
    const ads = {
      event_name: 'page_view',
      source: 'google',
      medium: 'cpc',
      campaign: 'campaña_google',
      event_timestamp: '2026-09-18T10:00:00Z',
      page_url: '/landing',
    };

    const first = computeAcquisitionPatch(null, ads);
    assert.equal(first.patch.first_source, 'google');
    assert.equal(first.patch.first_medium, 'cpc');
    assert.equal(first.patch.first_campaign, 'campaña_google');

    const profile = {
      first_timestamp: first.patch.first_timestamp,
      first_source: first.patch.first_source,
      first_medium: first.patch.first_medium,
      first_campaign: first.patch.first_campaign,
    };

    const organic = computeAcquisitionPatch(profile, {
      event_name: 'page_view',
      source: 'google',
      medium: 'organic',
      event_timestamp: '2026-09-19T10:00:00Z',
      page_url: '/blog',
    });

    assert.equal(organic.patch.first_source, undefined);
    assert.equal(organic.patch.first_medium, undefined);
    assert.equal(organic.patch.first_campaign, undefined);
    assert.equal(organic.patch.last_source, 'google');
    assert.equal(organic.patch.last_medium, 'organic');
  });

  it('updates last touch through google cpc → organic → direct', () => {
    let profile = null;

    profile = { ...profile, ...computeAcquisitionPatch(profile, {
      event_name: 'page_view',
      source: 'google',
      medium: 'cpc',
      event_timestamp: '2026-09-18T10:00:00Z',
    }).patch };

    profile = { ...profile, ...computeAcquisitionPatch(profile, {
      event_name: 'page_view',
      source: 'google',
      medium: 'organic',
      event_timestamp: '2026-09-20T10:00:00Z',
    }).patch };

    const third = computeAcquisitionPatch(profile, {
      event_name: 'page_view',
      source: 'direct',
      medium: 'direct',
      event_timestamp: '2026-09-22T10:00:00Z',
    });

    assert.equal(profile.first_source, 'google');
    assert.equal(profile.first_medium, 'cpc');
    assert.equal(third.patch.last_source, 'direct');
    assert.equal(third.patch.last_medium, 'direct');
  });

  it('records lead and customer milestones', () => {
    const patch = computeAcquisitionPatch(null, {
      event_name: 'generate_lead',
      event_timestamp: '2026-09-23T14:20:00Z',
      source: 'google',
    });
    assert.equal(patch.patch.lead_created_at, '2026-09-23T14:20:00Z');

    const customer = computeAcquisitionPatch(patch.patch, {
      event_name: 'customer_created',
      event_timestamp: '2026-10-04T11:00:00Z',
    });
    assert.equal(customer.patch.customer_created_at, '2026-10-04T11:00:00Z');
  });
});

describe('duplicate page_view', () => {
  it('skips duplicate page views within window', () => {
    const skip = shouldSkipDuplicatePageView({
      existingEvent: {
        event_timestamp: '2026-09-18T10:30:00Z',
        page_url: 'https://example.com/servicios',
      },
      incoming: {
        event_name: 'page_view',
        event_timestamp: '2026-09-18T10:30:02Z',
        page_url: 'https://example.com/servicios',
      },
    });
    assert.equal(skip, true);
  });

  it('allows different urls', () => {
    const skip = shouldSkipDuplicatePageView({
      existingEvent: {
        event_timestamp: '2026-09-18T10:30:00Z',
        page_url: 'https://example.com/a',
      },
      incoming: {
        event_name: 'page_view',
        event_timestamp: '2026-09-18T10:30:01Z',
        page_url: 'https://example.com/b',
      },
    });
    assert.equal(skip, false);
  });
});

describe('idempotency key', () => {
  it('builds stable key from payload fields', () => {
    const payload = {
      visitor_id: 'vis_abc',
      session_id: 'sess_1',
      event_name: 'page_view',
      event_timestamp: '2026-09-18T10:30:00Z',
      page_url: '/x',
    };
    const key = buildIdempotencyKey(payload);
    assert.equal(key, 'vis_abc|sess_1|page_view|2026-09-18T10:30:00Z|/x');
  });
});

describe('marketing ingest rate limit', () => {
  it('allows requests under the limit', () => {
    const ip = '203.0.113.10';
    assert.equal(tryConsumeMarketingIngestRate(ip, 'marketing:events:test'), true);
  });

  it('extracts client IP from x-forwarded-for', () => {
    const req = {
      headers: {
        get: (name) => (name === 'x-forwarded-for' ? '1.2.3.4, 5.6.7.8' : null),
      },
    };
    assert.equal(getClientIpFromRequest(req), '1.2.3.4');
  });
});

describe('validateMarketingConsentPayload', () => {
  it('accepts tri-state consent values', () => {
    const result = validateMarketingConsentPayload({
      visitor_id: generateVisitorId(),
      analytics_consent: true,
      ads_consent: false,
      marketing_consent: null,
    });
    assert.equal(result.ok, true);
    assert.equal(result.data.marketing_consent, null);
  });

  it('rejects invalid consent boolean', () => {
    const result = validateMarketingConsentPayload({
      visitor_id: generateVisitorId(),
      analytics_consent: 'yes',
    });
    assert.equal(result.ok, false);
  });
});
