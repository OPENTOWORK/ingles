import type { CefrLevel } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hasDatabaseUrl } from '@/lib/prisma';
import { getExamBlueprint } from '../../domain/exam-blueprints';
import type { B2SpeakingExamEngineState, B2SpeakingExamTurn, B2SpeakingSpeakerRole } from '../../domain/b2-speaking-exam-bank.types';
import { B2_SPEAKING_MAX_CANDIDATE_TURNS } from '../../domain/b2-speaking-exam-bank.types';
import { createB2ExamEngineState } from '../../domain/b2-speaking-exam-engine';

type LocalB2ExamSession = {
  id: string;
  userId: string | null;
  examId: string;
  examState: B2SpeakingExamEngineState;
  turns: B2SpeakingExamTurn[];
  persisted: false;
};

const localB2ExamSessions = new Map<string, LocalB2ExamSession>();

export class B2ExamSessionAccessError extends Error {
  code = 'SESSION_ACCESS_DENIED' as const;
  constructor() {
    super('You do not have access to this speaking session.');
  }
}

export async function assertB2ExamSessionOwner(sessionId: string, userId: string): Promise<void> {
  if (!sessionId || !userId) {
    throw new B2ExamSessionAccessError();
  }

  if (!hasDatabaseUrl() || sessionId.startsWith('local_')) {
    const local = localB2ExamSessions.get(sessionId);
    if (!local || local.userId !== userId) {
      throw new B2ExamSessionAccessError();
    }
    return;
  }

  const session = await prisma.speakingSession.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });

  if (!session?.userId || session.userId !== userId) {
    throw new B2ExamSessionAccessError();
  }
}

export class SpeakingSessionTurnLimitError extends Error {
  code = 'SPEAKING_SESSION_TURN_LIMIT_REACHED' as const;
  constructor() {
    super(
      'You have reached the maximum number of turns for this speaking session. Please finish the exam and request your feedback.',
    );
  }
}

function mapSpeakerToTurnRole(speakerRole: B2SpeakingSpeakerRole): 'USER' | 'ASSISTANT' {
  return speakerRole === 'candidate' ? 'USER' : 'ASSISTANT';
}

export async function createB2ExamSession(params: {
  userId: string | null;
  examId: string;
  examSlot?: number;
}) {
  const cefr: CefrLevel = 'B2';
  const exam = getExamBlueprint(cefr).exam;
  const engineState = createB2ExamEngineState(params.examId);
  const examStatePayload = {
    ...engineState,
    examSlot: params.examSlot ?? null,
    version: 'b2-full-exam-v1',
  };

  if (!hasDatabaseUrl()) {
    const id = `local_b2_${Date.now()}`;
    const session: LocalB2ExamSession = {
      id,
      userId: params.userId,
      examId: params.examId,
      examState: engineState,
      turns: [],
      persisted: false,
    };
    localB2ExamSessions.set(id, session);
    return { sessionId: id, persisted: false as const, examState: engineState };
  }

  try {
    const session = await prisma.speakingSession.create({
      data: {
        userId: params.userId ?? undefined,
        mode: 'EXAM',
        cefr,
        exam,
        examBlueprintVersion: 'b2-full-exam-v1',
        examState: {
          ...examStatePayload,
          bankExamId: params.examId,
        } as Prisma.InputJsonValue,
      },
    });
    return {
      sessionId: session.id,
      persisted: true as const,
      examState: engineState,
    };
  } catch (e) {
    console.error('[b2-exam] Persist session failed; using in-memory session', e);
    const id = `local_b2_${Date.now()}`;
    const session: LocalB2ExamSession = {
      id,
      userId: params.userId,
      examId: params.examId,
      examState: engineState,
      turns: [],
      persisted: false,
    };
    localB2ExamSessions.set(id, session);
    return { sessionId: id, persisted: false as const, examState: engineState };
  }
}

