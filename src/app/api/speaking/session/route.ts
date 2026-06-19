import { NextResponse } from 'next/server';
import { SpeakingMode, type CefrLevel } from '@prisma/client';
import { optionalUserId } from '@/server/speaking/authorize';
import { createSpeakingSession } from '@/features/speaking/services/sessions/speaking-session.service';

export const dynamic = 'force-dynamic';

const MODES: SpeakingMode[] = ['PRACTICE', 'CORRECTION', 'EXAM'];
const LEVELS: CefrLevel[] = ['A2', 'B1', 'B2', 'C1', 'C2'];

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
    const body = await readJsonBody<{ mode?: string; cefr?: string }>(req);
    if (!body) {
      return NextResponse.json({ error: 'Request body required' }, { status: 400 });
    }
    const mode = (body.mode?.toUpperCase() ?? 'PRACTICE') as SpeakingMode;
    const cefr = (body.cefr?.toUpperCase() ?? 'B2') as CefrLevel;

    if (!MODES.includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }
    if (!LEVELS.includes(cefr)) {
      return NextResponse.json({ error: 'Invalid cefr' }, { status: 400 });
    }

    const userId = await optionalUserId();
    const session = await createSpeakingSession({ userId, mode, cefr });

    return NextResponse.json({
      sessionId: session.id,
      persisted: session.persisted,
      mode: session.mode,
      cefr: session.cefr,
      exam: session.exam,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
