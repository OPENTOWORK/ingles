import test from 'node:test';
import assert from 'node:assert/strict';
import {
  monthlyPlanRevenueEur,
  monthBoundsIso,
  monthsSpanning,
  signupVisitIds,
  summarizeMarketingOperations,
  visitMonthKey,
} from '../marketingOperations.js';

test('monthly revenue uses the public plan price', () => {
  assert.equal(monthlyPlanRevenueEur('premium', 'month'), 3.99);
  assert.equal(monthlyPlanRevenueEur('pro', 'year'), 4.99);
  assert.equal(monthlyPlanRevenueEur('friendly_plus', 'month'), 0);
});

test('operations summarise visits, funnel and paying subscriptions', () => {
  const report = summarizeMarketingOperations({
    visits: [
      {
        id: 'a',
        userId: 'user-1',
        createdAt: '2026-10-01T10:00:00Z',
        source: 'google',
        landing: '/preparar-b2',
        signedUp: true,
        stops: [{ title: 'Landing B2', path: '/preparar-b2' }, { title: 'Registro', path: '/register' }],
      },
      {
        id: 'b',
        userId: null,
        createdAt: '2026-10-02T10:00:00Z',
        source: 'direct',
        landing: '/',
        stops: [{ title: 'Inicio' }],
      },
      {
        id: 'c',
        userId: 'user-2',
        createdAt: '2026-10-03T10:00:00Z',
        source: 'google',
        landing: '/',
        signedUp: true,
        stops: [{ title: 'Inicio' }, { title: 'Precios' }],
      },
    ],
    subscriptions: [
      { userId: 'user-1', planId: 'premium', status: 'active', interval: 'month', grantsAccess: true },
      { userId: 'user-3', planId: 'friendly_plus', status: 'active', interval: 'month', grantsAccess: true },
      { userId: 'user-4', planId: 'pro', status: 'canceled', interval: 'month', grantsAccess: false },
    ],
  });

  assert.equal(report.dashboard.visits, 3);
  assert.equal(report.dashboard.accounts, 2);
  assert.equal(report.dashboard.payingVisits, 1);
  assert.equal(report.dashboard.payingCustomers, 1);
  assert.equal(report.dashboard.monthlyRevenueEur, 3.99);
  assert.equal(report.roi.friendlyCustomers, 1);
  assert.equal(report.roi.adSpendEur, null);
  assert.equal(report.acquisition[0].source, 'Google');
  assert.equal(report.acquisition[0].visits, 2);
  assert.equal(report.funnel[0].count, 3);
  assert.equal(report.funnel[3].count, 1);
  assert.equal(report.journeys[0].id, 'c');
  assert.equal(report.journeys[0].paying, false);
  assert.equal(report.acquisition.find((row) => row.source === 'Google').accounts, 2);
  assert.equal(report.acquisition.find((row) => row.source === 'Directo').accounts, 0);
});

test('a registration counts once, on the channel of that visit', () => {
  const report = summarizeMarketingOperations({
    visits: [
      {
        id: 'ad',
        userId: null,
        createdAt: '2026-10-01T10:00:00Z',
        source: 'meta_ads',
        landing: '/?utm_content=remarketing_imagen',
        stops: [{ title: 'Home' }, { title: 'Inicio' }],
      },
      {
        id: 'signup',
        userId: 'user-9',
        signedUp: true,
        createdAt: '2026-10-02T10:00:00Z',
        source: 'direct',
        landing: '/',
        stops: [{ title: 'Home' }, { title: 'Registro', path: '/register' }],
      },
      {
        id: 'return',
        userId: 'user-9',
        createdAt: '2026-10-20T10:00:00Z',
        source: 'meta_ads',
        landing: '/?utm_content=remarketing_imagen',
        stops: [{ title: 'Inicio' }, { title: 'Perfil' }],
      },
      {
        id: 'form-only',
        userId: null,
        createdAt: '2026-09-02T10:00:00Z',
        source: 'google_ads',
        landing: '/',
        stops: [{ title: 'Home' }, { title: 'Registro', path: '/register' }],
      },
    ],
    subscriptions: [
      { userId: 'user-9', planId: 'premium', status: 'active', interval: 'month', grantsAccess: true },
    ],
  });

  const direct = report.acquisition.find((row) => row.source === 'Directo');
  const remarketing = report.acquisition.find((row) => row.source === 'Anuncio Meta · remarketing imagen');
  const google = report.acquisition.find((row) => row.source === 'Anuncio Google');
  assert.equal(direct.accounts, 1);
  assert.equal(direct.paying, 1);
  assert.equal(remarketing.accounts, 0);
  assert.equal(google.accounts, 0);
  assert.equal(report.dashboard.accounts, 1);
  assert.equal(report.journeys.length, 4);
  assert.equal(report.journeys.find((row) => row.id === 'signup').account, true);
  assert.equal(report.journeys.find((row) => row.id === 'return').account, false);
});

test('signup visit is the one where the account was created', () => {
  const createdAt = new Map([['user-9', '2026-10-02T10:05:00Z']]);
  const visits = [
    { id: 'old', userId: 'user-9', createdAt: '2026-09-01T10:00:00Z' },
    { id: 'signup', userId: 'user-9', createdAt: '2026-10-02T10:00:00Z' },
    { id: 'later', userId: 'user-9', createdAt: '2026-10-20T10:00:00Z' },
  ];
  assert.deepEqual([...signupVisitIds(visits, createdAt)], ['signup']);
  assert.equal(visitMonthKey('2026-11-02T14:13:00Z'), '2026-11');
});

test('journey names the ad from the landing UTM', () => {
  const report = summarizeMarketingOperations({
    visits: [
      {
        id: 'ad-1',
        createdAt: '2026-10-27T12:40:00Z',
        source: 'meta_ads',
        landing:
          '/?utm_source=instagram&utm_campaign=lanzamiento_dralo_2026&utm_content=video_remarketing',
        stops: [{ title: 'Home' }, { title: 'Inicio' }],
      },
      {
        id: 'ad-2',
        createdAt: '2026-10-27T11:03:00Z',
        source: 'direct',
        landing: '/',
        stops: [{ title: 'Home' }],
      },
    ],
  });

  assert.equal(monthBoundsIso('2026-11').start, '2026-10-31T23:00:00.000Z');
  assert.equal(monthBoundsIso('2026-11').end, '2026-11-30T23:00:00.000Z');
  assert.equal(visitMonthKey('2026-11-05T09:51:26.985Z'), '2026-11');
  assert.deepEqual(monthsSpanning('2026-09-26T06:03:40.600Z', '2026-11-05T09:51:26.985Z'), [
    '2026-11',
    '2026-10',
    '2026-09',
  ]);

  assert.equal(report.journeys[0].source, 'Anuncio Meta · video remarketing');
  assert.equal(report.journeys[1].source, 'Directo');
  assert.equal(report.acquisition.some((row) => row.source === 'Anuncio Meta · video remarketing'), true);
});
