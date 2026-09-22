import { countCambridgeKeyWordWords } from '@/lib/countCambridgeKeyWordWords';
import { NATURALNESS_CONTRACT, resolveRuoeGenerationVersion, RUOE_GENERATION_VERSION_V2 } from './contract.js';
import {
  adversarialResult,
  judgePart1Substitutions,
  judgePart2Gap,
  judgePart2Structure,
  judgePart3Derivation,
  judgePart4Item,
} from './judgements.js';
import {
  combineLayerVerdicts,
  compareBlindSolve,
  createRepairBudget,
  spendRepair,
  spendSchemaRepair,
  toBlindView,
} from './layers.js';
import { canonicalisePart4Item } from './part4Canonical.js';
import {
  nextPart1Repair,
  nextPart2Repair,
  nextPart3Repair,
  nextPart4Repair,
} from './repair.js';
import {
  PART1_STAGES,
  PART2_STAGES,
  PART3_STAGES,
  PART4_STAGES,
  adversaryPrompt,
  blindSolvePrompt,
  part1StagePrompt,
  part2StagePrompt,
  part3StagePrompt,
  part4StagePrompt,
  repairPrompt,
} from './prompts.js';
import { describeStageContract, stageEnvelope, validateStagePayload } from './schema.js';
import { assessPart1Variety } from './variety.js';

export { PART1_STAGES, PART2_STAGES, PART3_STAGES, PART4_STAGES };

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

const STAGE_SYSTEM = `${NATURALNESS_CONTRACT}\nReturn json.`;

function groundedPrompt(instruction, prior) {
  return `${instruction}

Use only the material in PREVIOUS STAGES. Do not invent a new topic.
Do not copy placeholders such as "...", "WORD", "TF-00", or "DECIDE".
If PREVIOUS STAGES is empty, this is the first stage and you should write the text now.

PREVIOUS STAGES:
${JSON.stringify(prior)}`;
}

function schemaRepairPrompt(stage, issues, raw) {
  return `The JSON for stage "${stage}" failed schema validation: ${issues.join('; ')}.
Return one corrected JSON object for that stage only.
This is structure repair only: preserve every linguistic judgement and boolean value already returned.
Do not reconsider whether the item is good, do not change an answer, and do not add a new rationale.
Do not omit required fields and do not wrap them in narrative.

EXPECTED STRUCTURE:
${describeStageContract(stage)}

MALFORMED JSON TO RESTRUCTURE:
${JSON.stringify(raw)}`;
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function completePart1Sentence(sentence, key, word) {
  const source = String(sentence || '');
  const replacement = String(word || '');
  if (!source || !replacement) return '';
  if (/_{3,}/.test(source)) return source.replace(/_{3,}/, replacement);
  const keyText = String(key || '');
  if (!keyText) return '';
  const expression = new RegExp(`\\b${escapeRegExp(keyText)}\\b`, 'i');
  if (!expression.test(source)) return '';
  return source.replace(expression, replacement);
}

export function buildPart1CompletedOptions(keysOutput, distractorsOutput) {
  const keys = asArray(keysOutput?.items);
  const distractors = asArray(distractorsOutput?.items);
  const issues = [];
  const items = keys.map((keyItem) => {
    const distractorItem = distractors.find((row) => row.number === keyItem.number) || {};
    const options = asArray(distractorItem.options).map((option) => {
      const sentence = completePart1Sentence(keyItem.sentence, keyItem.key, option.word);
      if (!sentence) issues.push(`Item ${keyItem.number} option ${option.letter || option.option || '?'} could not be inserted deterministically.`);
      return {
        option: String(option.option || option.letter || '').toUpperCase(),
        word: option.word,
        isKey: Boolean(option.isKey),
        completedSentence: sentence,
      };
    });
    if (options.length !== 4) issues.push(`Item ${keyItem.number} has ${options.length} options instead of four.`);
    return { number: keyItem.number, options };
  });
  return { ok: issues.length === 0, items, issues };
}

export function normalisePart1Distractors(keysOutput, distractorsOutput) {
  const keys = asArray(keysOutput?.items);
  const source = asArray(distractorsOutput?.items);
  const issues = [];
  const usedIndexes = new Set();
  const items = keys.map((keyItem) => {
    const matchesKey = (row) => asArray(row?.options).some(
      (option) => option?.isKey === true
        && String(option.word || '').toLowerCase() === String(keyItem.key || '').toLowerCase(),
    );
    const exactIndexes = source
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row, rowIndex }) => !usedIndexes.has(rowIndex)
        && row.number === keyItem.number
        && matchesKey(row))
      .map(({ rowIndex }) => rowIndex);
    const fallbackIndexes = source
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row, rowIndex }) => !usedIndexes.has(rowIndex) && matchesKey(row))
      .map(({ rowIndex }) => rowIndex);
    const candidates = exactIndexes.length ? exactIndexes : fallbackIndexes;
    if (candidates.length > 1) {
      issues.push(`More than one distractor item contains key "${keyItem.key}" for question ${keyItem.number}.`);
      return { number: keyItem.number, options: [] };
    }
    const index = candidates[0] ?? -1;
    if (index === -1) {
      issues.push(`No distractor item contains key "${keyItem.key}" for question ${keyItem.number}.`);
      return { number: keyItem.number, options: [] };
    }
    usedIndexes.add(index);
    const options = asArray(source[index].options);
    if (options.length !== 4) {
      issues.push(`Question ${keyItem.number} has ${options.length} options instead of four.`);
    }
    return { number: keyItem.number, options };
  });
  return {
    ok: issues.length === 0,
    data: { items },
    issues,
    ignoredSourceItems: source
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => !usedIndexes.has(index))
      .map(({ item }) => item.number),
  };
}

