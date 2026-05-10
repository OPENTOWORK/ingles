import { NextResponse } from 'next/server';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import { createLlmAdapter } from '@/features/speaking/services/llm/llm.adapter';
import { createSttAdapter } from '@/features/speaking/services/speech/stt.adapter';
import { getExamBlueprint } from '@/features/speaking/domain/exam-blueprints';
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
      const file = form.get('audio');
      if (file instanceof Blob) {
        const buf = Buffer.from(await file.arrayBuffer());
        audio = { buffer: buf, mimeType: file.type || 'audio/webm', filename: 'audio.webm' };
      }
    } else {
      const body = (await req.json()) as {
        sessionId: string;
        cefr: CefrLevel;
        mode: SpeakingMode;
        prompt: string;
        history: { role: 'user' | 'assistant'; content: string }[];
        text?: string;
        examPartIndex?: number;
      };
      sessionId = body.sessionId;
      cefr = body.cefr;
      mode = body.mode;
      prompt = body.prompt;
      history = body.history ?? [];
      textOverride = body.text;
      examPartIndex = body.examPartIndex ?? 0;
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const stt = createSttAdapter();
    const llm = createLlmAdapter();

    let userText = textOverride?.trim() ?? '';
    let transcriptSource: 'STT' | 'TYPED' | 'MOCK' = 'TYPED';

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

    let assistantText: string;
    let microFeedback: Awaited<ReturnType<typeof llm.microFeedback>> | null = null;

    const blueprint = getExamBlueprint(cefr);
    const part =
      blueprint.parts[Math.max(0, Math.min(examPartIndex, blueprint.parts.length - 1))] ??
      blueprint.parts[0];
    const examKey = blueprint.exam;
    const examName = EXAM_NAMES[examKey] ?? examKey;

    if (mode === 'EXAM') {
      assistantText = await llm.examReply({
        cefr,
        examName,
        part,
        transcript: userText,
        history,
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

    if (mode === 'PRACTICE') {
      microFeedback = await llm.microFeedback({ cefr, userText });
    }

    await saveTurn({
      sessionId,
      role: 'ASSISTANT',
      text: assistantText,
      transcriptSource: 'MOCK',
      microFeedback: microFeedback ?? undefined,
    });

    return NextResponse.json({
      transcript: userText,
      transcriptSource,
      assistantText,
      microFeedback,
      examPartLabel: mode === 'EXAM' ? part.name : undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Turn failed' }, { status: 500 });
  }
}
