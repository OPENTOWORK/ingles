/**
 * Apply metadata normalization to existing failed E02 Part 4 output.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { validatePart4Quality } from '../src/lib/ruoePart4Quality.js';
import { repairPart4MarkingPoints } from '../src/lib/ruoePart4MarkingPointRepair.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  ROOT,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);
const P4_FILE = path.join(
  PACK,
  '05_OUTPUTS_REGENERATED_v1_1_2',
  'EXAM-02',
  'TBP-PILOT-EX02_Part4.json',
);
const BP_FILE = path.join(
  PACK,
  '02_APPROVED_INPUTS',
  'DRALO_RUOE_Transformation_Blueprints_Pilot_v1_0_APPROVED.json',
);

const record = JSON.parse(fs.readFileSync(P4_FILE, 'utf8'));
const bpDoc = JSON.parse(fs.readFileSync(BP_FILE, 'utf8'));
const blueprint = bpDoc.blueprints.find((b) => b.blueprint_id === 'TBP-PILOT-EX02');

const gen = record.generated;
const repaired = repairPart4MarkingPoints(gen, {
  normalizeMetadata: true,
  blueprintSlots: blueprint.slots,
});

const validation = validateGeneratedExamPart('b2', 4, repaired.gen);
const quality = validatePart4Quality(repaired.gen, blueprint.slots);

console.log('=== Apply normalization to failed E02 Part 4 ===');
console.log('Repairs:', repaired.repairs);
console.log('Mechanical OK:', validation.ok);
console.log('HARD errors:', validation.errors);
console.log('Part4 HARD:', quality.hardFails);
console.log('Part4 QUALITY:', quality.qualityFails?.length);

const out = {
  ...record,
  repairs_applied: [...(record.repairs_applied || []), ...repaired.repairs],
  generated: validation.normalized || repaired.gen,
  validation: {
    ok: validation.ok,
    errors: validation.errors,
    qualityFails: [...(validation.qualityFails || []), ...(quality.qualityFails || [])],
    warnings: [...(validation.warnings || []), ...(quality.warnings || [])],
    hard_fail_count: validation.errors.length + (quality.hardFails?.length || 0),
    quality_fail_count:
      (validation.qualityFails?.length || 0) + (quality.qualityFails?.length || 0),
    warning_count: (validation.warnings?.length || 0) + (quality.warnings?.length || 0),
  },
  normalization_only: true,
  normalized_at: new Date().toISOString(),
};

fs.writeFileSync(`${P4_FILE}.normalized-preview.json`, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`Written preview: ${P4_FILE}.normalized-preview.json`);
