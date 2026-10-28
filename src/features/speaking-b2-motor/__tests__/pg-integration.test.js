import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, it } from 'node:test';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const schemaSql = readFileSync(path.join(root, 'scripts/speaking_b2_itest_schema.sql'), 'utf8');
const securitySql = readFileSync(path.join(root, 'scripts/speaking_b2_itest_security.sql'), 'utf8');
const v22Sql = readFileSync(path.join(root, 'scripts/speaking_b2_motor_v22.sql'), 'utf8')
  .replace(/^begin;/im, '')
  .replace(/^commit;/im, '')
  .replace(/revoke all[\s\S]*?to service_role;/gi, '');
const v23Sql = readFileSync(path.join(root, 'scripts/speaking_b2_motor_v23.sql'), 'utf8')
  .replace(/^begin;/im, '')
  .replace(/^commit;/im, '')
  .replace(/grant execute[\s\S]*?to service_role;/gi, '');

function isolatedUrl() {
  const fromEnv = process.env.SPEAKING_B2_ITEST_DATABASE_URL?.trim();
  if (fromEnv) {
    const host = new URL(fromEnv.replace(/^postgresql:/, 'http:')).hostname;
    if (!['127.0.0.1', 'localhost'].includes(host)) {
      throw new Error('SPEAKING_B2_ITEST_DATABASE_URL must point at localhost');
    }
    return fromEnv;
  }
  return 'postgresql://postgres:postgres@127.0.0.1:5432/speaking_b2_itest';
}

function adminUrl() {
  const url = new URL(isolatedUrl().replace(/^postgresql:/, 'http:'));
  url.pathname = '/postgres';
  return url.toString().replace(/^http:/, 'postgresql:');
}

