/**
 * Read-only: compare B2 prompt overrides in DB vs code (any reachable Supabase).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/preview-b2-ruoe-prompt-diff.mjs [--url=...] [--key=...]
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { resolveDefaultExamPartGenerationPrompt, promptHtmlToPlainText } from '../src/lib/examPartGenerationPrompt.js';
import { fetchExamPartPromptOverride } from '../src/lib/examPartPromptOverrides.js';

const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';
const PARTS = [1, 2, 3, 5, 6, 7];

const V11_SIGNATURES = {
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

function stripNoise(text) {
  return promptHtmlToPlainText(text)
    .replace(/Topic\/theme:[^\n]*/gi, '')
    .replace(/Variety seed:\s*\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseArgs() {
  const out = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--(\w+)=([\s\S]+)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const env = loadEnvLocal();
  const url = args.url || env.SUPABASE_B_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    args.key ||
    (args.url?.includes('cmeruknhkcxveygeeuji')
      ? env.SUPABASE_B_SECRET_KEY
      : env.SUPABASE_SERVICE_ROLE_KEY);
  const ref = refFromUrl(url);

  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stable = { topic: 'general everyday life', varietySeed: 20260717, examSlot: 1 };
  const parts = [];

  for (const partNumber of PARTS) {
    const defaults = resolveDefaultExamPartGenerationPrompt({
      levelSlug: 'b2',
      partNumber,
      ...stable,
    });
    const codeUser = stripNoise(defaults.user);
    let row = null;
    let fetchError = null;
    try {
      row = await fetchExamPartPromptOverride(db, 'b2', partNumber);
    } catch (e) {
      fetchError = e?.message || String(e);
    }
    const dbUserRaw = String(row?.user_prompt || '').trim();
    const dbUser = stripNoise(dbUserRaw);
    const sigs = (V11_SIGNATURES[partNumber] || []).map((s) => ({
      sig: s,
      inDb: dbUser.includes(s),
      inCode: codeUser.includes(s),
    }));

    parts.push({
      partNumber,
      fetchError,
      dbRowExists: Boolean(row),
      updatedAt: row?.updated_at || null,
      userMatchCode: dbUser === codeUser,
      wouldUpdate: dbUser !== codeUser,
      dbUserLen: dbUserRaw.length,
      codeUserLen: defaults.user.length,
      signatures: sigs,
      dbSnippet: dbUser.slice(0, 150),
      codeSnippet: codeUser.slice(0, 150),
    });
  }

  console.log(
    JSON.stringify(
      {
        url,
        ref,
        isProd: ref === PROD_REF,
        readOnly: true,
        parts,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
