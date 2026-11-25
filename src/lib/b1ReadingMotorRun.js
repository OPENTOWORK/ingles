/**
 * Isolated B1 Preliminary Reading pilot runner.
 * Writes only through the injected store. The pilot points that store at
 * b1_motor_dev_* tables. Tests and dry runs use an in-memory store.
 */
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

export function createMemoryB1MotorStore() {
  const exams = [];
  const parts = new Map();
  const keyOf = (examSlot, motorVersion, partNumber) => `${examSlot}:${motorVersion}:${partNumber}`;
  return {
    exams,
    parts,
    async getExistingExam(examSlot, motorVersion) {
      return exams.find((row) => row.exam_slot === examSlot && row.motor_version === motorVersion) || null;
    },
    async getCachedPart(examSlot, motorVersion, partNumber) {
      return parts.get(keyOf(examSlot, motorVersion, partNumber)) || null;
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
      if (payload?.validation?.ok !== true) {
        throw new Error(`Refusing to cache B1 Part ${partNumber} because validation did not pass.`);
      }
      parts.set(keyOf(examSlot, motorVersion, partNumber), {
        exam_slot: examSlot,
        motor_version: motorVersion,
        part_number: partNumber,
        payload,
        validation: payload.validation,
      });
    },
    async saveExam(row) {
      exams.push(row);
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
    if (cached?.payload && cached?.validation?.ok === true && cacheDecision.reuse) {
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
        topic: chosen.topic || null,
        context: chosen.context || null,
        grammarFocus: chosen.grammarFocus || null,
        warnings: cached.validation.warnings || [],
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
    if (!result?.validation?.ok) {
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
      allocation: chosen,
      generated: result.generated,
      validation: {
        ok: true,
        errors: [],
        warnings: result.validation.warnings || [],
        semanticQuality: result.validation.semanticQuality || null,
      },
    };
    await store.saveValidatedPart(examSlot, motorVersion, partNumber, partPayload);
    session.notePreservedPart(partNumber);
    parts.push(partPayload);
    summaries.push({
      partNumber,
      topic: chosen.topic || null,
      context: chosen.context || null,
      grammarFocus: chosen.grammarFocus || null,
      warnings: result.validation.warnings || [],
      cached: false,
    });
  }

  if (beforeSaveExam) await beforeSaveExam(parts);
  await store.saveExam({
    exam_slot: examSlot,
    motor_version: motorVersion,
    status: 'generated',
    payload: {
      examSlot,
      level: 'B1 Preliminary Reading',
      generatedAt: new Date().toISOString(),
      parts,
    },
    validation_summary: {
      allPartsPassed: true,
      parts: summaries,
    },
  });
  logger.log(`B1 Preliminary Reading Exam ${examSlot} generated successfully in isolated dev storage.`);
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
