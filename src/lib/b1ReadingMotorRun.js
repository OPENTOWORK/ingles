/**
 * Isolated B1 Preliminary Reading pilot runner.
 * Writes only through the injected store. The pilot points that store at
 * b1_motor_dev_* tables. Tests and dry runs use an in-memory store.
 */
import fs from 'node:fs';
import path from 'node:path';

import {
  B1ReadingMotorSession,
  isB1MotorStopError,
  resolveB1MotorConfig,
  runWithB1ReadingMotorSession,
  scrubReport,
  scrubString,
  writeB1MotorDiagnosticReport,
} from '@/lib/b1ReadingMotorGuard';
import { assessB1CacheReuse, B1_READING_RULES_VERSION } from '@/lib/b1ReadingRules';

const MOTOR_VERSION = 'b1-reading-pilot-v7';

function formatTopic(chosen = {}) {
  return [
    chosen.topic,
    chosen.context ? `context/genre: ${chosen.context}` : null,
    chosen.grammarFocus ? `grammar focus: ${chosen.grammarFocus}` : null,
  ].filter(Boolean).join('; ');
}

async function defaultGeneratePart({ examSlot, partNumber, topic, varietySeed }) {
  const { generatePartJsonWithRetries } = await import('@/lib/levelsCambridgeExamGenerator');
  const { getLevelExamLabel, getLevelExamPartDef } = await import('@/lib/levelsExamCatalog');
  const partDef = getLevelExamPartDef('b1', partNumber);
  if (!partDef) throw new Error(`Missing B1 Reading Part ${partNumber} definition.`);
  return generatePartJsonWithRetries('b1', getLevelExamLabel('b1'), partDef, {
    examSlot,
    topic,
    varietySeed,
  });
}

function reviewRow(examSlot, motorVersion, partNumber, payload) {
  return {
    exam_slot: examSlot,
    motor_version: motorVersion,
    part_number: partNumber,
    payload,
    validation: payload.validation,
  };
}

export function createMemoryB1MotorStore() {
  const exams = [];
  const parts = new Map();
  const drafts = new Map();
  const rejected = new Map();
  const keyOf = (examSlot, motorVersion, partNumber) => `${examSlot}:${motorVersion}:${partNumber}`;
  return {
    exams,
    parts,
    drafts,
    rejected,
    async getExistingExam(examSlot, motorVersion) {
      return exams.find((row) => row.exam_slot === examSlot && row.motor_version === motorVersion) || null;
    },
    async getCachedPart(examSlot, motorVersion, partNumber) {
      return parts.get(keyOf(examSlot, motorVersion, partNumber)) || null;
    },
    async getTeacherReviewDraft(examSlot, motorVersion, partNumber) {
      return drafts.get(keyOf(examSlot, motorVersion, partNumber)) || null;
    },
    async listCachedParts(examSlot, motorVersion) {
      const rows = [];
      for (const [key, row] of parts.entries()) {
        if (!key.startsWith(`${examSlot}:${motorVersion}:`)) continue;
        if (row?.validation?.ok === true) {
          rows.push({ partNumber: row.part_number, payload: row.payload, validation: row.validation });
        }
      }
      return rows.sort((a, b) => a.partNumber - b.partNumber);
    },
    async saveValidatedPart(examSlot, motorVersion, partNumber, payload) {
      if (payload?.validation?.ok !== true || payload?.reviewStatus === 'teacher_review_draft') {
        throw new Error(`Refusing to cache B1 Part ${partNumber} because validation did not pass.`);
      }
      parts.set(keyOf(examSlot, motorVersion, partNumber), reviewRow(examSlot, motorVersion, partNumber, payload));
    },
    async saveTeacherReviewDraft(examSlot, motorVersion, partNumber, payload) {
      if (payload?.reviewStatus !== 'teacher_review_draft' || payload?.validation?.ok === true) {
        throw new Error(`Refusing to store B1 Part ${partNumber} as a teacher-review draft.`);
      }
      drafts.set(keyOf(examSlot, motorVersion, partNumber), reviewRow(examSlot, motorVersion, partNumber, payload));
    },
    async saveRejectedPart(examSlot, motorVersion, partNumber, payload) {
      rejected.set(keyOf(examSlot, motorVersion, partNumber), reviewRow(examSlot, motorVersion, partNumber, payload));
    },
    async saveExam(row) {
      exams.push(row);
    },
  };
}

