/**
 * Inicializa en Supabase los prompts de todas las partes de un nivel (desde el código).
 * Uso: node --loader ./scripts/alias-loader.mjs scripts/seed-exam-part-prompts.mjs [b2|a2|b1|c1|c2]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { A2_EXAM_PARTS } from '../src/lib/a2ExamCatalog.js';
import { getLevelExamParts, isExamGenerationSlug } from '../src/lib/levelsExamCatalog.js';
import { ensureExamPartPromptStored } from '../src/lib/examPartGenerationPrompt.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function getServiceDb() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function partsForSlug(slug) {
  if (slug === 'a2') return A2_EXAM_PARTS;
  return getLevelExamParts(slug) || [];
}

async function main() {
  const slug = String(process.argv[2] || 'b2').toLowerCase();
  if (slug !== 'a2' && !isExamGenerationSlug(slug)) {
    throw new Error('Nivel no soportado. Usa: a2, b1, b2, c1, c2');
  }

  const db = getServiceDb();
  const parts = partsForSlug(slug);
  let created = 0;

  for (const partDef of parts) {
    const { data: existing } = await db
      .from('levels_exam_part_prompt_overrides')
      .select('id')
      .eq('level_slug', slug)
      .eq('part_number', partDef.partNumber)
      .maybeSingle();

    await ensureExamPartPromptStored(db, {
      levelSlug: slug,
      partNumber: partDef.partNumber,
      examSlot: 1,
    });

    if (!existing?.id) created += 1;
  }

  console.log(
    `[seed-exam-part-prompts] ${slug.toUpperCase()}: ${parts.length} partes — ${created} nuevas en Supabase.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
