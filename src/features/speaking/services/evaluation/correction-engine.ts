import OpenAI from 'openai';
import type { CefrLevel } from '@prisma/client';
import { correctionReportSchema, type CorrectionReportPayload } from '../../domain/schemas';

function buildCorrectionUserPrompt(cefr: CefrLevel, text: string, taskPrompt?: string) {
  return [
    taskPrompt ? `Task prompt: ${taskPrompt}` : '',
    `CEFR level: ${cefr}.`,
    `Student response:\n${text}`,
    'Return only JSON per the schema in the system message.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export async function runCorrectionEngine(params: {
  cefr: CefrLevel;
  text: string;
  taskPrompt?: string;
}): Promise<{ report: CorrectionReportPayload; raw: string }> {
  const systemContent = [
    'You are an expert Cambridge speaking examiner.',
    'You must output valid JSON only matching:',
    '{ "criteria": [ five objects with criterion taskAchievement|grammar|vocabulary|fluency|pronunciation, score 1-5, errors array ],',
    '"correctedVersion": string, "modelAnswer": string, "shortExplanation": string,',
    '"pronunciation": { "score": 1-5, "feedback": string, "isEstimated": boolean } }',
    'If judging from text-only, set pronunciation.isEstimated to true.',
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
          content: buildCorrectionUserPrompt(params.cefr, params.text, params.taskPrompt),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    raw = res.choices[0]?.message?.content ?? '';
  } else {
    raw = JSON.stringify(mockReport(params.cefr, params.text));
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = mockReport(params.cefr, params.text);
  }
  const safe = correctionReportSchema.safeParse(parsed);
  const report = safe.success ? safe.data : mockReport(params.cefr, params.text);
  return { report, raw };
}

function mockReport(cefr: CefrLevel, text: string): CorrectionReportPayload {
  return {
    criteria: [
      {
        criterion: 'taskAchievement',
        score: 3,
        errors: [{ excerpt: text.slice(0, 40), issue: 'Answer could be more developed', suggestion: 'Add one example.' }],
      },
      {
        criterion: 'grammar',
        score: 3,
        errors: [],
      },
      {
        criterion: 'vocabulary',
        score: 3,
        errors: [],
      },
      {
        criterion: 'fluency',
        score: 3,
        errors: [],
      },
      {
        criterion: 'pronunciation',
        score: 3,
        errors: [],
      },
    ],
    correctedVersion: text.trim() + ' (polished for clarity.)',
    modelAnswer: `A stronger ${cefr}-level answer would add reasons and extend the main idea with one concrete example.`,
    shortExplanation:
      'Focus on extending your answers with examples and checking subject-verb agreement.',
    pronunciation: {
      score: 3,
      feedback: 'Estimated from text. Connect audio for detailed judgement.',
      isEstimated: true,
    },
  };
}