export function createFileB1MotorStore(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const examFile = path.join(dir, 'exam.json');
  const partFile = (partNumber) => path.join(dir, `part-${partNumber}.json`);
  const draftFile = (partNumber) => path.join(dir, `part-${partNumber}.draft.json`);
  const rejectedFile = (partNumber) => path.join(dir, `part-${partNumber}.rejected.json`);
  const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null);
  const writeJson = (file, payload) => {
    fs.writeFileSync(file, `${JSON.stringify({ payload, validation: payload.validation }, null, 2)}\n`);
  };
  return {
    async getExistingExam() {
      return readJson(examFile);
    },
    async getCachedPart(_examSlot, _motorVersion, partNumber) {
      return readJson(partFile(partNumber));
    },
    async getTeacherReviewDraft(_examSlot, _motorVersion, partNumber) {
      return readJson(draftFile(partNumber));
    },
    async listCachedParts() {
      const rows = [];
      for (let partNumber = 1; partNumber <= 6; partNumber += 1) {
        const row = readJson(partFile(partNumber));
        if (row?.validation?.ok === true && row?.payload?.reviewStatus !== 'teacher_review_draft') {
          rows.push({ partNumber, payload: row.payload, validation: row.validation });
        }
      }
      return rows;
    },
    async saveValidatedPart(_examSlot, _motorVersion, partNumber, payload) {
      if (payload?.validation?.ok !== true || payload?.reviewStatus === 'teacher_review_draft') {
        throw new Error(`Refusing to cache B1 Part ${partNumber} because validation did not pass.`);
      }
      writeJson(partFile(partNumber), payload);
    },
    async saveTeacherReviewDraft(_examSlot, _motorVersion, partNumber, payload) {
      if (payload?.reviewStatus !== 'teacher_review_draft' || payload?.validation?.ok === true) {
        throw new Error(`Refusing to store B1 Part ${partNumber} as a teacher-review draft.`);
      }
      writeJson(draftFile(partNumber), payload);
    },
    async saveRejectedPart(_examSlot, _motorVersion, partNumber, payload) {
      if (payload?.reviewStatus === 'validated_candidate' || payload?.reviewStatus === 'teacher_review_draft') {
        throw new Error(`Refusing to mix B1 Part ${partNumber} into the rejected store.`);
      }
      writeJson(rejectedFile(partNumber), payload);
    },
    async saveExam(row) {
      fs.writeFileSync(examFile, `${JSON.stringify(row, null, 2)}\n`);
    },
  };
}

export function createSupabaseB1MotorStore(admin) {
  return {
    async getExistingExam(examSlot, motorVersion) {
      const { data, error } = await admin
        .from('b1_motor_dev_generated_exams')
        .select('id,status,created_at')
        .eq('exam_slot', examSlot)
        .eq('motor_version', motorVersion)
        .maybeSingle();
      if (error) throw new Error(`Could not read isolated B1 pilot table: ${error.message}`);
      return data;
    },
    async getCachedPart(examSlot, motorVersion, partNumber) {
      const { data, error } = await admin
        .from('b1_motor_dev_generated_parts')
        .select('payload,validation,created_at')
        .eq('exam_slot', examSlot)
        .eq('motor_version', motorVersion)
        .eq('part_number', partNumber)
        .maybeSingle();
      if (error) throw new Error(`Could not read isolated B1 part cache for Part ${partNumber}: ${error.message}`);
      return data;
    },
    async listCachedParts(examSlot, motorVersion) {
      const { data, error } = await admin
        .from('b1_motor_dev_generated_parts')
        .select('part_number,payload,validation')
        .eq('exam_slot', examSlot)
        .eq('motor_version', motorVersion);
      if (error) throw new Error(`Could not list isolated B1 part cache: ${error.message}`);
      return (data || [])
        .filter((row) => row?.validation?.ok === true)
        .map((row) => ({
          partNumber: row.part_number,
          payload: row.payload,
          validation: row.validation,
        }))
        .sort((a, b) => a.partNumber - b.partNumber);
    },
    async saveValidatedPart(examSlot, motorVersion, partNumber, payload) {
      if (payload?.validation?.ok !== true) {
        throw new Error(`Refusing to cache B1 Part ${partNumber} because validation did not pass.`);
      }
      const { error } = await admin
        .from('b1_motor_dev_generated_parts')
        .upsert({
          exam_slot: examSlot,
          motor_version: motorVersion,
          part_number: partNumber,
          payload,
          validation: payload.validation,
        }, { onConflict: 'exam_slot,motor_version,part_number' });
      if (error) throw new Error(`Could not save isolated B1 part cache for Part ${partNumber}: ${error.message}`);
    },
    async saveExam(row) {
      const { error } = await admin.from('b1_motor_dev_generated_exams').insert(row);
      if (error) throw new Error(`Could not save isolated B1 pilot payload: ${error.message}`);
    },
    async getTeacherReviewDraft() {
      return null;
    },
    async saveTeacherReviewDraft() {
      throw new Error('Teacher-review drafts are stored only in the local pilot cache, not in Supabase.');
    },
    async saveRejectedPart() {
      throw new Error('Rejected B1 drafts are stored only in the local pilot cache, not in Supabase.');
    },
  };
}

