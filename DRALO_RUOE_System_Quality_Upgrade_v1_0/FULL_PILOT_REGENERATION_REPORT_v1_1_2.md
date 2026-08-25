# FULL_PILOT_REGENERATION_REPORT_v1_1_2

**Date:** 2026-08-17T13:17:43.293Z
**Status:** Regeneration complete · PENDING_HUMAN_REVIEW

## Generation performed

- RUOE-PILOT-E01 — Parts 1–7 regenerated with approved briefs + blueprint.
- RUOE-PILOT-E02 — Parts 1–7 regenerated with approved briefs + blueprint.
- Local code prompts (`useCodePrompts` equivalent via `resolveDefaultExamPartGenerationPrompt`).

## E02 Part 4 isolated retry

- **Outcome:** mechanical PASS with 0 HARD after metadata normalization v1.1.2
- **Metadata hardening:** v1.1.2


## E02 Part 1 / Part 2 — HARD audit (blocking vs quality-review)

Mechanical `validation.ok` uses `validateGeneratedExamPart` only. Blind-solve disagreements from
`validateB2Part1Quality` / `validateB2Part2Quality` are stored in `part_quality.errors` and
**do not** block mechanical validation. Prior reports incorrectly summed them into `hard_fail_count`.

### RUOE-PILOT-E02 · Part 1 (CB-PILOT-007)

| Field | Value |
| --- | --- |
| rule_id | `BLIND-SOLVE-MISMATCH` (quality validator; no structured rule_id in JSON) |
| severity | Quality-review error (`part_quality.ok=false`) — **not** mechanical HARD |
| location | Q1, Q4, Q8 (≥2 blind-solve mismatches trigger one aggregated error) |
| evidence | Key A/solver B (Q1), key D/solver A (Q4), key B/solver D (Q8) |
| in validation.errors | **No** |
| blocks validation.ok | **No** (mechanical PASS remains valid) |
| classification | Reporting inconsistency fixed — counted as `quality_review_hard`, not blocking HARD |

### RUOE-PILOT-E02 · Part 2 (CB-PILOT-008)

| Field | Value |
| --- | --- |
| rule_id | `BLIND-SOLVE-MISMATCH` (quality validator) |
| severity | Quality-review error — **not** mechanical HARD |
| location | Q10, Q13 (2 gap mismatches) |
| evidence | Key "of"/solver "to" (Q10); key "this"/solver "the" (Q13) |
| in validation.errors | **No** |
| blocks validation.ok | **No** |
| classification | Reporting inconsistency fixed — quality-review HARD only |

**Pedagogical note:** Both findings are real ambiguity signals for human review (aligned with QA-001).
Local repair would target individual items (re-gap / re-key), not full-part regeneration.

## Output files

- Regenerated JSON: `DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1\DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1\05_OUTPUTS_REGENERATED_v1_1_2/EXAM-01/`, `EXAM-02/`
- Manifest: `DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1\DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1\05_OUTPUTS_REGENERATED_v1_1_2\regeneration_manifest.json`
- Human review: `DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1\DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1\05_OUTPUTS_REGENERATED_v1_1_2\HUMAN_REVIEW_REGENERATED_v1_1_2.md`
- Comparison: `DRALO_RUOE_System_Quality_Upgrade_v1_0\PILOT_REGENERATION_COMPARISON_COMPLETE_v1_1_2.md`

## Repairs applied (summary)

| Exam | Part | Repairs |
| --- | --- | --- |
| RUOE-PILOT-E01 | 1 | 0 |
| RUOE-PILOT-E01 | 2 | 0 |
| RUOE-PILOT-E01 | 3 | 0 |
| RUOE-PILOT-E01 | 5 | 0 |
| RUOE-PILOT-E01 | 6 | 0 |
| RUOE-PILOT-E01 | 7 | 0 |
| RUOE-PILOT-E01 | 4 | 1 |
| RUOE-PILOT-E02 | 1 | 0 |
| RUOE-PILOT-E02 | 2 | 0 |
| RUOE-PILOT-E02 | 3 | 0 |
| RUOE-PILOT-E02 | 5 | 0 |
| RUOE-PILOT-E02 | 6 | 0 |
| RUOE-PILOT-E02 | 7 | 0 |
| RUOE-PILOT-E02 | 4 | 7 |

## Status by Part

| Exam | Part | Mechanical OK | HARD (blocking) | Q-review HARD | QUALITY | Warnings |
| --- | --- | --- | --- | --- | --- | --- |
| RUOE-PILOT-E01 | 1 | PASS | 0 | 0 | 0 | 6 |
| RUOE-PILOT-E01 | 2 | PASS | 0 | 0 | 0 | 6 |
| RUOE-PILOT-E01 | 3 | PASS | 0 | 0 | 0 | 4 |
| RUOE-PILOT-E01 | 5 | PASS | 0 | 0 | 0 | 4 |
| RUOE-PILOT-E01 | 6 | PASS | 0 | 0 | 2 | 1 |
| RUOE-PILOT-E01 | 7 | PASS | 0 | 0 | 2 | 2 |
| RUOE-PILOT-E01 | 4 | PASS | 0 | 0 | 6 | 1 |
| RUOE-PILOT-E02 | 1 | PASS | 0 | 1 | 0 | 5 |
| RUOE-PILOT-E02 | 2 | PASS | 0 | 1 | 0 | 3 |
| RUOE-PILOT-E02 | 3 | PASS | 0 | 0 | 0 | 2 |
| RUOE-PILOT-E02 | 5 | PASS | 0 | 0 | 1 | 4 |
| RUOE-PILOT-E02 | 6 | PASS | 0 | 0 | 2 | 2 |
| RUOE-PILOT-E02 | 7 | PASS | 0 | 0 | 0 | 2 |
| RUOE-PILOT-E02 | 4 | PASS | 0 | 0 | 6 | 0 |

## Totals

- Parts mechanical PASS: 14/14
- HARD findings (blocking, sum): 0
- Quality-review HARD (non-blocking mechanical, sum): 2
- QUALITY findings (sum): 19
- Warnings (sum): 42
- Repair operations (sum): 8

## Old vs new

- Original pilot outputs unchanged under `05_OUTPUTS/`.
- Regenerated outputs isolated under `05_OUTPUTS_REGENERATED_v1_1_2/`.
- See `PILOT_REGENERATION_COMPARISON_COMPLETE_v1_1_2.md` for teacher-feedback mapping.

## Residual issues

- All parts passed mechanical validation; QUALITY/warning findings preserved in JSON for human review.
- 19 QUALITY finding(s) recorded across parts (not hidden).

## Safety confirmations

- **Supabase sync:** NOT performed.
- **Production publish:** NOT performed.
- **Pedagogical approval:** PENDING_HUMAN_REVIEW (not approved).
- **Scale-up to 20 exams:** NOT performed.
