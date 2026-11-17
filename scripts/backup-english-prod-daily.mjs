import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logPath = path.join(root, 'tmp', 'backup-daily.log');
const schemaPath = path.join(root, 'scripts', 'sql', 'english-prod-public-tables.sql');
const BATCH = 400;

function log(line) {
  const text = `${new Date().toISOString()} ${line}`;
  console.log(line);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${text}\n`);
}

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) env[t.slice(0, i)] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function madridToday() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return {
    label: `${get('year')}-${get('month')}-${get('day')}`,
    day: Number(get('day')),
  };
}

function client(url, key) {
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const env = loadEnv();
const today = madridToday();
const requested = process.argv.find((arg, index) => process.argv[index - 1] === '--target');
const slot = (requested || (today.day % 2 === 0 ? 'A' : 'B')).toUpperCase();
if (slot !== 'A' && slot !== 'B') throw new Error('El destino tiene que ser A o B');

const targets = {
  A: {
    url: env.SUPABASE_BACKUP_URL,
    key: env.SUPABASE_BACKUP_SECRET_KEY,
    password: env.SUPABASE_BACKUP_DB_PASSWORD,
    ref: 'srzhidynmcirsrfpdbtr',
  },
  B: {
    url: env.SUPABASE_BACKUP_B_URL,
    key: env.SUPABASE_BACKUP_B_SECRET_KEY,
    password: env.SUPABASE_BACKUP_B_DB_PASSWORD,
    ref: 'ekcpsvteqlckqphqfjdq',
  },
};
const target = targets[slot];
if (!target.url || !target.key || !target.password) {
  throw new Error(`Faltan credenciales de la copia ${slot}`);
}

log(`Copia ${slot} · ${today.label} · ${target.url}`);

const source = client(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const sourceProbe = await source.from('Usuarios_y_Perfil_users').select('*', { count: 'exact', head: true });
if (sourceProbe.error) throw new Error(`ENGLISH_PROD no responde: ${sourceProbe.error.message}`);

const db = new pg.Client({
  connectionString: `postgresql://postgres.${target.ref}:${encodeURIComponent(target.password)}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

if (fs.existsSync(schemaPath)) {
  const statements = fs.readFileSync(schemaPath, 'utf8').split(/;\s*\n\n/).map((sql) => sql.trim()).filter(Boolean);
  let created = 0;
  for (const sql of statements) {
    try {
      await db.query(sql.endsWith(';') ? sql : `${sql};`);
      created += 1;
    } catch (err) {
      if (!/already exists|duplicate/i.test(err.message)) {
        log(`Esquema: ${err.message.split('\n')[0]}`);
      }
    }
  }
  log(`Esquema revisado (${created} sentencias)`);
}

await db.query('GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role');
await db.query('GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role');
await db.query('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role');
await db.query("NOTIFY pgrst, 'reload schema'");

const { rows: tables } = await db.query(`
  SELECT c.relname AS name, EXISTS (
    SELECT 1 FROM pg_attribute a
    WHERE a.attrelid = c.oid AND a.attname = 'id' AND NOT a.attisdropped
  ) AS has_id
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY c.relname
`);

await db.query(`
  DO $$ DECLARE r record;
  BEGIN
    FOR r IN SELECT quote_ident(tablename) AS t FROM pg_tables WHERE schemaname = 'public'
    LOOP
      EXECUTE 'TRUNCATE TABLE public.' || r.t || ' RESTART IDENTITY CASCADE';
    END LOOP;
  END $$;
`);
log(`Tablas vaciadas: ${tables.length}`);

const api = client(target.url, target.key);
let copiedRows = 0;
const failed = [];
for (const { name, has_id: hasId } of tables) {
  const countRes = await source.from(name).select('*', { count: 'exact', head: true });
  if (countRes.error) {
    failed.push(`${name}: ${countRes.error.message}`);
    log(`FALLO ${name}: ${countRes.error.message}`);
    continue;
  }
  const total = countRes.count ?? 0;
  if (total === 0) continue;
  let copied = 0;
  try {
    for (let offset = 0; offset < total; offset += BATCH) {
      let query = source.from(name).select('*').range(offset, offset + BATCH - 1);
      if (hasId) query = query.order('id', { ascending: true });
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      const rows = data ?? [];
      if (!rows.length) break;
      const inserted = await api.from(name).insert(rows);
      if (inserted.error) throw new Error(inserted.error.message);
      copied += rows.length;
      if (rows.length < BATCH) break;
    }
    copiedRows += copied;
    log(`${name}: ${copied}`);
  } catch (err) {
    failed.push(`${name}: ${err.message}`);
    log(`FALLO ${name}: ${err.message}`);
  }
}

await db.query(`
  DO $$ DECLARE r record;
  BEGIN
    FOR r IN SELECT quote_ident(tablename) AS t FROM pg_tables WHERE schemaname = 'public'
    LOOP
      EXECUTE 'ALTER TABLE public.' || r.t || ' ENABLE ROW LEVEL SECURITY';
      EXECUTE 'REVOKE ALL ON TABLE public.' || r.t || ' FROM anon, authenticated';
    END LOOP;
  END $$;
`);

const checks = [
  ['Usuarios_y_Perfil_users', 'usuarios'],
  ['pro_launch_grants', 'plazas'],
  ['levels_respuestas', 'respuestas'],
  ['marketing_visitor_hits', 'visitas'],
];
for (const [table, label] of checks) {
  const origin = await source.from(table).select('*', { count: 'exact', head: true });
  const copy = await api.from(table).select('*', { count: 'exact', head: true });
  const originCount = origin.count ?? -1;
  const copyCount = copy.error ? `error ${copy.error.message}` : copy.count;
  log(`Comprobación ${label}: origen ${originCount} · copia ${copyCount}`);
  if (copy.error || copy.count !== originCount) failed.push(`${table}: origen ${originCount}, copia ${copyCount}`);
}

await db.end();
log(`Filas copiadas: ${copiedRows}. Fallos: ${failed.length}`);
if (failed.length) {
  process.exitCode = 1;
}
