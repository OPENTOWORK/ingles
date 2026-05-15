import type { ExamPartDefinition } from './types';
import { getExamBlueprint } from './exam-blueprints';

/** Partes 14–17 del examen B2 = Cambridge Speaking parts 1–4. */
export const B2_SPEAKING_PART_MIN = 14;
export const B2_SPEAKING_PART_MAX = 17;

export type B2SpeakingExamPartConfig = {
  partNumber: number;
  blueprintIndex: number;
  title: string;
  /** Instrucciones del interlocutor (panel fijo). */
  instructions: string;
  suggestedTimeSec: number;
  /** Modo de interacción en UI. */
  uiMode: 'interview' | 'long_turn' | 'collaborative' | 'discussion';
  longTurnSeconds?: number;
};

const B2_BLUEPRINT = getExamBlueprint('B2');

function cambridgePart(index: number): ExamPartDefinition {
  return B2_BLUEPRINT.parts[index] ?? B2_BLUEPRINT.parts[0];
}

export const B2_SPEAKING_EXAM_PARTS: B2SpeakingExamPartConfig[] = [
  {
    partNumber: 14,
    blueprintIndex: 0,
    title: 'Part 1: Interview',
    instructions:
      cambridgePart(0).instructions +
      ' Answer each question with reasons and examples where appropriate.',
    suggestedTimeSec: cambridgePart(0).suggestedTimeSec,
    uiMode: 'interview',
  },
  {
    partNumber: 15,
    blueprintIndex: 1,
    title: 'Part 2: Long turn (photographs)',
    instructions:
      'Compare the two photographs and answer the question. Speak for about one minute on your own. ' +
      'Then listen to a short follow-up question from the examiner.',
    suggestedTimeSec: 240,
    uiMode: 'long_turn',
    longTurnSeconds: 60,
  },
  {
    partNumber: 16,
    blueprintIndex: 2,
    title: 'Part 3: Collaborative task',
    instructions:
      cambridgePart(2).instructions +
      ' Discuss the situation with your partner (the examiner plays your partner). Exchange ideas and try to reach a decision.',
    suggestedTimeSec: cambridgePart(2).suggestedTimeSec,
    uiMode: 'collaborative',
  },
  {
    partNumber: 17,
    blueprintIndex: 3,
    title: 'Part 4: Discussion',
    instructions:
      cambridgePart(3).instructions +
      ' Give developed answers. The questions are related to the topic of Part 3.',
    suggestedTimeSec: cambridgePart(3).suggestedTimeSec,
    uiMode: 'discussion',
  },
];

export function getB2SpeakingPartConfig(partNumber: number): B2SpeakingExamPartConfig | null {
  return B2_SPEAKING_EXAM_PARTS.find((p) => p.partNumber === partNumber) ?? null;
}

export function buildB2ExaminerSystemExtra(
  config: B2SpeakingExamPartConfig,
  dbDescription = '',
): string {
  const base = dbDescription.trim();
  switch (config.uiMode) {
    case 'interview':
      return (
        `${base ? `Materials: ${base}\n` : ''}` +
        'Ask personal interview questions one at a time (home, work/study, hobbies, plans). ' +
        'Do not correct language during the test.'
      );
    case 'long_turn':
      return (
        `${base ? `Task context: ${base}\n` : ''}` +
        'First give the candidate clear instructions to compare two photographs for about one minute. ' +
        'After they finish, ask ONE short follow-up question about their partner\'s photos (as in FCE). ' +
        'During their long turn do not interrupt.'
      );
    case 'collaborative':
      return (
        `${base ? `Situation: ${base}\n` : ''}` +
        'You are the other candidate AND subtly guide the task. React to their ideas, add one idea per turn, ' +
        'ask them to decide. Do not teach English.'
      );
    case 'discussion':
      return (
        `${base ? `Discussion theme: ${base}\n` : ''}` +
        'Ask questions related to the Part 3 topic. One question at a time. Encourage extended answers.'
      );
    default:
      return base;
  }
}
