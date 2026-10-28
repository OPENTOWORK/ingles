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
const v1Sql = readFileSync(path.join(root, 'scripts/speaking_b2_motor.sql'), 'utf8');
const v2Sql = readFileSync(path.join(root, 'scripts/speaking_b2_motor_v2.sql'), 'utf8');
const v21Sql = readFileSync(path.join(root, 'scripts/speaking_b2_motor_v21.sql'), 'utf8');
const v22Sql = readFileSync(path.join(root, 'scripts/speaking_b2_motor_v22.sql'), 'utf8');
const v23Sql = readFileSync(path.join(root, 'scripts/speaking_b2_motor_v23.sql'), 'utf8');
const v22Apply = v22Sql
  .replace(/^begin;/im, '')
  .replace(/^commit;/im, '')
  .replace(/grant execute[\s\S]*?to service_role;/gi, '');
const v23Apply = v23Sql
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
  return 'postgresql://postgres:postgres@127.0.0.1:5432/speaking_b2_itest_rls';
}

function adminUrl() {
  const url = new URL(isolatedUrl().replace(/^postgresql:/, 'http:'));
  url.pathname = '/postgres';
  return url.toString().replace(/^http:/, 'postgresql:');
}

function testerUrl() {
  const url = new URL(isolatedUrl().replace(/^postgresql:/, 'http:'));
  url.username = 'speaking_b2_rls_tester';
  url.password = 'speaking_rls';
  return url.toString().replace(/^http:/, 'postgresql:');
}

