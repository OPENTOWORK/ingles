import type { CefrLevel, CambridgeExam, SpeakingTaskType } from '@prisma/client';
import type { ExamBlueprint, ExamPartDefinition } from './types';

const T = {
  INTERVIEW: 'INTERVIEW' as SpeakingTaskType,
  LONG_TURN: 'LONG_TURN' as SpeakingTaskType,
  COLLABORATIVE: 'COLLABORATIVE' as SpeakingTaskType,
  DISCUSSION: 'DISCUSSION' as SpeakingTaskType,
};

const A2_PARTS: ExamPartDefinition[] = [
  {
    part: 1,
    name: 'Part 1: Interview',
    taskType: T.INTERVIEW,
    instructions:
      'Answer the examiner’s questions about yourself, your daily life, and your interests. Speak clearly and give short, natural answers.',
    suggestedTimeSec: 120,
  },
  {
    part: 2,
    name: 'Part 2: Collaborative task / Discussion',
    taskType: T.DISCUSSION,
    instructions:
      'Discuss a simple topic or situation with the examiner. Take turns, agree or disagree politely, and ask one follow-up question if appropriate.',
    suggestedTimeSec: 180,
  },
];

const FOUR_PARTS_CAMBRIDGE: ExamPartDefinition[] = [
  {
    part: 1,
    name: 'Part 1: Interview',
    taskType: T.INTERVIEW,
    instructions:
      'The examiner asks questions about yourself, your opinions, and your habits. Give extended answers with reasons or examples.',
    suggestedTimeSec: 120,
  },
  {
    part: 2,
    name: 'Part 2: Long turn',
    taskType: T.LONG_TURN,
    instructions:
      'You receive a prompt (often visual). Talk on your own for about one minute, then answer a brief follow-up question.',
    suggestedTimeSec: 240,
  },
  {
    part: 3,
    name: 'Part 3: Collaborative task',
    taskType: T.COLLABORATIVE,
    instructions:
      'Discuss a situation or question with the other candidate (or the examiner in solo practice). Negotiate and develop ideas together.',
    suggestedTimeSec: 240,
  },
  {
    part: 4,
    name: 'Part 4: Discussion',
    taskType: T.DISCUSSION,
    instructions:
      'Related questions on the theme of Part 3. Give developed answers and respond to the examiner or partner.',
    suggestedTimeSec: 240,
  },
];

const C2_PARTS: ExamPartDefinition[] = [
  {
    part: 1,
    name: 'Part 1: Interview',
    taskType: T.INTERVIEW,
    instructions: 'Sophisticated discussion of attitudes, abstract topics, and speculation.',
    suggestedTimeSec: 180,
  },
  {
    part: 2,
    name: 'Part 2: Long turn / extended discourse',
    taskType: T.LONG_TURN,
    instructions:
      'Respond to a demanding prompt, developing a coherent argument with nuance and precise language.',
    suggestedTimeSec: 300,
  },
  {
    part: 3,
    name: 'Part 3: Advanced discussion',
    taskType: T.DISCUSSION,
    instructions:
      'Follow-up questions requiring evaluation, persuasion, and handling of complex ideas.',
    suggestedTimeSec: 300,
  },
];

export const CEFR_TO_EXAM: Record<CefrLevel, CambridgeExam> = {
  A2: 'KEY',
  B1: 'PET',
  B2: 'FIRST',
  C1: 'ADVANCED',
  C2: 'PROFICIENCY',
};

export function getExamBlueprint(cefr: CefrLevel): ExamBlueprint {
  const exam = CEFR_TO_EXAM[cefr];
  if (cefr === 'A2') {
    return { cefr, exam, parts: A2_PARTS };
  }
  if (cefr === 'C2') {
    return { cefr, exam, parts: C2_PARTS };
  }
  return { cefr, exam, parts: FOUR_PARTS_CAMBRIDGE.map((p) => ({ ...p })) };
}

export function parseCefrFromSlug(slug: string): CefrLevel | null {
  const u = slug.toUpperCase();
  if (['A2', 'B1', 'B2', 'C1', 'C2'].includes(u)) {
    return u as CefrLevel;
  }
  return null;
}
