import { evaluateCambridgeEssay } from '@/lib/cambridgeEssayFeedback';
import { runErrorExtractor, runErrorExercises } from '@/lib/ai/services/errorTrackerService';
import { runSpeakingCoach } from '@/lib/ai/services/speakingCoachService';
import { runExamCoach, isValidExamCoachTaskType } from '@/lib/ai/services/examCoachService';
import { runRealLifeCoach, isValidRealLifeTaskType } from '@/lib/ai/services/realLifeCoachService';
import { runExamFinalReport } from '@/features/speaking/services/evaluation/exam-final-report';
import { getDefaultModel, getFastModel } from '@/lib/ai/draloAiEngine';
import {
  AI_ACTIONS,
  findQuestionExplanation,
  logAiUsage,
  getProductArea,
} from '@/lib/aiUsage';
import {
  chatWithUsage,
  recordAiUsageSuccess,
  recordAiUsageFailure,
  usageFromTextEstimate,
} from '@/lib/aiUsageRouteHelpers';
import {
  buildErrorExercisesPrompt,
  buildErrorExercisesUserMessage,
} from '@/lib/ai/prompts/errorTrackerPrompt';

function clip(text, max = 12000) {
  const t = String(text || '').trim();
  return t.length > max ? `${t.slice(0, max)}\n[…]` : t;
}

function supportsJsonResponseFormat(model) {
  const m = String(model || '').toLowerCase();
  return m.includes('gpt-4o') || m.includes('gpt-4.1') || m.includes('gpt-4-turbo');
}

