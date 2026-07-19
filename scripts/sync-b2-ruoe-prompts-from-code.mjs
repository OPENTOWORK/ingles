/**
 * Fuerza en Supabase los prompts B2 RUOE partes 1–7 desde el código actual
 * (draloAiExamPrompts.js), sobrescribiendo overrides antiguos.
 *
 * Uso: node --loader ./scripts/alias-loader.mjs scripts/sync-b2-ruoe-prompts-from-code.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { resetExamPartPromptForAdmin } from '../src/lib/examPartGenerationPrompt.js';
import { getExamPartDisplayLabel } from '../src/lib/examPartDisplayLabel.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const SIGNATURES = {
  1: ['STRICT word count: minimum 150', 'Exactly 8 scored gaps'],
  2: ['Open cloze (Q9–16)', 'content-word vocabulary gaps'],
  3: ['Word formation (Q17–24)'],
  4: ['Key word transformations', 'grading_metadata'],
  5: ['Reading Part 5: Multiple choice (Q31–36)'],
  6: ['Gapped text (Q37–42)'],
  7: ['Multiple matching (Q43–52)'],
};

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  }

  console.log('Supabase:', url);
  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Tema/seed estables para que el badge EDITED no salte por Date.now()
  const stable = {
    topic: 'general everyday life',
    varietySeed: 20260717,
  };

  for (const partNumber of [1, 2, 3, 4, 5, 6, 7]) {
    const result = await resetExamPartPromptForAdmin(
      db,
      {
        levelSlug: 'b2',
        partNumber,
        examSlot: 1,
        ...stable,
      },
      null,
    );

    const user = String(result.user || '');
    const sigs = SIGNATURES[partNumber] || [];
    const ok = sigs.every((s) => user.includes(s));
    const label = getExamPartDisplayLabel('b2', partNumber);

    console.log(
      `Part ${partNumber} · ${label} · len=${user.length} · custom=${result.isCustom} · colleagueSig=${ok ? 'YES' : 'NO'}`,
    );
    if (!ok) {
      console.log('  missing signatures:', sigs.filter((s) => !user.includes(s)));
      console.log('  start:', user.slice(0, 100).replace(/\n/g, ' '));
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
