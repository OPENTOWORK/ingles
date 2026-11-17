import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  readAllMarketingRows, readMarketingRowsByIds, buildAttributionSummary,
  visitorElapsedSeconds, summarizeClassifiedVisitors, parseStoredUtc, signedUpDuringVisit,
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

test('a naive UTC signup time still counts on the registration day, once per person', () => {
  assert.equal(parseStoredUtc('2026-11-15 02:25:24.067854'), '2026-11-15T02:25:24.067Z');
  assert.equal(
    signedUpDuringVisit('2026-11-15 02:25:24.067854', '2026-11-15T02:24:45.487Z'),
    true,
  );
  assert.equal(
    signedUpDuringVisit('2026-11-15 07:03:10.338377', '2026-11-15T06:59:23.155Z'),
    true,
  );
  assert.equal(
    signedUpDuringVisit('2026-01-01 00:00:00', '2026-11-15T06:46:42.870Z'),
    false,
  );
});

test('summary route counts each new account once, on the day the account was created', async () => {
  const db = fakeDb({
    marketing_visitors: [
      { visitor_id: 'a1', user_id: 'u1', created_at: '2026-11-15T02:24:45.487Z', last_seen_at: '2026-11-15T02:24:45.179Z' },
      { visitor_id: 'a2', user_id: 'u1', created_at: '2026-11-15T02:26:20.686Z', last_seen_at: '2026-11-15T02:42:43.445Z' },
      { visitor_id: 'b1', user_id: 'u2', created_at: '2026-11-15T06:46:42.870Z', last_seen_at: '2026-11-15T09:36:00.726Z' },
      { visitor_id: 'c1', user_id: 'u3', created_at: '2026-11-15T06:59:23.155Z', last_seen_at: '2026-11-15T07:03:25.777Z' },
      { visitor_id: 'c2', user_id: 'u3', created_at: '2026-11-15T07:04:00.242Z', last_seen_at: '2026-11-15T07:17:30.216Z' },
      { visitor_id: 'd1', user_id: 'u4', created_at: '2026-11-10T08:10:35.828Z', last_seen_at: '2026-11-15T10:12:32.445Z' },
      { visitor_id: 'anon', user_id: null, created_at: '2026-11-15T11:00:00.000Z', last_seen_at: '2026-11-15T11:05:00.000Z' },
    ],
    Usuarios_y_Perfil_users: [
      { id: 'u1', rol_id: 'alumno', email: 'a@example.test', creado_en: '2026-11-15 02:25:24.067854' },
      { id: 'u2', rol_id: 'alumno', email: 'b@example.test', creado_en: '2026-11-15 06:46:48.315054' },
      { id: 'u3', rol_id: 'alumno', email: 'c@example.test', creado_en: '2026-11-15 07:03:10.338377' },
      { id: 'u4', rol_id: 'alumno', email: 'd@example.test', creado_en: '2026-11-15 09:45:50.496683' },
    ],
    Usuarios_y_Perfil_roles: [{ id: 'alumno', nombre: 'alumno' }],
  });
  const GET = await loadSummaryRoute(async () => ({ db }));
  const result = await GET({});
  assert.equal(result.status, 200);
  assert.equal(result.body.registered, 4);
  assert.equal(result.body.unregistered, 1);
  assert.equal(result.body.entered, 5);
  const signupDays = result.body.ipLog
    .filter((row) => row.kind === 'account')
    .map((row) => row.seenAt.slice(0, 10));
  assert.deepEqual(signupDays, ['2026-11-15', '2026-11-15', '2026-11-15', '2026-11-15']);
});
