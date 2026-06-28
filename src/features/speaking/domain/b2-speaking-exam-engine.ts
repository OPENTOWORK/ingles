import type {
  B2SpeakingExamContent,
  B2SpeakingExamEngineState,
  B2SpeakingExamEngineStep,
  B2SpeakingExamTurn,
  B2SpeakingSpeakerRole,
} from './b2-speaking-exam-bank.types';

export const B2_LONG_TURN_SECONDS = 60;

type ScriptLine = {
  partNumber: 1 | 2 | 3 | 4;
  speakerRole: B2SpeakingSpeakerRole;
  text: string;
  /** After this line, wait for candidate (except partner/examiner-only chains). */
  awaitCandidate?: boolean;
  /** Part 2 only — show photos before this line. */
  showPhotos?: boolean;
  /** Part 2 only — start long-turn timer after this line. */
  startLongTurn?: boolean;
};

function buildScript(exam: B2SpeakingExamContent): ScriptLine[] {
  const script: ScriptLine[] = [];

  for (const q of exam.part1_questions) {
    script.push({ partNumber: 1, speakerRole: 'examiner', text: q, awaitCandidate: true });
  }

  script.push({
    partNumber: 2,
    speakerRole: 'examiner',
    text: exam.part2.examinerIntro,
    showPhotos: true,
  });
  script.push({
    partNumber: 2,
    speakerRole: 'examiner',
    text: exam.part2.prompt,
    startLongTurn: true,
    awaitCandidate: true,
  });
  script.push({
    partNumber: 2,
    speakerRole: 'examiner',
    text: exam.part2.followUpQuestion,
    awaitCandidate: true,
  });

  const optionsText = exam.part3.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n');
  script.push({
    partNumber: 3,
    speakerRole: 'examiner',
    text: `${exam.part3.examinerIntro}\n\n${exam.part3.taskPrompt}\n\n${optionsText}`,
    awaitCandidate: true,
  });

  for (const partnerLine of exam.part3.partnerLines) {
    script.push({ partNumber: 3, speakerRole: 'partner', text: partnerLine, awaitCandidate: true });
  }

  script.push({
    partNumber: 3,
    speakerRole: 'examiner',
    text: exam.part3.decisionQuestion,
    awaitCandidate: true,
  });

  for (const q of exam.part4_questions) {
    script.push({ partNumber: 4, speakerRole: 'examiner', text: q, awaitCandidate: true });
  }

  return script;
}

const scriptCache = new Map<string, ScriptLine[]>();

export function getExamScript(exam: B2SpeakingExamContent): ScriptLine[] {
  const cached = scriptCache.get(exam.id);
  if (cached) return cached;
  const built = buildScript(exam);
  scriptCache.set(exam.id, built);
  return built;
}

export function createB2ExamEngineState(examId: string): B2SpeakingExamEngineState {
  return {
    examId,
    partNumber: 1,
    stepIndex: 0,
    phase: 'intro',
    candidateTurnCount: 0,
    partsCompleted: [],
    longTurnSecondsLeft: null,
  };
}

export function getScriptLineAt(exam: B2SpeakingExamContent, stepIndex: number): ScriptLine | null {
  const script = getExamScript(exam);
  return script[stepIndex] ?? null;
}

/** Lines to display from current step until next await_candidate boundary (inclusive setup). */
export function resolveStepsFromEngine(
  exam: B2SpeakingExamContent,
  state: B2SpeakingExamEngineState,
): B2SpeakingExamEngineStep[] {
  const script = getExamScript(exam);
  const line = script[state.stepIndex];
  if (!line) {
    return [{ kind: 'exam_finished' }];
  }

  const steps: B2SpeakingExamEngineStep[] = [];

  if (line.showPhotos) {
    steps.push({
      kind: 'photos',
      imageA: exam.part2.imageA,
      imageB: exam.part2.imageB,
      prompt: exam.part2.prompt,
      partNumber: 2,
    });
  }

  steps.push({
    kind: 'display',
    speakerRole: line.speakerRole,
    text: line.text,
    partNumber: line.partNumber,
  });

  if (line.startLongTurn) {
    steps.push({ kind: 'long_turn_start', seconds: B2_LONG_TURN_SECONDS, partNumber: 2 });
    steps.push({ kind: 'await_candidate', partNumber: 2 });
    return steps;
  }

  if (line.awaitCandidate) {
    steps.push({ kind: 'await_candidate', partNumber: line.partNumber });
  }

  return steps;
}

