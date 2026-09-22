/**
 * Code decides PASS / PIPELINE_FAIL / QUALITY_FAIL / HARD_FAIL.
 * A model may supply per-option facts. It may not award a pass by calling the key "more idiomatic".
 */
import { confidenceScore, PART2_CONFIDENCE_THRESHOLD } from './layers.js';
import { analyseLexicalFamily } from './morphology.js';

export function adversarialResult({
  verdict,
  reason,
  candidateAlternative = null,
  repairRecommendation,
  confidence = 'high',
}) {
  return {
    verdict,
    reason,
    candidateAlternative,
    repairRecommendation,
    confidence,
  };
}

function optionLabel(option) {
  return String(option?.option || option?.letter || '').toUpperCase();
}

function optionSurvives(option) {
  const collocational = option?.collocationallyValid ?? option?.collocationalFit;
  const contextual = option?.contextuallyDefensible;
  return Boolean(
    option &&
      option.grammatical &&
      option.naturalBritishEnglish &&
      option.semanticallyDefensible &&
      collocational &&
      (contextual === undefined || contextual),
  );
}

/**
 * Part 1. Exactly four independent records, labels A–D, no duplicates.
 * "moreIdiomaticThanKey" is ignored as a reason to pass.
 */
export function judgePart1Substitutions(options) {
  if (!Array.isArray(options)) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: 'Option judgements were not an array of four records. Missing letters were not inferred.',
      repairRecommendation: 'Return four separate judgements for A, B, C and D.',
      confidence: 'high',
    });
  }
  const rows = options;
  const letters = rows.map(optionLabel);
  const unknown = letters.filter((letter) => !['A', 'B', 'C', 'D'].includes(letter));
  if (unknown.length) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: `Unknown option label (${unknown.join(', ')}). Only A, B, C and D are accepted.`,
      repairRecommendation: 'Return exactly the labels A, B, C and D.',
      confidence: 'high',
    });
  }
  const duplicates = letters.filter((letter, index) => letter && letters.indexOf(letter) !== index);
  if (duplicates.length) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: `Duplicate option label (${[...new Set(duplicates)].join(', ')}). Each of A, B, C and D must appear once.`,
      repairRecommendation: 'Return one judgement for each label.',
      confidence: 'high',
    });
  }
  const expected = ['A', 'B', 'C', 'D'];
  const missing = expected.filter((letter) => !letters.includes(letter));
  if (rows.length !== 4 || missing.length) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: `Independent substitution was not completed for A, B, C and D (missing ${missing.join(', ') || 'records'}).`,
      repairRecommendation: 'Run the four-way substitution again before any repair.',
      confidence: 'high',
    });
  }

  const survivors = rows.filter(optionSurvives).map(optionLabel);
  if (survivors.length >= 2) {
    return adversarialResult({
      verdict: 'QUALITY_FAIL',
      reason: `More than one option is grammatical, natural British English, and semantically defensible (${survivors.join(', ')}). A key that is merely more idiomatic does not save the item.`,
      candidateAlternative: survivors.find((letter) => letter !== String(rows.find((row) => row.isKey)?.letter || '').toUpperCase()) || survivors[1],
      repairRecommendation: 'Replace the surviving distractor. If the sentence itself allows two natural words, move the gap. Do not keep the item because the key is more idiomatic.',
      confidence: 'high',
    });
  }
  if (survivors.length === 0) {
    return adversarialResult({
      verdict: 'QUALITY_FAIL',
      reason: 'No option survived as natural British English in the complete sentence.',
      repairRecommendation: 'Regenerate the item from a stable sentence.',
      confidence: 'medium',
    });
  }
  return adversarialResult({
    verdict: 'PASS',
    reason: `Only ${survivors[0]} survives independent substitution.`,
    repairRecommendation: 'None.',
    confidence: 'high',
  });
}

const PART2_PLACEHOLDERS = new Set(['...', '…', 'word', 'keyword', 'answer', 'keyedword']);