async function executeRun(session, options) {
  const {
    examSlot,
    motorVersion,
    store,
    partNumbers,
    chooseVariety,
    generatePart,
    beforeSaveExam,
    logger,
  } = options;

  const existing = await store.getExistingExam(examSlot, motorVersion);
  if (existing?.id || existing?.exam_slot) {
    return { ok: true, skipped: true, existing, parts: [] };
  }

  const parts = [];
  const summaries = [];
  for (const partNumber of partNumbers) {
    const cached = await store.getCachedPart(examSlot, motorVersion, partNumber);
    const cacheDecision = assessB1CacheReuse(cached?.payload, partNumber);
    if (cached?.payload && cached?.validation?.ok === true && cached?.payload?.reviewStatus !== 'teacher_review_draft' && cacheDecision.reuse) {
      const chosen = cached.payload.allocation || {};
      logger.log(
        cacheDecision.explicit
          ? `Reusing cached B1 Exam ${examSlot} Part ${partNumber} by explicit rules compatibility: ${cacheDecision.reason}`
          : `Reusing validated cached B1 Exam ${examSlot} Part ${partNumber}: ${formatTopic(chosen)}`,
      );
      parts.push(cached.payload);
      session.notePreservedPart(partNumber);
      summaries.push({
        partNumber,
        reviewStatus: 'validated_candidate',
        automatedValidation: 'passed',
        teacherApproval: 'pending',
        topic: chosen.topic || null,
        context: chosen.context || null,
        grammarFocus: chosen.grammarFocus || null,
        warnings: cached.validation.warnings || [],
        cached: true,
      });
      continue;
    }
    const savedDraft = typeof store.getTeacherReviewDraft === 'function'
      ? await store.getTeacherReviewDraft(examSlot, motorVersion, partNumber)
      : null;
    if (
      savedDraft?.payload?.reviewStatus === 'teacher_review_draft'
      && savedDraft.payload.rulesVersion === B1_READING_RULES_VERSION
      && savedDraft.validation?.ok !== true
    ) {
      logger.log(`Reusing B1 Exam ${examSlot} Part ${partNumber} as a teacher-review draft. It is not validated.`);
      parts.push(savedDraft.payload);
      session.noteTeacherReviewDraft(partNumber);
      summaries.push({
        partNumber,
        reviewStatus: 'teacher_review_draft',
        automatedValidation: 'not_approved',
        teacherApproval: 'pending',
        topic: savedDraft.payload.allocation?.topic || null,
        context: savedDraft.payload.allocation?.context || null,
        grammarFocus: savedDraft.payload.allocation?.grammarFocus || null,
        warnings: savedDraft.payload.pedagogicalWarnings || [],
        cached: true,
      });
      continue;
    }

    const chosen = await chooseVariety({ examSlot, partNumber });
    const topic = formatTopic(chosen);
    logger.log(`Generating B1 Exam ${examSlot} Part ${partNumber}: ${topic}`);
    const result = await generatePart({
      examSlot,
      partNumber,
      topic,
      varietySeed: 110120 + partNumber,
    });
    const review = result?.validation?.review;
    if (review?.reviewStatus === 'teacher_review_draft') {
      const partPayload = {
        partNumber,
        rulesVersion: B1_READING_RULES_VERSION,
        reviewStatus: 'teacher_review_draft',
        automatedValidation: 'not_approved',
        teacherApproval: 'pending',
        humanTeacherApproved: false,
        allocation: chosen,
        generated: result.generated,
        critical: review.critical || [],
        pedagogicalWarnings: review.pedagogicalWarnings || [],
        validation: {
          ok: false,
          errors: review.critical || [],
          warnings: review.pedagogicalWarnings || [],
          semanticQuality: result.validation.semanticQuality || null,
          reviewStatus: 'teacher_review_draft',
          automatedValidation: 'not_approved',
          teacherApproval: 'pending',
          humanTeacherApproved: false,
        },
      };
      await store.saveTeacherReviewDraft(examSlot, motorVersion, partNumber, partPayload);
      session.noteTeacherReviewDraft(partNumber);
      parts.push(partPayload);
      summaries.push({
        partNumber,
        reviewStatus: 'teacher_review_draft',
        automatedValidation: 'not_approved',
        teacherApproval: 'pending',
        topic: chosen.topic || null,
        context: chosen.context || null,
        grammarFocus: chosen.grammarFocus || null,
        warnings: review.pedagogicalWarnings || [],
        cached: false,
      });
      continue;
    }

    if (!result?.validation?.ok || review?.reviewStatus !== 'validated_candidate') {
      const messages = result?.validation?.errors || ['Validation failed without a diagnostic message.'];
      const decision = session.recordAttemptFailure(partNumber, messages);
      throw session.createStopError({
        reason: decision.reason || 'attempt_limit',
        failureCategory: decision.failureCategory,
        detail: 'The part returned without passing validation.',
      });
    }

    const partPayload = {
      partNumber,
      rulesVersion: B1_READING_RULES_VERSION,
      reviewStatus: 'validated_candidate',
      automatedValidation: 'passed',
      teacherApproval: 'pending',
      humanTeacherApproved: false,
      allocation: chosen,
      generated: result.generated,
      critical: [],
      pedagogicalWarnings: [],
      validation: {
        ok: true,
        errors: [],
        warnings: result.validation.warnings || [],
        semanticQuality: result.validation.semanticQuality || null,
        reviewStatus: 'validated_candidate',
        automatedValidation: 'passed',
        teacherApproval: 'pending',
        humanTeacherApproved: false,
      },
    };
    await store.saveValidatedPart(examSlot, motorVersion, partNumber, partPayload);
    session.notePreservedPart(partNumber);
    parts.push(partPayload);
    summaries.push({
      partNumber,
      reviewStatus: 'validated_candidate',
      automatedValidation: 'passed',
      teacherApproval: 'pending',
      topic: chosen.topic || null,
      context: chosen.context || null,
      grammarFocus: chosen.grammarFocus || null,
      warnings: result.validation.warnings || [],
      cached: false,
    });
  }

  const allValidated = parts.length > 0 && parts.every((part) => part.reviewStatus === 'validated_candidate');
  if (beforeSaveExam) await beforeSaveExam(parts);
  await store.saveExam({
    exam_slot: examSlot,
    motor_version: motorVersion,
    status: allValidated ? 'generated' : 'teacher_review',
    payload: {
      examSlot,
      level: 'B1 Preliminary Reading',
      generatedAt: new Date().toISOString(),
      rulesVersion: B1_READING_RULES_VERSION,
      automatedValidation: allValidated ? 'passed' : 'not_approved',
      teacherApproval: 'pending',
      humanTeacherApproved: false,
      parts,
    },
    validation_summary: {
      allPartsPassed: allValidated,
      automatedValidation: allValidated ? 'passed' : 'not_approved',
      teacherApproval: 'pending',
      humanTeacherApproved: false,
      parts: summaries,
    },
  });
  logger.log(allValidated
    ? `B1 Preliminary Reading Exam ${examSlot} generated successfully in isolated dev storage.`
    : `B1 Preliminary Reading Exam ${examSlot} saved for teacher review. Automated validation did not approve every part.`);
  return { ok: true, skipped: false, parts, summaries };
}

