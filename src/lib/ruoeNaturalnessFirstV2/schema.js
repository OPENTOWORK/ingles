import { z } from 'zod';

const envelopeSchema = z.object({
  stage: z.string().min(1),
  status: z.enum(['PASS', 'PIPELINE_FAIL', 'QUALITY_FAIL', 'HARD_FAIL']),
  data: z.unknown(),
  issues: z.array(z.string()),
  repairable: z.boolean(),
  attempts: z.array(z.object({
    kind: z.enum(['initial', 'schema-repair']),
    raw: z.unknown(),
    issues: z.array(z.string()),
    valid: z.boolean(),
  })).optional(),
});

const passageSchema = z.object({
  passage: z.string().min(1),
}).passthrough();

const optionSchema = z.object({
  option: z.string().optional(),
  letter: z.string().optional(),
  grammatical: z.boolean(),
  naturalBritishEnglish: z.boolean(),
  semanticallyDefensible: z.boolean(),
  collocationallyValid: z.boolean().optional(),
  collocationalFit: z.boolean().optional(),
  contextuallyDefensible: z.boolean().optional(),
  reason: z.string().min(1),
}).passthrough().refine(
  (row) => Boolean(row.option || row.letter),
  { message: 'Each option needs a label.' },
).refine(
  (row) => typeof row.collocationallyValid === 'boolean' || typeof row.collocationalFit === 'boolean',
  { message: 'Each option needs collocationallyValid.' },
);

const substitutionSchema = z.object({
  items: z.array(z.object({
    number: z.number().optional(),
    options: z.array(optionSchema).length(4),
  }).passthrough()).min(1),
}).passthrough();

const gapsSchema = z.object({
  gaps: z.array(z.object({
    number: z.number().optional(),
    gap: z.number().optional(),
    word: z.string().optional(),
    keyedWord: z.string().optional(),
    intendedAnswer: z.string().optional(),
  }).passthrough()),
}).passthrough();

const part3ItemsSchema = z.object({
  items: z.array(z.object({
    stem: z.string().min(1),
    answer: z.string().min(1),
    lexicalFamilyValidation: z.object({
      sameLexicalFamily: z.boolean(),
      extraLexicalRootIntroduced: z.boolean(),
      directDerivation: z.boolean(),
      legitimateBase: z.boolean(),
      reason: z.string().min(1),
    }),
  }).passthrough()).min(1),
}).passthrough();

const part4PairSchema = z.object({
  sentence1: z.string().optional(),
  s1: z.string().optional(),
  keyword: z.string().optional(),
  answer: z.string().optional(),
  sentence2: z.string().optional(),
  completedS2: z.string().optional(),
  pair: z.object({ answer: z.string().optional() }).passthrough().optional(),
  replacement: z.unknown().optional(),
}).passthrough();

const semanticSchema = z.object({
  propositionsPreserved: z.boolean(),
  agencyPreserved: z.boolean(),
  referencePreserved: z.boolean(),
  tenseAspectPreserved: z.boolean(),
  modalityPreserved: z.boolean(),
  comparisonScopePreserved: z.boolean(),
  informationLost: z.boolean(),
  informationAdded: z.boolean(),
}).passthrough();

const naturalnessSchema = z.object({
  natural: z.boolean(),
}).passthrough();

