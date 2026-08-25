/**
 * Verify effective runtime prompts on STAGING after sync.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/verify-b2-ruoe-prompts-runtime-staging.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  resolveDefaultExamPartGenerationPrompt,
  resolveEffectiveExamPartGenerationPrompt,
  promptHtmlToPlainText,
} from '../src/lib/examPartGenerationPrompt.js';

const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';
const STAGING_REF = 'cmeruknhkcxveygeeuji';
const PARTS = [1, 2, 3, 5, 6, 7];

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

async function main() {
  const env = loadEnvLocal();
  const url = env.SUPABASE_B_URL;
  const key = env.SUPABASE_B_SECRET_KEY || env.SUPABASE_B_SERVICE_ROLE_KEY;
  const ref = refFromUrl(url);
  if (ref === PROD_REF) throw new Error('REFUSED: production URL');
  if (ref !== STAGING_REF) throw new Error(`REFUSED: ref ${ref}`);

  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const opts = {
    levelSlug: 'b2',
    examSlot: 1,
    topic: 'urban green spaces',
    varietySeed: 20260815,
  };

  const report = [];
  for (const partNumber of PARTS) {
    const defaults = resolveDefaultExamPartGenerationPrompt({ ...opts, partNumber });
    const effective = await resolveEffectiveExamPartGenerationPrompt(db, { ...opts, partNumber });
    const effUser = stripNoise(effective.user);
    const codeUser = stripNoise(defaults.user);
    const effSys = stripNoise(effective.system);
    const codeSys = stripNoise(defaults.system);
    report.push({
      partNumber,
      isCustom: effective.isCustom,
      updatedAt: effective.updatedAt,
      effectiveMatchesCodeUser: effUser === codeUser,
      effectiveMatchesCodeSystem: effSys === codeSys,
      effectiveUserLen: effective.user.length,
      codeUserLen: defaults.user.length,
      hasVarietyLine: /Topic\/theme:/i.test(effective.user),
    });
  }

  console.log(JSON.stringify({ stagingRef: ref, report }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
