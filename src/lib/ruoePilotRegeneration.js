/**
 * Local pilot regeneration (v1.1.2) — no Supabase, code prompts only.
 */
import OpenAI from 'openai';
import { buildExamGeneratePrompt } from '@/lib/draloAiExamPrompts';
import { resolveDefaultExamPartGenerationPrompt } from '@/lib/examPartGenerationPrompt';
import { getLevelExamLabel, getLevelExamPartDef } from '@/lib/levelsExamCatalog';
import { validateGeneratedExamPart } from '@/lib/examPartValidation';
import { validateRuoeEditorialQuality } from '@/lib/ruoeEditorialQuality';
import { validatePart4Quality } from '@/lib/ruoePart4Quality';
import { generatePartJsonWithRetries } from '@/lib/levelsCambridgeExamGenerator';
import { buildB2EnunciadoFromGenerated } from '@/lib/formatB2Enunciado';
import {
  repairPart3NoTransformItems,
  repairPart5PassageLength,
  repairPart7WordMatchQuestions,
} from '@/lib/ruoeLocalItemRepair';
import {
  repairPart4MarkingPoints,
  repairPart4WithRegeneration,
} from '@/lib/ruoePart4MarkingPointRepair';

const GENERATION_VERSION = 'pilot-regen-v1.1.3-2026-08-19';

const BRITISH_ENGLISH_BLOCK = `
BRITISH ENGLISH (mandatory):
- Think and write in natural British English throughout.
- Before finalising any text, ask: "Would this sound natural to a competent British English speaker?"
- Use British spelling, vocabulary, collocations, and phrasing (B2 level).
- Avoid Americanisms, literal translations, corporate/AI tone, and sentences warped only to force a gap or transformation.
- Natural British English before exercise convenience.
`;

function buildBriefUserPrompt(defaults, brief, styleCardText) {
  const chunks = [defaults.user];
  chunks.push(
    '\n\n=== APPROVED CONTENT BRIEF (mandatory — do not change topic/style allocation) ===\n',
    JSON.stringify(brief, null, 2),
  );
  if (styleCardText) {
    chunks.push('\n\n=== ASSIGNED STYLE CARD ===\n', styleCardText);
  }
  chunks.push(
    '\n\nFollow the brief for editorial direction. Follow the Part prompt for exam mechanics.',
    BRITISH_ENGLISH_BLOCK,
  );
  return chunks.join('');
}

export async function applyRuoeLocalRepairs(partNumber, generated, openai, options = {}) {
  const repairs = [];
  let gen = generated;
  const model = options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (partNumber === 3) {
    const r = await repairPart3NoTransformItems(openai, gen, { model });
    gen = r.repaired;
    repairs.push(...r.repairs);
  }
  if (partNumber === 5) {
    const r = await repairPart5PassageLength(openai, gen, { model });
    gen = r.repaired;
    repairs.push(...r.repairs);
  }
  if (partNumber === 7) {
    const r = await repairPart7WordMatchQuestions(openai, gen, { model });
    gen = r.repaired;
    repairs.push(...r.repairs);
  }
  if (partNumber === 4) {
    let r = repairPart4MarkingPoints(gen, {
      normalizeMetadata: true,
      blueprintSlots: options.blueprintSlots,
    });
    gen = r.gen;
    repairs.push(...r.repairs);
    if (!r.allOk) {
      const r2 = await repairPart4WithRegeneration(openai, gen, {
        model,
        topic: options.topic,
        maxRounds: 3,
        blueprintSlots: options.blueprintSlots,
      });
      gen = r2.gen;
      repairs.push(...r2.repairs);
      const r3 = repairPart4MarkingPoints(gen, {
        normalizeMetadata: true,
        blueprintSlots: options.blueprintSlots,
      });
      gen = r3.gen;
      repairs.push(...r3.repairs);
    }
  }

  return { generated: gen, repairs };
}

