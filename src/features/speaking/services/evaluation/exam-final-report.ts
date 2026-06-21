import {
  cambridgeChatCompletion,
  realLifeChatCompletion,
  isDraloOpenAIConfigured,
} from '@/lib/draloAiEngine';
import type { CefrLevel } from '@prisma/client';
import {
  correctionReportSchema,
  type CorrectionReportPayload,
  type B2SpeakingScoreReportPayload,
} from '../../domain/schemas';
import {
  buildB2SpeakingScoreReport,
  type B2SpeakingCriterionKey,
} from '../../domain/b2-speaking-score';

/** Holistic report after full exam session — same JSON shape as correction for one UI. */
export async function runExamFinalReport(params: {
  cefr: CefrLevel;
  combinedTranscript: string;
  /** Practice = friendly wrap-up after a conversational session with the coach */
  context?: 'exam' | 'practice';
}): Promise<CorrectionReportPayload> {
  const ctx = params.context ?? 'exam';
  const isB2Exam = params.cefr === 'B2' && ctx === 'exam';

  const systemContent =
    ctx === 'practice'
      ? [
          'You are a Cambridge-style speaking coach wrapping up after a conversational practice session (not an exam).',
          'The transcript is the learner’s replies only (possibly imperfect transcription).',
          'Output JSON only with keys as in holistic feedback: criteria (5), correctedVersion, modelAnswer, shortExplanation, pronunciation.',
          'Summarise strengths and weaknesses across all their answers; correctedVersion/modelAnswer should synthesise representative improvement (not verbatim replay).',
        ].join(' ')
      : isB2Exam
        ? [
            'You are a Cambridge B2 First speaking examiner reviewing the FULL four-part speaking test.',
            'The transcript is the candidate’s spoken answers only (possibly imperfect transcription).',
            'Cambridge does NOT give a separate mark per part — assess performance across all four parts.',
            'Score using official B2 First Speaking criteria (bands 0–5, half points allowed e.g. 3.5):',
            '- grammar_vocabulary (Grammar and Vocabulary)',
            '- discourse_management (Discourse Management — especially Part 2 long turn organisation)',
            '- pronunciation (Pronunciation)',
            '- interactive_communication (Interactive Communication — especially Part 3 collaborative task)',
            '- global_achievement (Global Achievement)',
            'Output JSON only with keys:',
            '- b2Speaking: { criteria: [{ key, label, score (0–5, half points ok), max: 5, multiplier }], partFeedback: [{ part, note }] }',
            '  Use multipliers: grammar_vocabulary 2, discourse_management 2, pronunciation 2, interactive_communication 2, global_achievement 4.',
            '  Do NOT compute total — the app will compute total/60.',
            '- criteria: legacy array of 5 items (taskAchievement, grammar, vocabulary, fluency, pronunciation) with score 1–5 for backward compatibility',
            '- correctedVersion, modelAnswer, shortExplanation',
            '- pronunciation: { score, feedback, isEstimated: true }',
            'Provide partFeedback notes for Parts 1–4 but official scoring is holistic only.',
          ].join(' ')
        : [
            'You are a Cambridge speaking examiner reviewing the full exam.',
            'The transcript is the candidate’s spoken answers (possibly imperfect transcription).',
            'Output JSON only with keys as in correction mode: criteria (5), correctedVersion, modelAnswer, shortExplanation, pronunciation.',
            'This is an overall exam performance summary, not turn-by-turn teaching.',
          ].join(' ');

  let raw = '';

  if (isDraloOpenAIConfigured()) {
    const complete =
      ctx === 'practice' ? realLifeChatCompletion : cambridgeChatCompletion;
    const { text } = await complete({
      system: systemContent,
      messages: [
        {
          role: 'user',
          content:
            ctx === 'practice'
              ? `CEFR practice level: ${params.cefr}. Combined learner transcript:\n\n${params.combinedTranscript}`
              : `CEFR exam level: ${params.cefr}. Full transcript:\n\n${params.combinedTranscript}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    raw = text ?? '';
  } else {
    raw = '';
  }

  if (!raw) {
    return mockExamReport(params.cefr, isB2Exam);
  }

  try {
    const parsed = JSON.parse(raw);
    const withB2 = attachB2SpeakingTotals(parsed, isB2Exam);
    const safe = correctionReportSchema.safeParse(withB2);
    return safe.success ? safe.data : mockExamReport(params.cefr, isB2Exam);
  } catch {
    return mockExamReport(params.cefr, isB2Exam);
  }
}

function attachB2SpeakingTotals(parsed: Record<string, unknown>, isB2Exam: boolean) {
  if (!isB2Exam || !parsed?.b2Speaking || typeof parsed.b2Speaking !== 'object') {
    return parsed;
  }

  const raw = parsed.b2Speaking as {
    criteria?: Array<{ key?: string; score?: number }>;
    partFeedback?: B2SpeakingScoreReportPayload['partFeedback'];
  };

  const scores: Partial<Record<B2SpeakingCriterionKey, number>> = {};
  for (const item of raw.criteria || []) {
    if (item?.key && typeof item.score === 'number') {
      scores[item.key as B2SpeakingCriterionKey] = item.score;
    }
  }

  const report = buildB2SpeakingScoreReport(scores, raw.partFeedback);
  return {
    ...parsed,
    b2Speaking: report,
  };
}

function mockExamReport(cefr: CefrLevel, isB2Exam = false): CorrectionReportPayload {
  const base = {
    criteria: [
      { criterion: 'taskAchievement' as const, score: 3, errors: [] },
      { criterion: 'grammar' as const, score: 3, errors: [] },
      { criterion: 'vocabulary' as const, score: 3, errors: [] },
      { criterion: 'fluency' as const, score: 3, errors: [] },
      { criterion: 'pronunciation' as const, score: 3, errors: [] },
    ],
    correctedVersion: '',
    modelAnswer: `Overall, aim for more development at ${cefr}: extend answers with examples and discourse markers.`,
    shortExplanation:
      'Exam-style feedback is generated from your full transcript. Connect OpenAI for detailed scoring.',
    pronunciation: {
      score: 3,
      feedback: 'Estimated overall from text. For phoneme-level detail, use recorded audio.',
      isEstimated: true,
    },
  };

  if (isB2Exam) {
    return correctionReportSchema.parse({
      ...base,
      b2Speaking: buildB2SpeakingScoreReport({
        grammar_vocabulary: 3.5,
        discourse_management: 3.5,
        pronunciation: 4,
        interactive_communication: 3,
        global_achievement: 3.5,
      }),
    });
  }

  return correctionReportSchema.parse(base);
}
