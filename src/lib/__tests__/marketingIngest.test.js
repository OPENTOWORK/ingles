import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateVisitorId } from '@/lib/marketing/crm/constants.js';
import { ingestMarketingEvent } from '@/lib/marketing/crm/eventsServer.js';
import { buildIdempotencyKey } from '@/lib/marketing/crm/validation.js';

const SAMPLE_USER_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

function createMarketingIngestMockDb() {
  const visitors = new Map();
  const profiles = new Map();
  const events = [];
  const touchpoints = [];

  function matchFilters(row, filters) {
    return filters.every(([op, col, val]) => {
      if (op === 'eq') return row[col] === val;
      return true;
    });
  }

  function makeQuery(table) {
    const ctx = { table, filters: [], orderCol: null, asc: true, limitN: null };

    const api = {
      select() {
        return api;
      },
      eq(col, val) {
        ctx.filters.push(['eq', col, val]);
        return api;
      },
      or() {
        return api;
      },
      order(col, opts = {}) {
        ctx.orderCol = col;
        ctx.asc = opts.ascending !== false;
        return api;
      },
      limit(n) {
        ctx.limitN = n;
        return api;
      },
      async maybeSingle() {
        if (table === 'marketing_events') {
          const idemFilter = ctx.filters.find((f) => f[1] === 'idempotency_key');
          if (idemFilter) {
            const found = events.find((e) => e.idempotency_key === idemFilter[2]);
            return {
              data: found
                ? { event_public_id: found.event_public_id, visitor_id: found.visitor_id }
                : null,
            };
          }
          const rows = events.filter((e) => matchFilters(e, ctx.filters));
          if (ctx.orderCol) {
            rows.sort((a, b) => {
              const av = a[ctx.orderCol];
              const bv = b[ctx.orderCol];
              return ctx.asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
            });
          }
          const row = rows[0] || null;
          if (!row) return { data: null };
          if (ctx.filters.some((f) => f[1] === 'event_public_id')) {
            return { data: { event_public_id: row.event_public_id } };
          }
          return { data: { event_timestamp: row.event_timestamp, page_url: row.page_url } };
        }

        if (table === 'marketing_visitors') {
          const vid = ctx.filters.find((f) => f[1] === 'visitor_id')?.[2];
          const row = vid ? visitors.get(vid) : null;
          return { data: row || null };
        }

        if (table === 'marketing_acquisition_profiles') {
          const vid = ctx.filters.find((f) => f[1] === 'visitor_id')?.[2];
          const row = vid ? profiles.get(vid) : null;
          return { data: row || null };
        }

        return { data: null };
      },
      async insert(row) {
        if (table === 'marketing_visitors') {
          visitors.set(row.visitor_id, { ...row });
        } else if (table === 'marketing_acquisition_profiles') {
          profiles.set(row.visitor_id, { ...row });
        } else if (table === 'marketing_events') {
          events.push({ ...row });
        } else if (table === 'marketing_touchpoints') {
          touchpoints.push({ ...row });
        }
        return { error: null };
      },
      update(patch) {
        return {
          eq: async (col, val) => {
            if (table === 'marketing_visitors' && col === 'visitor_id') {
              const existing = visitors.get(val);
              if (existing) visitors.set(val, { ...existing, ...patch });
            }
            if (table === 'marketing_acquisition_profiles' && col === 'visitor_id') {
              const existing = profiles.get(val) || { visitor_id: val };
              profiles.set(val, { ...existing, ...patch });
            }
            return { error: null };
          },
        };
      },
    };

    return api;
  }

  return {
    db: { from: makeQuery },
    getEvents: () => events,
    getTouchpoints: () => touchpoints,
  };
}

describe('ingestMarketingEvent idempotency', () => {
  it('returns duplicate=true for same generate_lead idempotency_key', async () => {
    const visitorId = generateVisitorId();
    const { db, getEvents } = createMarketingIngestMockDb();
    const base = {
      visitor_id: visitorId,
      session_id: 'sess_lead_1',
      event_name: 'generate_lead',
      event_timestamp: '2026-09-23T14:20:00Z',
      source: 'google',
      medium: 'cpc',
      contact_id: SAMPLE_USER_ID,
      idempotency_key: 'lead-dedup-test-key',
    };

    const first = await ingestMarketingEvent(base, { db });
    assert.equal(first.duplicate, false);
    assert.equal(getEvents().length, 1);

    const second = await ingestMarketingEvent(base, { db });
    assert.equal(second.duplicate, true);
    assert.equal(getEvents().length, 1);
    assert.equal(second.event_id, first.event_id);
  });

  it('creates two generate_lead events with different idempotency keys', async () => {
    const visitorId = generateVisitorId();
    const { db, getEvents } = createMarketingIngestMockDb();

    const first = await ingestMarketingEvent(
      {
        visitor_id: visitorId,
        session_id: 'sess_a',
        event_name: 'generate_lead',
        event_timestamp: '2026-09-23T14:20:00Z',
        source: 'google',
        medium: 'cpc',
        contact_id: SAMPLE_USER_ID,
      },
      { db },
    );

    const second = await ingestMarketingEvent(
      {
        visitor_id: visitorId,
        session_id: 'sess_b',
        event_name: 'generate_lead',
        event_timestamp: '2026-09-24T09:00:00Z',
        source: 'google',
        medium: 'organic',
        contact_id: SAMPLE_USER_ID,
      },
      { db },
    );

    assert.equal(first.duplicate, false);
    assert.equal(second.duplicate, false);
    assert.equal(getEvents().length, 2);
    assert.notEqual(
      buildIdempotencyKey({
        visitor_id: visitorId,
        session_id: 'sess_a',
        event_name: 'generate_lead',
        event_timestamp: '2026-09-23T14:20:00Z',
        page_url: '',
      }),
      buildIdempotencyKey({
        visitor_id: visitorId,
        session_id: 'sess_b',
        event_name: 'generate_lead',
        event_timestamp: '2026-09-24T09:00:00Z',
        page_url: '',
      }),
    );
  });
});
