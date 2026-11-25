/**
 * Turns existing B1 validator findings into a review workflow.
 * It does not define a second rulebook and does not delete any check.
 * `b1-reading-rules-v3` remains the source of the requirements.
 */

const QUESTION_RANGES = {
  1: [1, 5],
  2: [6, 10],
  3: [11, 15],
  4: [16, 20],
  5: [21, 26],
  6: [27, 32],
};

const CRITICAL_PATTERNS = [
  /ambiguit|more than one|multiple ordinary|alternative key|near-synonym|double key|defensible|multifit/i,
  /unsupported requirement|limited to adults|does not state an age|leave-by-noon|closes or locks at noon|not supported by the text/i,
  /blind-solve|disagreed on/i,
  /review evidence is missing|review is inconclusive|semantic quality validator failed/i,
  /answer must be one of|answer key must|missing answer\b/i,
  /grammar target|must test|targetType|content vocabulary|open cloze|exactly one word|six different/i,
  /\b\d+ words?\b|too short|too long|word count/i,
];

const WARNING_PATTERNS = [
  /weak distractor/i,
  /literal|word spotting|repeats wording|copying wording|solvable by copying|explicit statement/i,
  /unnatural/i,
  /repeated phrase|restates|minor repetition/i,
  /weak cohesion|sequence issue|mechanical/i,
  /british english|british spelling/i,
  /above b1|above normal b1|above-level/i,
];

const INVALID_PATTERNS = [
  /must have exactly|needs exactly|missing short real-world|missing person description|missing passage|missing questions or model|missing question\/prompt|no example gap|duplicate question number|number must be|is missing question \d/i,
  /invalid json|parse error|unexpected token|generation\/parse/i,
  /validation failed without a diagnostic message/i,
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function classifyB1ReviewMessage(message) {
  const text = String(message || '');
  if (CRITICAL_PATTERNS.some((pattern) => pattern.test(text))) return 'critical';
  if (WARNING_PATTERNS.some((pattern) => pattern.test(text))) return 'warning';
  if (INVALID_PATTERNS.some((pattern) => pattern.test(text))) return 'invalid';
  return 'unclassified';
}

export function structurallyCompleteB1Part(partNumber, generated) {
  const range = QUESTION_RANGES[Number(partNumber)];
  if (!range || !generated || typeof generated !== 'object') return false;
  const [start, end] = range;
  const questions = asArray(generated.questions);
  if (questions.length !== end - start + 1) return false;
  const numbers = questions.map((question) => Number(question?.number));
  if (new Set(numbers).size !== numbers.length) return false;
  for (let number = start; number <= end; number += 1) {
    if (!numbers.includes(number)) return false;
  }
  const answers = asArray(generated.modelAnswers);
  for (let number = start; number <= end; number += 1) {
    const row = answers.find((answer) => Number(answer?.number) === number);
    if (!row || !String(row.answer ?? '').trim()) return false;
  }
  if (partNumber === 1) {
    return questions.every((question) =>
      String(question?.text || question?.message || question?.notice || '').trim()
      && String(question?.prompt || question?.question || '').trim()
      && asArray(question?.options).length === 3);
  }
  if (partNumber === 2) {
    return asArray(generated.sections).length === 8
      && questions.every((question) => String(question?.prompt || question?.description || '').trim());
  }
  if (partNumber === 4) {
    return String(generated.passage || '').trim() && asArray(generated.sentencePool).length >= 8;
  }
  if (partNumber === 3 || partNumber === 5) {
    return String(generated.passage || '').trim()
      && questions.every((question) => asArray(question?.options).length === 4);
  }
  if (partNumber === 6) return String(generated.passage || '').trim();
  return false;
}

export function assessB1PartReview({ partNumber, generated, errors = [], warnings = [] } = {}) {
  const critical = [];
  const pedagogicalWarnings = [];
  const invalidFindings = [];
  const unclassified = [];
  for (const message of asArray(errors)) {
    const kind = classifyB1ReviewMessage(message);
    if (kind === 'critical') critical.push(String(message));
    else if (kind === 'warning') pedagogicalWarnings.push(String(message));
    else if (kind === 'invalid') invalidFindings.push(String(message));
    else unclassified.push(String(message));
  }
  for (const message of asArray(warnings)) {
    const kind = classifyB1ReviewMessage(message);
    if (kind === 'warning') pedagogicalWarnings.push(String(message));
    else if (kind === 'critical') critical.push(String(message));
  }
  const shape = structurallyCompleteB1Part(partNumber, generated);
  let reviewStatus = 'validated_candidate';
  if (!shape || invalidFindings.length) {
    reviewStatus = 'invalid';
  } else if (critical.length || pedagogicalWarnings.length || unclassified.length) {
    reviewStatus = 'teacher_review_draft';
    critical.push(...unclassified);
  }
  const automatedValidation = reviewStatus === 'validated_candidate' ? 'passed' : 'not_approved';
  return {
    reviewStatus,
    automatedValidation,
    teacherApproval: 'pending',
    humanTeacherApproved: false,
    structurallyComplete: shape && reviewStatus !== 'invalid',
    critical,
    pedagogicalWarnings,
    invalidFindings,
  };
}
