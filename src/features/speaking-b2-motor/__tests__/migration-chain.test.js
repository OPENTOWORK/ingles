import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, it } from 'node:test';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const bootstrapSql = readFileSync(path.join(root, 'scripts/speaking_b2_itest_chain_bootstrap.sql'), 'utf8');
const migrations = [
  'scripts/speaking_b2_motor.sql',
  'scripts/speaking_b2_motor_v2.sql',
  'scripts/speaking_b2_motor_v21.sql',
  'scripts/speaking_b2_motor_v22.sql',
  'scripts/speaking_b2_motor_v23.sql',
].map((rel) => ({ rel, sql: readFileSync(path.join(root, rel), 'utf8') }));

function isolatedUrl() {
  const fromEnv = process.env.SPEAKING_B2_ITEST_DATABASE_URL?.trim();
  if (fromEnv) {
    const url = new URL(fromEnv.replace(/^postgresql:/, 'http:'));
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
      throw new Error('SPEAKING_B2_ITEST_DATABASE_URL must point at localhost');
    }
    url.pathname = '/speaking_b2_itest_chain';
    return url.toString().replace(/^http:/, 'postgresql:');
  }
  return 'postgresql://postgres:postgres@127.0.0.1:5432/speaking_b2_itest_chain';
}

function adminUrl() {
  const url = new URL(isolatedUrl().replace(/^postgresql:/, 'http:'));
  url.pathname = '/postgres';
  return url.toString().replace(/^http:/, 'postgresql:');
}

