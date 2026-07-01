import type { CefrLevel } from '@prisma/client';
import { getDraloOpenAI, isDraloOpenAIConfigured, realLifeChatCompletion } from '@/lib/draloAiEngine';
import {
  B2_SPEAKING_FEEDBACK_JSON_SCHEMA,
  B2_SPEAKING_FEEDBACK_SYSTEM_PROMPT,
} from '@/lib/ai/prompts/b2SpeakingFeedbackPrompt';
import { loadSpeakingSessionEvaluationContext } from '@/lib/speakingRespuestasServer';
import { B2_SPEAKING_PART_MIN } from '../../domain/b2-speaking-exam-parts';
import {
  buildB2SpeakingScoreReport,
  clampB2SpeakingBand,
} from '../../domain/b2-speaking-score';
import {
  correctionReportSchema,
  type CorrectionReportPayload,
} from '../../domain/schemas';

const MAX_AUDIO_CLIPS = 8;
const SPEAKING_AUDIO_MODEL =
  process.env.DRALO_OPENAI_MODEL_SPEAKING_AUDIO?.trim() || 'gpt-4o-audio-preview';

type DraloB2FeedbackBlock = {
  grammar?: { score?: number; analysis?: string; examples?: Array<{ student?: string; corrected?: string }> };
  estimatedLevel?: { level?: string; justification?: string };
  vocabulary?: { score?: number; analysis?: string; examples?: string[] };
  discourseManagement?: { score?: number; analysis?: string };
  pronunciation?: {
    score?: number;
    analysis?: string;
    accentNotes?: string;
    mispronouncedWords?: Array<{ word?: string; correctIpa?: string }>;
    audioUsed?: boolean;
  };
  interactiveCommunication?: { score?: number; analysis?: string };
  overallGrade?: {
    averageScore?: number;
    cefrLevel?: string;
    strengths?: string[];
    priorities?: string[];
  };
  correctedVersion?: string;
  modelAnswer?: string;
  shortExplanation?: string;
};

function openAiAudioFormat(mimeType: string): 'wav' | 'mp3' | 'webm' | null {
  const m = (mimeType || '').toLowerCase();
  if (m.includes('wav')) return 'wav';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('webm') || m.includes('ogg')) return 'webm';
  return null;
}

async function tryMultimodalFeedback(
  systemPrompt: string,
  userText: string,
  audioClips: Array<{ transcript: string; buffer: Buffer; mimeType: string }>,
): Promise<string | null> {
  const client = getDraloOpenAI();
  if (!client || audioClips.length === 0) return null;

  const content: Array<Record<string, unknown>> = [
    {
      type: 'text',
      text: `${userText}\n\nListen to the student audio clips below (in order). Use them especially for the PRONUNCIATION block.`,
    },
  ];

  let attached = 0;
  for (const clip of audioClips.slice(0, MAX_AUDIO_CLIPS)) {
    const format = openAiAudioFormat(clip.mimeType);
    if (!format || !clip.buffer?.length) continue;
    content.push({
      type: 'text',
      text: `\n--- Student recording ${attached + 1} (STT transcript: "${clip.transcript}") ---`,
    });
    content.push({
      type: 'input_audio',
      input_audio: {
        data: clip.buffer.toString('base64'),
        format,
      },
    });
    attached += 1;
  }

  if (attached === 0) return null;

  try {
    const res = await client.chat.completions.create({
      model: SPEAKING_AUDIO_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content as never },
      ],
    });
    return res.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('[speaking] Multimodal audio feedback failed; falling back to text-only.', err);
    return null;
  }
}

