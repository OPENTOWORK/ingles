/**
 * Sync B2 RUOE prompts v1.1.1 to STAGING (Supabase B) only.
 * Parts 1, 2, 3, 5, 6, 7 — Part 4 intentionally skipped.
 * REFUSES production URL (qnazrzvwvkwhkfbqsbmr).
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/sync-b2-ruoe-prompts-staging.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { resetExamPartPromptForAdmin } from '../src/lib/examPartGenerationPrompt.js';
import { getExamPartDisplayLabel } from '../src/lib/examPartDisplayLabel.js';

const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';
const STAGING_REF = 'cmeruknhkcxveygeeuji';
const PARTS = [1, 2, 3, 5, 6, 7];

const SIGNATURES = {
  1: ['Adversarially test all four options', 'STRICT word count: minimum 150'],
  2: ['Open cloze (Q9–16)'],
  3: ['Word formation (Q17–24)', 'Natural sentence first'],
  5: ['Reading Part 5', 'v1.1: Build distractors'],
  6: ['PART 6 ARCHITECTURE v2', 'PHYSICALLY REMOVE'],
  7: ['Multiple matching (Q43–52)', 'Paraphrase evidence'],
};

function refFromUrl(url) {
  const m = String(url || '').match(/https:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

async function main() {
  const env = loadEnvLocal();
  const url = env.SUPABASE_B_URL;
  const key = env.SUPABASE_B_SECRET_KEY || env.SUPABASE_B_SERVICE_ROLE_KEY;
  const ref = refFromUrl(url);

  if (!url || !key) {
    throw new Error('Missing SUPABASE_B_URL or SUPABASE_B_SECRET_KEY');
  }
  if (ref === PROD_REF) {
    throw new Error('REFUSED: target is production. Use SUPABASE_B_URL.');
  }
  if (ref !== STAGING_REF) {
    throw new Error(`REFUSED: unexpected ref ${ref}`);
  }

  console.log('STAGING SYNC · ref:', ref);
  console.log('URL:', url);
  console.log('Parts:', PARTS.join(', '), '(Part 4 skipped)');

  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stable = { topic: 'general everyday life', varietySeed: 20260717, examSlot: 1 };
  const results = [];

  for (const partNumber of PARTS) {
    const result = await resetExamPartPromptForAdmin(
      db,
      { levelSlug: 'b2', partNumber, ...stable },
      null,
    );
    const user = String(result.user || '');
    const sigs = SIGNATURES[partNumber] || [];
    const ok = sigs.every((s) => user.includes(s));
    const label = getExamPartDisplayLabel('b2', partNumber);
    console.log(
      `Part ${partNumber} · ${label} · len=${user.length} · v11Sig=${ok ? 'YES' : 'NO'}`,
    );
    if (!ok) {
      console.log('  missing:', sigs.filter((s) => !user.includes(s)));
    }
    results.push({ partNumber, len: user.length, v11SigOk: ok, isCustom: result.isCustom });
  }

  console.log('Staging sync complete.');
  return results;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