describe('speaking B2 clean migration chain V1→V2.3', () => {
  let pool = null;
  let enabled = false;

  before(async () => {
    const admin = new pg.Client({ connectionString: adminUrl(), connectionTimeoutMillis: 2500 });
    try {
      await admin.connect();
      await admin.query('drop database if exists speaking_b2_itest_chain with (force)');
      await admin.query('create database speaking_b2_itest_chain');
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || /password authentication|timeout/i.test(error.message)) {
        enabled = false;
        try {
          await admin.end();
        } catch {
          /* ignore */
        }
        return;
      }
      throw error;
    } finally {
      try {
        await admin.end();
      } catch {
        /* ignore */
      }
    }

    pool = new pg.Pool({ connectionString: isolatedUrl(), max: 8 });
    try {
      const existing = await pool.query(
        `select table_name from information_schema.tables
         where table_schema='public' and table_name like 'speaking_b2_%'`,
      );
      assert.equal(existing.rowCount, 0);
      await pool.query(bootstrapSql);
      await pool.query(migrations[0].sql);
      await pool.query(migrations[1].sql);

      const probeUser = randomUUID();
      const probeSession = randomUUID();
      const invalidSession = randomUUID();
      await pool.query('insert into public."Usuarios_y_Perfil_users" (id) values ($1)', [probeUser]);
      await pool.query(
        `insert into speaking_b2_sessions (id, user_id, exam_code, state, access_token_hash)
         values ($1,$2,'SP-EX001','READY',$3), ($4,$2,'SP-EX001','READY',$5)`,
        [
          probeSession,
          probeUser,
          createHash('sha256').update(probeSession).digest('hex'),
          invalidSession,
          createHash('sha256').update(invalidSession).digest('hex'),
        ],
      );
      await pool.query(
        `insert into speaking_b2_quota_charges (session_id, user_id, usage_key, status)
         values ($1,$2,'speaking_correction','failed')`,
        [probeSession, probeUser],
      );
      await assert.rejects(
        () =>
          pool.query(
            `insert into speaking_b2_quota_charges (session_id, user_id, usage_key, status)
             values ($1,$2,'speaking_correction','nope')`,
            [invalidSession, probeUser],
          ),
        /check|violat/i,
      );

      await pool.query(migrations[2].sql);
      await pool.query(migrations[3].sql);
      await pool.query(migrations[4].sql);
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

  async function newSession({ pending = true } = {}) {
    const id = randomUUID();
    const userId = randomUUID();
    await pool.query('insert into public."Usuarios_y_Perfil_users" (id) values ($1)', [userId]);
    await pool.query(
      `insert into speaking_b2_sessions (
        id, user_id, exam_code, state, started_at, expires_at, access_token_hash,
        pending_report, evaluation_charged, row_version
      ) values ($1,$2,'SP-EX001','FINISHING', now(), now() + interval '1 day', $3, $4, false, 1)`,
      [
        id,
        userId,
        createHash('sha256').update(id).digest('hex'),
        pending ? JSON.stringify({ scores: { grammarVocabulary: 3 } }) : null,
      ],
    );
    return { id, userId };
  }

  function consume(sessionId, userId, args) {
    return pool.query(
      `select speaking_b2_consume_session_quota($1,$2,$3,$4,$5,$6,$7,$8,$9) as payload`,
      [
        sessionId,
        userId,
        args.usageKey || 'speaking_correction',
        args.periodType || 'month',
        args.periodKey || '2026-10',
        args.limit ?? null,
        args.dailyAction ?? null,
        args.dailyDate ?? null,
        args.dailyLimit ?? null,
      ],
    );
  }

  it('applies the five migrations on a database that had no speaking_b2 tables', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const tables = await pool.query(
      `select table_name from information_schema.tables
       where table_schema='public' and table_name like 'speaking_b2_%'
       order by 1`,
    );
    assert.ok(tables.rows.some((row) => row.table_name === 'speaking_b2_sessions'));
    assert.ok(tables.rows.some((row) => row.table_name === 'speaking_b2_quota_charges'));
    const extra = await pool.query(
      `select indexname from pg_indexes
       where indexname = 'ai_usage_daily_limits_user_action_date_uidx'`,
    );
    assert.equal(extra.rowCount, 0);
  });

  it('allows failed on the V2 ledger and rejects unknown statuses', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const def = await pool.query(
      `select pg_get_constraintdef(oid) as def
       from pg_constraint
       where conname = 'speaking_b2_quota_charges_status_check'`,
    );
    assert.match(def.rows[0].def, /failed/);
    assert.match(def.rows[0].def, /claimed/);
    assert.match(def.rows[0].def, /consumed/);
  });

  it('records PLAN_FEATURE_LOCKED as failed without incrementing', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const result = await consume(id, userId, { limit: 0 });
    assert.equal(result.rows[0].payload.code, 'PLAN_FEATURE_LOCKED');
    const charge = await pool.query('select status from speaking_b2_quota_charges where session_id=$1', [id]);
    const used = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    assert.equal(charge.rows[0].status, 'failed');
    assert.equal(used.rows[0].used, 0);
  });

  it('records PLAN_LIMIT_REACHED as failed without incrementing', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    await pool.query(
      `insert into plan_usage_counters (user_id, usage_key, period_type, period_key, count)
       values ($1,'speaking_correction','month','2026-10',2)`,
      [userId],
    );
    const result = await consume(id, userId, { limit: 2 });
    assert.equal(result.rows[0].payload.code, 'PLAN_LIMIT_REACHED');
    const used = await pool.query(
      `select count from plan_usage_counters where user_id=$1 and usage_key='speaking_correction'`,
      [userId],
    );
    const charge = await pool.query('select status from speaking_b2_quota_charges where session_id=$1', [id]);
    assert.equal(used.rows[0].count, 2);
    assert.equal(charge.rows[0].status, 'failed');
  });

  it('records DAILY_LIMIT_REACHED as failed without incrementing the plan', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    await pool.query(
      `insert into ai_usage_daily_limits (user_id, action, usage_date, count)
       values ($1,'exam_speaking_feedback','2026-10-27',3)`,
      [userId],
    );
    const result = await consume(id, userId, {
      limit: 5,
      dailyAction: 'exam_speaking_feedback',
      dailyDate: '2026-10-27',
      dailyLimit: 3,
    });
    assert.equal(result.rows[0].payload.code, 'DAILY_LIMIT_REACHED');
    const plan = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    const charge = await pool.query('select status from speaking_b2_quota_charges where session_id=$1', [id]);
    assert.equal(plan.rows[0].used, 0);
    assert.equal(charge.rows[0].status, 'failed');
  });

  it('records LIMIT_CHECK_FAILED as failed without incrementing', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const result = await consume(id, userId, { limit: 5, dailyAction: '', dailyDate: '2026-10-27', dailyLimit: 3 });
    assert.equal(result.rows[0].payload.code, 'LIMIT_CHECK_FAILED');
    const plan = await pool.query(
      `select coalesce(sum(count),0)::int as used from plan_usage_counters where user_id=$1`,
      [userId],
    );
    const charge = await pool.query('select status from speaking_b2_quota_charges where session_id=$1', [id]);
    assert.equal(plan.rows[0].used, 0);
    assert.equal(charge.rows[0].status, 'failed');
  });

  it('charges once, retries after failed, and keeps two concurrent sessions coherent', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const first = await newSession();
    const locked = await consume(first.id, first.userId, { limit: 0 });
    assert.equal(locked.rows[0].payload.code, 'PLAN_FEATURE_LOCKED');
    const ok = await consume(first.id, first.userId, { limit: 5 });
    assert.equal(ok.rows[0].payload.consumed, true);

    const userId = randomUUID();
    await pool.query('insert into public."Usuarios_y_Perfil_users" (id) values ($1)', [userId]);
    const left = await newSession();
    const right = await newSession();
    await pool.query('update speaking_b2_sessions set user_id=$1 where id=any($2::uuid[])', [
      userId,
      [left.id, right.id],
    ]);
    const payloads = await Promise.all([
      consume(left.id, userId, { limit: 5, dailyAction: 'exam_speaking_feedback', dailyDate: '2026-10-27', dailyLimit: 1 }),
      consume(right.id, userId, { limit: 5, dailyAction: 'exam_speaking_feedback', dailyDate: '2026-10-27', dailyLimit: 1 }),
    ]);
    const codes = payloads.map((item) => item.rows[0].payload);
    assert.equal(codes.filter((item) => item.ok && item.consumed).length, 1);
    assert.equal(codes.filter((item) => item.code === 'DAILY_LIMIT_REACHED').length, 1);
    const plan = await pool.query(
      `select count from plan_usage_counters where user_id=$1 and usage_key='speaking_correction'`,
      [userId],
    );
    const daily = await pool.query(
      `select count from ai_usage_daily_limits where user_id=$1 and action='exam_speaking_feedback'`,
      [userId],
    );
    assert.equal(plan.rows[0].count, 1);
    assert.equal(daily.rows[0].count, 1);
  });

  it('rolls back a consume when the caller aborts the transaction', async (t) => {
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
    assert.equal(used.rows[0].used, 0);
  });

  it('lets authenticated read the session but not access_token_hash; service_role can read the hash', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const privs = await pool.query(`
      select
        has_column_privilege('authenticated', 'public.speaking_b2_sessions', 'access_token_hash', 'SELECT') as auth_hash,
        has_column_privilege('authenticated', 'public.speaking_b2_sessions', 'state', 'SELECT') as auth_state,
        has_column_privilege('authenticated', 'public.speaking_b2_sessions', 'id', 'SELECT') as auth_id,
        has_column_privilege('anon', 'public.speaking_b2_sessions', 'access_token_hash', 'SELECT') as anon_hash,
        has_column_privilege('service_role', 'public.speaking_b2_sessions', 'access_token_hash', 'SELECT') as svc_hash,
        has_function_privilege('authenticated', 'speaking_b2_claim_evaluation(uuid)', 'EXECUTE') as auth_claim,
        has_function_privilege(
          'authenticated',
          'speaking_b2_consume_session_quota(uuid,uuid,text,text,text,integer,text,text,integer)',
          'EXECUTE'
        ) as auth_consume
    `);
    assert.equal(privs.rows[0].auth_hash, false);
    assert.equal(privs.rows[0].auth_state, true);
    assert.equal(privs.rows[0].auth_id, true);
    assert.equal(privs.rows[0].anon_hash, false);
    assert.equal(privs.rows[0].svc_hash, true);
    assert.equal(privs.rows[0].auth_claim, false);
    assert.equal(privs.rows[0].auth_consume, false);

    const views = await pool.query(`
      select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'v'
        and n.nspname = 'public'
        and pg_get_viewdef(c.oid) ilike '%access_token_hash%'
    `);
    assert.equal(views.rowCount, 0);

    const { id, userId } = await newSession();
    const client = new pg.Client({ connectionString: isolatedUrl() });
    await client.connect();
    try {
      await client.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId]);
      await client.query('set role authenticated');
      const visible = await client.query(
        'select id, state, exam_code from speaking_b2_sessions where id=$1',
        [id],
      );
      assert.equal(visible.rowCount, 1);
      await assert.rejects(
        () => client.query('select access_token_hash from speaking_b2_sessions where id=$1', [id]),
        /permission denied|permiso denegado/i,
      );
    } finally {
      await client.end();
    }

    const svc = new pg.Client({ connectionString: isolatedUrl() });
    await svc.connect();
    try {
      await svc.query('set role service_role');
      const internal = await svc.query(
        'select access_token_hash from speaking_b2_sessions where id=$1',
        [id],
      );
      assert.equal(Boolean(internal.rows[0].access_token_hash), true);
    } finally {
      await svc.end();
    }
  });
});
