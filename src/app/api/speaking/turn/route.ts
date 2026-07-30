import { NextResponse } from 'next/server';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import { createLlmAdapter } from '@/features/speaking/services/llm/llm.adapter';
import { createSttAdapter } from '@/features/speaking/services/speech/stt.adapter';
import { getExamBlueprint } from '@/features/speaking/domain/exam-blueprints';
import {
  buildB2ExaminerSystemExtra,
  getB2SpeakingPartConfig,
} from '@/features/speaking/domain/b2-speaking-exam-parts';
import {
  assessB2Part1AnswerLanguage,
  hasDedicatedB2ExaminerPrompt,
} from '@/features/speaking/domain/b2-examiner-prompts';
import { saveTurn, getSessionTurns } from '@/features/speaking/services/sessions/speaking-session.service';
import { buildLlmHistoryFromStoredTurns } from '@/features/speaking/services/sessions/speaking-turn-context';
import { optionalUserId } from '@/server/speaking/authorize';
import {
  linkSpeakingRespuestaToTurn,
  persistSpeakingRespuestaAudio,
} from '@/lib/speakingRespuestasServer';

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
    let textOverride: string | undefined;
    let examPartIndex = 0;
    let isOpening = false;
    let taskContext = '';
    let b2PartNumber = 0;
    let lastAssistantText = '';
    let clientAssistantHistory: string[] = [];
    let audio: { buffer: Buffer; mimeType: string; filename: string } | null = null;

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      sessionId = String(form.get('sessionId') ?? '');
      cefr = String(form.get('cefr') ?? 'B2').toUpperCase() as CefrLevel;
      mode = String(form.get('mode') ?? 'PRACTICE').toUpperCase() as SpeakingMode;
      prompt = String(form.get('prompt') ?? 'General conversation');
      textOverride = form.get('text') ? String(form.get('text')) : undefined;
      examPartIndex = Number(form.get('examPartIndex') ?? 0);
      isOpening = form.get('isOpening') === 'true';
      taskContext = String(form.get('taskContext') ?? '');
      b2PartNumber = Number(form.get('b2PartNumber') ?? 0);
      lastAssistantText = String(form.get('lastAssistantText') ?? '');
      try {
        const parsed = JSON.parse(String(form.get('assistantHistory') ?? '[]'));
        if (Array.isArray(parsed)) clientAssistantHistory = parsed.map(String);
      } catch {
        clientAssistantHistory = [];
      }
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
        text?: string;
        examPartIndex?: number;
        isOpening?: boolean;
        taskContext?: string;
        b2PartNumber?: number;
        lastAssistantText?: string;
        assistantHistory?: string[];
      }>(req);
      if (!body) {
        return NextResponse.json({ error: 'Request body required' }, { status: 400 });
      }
      sessionId = body.sessionId;
      cefr = body.cefr;
      mode = body.mode;
      prompt = body.prompt;
      textOverride = body.text;
      examPartIndex = body.examPartIndex ?? 0;
      isOpening = Boolean(body.isOpening);
      taskContext = String(body.taskContext ?? '');
      b2PartNumber = Number(body.b2PartNumber ?? 0);
      lastAssistantText = String(body.lastAssistantText ?? '');
      clientAssistantHistory = Array.isArray(body.assistantHistory)
        ? body.assistantHistory.map(String)
        : [];
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const userId = await optionalUserId();

    const stt = createSttAdapter();
    const llm = createLlmAdapter();

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

      let audioUrl: string | null = null;
      let respuestaId: string | null = null;

      if (audio?.buffer?.length) {
        const persisted = await persistSpeakingRespuestaAudio({
          userId,
          sessionId,
          mode,
          cefr,
          b2PartNumber,
          examPartIndex,
          transcript: userText,
          transcriptSource,
          buffer: audio.buffer,
          mimeType: audio.mimeType,
          filename: audio.filename,
        });
        if (persisted) {
          audioUrl = persisted.audioUrl;
          respuestaId = persisted.id;
        }
      }

      const userTurn = await saveTurn({
        sessionId,
        role: 'USER',
        text: userText,
        transcriptSource,
        audioUrl,
      });

      if (respuestaId && userTurn?.id) {
        await linkSpeakingRespuestaToTurn(String(userTurn.id), respuestaId);
      }
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

    const rawTaskContext = taskContext.trim();
    const mergedTaskContext =
      b2Config && !hasDedicatedB2ExaminerPrompt(b2PartNumber)
        ? buildB2ExaminerSystemExtra(b2Config, rawTaskContext)
        : rawTaskContext;

    const storedTurns = isOpening ? [] : await getSessionTurns(sessionId);
    const history = buildLlmHistoryFromStoredTurns(storedTurns, { omitLatestUserTurn: true });
    for (const text of clientAssistantHistory.slice(-8)) {
      const content = text.trim().slice(0, 500);
      if (
        content &&
        !history.some(
          (turn) =>
            turn.role === 'assistant' &&
            turn.content.trim() === content,
        )
      ) {
        history.push({ role: 'assistant', content });
      }
    }
    const clientAssistantText = lastAssistantText.trim().slice(0, 500);
    if (
      clientAssistantText &&
      !history.some(
        (turn) =>
          turn.role === 'assistant' &&
          turn.content.trim() === clientAssistantText,
      )
    ) {
      history.push({ role: 'assistant', content: clientAssistantText });
    }

    if (mode === 'EXAM') {
      assistantText = await llm.examReply({
        cefr,
        examName,
        part,
        transcript: userText,
        history,
        taskContext: mergedTaskContext,
        isOpening,
        b2PartNumber: b2PartNumber >= 14 ? b2PartNumber : undefined,
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

    // Do not synthesize audio here: waiting for TTS delayed every exam turn.
    // The client starts its non-blocking /api/coach-tts pipeline as soon as it
    // receives assistantText, with browser speech synthesis as fallback.
    microFeedback =
      mode === 'PRACTICE'
        ? await llm.microFeedback({ cefr, userText }).catch((err) => {
            console.warn('[speaking/turn] microFeedback failed:', err?.message || err);
            return null;
          })
        : null;

    try {
      await saveTurn({
        sessionId,
        role: 'ASSISTANT',
        text: assistantText,
        transcriptSource: 'MOCK',
        microFeedback: microFeedback ?? undefined,
      });
    } catch (err) {
      console.warn('[speaking/turn] saveTurn assistant failed:', (err as Error)?.message || err);
    }

    return NextResponse.json({
      transcript: isOpening ? '' : userText,
      transcriptSource: isOpening ? 'MOCK' : transcriptSource,
      assistantText,
      answerAccepted:
        isOpening ||
        b2PartNumber !== 14 ||
        assessB2Part1AnswerLanguage(userText) !== 'non-english',
      microFeedback,
      examPartLabel: mode === 'EXAM' ? part.name : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e || 'Turn failed');
    console.error('[speaking/turn]', e);
    return NextResponse.json(
      { error: 'Turn failed', detail: message.slice(0, 240) },
      { status: 500 },
    );
  }
}
