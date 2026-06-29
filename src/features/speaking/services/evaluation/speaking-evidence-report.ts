import type { B2SpeakingCriterionKey } from '@/features/speaking/domain/b2-speaking-score';
import {
  clampB2SpeakingBand,
  computeB2SpeakingTotal,
} from '@/features/speaking/domain/b2-speaking-score';

export type SpeakingEvidenceMetadata = {
  partsCompleted?: number[];
  startedAt?: string;
  endedAt?: string;
  responseDurationsSec?: number[];
};

export type SpeakingEvidenceReport = {
  isCompleteExam: boolean;
  canProvideFullScore: boolean;
  partialFeedback: boolean;
  message: string;
  partsPresent: number[];
  partsMissing: number[];
  candidateWordCountByPart: Record<number, number>;
  candidateTurnCountByPart: Record<number, number>;
  totalCandidateWordCount: number;
  nonEnglishDetected: boolean;
  tooShortParts: number[];
  singleSentenceTurnCount: number;
  canScoreAsFullExam: boolean;
  evidenceNotes: string[];
  maxTotalCap: number | null;
  maxLevelCap: string | null;
  criterionCaps: Partial<Record<B2SpeakingCriterionKey, number>>;
};

const PART_HEADERS: Record<number, RegExp> = {
  1: /^Part\s*1\s*[-–—:]\s*Interview/im,
  2: /^Part\s*2\s*[-–—:]\s*Long turn/im,
  3: /^Part\s*3\s*[-–—:]\s*Collaborative task/im,
  4: /^Part\s*4\s*[-–—:]\s*Discussion/im,
};

const CANDIDATE_LINE_RE =
  /^(?:Candidate|Student|User|Learner|CANDIDATE|STUDENT|USER):\s*(.*)$/i;

export function extractCandidateTextFromLine(line: string): string | null {
  const trimmed = line.replace(/\r$/, '').trim();
  if (!trimmed) return null;
  const labeled = trimmed.match(CANDIDATE_LINE_RE);
  if (labeled) return labeled[1]?.trim() || null;
  if (/^role:\s*candidate\b/i.test(trimmed)) {
    return trimmed.replace(/^role:\s*candidate\s*[-–—:]?\s*/i, '').trim() || null;
  }
  return null;
}

export function countCandidateLinesInTranscript(transcript: string): number {
  return transcript
    .split('\n')
    .map((line) => extractCandidateTextFromLine(line))
    .filter(Boolean).length;
}

export function countCandidateWordsInTranscript(transcript: string): number {
  return transcript
    .split('\n')
    .map((line) => extractCandidateTextFromLine(line))
    .filter(Boolean)
    .reduce((sum, line) => sum + countWords(line ?? ''), 0);
}

const MIN_PART1_TURNS = 5;
const MIN_PART2_WORDS = 80;
const MIN_PART3_TURNS = 2;
const MIN_PART4_TURNS = 2;
const MIN_FULL_EXAM_WORDS = 180;
const SHORT_EXAM_WORDS = 120;
const SINGLE_TURN_WORD_LIMIT = 12;

const SPANISH_HINT =
  /\b(ya|he|hecho|cuando|acaba|esto|qué|que|por|también|está|estoy|partes|español|gracias|hola|donde|porque|muy|tengo|quiero|hacer|parte)\b|[áéíóúñü¿¡]/i;

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function detectNonEnglishInTranscript(text: string): boolean {
  const sample = text.trim();
  if (!sample) return false;
  if (SPANISH_HINT.test(sample)) return true;
  const lines = sample.split(/\n+/).filter(Boolean);
  for (const line of lines) {
    const candidate = extractCandidateTextFromLine(line);
    if (candidate && SPANISH_HINT.test(candidate)) return true;
  }
  return false;
}

type ParsedPart = {
  partNumber: number;
  candidateLines: string[];
  notCompleted: boolean;
};

function parseFormattedTranscript(transcript: string): ParsedPart[] {
  const chunks = transcript.split(/\n\n+/);
  const parts: ParsedPart[] = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed || trimmed.startsWith('[Evaluation note')) continue;

    let partNumber: number | null = null;
    for (const [num, re] of Object.entries(PART_HEADERS)) {
      if (re.test(trimmed.split('\n')[0] ?? '')) {
        partNumber = Number(num);
        break;
      }
    }
    if (!partNumber) continue;

    const candidateLines = trimmed
      .split('\n')
      .map((line) => extractCandidateTextFromLine(line))
      .filter((line): line is string => Boolean(line));

    const notCompleted = candidateLines.length === 0 && /\[Not completed/i.test(trimmed);

    parts.push({ partNumber, candidateLines, notCompleted });
  }

  return parts;
}