export function judgePart2Structure(gaps) {
  const rows = Array.isArray(gaps) ? gaps : [];
  if (rows.length !== 8) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: `Part 2 must contain exactly 8 gaps (got ${rows.length}).`,
      repairRecommendation: 'Select eight gaps from the finished prose. Do not rewrite the prose yet.',
      confidence: 'high',
    });
  }
  const numbers = rows.map((gap) => Number(gap.number ?? gap.gap));
  const expected = [9, 10, 11, 12, 13, 14, 15, 16];
  const duplicates = numbers.filter((number, index) => numbers.indexOf(number) !== index);
  if (duplicates.length) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: `Duplicate gap id (${[...new Set(duplicates)].join(', ')}).`,
      repairRecommendation: 'Number the gaps 9 to 16 once each.',
      confidence: 'high',
    });
  }
  const missing = expected.filter((number) => !numbers.includes(number));
  if (missing.length) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: `Gap numbering must be 9–16 (missing ${missing.join(', ')}).`,
      repairRecommendation: 'Renumber the eight gaps from 9 to 16.',
      confidence: 'high',
    });
  }
  const multi = rows.filter((gap) => !/^[A-Za-z]+$/.test(String(gap.word || gap.intendedAnswer || gap.keyedWord || '').trim()));
  if (multi.length) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: 'Every Part 2 answer must be exactly one word.',
      repairRecommendation: 'Replace any phrase or empty key with one function word from the article.',
      confidence: 'high',
    });
  }
  return adversarialResult({
    verdict: 'PASS',
    reason: 'Eight unique one-word gaps, numbered 9–16.',
    repairRecommendation: 'None.',
    confidence: 'high',
  });
}

export function judgePart2Gap(gap = {}) {
  const intended = String(gap.intendedAnswer || gap.keyedWord || '').trim();
  const keyed = intended.toLowerCase();
  if (PART2_PLACEHOLDERS.has(keyed)) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: 'The uniqueness stage returned a placeholder instead of the word removed from the finished prose.',
      repairRecommendation: 'Move or remove this gap. Judge the word that is actually in the article.',
      confidence: 'high',
    });
  }
  const alternatives = Array.isArray(gap.plausibleAlternatives)
    ? gap.plausibleAlternatives
    : Array.isArray(gap.alternatives)
      ? gap.alternatives
      : [];
  const rivals = [...new Set(alternatives.map((word) => String(word || '').trim().toLowerCase()).filter(Boolean))];
  if (!intended) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: 'The gap has no keyed one-word answer.',
      repairRecommendation: 'Restore a single function-word key or drop the gap.',
      confidence: 'high',
    });
  }
  if (rivals.length) {
    return adversarialResult({
      verdict: 'QUALITY_FAIL',
      reason: `More than one function word is defensible here (${[keyed, ...rivals].join(', ')}).`,
      candidateAlternative: rivals[0],
      repairRecommendation: 'Move or remove this gap. Do not rewrite the whole passage yet.',
      confidence: 'high',
    });
  }
  const searchPerformed = gap.alternativeSearchPerformed === true;
  const justification = String(gap.uniquenessJustification || '').trim();
  const confidence = confidenceScore(gap.confidence);
  const intendedValid = gap.intendedAnswerValid === true;
  if (!searchPerformed || !justification || confidence <= PART2_CONFIDENCE_THRESHOLD || !intendedValid) {
    return adversarialResult({
      verdict: 'QUALITY_FAIL',
      reason: 'An empty alternative list is not evidence of uniqueness. The search was not shown, the justification is empty, or confidence is too low.',
      repairRecommendation: 'Search for other function words and record the search. Do not pass this gap on silence.',
      confidence: 'high',
    });
  }
  return adversarialResult({
    verdict: 'PASS',
    reason: `A search was recorded and only "${keyed}" remained defensible. ${justification}`,
    repairRecommendation: 'None.',
    confidence: 'high',
  });
}

/**
 * Direct one-word derivation from a legitimate base.
 * DECIDE → decision-making fails: "making" is a second lexeme.
 * Spelling overlap is not a pass.
 */
