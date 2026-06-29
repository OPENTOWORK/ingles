import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_B_DATABASE_URL;

async function testRest(label, key) {
  if (!url || !key) return { label, ok: false, error: 'missing env' };
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.from('Usuarios_y_Perfil_roles').select('id').limit(1);
  if (error) return { label, ok: false, error: error.message };
  return { label, ok: true, rows: data?.length ?? 0 };
}

async function testPg() {
  if (!dbUrl) return { label: 'Postgres DATABASE_URL', ok: false, error: 'no DATABASE_URL in .env.local' };
  try {
    const pg = await import('pg');
    const client = new pg.default.Client({ connectionString: dbUrl, connectionTimeoutMillis: 8000 });
    await client.connect();
    const res = await client.query('select 1 as ok');
    await client.end();
    return { label: 'Postgres DATABASE_URL', ok: true, detail: res.rows?.[0]?.ok };
  } catch (err) {
    return { label: 'Postgres DATABASE_URL', ok: false, error: err.message };
  }
}

const results = [
  await testRest('Supabase REST (anon key)', anon),
  await testRest('Supabase REST (service role)', service),
  await testPg(),
];

for (const r of results) {
  if (r.ok) console.log(`OK  ${r.label}${r.detail != null ? ` (${r.detail})` : ''}`);
  else console.log(`FAIL ${r.label}: ${r.error}`);
}

process.exit(results.every((r) => r.ok) ? 0 : 1);
