import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { readSpeakingB2TestTargetFromEnv } from '../src/features/speaking-b2-motor/services/test-target-guard.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = readSpeakingB2TestTargetFromEnv();

if (!target.ok) {
  console.error(JSON.stringify({ ok: false, code: target.code, applied: [] }, null, 2));
  process.exit(2);
}

const files = [
  'scripts/speaking_b2_motor.sql',
  'scripts/speaking_b2_motor_v2.sql',
  'scripts/speaking_b2_motor_v21.sql',
  'scripts/speaking_b2_motor_v22.sql',
  'scripts/speaking_b2_motor_v23.sql',
];

const client = new pg.Client({
  connectionString: process.env.SPEAKING_B2_TEST_DATABASE_URL,
  connectionTimeoutMillis: 8000,
});

await client.connect();
const applied = [];
try {
  for (const rel of files) {
    await client.query(readFileSync(path.join(root, rel), 'utf8'));
    applied.push(rel);
  }
  const functions = await client.query(
    `select proname, pronargs from pg_proc
     where proname in ('speaking_b2_consume_session_quota','speaking_b2_claim_evaluation')
     order by proname, pronargs`,
  );
  console.log(JSON.stringify({ ok: true, applied, functions: functions.rows }, null, 2));
} finally {
  await client.end();
}