function countSingleSentenceTurns(candidateLines: string[]): number {
  return candidateLines.filter((line) => countWords(line) <= SINGLE_TURN_WORD_LIMIT).length;
}

export function buildSpeakingEvidenceReport(
  transcript: string,
  metadata: SpeakingEvidenceMetadata = {},
): SpeakingEvidenceReport {
  const parsed = parseFormattedTranscript(transcript);
  const candidateWordCountByPart: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const candidateTurnCountByPart: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const tooShortParts: number[] = [];
  const evidenceNotes: string[] = [];
  let singleSentenceTurnCount = 0;

  for (const part of parsed) {
    candidateTurnCountByPart[part.partNumber] = part.candidateLines.length;
    candidateWordCountByPart[part.partNumber] = part.candidateLines.reduce(
      (sum, line) => sum + countWords(line),
      0,
    );
    singleSentenceTurnCount += countSingleSentenceTurns(part.candidateLines);

    if (part.notCompleted || part.candidateLines.length === 0) {
      tooShortParts.push(part.partNumber);
      continue;
    }

    if (part.partNumber === 1 && part.candidateLines.length < MIN_PART1_TURNS) {
      tooShortParts.push(1);
    }
    if (part.partNumber === 2 && candidateWordCountByPart[2] < MIN_PART2_WORDS) {
      tooShortParts.push(2);
    }
    if (part.partNumber === 3 && part.candidateLines.length < MIN_PART3_TURNS) {
      tooShortParts.push(3);
    }
    if (part.partNumber === 4 && part.candidateLines.length < MIN_PART4_TURNS) {
      tooShortParts.push(4);
    }
  }

  const partsPresent = parsed
    .filter((p) => p.candidateLines.length > 0 && !p.notCompleted)
    .map((p) => p.partNumber);
  const partsMissing = [1, 2, 3, 4].filter((p) => !partsPresent.includes(p));
  const totalCandidateWordCount =
    parsed.length > 0
      ? Object.values(candidateWordCountByPart).reduce((a, b) => a + b, 0)
      : countCandidateWordsInTranscript(transcript);
  const nonEnglishDetected = detectNonEnglishInTranscript(transcript);

  const completedMeta = metadata.partsCompleted ?? [];
  const isCompleteExam =
    partsMissing.length === 0 &&
    (completedMeta.length >= 4 || partsPresent.length >= 4);

  if (partsMissing.length > 0) {
    evidenceNotes.push(`Missing evidence for Part(s) ${partsMissing.join(', ')}.`);
  }
  if (totalCandidateWordCount < MIN_FULL_EXAM_WORDS) {
    evidenceNotes.push(
      `Total candidate output is ${totalCandidateWordCount} words (minimum ~${MIN_FULL_EXAM_WORDS} for a full exam estimate).`,
    );
  }
  if (nonEnglishDetected) {
    evidenceNotes.push('Non-English responses detected in the transcript.');
  }
  if (singleSentenceTurnCount >= 4) {
    evidenceNotes.push('Many answers are very short single-sentence responses.');
  }

  const meetsPartRules =
    candidateTurnCountByPart[1] >= MIN_PART1_TURNS &&
    candidateWordCountByPart[2] >= MIN_PART2_WORDS &&
    candidateTurnCountByPart[3] >= MIN_PART3_TURNS &&
    candidateTurnCountByPart[4] >= MIN_PART4_TURNS &&
    totalCandidateWordCount >= MIN_FULL_EXAM_WORDS;

  const canScoreAsFullExam = isCompleteExam && meetsPartRules && partsMissing.length === 0;
  const canProvideFullScore = canScoreAsFullExam && !nonEnglishDetected;
  const partialFeedback = !canProvideFullScore;

  const criterionCaps: Partial<Record<B2SpeakingCriterionKey, number>> = {};
  let maxTotalCap: number | null = null;
  let maxLevelCap: string | null = null;

  if (partsMissing.length > 0 || !isCompleteExam) {
    maxTotalCap = 36;
    maxLevelCap = 'B1+';
  }

  if (totalCandidateWordCount < SHORT_EXAM_WORDS) {
    maxTotalCap = maxTotalCap == null ? 30 : Math.min(maxTotalCap, 30);
    maxLevelCap = 'B1';
  } else if (totalCandidateWordCount < MIN_FULL_EXAM_WORDS) {
    maxTotalCap = maxTotalCap == null ? 36 : Math.min(maxTotalCap, 36);
    maxLevelCap = maxLevelCap ?? 'B1+';
  }

  if (nonEnglishDetected) {
    criterionCaps.global_achievement = 2;
    maxLevelCap = maxLevelCap === 'B1' ? 'B1' : 'B1+';
  }

  if (tooShortParts.includes(2) || candidateWordCountByPart[2] < MIN_PART2_WORDS) {
    criterionCaps.discourse_management = 2.5;
  }

  if (tooShortParts.includes(3) || candidateTurnCountByPart[3] < MIN_PART3_TURNS) {
    criterionCaps.interactive_communication = 2;
  }

  if (singleSentenceTurnCount >= 4) {
    criterionCaps.discourse_management = Math.min(
      criterionCaps.discourse_management ?? 5,
      2.5,
    );
  }

  const message = canProvideFullScore
    ? 'Sufficient evidence for a full B2 Speaking exam estimate.'
    : 'This is not a complete speaking exam. Complete all four parts to receive a full B2 Speaking score.';

  return {
    isCompleteExam,
    canProvideFullScore,
    partialFeedback,
    message,
    partsPresent,
    partsMissing,
    candidateWordCountByPart,
    candidateTurnCountByPart,
    totalCandidateWordCount,
    nonEnglishDetected,
    tooShortParts: [...new Set(tooShortParts)],
    singleSentenceTurnCount,
    canScoreAsFullExam,
    evidenceNotes,
    maxTotalCap,
    maxLevelCap,
    criterionCaps,
  };
}

