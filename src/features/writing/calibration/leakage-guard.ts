/**
 * Leakage guards — golden labels must not reach runtime engine prompts.
 */

import type { GoldenCase, GoldenExpectedMarks } from './calibration-types';

const CRITERION_KEYS: (keyof GoldenExpectedMarks)[] = [
  'content',
  'communicative_achievement',
  'organisation',
  'language',
];

export interface PromptLeakageFinding {
  kind:
    | 'expected_mark'
    | 'examiner_commentary'
    | 'golden_profile_line'
    | 'case_id'
    | 'calibration_result';
  detail: string;
}

function markLeakPatterns(marks: GoldenExpectedMarks): string[] {
  const patterns: string[] = [];
  for (const key of CRITERION_KEYS) {
    patterns.push(`"${key}": ${marks[key]}`);
    patterns.push(`"${key}":${marks[key]}`);
  }
  patterns.push(
    `C ${marks.content}`,
    `CA ${marks.communicative_achievement}`,
    `O ${marks.organisation}`,
    `L ${marks.language}`,
    `${marks.content} · ${marks.communicative_achievement}`,
    `expected_marks`,
  );
  return patterns;
}

export function scanPromptForGoldenLeakage(
  system: string,
  user: string,
  goldenCase: GoldenCase,
): PromptLeakageFinding[] {
  const findings: PromptLeakageFinding[] = [];
  const combined = `${system}\n${user}`;

  if (combined.includes(goldenCase.case_id)) {
    findings.push({
      kind: 'case_id',
      detail: `prompt contains golden case_id ${goldenCase.case_id}`,
    });
  }

  for (const pattern of markLeakPatterns(goldenCase.expected_marks)) {
    if (combined.includes(pattern)) {
      findings.push({
        kind: 'expected_mark',
        detail: `prompt contains expected-mark pattern: ${pattern}`,
      });
    }
  }

  if (goldenCase.examiner_commentary?.trim()) {
    const snippet = goldenCase.examiner_commentary.slice(0, 48);
    if (snippet.length >= 24 && combined.includes(snippet)) {
      findings.push({
        kind: 'examiner_commentary',
        detail: 'prompt contains examiner commentary snippet',
      });
    }
  }

  if (combined.includes('OFFICIAL CALIBRATION PROFILES')) {
    findings.push({
      kind: 'golden_profile_line',
      detail: 'prompt contains OFFICIAL CALIBRATION PROFILES block',
    });
  }

  if (/exact_profile_match|baseline-1|calibration result/i.test(combined)) {
    findings.push({
      kind: 'calibration_result',
      detail: 'prompt contains calibration-result vocabulary',
    });
  }

  return findings;
}

export function assertNoGoldenLeakage(
  system: string,
  user: string,
  goldenCase: GoldenCase,
): void {
  const findings = scanPromptForGoldenLeakage(system, user, goldenCase);
  if (findings.length) {
    throw new Error(
      `golden label leakage detected for ${goldenCase.case_id}: ${findings.map((f) => f.detail).join('; ')}`,
    );
  }
}

export function assertNoExpectedMarksInPrompt(
  system: string,
  user: string,
  expected: GoldenExpectedMarks,
  caseId = 'test',
): void {
  const combined = `${system}\n${user}`;
  for (const pattern of markLeakPatterns(expected)) {
    if (combined.includes(pattern)) {
      throw new Error(
        `expected marks leaked into prompt for ${caseId}: ${pattern}`,
      );
    }
  }
}
