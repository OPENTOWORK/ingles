import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!(process.env.OPENAI_API_KEY || env.OPENAI_API_KEY)) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MOTOR_VERSION = 'b1-reading-pilot-v5';
const examSlot = 1;

const { data: existing, error: existingError } = await admin
  .from('b1_motor_dev_generated_exams')
  .select('id,status,created_at')
  .eq('exam_slot', examSlot)
  .eq('motor_version', MOTOR_VERSION)
  .maybeSingle();

if (existingError) {
  console.error('Could not read isolated B1 pilot table:', existingError.message);
  process.exit(1);
}
if (existing?.id) {
  console.log('B1 pilot Exam 1 already exists in isolated dev storage; skipping regeneration.', existing);
  process.exit(0);
}

const {
  generatePartJsonWithRetries,
} = await import('../src/lib/levelsCambridgeExamGenerator.js');
const {
  getLevelExamLabel,
  getLevelExamPartDef,
} = await import('../src/lib/levelsExamCatalog.js');
const {
  chooseB1ReadingVariety,
  recordB1ReadingVariety,
} = await import('../src/lib/b1ReadingVarietyHistory.js');

const levelLabel = getLevelExamLabel('b1');
const parts = [];
const summaries = [];

for (let partNumber = 1; partNumber <= 6; partNumber += 1) {
  const partDef = getLevelExamPartDef('b1', partNumber);
  if (!partDef) throw new Error(`Missing B1 Reading Part ${partNumber} definition.`);

  const chosen = await chooseB1ReadingVariety(admin, { examSlot, partNumber });
  const topic = [
    chosen.topic,
    chosen.context ? `context/genre: ${chosen.context}` : null,
    chosen.grammarFocus ? `grammar focus: ${chosen.grammarFocus}` : null,
  ].filter(Boolean).join('; ');

  console.log(`Generating B1 Exam 1 Part ${partNumber}: ${topic}`);

  const result = await generatePartJsonWithRetries('b1', levelLabel, partDef, {
    examSlot,
    topic,
    varietySeed: 110120 + partNumber,
  });

  if (!result?.validation?.ok) {
    console.error(`Part ${partNumber} failed after retries:`, result?.validation?.errors || []);
    console.error('LAST GENERATED PART FOR DIAGNOSTIC REVIEW:');
    console.error(JSON.stringify(result?.generated || null, null, 2));
    process.exit(1);
  }

  parts.push({
    partNumber,
    allocation: chosen,
    generated: result.generated,
    validation: {
      ok: result.validation.ok,
      errors: result.validation.errors || [],
      warnings: result.validation.warnings || [],
      semanticQuality: result.validation.semanticQuality || null,
    },
  });

  summaries.push({
    partNumber,
    topic: chosen.topic,
    context: chosen.context,
    grammarFocus: chosen.grammarFocus || null,
    warnings: result.validation.warnings || [],
  });
}

for (const part of parts) {
  await recordB1ReadingVariety(admin, {
    examSlot,
    partNumber: part.partNumber,
    chosen: part.allocation,
  });
}

const { error: saveError } = await admin
  .from('b1_motor_dev_generated_exams')
  .insert({
    exam_slot: examSlot,
    motor_version: MOTOR_VERSION,
    status: 'generated',
    payload: {
      examSlot,
      level: 'B1 Preliminary Reading',
      generatedAt: new Date().toISOString(),
      parts,
    },
    validation_summary: {
      allPartsPassed: true,
      parts: summaries,
    },
  });

if (saveError) {
  console.error('Could not save isolated B1 pilot payload:', saveError.message);
  process.exit(1);
}

console.log('B1 Preliminary Reading Exam 1 generated successfully in isolated dev storage.');
