/**
 * Scores one prepared case against the validator result.
 * A missing-evidence rejection is not counted as linguistic detection.
 */

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function errorsOf(result) {
  return asArray(result?.errors).map((item) => String(item || ''));
}

export function isEvidenceGap(message) {
  return /review evidence is missing|review is inconclusive|did not test every gap|fail closed|invalid json/i.test(String(message || ''));
}

export function isLinguisticError(message) {
  const text = String(message || '');
  if (!text || isEvidenceGap(text)) return false;
  return /more than one natural|accepts multiple ordinary|ambiguity|unsupported requirement|explicit statement|weak cohesion|weak distractor|unnatural|risky near-synonym|blind-solve|level issue|multifit|sequence issue|copying wording|not supported|whole-text|british english/i.test(text);
}

function hasAll(text, tokens) {
  return tokens.every((token) => new RegExp(`\\b${String(token).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text));
}

function part5Detected(result, item) {
  const letters = item.letters || [];
  const words = item.words || [];
  const named = errorsOf(result).some((error) => (
    new RegExp(`Q${item.number}\\b`).test(error)
    && (hasAll(error, letters) || hasAll(error, words))
    && /more than one natural|ambiguity|alternatives/i.test(error)
  ));
  if (named) return true;
  const fits = asArray(result?.rubric?.alternativeFits).find((row) => Number(row?.number) === Number(item.number));
  const fitLetters = asArray(fits?.letters).map((letter) => String(letter).toUpperCase());
  return letters.every((letter) => fitLetters.includes(letter));
}

function part6Detected(result, item) {
  const words = item.words || [];
  return errorsOf(result).some((error) => (
    new RegExp(`Q${item.number}\\b`).test(error)
    && hasAll(error, words)
    && /accepts multiple ordinary|ambiguity/i.test(error)
  ));
}

function part2Detected(result, item) {
  const pattern = new RegExp(item.requirement || 'weekend', 'i');
  const fromErrors = errorsOf(result).some((error) => (
    new RegExp(`Q${item.number}\\b`).test(error)
    && /unsupported requirement/i.test(error)
    && pattern.test(error)
  ));
  if (fromErrors) return true;
  return asArray(result?.rubric?.requirementEvidence).some((row) => (
    Number(row?.number) === Number(item.number)
    && row?.supported === false
    && pattern.test(`${row?.requirement || ''} ${row?.reason || ''}`)
  ));
}

function part3Detected(result, item) {
  return errorsOf(result).some((error) => (
    new RegExp(`Q${item.number}\\b`).test(error) && /explicit statement/i.test(error)
  ));
}

function part4Detected(result, item) {
  const gap = item.gap;
  return errorsOf(result).some((error) => (
    new RegExp(`gap ${gap}\\b`, 'i').test(error) && /weak cohesion|restates/i.test(error)
  ));
}

function detected(testCase, result, item) {
  if (item.letters) return part5Detected(result, item);
  if (item.words) return part6Detected(result, item);
  if (item.requirement) return part2Detected(result, item);
  if (item.explicitStatement) return part3Detected(result, item);
  if (item.redundant) return part4Detected(result, item);
  return false;
}

export function scoreCase(testCase, result) {
  const errors = errorsOf(result);
  const linguistic = errors.filter(isLinguisticError);
  const evidence = errors.filter(isEvidenceGap);
  const required = asArray(testCase?.mustDetect);
  const found = required.filter((item) => detected(testCase, result, item));
  const missed = required.filter((item) => !detected(testCase, result, item));
  const malformed = Boolean(result?.malformed);
  const onlyEvidence = errors.length > 0 && linguistic.length === 0;

  let status = 'FAIL';
  let reason = '';
  if (result?.notRun) {
    status = 'NOT_RUN';
    reason = result.reason || 'not run';
  } else if (malformed) {
    status = 'INCONCLUSIVE';
    reason = 'The review response could not be processed.';
  } else if (testCase.outcome === 'fail' && found.length === 0 && (onlyEvidence || errors.length === 0)) {
    status = result?.ok ? 'FAIL' : 'INCONCLUSIVE';
    reason = result?.ok
      ? 'The validator accepted a part that contains the prepared defect.'
      : 'The part was rejected without a linguistic judgement of the prepared defect.';
  } else if (testCase.outcome === 'pass' && !result?.ok && onlyEvidence) {
    status = 'INCONCLUSIVE';
    reason = 'The valid example was rejected only because review evidence was missing or the response was incomplete.';
  } else if (testCase.outcome === 'fail' && result?.ok) {
    status = 'FAIL';
    reason = 'The validator accepted a part that contains the prepared defect.';
  } else if (testCase.outcome === 'fail' && missed.length === 0) {
    status = 'PASS';
    reason = 'The validator rejected the part and named each prepared defect.';
  } else if (testCase.outcome === 'fail') {
    status = 'FAIL';
    reason = 'The validator rejected the part but missed at least one prepared defect.';
  } else if (result?.ok && linguistic.length === 0) {
    status = 'PASS';
    reason = 'The validator accepted the part with no linguistic rejection.';
  } else {
    status = 'FAIL';
    reason = 'The validator rejected a part that was prepared with one natural answer.';
  }

  const falseNegatives = testCase.outcome === 'fail' && status === 'FAIL' ? missed : [];
  const falsePositives = testCase.outcome === 'pass' && status === 'FAIL' ? linguistic : [];
  return {
    id: testCase.id,
    partNumber: testCase.partNumber,
    expected: testCase.outcome,
    status,
    reason,
    ok: Boolean(result?.ok),
    detected: found,
    missed,
    falseNegatives,
    falsePositives,
    additionalRejections: testCase.outcome === 'fail' ? linguistic : [],
    evidenceGaps: evidence,
    errors,
    warnings: asArray(result?.warnings).map((item) => String(item || '')),
    approval: result?.approval || null,
  };
}
