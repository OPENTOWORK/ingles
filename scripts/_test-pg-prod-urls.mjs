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
const ref = 'qnazrzvwvkwhkfbqsbmr';
const urls = [
  `postgresql://postgres:${pass}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?options=project%3D${ref}`,
  `postgresql://postgres:${pass}@aws-0-eu-north-1.pooler.supabase.com:5432/postgres?options=project%3D${ref}`,
  `postgresql://postgres.${ref}:${pass}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres`,
];

for (const url of urls) {
  const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    const r = await c.query('select current_database() db');
    console.log('OK', url.replace(/:[^:@]+@/, ':***@'), r.rows[0]);
    await c.end();
    process.exit(0);
  } catch (e) {
    console.log('FAIL', e.message.slice(0, 120));
    await c.end().catch(() => {});
  }
}
