/**
 * POST approved Part 6 preview to production internal save endpoint.
 * Usage: npx vercel env run --environment=production -- node scripts/push-part6-to-production.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part6-b2.json'), 'utf8'),
);

const key =
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error('Missing auth key (use: npx vercel env run --environment=production -- node ...)');
  process.exit(1);
}

const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';

const res = await fetch(`${baseUrl}/api/internal/save-exam-part-preview`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-key': key,
  },
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 6,
    generated: preview.generated,
  }),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  json = { raw: text };
}

const out = { status: res.status, ...json };
writeFileSync(path.join(scriptsDir, 'generated', 'save-part6-result.json'), JSON.stringify(out, null, 2));

if (!res.ok) {
  console.error('Save failed', res.status, JSON.stringify(json));
  process.exit(1);
}

console.log(JSON.stringify(out, null, 2));
