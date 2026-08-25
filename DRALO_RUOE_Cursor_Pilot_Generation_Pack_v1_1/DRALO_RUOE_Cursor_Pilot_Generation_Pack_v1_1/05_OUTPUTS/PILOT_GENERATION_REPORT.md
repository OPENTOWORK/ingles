# DRALO RUOE — Pilot Generation Report

Batch: RUOE-PILOT-01  
Pack: v1.1  
Generated: 2026-08-12T17:14:19.613Z

## PHASE A — Content Brief pipeline

Status: **COMPLETE — READY FOR HUMAN REVIEW**  
Scope: Exam 1 + Exam 2 · Parts 1, 2, 3, 5, 6, 7 · **12 exercises**  
Part 4 / PHASE B: **not started**

### Automatic self-check summary

| Result | Count |
| --- | ---: |
| pass | 3 |
| pass_with_warnings | 9 |
| fail | 0 |

### Per-exercise results

| Brief | Exam | Part | Style | Auto status | Words | Notes |
| --- | --- | --- | --- | --- | ---: | --- |
| CB-PILOT-001 | RUOE-PILOT-E01 | Part 1 | SC-01 | pass_with_warnings | 153 | word_count 153 outside target 160–170 |
| CB-PILOT-002 | RUOE-PILOT-E01 | Part 2 | SC-05 | pass_with_warnings | 178 | word_count 178 outside target 160–170 |
| CB-PILOT-003 | RUOE-PILOT-E01 | Part 3 | SC-02 | pass_with_warnings | 178 | word_count 178 outside target 160–170 |
| CB-PILOT-004 | RUOE-PILOT-E01 | Part 5 | SC-03 | pass | 604 | — |
| CB-PILOT-005 | RUOE-PILOT-E01 | Part 6 | SC-04 | pass | 557 | — |
| CB-PILOT-006 | RUOE-PILOT-E01 | Part 7 | SC-06 | pass_with_warnings | 485 | section C word_count 119 outside target 120–150; section D word_count 113 outside target 120–150 |
| CB-PILOT-007 | RUOE-PILOT-E02 | Part 1 | SC-05 | pass_with_warnings | 157 | word_count 157 outside target 160–170 |
| CB-PILOT-008 | RUOE-PILOT-E02 | Part 2 | SC-01 | pass_with_warnings | 175 | word_count 175 outside target 160–170 |
| CB-PILOT-009 | RUOE-PILOT-E02 | Part 3 | SC-04 | pass_with_warnings | 154 | word_count 154 outside target 160–170 |
| CB-PILOT-010 | RUOE-PILOT-E02 | Part 5 | SC-02 | pass | 600 | — |
| CB-PILOT-011 | RUOE-PILOT-E02 | Part 6 | SC-03 | pass_with_warnings | 520 | word_count 520 outside target 540–570 |
| CB-PILOT-012 | RUOE-PILOT-E02 | Part 7 | SC-06 | pass_with_warnings | 437 | section A word_count 118 outside target 120–150; section B word_count 110 outside target 120–150; section C word_count 106 outside target 120–150; section D word_count 103 outside target 120–150 |

### Files generated

- `05_OUTPUTS/EXAM-01/CB-PILOT-001_Part1.json`
- `05_OUTPUTS/EXAM-01/CB-PILOT-002_Part2.json`
- `05_OUTPUTS/EXAM-01/CB-PILOT-003_Part3.json`
- `05_OUTPUTS/EXAM-01/CB-PILOT-004_Part5.json`
- `05_OUTPUTS/EXAM-01/CB-PILOT-005_Part6.json`
- `05_OUTPUTS/EXAM-01/CB-PILOT-006_Part7.json`
- `05_OUTPUTS/EXAM-02/CB-PILOT-007_Part1.json`
- `05_OUTPUTS/EXAM-02/CB-PILOT-008_Part2.json`
- `05_OUTPUTS/EXAM-02/CB-PILOT-009_Part3.json`
- `05_OUTPUTS/EXAM-02/CB-PILOT-010_Part5.json`
- `05_OUTPUTS/EXAM-02/CB-PILOT-011_Part6.json`
- `05_OUTPUTS/EXAM-02/CB-PILOT-012_Part7.json`

### Human review required

All 12 exercises require human pedagogical review using:

`04_REVIEW/DRALO_RUOE_Checklist_Revision_Ejercicios_Piloto_v1_1.docx`

Automatic checks do **not** equal pedagogical approval.

### Implementation notes / limitations

- Generation used Chat Completions model `gpt-4o-2024-08-06` with pack runtime prompts + approved briefs + Style Cards.
- Some outputs required local repair passes for hard length bands and MCQ answer-letter balance after model attempts failed those mechanical constraints.
- No production DB writes. No Part 4 generation. No orchestrator integration.
- Repeated length failures (especially Parts 5/6 initial under-length; Parts 1/3 slight over-length) are evidence for later prompt/validator tightening, not for rewriting Style Cards or Content Briefs in this pilot.

## PHASE B — Part 4 Blueprint pipeline

Status: **COMPLETE_READY_FOR_HUMAN_REVIEW**  
Generated: 2026-08-12T23:03:25.509Z  
Model: `gpt-4o-2024-08-06`

### Scope
- TBP-PILOT-EX01 → RUOE-PILOT-E01 Part 4
- TBP-PILOT-EX02 → RUOE-PILOT-E02 Part 4
- 2 examples + **12 scored transformations** (Q25–30 × 2)

### Automatic validation (scored items only)

| Result | Count |
| --- | ---: |
| pass | 12 |
| pass_with_warnings | 0 |
| fail | 0 |

### Files
- `05_OUTPUTS/EXAM-01/TBP-PILOT-EX01_Part4.json`
- `05_OUTPUTS/EXAM-02/TBP-PILOT-EX02_Part4.json`
- `05_OUTPUTS/HUMAN_REVIEW_PHASE_B.md`

### Local repairs
- TBP-PILOT-EX01: Q28, Q29, Q30, Q26, Q27
- TBP-PILOT-EX02: Q26, Q28

### Notes
- Repeated model failures concentrated on **marking-point split consistency** (answer correct, MP over-included words from sentence2).
- Local repair realigned marking points to the full answer without changing Blueprint family/keyword/target.
- EX01 Q26 regenerated for tense consistency with causative GET.
- Human pedagogical approval still required.

### Stop
PHASE B complete. No orchestrator, no P1–P7 integration, no production writes.