async function completeStage({ complete, stage, user, trace, repairs, budget }) {
  trace.push(stage);
  let raw = await complete({
    stage,
    role: 'generator',
    system: STAGE_SYSTEM,
    user,
  });
  let validation = validateStagePayload(stage, raw);
  const attempts = [{
    kind: 'initial',
    raw,
    issues: validation.issues || [],
    valid: validation.ok,
  }];
  if (!validation.ok && validation.repairable && spendSchemaRepair(budget, stage)) {
    trace.push('schema-repair');
    repairs.push({ action: 'schema-repair', scope: stage, instruction: 'Correct the JSON shape once.' });
    raw = await complete({
      stage: 'schema-repair',
      role: 'generator',
      system: STAGE_SYSTEM,
      user: schemaRepairPrompt(stage, validation.issues, raw),
    });
    validation = validateStagePayload(stage, raw);
    attempts.push({
      kind: 'schema-repair',
      raw,
      issues: validation.issues || [],
      valid: validation.ok,
    });
  }
  return { validation, envelope: stageEnvelope(stage, validation, attempts) };
}

async function runStages(complete, stages, promptFor, brief, trace, repairs, budget) {
  const outputs = {};
  const records = [];
  for (const stage of stages) {
    if (stage === 'mechanical' || stage === 'naturalness') continue;
    if (stage === 'independent-substitution') {
      outputs['completed-options'] = buildPart1CompletedOptions(outputs.keys, outputs.distractors);
      if (!outputs['completed-options'].ok) {
        const validation = {
          ok: false,
          data: null,
          issues: outputs['completed-options'].issues,
          repairable: false,
        };
        records.push(stageEnvelope(stage, validation));
        return { outputs, records, schemaFail: validation };
      }
    }
    const step = await completeStage({
      complete,
      stage,
      user: groundedPrompt(promptFor(stage, brief), outputs),
      trace,
      repairs,
      budget,
    });
    records.push(step.envelope);
    if (!step.validation.ok) {
      return { outputs, records, schemaFail: step.validation };
    }
    outputs[stage] = step.validation.data;
  }
  return { outputs, records, schemaFail: null };
}

function schemaFailResult(partNumber, trace, repairs, schemaFail, records) {
  return {
    version: RUOE_GENERATION_VERSION_V2,
    partNumber,
    trace,
    repairs,
    stageRecords: records,
    adversarial: adversarialResult({
      verdict: 'PIPELINE_FAIL',
      reason: `Stage output failed pipeline validation (${schemaFail.issues.join('; ')}).`,
      repairRecommendation: 'The schema repair budget is spent. The item stays failed.',
      confidence: 'high',
    }),
    answerKey: [],
  };
}

function worstVerdict(results) {
  if (results.some((row) => row.judgement?.verdict === 'PIPELINE_FAIL' || row.verdict === 'PIPELINE_FAIL')) return 'PIPELINE_FAIL';
  if (results.some((row) => row.judgement?.verdict === 'HARD_FAIL' || row.verdict === 'HARD_FAIL')) return 'HARD_FAIL';
  if (results.some((row) => row.judgement?.verdict === 'QUALITY_FAIL' || row.verdict === 'QUALITY_FAIL')) return 'QUALITY_FAIL';
  return 'PASS';
}

