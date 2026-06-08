/**
 * Copy Part 13 speaker MP3s to Part 12 paths in Supabase Storage (no DB changes).
 * Run only after approving preview-exam1-part12-migrated-b2.json.
 *
 * Usage:
 *   npx vercel env run --environment=production -- node scripts/copy-part13-audio-to-part12.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const BUCKET = 'Levels_Listening';
const PAIRS = [1, 2, 3, 4, 5].map((n) => {
  const pad = String(n).padStart(2, '0');
  return {
    from: `b2/exam-1/part-13/speaker-${pad}.mp3`,
    to: `b2/exam-1/part-12/speaker-${pad}.mp3`,
  };
});

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const { from, to } of PAIRS) {
  const { data: blob, error: dlErr } = await admin.storage.from(BUCKET).download(from);
  if (dlErr) {
    console.error(`Download failed ${from}:`, dlErr.message);
    process.exit(1);
  }
  const buf = Buffer.from(await blob.arrayBuffer());
  const { error: upErr } = await admin.storage.from(BUCKET).upload(to, buf, {
    contentType: 'audio/mpeg',
    upsert: true,
  });
  if (upErr) {
    console.error(`Upload failed ${to}:`, upErr.message);
    process.exit(1);
  }
  console.log(`OK ${from} → ${to} (${buf.length} bytes)`);
}

console.log('Done. Next: save Part 12 content with skipAudio:true and link speaker-01…05 URLs.');
