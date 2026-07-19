/**
 * Regenera por completo el Examen 4 B2 usando los prompts de cada parte (Supabase/código).
 * Uso: node --loader ./scripts/alias-loader.mjs scripts/regen-b2-exam4.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { B2_EXAM_PARTS } from '../src/lib/b2ExamCatalog.js';
import { generateAndPersistLevelExamPart } from '../src/lib/levelsCambridgeExamGenerator.js';
import { getExamPartDisplayLabel } from '../src/lib/examPartDisplayLabel.js';

loadEnvLocal();

const EXAM_SLOT = 4;
const SKIP_AUDIO = process.env.DRALO_REGEN_SKIP_AUDIO !== 'false'; // default: skip audio (más rápido/estable)

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

console.log(`[regen-b2-exam4] levelId=${level.id} slot=${EXAM_SLOT} parts=${B2_EXAM_PARTS.length} skipAudio=${SKIP_AUDIO}`);

const results = [];
let failed = 0;

for (const partDef of B2_EXAM_PARTS) {
  const partNumber = partDef.partNumber;
  const label = getExamPartDisplayLabel('b2', partNumber);
  const t0 = Date.now();
  process.stdout.write(`\n→ Part ${partNumber}: ${label} ... `);

  try {
    const row = await generateAndPersistLevelExamPart(db, {
      levelSlug: 'b2',
      levelId: level.id,
      examSlot: EXAM_SLOT,
      partNumber,
      skipAudio: SKIP_AUDIO,
      preserveExistingParts: false,
      replacePartContent: true,
      // RUOE: never persist invalid cloze/reading parts (stray gaps / empty text).
      persistDespiteValidation: !(partNumber >= 1 && partNumber <= 7),
      varietySeed: Date.now() + partNumber * 9973,
    });
    const ms = Date.now() - t0;
    console.log(`OK (${Math.round(ms / 1000)}s)${row?.skipped ? ' [skipped]' : ''}`);
    results.push({ partNumber, ok: true, ms });
  } catch (err) {
    const ms = Date.now() - t0;
    failed += 1;
    console.log(`FAIL (${Math.round(ms / 1000)}s)`);
    console.error(`  ${err?.message || err}`);
    results.push({ partNumber, ok: false, ms, error: err?.message || String(err) });
  }
}

console.log('\n========== SUMMARY ==========');
for (const r of results) {
  console.log(
    `Part ${String(r.partNumber).padStart(2, '0')}: ${r.ok ? 'OK' : 'FAIL'}${r.error ? ` — ${r.error}` : ''}`,
  );
}
console.log(`Done. ${results.filter((r) => r.ok).length}/${results.length} ok, ${failed} failed.`);
process.exit(failed ? 1 : 0);