const SEMANTIC_FLAGS = [
  'propositionsPreserved',
  'agencyPreserved',
  'referencePreserved',
  'tenseAspectPreserved',
  'modalityPreserved',
  'comparisonScopePreserved',
  'informationLost',
  'informationAdded',
];

function readSemantic(semantic, naturalness) {
  const missing = SEMANTIC_FLAGS.filter((flag) => typeof semantic?.[flag] !== 'boolean');
  const natural = typeof naturalness?.natural === 'boolean'
    ? naturalness.natural
    : typeof semantic?.natural === 'boolean'
      ? semantic.natural
      : null;
  if (missing.length || natural === null) {
    return { ok: false, missing, natural };
  }
  return { ok: true, values: { ...semantic, natural } };
}

async function finalize(result, { partNumber, blindSolve, adversary, blindMaterial, stored }) {
  const mechanical = result.adversarial?.verdict || 'PASS';
  if (mechanical === 'PIPELINE_FAIL' || mechanical === 'HARD_FAIL') {
    result.layers = {
      mechanical,
      selfCheck: 'generator-trace',
      blind: { status: 'SKIPPED', verdict: null, reason: `Skipped because deterministic validation returned ${mechanical}.` },
      adversary: { status: 'SKIPPED', verdict: null, reason: `Skipped because deterministic validation returned ${mechanical}.` },
    };
    result.finalVerdict = mechanical;
    return result;
  }
  const materialUnits = partNumber === 1
    ? asArray(blindMaterial?.items).map((item) => ({ ...blindMaterial, items: [item] }))
    : partNumber === 2
      ? asArray(blindMaterial?.gaps).map((gap) => ({ ...blindMaterial, gaps: [gap] }))
      : partNumber === 3
        ? asArray(blindMaterial?.items).map((item) => ({ ...blindMaterial, items: [item] }))
        : [blindMaterial];
  const storedUnits = Array.isArray(stored) ? stored : materialUnits.map(() => stored);
  const blindItems = [];
  const adversaryItems = [];
  for (let index = 0; index < materialUnits.length; index += 1) {
    const unit = materialUnits[index];
    const blindRaw = blindSolve
      ? await blindSolve({
        stage: 'blind-solve',
        role: 'blind-solver',
        partNumber,
        system: STAGE_SYSTEM,
        user: blindSolvePrompt(partNumber, toBlindView(partNumber, unit)),
      })
      : null;
    const blindShapeOk = !blindRaw || (
      partNumber === 1
        ? Array.isArray(blindRaw.defensibleOptions || blindRaw.options)
        : partNumber === 2
          ? typeof blindRaw.alternativeSearchPerformed === 'boolean'
            && Array.isArray(blindRaw.plausibleAlternatives || blindRaw.alternatives)
            && typeof (blindRaw.answer || blindRaw.intendedAnswer) === 'string'
          : typeof (blindRaw.answer || blindRaw.word) === 'string'
    );
    blindItems.push(!blindSolve
      ? { status: 'UNCONFIGURED', verdict: null, reason: 'No blind solver was injected.' }
      : !blindShapeOk
        ? { status: 'DONE', verdict: 'PIPELINE_FAIL', reason: 'Blind-solver output was malformed or omitted required fields.' }
        : compareBlindSolve(partNumber, storedUnits[index] || {}, blindRaw));

    const adversaryRaw = adversary
      ? await adversary({
        stage: 'adversary',
        role: 'adversary',
        partNumber,
        system: STAGE_SYSTEM,
        user: adversaryPrompt(partNumber, toBlindView(partNumber, unit)),
      })
      : null;
    const adversaryShapeOk = adversaryRaw
      && ['PASS', 'PIPELINE_FAIL', 'QUALITY_FAIL', 'HARD_FAIL'].includes(adversaryRaw.verdict)
      && typeof adversaryRaw.reason === 'string'
      && adversaryRaw.reason.trim();
    adversaryItems.push(adversaryRaw
      ? adversaryShapeOk
        ? { status: 'DONE', verdict: adversaryRaw.verdict, reason: adversaryRaw.reason, candidateAlternative: adversaryRaw.candidateAlternative || null }
        : { status: 'DONE', verdict: 'PIPELINE_FAIL', reason: 'Adversarial-judge output was malformed or omitted verdict/reason.' }
      : { status: 'UNCONFIGURED', verdict: null, reason: 'No independent adversary was injected.' });
  }
  const summariseLayer = (items, unconfiguredReason) => {
    if (!items.length) return { status: 'UNCONFIGURED', verdict: null, reason: unconfiguredReason, items: [] };
    const verdict = worstVerdict(items);
    const configured = items.some((item) => item.status !== 'UNCONFIGURED');
    return {
      status: configured ? 'DONE' : 'UNCONFIGURED',
      verdict: configured ? verdict : null,
      reason: items.map((item) => item.reason).filter(Boolean).join(' '),
      items,
    };
  };
  const blind = summariseLayer(blindItems, 'No blind solver was injected.');
  const adversaryLayer = summariseLayer(adversaryItems, 'No independent adversary was injected.');
  const finalVerdict = combineLayerVerdicts({ mechanical, blind, adversary: adversaryLayer });
  result.layers = {
    mechanical,
    selfCheck: 'generator-trace',
    blind,
    adversary: adversaryLayer,
  };
  result.finalVerdict = finalVerdict;
  if (finalVerdict !== mechanical) {
    result.adversarial = {
      ...result.adversarial,
      verdict: finalVerdict,
      reason: [result.adversarial?.reason, blind.reason, adversaryLayer.reason].filter(Boolean).join(' '),
    };
  }
  return result;
}

