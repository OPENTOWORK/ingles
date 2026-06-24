import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.slice(0, i)] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const pass = encodeURIComponent(env.SUPABASE_B_DB_PASSWORD || '');
const ref = 'cmeruknhkcxveygeeuji';
const regions = ['eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2', 'eu-north-1', 'us-east-1', 'us-west-1', 'ap-southeast-1'];

const urls = [
  `postgresql://postgres:${pass}@[2a05:d014:8ef:5901:2f6d:ff50:5c0f:f5bd]:5432/postgres`,
  env.SUPABASE_B_DATABASE_URL,
];
for (const prefix of ['aws-0', 'aws-1']) {
  for (const r of regions) {
    urls.push(`postgresql://postgres.${ref}:${pass}@${prefix}-${r}.pooler.supabase.com:6543/postgres`);
    urls.push(`postgresql://postgres:${pass}@${prefix}-${r}.pooler.supabase.com:5432/postgres`);
  }
}

for (const url of urls.filter(Boolean)) {
  const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    const r = await c.query('select 1 as ok');
    console.log('OK', url.replace(/:[^:@]+@/, ':***@'));
    console.log(r.rows[0]);
    await c.end();
    process.exit(0);
  } catch (e) {
    console.log('FAIL', (url.split('@')[1] || url).slice(0, 70), '→', e.message.slice(0, 100));
    await c.end().catch(() => {});
  }
}
process.exit(1);
