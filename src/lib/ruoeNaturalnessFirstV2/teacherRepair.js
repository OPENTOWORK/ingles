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
    revisedAnswer: revisedQuestion.answer ?? revisedQuestion.key ?? revisedQuestion.correctAnswer ?? null,
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
