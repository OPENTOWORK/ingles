/**
 * Single dry-run: E02 Part 4 with blueprint + metadata normalization pipeline.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvLocal } from './load-env-local.mjs';
import { generatePilotPart4FromBlueprint, getOpenAIClient } from '../src/lib/ruoePilotRegeneration.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  ROOT,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);
const OUT = path.join(PACK, '05_OUTPUTS_REGENERATED_v1_1_2', 'EXAM-02', 'TBP-PILOT-EX02_Part4.json');
const BP_FILE = path.join(
  PACK,
  '02_APPROVED_INPUTS',
  'DRALO_RUOE_Transformation_Blueprints_Pilot_v1_0_APPROVED.json',
);

loadEnvLocal();
const openai = getOpenAIClient();
const bpDoc = JSON.parse(fs.readFileSync(BP_FILE, 'utf8'));
const blueprint = bpDoc.blueprints.find((b) => b.blueprint_id === 'TBP-PILOT-EX02');

console.error('Dry-run E02 Part 4 with metadata normalization…');
const record = await generatePilotPart4FromBlueprint({
  blueprint,
  examSlot: 2,
  openai,
  varietySeed: Date.now(),
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
});

console.log('Mechanical OK:', record.validation.ok);
console.log('HARD:', record.validation.errors);
console.log('HARD count:', record.validation.hard_fail_count);
console.log('QUALITY count:', record.validation.quality_fail_count);
console.log('Repairs:', record.repairs_applied);

if (record.validation.ok && record.validation.errors.length === 0) {
  fs.writeFileSync(OUT, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  console.log(`SUCCESS — written ${OUT}`);
} else {
  const preview = path.join(path.dirname(OUT), 'TBP-PILOT-EX02_Part4.dryrun.json');
  fs.writeFileSync(preview, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  console.log(`FAIL — preview written ${preview}`);
  process.exit(1);
}
