export const TEACHER_REPAIR_SCOPES = {
  KEY_METADATA: 'KEY_METADATA_FIX',
  DISTRACTOR_ONLY: 'DISTRACTOR_ONLY_FIX',
  LOCAL_CONTEXT: 'SENTENCE_LOCAL_CONTEXT_FIX',
  TARGET_REPLACEMENT: 'TARGET_REPLACEMENT',
  TRANSFORMATION_REBUILD: 'TRANSFORMATION_REBUILD',
  PASSAGE_LEVEL: 'PASSAGE_LEVEL_FIX',
};

const VALID_SCOPES = new Set(Object.values(TEACHER_REPAIR_SCOPES));

function clone(value) {
  return structuredClone(value);
}

function questionNumber(question) {
  return Number(question?.number ?? question?.questionNumber ?? question?.id);
}

function locateQuestionContainer(exam, partNumber) {
  if (Array.isArray(exam?.questions)) return { owner: exam, key: 'questions' };
  if (Array.isArray(exam?.items)) return { owner: exam, key: 'items' };
  if (Array.isArray(exam?.parts)) {
    const part = exam.parts.find((row) => Number(row.partNumber ?? row.number ?? row.part) === Number(partNumber));
    if (part && Array.isArray(part.questions)) return { owner: part, key: 'questions' };
    if (part && Array.isArray(part.items)) return { owner: part, key: 'items' };
  }
  if (exam?.content && Array.isArray(exam.content.questions)) {
    return { owner: exam.content, key: 'questions' };
  }
  return null;
}

function locateModelAnswerContainer(exam, partNumber) {
  if (Array.isArray(exam?.modelAnswers)) return { owner: exam, key: 'modelAnswers' };
  if (Array.isArray(exam?.parts)) {
    const part = exam.parts.find((row) => Number(row.partNumber ?? row.number ?? row.part) === Number(partNumber));
    if (part && Array.isArray(part.modelAnswers)) return { owner: part, key: 'modelAnswers' };
  }
  if (exam?.content && Array.isArray(exam.content.modelAnswers)) {
    return { owner: exam.content, key: 'modelAnswers' };
  }
  return null;
}

function answerValue(question) {
  return question?.answer ?? question?.key ?? question?.correctAnswer ?? question?.modelAnswer;
}

function optionLetter(option) {
  if (typeof option === 'string') return option.trim().match(/^([A-D])(?:\)|[.:\s])/i)?.[1]?.toUpperCase() || '';
  return String(option?.letter ?? option?.option ?? '').toUpperCase();
}

function replaceOptionWord(option, word) {
  if (typeof option === 'string') {
    const label = optionLetter(option);
    return `${label}) ${word}`;
  }
  if (option && typeof option === 'object') {
    return { ...option, word };
  }
  return option;
}

function optionWord(option) {
  if (typeof option === 'string') return option.replace(/^[A-D](?:\)|[.:\s])\s*/i, '').trim().toLowerCase();
  return String(option?.word ?? option?.value ?? '').trim().toLowerCase();
}

function part1JudgementSurvives(row) {
  return Boolean(
    row?.grammatical &&
    row?.naturalBritishEnglish &&
    row?.semanticallyDefensible &&
    (row?.collocationallyValid ?? row?.collocationalFit) &&
    (row?.contextuallyDefensible ?? true),
  );
}

