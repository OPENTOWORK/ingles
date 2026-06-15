/**
 * Generate B2 exam part preview with retries; save only if clean (no needs_review).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/generate-and-save-exam-part.mjs [slot] [partNumber] [topic...]
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

const slot = Number(process.argv[2] || 2);
const partNumber = Number(process.argv[3] || 1);
const topic = process.argv.slice(4).join(' ').trim() || undefined;
const maxAttempts = Number(process.env.EXAM_PART_MAX_ATTEMPTS || 12);

const { previewLevelExamPartGeneration, saveLevelExamPartFromPreview } = await import(
  '../src/lib/levelsCambridgeExamGenerator.js'
);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'scripts', 'generated', `preview-exam${slot}-part${partNumber}-b2.json`);

const topics = topic
  ? [topic]
  : [
      'travel and cultural exchange',
      'host families abroad',
      'language immersion trips',
      'volunteering overseas',
      'backpacking across Europe',
      'study abroad semesters',
      'international food festivals',
      'homestay programmes',
      'gap year travel',
      'cultural heritage tourism',
      'working holiday visas',
      'exchange student life',
      'local customs abroad',
      'sustainable tourism',
      'digital nomads abroad',
    ];

let best = null;

for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
  const t = topics[attempt % topics.length];
  const seed = Date.now() + attempt * 7919 + slot * 1000 + partNumber * 137;
  console.error(`\n[Attempt ${attempt + 1}/${maxAttempts}] slot=${slot} part=${partNumber} topic="${t}" seed=${seed}`);

  try {
    const preview = await previewLevelExamPartGeneration({
      levelSlug: 'b2',
      examSlot: slot,
      partNumber,
      varietySeed: seed,
      topic: t,
    });

    const nr = preview.validation.needsReview?.length || preview.generated?.__needsReview?.findings?.length || 0;
    const summary = {
      attempt: attempt + 1,
      topic: t,
      title: preview.generated?.title || preview.generated?.passageTitle || '',
      ok: preview.validation.ok,
      needsReview: nr,
      errors: preview.validation.errors,
      warnings: preview.validation.warnings,
    };
    console.error(JSON.stringify(summary, null, 2));

    if (!best || (preview.validation.ok && nr === 0)) {
      best = preview;
    }

    if (preview.validation.ok && nr === 0) {
      if (partNumber === 2) {
        const blockReasons = [];
        for (const w of preview.validation.warnings || []) {
          if (/repeats the same answer word/i.test(w)) blockReasons.push(w);
          if (/passage is \d+ words/i.test(w)) blockReasons.push(w);
        }
        if (blockReasons.length) {
          console.error(JSON.stringify({ skippedSave: true, blockReasons }, null, 2));
          continue;
        }
        const passage = String(preview.generated?.passage || '');
        const wc = passage
          .replace(/\(\d+\)\s*_+/g, ' ')
          .split(/\s+/)
          .filter(Boolean).length;
        if (wc < 150 || wc > 180) {
          console.error(JSON.stringify({ skippedSave: true, wordCount: wc, reason: 'target 150–180' }, null, 2));
          continue;
        }
      }

      writeFileSync(outPath, JSON.stringify(preview, null, 2), 'utf8');
      console.error(`Preview written: ${outPath}`);

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) throw new Error('Missing Supabase credentials');

      const admin = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();

      const result = await saveLevelExamPartFromPreview(admin, {
        levelSlug: 'b2',
        levelId: level.id,
        examSlot: slot,
        partNumber,
        generated: preview.generated,
        skipAudio: true,
        replacePartContent: true,
      });

      console.log(
        JSON.stringify(
          {
            saved: true,
            slot,
            partNumber,
            topic: t,
            title: preview.generated?.title,
            preguntaId: result.preguntaId,
            previewPath: outPath,
            warnings: preview.validation.warnings,
          },
          null,
          2,
        ),
      );
      process.exit(0);
    }
  } catch (e) {
    console.error(`Attempt ${attempt + 1} error:`, e?.message || e);
  }
}

if (best) {
  writeFileSync(outPath, JSON.stringify(best, null, 2), 'utf8');
}
console.error(JSON.stringify({ saved: false, slot, partNumber, previewPath: outPath, lastOk: best?.validation?.ok }, null, 2));
process.exit(1);