describe('speaking B2 isolated RLS and storage policies', () => {
  let pool = null;
  let enabled = false;
  const ownerId = randomUUID();
  const otherId = randomUUID();
  const sessionId = randomUUID();

  before(async () => {
    const admin = new pg.Client({
      connectionString: adminUrl(),
      connectionTimeoutMillis: 2500,
    });
    try {
      await admin.connect();
      await admin.query('create database speaking_b2_itest_rls');
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

    pool = new pg.Pool({ connectionString: isolatedUrl(), max: 4, connectionTimeoutMillis: 2500 });
    try {
      await pool.query(schemaSql);
      await pool.query(securitySql);
      await pool.query(v22Apply);
      await pool.query(v23Apply);
      enabled = true;
      await pool.query(
        `insert into speaking_b2_sessions (
          id, user_id, exam_code, state, started_at, expires_at, access_token_hash, metadata
        ) values ($1,$2,'SP-EX001','FINISHING', now(), now() + interval '1 day', $3, '{}'::jsonb)
        on conflict (id) do nothing`,
        [sessionId, ownerId, createHash('sha256').update(sessionId).digest('hex')],
      );
      await pool.query(
        `insert into speaking_b2_turns (session_id, turn_index, role, transcript)
         values ($1,0,'candidate','hello')
         on conflict (session_id, turn_index) do nothing`,
        [sessionId],
      );
      await pool.query(
        `insert into storage.objects (bucket_id, name, owner)
         values ('speaking-b2-audio', $1, $2)`,
        [`${ownerId}/${sessionId}/clip.webm`, ownerId],
      );
      await pool.query(
        `insert into speaking_b2_exams (code, title, review_status)
         values ('SP-EX001','Part 1','approved')
         on conflict (code) do nothing`,
      );
      await pool.query(
        `insert into speaking_b2_questions (id, exam_code, question, review_status)
         values ('SP-EX001-P1-Q01','SP-EX001','What do you enjoy most about studying English?','approved')
         on conflict (id) do nothing`,
      );
    } catch (error) {
      enabled = false;
      await pool.end().catch(() => {});
      pool = null;
      if (!/ECONNREFUSED|password authentication|timeout/i.test(error.message)) throw error;
    }
  });

  after(async () => {
    if (pool) await pool.end();
  });

  it('lets the owner read their session and hides another user', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const tester = new pg.Client({ connectionString: testerUrl() });
    await tester.connect();
    try {
      await tester.query(`select set_config('request.jwt.claim.sub', $1, false)`, [ownerId]);
      const own = await tester.query('select id from speaking_b2_sessions where id=$1', [sessionId]);
      assert.equal(own.rowCount, 1);
      await tester.query(`select set_config('request.jwt.claim.sub', $1, false)`, [otherId]);
      const other = await tester.query('select id from speaking_b2_sessions where id=$1', [sessionId]);
      assert.equal(other.rowCount, 0);
    } finally {
      await tester.end();
    }
  });

  it('rejects writes from the authenticated tester role', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const tester = new pg.Client({ connectionString: testerUrl() });
    await tester.connect();
    try {
      await tester.query(`select set_config('request.jwt.claim.sub', $1, false)`, [ownerId]);
      await assert.rejects(
        () => tester.query(`update speaking_b2_sessions set state='COMPLETED' where id=$1`, [sessionId]),
        /permission denied|permiso denegado/i,
      );
    } finally {
      await tester.end();
    }
  });

  it('hides access_token_hash from authenticated clients but keeps other session columns', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const tester = new pg.Client({ connectionString: testerUrl() });
    await tester.connect();
    try {
      await tester.query(`select set_config('request.jwt.claim.sub', $1, false)`, [ownerId]);
      const visible = await tester.query(
        'select id, state, exam_code from speaking_b2_sessions where id=$1',
        [sessionId],
      );
      assert.equal(visible.rowCount, 1);
      assert.equal(visible.rows[0].state, 'FINISHING');
      await assert.rejects(
        () => tester.query('select access_token_hash from speaking_b2_sessions where id=$1', [sessionId]),
        /permission denied|permiso denegado/i,
      );
    } finally {
      await tester.end();
    }
    const internal = await pool.query(
      'select access_token_hash from speaking_b2_sessions where id=$1',
      [sessionId],
    );
    assert.equal(Boolean(internal.rows[0].access_token_hash), true);
  });

  it('hides the exam catalog from students and guests', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const tester = new pg.Client({ connectionString: testerUrl() });
    await tester.connect();
    try {
      await tester.query(`select set_config('request.jwt.claim.sub', $1, false)`, [ownerId]);
      await assert.rejects(
        () => tester.query('select code from speaking_b2_exams'),
        /permission denied|permiso denegado/i,
      );
      await assert.rejects(
        () => tester.query('select id from speaking_b2_questions'),
        /permission denied|permiso denegado/i,
      );
    } finally {
      await tester.end();
    }
  });

  it('keeps the speaking audio bucket private and without object policies', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const bucket = await pool.query(`select public from storage.buckets where id='speaking-b2-audio'`);
    assert.equal(bucket.rows[0].public, false);
    const tester = new pg.Client({ connectionString: testerUrl() });
    await tester.connect();
    try {
      await tester.query(`select set_config('request.jwt.claim.sub', $1, false)`, [ownerId]);
      const objects = await tester.query(`select name from storage.objects where bucket_id='speaking-b2-audio'`);
      assert.equal(objects.rowCount, 0);
    } finally {
      await tester.end();
    }
  });

  it('refuses privileged RPCs to anon and authenticated', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    for (const role of ['anon', 'authenticated']) {
      const client = new pg.Client({ connectionString: isolatedUrl() });
      await client.connect();
      try {
        await client.query(`set role ${role}`);
        await assert.rejects(
          () =>
            client.query(
              `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,null,null,null)`,
              [sessionId, ownerId],
            ),
          /permission denied|permiso denegado/i,
        );
        await assert.rejects(
          () => client.query('select speaking_b2_claim_evaluation($1)', [sessionId]),
          /permission denied|permiso denegado/i,
        );
      } finally {
        await client.end();
      }
    }
  });

  it('reviews migration order and privileged grants without applying them to production', () => {
    assert.match(v1Sql, /LOCAL REVIEW ONLY/);
    assert.match(v2Sql, /speaking_b2_motor_v21.sql/);
    assert.match(v21Sql, /speaking_b2_consume_session_quota/);
    assert.match(v22Sql, /p_daily_action/);
    assert.match(v22Sql, /exam_speaking_feedback/);
    assert.equal(v23Sql.includes('ai_usage_daily_limits_user_action_date_uidx'), false);
    assert.match(v1Sql, /revoke select \(access_token_hash\)/);
    assert.match(v1Sql, /column_name <> 'access_token_hash'/);
    assert.equal(/grant select on public\.speaking_b2_sessions to authenticated/i.test(v1Sql), false);
    assert.match(v1Sql, /grant select \(access_token_hash\) on public.speaking_b2_sessions to service_role/);
    assert.match(v23Sql, /revoke select \(access_token_hash\)/);
    assert.match(v23Sql, /column_name <> 'access_token_hash'/);
    assert.match(v23Sql, /grant select \(access_token_hash\) on public.speaking_b2_sessions to service_role/);
    assert.equal(/grant select on public\.speaking_b2_sessions to authenticated/i.test(v23Sql), false);
    assert.match(v23Sql, /revoke all on public.speaking_b2_exams/);
    assert.match(v22Sql, /REVOKE all on function public.speaking_b2_consume_session_quota/i);
    assert.match(v22Sql, /grant execute[\s\S]*to service_role/i);
    assert.match(v1Sql, /revoke all on public.speaking_b2_exams from public, anon, authenticated/);
    assert.equal(v1Sql.includes('grant select on public.speaking_b2_exams to anon'), false);
    assert.equal(v22Sql.includes('ai_usage_daily_limits_user_action_date_uidx'), false);
    assert.match(v1Sql, /revoke insert, update, delete on public.speaking_b2_sessions/);
    assert.match(v1Sql, /No public\/authenticated storage policies/);
    const persist = readFileSync(
      path.join(root, 'src/features/speaking-b2-motor/services/audio/persist.js'),
      'utf8',
    );
    assert.match(persist, /createSignedUrl\(path, expiresSec/);
    assert.match(persist, /SPEAKING_B2_AUDIO_BUCKET = 'speaking-b2-audio'/);
    assert.equal(persist.includes('.remove('), false);
  });
});
