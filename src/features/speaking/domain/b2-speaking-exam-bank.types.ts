/** Full B2 Speaking exam definition — script-driven, no per-turn GPT. */

export type B2SpeakingExamPart2 = {
  imageA: string;
  imageB: string;
  prompt: string;
  followUpQuestion: string;
  /** Examiner intro before the long turn. */
  examinerIntro: string;
};

export type B2SpeakingExamPart3 = {
  taskPrompt: string;
  options: string[];
  partnerLines: string[];
  decisionQuestion: string;
  /** Examiner sets up the collaborative task. */
  examinerIntro: string;
};

export type B2SpeakingExamContent = {
  id: string;
  cefr: 'B2';
  title: string;
  theme: string;
  part1_questions: string[];
  part2: B2SpeakingExamPart2;
  part3: B2SpeakingExamPart3;
  part4_questions: string[];
  estimatedDurationMinutes: number;
  isActive: boolean;
  /** Optional slot mapping (levels exam 1–6). */
  examSlot?: number;
};

export type B2SpeakingSpeakerRole = 'examiner' | 'candidate' | 'partner';

export type B2SpeakingExamTurn = {
  partNumber: number;
  turnIndex: number;
  speakerRole: B2SpeakingSpeakerRole;
  text: string;
  transcriptSource?: 'STT' | 'TYPED' | 'MOCK' | 'SCRIPT';
};

export type B2SpeakingExamEnginePhase =
  | 'intro'
  | 'await_candidate'
  | 'long_turn_recording'
  | 'part_complete'
  | 'exam_complete';

export type B2SpeakingExamEngineState = {
  examId: string;
  partNumber: 1 | 2 | 3 | 4;
  stepIndex: number;
  phase: B2SpeakingExamEnginePhase;
  candidateTurnCount: number;
  partsCompleted: number[];
  longTurnSecondsLeft: number | null;
};

export type B2SpeakingExamEngineStep =
  | { kind: 'display'; speakerRole: B2SpeakingSpeakerRole; text: string; partNumber: number }
  | { kind: 'photos'; imageA: string; imageB: string; prompt: string; partNumber: 2 }
  | { kind: 'long_turn_start'; seconds: number; partNumber: 2 }
  | { kind: 'await_candidate'; partNumber: number }
  | { kind: 'part_transition'; nextPart: number; message: string }
  | { kind: 'exam_finished' };

export const B2_SPEAKING_MAX_CANDIDATE_TURNS = 30;
