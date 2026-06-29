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
import {
  applyEvidenceCapsToScores,
  buildSpeakingEvidenceReport,
  capEstimatedLevel,
  enforceTotalCapOnScores,
  type SpeakingEvidenceMetadata,
  type SpeakingEvidenceReport,
} from './speaking-evidence-report';

function formatEvidenceForPrompt(evidence: SpeakingEvidenceReport): string {
  return [
    'Transcript evidence summary (server-computed — treat as authoritative):',
    `- Complete exam: ${evidence.isCompleteExam}`,
    `- Parts present: ${evidence.partsPresent.join(', ') || 'none'}`,
    `- Parts missing: ${evidence.partsMissing.join(', ') || 'none'}`,
    `- Total candidate words: ${evidence.totalCandidateWordCount}`,
    `- Non-English detected: ${evidence.nonEnglishDetected}`,
    `- Can provide full score: ${evidence.canProvideFullScore}`,
    ...evidence.evidenceNotes.map((n) => `- ${n}`),
  ].join('\n');
}

function mergeEvidenceIntoReport(
  parsed: Record<string, unknown>,
  evidence: SpeakingEvidenceReport,
): Record<string, unknown> {
  return {
    ...parsed,
    isPartialEvaluation: evidence.partialFeedback,
    partialEvaluationNote:
      'This is partial feedback. Complete all four parts to receive a full estimated Cambridge-style score.',
    canProvideFullScore: evidence.canProvideFullScore,
    partialFeedback: evidence.partialFeedback,
    isCompleteExam: evidence.isCompleteExam,
    speakingEvidence: {
      isCompleteExam: evidence.isCompleteExam,
      canProvideFullScore: evidence.canProvideFullScore,
      partialFeedback: evidence.partialFeedback,
      message: evidence.message,
      partsMissing: evidence.partsMissing,
      evidenceNotes: evidence.evidenceNotes,
      totalCandidateWordCount: evidence.totalCandidateWordCount,
      nonEnglishDetected: evidence.nonEnglishDetected,
    },
  };
}