export async function getB2ExamSessionState(sessionId: string): Promise<{
  examId: string;
  examState: B2SpeakingExamEngineState;
  turns: B2SpeakingExamTurn[];
} | null> {
  if (!sessionId) return null;

  if (!hasDatabaseUrl() || sessionId.startsWith('local_')) {
    const local = localB2ExamSessions.get(sessionId);
    if (!local) return null;
    return { examId: local.examId, examState: local.examState, turns: [...local.turns] };
  }

  const session = await prisma.speakingSession.findUnique({
    where: { id: sessionId },
    select: { examState: true },
  });
  if (!session) return null;

  const rawState = session.examState as (B2SpeakingExamEngineState & { bankExamId?: string }) | null;
  const bankExamId = rawState?.bankExamId ?? rawState?.examId;
  if (!bankExamId) return null;

  const rows = await prisma.speakingTurn.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    select: {
      partNumber: true,
      turnIndex: true,
      speakerRole: true,
      text: true,
      transcriptSource: true,
      role: true,
    },
  });

  const turns: B2SpeakingExamTurn[] = rows.map((row, idx) => ({
    partNumber: row.partNumber ?? 1,
    turnIndex: row.turnIndex ?? idx,
    speakerRole:
      (row.speakerRole as B2SpeakingSpeakerRole | null) ??
      (row.role === 'USER' ? 'candidate' : 'examiner'),
    text: row.text,
    transcriptSource:
      row.transcriptSource === 'STT' || row.transcriptSource === 'TYPED'
        ? row.transcriptSource
        : 'SCRIPT',
  }));

  const examState = rawState?.examId
    ? rawState
    : createB2ExamEngineState(bankExamId);

  return { examId: bankExamId, examState, turns };
}

export async function updateB2ExamSessionState(
  sessionId: string,
  examState: B2SpeakingExamEngineState,
): Promise<void> {
  if (!hasDatabaseUrl() || sessionId.startsWith('local_')) {
    const local = localB2ExamSessions.get(sessionId);
    if (local) local.examState = examState;
    return;
  }

  await prisma.speakingSession.update({
    where: { id: sessionId },
    data: { examState: examState as Prisma.InputJsonValue },
  });
}

export async function saveB2ExamTurn(params: {
  sessionId: string;
  examId: string;
  partNumber: number;
  turnIndex: number;
  speakerRole: B2SpeakingSpeakerRole;
  text: string;
  transcriptSource: 'STT' | 'TYPED' | 'MOCK' | 'SCRIPT';
  examState?: B2SpeakingExamEngineState;
}): Promise<{ candidateTurnCount: number }> {
  const turn: B2SpeakingExamTurn = {
    partNumber: params.partNumber,
    turnIndex: params.turnIndex,
    speakerRole: params.speakerRole,
    text: params.text,
    transcriptSource: params.transcriptSource,
  };

  if (!hasDatabaseUrl() || params.sessionId.startsWith('local_')) {
    const local = localB2ExamSessions.get(params.sessionId);
    if (!local) throw new Error('Session not found');
    if (params.speakerRole === 'candidate') {
      const count = params.examState?.candidateTurnCount ?? local.examState.candidateTurnCount + 1;
      if (count > B2_SPEAKING_MAX_CANDIDATE_TURNS) {
        throw new SpeakingSessionTurnLimitError();
      }
      local.examState = {
        ...(params.examState ?? local.examState),
        candidateTurnCount: count,
      };
    } else if (params.examState) {
      local.examState = params.examState;
    }
    local.turns.push(turn);
    return { candidateTurnCount: local.examState.candidateTurnCount };
  }

  if (params.speakerRole === 'candidate') {
    const count =
      params.examState?.candidateTurnCount ??
      ((await getB2ExamSessionState(params.sessionId))?.examState.candidateTurnCount ?? 0) + 1;
    if (count > B2_SPEAKING_MAX_CANDIDATE_TURNS) {
      throw new SpeakingSessionTurnLimitError();
    }
  }

  const source =
    params.transcriptSource === 'STT'
      ? 'STT'
      : params.transcriptSource === 'TYPED'
        ? 'TYPED'
        : 'MOCK';

  await prisma.speakingTurn.create({
    data: {
      sessionId: params.sessionId,
      role: mapSpeakerToTurnRole(params.speakerRole),
      text: params.text,
      transcriptSource: source,
      partNumber: params.partNumber,
      turnIndex: params.turnIndex,
      speakerRole: params.speakerRole,
    },
  });

  if (params.examState) {
    await updateB2ExamSessionState(params.sessionId, params.examState);
  }

  if (params.examState?.candidateTurnCount != null) {
    return { candidateTurnCount: params.examState.candidateTurnCount };
  }

  const updated = await getB2ExamSessionState(params.sessionId);
  return { candidateTurnCount: updated?.examState.candidateTurnCount ?? 0 };
}

export async function getB2ExamTurnCount(sessionId: string): Promise<number> {
  const state = await getB2ExamSessionState(sessionId);
  return state?.examState.candidateTurnCount ?? 0;
}

export { B2_SPEAKING_MAX_CANDIDATE_TURNS };