function part1Adversarial(substitution) {
  const items = asArray(substitution?.items);
  const results = items.map((item) => ({
    number: item?.number,
    judgement: judgePart1Substitutions(item?.options),
  }));
  return {
    verdict: worstVerdict(results),
    items: results,
  };
}

export async function generatePart1NaturalnessFirst({ complete, brief, blindSolve, adversary }) {
  const trace = [];
  const repairs = [];
  const budget = createRepairBudget();
  const staged = await runStages(
    complete,
    PART1_STAGES.filter((stage) => stage !== 'independent-substitution'),
    part1StagePrompt,
    brief,
    trace,
    repairs,
    budget,
  );
  if (staged.schemaFail) return schemaFailResult(1, trace, repairs, staged.schemaFail, staged.records);
  const outputs = staged.outputs;
  const keys = asArray(outputs.keys?.items);
  const keyNumbers = keys.map((item) => item.number);
  if (
    keys.length !== 8
    || new Set(keyNumbers).size !== 8
    || [1, 2, 3, 4, 5, 6, 7, 8].some((number) => !keyNumbers.includes(number))
  ) {
    const result = {
      version: RUOE_GENERATION_VERSION_V2,
      partNumber: 1,
      trace,
      outputs,
      stageRecords: staged.records,
      variety: assessPart1Variety(keys),
      adversarial: adversarialResult({
        verdict: 'HARD_FAIL',
        reason: `Part 1 must contain exactly questions 1–8 (got ${keyNumbers.join(', ') || 'none'}).`,
        repairRecommendation: 'Regenerate only the missing item from the existing passage.',
        confidence: 'high',
      }),
      repairs,
      answerKey: keys.map((item) => ({ number: item.number, answer: item.key })),
    };
    return finalize(result, {
      partNumber: 1,
      blindSolve,
      adversary,
      blindMaterial: {},
      stored: {},
    });
  }
  const normalised = normalisePart1Distractors(outputs.keys, outputs.distractors);
  if (!normalised.ok) {
    return schemaFailResult(
      1,
      trace,
      repairs,
      { issues: normalised.issues, repairable: false },
      staged.records,
    );
  }
  outputs.distractors = normalised.data;
  outputs.distractorNormalisation = { ignoredSourceItems: normalised.ignoredSourceItems };
  const completed = buildPart1CompletedOptions(outputs.keys, outputs.distractors);
  if (!completed.ok) {
    return schemaFailResult(
      1,
      trace,
      repairs,
      { issues: completed.issues, repairable: false },
      staged.records,
    );
  }
  outputs['completed-options'] = completed;
  const judgedItems = [];
  const judgementRecords = [];
  for (const item of completed.items) {
    const step = await completeStage({
      complete,
      stage: 'independent-substitution',
      user: groundedPrompt(
        `${part1StagePrompt('independent-substitution', brief)}

Judge this one item only. Return exactly one item with number ${item.number} and exactly four judgement objects.
Use the completedSentence values verbatim. Do not return option words as strings.

ITEM:
${JSON.stringify(item)}`,
        { passage: outputs.passage },
      ),
      trace,
      repairs,
      budget,
    });
    judgementRecords.push(step.envelope);
    if (!step.validation.ok) {
      return schemaFailResult(
        1,
        trace,
        repairs,
        step.validation,
        [...staged.records, ...judgementRecords],
      );
    }
    const returned = asArray(step.validation.data.items);
    if (returned.length !== 1 || returned[0].number !== item.number) {
      return schemaFailResult(
        1,
        trace,
        repairs,
        {
          issues: [`Judge handover lost item ${item.number} or changed its number.`],
          repairable: false,
        },
        [...staged.records, ...judgementRecords],
      );
    }
    judgedItems.push(returned[0]);
  }
  outputs['independent-substitution'] = { items: judgedItems };
  let adversarial = part1Adversarial(outputs['independent-substitution']);
  const variety = assessPart1Variety(outputs.keys?.items || outputs.positions?.candidates || []);
  let repairState = { distractorsRepaired: false, sentenceRepaired: false };

  while (adversarial.verdict !== 'PASS' && spendRepair(budget, 'linguistic')) {
    const step = nextPart1Repair(repairState);
    repairs.push(step);
    trace.push(step.action);
    const repaired = await complete({
      stage: step.action,
      role: 'generator',
      system: STAGE_SYSTEM,
      user: `${repairPrompt(step)}\n\nFailed substitution:\n${JSON.stringify(outputs['independent-substitution'])}`,
    });
    if (step.action === 'repair-distractor') repairState = { distractorsRepaired: true, sentenceRepaired: false };
    if (step.action === 'repair-sentence') repairState = { ...repairState, sentenceRepaired: true };
    const repairedOptions = repaired?.options || repaired?.items?.[0]?.options;
    if (Array.isArray(repairedOptions)) {
      const again = judgePart1Substitutions(repairedOptions);
      adversarial = { verdict: again.verdict, items: [{ number: repaired.number, judgement: again }] };
    }
  }

  const storedLetters = asArray(outputs.distractors?.items).map((item) => ({
    letter: asArray(item.options).find((option) => option.isKey)?.letter
      || asArray(item.options).find((option) => option.isKey)?.option
      || null,
  }));
  return finalize({
    version: RUOE_GENERATION_VERSION_V2,
    partNumber: 1,
    trace,
    outputs,
    stageRecords: [...staged.records, ...judgementRecords],
    variety,
    adversarial,
    repairs,
    answerKey: asArray(outputs.keys?.items).map((item) => ({ number: item.number, answer: item.key })),
  }, {
    partNumber: 1,
    blindSolve,
    adversary,
    blindMaterial: {
      passage: outputs.passage?.passage || '',
      items: completed.items,
    },
    stored: storedLetters,
  });
}

