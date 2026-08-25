# E02_REGENERATION_REPORT_v1_1_3

**Date:** 2026-08-19T12:16:24.042Z
**Exam:** RUOE-PILOT-E02
**Output:** `DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1\DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1\05_OUTPUTS_REGENERATED_E02_v1_1_3/`

## Scope

- Parts 1–7 regenerated with approved Content Briefs + Part 4 Blueprint.
- Topic Bank / Style Card / family allocation unchanged.
- British English mandatory in prompts.
- Local code prompts (`resolveDefaultExamPartGenerationPrompt`).
- No Supabase · no production.

## Acceptance summary

- Parts accepted (full criteria): **5/7**
- Parts mechanical PASS: **6/7**
- Blocking HARD (sum): **1**

## Status by Part

| Part | Brief/Blueprint | Mechanical | Accepted | Blocking HARD | Q-review HARD | QUALITY | Warnings | Blind mismatch | Blind ambiguous | Attempts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | CB-PILOT-007 | FAIL | NO | 1 | 0 | 0 | 1 | 0 | 0 | 5 |
| 2 | CB-PILOT-008 | PASS | NO | 0 | 1 | 0 | 3 | 2 | 0 | 5 |
| 3 | CB-PILOT-009 | PASS | YES | 0 | 0 | 0 | 4 | 0 | 0 | 1 |
| 5 | CB-PILOT-010 | PASS | YES | 0 | 0 | 0 | 5 | 0 | 0 | 1 |
| 6 | CB-PILOT-011 | PASS | YES | 0 | 0 | 1 | 2 | 0 | 0 | 1 |
| 7 | CB-PILOT-012 | PASS | YES | 0 | 0 | 0 | 4 | 0 | 0 | 1 |
| 4 | TBP-PILOT-EX02 | PASS | YES | 0 | 0 | 4 | 0 | 0 | 0 | 1 |

## Repairs applied

### Part 1
- none

### Part 2
- none

### Part 3
- none

### Part 5
- none

### Part 6
- none

### Part 7
- none

### Part 4
- meta: Q25: target_structure → wish + past perfect; fullAnswers synced (1); MP labels → wish + subject | had + past participle
- meta: Q26: target_structure → subject + be EXPECTED + to-infinitive
- meta: Q27: target_structure → need not have + past participle; MP labels → need not have (modal perfect) | past participle complement
- meta: Q28: target_structure → present perfect + time period + since; MP labels → duration/time frame with since | since + past-event clause
- meta: Q29: target_structure → make up one's mind; MP labels → made up (phrasal verb) | possessive + mind
- meta: Q30: target_structure → very few + plural noun; MP labels → very few quantifier | few + plural continuation
- Q25: post-meta MP wish i had | told him

## British English checks

- Prompts include mandatory British English block (`BRITISH_ENGLISH_BLOCK` in `ruoePilotRegeneration.js`).
- Editorial quality validator run on each part.
- Human review required for naturalness confirmation.

## Blind-solve disagreements

- Part 1: none
- Part 2:
  - mismatch Q12: key build / solver form
  - mismatch Q13: key is / solver an
- Part 3: none
- Part 5: none
- Part 6: none
- Part 7: none
- Part 4: none

## Residual issues

- Part 1: NOT accepted after 5 attempts — review JSON and manifest.
  - HARD: Part 1 passage is 261 words; maximum is 200 (target 150–180).
  - WARNING: Part 1 should include at least 1 item decided by a dependent preposition or fixed expression (soft check).
- Part 2: NOT accepted after 5 attempts — review JSON and manifest.
  - WARNING: Part 2 answers cover only 3 grammar categories (target at least 4: prepositions, relatives, modals, connectors, etc.).
  - WARNING: Gaps 13 look trivially easy for B2.
  - WARNING: Weak item Q13: too obvious 'is' linking verb with no real alternative
  - PQ: Blind-solve disagreed with the answer key on 2 gaps: Q12 (key "build", solver "form"), Q13 (key "is", solver "an"). Likely ambiguous gaps or wrong keys.

## Output files

- JSON: `05_OUTPUTS_REGENERATED_E02_v1_1_3\EXAM-02/`
- Manifest: `regeneration_manifest.json`
- Human review: `HUMAN_REVIEW_REGENERATED_E02_v1_1_3.md`
- Validation summary: `validation_summary.json`

## Safety

- Supabase sync: NOT performed
- Production publish: NOT performed
- Pedagogical approval: PENDING_HUMAN_REVIEW