export async function runB1ReadingMotor(options = {}) {
  const examSlot = Number(options.examSlot || 1);
  const motorVersion = options.motorVersion || MOTOR_VERSION;
  const store = options.store;
  if (!store) throw new Error('B1 reading motor run requires a store.');
  const config = resolveB1MotorConfig({
    maxAttemptsPerPart: options.maxAttemptsPerPart,
    spendCapUsd: options.spendCapUsd,
    maxElapsedMs: options.maxElapsedMs,
    maxConsecutiveNoProgress: options.maxConsecutiveNoProgress,
    sameCategoryLimit: options.sameCategoryLimit,
    maxTransientRetries: options.maxTransientRetries,
    backoffBaseMs: options.backoffBaseMs,
    backoffMaxMs: options.backoffMaxMs,
    dryRun: options.dryRun,
    callEstimateUsd: options.callEstimateUsd,
  });
  const session = new B1ReadingMotorSession(config, {
    sleep: options.sleep,
    now: options.now,
    mockModel: options.mockModel,
  });
  session.examSlot = examSlot;
  session.motorVersion = motorVersion;
  const logger = options.logger || console;
  const runOptions = {
    examSlot,
    motorVersion,
    store,
    partNumbers: options.partNumbers || [1, 2, 3, 4, 5, 6],
    chooseVariety: options.chooseVariety || (async () => ({
      topic: 'a local library',
      context: 'everyday notice',
      grammarFocus: null,
    })),
    generatePart: options.generatePart || defaultGeneratePart,
    beforeSaveExam: options.beforeSaveExam,
    logger,
  };

  try {
    const value = await runWithB1ReadingMotorSession(session, () => executeRun(session, runOptions));
    return {
      ...value,
      report: scrubReport(session.buildReport({
        reason: 'completed',
        failureCategory: null,
      })),
    };
  } catch (error) {
    if (!isB1MotorStopError(error)) throw error;
    if (session.unusableDraft && typeof store.saveRejectedPart === 'function') {
      try {
        const draft = session.unusableDraft;
        await store.saveRejectedPart(examSlot, motorVersion, draft.partNumber, {
          partNumber: draft.partNumber,
          rulesVersion: B1_READING_RULES_VERSION,
          reviewStatus: 'invalid',
          automatedValidation: 'not_approved',
          teacherApproval: 'pending',
          humanTeacherApproved: false,
          generated: draft.generated,
          validation: {
            ...(draft.validation || {}),
            ok: false,
            reviewStatus: 'invalid',
            automatedValidation: 'not_approved',
            teacherApproval: 'pending',
            humanTeacherApproved: false,
          },
        });
      } catch (saveError) {
        logger.error(`Could not save rejected B1 draft locally: ${scrubString(saveError?.message || saveError)}`);
      }
    }
    let preserved = session.preservedPartNumbers;
    try {
      const rows = await store.listCachedParts(examSlot, motorVersion);
      preserved = rows.map((row) => row.partNumber);
    } catch (listError) {
      logger.error(`Could not list cached B1 parts after stop: ${scrubString(listError?.message || listError)}`);
    }
    const report = scrubReport({
      ...error.report,
      preservedPartNumbers: preserved,
    });
    let reportFile = null;
    if (options.reportDir) {
      reportFile = writeB1MotorDiagnosticReport(report, options.reportDir);
    }
    logger.error(
      `B1 Exam ${report.examSlot} Part ${report.partNumber} stopped (${report.reason}, ${report.failureCategory}) after ${report.attempts} attempt(s). Approximate spend USD ${report.approximateCostUsd}.`,
    );
    logger.error(report.recommendedAction);
    if (reportFile) logger.error(`Diagnostic report: ${reportFile}`);
    return { ok: false, stopped: true, report, reportFile, parts: [] };
  }
}

export { MOTOR_VERSION as B1_READING_MOTOR_VERSION };
