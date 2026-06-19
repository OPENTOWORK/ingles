import { NextResponse } from 'next/server';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import { createLlmAdapter } from '@/features/speaking/services/llm/llm.adapter';
import { createSttAdapter } from '@/features/speaking/services/speech/stt.adapter';
import { createTtsAdapter } from '@/features/speaking/services/speech/tts.adapter';
import { getExamBlueprint } from '@/features/speaking/domain/exam-blueprints';
import {
  buildB2ExaminerSystemExtra,
  getB2SpeakingPartConfig,
} from '@/features/speaking/domain/b2-speaking-exam-parts';
import { saveTurn } from '@/features/speaking/services/sessions/speaking-session.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EXAM_NAMES: Record<string, string> = {
  KEY: 'Cambridge A2 Key',
  PET: 'Cambridge B1 Preliminary',
  FIRST: 'Cambridge B2 First',
  ADVANCED: 'Cambridge C1 Advanced',
  PROFICIENCY: 'Cambridge C2 Proficiency',
};

async function readJsonBody<T>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') ?? '';
    let sessionId: string;
    let cefr: CefrLevel;
    let mode: SpeakingMode;
    let prompt: string;
    let history: { role: 'user' | 'assistant'; content: string }[];
    let textOverride: string | undefined;
    let examPartIndex = 0;
    let isOpening = false;
    let taskContext = '';
    let b2PartNumber = 0;
    let audio: { buffer: Buffer; mimeType: string; filename: string } | null = null;

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      sessionId = String(form.get('sessionId') ?? '');
      cefr = String(form.get('cefr') ?? 'B2').toUpperCase() as CefrLevel;
      mode = String(form.get('mode') ?? 'PRACTICE').toUpperCase() as SpeakingMode;
      prompt = String(form.get('prompt') ?? 'General conversation');
      history = JSON.parse(String(form.get('history') ?? '[]'));
      textOverride = form.get('text') ? String(form.get('text')) : undefined;
      examPartIndex = Number(form.get('examPartIndex') ?? 0);
      isOpening = form.get('isOpening') === 'true';
      taskContext = String(form.get('taskContext') ?? '');
      b2PartNumber = Number(form.get('b2PartNumber') ?? 0);
      const file = form.get('audio');
      if (file instanceof Blob) {
        const buf = Buffer.from(await file.arrayBuffer());
        audio = { buffer: buf, mimeType: file.type || 'audio/webm', filename: 'audio.webm' };
      }
    } else {
      const body = await readJsonBody<{
        sessionId: string;
        cefr: CefrLevel;
        mode: SpeakingMode;
        prompt: string;
        history: { role: 'user' | 'assistant'; content: string }[];
        text?: string;
        examPartIndex?: number;
        isOpening?: boolean;
        taskContext?: string;
        b2PartNumber?: number;
      }>(req);
      if (!body) {
        return NextResponse.json({ error: 'Request body required' }, { status: 400 });
      }
      sessionId = body.sessionId;
      cefr = body.cefr;
      mode = body.mode;
      prompt = body.prompt;
      history = body.history ?? [];
      textOverride = body.text;
      examPartIndex = body.examPartIndex ?? 0;
      isOpening = Boolean(body.isOpening);
      taskContext = String(body.taskContext ?? '');
      b2PartNumber = Number(body.b2PartNumber ?? 0);
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const stt = createSttAdapter();
    const llm = createLlmAdapter();
    const tts = createTtsAdapter();

    let userText = textOverride?.trim() ?? '';
    let transcriptSource: 'STT' | 'TYPED' | 'MOCK' = 'TYPED';

    if (!isOpening) {
      if (!userText && audio) {
        const t = await stt.transcribe(audio);
        userText = t.text;
        transcriptSource = t.source;
      }
      if (!userText) {
        userText = '(empty turn)';
        transcriptSource = 'MOCK';
      }

      await saveTurn({
        sessionId,
        role: 'USER',
        text: userText,
        transcriptSource,
      });
    }

    let assistantText: string;
    let microFeedback: Awaited<ReturnType<typeof llm.microFeedback>> | null = null;

    const blueprint = getExamBlueprint(cefr);
    const b2Config = b2PartNumber >= 14 ? getB2SpeakingPartConfig(b2PartNumber) : null;
    const partIndex = b2Config?.blueprintIndex ?? examPartIndex;
    const part =
      blueprint.parts[Math.max(0, Math.min(partIndex, blueprint.parts.length - 1))] ??
      blueprint.parts[0];
    const examKey = blueprint.exam;
    const examName = EXAM_NAMES[examKey] ?? examKey;

    const mergedTaskContext = b2Config
      ? buildB2ExaminerSystemExtra(b2Config, taskContext)
      : taskContext.trim();

    if (mode === 'EXAM') {
      assistantText = await llm.examReply({
        cefr,
        examName,
        part,
        transcript: userText,
        history,
        taskContext: mergedTaskContext,
        isOpening,
      });
    } else {
      assistantText = await llm.practiceReply({
        cefr,
        mode,
        prompt,
        transcript: userText,
        history,
      });
    }

    // microFeedback (sólo PRACTICE) y TTS son independientes entre sí: en paralelo.
    const [microFeedbackResult, spoken] = await Promise.all([
      mode === 'PRACTICE'
        ? llm.microFeedback({ cefr, userText })
        : Promise.resolve(null),
      assistantText ? tts.synthesize(assistantText) : Promise.resolve(null),
    ]);
    microFeedback = microFeedbackResult;

    await saveTurn({
      sessionId,
      role: 'ASSISTANT',
      text: assistantText,
      transcriptSource: 'MOCK',
      microFeedback: microFeedback ?? undefined,
    });

    let assistantAudioBase64: string | undefined;
    let assistantAudioMime: string | undefined;
    if (spoken) {
      assistantAudioBase64 = spoken.base64;
      assistantAudioMime = spoken.mime;
    }

    return NextResponse.json({
      transcript: isOpening ? '' : userText,
      transcriptSource: isOpening ? 'MOCK' : transcriptSource,
      assistantText,
      assistantAudioBase64,
      assistantAudioMime,
      microFeedback,
      examPartLabel: mode === 'EXAM' ? part.name : undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Turn failed' }, { status: 500 });
  }
}
