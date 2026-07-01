/**
 * Regenera un examen completo (A2, B1, C1 o C2) con DRALO AI.
 * No toca B2.
 *
 * Uso: node scripts/regen-level-exam-parts.mjs <slug> <slot>
 * Ej.: node scripts/regen-level-exam-parts.mjs b1 1
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const slug = String(process.argv[2] || '').toLowerCase();
const slot = Number(process.argv[3] || 1);

const ALLOWED = new Set(['a2', 'b1', 'c1', 'c2']);

if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!ALLOWED.has(slug)) {
  console.error('Uso: node scripts/regen-level-exam-parts.mjs <a2|b1|c1|c2> <slot>');
  process.exit(1);
}

if (!env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY en .env.local');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { getCachedLevelBySlug } = await import('../src/utils/levelsLevelCache.js');

const { data: level } = await getCachedLevelBySlug(admin, slug);
if (!level?.id) {
  console.error(`Nivel ${slug} no encontrado`);
  process.exit(1);
}

let result;
if (slug === 'a2') {
  const { generateAndPersistA2Exam } = await import('../src/lib/levelsA2ExamGenerator.js');
  console.log(`Regenerando Examen ${slot} A2…`);
  result = await generateAndPersistA2Exam(admin, {
    levelId: level.id,
    examSlot: slot,
    force: true,
    skipAudio: true,
    skipImages: true,
    onProgress: ({ step, total, part }) => console.log(`  [${step}/${total}] Part ${part}`),
  });
} else {
  const { generateAndPersistLevelExam } = await import('../src/lib/levelsCambridgeExamGenerator.js');
  console.log(`Regenerando Examen ${slot} ${slug.toUpperCase()}…`);
  result = await generateAndPersistLevelExam(admin, {
    levelSlug: slug,
    levelId: level.id,
    examSlot: slot,
    force: true,
    skipAudio: true,
    preserveExistingParts: false,
    replacePartContent: true,
    onProgress: ({ step, total, part }) => console.log(`  [${step}/${total}] Part ${part}`),
  });
}

console.log('OK', result.message);
