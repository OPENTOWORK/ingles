/**
 * Validate improved Part 5/7 previews and save to Supabase.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/apply-b2-reading-improvements.mjs [1] [2] [3] [4] [5] [6]
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getImprovedPart } from './b2ReadingImprovedContent.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const slots = process.argv.slice(2).map(Number).filter((n) => n >= 1 && n <= 6);
const examSlots = slots.length ? slots : [1, 2, 3];

const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const { saveLevelExamPartFromPreview } = await import('../src/lib/levelsCambridgeExamGenerator.js');

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

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('B2 level not found');
  process.exit(1);
}

const genDir = path.join(root, 'scripts', 'generated');
mkdirSync(genDir, { recursive: true });

const results = [];

for (const slot of examSlots) {
  for (const partNumber of [5, 7]) {
    const generated = getImprovedPart(slot, partNumber);
    if (!generated) continue;

    const validation = validateGeneratedExamPart('b2', partNumber, generated);
    const previewPath = path.join(genDir, `preview-exam${slot}-part${partNumber}-b2.json`);
    writeFileSync(
      previewPath,
      JSON.stringify({ levelSlug: 'b2', examSlot: slot, partNumber, generated, validation }, null, 2),
      'utf8',
    );

    if (!validation.ok) {
      console.error(`Exam ${slot} Part ${partNumber} validation FAILED:`, validation.errors);
      results.push({ slot, partNumber, ok: false, errors: validation.errors });
      continue;
    }

    console.error(`Saving B2 Exam ${slot} Part ${partNumber}…`);
    const saveResult = await saveLevelExamPartFromPreview(admin, {
      levelSlug: 'b2',
      levelId: level.id,
      examSlot: slot,
      partNumber,
      generated,
      skipAudio: true,
      replacePartContent: true,
    });

    results.push({ slot, partNumber, ok: true, previewPath, saveResult });
    console.log(`Saved exam ${slot} part ${partNumber}`);
  }
}

writeFileSync(path.join(genDir, 'apply-b2-reading-improvements-result.json'), JSON.stringify(results, null, 2), 'utf8');
const failed = results.filter((r) => !r.ok);
process.exit(failed.length ? 1 : 0);
