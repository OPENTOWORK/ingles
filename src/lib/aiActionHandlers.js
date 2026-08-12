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
import {
  findLevelsJustificacion,
  generateLevelsJustificacionWithOpenAI,
  saveLevelsJustificacion,
} from '@/lib/levelsJustificacionesServer';
import {
  isWritingEngineV3FlagEnabled,
  logWritingV3FlagBootOnce,
} from '@/features/writing/config/writing-v3-flags';
import { resolveWritingV3AccessForUser } from '@/features/writing/services/orchestration/writing-v3-access.server';
import { evaluateWritingV3 } from '@/features/writing/services/orchestration/evaluate-writing-v3.server';

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

  logWritingV3FlagBootOnce();

  const level = String(body.level || 'b2').trim().toLowerCase();
  // Client cannot force engine choice — only the server kill switch decides.
  void body.forceWritingV3;
  void body.engine;
  void body.forceLegacy;

  if (isWritingEngineV3FlagEnabled() && level === 'b2') {
    const access = await resolveWritingV3AccessForUser({
      userId,
      email: ctx.userEmail,
    });
    if (access.allowed) {
      const v3 = await evaluateWritingV3({
        user_id: userId,
        candidate_response: essay,
        structured_exam_context: body.structuredExamContext ?? null,
        task_context: body.taskContext ?? null,
        writing_type: body.writingType ?? null,
        submission_source:
          body.deferredExamMode === true ? 'exam_mode' : 'skill_practice',
        pregunta_id: body.pregunta_id ?? null,
        examen_id: body.examen_id ?? null,
        parte_numero: body.parte_numero ?? null,
      });

      if (v3.ok) {
        const usage = v3.usage_summary;
        await recordAiUsageSuccess({
          userId,
          userEmail: ctx.userEmail,
          accessToken: ctx.accessToken,
          action: AI_ACTIONS.EXAM_WRITING_CORRECTION,
          model: usage?.actual_models?.assessment || 'gpt-4o-2024-08-06',
          usage: usage
            ? {
                model: usage.actual_models.assessment || 'gpt-4o-2024-08-06',
                input_tokens: usage.input_tokens,
                output_tokens: usage.output_tokens,
                total_tokens: usage.total_tokens,
              }
            : undefined,
          metadata: {
            engine: 'v3',
            level,
            execution_id: v3.execution_id,
            submission_id: v3.submission_id,
            wordCount: v3.scores?.wordCount,
            deferredExamMode: body.deferredExamMode === true,
            token_source: 'provider_reported',
            cost_usd: usage?.cost_usd,
            latency_ms: usage?.latency_ms,
            retry_count: v3.usage?.filter((u) => u.retry).length ?? 0,
            // Compatibility: scores.total = raw_total for levels_puntuaciones writers.
            // Examiner does not apply the >=12 rule; progression adapters may.
            levels_puntuaciones: 'raw_total_via_scores_total',
          },
        });

        return {
          ok: true,
          result: {
            engine: 'v3',
            feedback: '',
            scores: v3.scores,
            feedback_payload: v3.feedback_payload,
            candidate_response: v3.candidate_response,
            task_prompt_snapshot: v3.task_prompt_snapshot,
            submission_id: v3.submission_id,
            execution_id: v3.execution_id,
            learner_history_applied: v3.learner_history_applied,
          },
        };
      }

      // Invalid/incomplete v3: never invent marks. Persist provenance already done.
      // Operational fallback: legacy once, only when no completed v3 assessment exists.
      await recordAiUsageFailure({
        userId,
        action: AI_ACTIONS.EXAM_WRITING_CORRECTION,
        model: v3.usage_summary?.actual_models?.assessment || 'gpt-4o-2024-08-06',
        errorCode: v3.code || 'WRITING_V3_FAILED',
        metadata: {
          engine: 'v3',
          level,
          execution_id: v3.execution_id,
          validation_status: v3.validation_status,
          fallback: 'legacy_once',
        },
      });

      const legacy = await evaluateCambridgeEssay({
        essay,
        level: body.level,
        taskContext: body.taskContext,
        structuredExamContext: body.structuredExamContext,
        wordMin: body.wordMin,
        wordMax: body.wordMax,
      });

      if (!legacy.ok) {
        return {
          ok: false,
          status: v3.status || legacy.status || 500,
          error: v3.error || legacy.error,
          code: v3.code || 'WRITING_V3_AND_LEGACY_FAILED',
          diagnostics: v3.diagnostics,
        };
      }

      const usage = usageFromTextEstimate(
        getDefaultModel(),
        essay + JSON.stringify(body.taskContext || body.structuredExamContext || ''),
        legacy.feedback || '',
      );
      await recordAiUsageSuccess({
        userId,
        userEmail: ctx.userEmail,
        accessToken: ctx.accessToken,
        action: AI_ACTIONS.EXAM_WRITING_CORRECTION,
        model: usage.model,
        usage,
        metadata: {
          engine: 'legacy',
          fallback_from: 'v3',
          v3_execution_id: v3.execution_id,
          v3_error: v3.code,
          level,
          // Single score path returned to client — prevents duplicate progression writes.
          progression_source: 'legacy_fallback_only',
          deferredExamMode: body.deferredExamMode === true,
        },
      });

      return {
        ok: true,
        result: {
          engine: 'legacy',
          fallback_from: 'v3',
          v3_execution_id: v3.execution_id,
          feedback: legacy.feedback,
          scores: legacy.scores,
        },
      };
    }
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
      metadata: { level: body.level, engine: 'legacy' },
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
      engine: 'legacy',
      wordCount: result.scores?.wordCount,
      deferredExamMode: body.deferredExamMode === true,
      kill_switch: !isWritingEngineV3FlagEnabled() ? 'off' : undefined,
    },
  });

  return {
    ok: true,
    result: { engine: 'legacy', feedback: result.feedback, scores: result.scores },
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
      sessionId: body.sessionId || null,
      b2PartNumber: body.b2PartNumber ?? null,
      context: body.context === 'practice' ? 'practice' : 'exam',
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

export async function handleExplainCorrectAnswer(userId, body, ctx = {}) {
  const respuestaId = body.respuestaId || body.respuesta_id || null;
  const respuestaAbiertaId = body.respuestaAbiertaId || body.respuesta_abierta_id || null;
  const preguntaId = body.preguntaId || body.pregunta_id || body.questionId || null;
  const itemNum =
    body.questionNumber != null
      ? Number(body.questionNumber)
      : body.itemNum != null
        ? Number(body.itemNum)
        : null;

  if (!body.correctChoiceText && !body.answerOptions && !body.answersFromDatabase) {
    return {
      ok: true,
      result: { found: false, message: 'Explanation temporarily unavailable.' },
    };
  }

  try {
    const explanation = await generateLevelsJustificacionWithOpenAI({
      ...body,
      exerciseType: body.exerciseType || body.style,
      questionText: body.questionText || body.contextSnippet,
      answerOptions: body.answerOptions || body.answersFromDatabase,
    });

    await saveLevelsJustificacion({
      respuestaId,
      respuestaAbiertaId,
      preguntaId,
      itemNum,
      justificacion: explanation,
    });

    const usage = usageFromTextEstimate(
      getFastModel(),
      JSON.stringify(body),
      explanation,
    );

    await recordAiUsageSuccess({
      userId,
      userEmail: ctx.userEmail,
      accessToken: ctx.accessToken,
      action: AI_ACTIONS.EXPLAIN_CORRECT_ANSWER,
      model: usage.model,
      usage,
      metadata: { preguntaId, respuestaId, respuestaAbiertaId, cached: false },
    });

    return { ok: true, result: { found: true, explanation, cached: false } };
  } catch (err) {
    await recordAiUsageFailure({
      userId,
      action: AI_ACTIONS.EXPLAIN_CORRECT_ANSWER,
      model: getFastModel(),
      errorCode: 'EXPLAIN_CORRECT_ANSWER_FAILED',
      metadata: { preguntaId, message: err?.message },
    });
    return {
      ok: true,
      result: { found: false, message: 'Explanation temporarily unavailable.' },
    };
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
