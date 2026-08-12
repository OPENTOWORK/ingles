/**
 * Golden profile comparison — criterion profile is primary; total is secondary.
 */

import type {
  GoldenExpectedMarks,
  GoldenProfileComparison,
  CriterionComparison,
} from './calibration-types';

const CRITERION_KEYS: (keyof GoldenExpectedMarks)[] = [
  'content',
  'communicative_achievement',
  'organisation',
  'language',
];

export function sumGoldenMarks(marks: GoldenExpectedMarks): number {
  return CRITERION_KEYS.reduce((sum, key) => sum + marks[key], 0);
}

export function compareGoldenProfiles(
  case_id: string,
  expected: GoldenExpectedMarks,
  actual: GoldenExpectedMarks | null,
): GoldenProfileComparison {
  const expected_total = sumGoldenMarks(expected);
  const actual_total = actual ? sumGoldenMarks(actual) : null;

  const criterion_comparisons: CriterionComparison[] = CRITERION_KEYS.map((criterion) => {
    const expectedMark = expected[criterion];
    const actualMark = actual ? actual[criterion] : null;
    return {
      criterion,
      expected: expectedMark,
      actual: actualMark,
      match: actualMark !== null && actualMark === expectedMark,
    };
  });

  const exact_criteria_matched = criterion_comparisons.filter((c) => c.match).length;
  const exact_profile_match =
    actual !== null && criterion_comparisons.every((c) => c.match);
  const same_total_wrong_profile =
    actual !== null &&
    actual_total === expected_total &&
    !exact_profile_match;

  return {
    case_id,
    expected_marks: expected,
    actual_marks: actual,
    expected_total,
    actual_total,
    exact_profile_match,
    same_total_wrong_profile,
    criterion_comparisons,
    exact_criteria_matched,
  };
}

export function aggregateCriterionAccuracy(
  comparisons: GoldenProfileComparison[],
): Record<keyof GoldenExpectedMarks, number> {
  const totals = {
    content: 0,
    communicative_achievement: 0,
    organisation: 0,
    language: 0,
  };
  let count = 0;
  for (const comparison of comparisons) {
    if (!comparison.actual_marks) continue;
    count += 1;
    for (const key of CRITERION_KEYS) {
      if (comparison.expected_marks[key] === comparison.actual_marks[key]) {
        totals[key] += 1;
      }
    }
  }
  if (count === 0) {
    return {
      content: 0,
      communicative_achievement: 0,
      organisation: 0,
      language: 0,
    };
  }
  return {
    content: totals.content / count,
    communicative_achievement: totals.communicative_achievement / count,
    organisation: totals.organisation / count,
    language: totals.language / count,
  };
}

export function aggregateMeanAbsoluteDeviation(
  comparisons: GoldenProfileComparison[],
): Record<keyof GoldenExpectedMarks, number> {
  const sums = {
    content: 0,
    communicative_achievement: 0,
    organisation: 0,
    language: 0,
  };
  let count = 0;
  for (const comparison of comparisons) {
    if (!comparison.actual_marks) continue;
    count += 1;
    for (const key of CRITERION_KEYS) {
      sums[key] += Math.abs(
        comparison.expected_marks[key] - comparison.actual_marks[key],
      );
    }
  }
  if (count === 0) {
    return {
      content: 0,
      communicative_achievement: 0,
      organisation: 0,
      language: 0,
    };
  }
  return {
    content: sums.content / count,
    communicative_achievement: sums.communicative_achievement / count,
    organisation: sums.organisation / count,
    language: sums.language / count,
  };
}
