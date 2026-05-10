import OpenAI from 'openai';
import type { CefrLevel } from '@prisma/client';
import { correctionReportSchema, type CorrectionReportPayload } from '../../domain/schemas';

/** Holistic report after full exam session — same JSON shape as correction for one UI. */
export async function runExamFinalReport(params: {
  cefr: CefrLevel;
  combinedTranscript: string;
  /** Practice = friendly wrap-up after a conversational session with the coach */
  context?: 'exam' | 'practice';
}): Promise<CorrectionReportPayload> {
  const ctx = params.context ?? 'exam';

  const systemContent =
    ctx === 'practice'
      ? [
          'You are a Cambridge-style speaking coach wrapping up after a conversational practice session (not an exam).',
          'The transcript is the learner’s replies only (possibly imperfect transcription).',
          'Output JSON only with keys as in holistic feedback: criteria (5), correctedVersion, modelAnswer, shortExplanation, pronunciation.',
          'Summarise strengths and weaknesses across all their answers; correctedVersion/modelAnswer should synthesise representative improvement (not verbatim replay).',
        ].join(' ')
      : [
          'You are a Cambridge speaking examiner reviewing the full exam.',
          'The transcript is the candidate’s spoken answers (possibly imperfect transcription).',
          'Output JSON only with keys as in correction mode: criteria (5), correctedVersion, modelAnswer, shortExplanation, pronunciation.',
          'This is an overall exam performance summary, not turn-by-turn teaching.',
        ].join(' ');

  const key = process.env.OPENAI_API_KEY;
  let raw = '';

  if (key) {
    const client = new OpenAI({ apiKey: key });
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
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
    raw = res.choices[0]?.message?.content ?? '';
  } else {
    raw = '';
  }

  if (!raw) {
    return mockExamReport(params.cefr);
  }

  try {
    const parsed = JSON.parse(raw);
    const safe = correctionReportSchema.safeParse(parsed);
    return safe.success ? safe.data : mockExamReport(params.cefr);
  } catch {
    return mockExamReport(params.cefr);
  }
}

function mockExamReport(cefr: CefrLevel): CorrectionReportPayload {
  return correctionReportSchema.parse({
    criteria: [
      { criterion: 'taskAchievement', score: 3, errors: [] },
      { criterion: 'grammar', score: 3, errors: [] },
      { criterion: 'vocabulary', score: 3, errors: [] },
      { criterion: 'fluency', score: 3, errors: [] },
      { criterion: 'pronunciation', score: 3, errors: [] },
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
  });
}
