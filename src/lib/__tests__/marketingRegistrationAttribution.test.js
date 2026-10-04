import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registrationSources, registrationSourceLabel, loadRegistrationSources } from '../marketingRegistrationAttribution.js';
import { buildAttributionSummary } from '../marketingMetrics.js';

const user = { id: 'u', createdAt: '2026-10-01T10:00:00Z' };
const visitor = { visitor_id: 'v', user_id: 'u', created_at: '2026-10-01T09:55:00Z', first_source: 'direct' };

test('joins acquisition through visitor ID even when the acquisition user ID is missing', () => {
  const sources = registrationSources([user], [visitor], [{
    visitor_id: 'v', user_id: null, first_timestamp: visitor.created_at,
    first_utm_source: 'google', first_utm_medium: 'cpc', first_gclid: 'click',
  }]);
  assert.equal(sources.get('u'), 'Anuncio Google');
});

test('late login visits and visits outside the lookback never acquire an earlier account', () => {
  for (const created_at of ['2026-10-02T10:00:00Z', '2026-08-01T10:00:00Z', 'invalid']) {
    assert.equal(registrationSources([user], [{ ...visitor, created_at }]).size, 0);
  }
});

test('acquisition captured after registration is not retroactively assigned', () => {
  assert.equal(registrationSources([user], [visitor], [{
    visitor_id: 'v', first_timestamp: '2026-10-02T00:00:00Z', first_utm_source: 'google',
  }]).size, 0);
});

test('multiple browsers yield only the earliest eligible first contact', () => {
  const later = { ...visitor, visitor_id: 'z', created_at: '2026-10-01T09:59:00Z', first_source: 'google_ads' };
  assert.equal(registrationSources([user], [later, visitor]).get('u'), 'Directo');
  assert.equal(registrationSources([user], [visitor, later]).get('u'), 'Directo');
});

test('a missing first source is not silently replaced with a later paid visit', () => {
  const missing = { ...visitor, first_source: null };
  const later = { ...visitor, visitor_id: 'later', created_at: '2026-10-01T09:59:00Z', first_source: 'google_ads' };
  assert.equal(registrationSources([user], [later, missing]).get('u'), null);
});

test('missing dates, unrelated users and anonymous visitors remain unattributed', () => {
  assert.equal(registrationSources([{ id: 'u' }], [visitor]).size, 0);
  assert.equal(registrationSources([user], [{ ...visitor, user_id: 'other' }]).size, 0);
  assert.equal(registrationSources([user], [{ ...visitor, user_id: null }]).size, 0);
});

test('a Meta click identifier alone does not prove an advert', () => {
  assert.equal(registrationSourceLabel({ ...visitor, first_source: 'meta_ads', first_landing_page: '/?fbclid=example' }), 'Facebook');
  assert.equal(registrationSourceLabel({ ...visitor, first_source: 'meta_ads' }), 'Meta (pago no confirmado)');
  assert.equal(registrationSourceLabel({ ...visitor, first_landing_page: '/?utm_source=meta&utm_medium=paid_social&fbclid=example' }), 'Anuncio Meta');
});

test('Google privacy click identifiers and explicit UTMs can identify paid traffic', () => {
  for (const key of ['gclid', 'gbraid', 'wbraid']) {
    assert.equal(registrationSourceLabel({ ...visitor, first_landing_page: `/?${key}=example` }), 'Anuncio Google');
  }
  assert.equal(registrationSourceLabel(visitor, { first_utm_source: 'instagram', first_utm_medium: 'paid_social' }), 'Anuncio Instagram');
});

test('known organic/direct sources stay distinct from unknown sources', () => {
  assert.equal(registrationSourceLabel(visitor), 'Directo');
  assert.equal(registrationSourceLabel({ ...visitor, first_source: 'google' }), 'Google');
  assert.equal(registrationSourceLabel({ ...visitor, first_source: null }), null);
});

test('invitations have priority and channel totals reconcile to registrations', () => {
  const users = [user, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const sources = new Map([['u', 'Anuncio Google'], ['b', 'Directo'], ['c', 'Google']]);
  const summary = buildAttributionSummary(users, [{ invited_user_id: 'u' }], sources);
  assert.equal(summary.referred, 1);
  assert.equal(summary.attributed, 3);
  assert.equal(summary.unattributed, 1);
  assert.equal(summary.attributionRate, 75);
  assert.equal(summary.channels.reduce((sum, row) => sum + row.leads, 0), 4);
  assert.equal(summary.channels.some((row) => row.canal === 'Anuncio Google'), false);
});

test('loader joins by account then visitor, without querying acquisition user_id or writing data', async () => {
  const filters = [];
  const db = { from(table) {
    const rows = table === 'marketing_visitors' ? [visitor] : [{ visitor_id: 'v', first_utm_source: 'google', first_utm_medium: 'cpc' }];
    const query = {
      select() { return query; }, order() { return query; },
      in(field, ids) { filters.push({ table, field, ids }); return query; },
      async range(from, to) { return { data: rows.slice(from, to + 1) }; },
    };
    return query;
  } };
  assert.equal((await loadRegistrationSources(db, [user])).get('u'), 'Anuncio Google');
  assert.equal(filters[0].field, 'user_id');
  assert.equal(filters.find((row) => row.table === 'marketing_acquisition_profiles').field, 'visitor_id');
});