describe('speaking B2 PostgreSQL integration (isolated local DB)', () => {
  let pool = null;
  let enabled = false;

  before(async () => {
    const admin = new pg.Client({
      connectionString: adminUrl(),
      connectionTimeoutMillis: 2500,
    });
    try {
      await admin.connect();
      await admin.query('create database speaking_b2_itest');
    } catch (error) {
      if (!/already exists/i.test(error.message) && error.code !== '42P04') {
        if (error.code === 'ECONNREFUSED' || /password|auth|timeout/i.test(error.message)) {
          enabled = false;
          try {
            await admin.end();
          } catch {
            /* ignore */
          }
          return;
        }
      }
    } finally {
      try {
        await admin.end();
      } catch {
        /* ignore */
      }
    }

    pool = new pg.Pool({ connectionString: isolatedUrl(), max: 8 });
    try {
      await pool.query(schemaSql);
      await pool.query(securitySql);
      await pool.query(v22Sql);
      await pool.query(v22Sql);
      await pool.query(v23Sql);
      enabled = true;
    } catch (error) {
      enabled = false;
      await pool.end().catch(() => {});
      pool = null;
      throw error;
    }
  });

  after(async () => {
    if (pool) await pool.end();
  });

  async function newSession({
    state = 'FINISHING',
    pending = true,
    charged = false,
    userId = randomUUID(),
  } = {}) {
    const id = randomUUID();
    const tokenHash = createHash('sha256').update(id).digest('hex');
    await pool.query(
      `insert into speaking_b2_sessions (
        id, user_id, exam_code, state, started_at, expires_at, access_token_hash,
        pending_report, evaluation_charged, row_version
      ) values ($1,$2,'SP-EX001',$3, now(), now() + interval '1 day', $4, $5, $6, 1)`,
      [
        id,
        userId,
        state,
        tokenHash,
        pending ? JSON.stringify({ scores: { grammarVocabulary: 3 } }) : null,
        charged,
      ],
    );
    return { id, userId };
  }

  it('creates a session, stores turns, and another connection reads them after a restart', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession({ state: 'LISTENING', pending: false });
    await pool.query(
      `insert into speaking_b2_turns (session_id, turn_index, role, question_id, transcript, transcript_source)
       values ($1,0,'examiner','SP-EX001-P1-Q01','How do you usually spend your weekends?','SCRIPT'),
              ($1,1,'candidate','SP-EX001-P1-Q01','I walk with my family.','STT')`,
      [id],
    );
    const other = new pg.Client({ connectionString: isolatedUrl() });
    await other.connect();
    const session = await other.query('select state, user_id from speaking_b2_sessions where id=$1', [id]);
    const turns = await other.query(
      'select turn_index, transcript from speaking_b2_turns where session_id=$1 order by turn_index',
      [id],
    );
    await other.end();
    assert.equal(session.rows[0].user_id, userId);
    assert.equal(turns.rows.length, 2);
    assert.equal(turns.rows[1].transcript, 'I walk with my family.');
  });

  it('rejects a stale row_version update', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id } = await newSession({ state: 'ASKING', pending: false });
    const first = await pool.query(
      `update speaking_b2_sessions set state='LISTENING', row_version=2
       where id=$1 and row_version=1 returning id`,
      [id],
    );
    const stale = await pool.query(
      `update speaking_b2_sessions set state='FINISHING', row_version=2
       where id=$1 and row_version=1 returning id`,
      [id],
    );
    assert.equal(first.rowCount, 1);
    assert.equal(stale.rowCount, 0);
  });

  it('does not consume quota when there is no report', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession({ pending: false });
    const result = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5) as payload`,
      [id, userId],
    );
    assert.equal(result.rows[0].payload.ok, false);
    assert.equal(result.rows[0].payload.code, 'NO_REPORT');
    const used = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    assert.equal(used.rows[0].used, 0);
  });

  it('consumes at most one speaking_correction for two concurrent clients', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const clients = await Promise.all(
      [0, 1].map(async () => {
        const client = new pg.Client({ connectionString: isolatedUrl() });
        await client.connect();
        return client;
      }),
    );
    const payloads = await Promise.all(
      clients.map((client) =>
        client.query(
          `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5) as payload`,
          [id, userId],
        ),
      ),
    );
    await Promise.all(clients.map((client) => client.end()));
    const oks = payloads.map((item) => item.rows[0].payload);
    assert.equal(oks.filter((item) => item.ok && !item.already).length, 1);
    assert.equal(oks.filter((item) => item.already).length, 1);
    const used = await pool.query(
      `select count from plan_usage_counters
       where user_id=$1 and usage_key='speaking_correction' and period_key='2026-10'`,
      [userId],
    );
    assert.equal(used.rows[0].count, 1);
    const charge = await pool.query('select status from speaking_b2_quota_charges where session_id=$1', [id]);
    assert.equal(charge.rows[0].status, 'consumed');
  });

  it('lets only one of five concurrent consumes increment the counter', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        pool.query(
          `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',8) as payload`,
          [id, userId],
        ),
      ),
    );
    const payloads = results.map((item) => item.rows[0].payload);
    assert.equal(payloads.filter((item) => item.ok && item.consumed).length, 1);
    assert.equal(payloads.filter((item) => item.already).length, 4);
    const used = await pool.query(
      `select count from plan_usage_counters
       where user_id=$1 and usage_key='speaking_correction' and period_key='2026-10'`,
      [userId],
    );
    assert.equal(used.rows[0].count, 1);
  });

  function readPayload(row) {
    const payload = row.payload;
    return typeof payload === 'string' ? JSON.parse(payload) : payload;
  }

  it('recovers after a crash following the evaluation lock without charging twice', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    await pool.query('select speaking_b2_claim_evaluation($1)', [id]);
    const locked = await pool.query(
      'select evaluation_in_flight from speaking_b2_sessions where id=$1',
      [id],
    );
    assert.equal(locked.rows[0].evaluation_in_flight, true);
    const first = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5) as payload`,
      [id, userId],
    );
    const retry = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5) as payload`,
      [id, userId],
    );
    assert.equal(readPayload(first.rows[0]).consumed, true);
    assert.equal(readPayload(retry.rows[0]).already, true);
    const used = await pool.query(
      `select count from plan_usage_counters
       where user_id=$1 and usage_key='speaking_correction' and period_key='2026-10'`,
      [userId],
    );
    assert.equal(used.rows[0].count, 1);
  });

  it('does not increment after a consume transaction when the report persist is retried', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5) as payload`,
      [id, userId],
    );
    await pool.query(
      `update speaking_b2_sessions
       set report = pending_report, pending_report = null, state='COMPLETED'
       where id=$1`,
      [id],
    );
    const retry = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5) as payload`,
      [id, userId],
    );
    assert.equal(retry.rows[0].payload.already, true);
    const used = await pool.query(
      `select count from plan_usage_counters
       where user_id=$1 and usage_key='speaking_correction' and period_key='2026-10'`,
      [userId],
    );
    assert.equal(used.rows[0].count, 1);
  });

  it('lets only one process claim the evaluation lock', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id } = await newSession();
    const clients = await Promise.all(
      [0, 1].map(async () => {
        const client = new pg.Client({ connectionString: isolatedUrl() });
        await client.connect();
        return client;
      }),
    );
    await Promise.all(
      clients.map((client) => client.query('select speaking_b2_claim_evaluation($1)', [id])),
    );
    await Promise.all(clients.map((client) => client.end()));
    const lock = await pool.query(
      'select evaluation_in_flight, row_version from speaking_b2_sessions where id=$1',
      [id],
    );
    assert.equal(lock.rows[0].evaluation_in_flight, true);
    assert.equal(lock.rows[0].row_version, 2);
  });

  it('returns PLAN_FEATURE_LOCKED when the speaking limit is zero', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const result = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',0,null,null,null) as payload`,
      [id, userId],
    );
    assert.equal(result.rows[0].payload.ok, false);
    assert.equal(result.rows[0].payload.code, 'PLAN_FEATURE_LOCKED');
    const used = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    assert.equal(used.rows[0].used, 0);
  });

  it('rejects a consume from another user and from a missing identity', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const other = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,null,null,null) as payload`,
      [id, randomUUID()],
    );
    assert.equal(other.rows[0].payload.code, 'FORBIDDEN');
    const missing = await pool.query(
      `select speaking_b2_consume_session_quota($1,null,'speaking_correction','month','2026-10',5,null,null,null) as payload`,
      [id],
    );
    assert.equal(missing.rows[0].payload.code, 'AUTH_REQUIRED');
    const used = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    assert.equal(used.rows[0].used, 0);
  });

  it('consumes the staff daily exam_speaking_feedback cap once across concurrent clients', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const clients = await Promise.all(
      [0, 1].map(async () => {
        const client = new pg.Client({ connectionString: isolatedUrl() });
        await client.connect();
        return client;
      }),
    );
    const payloads = await Promise.all(
      clients.map((client) =>
        client.query(
          `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',null,'exam_speaking_feedback','2026-10-27',3) as payload`,
          [id, userId],
        ),
      ),
    );
    await Promise.all(clients.map((client) => client.end()));
    const oks = payloads.map((item) => item.rows[0].payload);
    assert.equal(oks.filter((item) => item.ok && item.consumed).length, 1);
    const daily = await pool.query(
      `select count from ai_usage_daily_limits
       where user_id=$1 and action='exam_speaking_feedback' and usage_date='2026-10-27'`,
      [userId],
    );
    assert.equal(daily.rows[0].count, 1);
    const plan = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    assert.equal(plan.rows[0].used, 0);
  });

  it('refuses a fourth staff daily consume after the existing 3/day cap', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    await pool.query(
      `insert into ai_usage_daily_limits (user_id, action, usage_date, count)
       values ($1,'exam_speaking_feedback','2026-10-27',3)`,
      [userId],
    );
    const result = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',null,'exam_speaking_feedback','2026-10-27',3) as payload`,
      [id, userId],
    );
    assert.equal(result.rows[0].payload.ok, false);
    assert.equal(result.rows[0].payload.code, 'DAILY_LIMIT_REACHED');
    assert.equal(result.rows[0].payload.used, 3);
    const charged = await pool.query(
      'select evaluation_charged from speaking_b2_sessions where id=$1',
      [id],
    );
    assert.equal(charged.rows[0].evaluation_charged, false);
  });

  it('marks an exempt consume without moving plan or daily counters', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const result = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',null,null,null,null) as payload`,
      [id, userId],
    );
    assert.equal(result.rows[0].payload.ok, true);
    assert.equal(result.rows[0].payload.consumed, false);
    const plan = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    const daily = await pool.query(
      `select coalesce(sum(count),0)::int as used from ai_usage_daily_limits where user_id=$1`,
      [userId],
    );
    assert.equal(plan.rows[0].used, 0);
    assert.equal(daily.rows[0].used, 0);
  });

  it('does not increment the plan counter when the daily cap is already full', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    await pool.query(
      `insert into ai_usage_daily_limits (user_id, action, usage_date, count)
       values ($1,'exam_speaking_feedback','2026-10-27',3)`,
      [userId],
    );
    const result = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,'exam_speaking_feedback','2026-10-27',3) as payload`,
      [id, userId],
    );
    assert.equal(result.rows[0].payload.ok, false);
    assert.equal(result.rows[0].payload.code, 'DAILY_LIMIT_REACHED');
    const plan = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    const daily = await pool.query(
      `select count from ai_usage_daily_limits
       where user_id=$1 and action='exam_speaking_feedback' and usage_date='2026-10-27'`,
      [userId],
    );
    const charge = await pool.query(
      'select status from speaking_b2_quota_charges where session_id=$1',
      [id],
    );
    const session = await pool.query(
      'select evaluation_charged from speaking_b2_sessions where id=$1',
      [id],
    );
    assert.equal(plan.rows[0].used, 0);
    assert.equal(daily.rows[0].count, 3);
    assert.equal(charge.rows[0].status, 'failed');
    assert.equal(session.rows[0].evaluation_charged, false);
  });

  it('does not increment the plan counter when the daily action is missing', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const result = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,'','2026-10-27',3) as payload`,
      [id, userId],
    );
    assert.equal(result.rows[0].payload.code, 'LIMIT_CHECK_FAILED');
    const plan = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    const charge = await pool.query(
      'select status from speaking_b2_quota_charges where session_id=$1',
      [id],
    );
    assert.equal(plan.rows[0].used, 0);
    assert.equal(charge.rows[0].status, 'failed');
  });

  it('retries a consume after a failed ledger row without double increment', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const locked = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',0,null,null,null) as payload`,
      [id, userId],
    );
    assert.equal(locked.rows[0].payload.code, 'PLAN_FEATURE_LOCKED');
    const retry = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,null,null,null) as payload`,
      [id, userId],
    );
    assert.equal(retry.rows[0].payload.ok, true);
    assert.equal(retry.rows[0].payload.consumed, true);
    const used = await pool.query(
      `select count from plan_usage_counters
       where user_id=$1 and usage_key='speaking_correction' and period_key='2026-10'`,
      [userId],
    );
    const charge = await pool.query(
      'select status from speaking_b2_quota_charges where session_id=$1',
      [id],
    );
    assert.equal(used.rows[0].count, 1);
    assert.equal(charge.rows[0].status, 'consumed');
  });

  it('rolls back counter writes when the outer transaction is aborted', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const client = new pg.Client({ connectionString: isolatedUrl() });
    await client.connect();
    try {
      await client.query('begin');
      const result = await client.query(
        `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,null,null,null) as payload`,
        [id, userId],
      );
      assert.equal(result.rows[0].payload.ok, true);
      await client.query('rollback');
    } finally {
      await client.end();
    }
    const used = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    const charge = await pool.query(
      'select status from speaking_b2_quota_charges where session_id=$1',
      [id],
    );
    const session = await pool.query(
      'select evaluation_charged from speaking_b2_sessions where id=$1',
      [id],
    );
    assert.equal(used.rows[0].used, 0);
    assert.equal(charge.rowCount, 0);
    assert.equal(session.rows[0].evaluation_charged, false);
  });

  it('increments plan and daily together only when both have room', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const result = await pool.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,'exam_speaking_feedback','2026-10-27',3) as payload`,
      [id, userId],
    );
    assert.equal(result.rows[0].payload.ok, true);
    assert.equal(result.rows[0].payload.consumed, true);
    const plan = await pool.query(
      `select count from plan_usage_counters
       where user_id=$1 and usage_key='speaking_correction' and period_key='2026-10'`,
      [userId],
    );
    const daily = await pool.query(
      `select count from ai_usage_daily_limits
       where user_id=$1 and action='exam_speaking_feedback' and usage_date='2026-10-27'`,
      [userId],
    );
    assert.equal(plan.rows[0].count, 1);
    assert.equal(daily.rows[0].count, 1);
  });

  it('lets only one of two concurrent dual-limit consumes increment both counters', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const userId = randomUUID();
    const left = await newSession({ userId });
    const right = await newSession({ userId });
    const clients = await Promise.all(
      [0, 1].map(async () => {
        const client = new pg.Client({ connectionString: isolatedUrl() });
        await client.connect();
        return client;
      }),
    );
    const payloads = await Promise.all(
      [left.id, right.id].map((sessionId, index) =>
        clients[index].query(
          `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,'exam_speaking_feedback','2026-10-27',1) as payload`,
          [sessionId, userId],
        ),
      ),
    );
    await Promise.all(clients.map((client) => client.end()));
    const oks = payloads.map((item) => item.rows[0].payload);
    assert.equal(oks.filter((item) => item.ok && item.consumed).length, 1);
    assert.equal(oks.filter((item) => item.code === 'DAILY_LIMIT_REACHED').length, 1);
    const plan = await pool.query(
      `select count from plan_usage_counters
       where user_id=$1 and usage_key='speaking_correction' and period_key='2026-10'`,
      [userId],
    );
    const daily = await pool.query(
      `select count from ai_usage_daily_limits
       where user_id=$1 and action='exam_speaking_feedback' and usage_date='2026-10-27'`,
      [userId],
    );
    assert.equal(plan.rows[0].count, 1);
    assert.equal(daily.rows[0].count, 1);
  });

  it('does not add a second unique index on ai_usage_daily_limits', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const extra = await pool.query(
      `select indexname from pg_indexes
       where tablename = 'ai_usage_daily_limits'
         and indexname = 'ai_usage_daily_limits_user_action_date_uidx'`,
    );
    assert.equal(extra.rowCount, 0);
    assert.equal(v22Sql.includes('ai_usage_daily_limits_user_action_date_uidx'), false);
  });

  it('applies the isolated schema a second time without error', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    await pool.query(schemaSql);
    await pool.query(v22Sql);
    const fn = await pool.query(
      `select proname, pronargs from pg_proc where proname = 'speaking_b2_consume_session_quota'`,
    );
    assert.ok(fn.rows.some((row) => Number(row.pronargs) === 9));
    assert.match(v22Sql, /p_daily_action/);
    assert.match(v22Sql, /PLAN_FEATURE_LOCKED/);
    assert.match(v22Sql, /exam_speaking_feedback/);
  });
});
