import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  readAllMarketingRows, readMarketingRowsByIds, buildAttributionSummary,
  visitorElapsedSeconds, summarizeClassifiedVisitors,
} from '../marketingMetrics.js';

function paginated(rows, cap = 500) {
  return () => ({ range: async (from, to) => ({ data: rows.slice(from, Math.min(to + 1, from + cap)) }) });
}

test('includes visitor 501 and all rows beyond the PostgREST default cap', async () => {
  const visitors = Array.from({ length: 1203 }, (_, i) => ({ visitorId: i, kind: 'anon', seenAt: '2026-09-26' }));
  const rows = await readAllMarketingRows(paginated(visitors));
  assert.equal(rows.length, 1203);
  assert.equal(new Set(rows.map((r) => r.visitorId)).size, 1203);
  assert.equal(summarizeClassifiedVisitors(rows).entered, 1203);
});

test('continues when the database returns fewer rows than requested', async () => {
  const rows = Array.from({ length: 622 }, (_, i) => i);
  assert.deepEqual(await readAllMarketingRows(paginated(rows, 100)), rows);
});

test('returns no partial metrics when a later database page fails', async () => {
  let calls = 0;
  const error = new Error('database unavailable');
  await assert.rejects(readAllMarketingRows(() => ({ range: async () => {
    calls += 1;
    return calls === 1 ? { data: [1, 2] } : { error };
  } })), /database unavailable/);
});

test('empty data ends pagination', async () => {
  assert.deepEqual(await readAllMarketingRows(paginated([])), []);
});

test('ID batches preserve all related rows and deduplicate input identifiers', async () => {
  const ids = Array.from({ length: 205 }, (_, i) => `v${i}`);
  const rows = await readMarketingRowsByIds([...ids, ids[0], null], (batch) => {
    assert.ok(batch.length <= 100);
    return paginated(batch.flatMap((id) => [{ id, page: 1 }, { id, page: 2 }]), 30)();
  });
  assert.equal(rows.length, 410);
  assert.equal(new Set(rows.map((r) => `${r.id}:${r.page}`)).size, 410);
});

test('non-referral registrations are unknown, not assumed organic', () => {
  const summary = buildAttributionSummary([{ id: 'a' }, { id: 'b' }, { id: 'c' }], [
    { invited_user_id: 'a' }, { invited_user_id: 'a' }, { invited_user_id: 'outside' },
  ]);
  assert.equal(summary.referred, 1);
  assert.equal(summary.unattributed, 2);
  assert.equal(summary.total, 3);
  assert.equal(summary.referralRate, 33);
  assert.deepEqual(summary.channels, [
    { canal: 'Referido (invitación)', leads: 1 }, { canal: 'Sin atribuir', leads: 2 },
  ]);
});

test('empty attribution has no NaN percentages', () => {
  assert.equal(buildAttributionSummary().referralRate, 0);
});

test('shared IP never turns anonymous visitors into staff', () => {
  const rows = ['staff', 'returning', 'anon', 'account'].map((kind) => ({
    kind, ip: '203.0.113.1', seenAt: '2026-09-26',
  }));
  const summary = summarizeClassifiedVisitors(rows);
  assert.equal(summary.entered, 2);
  assert.equal(summary.registered, 1);
  assert.equal(summary.unregistered, 1);
  assert.equal(summary.staff, 1);
  assert.deepEqual(summary.ipLog.map((r) => r.kind), ['staff', 'anon', 'account']);
});

test('coverage starts with the earliest public visitor, independent of input order', () => {
  const rows = [
    { kind: 'account', seenAt: '2026-10-04T09:00:00Z' },
    { kind: 'staff', seenAt: '2026-09-01T09:00:00Z' },
    { kind: 'anon', seenAt: '2026-09-26T09:00:00Z' },
    { kind: 'anon', seenAt: 'invalid' },
  ];
  assert.equal(summarizeClassifiedVisitors(rows).since, '2026-09-26T09:00:00Z');
  assert.equal(summarizeClassifiedVisitors([]).since, null);
});