export function capEstimatedLevel(level: string, maxLevelCap: string | null): string {
  if (!maxLevelCap) return level;
  const rank: Record<string, number> = {
    'Below B1': 0,
    B1: 1,
    'B1+': 2,
    B2: 3,
    C1: 4,
  };
  const levelRank = rank[level] ?? 1;
  const capRank = rank[maxLevelCap] ?? 2;
  if (levelRank <= capRank) return level;
  return maxLevelCap;
}

export function applyEvidenceCapsToScores(
  scores: Partial<Record<B2SpeakingCriterionKey, number>>,
  evidence: SpeakingEvidenceReport,
): Partial<Record<B2SpeakingCriterionKey, number>> {
  const capped: Partial<Record<B2SpeakingCriterionKey, number>> = { ...scores };

  for (const [key, cap] of Object.entries(evidence.criterionCaps) as Array<
    [B2SpeakingCriterionKey, number]
  >) {
    const current = capped[key];
    if (typeof current === 'number') {
      capped[key] = Math.min(current, cap);
    } else {
      capped[key] = cap;
    }
  }

  return capped;
}

export function enforceTotalCapOnScores(
  scores: Partial<Record<B2SpeakingCriterionKey, number>>,
  maxTotal: number | null,
): Partial<Record<B2SpeakingCriterionKey, number>> {
  if (maxTotal == null) return scores;
  const next = { ...scores };
  let guard = 0;
  while (computeB2SpeakingTotal(next) > maxTotal && guard < 50) {
    if ((next.global_achievement ?? 0) > 0) {
      next.global_achievement = clampB2SpeakingBand((next.global_achievement ?? 0) - 0.5);
    } else if ((next.discourse_management ?? 0) > 0) {
      next.discourse_management = clampB2SpeakingBand((next.discourse_management ?? 0) - 0.5);
    } else if ((next.interactive_communication ?? 0) > 0) {
      next.interactive_communication = clampB2SpeakingBand((next.interactive_communication ?? 0) - 0.5);
    } else if ((next.grammar_vocabulary ?? 0) > 0) {
      next.grammar_vocabulary = clampB2SpeakingBand((next.grammar_vocabulary ?? 0) - 0.5);
    } else if ((next.pronunciation ?? 0) > 0) {
      next.pronunciation = clampB2SpeakingBand((next.pronunciation ?? 0) - 0.5);
    } else {
      break;
    }
    guard += 1;
  }
  return next;
}

/** Build formatted transcript for evidence tests from raw candidate lines in Part 1 only. */
export function formatMinimalTranscriptForEvidenceTest(candidateLines: string[]): string {
  const body = candidateLines.map((line) => `Candidate: ${line}`).join('\n');
  return [
    `Part 1 - Interview\n${body}`,
    'Part 2 - Long turn\n[Not completed — no transcript for this part.]',
    'Part 3 - Collaborative task\n[Not completed — no transcript for this part.]',
    'Part 4 - Discussion\n[Not completed — no transcript for this part.]',
  ].join('\n\n');
}