const FUNCTION_FAMILY = /preposition|auxiliar|article|determiner|pronoun|relative|linker|conjunction|particle|comparison|verb-pattern|frame/i;

function buildPart2BlindGap(gap) {
  const word = String(gap?.word || gap?.intendedAnswer || '');
  const sentence = String(gap?.sentence || '');
  const expression = word ? new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i') : null;
  return {
    ...gap,
    sentence: expression && expression.test(sentence)
      ? sentence.replace(expression, '__________')
      : sentence,
  };
}

function judgeSelectedGaps(passage, selected, uniquenessGaps) {
  const structure = judgePart2Structure(selected);
  if (structure.verdict !== 'PASS') return { structure, items: [] };
  const items = selected.map((gap) => {
    const word = String(gap.word || gap.intendedAnswer || gap.keyedWord || '');
    const uniqueness = uniquenessGaps.find((row) => Number(row.number ?? row.gap) === Number(gap.number ?? gap.gap)) || {};
    const inProse = word && passage.toLowerCase().includes(word.toLowerCase());
    const family = String(gap.family || '');
    if (!inProse) {
      return {
        number: gap.number,
        judgement: adversarialResult({
          verdict: 'QUALITY_FAIL',
          reason: `"${word || '(missing)'}" is not a word in the finished article, so it cannot be an Open Cloze gap.`,
          candidateAlternative: word,
          repairRecommendation: 'Move or remove this gap. Do not rewrite the whole passage yet.',
          confidence: 'high',
        }),
      };
    }
    if (family && !FUNCTION_FAMILY.test(family)) {
      return {
        number: gap.number,
        judgement: adversarialResult({
          verdict: 'QUALITY_FAIL',
          reason: `"${word}" was labelled ${family}. Part 2 gaps must be grammatical function words, not content words.`,
          candidateAlternative: word,
          repairRecommendation: 'Move or remove this gap and choose a function word already in the article.',
          confidence: 'high',
        }),
      };
    }
    return {
      number: gap.number ?? gap.gap,
      judgement: judgePart2Gap({ ...uniqueness, intendedAnswer: uniqueness.intendedAnswer || uniqueness.keyedWord || word }),
    };
  });
  return { structure, items };
}