test('elapsed calendar time remains separate from engagement and rejects invalid dates', () => {
  assert.equal(visitorElapsedSeconds('2026-09-26T00:00:00Z', '2026-09-28T00:00:00Z'), 172800);
  assert.equal(visitorElapsedSeconds('bad', '2026-09-28'), null);
  assert.equal(visitorElapsedSeconds(null, '2026-09-28'), null);
  assert.equal(visitorElapsedSeconds('2026-09-28', '2026-09-26'), null);
  assert.equal(visitorElapsedSeconds('2026-09-28', '2026-09-28'), 0);
});

// Exercise the actual route with a paginated database double, without live credentials.
async function loadSummaryRoute(authenticate) {
  const { readFile } = await import('node:fs/promises');
  const { createRequire } = await import('node:module');
  const { runInNewContext } = await import('node:vm');
  const require = createRequire(import.meta.url);
  const swc = require('next/dist/build/swc');
  const metrics = await import('../marketingMetrics.js');
  const traffic = await import('../trafficSource.js');
  const journey = await import('../visitorJourney.js');
  const filename = new URL('../../app/api/admin/visitors/summary/route.js', import.meta.url);
  const { code } = await swc.transform(await readFile(filename, 'utf8'), {
    filename: filename.pathname,
    jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const imports = {
    'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } },
    '@/lib/adminAccess': { authenticateAdminRequest: authenticate },
    '@/lib/marketingMetrics': metrics,
    '@/lib/visitorJourney': journey,
    '@/utils/authRoles': { isStudentRole: (role) => ['student', 'alumno'].includes(role) },
    '@/lib/trafficSource': traffic,
  };
  const exports = {};
  runInNewContext(code, { exports, require: (name) => {
    if (!imports[name]) throw new Error(`Unexpected dependency: ${name}`);
    return imports[name];
  }, console: { error() {} } });
  return exports.GET;
}

function fakeDb(tables, failTable) {
  return { from(table) {
    let rows = [...(tables[table] || [])];
    const query = {
      select() { return query; },
      order() { return query; },
      in(column, ids) { rows = rows.filter((r) => ids.includes(r[column])); return query; },
      range(from, to) { return Promise.resolve(table === failTable
        ? { error: new Error('read failed') }
        : { data: rows.slice(from, Math.min(to + 1, from + 100)) }); },
      then(resolve, reject) { return Promise.resolve({ data: rows }).then(resolve, reject); },
    };
    return query;
  } };
}

test('summary route retains all visitors on shared networks and returns honest duration fields', async () => {
  const visitors = Array.from({ length: 622 }, (_, i) => ({
    visitor_id: `v${i}`, user_id: i === 0 ? 'staff' : null,
    created_at: i === 621 ? '2026-09-26T00:00:00Z' : '2026-10-04T00:00:00Z',
    last_seen_at: '2026-10-04T00:00:00Z', last_ip: '203.0.113.1',
  }));
  const db = fakeDb({
    marketing_visitors: visitors,
    Usuarios_y_Perfil_users: [{ id: 'staff', rol_id: 'admin', email: 'staff@example.test', creado_en: '2026-01-01' }],
    Usuarios_y_Perfil_roles: [{ id: 'admin', nombre: 'admin' }],
  });
  const GET = await loadSummaryRoute(async () => ({ db }));
  const result = await GET({});
  assert.equal(result.status, 200);
  assert.equal(result.body.entered, 621);
  assert.equal(result.body.staff, 1);
  assert.equal(result.body.ipLog.length, 622);
  assert.equal(result.body.since, '2026-09-26T00:00:00Z');
  assert.equal(result.body.ipLog[621].seconds, null);
  assert.equal(result.body.ipLog[621].elapsedSeconds, 8 * 86400);
});

test('summary route preserves access control and does not query on auth failure', async () => {
  const GET = await loadSummaryRoute(async () => ({ error: 'No autorizado', status: 403 }));
  const result = await GET({});
  assert.equal(result.status, 403);
});

test('summary route reports database failure instead of a plausible partial total', async () => {
  const GET = await loadSummaryRoute(async () => ({ db: fakeDb({}, 'marketing_visitors') }));
  const result = await GET({});
  assert.equal(result.status, 500);
  assert.equal(result.body.entered, undefined);
});