export function judgePart3Derivation({
  stem,
  answer,
  natural = true,
  forcedContext = false,
  alternativeFamilyMembers = [],
  pluralRequired = false,
  contextRequiresPlural = false,
  lexicalFamilyValidation,
} = {}) {
  const lexicalFamily = analyseLexicalFamily({
    stem,
    answer,
    pluralRequired,
    contextRequiresPlural,
    lexicalFamilyValidation,
  });
  const withFamily = (result) => ({ ...result, lexicalFamily });
  const derived = String(answer || '').trim();

  if (!lexicalFamily.base || !lexicalFamily.answer) {
    return withFamily(adversarialResult({
      verdict: 'HARD_FAIL',
      reason: lexicalFamily.reason,
      repairRecommendation: 'Choose another position in the finished text.',
      confidence: 'high',
    }));
  }
  if (lexicalFamily.base === lexicalFamily.answer) {
    return withFamily(adversarialResult({
      verdict: 'HARD_FAIL',
      reason: lexicalFamily.reason,
      candidateAlternative: derived,
      repairRecommendation: 'Discard this position and choose a word that is a real derivation.',
      confidence: 'high',
    }));
  }
  if (lexicalFamily.artificialBase || lexicalFamily.extraLexicalRootIntroduced) {
    return withFamily(adversarialResult({
      verdict: 'HARD_FAIL',
      reason: lexicalFamily.reason,
      candidateAlternative: derived,
      repairRecommendation: 'Discard this target. Do not invent a stem to save the answer.',
      confidence: 'high',
    }));
  }
  if (lexicalFamily.pipelineIncomplete) {
    return withFamily(adversarialResult({
      verdict: 'PIPELINE_FAIL',
      reason: lexicalFamily.reason,
      candidateAlternative: derived,
      repairRecommendation: 'Return a complete lexical-family judgement. Do not infer validity from spelling.',
      confidence: 'high',
    }));
  }
  if (!lexicalFamily.directDerivation) {
    return withFamily(adversarialResult({
      verdict: 'QUALITY_FAIL',
      reason: lexicalFamily.reason,
      candidateAlternative: derived,
      repairRecommendation: 'Choose a different base from a word already in the natural text.',
      confidence: 'medium',
    }));
  }

  const lowered = lexicalFamily.answer;
  const rivals = (Array.isArray(alternativeFamilyMembers) ? alternativeFamilyMembers : [])
    .map((word) => String(word || '').trim().toLowerCase())
    .filter((word) => word && word !== lowered);
  if (rivals.length) {
    return withFamily(adversarialResult({
      verdict: 'QUALITY_FAIL',
      reason: `Another family member also fits this context (${rivals.join(', ')}).`,
      candidateAlternative: rivals[0],
      repairRecommendation: 'Discard the position. The context does not force one family member.',
      confidence: 'high',
    }));
  }
  if (forcedContext || natural === false) {
    return withFamily(adversarialResult({
      verdict: 'QUALITY_FAIL',
      reason: 'The phrase was built to hold the target. A British speaker would not produce it with no exam in view.',
      candidateAlternative: derived,
      repairRecommendation: 'Choose a new position. Do not rewrite the sentence around this base.',
      confidence: 'high',
    }));
  }
  return withFamily(adversarialResult({
    verdict: 'PASS',
    reason: `"${derived}" is a direct, unique derivation of "${lexicalFamily.base}" in a natural sentence.`,
    repairRecommendation: 'None.',
    confidence: 'high',
  }));
}

export function judgePart4Item({
  mechanicalOk,
  wordCountOk,
  keywordOk,
  propositionsPreserved = true,
  agencyPreserved = true,
  referencePreserved = true,
  tenseAspectPreserved = true,
  modalityPreserved = true,
  comparisonScopePreserved = true,
  informationLost = false,
  informationAdded = false,
  natural = true,
} = {}) {
  const mechanicalPass = Boolean(mechanicalOk && wordCountOk && keywordOk);
  if (!wordCountOk || !keywordOk) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: !wordCountOk
        ? 'The answer is not 2–5 Cambridge words.'
        : 'The keyword is missing or has been changed.',
      repairRecommendation: 'Replace the transformation family. Do not stretch the sentence to keep this keyword.',
      confidence: 'high',
    });
  }

  const semanticFails = [];
  if (!propositionsPreserved) semanticFails.push('a proposition is missing');
  if (!agencyPreserved) semanticFails.push('agency has changed');
  if (!referencePreserved) semanticFails.push('an object or referent has been lost');
  if (!tenseAspectPreserved) semanticFails.push('tense or aspect has changed the facts');
  if (!modalityPreserved) semanticFails.push('modality has changed');
  if (!comparisonScopePreserved) semanticFails.push('the comparison has been widened or narrowed');
  if (informationLost) semanticFails.push('information has been lost');
  if (informationAdded) semanticFails.push('information has been added');
  if (!natural) semanticFails.push('the sentences are not natural British English');

  if (semanticFails.length) {
    return adversarialResult({
      verdict: 'QUALITY_FAIL',
      reason: mechanicalPass
        ? `Mechanical checks passed, but meaning did not: ${semanticFails.join('; ')}. A mechanical pass does not override a semantic fail.`
        : `Meaning failed: ${semanticFails.join('; ')}.`,
      candidateAlternative: semanticFails[0],
      repairRecommendation: 'Discard this transformation family and choose another route. Do not bend the English around the same target.',
      confidence: 'high',
    });
  }
  if (!mechanicalOk) {
    return adversarialResult({
      verdict: 'HARD_FAIL',
      reason: 'Grammar, placement, or marking points failed.',
      repairRecommendation: 'Repair the marking points with the existing partition tool, or replace the family if the answer cannot be partitioned.',
      confidence: 'high',
    });
  }
  return adversarialResult({
    verdict: 'PASS',
    reason: 'Mechanics, exact equivalence, and naturalness all hold.',
    repairRecommendation: 'None.',
    confidence: 'high',
  });
}