export async function generatePart2NaturalnessFirst({ complete, brief, blindSolve, adversary }) {
  const trace = [];
  const repairs = [];
  const budget = createRepairBudget();
  const staged = await runStages(complete, PART2_STAGES, part2StagePrompt, brief, trace, repairs, budget);
  if (staged.schemaFail) return schemaFailResult(2, trace, repairs, staged.schemaFail, staged.records);
  const outputs = staged.outputs;
  if (trace[0] !== 'prose' || trace.indexOf('select-eight') < trace.indexOf('prose')) {
    throw new Error('Part 2 selected gaps before the natural text existed.');
  }
  const passage = String(outputs.prose?.passage || outputs.prose?.text || '');
  let selected = asArray(outputs['select-eight']?.gaps);
  let judged = judgeSelectedGaps(passage, selected, asArray(outputs.uniqueness?.gaps));
  if (judged.structure.verdict !== 'PASS' && spendRepair(budget, 'linguistic')) {
    repairs.push({
      action: 'gap-discovery-2',
      scope: 'same-passage',
      instruction: 'Find additional safe function-word sites in the existing article.',
    });
    const discovery = await completeStage({
      complete,
      stage: 'gap-discovery-2',
      user: groundedPrompt(
        `${part2StagePrompt('gap-discovery', brief)}

This is the one bounded second discovery pass. Search the same finished article for additional safe sites.
Do not rewrite the article and do not repeat sites from the first pass.`,
        outputs,
      ),
      trace,
      repairs,
      budget,
    });
    if (!discovery.validation.ok) {
      return schemaFailResult(2, trace, repairs, discovery.validation, [
        ...staged.records,
        discovery.envelope,
      ]);
    }
    outputs['gap-discovery-2'] = discovery.validation.data;
    const selection = await completeStage({
      complete,
      stage: 'select-eight',
      user: groundedPrompt(
        `${part2StagePrompt('select-eight', brief)}

The first selection failed the exactly-eight rule. Use both discovery passes and return exactly gaps 9–16.
Do not rewrite the prose.`,
        outputs,
      ),
      trace,
      repairs,
      budget,
    });
    if (!selection.validation.ok) {
      return schemaFailResult(2, trace, repairs, selection.validation, [
        ...staged.records,
        discovery.envelope,
        selection.envelope,
      ]);
    }
    outputs['select-eight'] = selection.validation.data;
    selected = asArray(selection.validation.data.gaps);
    const uniqueness = await completeStage({
      complete,
      stage: 'uniqueness',
      user: groundedPrompt(part2StagePrompt('uniqueness', brief), outputs),
      trace,
      repairs,
      budget,
    });
    if (!uniqueness.validation.ok) {
      return schemaFailResult(2, trace, repairs, uniqueness.validation, [
        ...staged.records,
        discovery.envelope,
        selection.envelope,
        uniqueness.envelope,
      ]);
    }
    outputs.uniqueness = uniqueness.validation.data;
    judged = judgeSelectedGaps(passage, selected, asArray(outputs.uniqueness?.gaps));
  }
  const failed = judged.items.filter((row) => row.judgement.verdict !== 'PASS');
  if (judged.structure.verdict === 'PASS' && failed.length && spendRepair(budget, 'linguistic')) {
    const step = nextPart2Repair({ gapMoved: false });
    repairs.push(step);
    trace.push(step.action);
  }
  const adversarial = judged.structure.verdict !== 'PASS'
    ? judged.structure
    : {
      verdict: worstVerdict(judged.items),
      items: judged.items,
    };
  return finalize({
    version: RUOE_GENERATION_VERSION_V2,
    partNumber: 2,
    trace,
    outputs,
    stageRecords: staged.records,
    adversarial,
    repairs,
    answerKey: selected.map((gap) => ({ number: gap.number ?? gap.gap, answer: gap.word || gap.intendedAnswer })),
  }, {
    partNumber: 2,
    blindSolve,
    adversary,
    blindMaterial: { passage, gaps: selected.map(buildPart2BlindGap) },
    stored: selected.map((gap) => ({ answer: gap.word || gap.intendedAnswer })),
  });
}

