/** Patch E02 P1/P2 JSON validation reporting fields (no regeneration). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACK = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  '05_OUTPUTS_REGENERATED_v1_1_2',
  'EXAM-02',
);

const files = ['CB-PILOT-007_Part1.json', 'CB-PILOT-008_Part2.json'];

for (const f of files) {
  const p = path.join(PACK, f);
  const record = JSON.parse(fs.readFileSync(p, 'utf8'));
  const blocking = record.validation?.errors?.length ?? 0;
  const qReview = record.part_quality?.errors ?? [];
  record.validation = {
    ...record.validation,
    hard_fail_count: blocking,
    blocking_hard_count: blocking,
    quality_review_hard_count: qReview.length,
    quality_review_hard_findings: qReview,
  };
  fs.writeFileSync(p, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  console.log(`Patched ${f}: blocking HARD=${blocking}, quality-review HARD=${qReview.length}`);
}
