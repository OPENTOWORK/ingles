/**
 * POST approved preview JSON to production internal save endpoint.
 * Usage: node scripts/push-part4-to-production.mjs
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const internalKey = 'preview-save-b2-exam1-part4-v1';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part4-b2.json'), 'utf8'),
);

const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';

const res = await fetch(`${baseUrl}/api/internal/save-exam-part-preview`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-key': internalKey,
  },
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 4,
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

if (!res.ok) {
  console.error('Save failed', res.status, json);
  process.exit(1);
}

console.log(JSON.stringify(json, null, 2));
