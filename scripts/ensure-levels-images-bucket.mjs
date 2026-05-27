import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = 'Levels_Images';

const { data: buckets } = await admin.storage.listBuckets();
const exists = (buckets || []).some((b) => b.name === BUCKET || b.id === BUCKET);

if (!exists) {
  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error) {
    console.error('createBucket:', error.message);
    process.exit(1);
  }
  console.log(`Bucket "${BUCKET}" creado (público).`);
} else {
  console.log(`Bucket "${BUCKET}" ya existe.`);
}

const { error: updErr } = await admin.storage.updateBucket(BUCKET, { public: true });
if (updErr) console.warn('updateBucket:', updErr.message);

console.log('OK');
