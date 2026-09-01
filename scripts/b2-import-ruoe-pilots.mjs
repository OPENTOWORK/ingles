/**
 * Import the approved RUOE pilot exams (E01–E04) into B2 exam slots 1–4, parts 1–7.
 *
 * The pilots are offline JSON payloads produced by the pilot generation pack; each file
 * carries a `.generated` payload in the same shape the live generator emits, so they can
 * be persisted through `saveLevelExamPartFromPreview` without calling OpenAI.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-import-ruoe-pilots.mjs --dry-run
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-import-ruoe-pilots.mjs --apply
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-import-ruoe-pilots.mjs --apply --slot=2
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  root,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);

const E01 = path.join(PACK, '05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3', 'EXAM-01');
const E02 = path.join(PACK, '05_OUTPUTS_REGENERATED_E02_v1_1_3', 'EXAM-02');
const E02_PREV = path.join(PACK, '05_OUTPUTS_REGENERATED_v1_1_2', 'EXAM-02');
const E03 = path.join(PACK, '05_OUTPUTS_PILOT_E03_v1_0', 'EXAM-03');
const E04 = path.join(PACK, '05_OUTPUTS_PILOT_E04_v1_0', 'EXAM-04');

/**
 * Latest human-reviewed source per exam slot and part.
 * Slot 2 part 1 stays on v1.1.2: the v1.1.3 regeneration pushed the passage to 261 words,
 * over the 200-word hard limit, while v1.1.2 sits at 186 with a clean validation.
 */
const PILOT_SOURCES = {
  1: {
    label: 'RUOE-PILOT-E01 (teacher patch v1.1.3)',
    parts: {
      1: path.join(E01, 'CB-PILOT-001_Part1.json'),
      2: path.join(E01, 'CB-PILOT-002_Part2.json'),
      3: path.join(E01, 'CB-PILOT-003_Part3.json'),
      4: path.join(E01, 'TBP-PILOT-EX01_Part4.json'),
      5: path.join(E01, 'CB-PILOT-004_Part5.json'),
      6: path.join(E01, 'CB-PILOT-005_Part6.json'),
      7: path.join(E01, 'CB-PILOT-006_Part7.json'),
    },
  },
  2: {
    label: 'RUOE-PILOT-E02 (v1.1.3, part 1 from v1.1.2)',
    parts: {
      1: path.join(E02_PREV, 'CB-PILOT-007_Part1.json'),
      2: path.join(E02, 'CB-PILOT-008_Part2.json'),
      3: path.join(E02, 'CB-PILOT-009_Part3.json'),
      4: path.join(E02, 'TBP-PILOT-EX02_Part4.json'),
      5: path.join(E02, 'CB-PILOT-010_Part5.json'),
      6: path.join(E02, 'CB-PILOT-011_Part6.json'),
      7: path.join(E02, 'CB-PILOT-012_Part7.json'),
    },
  },
  3: {
    label: 'RUOE-PILOT-E03 (v1.0)',
    parts: {
      1: path.join(E03, 'CB-PILOT-013_Part1.json'),
      2: path.join(E03, 'CB-PILOT-014_Part2.json'),
      3: path.join(E03, 'CB-PILOT-015_Part3.json'),
      4: path.join(E03, 'TBP-PILOT-EX03_Part4.json'),
      5: path.join(E03, 'CB-PILOT-016_Part5.json'),
      6: path.join(E03, 'CB-PILOT-017_Part6.json'),
      7: path.join(E03, 'CB-PILOT-018_Part7.json'),
    },
  },
  4: {
    label: 'RUOE-PILOT-E04 (v1.0)',
    parts: {
      1: path.join(E04, 'CB-PILOT-019_Part1.json'),
      2: path.join(E04, 'CB-PILOT-020_Part2.json'),
      3: path.join(E04, 'CB-PILOT-021_Part3.json'),
      4: path.join(E04, 'TBP-PILOT-EX04_Part4.json'),
      5: path.join(E04, 'CB-PILOT-022_Part5.json'),
      6: path.join(E04, 'CB-PILOT-023_Part6.json'),
      7: path.join(E04, 'CB-PILOT-024_Part7.json'),
    },
  },
};

const APO = '\u2019';

/**
 * Two pilot Part 4 items fail the app's Cambridge validator, so they would be
 * ungradeable in the exam. Both keep the teacher's target structure.
 */