const STAGE_SCHEMAS = {
  passage: passageSchema,
  prose: passageSchema,
  positions: z.object({ candidates: z.array(z.unknown()) }).passthrough(),
  keys: z.object({ items: z.array(z.unknown()) }).passthrough(),
  distractors: z.object({ items: z.array(z.unknown()) }).passthrough(),
  'independent-substitution': substitutionSchema,
  'gap-discovery': z.object({ sites: z.array(z.unknown()) }).passthrough(),
  'gap-discovery-2': z.object({ sites: z.array(z.unknown()) }).passthrough(),
  'select-eight': gapsSchema,
  uniqueness: gapsSchema,
  'family-discovery': z.object({ words: z.array(z.unknown()) }).passthrough(),
  'base-assignment': part3ItemsSchema,
  'derivation-check': part3ItemsSchema,
  'family-candidate': z.object({ familyId: z.string().min(1), keyword: z.string().min(1) }).passthrough(),
  'sentence-pair': part4PairSchema,
  semantic: semanticSchema,
  naturalness: naturalnessSchema,
  'schema-repair': z.unknown(),
  'repair-distractor': z.unknown(),
  'repair-sentence': z.unknown(),
  'regenerate-item': z.unknown(),
  'move-gap': z.unknown(),
  'rewrite-passage': z.unknown(),
  'new-position': z.unknown(),
  'replace-family': part4PairSchema,
  'blind-solve': z.unknown(),
  adversary: z.unknown(),
};

const STAGE_CONTRACTS = {
  'independent-substitution': '{"items":[{"number":1,"options":[{"option":"A","grammatical":true,"naturalBritishEnglish":true,"semanticallyDefensible":true,"collocationallyValid":true,"reason":"..."}]}]} — exactly one item per call and exactly A, B, C, D',
  'gap-discovery': '{"sites":[...]}',
  'gap-discovery-2': '{"sites":[...]}',
  'select-eight': '{"gaps":[{"number":9,"word":"oneword","family":"...","sentence":"..."}]}',
  uniqueness: '{"gaps":[{"number":9,"intendedAnswer":"...","intendedAnswerValid":true,"alternativeSearchPerformed":true,"plausibleAlternatives":[],"uniquenessJustification":"...","confidence":0.9}]}',
  'base-assignment': '{"items":[{"stem":"...","answer":"...","lexicalFamilyValidation":{"sameLexicalFamily":true,"extraLexicalRootIntroduced":false,"directDerivation":true,"legitimateBase":true,"reason":"..."}}]}',
  'derivation-check': '{"items":[{"stem":"...","answer":"...","lexicalFamilyValidation":{"sameLexicalFamily":true,"extraLexicalRootIntroduced":false,"directDerivation":true,"legitimateBase":true,"reason":"..."}}]}',
  semantic: '{"propositionsPreserved":true,"agencyPreserved":true,"referencePreserved":true,"tenseAspectPreserved":true,"modalityPreserved":true,"comparisonScopePreserved":true,"informationLost":false,"informationAdded":false}',
  naturalness: '{"natural":true}',
};

export function describeStageContract(stage) {
  return STAGE_CONTRACTS[stage] || `Return the documented JSON object for stage "${stage}".`;
}

export function unwrapModelJson(raw) {
  if (raw && typeof raw === 'object' && raw.data && typeof raw.data === 'object' && raw.stage && raw.status) {
    return raw.data;
  }
  return raw;
}

export function validateStagePayload(stage, raw) {
  const data = unwrapModelJson(raw);
  const schema = STAGE_SCHEMAS[stage];
  if (!schema) {
    return { ok: false, data: null, issues: [`No schema is registered for stage ${stage}.`], repairable: false };
  }
  if (schema === z.unknown() || stage === 'schema-repair') {
    return { ok: data !== undefined && data !== null, data, issues: data == null ? ['Empty stage payload.'] : [], repairable: true };
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      data: null,
      issues: parsed.error.issues.map((issue) => `${issue.path.join('.') || stage}: ${issue.message}`),
      repairable: true,
    };
  }
  return { ok: true, data: parsed.data, issues: [], repairable: false };
}

export function stageEnvelope(stage, validation, attempts = []) {
  const parsed = envelopeSchema.parse({
    stage,
    status: validation.ok ? 'PASS' : 'PIPELINE_FAIL',
    data: validation.data ?? {},
    issues: validation.issues || [],
    repairable: Boolean(validation.repairable),
    attempts,
  });
  return parsed;
}
