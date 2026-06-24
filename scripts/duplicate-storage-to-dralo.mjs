/**
 * Copia buckets de Storage de ENGLISH_PROD → Supabase B.
 * Uso: node scripts/duplicate-storage-to-dralo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) {
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[t.slice(0, i)] = v;
    }
  }
  return env;
}

function client(url, key) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureBucket(target, bucket, { public: isPublic }) {
  const { data: buckets } = await target.storage.listBuckets();
  const exists = (buckets || []).some((b) => b.name === bucket || b.id === bucket);
  if (!exists) {
    const { error } = await target.storage.createBucket(bucket, { public: isPublic });
    if (error) throw new Error(`createBucket ${bucket}: ${error.message}`);
    console.log(`  Bucket creado: ${bucket}`);
  }
  await target.storage.updateBucket(bucket, { public: isPublic }).catch(() => {});
}

async function listAllFiles(source, bucket, prefix = '') {
  const out = [];
  const { data, error } = await source.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw new Error(`${bucket} list ${prefix}: ${error.message}`);
  for (const item of data || []) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      out.push(...(await listAllFiles(source, bucket, fullPath)));
    } else {
      out.push(fullPath);
    }
  }
  return out;
}

async function copyBucket(source, target, bucket, isPublic) {
  await ensureBucket(target, bucket, { public: isPublic });
  const files = await listAllFiles(source, bucket);
  console.log(`  ${bucket}: ${files.length} objetos`);
  let copied = 0;
  for (const filePath of files) {
    const { data: blob, error: dlErr } = await source.storage.from(bucket).download(filePath);
    if (dlErr) throw new Error(`download ${bucket}/${filePath}: ${dlErr.message}`);
    const buf = Buffer.from(await blob.arrayBuffer());
    const { error: upErr } = await target.storage.from(bucket).upload(filePath, buf, {
      upsert: true,
      contentType: blob.type || undefined,
    });
    if (upErr) throw new Error(`upload ${bucket}/${filePath}: ${upErr.message}`);
    copied += 1;
    if (copied % 50 === 0) process.stdout.write(`\r  ${bucket}: ${copied}/${files.length}`);
  }
  if (files.length) process.stdout.write('\n');
  console.log(`  ${bucket}: ${copied} copiados`);
}

async function main() {
  const env = loadEnv();
  const source = client(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const target = client(env.SUPABASE_B_URL, env.SUPABASE_B_SECRET_KEY);

  const buckets = [
    { name: 'Levels_Images', public: true },
    { name: 'Levels_Listening', public: true },
    { name: 'profile-avatars', public: true },
  ];

  console.log('Copiando Storage prod → B…');
  for (const b of buckets) {
    await copyBucket(source, target, b.name, b.public);
  }
  console.log('Storage copiado.');
}

main().catch((err) => {
  console.error('Fallo:', err.message);
  process.exit(1);
});