export function advanceEnginePastDisplayOnly(
  exam: B2SpeakingExamContent,
  state: B2SpeakingExamEngineState,
): B2SpeakingExamEngineState {
  const script = getExamScript(exam);
  const line = script[state.stepIndex];
  if (!line || line.awaitCandidate || line.startLongTurn) return state;
  const nextIndex = state.stepIndex + 1;
  const nextLine = script[nextIndex];
  return {
    ...state,
    stepIndex: nextIndex,
    partNumber: nextLine?.partNumber ?? state.partNumber,
    phase: nextLine?.startLongTurn ? 'long_turn_recording' : 'intro',
  };
}

export function advanceEngineAfterCandidate(
  exam: B2SpeakingExamContent,
  state: B2SpeakingExamEngineState,
): B2SpeakingExamEngineState {
  const script = getExamScript(exam);
  let nextIndex = state.stepIndex + 1;
  const current = script[state.stepIndex];
  const partNumber = current?.partNumber ?? state.partNumber;

  while (nextIndex < script.length) {
    const next = script[nextIndex];
    if (next.awaitCandidate || next.startLongTurn || next.showPhotos) break;
    nextIndex += 1;
  }

  const partsCompleted = [...state.partsCompleted];
  if (nextIndex >= script.length) {
    if (!partsCompleted.includes(partNumber)) partsCompleted.push(partNumber);
    for (const p of [1, 2, 3, 4] as const) {
      if (!partsCompleted.includes(p)) partsCompleted.push(p);
    }
    return {
      ...state,
      stepIndex: nextIndex,
      phase: 'exam_complete',
      partNumber: 4,
      candidateTurnCount: state.candidateTurnCount + 1,
      partsCompleted: [1, 2, 3, 4],
      longTurnSecondsLeft: null,
    };
  }

  const nextLine = script[nextIndex];
  const nextPart = nextLine?.partNumber ?? partNumber;
  if (nextPart !== partNumber && !partsCompleted.includes(partNumber)) {
    partsCompleted.push(partNumber);
  }

  let phase = state.phase;
  if (nextLine?.startLongTurn) phase = 'long_turn_recording';
  else if (nextLine?.awaitCandidate) phase = 'await_candidate';
  else phase = 'intro';

  return {
    ...state,
    stepIndex: nextIndex,
    partNumber: nextPart,
    phase,
    candidateTurnCount: state.candidateTurnCount + 1,
    partsCompleted,
    longTurnSecondsLeft: nextLine?.startLongTurn ? B2_LONG_TURN_SECONDS : null,
  };
}

export function skipToAwaitCandidate(
  exam: B2SpeakingExamContent,
  state: B2SpeakingExamEngineState,
): B2SpeakingExamEngineState {
  const script = getExamScript(exam);
  let idx = state.stepIndex;
  while (idx < script.length && !script[idx]?.awaitCandidate && !script[idx]?.startLongTurn) {
    idx += 1;
  }
  return { ...state, stepIndex: idx };
}

export function countExpectedCandidateTurns(exam: B2SpeakingExamContent): number {
  return getExamScript(exam).filter((l) => l.awaitCandidate || l.startLongTurn).length;
}

export function formatB2ExamTranscript(
  turns: B2SpeakingExamTurn[],
  exam: B2SpeakingExamContent,
  partsCompleted: number[],
): string {
  const partTitles: Record<number, string> = {
    1: 'Part 1 - Interview',
    2: 'Part 2 - Long turn',
    3: 'Part 3 - Collaborative task',
    4: 'Part 4 - Discussion',
  };

  const roleLabel: Record<B2SpeakingSpeakerRole, string> = {
    examiner: 'Examiner',
    candidate: 'Candidate',
    partner: 'Partner',
  };

  const sections: string[] = [];
  const allParts = [1, 2, 3, 4];
  const completedSet = new Set(partsCompleted);

  for (const part of allParts) {
    const partTurns = turns.filter((t) => t.partNumber === part);
    const header = partTitles[part] ?? `Part ${part}`;
    if (partTurns.length === 0) {
      sections.push(`${header}\n[Not completed — no transcript for this part.]`);
      continue;
    }
    const lines = partTurns.map((t) => `${roleLabel[t.speakerRole]}: ${t.text}`);
    const incompleteNote =
      completedSet.has(part) || partTurns.some((t) => t.speakerRole === 'candidate')
        ? ''
        : '\n[Part may be incomplete.]';
    sections.push(`${header}\n${lines.join('\n')}${incompleteNote}`);
  }

  const missingParts = allParts.filter((p) => !completedSet.has(p) && !turns.some((t) => t.partNumber === p && t.speakerRole === 'candidate'));
  if (missingParts.length > 0) {
    sections.push(
      `\n[Evaluation note: Parts ${missingParts.join(', ')} may be missing or incomplete. Score holistically but flag partial exam.]`,
    );
  }

  return sections.join('\n\n');
}

export function isExamFullyComplete(state: B2SpeakingExamEngineState): boolean {
  return state.phase === 'exam_complete' && state.partsCompleted.length >= 4;
}