const PILOT_REPAIRS = {
  '3:4': {
    reason:
      'Q25 marking points did not partition the answer, so "was not as good as" scored 1/2. ' +
      'Re-split into negative BE + first AS / adjective + second AS, the usual Cambridge split for "not as … as".',
    patch(generated) {
      const q = generated.questions.find((x) => Number(x.number) === 25);
      q.grading_metadata.markingPoints = [
        { id: 1, label: 'negative BE + first AS', accepted: ['was not as', `wasn${APO}t as`] },
        { id: 2, label: 'gradable adjective + second AS', accepted: ['good as'] },
      ];
    },
  },
  '4:4': {
    reason:
      'Q28 answer "would rather you didn\u2019t tell" is 6 Cambridge words, over the 2–5 limit. ' +
      'Moved "tell" out of the gap so the answer becomes "would rather you didn\u2019t" (5 words), ' +
      'keeping RATHER and the "would rather + subject + past simple" structure.',
    patch(generated) {
      const q = generated.questions.find((x) => Number(x.number) === 28);
      const answer = `would rather you didn${APO}t`;
      q.sentence2Start = 'I __________________ tell anyone about this yet.';
      q.answer = answer;
      q.grading_metadata.fullAnswers = [
        answer,
        'would rather you did not',
        `${APO}d rather you didn${APO}t`,
      ];
      q.grading_metadata.markingPoints = [
        { id: 1, label: 'WOULD RATHER + second subject', accepted: ['would rather you', `${APO}d rather you`] },
        { id: 2, label: 'negative past-simple auxiliary', accepted: [`didn${APO}t`, 'did not'] },
      ];
      const modelAnswer = (generated.modelAnswers || []).find((m) => Number(m.number) === 28);
      if (modelAnswer) modelAnswer.answer = answer;
    },
  },
};

const apply = process.argv.includes('--apply');
const slotArg = process.argv.find((a) => a.startsWith('--slot='));
const slots = slotArg ? [Number(slotArg.split('=')[1])] : [1, 2, 3, 4];

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const { saveLevelExamPartFromPreview } = await import('../src/lib/levelsCambridgeExamGenerator.js');

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level, error: levelError } = await admin
  .from('levels')
  .select('id')
  .ilike('nombre', 'b2')
  .single();

if (levelError || !level?.id) {
  console.error('B2 level not found', levelError);
  process.exit(1);
}

const results = [];

for (const slot of slots) {
  const source = PILOT_SOURCES[slot];
  if (!source) {
    console.error(`No pilot source configured for slot ${slot}`);
    process.exit(1);
  }

  console.log(`\n=== Exam ${slot} B2 · ${source.label}`);

  for (const partNumber of [1, 2, 3, 4, 5, 6, 7]) {
    const file = source.parts[partNumber];
    if (!existsSync(file)) {
      console.error(`  Part ${partNumber}: MISSING FILE ${file}`);
      results.push({ slot, part: partNumber, status: 'missing-file' });
      continue;
    }

    const payload = JSON.parse(readFileSync(file, 'utf8'));
    const generated = payload.generated;
    if (!generated) {
      console.error(`  Part ${partNumber}: file has no .generated`);
      results.push({ slot, part: partNumber, status: 'no-generated' });
      continue;
    }

    const repair = PILOT_REPAIRS[`${slot}:${partNumber}`];
    if (repair) {
      repair.patch(generated);
      console.log(`  Part ${partNumber}: repaired — ${repair.reason}`);
    }

    const validation = validateGeneratedExamPart('b2', partNumber, generated);
    const title = generated.title || generated.passageTitle || '';

    if (!validation.ok) {
      console.error(`  Part ${partNumber}: VALIDATION FAILED — ${validation.errors.join(' | ')}`);
      results.push({ slot, part: partNumber, status: 'invalid', errors: validation.errors });
      continue;
    }

    if (!apply) {
      console.log(
        `  Part ${partNumber}: ok · "${title}" · warnings=${validation.warnings.length} · qualityFails=${validation.qualityFails.length}`,
      );
      results.push({ slot, part: partNumber, status: 'would-save' });
      continue;
    }

    try {
      const saved = await saveLevelExamPartFromPreview(admin, {
        levelSlug: 'b2',
        levelId: level.id,
        examSlot: slot,
        partNumber,
        generated,
        skipAudio: true,
        replacePartContent: true,
        overrideNeedsReview: true,
      });
      console.log(`  Part ${partNumber}: saved · "${title}" · pregunta=${saved.preguntaId}`);
      results.push({ slot, part: partNumber, status: 'saved', preguntaId: saved.preguntaId });
    } catch (e) {
      console.error(`  Part ${partNumber}: SAVE FAILED — ${e?.message || e}`);
      results.push({ slot, part: partNumber, status: 'save-error', error: e?.message || String(e) });
    }
  }
}

const bad = results.filter((r) => r.status !== 'saved' && r.status !== 'would-save');
console.log(`\n${apply ? 'Imported' : 'Validated'} ${results.length - bad.length}/${results.length} parts.`);
if (bad.length) {
  console.log('Problems:');
  for (const r of bad) console.log(`  Exam ${r.slot} Part ${r.part}: ${r.status} ${r.errors?.join(' | ') || r.error || ''}`);
  process.exit(1);
}