export async function collectValidationBundle(partNumber, generated, options = {}) {
  const validation = validateGeneratedExamPart('b2', partNumber, generated);
  const normalized = validation.normalized || generated;
  const editorial =
    partNumber >= 1 && partNumber <= 7
      ? validateRuoeEditorialQuality(partNumber, normalized)
      : { qualityFails: [], warnings: [], findings: [] };
  const part4Quality = partNumber === 4 ? validatePart4Quality(normalized, options?.blueprintSlots) : null;

  const qualityErrors = [];
  const qualityWarnings = [];
  const adversarialFindings = [];
  let partQuality = null;

  if (validation.ok) {
    try {
      if (partNumber === 1 || partNumber === 2) {
        const { validateB2Part1Quality, validateB2Part2Quality } = await import(
          '@/lib/examPartQualityValidator'
        );
        partQuality =
          partNumber === 1
            ? await validateB2Part1Quality(normalized)
            : await validateB2Part2Quality(normalized);
        qualityErrors.push(...(partQuality.errors || []));
        qualityWarnings.push(...(partQuality.warnings || []));
      } else if ([3, 5, 6, 7].includes(partNumber)) {
        const { runRuoeAdversarialQualityReview } = await import('@/lib/ruoeAiAdversarialQuality');
        partQuality = await runRuoeAdversarialQualityReview(partNumber, normalized);
        qualityWarnings.push(...(partQuality.warnings || []));
        if (partQuality.findings?.length) adversarialFindings.push(...partQuality.findings);
      }
    } catch (e) {
      qualityWarnings.push(`Quality validator failed to run: ${e?.message || e}`);
    }
  }

  return {
    normalized,
    validation,
    editorial,
    part4Quality,
    partQuality,
    adversarialFindings,
    hardFails: [
      ...validation.errors,
      ...qualityErrors,
      ...(part4Quality?.hardFails || []),
    ],
    qualityFails: [
      ...(validation.qualityFails || []),
      ...(editorial.qualityFails || []),
      ...(part4Quality?.qualityFails || []),
      ...(partQuality?.qualityFails || []),
    ],
    warnings: [
      ...(validation.warnings || []),
      ...(editorial.warnings || []),
      ...(part4Quality?.warnings || []),
      ...(qualityWarnings || []),
    ],
  };
}

export function buildPilotOutputRecord({
  brief,
  blueprint,
  partNumber,
  partLabel,
  generated,
  bundle,
  repairs,
  attemptMeta = {},
  packVersion = '1.1.2-regenerated',
  generationVersion = GENERATION_VERSION,
}) {
  return {
    pack_version: packVersion,
    generation_version: generationVersion,
    generated_at: new Date().toISOString(),
    phase: partNumber === 4 ? 'B-regen' : 'A-regen',
    exam_id: brief?.exam_id || blueprint?.ruoe_exam_id,
    ruoe_exam_id: brief?.exam_id || blueprint?.ruoe_exam_id,
    part: partLabel || `Part ${partNumber}`,
    part_number: partNumber,
    brief_id: brief?.brief_id || null,
    brief_version: brief?.brief_version || null,
    blueprint_id: blueprint?.blueprint_id || null,
    style_card_id: brief?.style_card_id || null,
    working_title: brief?.working_title || null,
    repairs_applied: repairs || [],
    validation: {
      ok: bundle.validation.ok,
      errors: bundle.validation.errors,
      qualityFails: bundle.qualityFails,
      warnings: bundle.warnings,
      hard_fail_count: bundle.validation.errors.length,
      blocking_hard_count: bundle.validation.errors.length,
      quality_review_hard_count: bundle.partQuality?.errors?.length ?? 0,
      quality_review_hard_findings: bundle.partQuality?.errors ?? [],
      quality_fail_count: bundle.qualityFails.length,
      warning_count: bundle.warnings.length,
    },
    part4_quality_metrics: bundle.part4Quality?.metrics || null,
    editorial_findings: bundle.editorial?.findings || [],
    part4_findings: bundle.part4Quality?.findings || [],
    adversarial_findings: bundle.adversarialFindings || [],
    part_quality: bundle.partQuality || null,
    generated: bundle.normalized,
    enunciado_preview: buildB2EnunciadoFromGenerated(bundle.normalized, partNumber),
    human_review_required: true,
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
    ...attemptMeta,
  };
}

