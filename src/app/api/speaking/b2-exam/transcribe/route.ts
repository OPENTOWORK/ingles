import { NextResponse } from 'next/server';
import { requireB2ExamUser } from '@/app/api/speaking/b2-exam/_auth';
import { createSttAdapter } from '@/features/speaking/services/speech/stt.adapter';
import { AI_ACTIONS } from '@/lib/aiUsage';
import { recordAiUsageSuccess, usageFromTextEstimate } from '@/lib/aiUsageRouteHelpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STT_MODEL = process.env.OPENAI_STT_MODEL ?? 'whisper-1';

/** STT-only — no GPT. Logs cost as exam_speaking_transcription (no student daily limit). */
export async function POST(req: Request) {
  try {
    const auth = await requireB2ExamUser(req);
    if (!auth.ok) return auth.response;

    const ct = req.headers.get('content-type') ?? '';
    if (!ct.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'multipart/form-data required' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('audio');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'audio required' }, { status: 400 });
    }

    const sessionId = form.get('sessionId') ? String(form.get('sessionId')) : null;
    const partNumber = form.get('partNumber') ? Number(form.get('partNumber')) : null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const stt = createSttAdapter();
    const result = await stt.transcribe({
      buffer,
      mimeType: file.type || 'audio/webm',
      filename: 'capture.webm',
    });

    if (result.source === 'STT') {
      const usage = usageFromTextEstimate(STT_MODEL, `[audio:${buffer.byteLength}b]`, result.text);
      await recordAiUsageSuccess({
        userId: auth.userId,
        userEmail: auth.userEmail,
        accessToken: auth.accessToken,
        action: AI_ACTIONS.EXAM_SPEAKING_TRANSCRIPTION,
        model: STT_MODEL,
        usage,
        metadata: {
          sessionId,
          partNumber,
          audioBytes: buffer.byteLength,
          transcriptSource: result.source,
        },
      });
    }

    return NextResponse.json({
      transcript: result.text,
      transcriptSource: result.source,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
