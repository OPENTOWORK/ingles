export const REPAIR_LIMITS = {
  schema: 1,
  linguistic: 2,
  regenerate: 1,
};

export const PART2_CONFIDENCE_THRESHOLD = 0.7;

export function createRepairBudget() {
  return {
    schema: 0,
    schemaByStage: {},
    linguistic: 0,
    regenerate: 0,
  };
}

export function spendRepair(budget, kind) {
  const limit = REPAIR_LIMITS[kind];
  if (!limit || budget[kind] >= limit) return false;
  budget[kind] += 1;
  return true;
}

export function spendSchemaRepair(budget, stage) {
  const key = String(stage || 'unknown');
  const used = Number(budget.schemaByStage?.[key] || 0);
  if (used >= REPAIR_LIMITS.schema) return false;
  budget.schemaByStage = { ...(budget.schemaByStage || {}), [key]: used + 1 };
  budget.schema += 1;
  return true;
}

export function confidenceScore(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const label = String(value || '').toLowerCase();
  if (label === 'high') return 0.9;
  if (label === 'medium') return 0.6;
  if (label === 'low') return 0.3;
  return 0;
}

/**
 * Public view for a blind solver. Intended keys and generator notes are removed.
 */
export function toBlindView(partNumber, material) {
  if (partNumber === 1) {
    const items = (material?.items || []).map((item) => ({
      number: item.number,
      sentence: item.sentence || '',
      options: (item.options || []).map((option) => ({
        option: option.option || option.letter,
        word: option.word || '',
        completedSentence: option.completedSentence || option.sentence || '',
      })),
    }));
    return { partNumber: 1, passage: material?.passage || '', items };
  }
  if (partNumber === 2) {
    return {
      partNumber: 2,
      passage: material?.passage || '',
      gaps: (material?.gaps || []).map((gap) => ({ gap: gap.number || gap.gap, sentence: gap.sentence || '' })),
    };
  }
  if (partNumber === 3) {
    return {
      partNumber: 3,
      passage: material?.passage || '',
      items: (material?.items || []).map((item) => ({ stem: item.stem, sentence: item.sentence || '' })),
    };
  }
  return {
    partNumber: 4,
    s1: material?.s1 || '',
    keyword: material?.keyword || '',
    s2WithGap: material?.s2WithGap || '',
  };
}

export function compareBlindSolve(partNumber, stored, blind) {
  if (!blind || blind.status === 'UNCONFIGURED') {
    return { status: 'UNCONFIGURED', verdict: null, reason: 'No blind solver was injected.' };
  }
  if (partNumber === 1) {
    const defensible = blind.defensibleOptions || blind.options || [];
    const letters = [...new Set(defensible.map((row) => String(row.option || row.letter || row).toUpperCase()))];
    if (letters.length !== 1) {
      return {
        status: 'DONE',
        verdict: 'QUALITY_FAIL',
        reason: letters.length === 0
          ? 'The blind solver found no defensible option.'
          : `The blind solver found more than one defensible option (${letters.join(', ')}).`,
        candidateAlternative: letters[1] || null,
      };
    }
    if (stored?.letter && letters[0] !== String(stored.letter).toUpperCase()) {
      return {
        status: 'DONE',
        verdict: 'QUALITY_FAIL',
        reason: `Blind solve chose ${letters[0]} and the stored key is ${stored.letter}.`,
        candidateAlternative: letters[0],
      };
    }
    return { status: 'DONE', verdict: 'PASS', reason: `Blind solve found only ${letters[0]}.` };
  }
  if (partNumber === 2) {
    const alternatives = blind.plausibleAlternatives || blind.alternatives || [];
    if (!blind.alternativeSearchPerformed) {
      return { status: 'DONE', verdict: 'QUALITY_FAIL', reason: 'The blind solver did not show that an alternative search was performed.' };
    }
    if (alternatives.length) {
      return { status: 'DONE', verdict: 'QUALITY_FAIL', reason: `Blind solve found alternatives (${alternatives.join(', ')}).`, candidateAlternative: alternatives[0] };
    }
    const intended = String(blind.answer || blind.intendedAnswer || '').toLowerCase();
    if (stored?.answer && intended && intended !== String(stored.answer).toLowerCase()) {
      return { status: 'DONE', verdict: 'QUALITY_FAIL', reason: `Blind solve answered "${intended}", stored answer is "${stored.answer}".` };
    }
    return { status: 'DONE', verdict: 'PASS', reason: 'Blind solve found one function word.' };
  }
  if (partNumber === 3) {
    const word = String(blind.answer || blind.word || '').toLowerCase();
    if (!word) return { status: 'DONE', verdict: 'QUALITY_FAIL', reason: 'The blind solver did not supply a word.' };
    if (stored?.answer && word !== String(stored.answer).toLowerCase()) {
      return { status: 'DONE', verdict: 'QUALITY_FAIL', reason: `Blind solve wrote "${word}", stored answer is "${stored.answer}".`, candidateAlternative: word };
    }
    return { status: 'DONE', verdict: 'PASS', reason: 'Blind solve matched the stored derivation.' };
  }
  const answer = String(blind.answer || '').toLowerCase();
  if (!answer) return { status: 'DONE', verdict: 'QUALITY_FAIL', reason: 'The blind solver did not complete sentence 2.' };
  if (stored?.answer && answer !== String(stored.answer).toLowerCase()) {
    return { status: 'DONE', verdict: 'QUALITY_FAIL', reason: `Blind transformation was "${answer}", stored answer is "${stored.answer}".`, candidateAlternative: answer };
  }
  return { status: 'DONE', verdict: 'PASS', reason: 'Blind solve matched the stored transformation.' };
}

export function combineLayerVerdicts({ mechanical, blind, adversary }) {
  if (
    mechanical === 'PIPELINE_FAIL'
    || blind?.verdict === 'PIPELINE_FAIL'
    || adversary?.verdict === 'PIPELINE_FAIL'
  ) return 'PIPELINE_FAIL';
  if (mechanical === 'HARD_FAIL') return 'HARD_FAIL';
  if (blind?.verdict === 'HARD_FAIL' || adversary?.verdict === 'HARD_FAIL') return 'HARD_FAIL';
  if (mechanical === 'QUALITY_FAIL' || blind?.verdict === 'QUALITY_FAIL' || adversary?.verdict === 'QUALITY_FAIL') {
    return 'QUALITY_FAIL';
  }
  if (blind?.status === 'UNCONFIGURED' && adversary?.status === 'UNCONFIGURED') return mechanical || 'PASS';
  return mechanical || 'PASS';
}