export async function generatePilotPartFromBrief({
  brief,
  styleCardText,
  examSlot,
  openai,
  varietySeed,
  model,
}) {
  const partNumber = Number(brief.part?.replace(/\D/g, '') || brief.part_number);
  const defaults = resolveDefaultExamPartGenerationPrompt({
    levelSlug: 'b2',
    partNumber,
    examSlot,
    topic: brief.working_title,
    varietySeed,
  });
  const userPrompt = buildBriefUserPrompt(defaults, brief, styleCardText);
  const partDef = getLevelExamPartDef('b2', partNumber);
  const levelLabel = getLevelExamLabel('b2');

  const { generated: raw, validation: initial } = await generatePartJsonWithRetries(
    'b2',
    levelLabel,
    partDef,
    {
      examSlot,
      topic: brief.working_title,
      varietySeed,
      userPrompt,
      systemPrompt: defaults.system,
    },
  );

  const repairResult = await applyRuoeLocalRepairs(partNumber, raw, openai, {
    model,
    topic: brief.working_title,
  });

  const bundle = await collectValidationBundle(partNumber, repairResult.generated, {
    blueprintSlots: partNumber === 4 ? options?.blueprintSlots : undefined,
  });

  return buildPilotOutputRecord({
    brief,
    partNumber,
    partLabel: brief.part,
    generated: repairResult.generated,
    bundle,
    repairs: repairResult.repairs,
    attemptMeta: { initial_validation_ok: initial.ok },
  });
}

export async function generatePilotPart4FromBlueprint({
  blueprint,
  examSlot,
  openai,
  varietySeed,
  model,
}) {
  const ruoeExamId = blueprint.exam_id === 'PILOT-EXAM-01' ? 'RUOE-PILOT-E01' : 'RUOE-PILOT-E02';
  const userPrompt =
    buildExamGeneratePrompt('use-of-english', 'key-word', 'B2', {
      topic: blueprint.slots?.[0]?.semantic_equivalence_goal || 'B2 transformations',
      varietySeed,
      partNumber: 4,
      questionCount: 6,
    }) +
    '\n\n=== APPROVED TRANSFORMATION BLUEPRINT (mandatory slot allocation) ===\n' +
    JSON.stringify(
      {
        blueprint_id: blueprint.blueprint_id,
        exam_id: blueprint.exam_id,
        slots: blueprint.slots,
        policy: 'Keep family_id, keyword, target_structure, difficulty_band per slot. Generate NEW sentences and answers. Each scored slot MUST use its exact blueprint keyword — never duplicate a keyword across Q25–30.',
      },
      null,
      2,
    );

  const systemPrompt =
    'Output only valid JSON for one complete B2 Reading and Use of English Part 4 (key word transformations). Exactly 6 scored questions numbered 25–30 plus example 0. Every scored item MUST include grading_metadata with type b2_key_word_transformation, version 1, fullAnswers, and exactly 2 markingPoints that PARTITION the fullAnswer in order.' +
    BRITISH_ENGLISH_BLOCK +
    ' Naturalness before transformation convenience.';

  const partDef = getLevelExamPartDef('b2', 4);
  const levelLabel = getLevelExamLabel('b2');

  const { generated: raw, validation: initial } = await generatePartJsonWithRetries(
    'b2',
    levelLabel,
    partDef,
    {
      examSlot,
      topic: ruoeExamId,
      varietySeed,
      userPrompt,
      systemPrompt,
    },
  );

  const repairResult = await applyRuoeLocalRepairs(4, raw, openai, {
    model,
    topic: ruoeExamId,
    blueprintSlots: blueprint.slots,
  });

  const bundle = await collectValidationBundle(4, repairResult.generated, {
    blueprintSlots: blueprint.slots,
  });

  return buildPilotOutputRecord({
    blueprint: { ...blueprint, ruoe_exam_id: ruoeExamId },
    partNumber: 4,
    partLabel: 'Part 4',
    generated: repairResult.generated,
    bundle,
    repairs: repairResult.repairs,
    attemptMeta: { initial_validation_ok: initial.ok },
  });
}

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for pilot regeneration');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
