/**
 * Regenera solo Partes 1 y 2 del Examen 4 B2 con validación estricta.
 * Uso: node --loader ./scripts/alias-loader.mjs scripts/regen-b2-exam4-parts-1-2.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { generateAndPersistLevelExamPart } from '../src/lib/levelsCambridgeExamGenerator.js';
import { getExamPartDisplayLabel } from '../src/lib/examPartDisplayLabel.js';

loadEnvLocal();

const EXAM_SLOT = 4;
const PARTS = (process.env.DRALO_REGEN_PARTS || '1,2')
  .split(',')
  .map((n) => Number(n.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);
const USE_CODE_PROMPTS = process.env.DRALO_USE_CODE_PROMPTS === 'true';
const MAX_OUTER_RETRIES = Number(process.env.DRALO_OUTER_RETRIES || 3);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY && !process.env.DRALO_OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY (o DRALO_OPENAI_API_KEY)');
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level, error: levelErr } = await db
  .from('levels')
  .select('id, nombre')
  .eq('nombre', 'b2')
  .maybeSingle();

if (levelErr || !level?.id) {
  console.error('Nivel B2 no encontrado:', levelErr?.message);
  process.exit(1);
}

console.log(
  `[regen parts] levelId=${level.id} slot=${EXAM_SLOT} parts=${PARTS.join(',')} useCodePrompts=${USE_CODE_PROMPTS}`,
);

let failed = 0;
for (const partNumber of PARTS) {
  const label = getExamPartDisplayLabel('b2', partNumber);
  const t0 = Date.now();
  process.stdout.write(`\n→ Part ${partNumber}: ${label} ... `);
  let lastErr = null;
  for (let outer = 0; outer < MAX_OUTER_RETRIES; outer += 1) {
    try {
      await generateAndPersistLevelExamPart(db, {
        levelSlug: 'b2',
        levelId: level.id,
        examSlot: EXAM_SLOT,
        partNumber,
        skipAudio: true,
        preserveExistingParts: false,
        replacePartContent: true,
        persistDespiteValidation: false,
        useCodePrompts: USE_CODE_PROMPTS || outer > 0,
        varietySeed: Date.now() + partNumber * 9973 + outer * 17011,
      });
      lastErr = null;
      console.log(`OK (${Math.round((Date.now() - t0) / 1000)}s)${outer ? ` [retry ${outer}]` : ''}`);
      break;
    } catch (err) {
      lastErr = err;
      process.stdout.write(`retry${outer + 1}... `);
    }
  }
  if (lastErr) {
    failed += 1;
    console.log(`FAIL (${Math.round((Date.now() - t0) / 1000)}s)`);
    console.error(`  ${lastErr?.message || lastErr}`);
  }
}

process.exit(failed ? 1 : 0);
