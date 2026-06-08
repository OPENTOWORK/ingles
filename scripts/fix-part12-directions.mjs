/**
 * Update Part 12 B2 levels_partes.Descripción (directions only).
 * Usage: npx vercel env run --environment=production -- node scripts/fix-part12-directions.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvLocal } from './load-env-local.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvLocal();

const NEW_DIRECTIONS =
  'Part:12\r\n\r\nYou will hear five people talking about their first experiences of paid work. For questions 19–23, choose from the list (A–H) the opinion each speaker expresses. Use the letters only once. There are three extra letters which you do not need to use.';

const key =
  process.env.DRALO_INTERNAL_API_KEY ||
  process.env.INTERNAL_API_SECRET ||
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY;

if (!key) {
  console.error('Missing auth key (use: npx vercel env run --environment=production -- node ...)');
  process.exit(1);
}

const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';
const res = await fetch(`${baseUrl}/api/internal/patch-part-directions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-internal-key': key },
  body: JSON.stringify({
    slug: 'b2',
    partNumber: 12,
    descripcion: NEW_DIRECTIONS,
  }),
});

const result = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

if (result.newDescripcion === result.oldDescripcion) {
  console.error('Update did not change descripcion — check API route / permissions.');
  process.exit(1);
}

const outPath = path.join(scriptsDir, 'generated', 'fix-part12-directions-result.json');
writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