function mapToCorrectionReport(
  parsed: DraloB2FeedbackBlock,
  cefr: CefrLevel,
): CorrectionReportPayload {
  const grammar = clampB2SpeakingBand(parsed.grammar?.score ?? 0);
  const vocabulary = clampB2SpeakingBand(parsed.vocabulary?.score ?? 0);
  const discourse = clampB2SpeakingBand(parsed.discourseManagement?.score ?? 0);
  const pronunciation = clampB2SpeakingBand(parsed.pronunciation?.score ?? 0);
  const interactive = clampB2SpeakingBand(parsed.interactiveCommunication?.score ?? 0);
  const grammarVocab = clampB2SpeakingBand((grammar + vocabulary) / 2);
  const globalAvg = clampB2SpeakingBand(
    parsed.overallGrade?.averageScore ??
      (grammar + vocabulary + discourse + pronunciation + interactive) / 5,
  );

  const b2Speaking = buildB2SpeakingScoreReport({
    grammar_vocabulary: grammarVocab,
    discourse_management: discourse,
    pronunciation,
    interactive_communication: interactive,
    global_achievement: globalAvg,
  });

  b2Speaking.estimatedLevel =
    parsed.overallGrade?.cefrLevel || parsed.estimatedLevel?.level || b2Speaking.estimatedLevel;

  const pronunciationFeedback = [
    parsed.pronunciation?.analysis,
    parsed.pronunciation?.accentNotes,
    parsed.pronunciation?.mispronouncedWords?.length
      ? `Mispronounced: ${parsed.pronunciation.mispronouncedWords
          .slice(0, 5)
          .map((w) => `${w.word} → ${w.correctIpa}`)
          .join('; ')}`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const grammarErrors =
    parsed.grammar?.examples
      ?.filter((e) => e.student)
      .slice(0, 3)
      .map((e) => ({
        excerpt: e.student || '',
        issue: 'Grammar',
        suggestion: e.corrected || '',
      })) || [];

  return correctionReportSchema.parse({
    criteria: [
      { criterion: 'grammar', score: Math.max(1, Math.round(grammar)) as 1 | 2 | 3 | 4 | 5, errors: grammarErrors },
      {
        criterion: 'vocabulary',
        score: Math.max(1, Math.round(vocabulary)) as 1 | 2 | 3 | 4 | 5,
        errors: [],
      },
      {
        criterion: 'fluency',
        score: Math.max(1, Math.round(discourse)) as 1 | 2 | 3 | 4 | 5,
        errors: [],
      },
      {
        criterion: 'pronunciation',
        score: Math.max(1, Math.round(pronunciation)) as 1 | 2 | 3 | 4 | 5,
        errors: [],
      },
      {
        criterion: 'taskAchievement',
        score: Math.max(1, Math.round(interactive)) as 1 | 2 | 3 | 4 | 5,
        errors: [],
      },
    ],
    correctedVersion: parsed.correctedVersion || '',
    modelAnswer: parsed.modelAnswer || '',
    shortExplanation:
      parsed.shortExplanation ||
      parsed.overallGrade?.priorities?.join(' ') ||
      parsed.estimatedLevel?.justification ||
      '',
    pronunciation: {
      score: Math.max(1, Math.round(pronunciation)) as 1 | 2 | 3 | 4 | 5,
      feedback: pronunciationFeedback || 'See detailed pronunciation block.',
      isEstimated: parsed.pronunciation?.audioUsed !== true,
    },
    b2Speaking,
    draloB2Feedback: parsed,
  });
}

function mockDraloReport(cefr: CefrLevel): CorrectionReportPayload {
  return mapToCorrectionReport(
    {
      grammar: { score: 3, analysis: 'Connect OpenAI for detailed grammar feedback.', examples: [] },
      estimatedLevel: { level: cefr, justification: 'Placeholder until AI is configured.' },
      vocabulary: { score: 3, analysis: '', examples: [] },
      discourseManagement: { score: 3, analysis: '' },
      pronunciation: {
        score: 3,
        analysis: 'Estimated from transcript only.',
        accentNotes: '',
        mispronouncedWords: [],
        audioUsed: false,
      },
      interactiveCommunication: { score: 3, analysis: '' },
      overallGrade: {
        averageScore: 3,
        cefrLevel: cefr,
        strengths: ['Participated in the conversation'],
        priorities: ['Extend answers', 'Work on pronunciation', 'Check sentence structure'],
      },
      correctedVersion: '',
      modelAnswer: `Aim for fuller B2 answers with examples and clearer sentence structure at ${cefr}.`,
      shortExplanation: 'Enable OpenAI and record answers with the microphone for audio-based feedback.',
    },
    cefr,
  );
}

export async function runDraloB2SpeakingFeedback(params: {
  cefr: CefrLevel;
  sessionId?: string | null;
  combinedTranscript?: string;
  b2PartNumber?: number | null;
}): Promise<CorrectionReportPayload> {
  const ctx = await loadSpeakingSessionEvaluationContext(
    params.sessionId,
    params.combinedTranscript,
    params.b2PartNumber ?? B2_SPEAKING_PART_MIN,
  );

  const studentBlock = ctx.studentTurns.length
    ? ctx.studentTurns.map((t, i) => `Turn ${i + 1}: ${t.text}`).join('\n\n')
    : params.combinedTranscript?.trim() || '';

  if (!studentBlock && !ctx.dialogue) {
    return mockDraloReport(params.cefr);
  }

  const audioList =
    ctx.respuestas.length > 0
      ? ctx.respuestas
          .map(
            (r, i) =>
              `Recording ${i + 1}: transcript="${r.transcript}" | url=${r.audio_url} | mime=${r.mime_type}`,
          )
          .join('\n')
      : 'No audio files stored for this session.';

  const userMessage = [
    `Target CEFR: ${params.cefr}`,
    '',
    '# Full conversation (evaluate ONLY Student lines)',
    ctx.dialogue || studentBlock,
    '',
    '# Student turns only',
    studentBlock,
    '',
    '# Stored student audio recordings',
    audioList,
    '',
    `Respond with JSON matching this schema:\n${B2_SPEAKING_FEEDBACK_JSON_SCHEMA}`,
  ].join('\n');

  const systemPrompt = `${B2_SPEAKING_FEEDBACK_SYSTEM_PROMPT}\n\nJSON schema:\n${B2_SPEAKING_FEEDBACK_JSON_SCHEMA}`;

  if (!isDraloOpenAIConfigured()) {
    return mockDraloReport(params.cefr);
  }

  let raw =
    (await tryMultimodalFeedback(systemPrompt, userMessage, ctx.audioClips)) || '';

  if (!raw) {
    const { text } = await realLifeChatCompletion({
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    raw = text ?? '';
  }

  if (!raw) return mockDraloReport(params.cefr);

  try {
    const parsed = JSON.parse(raw) as DraloB2FeedbackBlock;
    return mapToCorrectionReport(parsed, params.cefr);
  } catch {
    return mockDraloReport(params.cefr);
  }
}
