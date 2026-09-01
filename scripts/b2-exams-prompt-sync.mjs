/**
 * Backup + sync of the B2 generation prompts (parts 1–9) from code into Supabase.
 *
 * The generator gives DB overrides precedence over the code defaults, so stale rows
 * silently downgrade generation quality. This writes the current code prompts
 * (RUOE blueprint v1.1.x + Writing) into `levels_exam_part_prompt_overrides`.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-exams-prompt-sync.mjs --dry-run
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-exams-prompt-sync.mjs --apply
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  resolveDefaultExamPartGenerationPrompt,
  resetExamPartPromptForAdmin,
  promptHtmlToPlainText,
} from '../src/lib/examPartGenerationPrompt.js';
import { fetchExamPartPromptOverride } from '../src/lib/examPartPromptOverrides.js';

const PARTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Blueprint markers that must survive the sync; a missing one means the code drifted. */
const BLUEPRINT_SIGNATURES = {
  1: ['Adversarially test all four options', 'STRICT word count: minimum 150'],
  2: ['Open cloze (Q9–16)'],
  3: ['Word formation (Q17–24)', 'Natural sentence first'],
  4: ['Key word transformations', 'grading_metadata'],
  5: ['Reading Part 5', 'v1.1: Build distractors'],
  6: ['PART 6 ARCHITECTURE v2', 'PHYSICALLY REMOVE'],
  7: ['Multiple matching (Q43–52)'],
  8: ['essay'],
  9: ['four'],
};

/** Topic/seed are re-injected per generation, so they must not count as drift. */
function stripVarietyNoise(text) {
  return promptHtmlToPlainText(text)
    .replace(/Topic\/theme:[^\n]*/gi, '')
    .replace(/Variety seed:\s*\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const stable = { levelSlug: 'b2', examSlot: 1, topic: 'general everyday life', varietySeed: 20260717 };

const backup = [];
const report = [];

for (const partNumber of PARTS) {
  const defaults = resolveDefaultExamPartGenerationPrompt({ ...stable, partNumber });
  const row = await fetchExamPartPromptOverride(db, 'b2', partNumber);

  backup.push({
    level_slug: 'b2',
    part_number: partNumber,
    system_prompt: row?.system_prompt ?? null,
    user_prompt: row?.user_prompt ?? null,
    updated_at: row?.updated_at ?? null,
  });

  const dbUser = stripVarietyNoise(row?.user_prompt || '');
  const codeUser = stripVarietyNoise(defaults.user);
  const missingInCode = (BLUEPRINT_SIGNATURES[partNumber] || []).filter((s) => !codeUser.includes(s));

  report.push({
    part: partNumber,
    dbLen: (row?.user_prompt || '').length,
    codeLen: defaults.user.length,
    drift: dbUser !== codeUser,
    missingBlueprintSignaturesInCode: missingInCode,
  });
}

const outDir = path.join(root, 'scripts', 'generated', 'prompt-backups');
mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(outDir, `b2-exam-part-prompts-${stamp}.json`);
writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');

console.log(`Backup written: ${backupPath}`);
console.table(report);

const brokenCode = report.filter((r) => r.missingBlueprintSignaturesInCode.length > 0);
if (brokenCode.length) {
  console.error('\nRefusing to sync: code prompts are missing blueprint signatures:');
  for (const r of brokenCode) console.error(`  Part ${r.part}: ${r.missingBlueprintSignaturesInCode.join(', ')}`);
  process.exit(1);
}

if (!apply) {
  const pending = report.filter((r) => r.drift).map((r) => r.part);
  console.log(`\nDry run. Parts that would be overwritten: ${pending.join(', ') || 'none'}`);
  console.log('Re-run with --apply to write.');
  process.exit(0);
}

for (const partNumber of PARTS) {
  const result = await resetExamPartPromptForAdmin(db, { ...stable, partNumber }, null);
  console.log(`Part ${partNumber} synced · len=${String(result.user || '').length} · isCustom=${result.isCustom}`);
}

console.log('\nDone. DB prompts now match the code blueprint.');
