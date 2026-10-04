import test from 'node:test';
import assert from 'node:assert/strict';
import { monthlyPlanRevenueEur, summarizeMarketingOperations } from '../marketingOperations.js';

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
        stops: [{ title: 'Landing B2' }, { title: 'Registro' }],
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
});