function extractJson(text) {
  if (!text) return null;
  let cleaned = String(text).trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first !== -1 && last > first) {
      try {
        return JSON.parse(cleaned.slice(first, last + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** @param {string} userId @param {object} body @param {{ userEmail?: string, accessToken?: string | null }} [ctx] */
export async function handleExamWritingCorrection(userId, body, ctx = {}) {
  const essay = clip(body.essay, 16000);
  if (!essay) {
    return { ok: false, status: 400, error: 'essay is required' };
  }

  const result = await evaluateCambridgeEssay({
    essay,
    level: body.level,
    taskContext: body.taskContext,
    structuredExamContext: body.structuredExamContext,
    wordMin: body.wordMin,
    wordMax: body.wordMax,
  });

  if (!result.ok) {
    await recordAiUsageFailure({
      userId,
      action: AI_ACTIONS.EXAM_WRITING_CORRECTION,
      model: getDefaultModel(),
      errorCode: 'ESSAY_EVAL_FAILED',
      metadata: { level: body.level },
    });
    return { ok: false, status: result.status || 500, error: result.error };
  }

  const usage = usageFromTextEstimate(
    getDefaultModel(),
    essay + JSON.stringify(body.taskContext || body.structuredExamContext || ''),
    result.feedback || '',
  );

  await recordAiUsageSuccess({
    userId,
    userEmail: ctx.userEmail,
    accessToken: ctx.accessToken,
    action: AI_ACTIONS.EXAM_WRITING_CORRECTION,
    model: usage.model,
    usage,
    metadata: {
      level: body.level,
      wordCount: result.scores?.wordCount,
      deferredExamMode: body.deferredExamMode === true,
    },
  });

  return {
    ok: true,
    result: { feedback: result.feedback, scores: result.scores },
  };
}

/** Final speaking exam report — one count per completed simulation. */
export async function handleExamSpeakingFeedback(userId, body, ctx = {}) {
  const transcript = clip(body.combinedTranscript || body.text, 12000);
  const cefr = String(body.level || body.cefr || 'B2')
    .trim()
    .toUpperCase();
  if (!transcript) {
    return { ok: false, status: 400, error: 'transcript is required' };
  }

  try {
    const report = await runExamFinalReport({
      cefr,
      combinedTranscript: transcript,
      context: body.context === 'practice' ? 'practice' : 'exam',
      evidenceMetadata: body.evidenceMetadata ?? {
        partsCompleted: body.partsCompleted,
        startedAt: body.startedAt,
        endedAt: body.endedAt,
        responseDurationsSec: body.responseDurationsSec,
      },
    });

    const usage = usageFromTextEstimate(getDefaultModel(), transcript, JSON.stringify(report));
    await recordAiUsageSuccess({
      userId,
      userEmail: ctx.userEmail,
      accessToken: ctx.accessToken,
      action: AI_ACTIONS.EXAM_SPEAKING_FEEDBACK,
      model: usage.model,
      usage,
      metadata: { cefr, sessionId: body.sessionId || null },
    });

    return { ok: true, result: { report } };
  } catch (err) {
    await recordAiUsageFailure({
      userId,
      action: AI_ACTIONS.EXAM_SPEAKING_FEEDBACK,
      model: getDefaultModel(),
      errorCode: err?.message?.slice(0, 80) || 'SPEAKING_EVAL_FAILED',
    });
    return { ok: false, status: 500, error: err?.message || 'Speaking evaluation failed' };
  }
}

export async function handleExtractErrors(userId, body, ctx = {}) {
  const level = String(body.level || 'B2').trim().toUpperCase();
  const userText = clip(body.userText, 8000);
  const correctedText = clip(body.correctedText, 8000);
  const model = getFastModel();

  if (!userText && !correctedText) {
    return { ok: true, result: { errors: [] } };
  }

  try {
    const result = await runErrorExtractor({
      level,
      source: clip(body.source, 60),
      userText,
      correctedText,
    });

    const usage = usageFromTextEstimate(
      model,
      `${userText}\n${correctedText}`,
      JSON.stringify(result),
    );

    await recordAiUsageSuccess({
      userId,
      userEmail: ctx.userEmail,
      accessToken: ctx.accessToken,
      action: AI_ACTIONS.EXTRACT_ERRORS,
      model,
      usage,
      metadata: { level, errorCount: result.errors?.length ?? 0 },
    });

    return { ok: true, result };
  } catch (err) {
    await recordAiUsageFailure({
      userId,
      action: AI_ACTIONS.EXTRACT_ERRORS,
      model,
      errorCode: 'EXTRACT_ERRORS_FAILED',
    });
    return { ok: true, result: { errors: [] } };
  }
}

export async function handleGenerateErrorExercises(userId, body, ctx = {}) {
  const level = String(body.level || 'B2').trim().toUpperCase();
  const error = body.error && typeof body.error === 'object' ? body.error : {};
  const model = getFastModel();

  try {
    const { text, usage } = await chatWithUsage({
      systemPrompt: buildErrorExercisesPrompt({ level, error }),
      userMessage: buildErrorExercisesUserMessage({ level, error }),
      model,
      temperature: 0.5,
      max_tokens: 1400,
      ...(supportsJsonResponseFormat(model)
        ? { response_format: { type: 'json_object' } }
        : {}),
    });

    await recordAiUsageSuccess({
      userId,
      userEmail: ctx.userEmail,
      accessToken: ctx.accessToken,
      action: AI_ACTIONS.GENERATE_ERROR_EXERCISES,
      model,
      usage,
      metadata: { level },
    });

    const parsed = extractJson(text);
    if (!parsed) {
      const fallback = await runErrorExercises({ level, error });
      return { ok: true, result: fallback };
    }

    return {
      ok: true,
      result: {
        multipleChoice: parsed.multipleChoice || [],
        fillInTheGap: parsed.fillInTheGap || [],
        finalExplanation: parsed.finalExplanation || '',
      },
    };
  } catch (err) {
    await recordAiUsageFailure({
      userId,
      action: AI_ACTIONS.GENERATE_ERROR_EXERCISES,
      model,
      errorCode: 'GENERATE_EXERCISES_FAILED',
    });
    const fallback = await runErrorExercises({ level, error });
    return { ok: true, result: fallback };
  }
}

export async function handleExplainMistakeFromDb(userId, body) {
  const questionId = body.questionId || body.question_id || body.preguntaId;
  const wrongAnswer =
    body.wrongAnswer ??
    body.wrong_answer ??
    body.userAnswer ??
    body.userChoiceText;

  const row = await findQuestionExplanation({ questionId, wrongAnswer });

  await logAiUsage({
    user_id: userId,
    action: AI_ACTIONS.EXPLAIN_MISTAKE_FROM_DB,
    product_area: getProductArea(AI_ACTIONS.EXPLAIN_MISTAKE_FROM_DB),
    model: null,
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    estimated_cost_usd: 0,
    estimated_cost_eur: 0,
    success: true,
    metadata: { questionId, found: Boolean(row) },
  });

  if (!row) {
    return {
      ok: true,
      result: {
        found: false,
        message:
          'Explanation coming soon. For now, review the correct answer and try again.',
      },
    };
  }

  return {
    ok: true,
    result: {
      found: true,
      explanation: row.explanation,
      shortExplanation: row.short_explanation,
      example: row.example,
    },
  };
}

export async function handleDraloAiSpeakingMission(userId, body, ctx = {}) {
  const result = await runSpeakingCoach({
    level: String(body.level || 'B2').trim().toUpperCase(),
    missionTitle: clip(body.missionTitle || body.mission, 80),
    scenario: clip(body.scenario, 600),
    objectives: (Array.isArray(body.objectives) ? body.objectives : []).slice(0, 8),
    character: clip(body.character, 80),
    conversation: body.conversation,
    userMessage: clip(body.userMessage, 4000),
    finish: Boolean(body.finish),
  });

  const usage = usageFromTextEstimate(
    getDefaultModel(),
    JSON.stringify(body.conversation || body.userMessage || ''),
    JSON.stringify(result),
  );

  await recordAiUsageSuccess({
    userId,
    userEmail: ctx.userEmail,
    accessToken: ctx.accessToken,
    action: AI_ACTIONS.DRALO_AI_SPEAKING_MISSION,
    model: usage.model,
    usage,
    metadata: { finish: Boolean(body.finish) },
  });

  return { ok: true, result };
}

export async function handleDraloAiWritingCoach(userId, body, ctx = {}) {
  const taskType = body.taskType || 'writing_correction';
  if (!isValidExamCoachTaskType(taskType)) {
    return { ok: false, status: 400, error: `Invalid taskType: ${taskType}` };
  }

  const input = clip(body.userInput);
  const result = await runExamCoach({
    taskType,
    level: String(body.level || 'B2').trim().toUpperCase(),
    userInput: input,
    conversationHistory: body.conversationHistory || [],
  });

  const usage = usageFromTextEstimate(getDefaultModel(), input, JSON.stringify(result));
  await recordAiUsageSuccess({
    userId,
    userEmail: ctx.userEmail,
    accessToken: ctx.accessToken,
    action: AI_ACTIONS.DRALO_AI_WRITING_COACH,
    model: usage.model,
    usage,
    metadata: { taskType },
  });

  return { ok: true, result };
}

/** Log-only hook when admin exam generation runs elsewhere. */
export async function handleAdminGenerateExamLog(userId, body) {
  const usage = body.usage || usageFromTextEstimate(getDefaultModel(), '', JSON.stringify(body.result || ''));
  await recordAiUsageSuccess({
    userId,
    action: AI_ACTIONS.ADMIN_GENERATE_EXAM,
    model: body.model || usage.model,
    usage,
    metadata: {
      examLevel: body.examLevel,
      examPart: body.examPart,
      examTitle: body.examTitle,
      admin: true,
    },
  });
  return { ok: true, result: { logged: true } };
}

/** Legacy assistantType paths — map to dralo_ai_writing_coach or real life. */
export async function handleLegacyAssistantRequest(userId, body, isAdmin, ctx = {}) {
  const { assistantType, taskType, level, situation, userInput, conversationHistory } = body;
  const input = clip(userInput);
  const levelNorm = String(level || 'B2').trim().toUpperCase();

  if (assistantType === 'exam') {
    return handleDraloAiWritingCoach(userId, { ...body, taskType, userInput: input, level: levelNorm }, ctx);
  }
  if (assistantType === 'realLife') {
    if (!isValidRealLifeTaskType(taskType)) {
      return { ok: false, status: 400, error: `Invalid realLife taskType: ${taskType}` };
    }
    const result = await runRealLifeCoach({
      taskType,
      level: levelNorm,
      situation: clip(situation, 2000),
      userInput: input,
      conversationHistory: conversationHistory || [],
    });
    const usage = usageFromTextEstimate(getDefaultModel(), input, JSON.stringify(result));
    await recordAiUsageSuccess({
      userId,
      userEmail: ctx.userEmail,
      accessToken: ctx.accessToken,
      action: AI_ACTIONS.DRALO_AI_WRITING_COACH,
      model: usage.model,
      usage,
      metadata: { assistantType: 'realLife', taskType, admin: isAdmin },
    });
    return { ok: true, result, legacy: true };
  }
  return { ok: false, status: 400, error: 'Invalid assistantType' };
}

/** Normalize legacy action names to canonical AI_ACTIONS values. */
export function normalizeAction(raw) {
  const a = String(raw || '').trim();
  const map = {
    extract_errors: AI_ACTIONS.EXTRACT_ERRORS,
    generate_error_exercises: AI_ACTIONS.GENERATE_ERROR_EXERCISES,
    speaking_ai: AI_ACTIONS.DRALO_AI_SPEAKING_MISSION,
    writing_correction: AI_ACTIONS.DRALO_AI_WRITING_COACH,
  };
  return map[a] || a;
}