export async function generatePart3NaturalnessFirst({ complete, brief, blindSolve, adversary }) {
  const trace = [];
  const repairs = [];
  const budget = createRepairBudget();
  const staged = await runStages(complete, PART3_STAGES, part3StagePrompt, brief, trace, repairs, budget);
  if (staged.schemaFail) return schemaFailResult(3, trace, repairs, staged.schemaFail, staged.records);
  const outputs = staged.outputs;
  const items = asArray(outputs['derivation-check']?.items?.length
    ? outputs['derivation-check'].items
    : outputs['base-assignment']?.items);
  const judged = items.map((item) => ({
    ...item,
    stem: item.stem,
    answer: item.answer,
    judgement: judgePart3Derivation(item),
  }));
  const failed = judged.filter((row) => row.judgement.verdict !== 'PASS');
  let active = judged;
  if (failed.length && spendRepair(budget, 'linguistic')) {
    const step = nextPart3Repair();
    repairs.push(step);
    trace.push(step.action);
    const replaced = await complete({
      stage: step.action,
      role: 'generator',
      system: STAGE_SYSTEM,
      user: `${repairPrompt(step)}\n\nReject these and choose new positions from the finished prose only:\n${JSON.stringify(failed.map((row) => row.stem))}`,
    });
    const retryItems = asArray(replaced?.items);
    if (retryItems.length) {
      active = retryItems.map((item) => ({
        ...item,
        stem: item.stem,
        answer: item.answer,
        judgement: judgePart3Derivation(item),
      }));
    }
  }
  const activeFails = active.filter((row) => row.judgement.verdict !== 'PASS');
  return finalize({
    version: RUOE_GENERATION_VERSION_V2,
    partNumber: 3,
    trace,
    outputs,
    stageRecords: staged.records,
    adversarial: {
      verdict: worstVerdict(activeFails.length ? activeFails : active),
      items: active,
    },
    repairs,
    answerKey: judged.map((row) => ({ stem: row.stem, answer: row.answer })),
  }, {
    partNumber: 3,
    blindSolve,
    adversary,
    blindMaterial: { passage: outputs.prose?.passage || '', items: active },
    stored: active.map((item) => ({ answer: item.answer })),
  });
}

async function judgeCanonicalPair({ complete, brief, candidate, trace, budget, repairs, records }) {
  const canonical = canonicalisePart4Item(candidate);
  if (!canonical.ok) {
    return {
      canonical,
      judgement: adversarialResult({
        verdict: 'PIPELINE_FAIL',
        reason: canonical.reason,
        repairRecommendation: 'Return the flat Part 4 object, including the answer string.',
        confidence: 'high',
      }),
    };
  }
  const { item } = canonical;
  const wordCount = countCambridgeKeyWordWords(item.answer);
  const keywordOk = item.answer.toLowerCase().includes(item.keyword.toLowerCase());
  const mechanicalOk = !candidate?.abandonFamily && !candidate?.pair?.abandonFamily;
  if (wordCount < 2 || wordCount > 5 || !keywordOk || !mechanicalOk) {
    return {
      canonical,
      wordCount,
      judgement: judgePart4Item({
        mechanicalOk,
        wordCountOk: wordCount >= 2 && wordCount <= 5,
        keywordOk,
      }),
    };
  }
  const semanticStep = await completeStage({
    complete,
    stage: 'semantic',
    user: groundedPrompt(
      `${part4StagePrompt('semantic', brief)}\n\nCompare S1 with COMPLETED S2 only. Do not compare a gapped line or the answer in isolation.\nS1: ${item.s1}\nCOMPLETED S2: ${item.completedS2}`,
      { s1: item.s1, completedS2: item.completedS2 },
    ),
    trace,
    repairs,
    budget,
  });
  records?.push(semanticStep.envelope);
  const naturalStep = await completeStage({
    complete,
    stage: 'naturalness',
    user: groundedPrompt(part4StagePrompt('naturalness', brief), { s1: item.s1, completedS2: item.completedS2 }),
    trace,
    repairs,
    budget,
  });
  records?.push(naturalStep.envelope);
  if (!semanticStep.validation.ok || !naturalStep.validation.ok) {
    return {
      canonical,
      semantic: semanticStep.validation.data,
      naturalness: naturalStep.validation.data,
      judgement: adversarialResult({
        verdict: 'PIPELINE_FAIL',
        reason: 'Semantic or naturalness JSON was not a complete boolean record, so it cannot override or confirm the item.',
        repairRecommendation: 'Return every semantic flag as true or false, and natural as a boolean.',
        confidence: 'high',
      }),
    };
  }
  const semanticRead = readSemantic(semanticStep.validation.data, naturalStep.validation.data);
  if (!semanticRead.ok) {
    return {
      canonical,
      semantic: semanticStep.validation.data,
      naturalness: naturalStep.validation.data,
      judgement: adversarialResult({
        verdict: 'PIPELINE_FAIL',
        reason: 'Semantic validation did not return a boolean for every required comparison. Missing flags were not treated as a pass.',
        repairRecommendation: 'Repeat the comparison of sentence 1 with the completed sentence 2.',
        confidence: 'high',
      }),
    };
  }
  return {
    canonical,
    wordCount,
    semantic: semanticStep.validation.data,
    naturalness: naturalStep.validation.data,
    judgement: judgePart4Item({
      mechanicalOk,
      wordCountOk: wordCount >= 2 && wordCount <= 5,
      keywordOk,
      ...semanticRead.values,
    }),
  };
}

