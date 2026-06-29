import { getB2SpeakingExamById } from '@/data/b2-speaking-exams';
import { formatB2ExamTranscript } from '@/features/speaking/domain/b2-speaking-exam-engine';
import { getB2ExamSessionState } from '@/features/speaking/services/b2-exam/b2-exam-session.service';
import { countCandidateWordsInTranscript } from './speaking-evidence-report';

export async function resolveSpeakingExamTranscript(params: {
  sessionId: string;
  examId?: string | null;
  combinedTranscript?: string | null;
}): Promise<string> {
  const client = params.combinedTranscript?.trim() ?? '';
  if (client && countCandidateWordsInTranscript(client) > 0) {
    return client;
  }

  const session = await getB2ExamSessionState(params.sessionId);
  if (session?.turns?.length) {
    const examId = session.examId || params.examId || null;
    const exam = examId ? getB2SpeakingExamById(examId) : null;
    if (exam) {
      const fromSession = formatB2ExamTranscript(
        session.turns,
        exam,
        session.examState.partsCompleted ?? [],
      );
      if (countCandidateWordsInTranscript(fromSession) > 0) {
        return fromSession;
      }
    }
  }

  return client;
}
