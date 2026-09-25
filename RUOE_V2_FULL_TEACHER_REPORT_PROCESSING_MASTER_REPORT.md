# RUOE v2 full teacher-report processing

Date: 23 September 2026  
Status of every repaired exam: PENDING HUMAN REVIEW  
Production, Supabase, prompt overrides, and v1: untouched

The zip contained 12 teacher-patch reviews. Each review file is numbered 1–12 and matches generated bank exams 5–16 by passage title. The repair input was the original generated part file under `scripts/generated/b2-exams/`. Those source files were not overwritten.

Local versions:

`local-teacher-repairs/ruoe-v2-phase10/exams/exam-NN/DRALO_RUOE_Exam_NN_vNEXT_Teacher_Repair_v2.json`

Each exam also has `repair-log.json`.

## Counts

| Status | Count |
| --- | ---: |
| Comments processed | 590 |
| PASS | 103 |
| NO_CHANGE_REQUIRED | 443 |
| REFERENCE_INCOMPLETE | 24 |
| REFERENCE_MISMATCH | 0 |
| PIPELINE_FAIL | 0 |
| HARD_FAIL | 0 |
| QUALITY_FAIL | 20 |

PASS items are in the local repaired exams. QUALITY_FAIL items were reverted to the original wording, so a failed teacher option set was not kept.

## Changes by part

| Part | Accepted changes |
| --- | ---: |
| 1 | 8 |
| 2 | 21 |
| 3 | 18 |
| 4 | 20 |
| 5 | 4 |
| 6 | 0 |
| 7 | 32 |

## What was validated

- Part 1 accepted items passed an independent A–D substitution check on gpt-4o-mini. If more than one option survived, the teacher option set was rejected and the original item was kept.
- Part 3 accepted items passed direct-derivation checks. `DISAPPOINT → disappointment` (Exam 6 Q23) passed a complete lexical-family judgement. `DECIDE → decisions` (Exam 16 Q17) passed as a plural derivation required by the sentence.
- Part 4 accepted items passed the 2–5 word rule, the unchanged keyword, and a separate semantic check. A mechanical pass did not override a semantic failure.
- Part 2 accepted items keep one-word answers and gaps 9–16. A fresh positive alternative-answer search was not run. Human review still needs to confirm that each gap has only one natural answer.
- Parts 5 and 6 whole-article blocks could not be separated cleanly from review headings, so those passages and Part 6 option pools were left unchanged (`REFERENCE_INCOMPLETE`, 12 exams × 2). Individual Part 5 and Part 7 prompts were updated only when the question wording itself differed.

## Unresolved items that need a human decision

Twenty Part 1 teacher option sets still have more than one defensible answer. They remain at the original wording:

- Exam 5: Q2, Q3, Q5, Q6, Q7, Q8
- Exam 6: Q2, Q4, Q6, Q7
- Exam 7: Q1, Q5
- Exam 8: Q2, Q7
- Exam 9: Q1
- Exam 10: Q6, Q7, Q8
- Exam 13: Q1
- Exam 14: Q4

Exam 11 Q25 was replaced with the teacher item “The company started using flexible working arrangements three years ago…” / `BEEN` / `has been using`. The new pair passed the semantic check. The previous source item was about flexible hours and staff morale (`had been making`). Confirm that this replacement is the intended question before approval.

Exam 11 Q22: the historical key `EQUAL` was not applied, because the answer would repeat the stem. The accepted repair is the local sentence “progress can be (22) ___ (EQUAL)”, with the answer kept as `unequal`.

Exam 16 Q6: the teacher distractor `valuable` still survived beside `positive`, so that set was not accepted. The applied options are `negative / weak / certain / positive`, key D, which removes `strong` and leaves one survivor.

Exam 16 Part 2 example opening was revised to “discoveries … were thought to have (0) ___ mostly the result of chance.” The example answer remains `been`. Gaps 9–16 were not changed.

## Production confirmation

No production exam, Supabase row, database prompt override, or `useCodePrompts` setting was written. v2 was not activated. Original generated part files remain the pre-repair sources.