export async function generatePart4NaturalnessFirst({ complete, brief, blindSolve, adversary }) {
  const trace = [];
  const repairs = [];
  const budget = createRepairBudget();
  const stageRecords = [];
  const familyStep = await completeStage({
    complete,
    stage: 'family-candidate',
    user: groundedPrompt(part4StagePrompt('family-candidate', brief), {}),
    trace,
    repairs,
    budget,
  });
  stageRecords.push(familyStep.envelope);
  if (!familyStep.validation.ok) return schemaFailResult(4, trace, repairs, familyStep.validation, [familyStep.envelope]);
  const family = familyStep.validation.data;
  const pairStep = await completeStage({
    complete,
    stage: 'sentence-pair',
    user: groundedPrompt(
      part4StagePrompt('sentence-pair', { ...brief, preferredFamily: family?.familyId || brief?.preferredFamily }),
      { family },
    ),
    trace,
    repairs,
    budget,
  });
  stageRecords.push(pairStep.envelope);
  if (!pairStep.validation.ok) return schemaFailResult(4, trace, repairs, pairStep.validation, [familyStep.envelope, pairStep.envelope]);
  const first = await judgeCanonicalPair({
    complete,
    brief,
    candidate: pairStep.validation.data,
    trace,
    budget,
    repairs,
    records: stageRecords,
  });
  let final = first;
  let outputsRetry = null;
  if (first.judgement.verdict !== 'PASS' && spendRepair(budget, 'linguistic')) {
    const step = nextPart4Repair();
    repairs.push(step);
    trace.push(step.action);
    const replaced = await complete({
      stage: step.action,
      role: 'generator',
      system: STAGE_SYSTEM,
      user: groundedPrompt(
        `${repairPrompt(step)}\n\nThe previous family failed (${first.judgement.reason}). A different transformation family is allowed. Return s1, keyword, s2WithGap, answer, completedS2 and transformationFamily about: ${brief?.direction || 'the same situation'}.`,
        { family, failure: first.judgement.reason },
      ),
    });
    const second = await judgeCanonicalPair({
      complete,
      brief,
      candidate: replaced,
      trace,
      budget,
      repairs,
      records: stageRecords,
    });
    final = second;
    outputsRetry = second.canonical?.ok ? second.canonical.item : { raw: replaced, canonicalError: second.canonical?.reason };
  }
  const answerKey = final.canonical?.ok
    ? {
      keyword: final.canonical.item.keyword,
      answer: final.canonical.item.answer,
      wordCount: final.wordCount,
      s1: final.canonical.item.s1,
      completedS2: final.canonical.item.completedS2,
      transformationFamily: final.canonical.item.transformationFamily,
    }
    : { keyword: '', answer: '', wordCount: 0 };
  return finalize({
    version: RUOE_GENERATION_VERSION_V2,
    partNumber: 4,
    trace,
    outputs: {
      family,
      pair: first.canonical?.item || pairStep.validation.data,
      semantic: first.semantic,
      naturalness: first.naturalness,
      replacement: outputsRetry,
    },
    stageRecords,
    adversarial: final.judgement,
    repairs,
    answerKey,
  }, {
    partNumber: 4,
    blindSolve,
    adversary,
    blindMaterial: final.canonical?.item || {},
    stored: { answer: answerKey.answer },
  });
}

const RUNNERS = {
  1: generatePart1NaturalnessFirst,
  2: generatePart2NaturalnessFirst,
  3: generatePart3NaturalnessFirst,
  4: generatePart4NaturalnessFirst,
};

export async function runNaturalnessFirstGeneration({ partNumber, brief, complete, blindSolve, adversary }) {
  const version = resolveRuoeGenerationVersion(RUOE_GENERATION_VERSION_V2);
  if (version !== RUOE_GENERATION_VERSION_V2) {
    throw new Error('Refusing to run the legacy engine from the v2 entry point.');
  }
  const runner = RUNNERS[Number(partNumber)];
  if (!runner) {
    throw new Error(`naturalness-first-v2 is implemented for Parts 1–4 only (got ${partNumber}).`);
  }
  return runner({ complete, brief, blindSolve, adversary });
}
