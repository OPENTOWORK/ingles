/**
 * Read-only: compare B2 RUOE prompt overrides on STAGING (Supabase B) vs code v1.1.1.
 * NEVER touches production (qnazrzvwvkwhkfbqsbmr).
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/preview-b2-ruoe-prompt-diff-staging.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { resolveDefaultExamPartGenerationPrompt } from '../src/lib/examPartGenerationPrompt.js';
import { fetchExamPartPromptOverride } from '../src/lib/examPartPromptOverrides.js';
import { promptHtmlToPlainText } from '../src/lib/examPartGenerationPrompt.js';

const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';
const STAGING_REF = 'cmeruknhkcxveygeeuji';

const PARTS = [1, 2, 3, 5, 6, 7];

const V11_SIGNATURES = {
  1: ['Adversarially test all four options', 'STRICT word count: minimum 150'],
  2: ['Open cloze (Q9–16)', 'naturalness'],
  3: ['Word formation (Q17–24)', 'Natural sentence first, transformation second'],
  5: ['Reading Part 5', 'v1.1: Build distractors from passage information'],
  6: ['PART 6 ARCHITECTURE v2', 'PHYSICALLY REMOVE those six sentences'],
  7: ['Multiple matching (Q43–52)', 'v1.1: Paraphrase evidence in questions'],
};

function refFromUrl(url) {
  const m = String(url || '').match(/https:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

function stripNoise(text) {
  return promptHtmlToPlainText(text)
    .replace(/Topic\/theme:[^\n]*/gi, '')
    .replace(/Variety seed:\s*\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function signaturesOk(partNumber, userPlain) {
  const sigs = V11_SIGNATURES[partNumber] || [];
  return sigs.map((s) => ({
    sig: s,
    present: userPlain.includes(s),
  }));
}

async function main() {
  const env = loadEnvLocal();
  const url = env.SUPABASE_B_URL;
  const key = env.SUPABASE_B_SECRET_KEY || env.SUPABASE_B_SERVICE_ROLE_KEY;
  const ref = refFromUrl(url);

  if (!url || !key) {
    throw new Error('Missing SUPABASE_B_URL or SUPABASE_B_SECRET_KEY in .env.local');
  }
  if (ref === PROD_REF) {
    throw new Error('REFUSED: SUPABASE_B_URL points to production. STOP.');
  }
  if (ref !== STAGING_REF) {
    throw new Error(`REFUSED: unknown staging ref ${ref}; expected ${STAGING_REF}`);
  }

  console.log('READ-ONLY preview · staging ref:', ref);
  console.log('URL:', url);

  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stable = { topic: 'general everyday life', varietySeed: 20260717, examSlot: 1 };
  const rows = [];

  for (const partNumber of PARTS) {
    const defaults = resolveDefaultExamPartGenerationPrompt({
      levelSlug: 'b2',
      partNumber,
      ...stable,
    });
    const codeUser = stripNoise(defaults.user);
    const codeSystem = stripNoise(defaults.system);

    const row = await fetchExamPartPromptOverride(db, 'b2', partNumber);
    const dbUserRaw = String(row?.user_prompt || '').trim();
    const dbSystemRaw = String(row?.system_prompt || '').trim();
    const dbUser = stripNoise(dbUserRaw);
    const dbSystem = stripNoise(dbSystemRaw);

    const userMatch = dbUser === codeUser;
    const systemMatch = dbSystem === codeSystem || !dbSystemRaw;
    const dbSigs = signaturesOk(partNumber, dbUser);
    const codeSigs = signaturesOk(partNumber, codeUser);

    rows.push({
      partNumber,
      dbRowExists: Boolean(row),
      updatedAt: row?.updated_at || null,
      dbUserLen: dbUserRaw.length,
      codeUserLen: defaults.user.length,
      userMatchCode: userMatch,
      systemMatchCode: systemMatch,
      wouldUpdate: !userMatch,
      dbV11Signatures: dbSigs,
      codeV11Signatures: codeSigs,
      dbUserStart: dbUser.slice(0, 120),
      codeUserStart: codeUser.slice(0, 120),
    });
  }

  console.log(JSON.stringify({ stagingRef: ref, parts: rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