/** Holistic report after full exam session — same JSON shape as correction for one UI. */
export async function runExamFinalReport(params: {
  cefr: CefrLevel;
  combinedTranscript: string;
  /** Practice = friendly wrap-up after a conversational session with the coach */
  context?: 'exam' | 'practice';
  evidenceMetadata?: SpeakingEvidenceMetadata;
}): Promise<CorrectionReportPayload> {
  const ctx = params.context ?? 'exam';
  const isB2Exam = params.cefr === 'B2' && ctx === 'exam';
  const evidence = isB2Exam
    ? buildSpeakingEvidenceReport(params.combinedTranscript, params.evidenceMetadata ?? {})
    : null;

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
            '- b2Speaking: { criteria: [{ key, label, score (0–5, half points ok), max: 5, multiplier }], shortSummary, partFeedback: [{ part, note }] }',
            '  shortSummary: 2–4 sentences covering estimated level, overall performance, and the main improvement priority (no per-part scores).',
            '  Use multipliers: grammar_vocabulary 2, discourse_management 2, pronunciation 2, interactive_communication 2, global_achievement 4.',
            '  Do NOT compute total — the app will compute total/60.',
            '- criteria: legacy array of 5 items (taskAchievement, grammar, vocabulary, fluency, pronunciation) with score 1–5 for backward compatibility',
            '- correctedVersion, modelAnswer, shortExplanation',
            '- pronunciation: { score, feedback, isEstimated: true } — always set isEstimated true (transcript-only).',
            'partFeedback is diagnostic only — no scores per part. Use exactly these part labels:',
            '"Part 1: Interview", "Part 2: Long turn", "Part 3: Collaborative task", "Part 4: Discussion".',
            'Official scoring is holistic across all parts only.',
            'Also include: strengths (array), mainErrors (array), improvedPhrases ([{original, improved, note}]), recommendations (array), practicePlan (array).',
            'STRICT SCORING RULES — do not be generous:',
            '- Use transcript evidence only. Do not assume fluency or pronunciation quality beyond what the transcript shows.',
            '- Do not award B2 if answers are short, undeveloped, incomplete, or include non-English responses.',
            '- Penalise lack of development, single-sentence answers, missing parts, and weak Part 2/3 interaction.',
            '- If the exam is incomplete or evidence is insufficient, set isPartialEvaluation: true and do NOT treat performance as a full B2 exam.',
            '- Keep pronunciation cautious (transcript-only): do not give high pronunciation bands without clear evidence.',
            'If the transcript indicates missing or incomplete parts, set isPartialEvaluation: true and partialEvaluationNote explaining what was not assessed.',
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
    const examUserContent = evidence
      ? `CEFR exam level: ${params.cefr}. Full transcript:\n\n${params.combinedTranscript}\n\n${formatEvidenceForPrompt(evidence)}`
      : `CEFR exam level: ${params.cefr}. Full transcript:\n\n${params.combinedTranscript}`;
    const { text } = await complete({
      system: systemContent,
      messages: [
        {
          role: 'user',
          content:
            ctx === 'practice'
              ? `CEFR practice level: ${params.cefr}. Combined learner transcript:\n\n${params.combinedTranscript}`
              : examUserContent,
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
    return mockExamReport(params.cefr, isB2Exam, params.combinedTranscript, evidence);
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const withB2 = attachB2SpeakingTotals(parsed, isB2Exam, evidence);
    const withEvidence = evidence ? mergeEvidenceIntoReport(withB2, evidence) : withB2;
    const safe = correctionReportSchema.safeParse(withEvidence);
    return safe.success
      ? safe.data
      : mockExamReport(params.cefr, isB2Exam, params.combinedTranscript, evidence);
  } catch {
    return mockExamReport(params.cefr, isB2Exam, params.combinedTranscript, evidence);
  }
}

function attachB2SpeakingTotals(
  parsed: Record<string, unknown>,
  isB2Exam: boolean,
  evidence: SpeakingEvidenceReport | null,
) {
  if (!isB2Exam || !parsed?.b2Speaking || typeof parsed.b2Speaking !== 'object') {
    return parsed;
  }

  const raw = parsed.b2Speaking as {
    criteria?: Array<{ key?: string; score?: number }>;
    partFeedback?: B2SpeakingScoreReportPayload['partFeedback'];
    shortSummary?: string;
  };

  const scores: Partial<Record<B2SpeakingCriterionKey, number>> = {};
  for (const item of raw.criteria || []) {
    if (item?.key && typeof item.score === 'number') {
      scores[item.key as B2SpeakingCriterionKey] = item.score;
    }
  }

  let cappedScores = evidence ? applyEvidenceCapsToScores(scores, evidence) : scores;
  if (evidence) {
    cappedScores = enforceTotalCapOnScores(cappedScores, evidence.maxTotalCap);
  }

  const report = buildB2SpeakingScoreReport(cappedScores, raw.partFeedback);
  const estimatedLevel = evidence
    ? capEstimatedLevel(report.estimatedLevel, evidence.maxLevelCap)
    : report.estimatedLevel;

  const shortSummary =
    typeof raw.shortSummary === 'string' && raw.shortSummary.trim()
      ? raw.shortSummary.trim()
      : typeof parsed.shortExplanation === 'string' && parsed.shortExplanation.trim()
        ? parsed.shortExplanation.trim()
        : evidence && !evidence.canProvideFullScore
          ? 'This is partial feedback based on incomplete exam evidence. Complete all four parts for a full estimate.'
          : `Your performance is currently around ${estimatedLevel}. Review the criteria and recommendations below for your main improvement priorities.`;

  return {
    ...parsed,
    b2Speaking: {
      ...report,
      estimatedLevel,
      shortSummary,
    },
  };
}

function mockExamReport(
  cefr: CefrLevel,
  isB2Exam = false,
  combinedTranscript = '',
  evidence: SpeakingEvidenceReport | null = null,
): CorrectionReportPayload {
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
    const resolvedEvidence =
      evidence ?? buildSpeakingEvidenceReport(combinedTranscript, {});
    const generous = {
      grammar_vocabulary: 3.5,
      discourse_management: 3.5,
      pronunciation: 4,
      interactive_communication: 3,
      global_achievement: 3.5,
    };
    let cappedScores = applyEvidenceCapsToScores(generous, resolvedEvidence);
    cappedScores = enforceTotalCapOnScores(cappedScores, resolvedEvidence.maxTotalCap);
    const b2Core = buildB2SpeakingScoreReport(cappedScores);
    const estimatedLevel = capEstimatedLevel(b2Core.estimatedLevel, resolvedEvidence.maxLevelCap);
    const partialSummary = resolvedEvidence.canProvideFullScore
      ? `Your performance is currently around ${estimatedLevel}. You communicate your ideas clearly, but you need more precise grammar and better development of longer answers.`
      : 'This is partial feedback based on incomplete exam evidence. Your answers are too limited for a full B2 estimate — complete all four parts and respond fully in English.';

    const merged = mergeEvidenceIntoReport(
      {
        ...base,
        b2Speaking: {
          ...b2Core,
          estimatedLevel,
          shortSummary: partialSummary,
          partFeedback: [
            { part: 'Part 1: Interview', note: 'Answers are relevant but could be extended with more detail.' },
            { part: 'Part 2: Long turn', note: 'Organise the long turn with a clearer opening and closing.' },
            { part: 'Part 3: Collaborative task', note: 'Respond more directly to your partner’s suggestions.' },
            { part: 'Part 4: Discussion', note: 'Support opinions with examples and link back to earlier points.' },
          ],
        },
      },
      resolvedEvidence,
    );
    return correctionReportSchema.parse(merged);
  }

  return correctionReportSchema.parse(base);
}
