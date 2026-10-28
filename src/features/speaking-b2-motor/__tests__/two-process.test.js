import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, it } from 'node:test';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const worker = path.join(root, 'src/features/speaking-b2-motor/__tests__/helpers/speaking-b2-pg-worker.mjs');
const schemaSql = readFileSync(path.join(root, 'scripts/speaking_b2_itest_schema.sql'), 'utf8');
const securitySql = readFileSync(path.join(root, 'scripts/speaking_b2_itest_security.sql'), 'utf8');
const v22Sql = readFileSync(path.join(root, 'scripts/speaking_b2_motor_v22.sql'), 'utf8')
  .replace(/^begin;/im, '')
  .replace(/^commit;/im, '')
  .replace(/revoke all[\s\S]*?to service_role;/gi, '');

function isolatedUrl() {
  const fromEnv = process.env.SPEAKING_B2_ITEST_DATABASE_URL?.trim();
  if (fromEnv) {
    const host = new URL(fromEnv.replace(/^postgresql:/, 'http:')).hostname;
    if (!['127.0.0.1', 'localhost'].includes(host)) {
      throw new Error('SPEAKING_B2_ITEST_DATABASE_URL must point at localhost');
    }
    return fromEnv;
  }
  return 'postgresql://postgres:postgres@127.0.0.1:5432/speaking_b2_itest_proc';
}

function adminUrl() {
  const url = new URL(isolatedUrl().replace(/^postgresql:/, 'http:'));
  url.pathname = '/postgres';
  return url.toString().replace(/^http:/, 'postgresql:');
}

function runWorker(action, sessionId, userId) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [worker, action, sessionId, userId], {
      env: { ...process.env, SPEAKING_B2_ITEST_DATABASE_URL: isolatedUrl() },
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `worker exit ${code}`));
        return;
      }
      resolve(JSON.parse(stdout));
    });
  });
}

describe('speaking B2 two OS processes against one PostgreSQL', () => {
  let pool = null;
  let enabled = false;

  before(async () => {
    const admin = new pg.Client({
      connectionString: adminUrl(),
      connectionTimeoutMillis: 2500,
    });
    try {
      await admin.connect();
      await admin.query('create database speaking_b2_itest_proc');
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
      await pool.query(v22Sql);
      enabled = true;
    } catch (error) {
      enabled = false;
      await pool.end().catch(() => {});
      pool = null;
      if (!/ECONNREFUSED|password|auth|timeout/i.test(error.message)) throw error;
    }
  });

  after(async () => {
    if (pool) await pool.end();
  });

  async function newSession() {
    const id = randomUUID();
    const userId = randomUUID();
    await pool.query(
      `insert into speaking_b2_sessions (
        id, user_id, exam_code, state, started_at, expires_at, access_token_hash,
        pending_report, evaluation_charged, row_version
      ) values ($1,$2,'SP-EX001','FINISHING', now(), now() + interval '1 day', $3, $4, false, 1)`,
      [
        id,
        userId,
        createHash('sha256').update(id).digest('hex'),
        JSON.stringify({ scores: { grammarVocabulary: 3 } }),
      ],
    );
    return { id, userId };
  }

  it('lets two processes consume the same session only once', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const [left, right] = await Promise.all([
      runWorker('consume', id, userId),
      runWorker('consume', id, userId),
    ]);
    assert.notEqual(left.pid, right.pid);
    const payloads = [left.payload, right.payload];
    assert.equal(payloads.filter((item) => item.ok && item.consumed).length, 1);
    assert.equal(payloads.filter((item) => item.already).length, 1);
    const used = await pool.query(
      `select count from plan_usage_counters
       where user_id=$1 and usage_key='speaking_correction' and period_key='2026-10'`,
      [userId],
    );
    assert.equal(used.rows[0].count, 1);
  });

  it('recovers the report from a second process after the first only claimed', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const claimed = await runWorker('claim', id, userId);
    assert.equal(claimed.lock.evaluation_in_flight, true);
    const consumed = await runWorker('consume', id, userId);
    assert.equal(consumed.payload.ok, true);
    const read = await runWorker('read', id, userId);
    assert.notEqual(read.pid, claimed.pid);
    assert.equal(read.session.evaluation_charged, true);
    assert.equal(read.session.has_pending, true);
  });

  it('applies the staff daily cap once across two processes', async (t) => {
    if (!enabled) return t.skip('PostgreSQL local aislado no disponible');
    const { id, userId } = await newSession();
    const [left, right] = await Promise.all([
      runWorker('consume-daily', id, userId),
      runWorker('consume-daily', id, userId),
    ]);
    const payloads = [left.payload, right.payload];
    assert.equal(payloads.filter((item) => item.ok && item.consumed).length, 1);
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
});
