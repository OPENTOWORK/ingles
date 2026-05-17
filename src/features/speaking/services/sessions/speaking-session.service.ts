import type { CefrLevel, CambridgeExam, SpeakingMode } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hasDatabaseUrl } from '@/lib/prisma';
import { getExamBlueprint } from '../../domain/exam-blueprints';
import type { ExamStateJson } from '../../domain/types';

function createLocalSpeakingSession(params: {
  userId: string | null;
  mode: SpeakingMode;
  cefr: CefrLevel;
  exam: CambridgeExam;
}) {
  return {
    id: `local_${Date.now()}`,
    userId: params.userId,
    mode: params.mode,
    cefr: params.cefr,
    exam: params.exam,
    persisted: false as const,
  };
}

export async function createSpeakingSession(params: {
  userId: string | null;
  mode: SpeakingMode;
  cefr: CefrLevel;
  exam?: CambridgeExam;
}) {
  const exam = params.exam ?? getExamBlueprint(params.cefr).exam;

  if (!hasDatabaseUrl()) {
    return createLocalSpeakingSession({ ...params, exam });
  }

  try {
    const session = await prisma.speakingSession.create({
      data: {
        userId: params.userId ?? undefined,
        mode: params.mode,
        cefr: params.cefr,
        exam,
        examBlueprintVersion: '1',
        examState:
          params.mode === 'EXAM'
            ? ({
                currentPartIndex: 0,
                phase: 'intro',
                questionIndex: 0,
                partStartedAtIso: new Date().toISOString(),
              } satisfies ExamStateJson)
            : undefined,
      },
    });
    return { ...session, persisted: true as const };
  } catch (e) {
    console.error('[speaking] Persist session failed; using in-memory session', e);
    return createLocalSpeakingSession({ ...params, exam });
  }
}

export async function saveTurn(params: {
  sessionId: string;
  role: 'USER' | 'ASSISTANT';
  text: string;
  transcriptSource: 'STT' | 'TYPED' | 'MOCK';
  audioUrl?: string | null;
  microFeedback?: unknown;
}) {
  if (!hasDatabaseUrl() || params.sessionId.startsWith('local_')) {
    return { id: `turn_${Date.now()}`, ...params };
  }
  return prisma.speakingTurn.create({
    data: {
      sessionId: params.sessionId,
      role: params.role,
      text: params.text,
      transcriptSource: params.transcriptSource,
      audioUrl: params.audioUrl,
      microFeedback:
        params.microFeedback === undefined
          ? undefined
          : (params.microFeedback as Prisma.InputJsonValue),
    },
  });
}

export async function saveEvaluation(params: {
  sessionId: string;
  turnId: string | null;
  payload: unknown;
}) {
  if (!hasDatabaseUrl() || params.sessionId.startsWith('local_')) {
    return { id: `eval_${Date.now()}`, ...params };
  }
  return prisma.speakingEvaluation.create({
    data: {
      sessionId: params.sessionId,
      turnId: params.turnId ?? undefined,
      payload: params.payload as Prisma.InputJsonValue,
    },
  });
}

export async function completeSession(sessionId: string) {
  if (!hasDatabaseUrl() || sessionId.startsWith('local_')) return;
  await prisma.speakingSession.update({
    where: { id: sessionId },
    data: { state: 'COMPLETED', endedAt: new Date() },
  });
}
