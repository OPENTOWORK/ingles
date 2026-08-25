/**
 * Post-process dry-run JSON with v1.1.1 validation layers.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/analyze-ruoe-dryrun.mjs <path-to-json> [partNumber]
 */
import fs from 'node:fs';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { validateRuoeEditorialQuality } from '../src/lib/ruoeEditorialQuality.js';
import { validatePart6HardRules } from '../src/lib/ruoePart6HardValidators.js';

const file = process.argv[2];
const partNumber = Number(process.argv[3] || 0);
if (!file || !fs.existsSync(file)) {
  console.error('Usage: analyze-ruoe-dryrun.mjs <json> [partNumber]');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const gen = raw.generated || raw;
const pn = partNumber || Number(gen.partNumber) || inferPart(raw);

function inferPart(report) {
  if (report.promptSnippet?.mentionsQ37to42) return 6;
  if (report.promptSnippet?.mentionsQ1to8) return 1;
  return 0;
}

const validation = validateGeneratedExamPart('b2', pn, gen);
const editorial = validateRuoeEditorialQuality(pn, validation.normalized || gen, {
  contentBriefWorkingTitle: gen.contentBriefWorkingTitle || gen.workingTitle,
  styleCardId: gen.styleCardId,
});

const part6 =
  pn === 6 ? validatePart6HardRules(validation.normalized || gen) : null;

const summary = {
  partNumber: pn,
  file,
  validationOk: validation.ok,
  hardErrors: validation.errors,
  qualityFails: validation.qualityFails || [],
  warnings: validation.warnings,
  editorial: {
    hardFails: editorial.hardFails,
    qualityFails: editorial.qualityFails,
    warnings: editorial.warnings,
    findingsCount: editorial.findings?.length || 0,
  },
  part6Hard: part6
    ? {
        hardFails: part6.hardFails,
        qualityFails: part6.qualityFails,
        warnings: part6.warnings,
      }
    : null,
  titlePatternFamily: validation.normalized?.titlePatternFamily || gen.titlePatternFamily,
};

console.log(JSON.stringify(summary, null, 2));
