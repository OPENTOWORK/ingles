/**
 * Phase 9 — Twelve official Cambridge golden cases.
 *
 * Fixtures are loaded from immutable JSON under ./fixtures/.
 * Expected marks live ONLY here (calibration infrastructure).
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GoldenCase, GoldenExpectedMarks } from './calibration-types';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

export const CAMBRIDGE_GOLDEN_SOURCE_PDFS = {
  handbook_2025: '167791-b2-first-handbook.pdf',
  sample_answers_2015: '182410-first-writing-sample-answers-and-examiner-comments-2015.pdf',
  sample_paper_1_writing: 'B2 First sample paper 1 Writing 2022.pdf',
  sample_paper_2_writing: 'B2 First sample paper 2 Writing 2022.pdf',
} as const;

const GOLDEN_IDS = [
  'G-01',
  'G-02',
  'G-03',
  'G-04',
  'G-05',
  'G-06',
  'G-07',
  'G-08',
  'G-09',
  'G-10',
  'G-11',
  'G-12',
] as const;

function loadFixture(caseId: string): GoldenCase {
  const raw = JSON.parse(readFileSync(join(FIXTURE_DIR, `${caseId}.json`), 'utf8')) as GoldenCase;
  return Object.freeze({
    ...raw,
    expected_marks: Object.freeze({ ...raw.expected_marks }),
    source_verification: Object.freeze({ ...raw.source_verification }),
  });
}

export const GOLDEN_CASES: readonly GoldenCase[] = Object.freeze(
  GOLDEN_IDS.map((id) => loadFixture(id)),
);

export const GOLDEN_CASE_IDS = GOLDEN_CASES.map((c) => c.case_id);

export function getGoldenCase(caseId: string): GoldenCase | undefined {
  return GOLDEN_CASES.find((c) => c.case_id === caseId);
}

export function isGoldenCaseRunnable(case_: GoldenCase): boolean {
  return Boolean(
    case_.task_prompt?.trim() &&
      case_.candidate_response?.trim() &&
      case_.source_verification.task_prompt === 'verified' &&
      case_.source_verification.candidate_response === 'verified' &&
      case_.task_prompt_checksum &&
      case_.candidate_response_checksum,
  );
}

export function listMissingGoldenSources(): GoldenCase[] {
  return GOLDEN_CASES.filter((c) => !isGoldenCaseRunnable(c));
}

export function checksumText(text: string): string {
  const normalised = text.normalize('NFC').replace(/\r\n?/g, '\n');
  return createHash('sha256').update(normalised, 'utf8').digest('hex');
}

export function assertFixtureImmutable(case_: GoldenCase): void {
  if (!case_.task_prompt || !case_.candidate_response) {
    throw new Error(`${case_.case_id}: missing task_prompt or candidate_response`);
  }
  const taskHash = checksumText(case_.task_prompt);
  const responseHash = checksumText(case_.candidate_response);
  if (case_.task_prompt_checksum && case_.task_prompt_checksum !== taskHash) {
    throw new Error(`${case_.case_id}: task_prompt checksum mismatch (fixture mutated)`);
  }
  if (case_.candidate_response_checksum && case_.candidate_response_checksum !== responseHash) {
    throw new Error(`${case_.case_id}: candidate_response checksum mismatch (fixture mutated)`);
  }
}

export function verifyAllGoldenSources(): {
  ok: boolean;
  runnable: number;
  missing: string[];
  failures: string[];
} {
  const missing: string[] = [];
  const failures: string[] = [];
  for (const goldenCase of GOLDEN_CASES) {
    if (!isGoldenCaseRunnable(goldenCase)) {
      missing.push(goldenCase.case_id);
      continue;
    }
    try {
      assertFixtureImmutable(goldenCase);
      const marks = goldenCase.expected_marks;
      for (const key of Object.keys(marks) as (keyof GoldenExpectedMarks)[]) {
        const value = marks[key];
        if (!Number.isInteger(value) || value < 0 || value > 5) {
          failures.push(`${goldenCase.case_id}: invalid mark ${key}=${value}`);
        }
      }
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  return {
    ok: missing.length === 0 && failures.length === 0,
    runnable: GOLDEN_CASES.length - missing.length,
    missing,
    failures,
  };
}

/** For tests: register a verified fixture without mutating GOLDEN_CASES. */
export function buildVerifiedGoldenFixture(
  base: GoldenCase,
  task_prompt: string,
  candidate_response: string,
): GoldenCase {
  return {
    ...base,
    task_prompt,
    candidate_response,
    source_verification: {
      ...base.source_verification,
      task_prompt: 'verified',
      candidate_response: 'verified',
    },
    task_prompt_checksum: checksumText(task_prompt),
    candidate_response_checksum: checksumText(candidate_response),
  };
}