export function buildPart1DistractorOnlyPatch({
  options,
  judgements,
  keyLetter,
  replacementWord,
  targetLetter,
} = {}) {
  const rows = Array.isArray(judgements) ? judgements : [];
  const sourceOptions = Array.isArray(options) ? options : [];
  const key = String(keyLetter || '').toUpperCase();
  if (sourceOptions.length !== 4 || rows.length !== 4 || !['A', 'B', 'C', 'D'].includes(key)) {
    return { status: 'PIPELINE_FAIL', reason: 'Four options, four independent judgements, and a key letter are required.' };
  }
  const alternatives = rows
    .filter(part1JudgementSurvives)
    .map(optionLetter)
    .filter((letter) => letter && letter !== key);
  const uniqueAlternatives = [...new Set(alternatives)];
  const requested = String(targetLetter || '').toUpperCase();
  const target = requested || (uniqueAlternatives.length === 1 ? uniqueAlternatives[0] : '');
  if (!target || !uniqueAlternatives.includes(target)) {
    return {
      status: 'QUALITY_FAIL',
      reason: uniqueAlternatives.length
        ? `Choose exactly one surviving distractor to replace (${uniqueAlternatives.join(', ')}).`
        : 'No surviving non-key distractor was identified.',
      survivingDistractors: uniqueAlternatives,
    };
  }
  const word = String(replacementWord || '').trim();
  if (!/^[A-Za-z'-]+$/.test(word)) {
    return { status: 'PIPELINE_FAIL', reason: 'The replacement distractor must be one word.' };
  }
  const index = sourceOptions.findIndex((option) => optionLetter(option) === target);
  if (index === -1) return { status: 'PIPELINE_FAIL', reason: `Option ${target} was not found.` };
  const otherWords = sourceOptions
    .filter((_, optionIndex) => optionIndex !== index)
    .map(optionWord);
  if (otherWords.includes(word.toLowerCase())) {
    return { status: 'HARD_FAIL', reason: `The replacement would duplicate the option word "${word}".` };
  }
  const patched = clone(sourceOptions);
  patched[index] = replaceOptionWord(patched[index], word);
  return {
    status: 'PASS',
    targetLetter: target,
    survivingDistractors: uniqueAlternatives,
    proposedQuestion: { options: patched },
  };
}

export function classifyTeacherRepairScope({
  partNumber,
  teacherComment,
  requestedScope,
} = {}) {
  if (requestedScope) {
    if (!VALID_SCOPES.has(requestedScope)) {
      return {
        status: 'PIPELINE_FAIL',
        scope: null,
        reason: `Unknown requested repair scope: ${requestedScope}.`,
      };
    }
    return {
      status: 'PASS',
      scope: requestedScope,
      reason: 'The caller supplied an explicit supported repair scope.',
    };
  }
  const comment = String(teacherComment || '').toLowerCase();
  if (!comment.trim()) {
    return {
      status: 'PIPELINE_FAIL',
      scope: null,
      reason: 'Teacher feedback is empty, so repair scope cannot be selected safely.',
    };
  }
  if (/passage|whole text|throughout the text|article as a whole/.test(comment)) {
    return { status: 'PASS', scope: TEACHER_REPAIR_SCOPES.PASSAGE_LEVEL, reason: 'The feedback explicitly targets the passage.' };
  }
  if (/wrong (answer|key)|answer key|mark scheme|metadata|typo in the key/.test(comment)) {
    return { status: 'PASS', scope: TEACHER_REPAIR_SCOPES.KEY_METADATA, reason: 'The feedback targets the key or metadata.' };
  }
  if (Number(partNumber) === 1 && /two (valid|possible)|both (valid|possible)|ambiguous|another option|distractor/.test(comment)) {
    return { status: 'PASS', scope: TEACHER_REPAIR_SCOPES.DISTRACTOR_ONLY, reason: 'Part 1 ambiguity should be repaired at distractor level first.' };
  }
  if (Number(partNumber) === 3 && /deriv|base word|word family|target|stem|compound/.test(comment)) {
    return { status: 'PASS', scope: TEACHER_REPAIR_SCOPES.TARGET_REPLACEMENT, reason: 'The Part 3 lexical target is challenged.' };
  }
  if (Number(partNumber) === 4 && /meaning|equival|route|transformation|keyword|information (lost|added)/.test(comment)) {
    return { status: 'PASS', scope: TEACHER_REPAIR_SCOPES.TRANSFORMATION_REBUILD, reason: 'The Part 4 transformation route or equivalence is challenged.' };
  }
  return {
    status: 'PASS',
    scope: TEACHER_REPAIR_SCOPES.LOCAL_CONTEXT,
    reason: 'Use the smallest sentence/local-context repair unless stronger scope is explicit.',
  };
}

export function createTeacherRepairPlan({
  exam,
  examId,
  sourceVersion,
  partNumber,
  questionNumber: targetNumber,
  teacherComment,
  currentAnswer,
  localContext,
  requestedScope,
} = {}) {
  if (!exam || typeof exam !== 'object') {
    return { status: 'PIPELINE_FAIL', reason: 'Existing exam object is missing.' };
  }
  const working = clone(exam);
  const container = locateQuestionContainer(working, partNumber);
  if (!container) {
    return { status: 'PIPELINE_FAIL', reason: `Questions for Part ${partNumber} could not be located.` };
  }
  const index = container.owner[container.key].findIndex(
    (question) => questionNumber(question) === Number(targetNumber),
  );
  if (index === -1) {
    return { status: 'PIPELINE_FAIL', reason: `Question ${targetNumber} was not found in Part ${partNumber}.` };
  }
  const classification = classifyTeacherRepairScope({
    partNumber,
    teacherComment,
    requestedScope,
  });
  if (classification.status !== 'PASS') return classification;
  return {
    status: 'PASS',
    examId: String(examId || exam.id || ''),
    sourceVersion: String(sourceVersion || exam.version || 'unversioned'),
    partNumber: Number(partNumber),
    questionNumber: Number(targetNumber),
    teacherComment: String(teacherComment || ''),
    currentAnswer: currentAnswer ?? null,
    localContext: localContext ?? null,
    classification,
    originalExam: clone(exam),
    originalQuestion: clone(container.owner[container.key][index]),
    locator: { key: container.key, index },
  };
}

const KEY_FIELDS = new Set([
  'answer',
  'key',
  'correctAnswer',
  'modelAnswer',
  'modelAnswers',
  'grading_metadata',
  'metadata',
]);
const DISTRACTOR_FIELDS = new Set(['options', 'distractors']);
const LOCAL_FIELDS = new Set([
  'sentence',
  'sentence1',
  'sentence2',
  'sentence2Start',
  's1',
  's2WithGap',
  'completedS2',
  'context',
  'localContext',
  'options',
  'answer',
  'key',
  'correctAnswer',
]);

function allowedFieldsFor(scope) {
  if (scope === TEACHER_REPAIR_SCOPES.KEY_METADATA) return KEY_FIELDS;
  if (scope === TEACHER_REPAIR_SCOPES.DISTRACTOR_ONLY) return DISTRACTOR_FIELDS;
  if (scope === TEACHER_REPAIR_SCOPES.LOCAL_CONTEXT) return LOCAL_FIELDS;
  return null;
}

function statusFromValidators(results) {
  const verdicts = results.map((row) => row.verdict);
  if (verdicts.includes('PIPELINE_FAIL')) return 'PIPELINE_FAIL';
  if (verdicts.includes('HARD_FAIL')) return 'HARD_FAIL';
  if (verdicts.includes('QUALITY_FAIL')) return 'QUALITY_FAIL';
  return verdicts.length && verdicts.every((verdict) => verdict === 'PASS')
    ? 'PASS'
    : 'PIPELINE_FAIL';
}

export async function applyTeacherRepairPlan({
  plan,
  proposedQuestion,
  revisedPassage,
  localPassageEdit,
  newVersion,
  validatorsByPart = {},
} = {}) {
  if (!plan || plan.status !== 'PASS') {
    return { status: 'PIPELINE_FAIL', reason: 'A valid teacher repair plan is required.' };
  }
  if (!proposedQuestion || typeof proposedQuestion !== 'object') {
    return { status: 'PIPELINE_FAIL', reason: 'Proposed question patch is missing.' };
  }
  const scope = plan.classification.scope;
  const allowed = allowedFieldsFor(scope);
  const changedFields = Object.keys(proposedQuestion);
  if (allowed) {
    const forbidden = changedFields.filter((field) => !allowed.has(field));
    if (forbidden.length) {
      return {
        status: 'PIPELINE_FAIL',
        reason: `${scope} cannot change: ${forbidden.join(', ')}.`,
      };
    }
  }
  if (scope === TEACHER_REPAIR_SCOPES.PASSAGE_LEVEL && typeof revisedPassage !== 'string') {
    return { status: 'PIPELINE_FAIL', reason: 'Passage-level repair requires revisedPassage.' };
  }

  const candidateExam = clone(plan.originalExam);
  const container = locateQuestionContainer(candidateExam, plan.partNumber);
  if (!container) return { status: 'PIPELINE_FAIL', reason: 'Question container disappeared during cloning.' };
  const current = container.owner[container.key][plan.locator.index];
  const revisedQuestion = allowed
    ? { ...current, ...clone(proposedQuestion) }
    : { ...clone(proposedQuestion) };
  if (questionNumber(revisedQuestion) !== plan.questionNumber) {
    return { status: 'PIPELINE_FAIL', reason: 'Repair changed or removed the question number.' };
  }
  container.owner[container.key][plan.locator.index] = revisedQuestion;
  const revisedAnswer = answerValue(revisedQuestion);
  if (revisedAnswer !== undefined) {
    const answerContainer = locateModelAnswerContainer(candidateExam, plan.partNumber);
    const answerIndex = answerContainer?.owner[answerContainer.key].findIndex(
      (answer) =>
        questionNumber(answer) === plan.questionNumber ||
        (answer?.id && revisedQuestion?.id && answer.id === revisedQuestion.id),
    ) ?? -1;
    if (answerContainer && answerIndex !== -1) {
      answerContainer.owner[answerContainer.key][answerIndex] = {
        ...answerContainer.owner[answerContainer.key][answerIndex],
        answer: revisedAnswer,
        ...(revisedQuestion.transformationFamily
          ? { transformationFamily: revisedQuestion.transformationFamily }
          : {}),
      };
    }
  }
  if (localPassageEdit !== undefined) {
    if (![TEACHER_REPAIR_SCOPES.LOCAL_CONTEXT, TEACHER_REPAIR_SCOPES.TARGET_REPLACEMENT].includes(scope)) {
      return { status: 'PIPELINE_FAIL', reason: `${scope} cannot apply a local passage edit.` };
    }
    const originalText = String(localPassageEdit?.original || '');
    const revisedText = String(localPassageEdit?.revised || '');
    if (!originalText || !revisedText) {
      return { status: 'PIPELINE_FAIL', reason: 'A local passage edit requires non-empty original and revised text.' };
    }
    const passageOwner = typeof candidateExam.passage === 'string'
      ? candidateExam
      : candidateExam.content && typeof candidateExam.content.passage === 'string'
        ? candidateExam.content
        : null;
    if (!passageOwner) return { status: 'PIPELINE_FAIL', reason: 'No passage field exists for the local edit.' };
    const occurrences = passageOwner.passage.split(originalText).length - 1;
    if (occurrences !== 1) {
      return { status: 'PIPELINE_FAIL', reason: `The original local sentence occurred ${occurrences} times; exactly one is required.` };
    }
    const markerPattern = /\(\d+\)/g;
    const originalMarkers = originalText.match(markerPattern) || [];
    const revisedMarkers = revisedText.match(markerPattern) || [];
    if (JSON.stringify(originalMarkers) !== JSON.stringify(revisedMarkers)) {
      return { status: 'PIPELINE_FAIL', reason: 'A local passage edit cannot add, remove, or renumber question markers.' };
    }
    if (plan.partNumber === 3 && revisedQuestion.stem) {
      const printedBases = revisedText.match(/\(([A-Z]+)\)/g) || [];
      const expectedBase = `(${String(revisedQuestion.stem).toUpperCase()})`;
      if (!printedBases.includes(expectedBase)) {
        return { status: 'PIPELINE_FAIL', reason: `The revised local sentence does not preserve the structured Part 3 base ${expectedBase}.` };
      }
    }
    passageOwner.passage = passageOwner.passage.replace(originalText, revisedText);
  }
  if (scope === TEACHER_REPAIR_SCOPES.PASSAGE_LEVEL) {
    if ('passage' in candidateExam) candidateExam.passage = revisedPassage;
    else if (candidateExam.content && 'passage' in candidateExam.content) candidateExam.content.passage = revisedPassage;
    else return { status: 'PIPELINE_FAIL', reason: 'No passage field exists at a supported location.' };
  }
  candidateExam.version = String(newVersion || `${plan.sourceVersion}-teacher-repair`);
  candidateExam.derivedFromVersion = plan.sourceVersion;

  const configured = validatorsByPart[plan.partNumber];
  const validators = Array.isArray(configured) ? configured : configured ? [configured] : [];
  if (!validators.length) {
    return {
      status: 'PIPELINE_FAIL',
      reason: `No validators are configured for Part ${plan.partNumber}.`,
      candidateExam,
    };
  }
  const validatorResults = [];
  for (const validator of validators) {
    try {
      const output = await validator({
        exam: candidateExam,
        question: revisedQuestion,
        originalQuestion: plan.originalQuestion,
        plan,
      });
      if (!output || !['PASS', 'PIPELINE_FAIL', 'HARD_FAIL', 'QUALITY_FAIL'].includes(output.verdict)) {
        validatorResults.push({ verdict: 'PIPELINE_FAIL', reason: 'Validator returned an unsupported shape.' });
      } else {
        validatorResults.push(output);
      }
    } catch (error) {
      validatorResults.push({
        verdict: 'PIPELINE_FAIL',
        reason: `Validator threw: ${String(error?.message || error)}`,
      });
    }
  }
  const status = statusFromValidators(validatorResults);
  const record = {
    examId: plan.examId,
    sourceVersion: plan.sourceVersion,
    newVersion: candidateExam.version,
    part: plan.partNumber,
    question: plan.questionNumber,
    originalContent: clone(plan.originalQuestion),
    teacherFeedback: plan.teacherComment,
    repairClassification: scope,
    revisedContent: clone(revisedQuestion),
    originalAnswer: plan.currentAnswer,
    revisedAnswer: answerValue(revisedQuestion) ?? null,
    localPassageEdit: localPassageEdit ? clone(localPassageEdit) : null,
    reasonForChange: plan.classification.reason,
    validatorsRun: validatorResults,
    finalStatus: status,
  };
  return {
    status,
    originalExam: clone(plan.originalExam),
    candidateExam,
    acceptedExam: status === 'PASS' ? candidateExam : null,
    changeRecord: record,
  };
}
