import { spawnSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials for B1 preview CI.');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function log(stage, result) {
  const output = [result.stdout || '', result.stderr || ''].join('\n').slice(-30000);
  const { error } = await admin.from('b1_motor_dev_run_logs').insert({
    stage,
    ok: result.status === 0,
    output,
  });
  if (error) console.error('Could not save B1 dev run log:', error.message);
}

const tests = spawnSync(
  process.execPath,
  ['--loader', './scripts/alias-loader.mjs', '--test', 'src/lib/__tests__/b1PreliminaryReadingMotor.test.js'],
  { encoding: 'utf8', env: process.env },
);
await log('tests', tests);
process.stdout.write(tests.stdout || '');
process.stderr.write(tests.stderr || '');

if (tests.status !== 0) process.exit(tests.status || 1);

const pilot = spawnSync(
  process.execPath,
  ['--loader', './scripts/alias-loader.mjs', 'scripts/pilot-b1-reading-exam.mjs'],
  { encoding: 'utf8', env: process.env, maxBuffer: 10 * 1024 * 1024 },
);
await log('pilot_generation', pilot);
process.stdout.write(pilot.stdout || '');
process.stderr.write(pilot.stderr || '');

process.exit(pilot.status || 0);
