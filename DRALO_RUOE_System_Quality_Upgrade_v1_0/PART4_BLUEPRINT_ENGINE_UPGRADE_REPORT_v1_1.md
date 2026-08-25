# DRALO RUOE Part 4 Blueprint Engine Upgrade — Report v1.1

**Date:** 17 August 2026  
**Status:** Implemented · regression tests green · local + AI dry-runs executed · **no pilot regeneration** · **no Supabase sync** · **no production writes**

---

## 1. Runtime audit (pre-implementation)

### Authoritative at runtime (`src/`)

| Layer | File | Role |
|-------|------|------|
| **Generation prompt (code default)** | `src/lib/draloAiExamPrompts.js` | `buildExamGeneratePrompt('use-of-english','key-word','B2')` — Part 4 block |
| **DB overrides** | `levels_exam_part_prompt_overrides` via `src/lib/examPartGenerationPrompt.js` / `examPartPromptOverrides.js` | Override wins unless `useCodePrompts: true` |
| **Orchestration** | `src/lib/levelsCambridgeExamGenerator.js` | Calls generation + `validateGeneratedExamPart` |
| **Mechanical validation** | `src/lib/examPartValidation.js` → `validateB2Part4Strict()` | HARD gate; now wires Part 4 quality |
| **Part 4 quality (new)** | `src/lib/ruoePart4Quality.js` | Transformation distance, difficulty, naturalness, metadata coherence, part-level gates |
| **Grading** | `src/lib/gradeB2KeyWordTransformation.js` | 0/1/2 deterministic grader |
| **Answer-key schema** | `src/lib/validateB2KeyWordAnswerKey.js` | Metadata shape |
| **Keyword matching** | `src/lib/gradeB2KeyWordKeyword.js` | Keyword unchanged detection (now supports embedding contractions e.g. `needn't` ↔ NEED) |
| **Findings partition** | `src/lib/ruoeValidationFindings.js` | `HARD_FAIL` / `QUALITY_FAIL` / warnings |

### Pilot pack only (not imported by `src/` at runtime)

| Asset | Path |
|-------|------|
| Transformation Families | `DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1/.../DRALO_RUOE_Transformation_Blueprints_Pilot_v1_0_APPROVED.json` |
| Pilot Part 4 outputs | `.../05_OUTPUTS/EXAM-01/TBP-PILOT-EX01_Part4.json`, `.../EXAM-02/TBP-PILOT-EX02_Part4.json` |
| Phase B runtime scripts | `.../01_RUNTIME/run_phase_b_pilot.mjs` (pack-local, not app runtime) |

### Tests & dry-runs

| Script | Purpose |
|--------|---------|
| `scripts/test-b2-part4-validator.mjs` | Mechanical Part 4 validator |
| `scripts/test-ruoe-part4-quality-upgrade.mjs` | **New** — v1.1 quality fixtures |
| `scripts/dry-run-b2-part4-prompt.mjs` | OpenAI generation dry-run (no DB) |
| `scripts/dry-run-b2-part4-local.mjs` | **New** — fixture + pilot blueprint local gate |
| `src/lib/__tests__/gradeB2KeyWordTransformation.test.js` | Grader regression |

**Conclusion:** Code prompt + `examPartValidation.js` + new `ruoePart4Quality.js` are authoritative for the upgrade. Pilot TF family bank unchanged.

---

## 2. Files modified

### New

| File | Purpose |
|------|---------|
| `src/lib/ruoePart4Quality.js` | Part 4 blueprint quality engine (distance, difficulty, naturalness, metadata, variants, part-level) |
| `scripts/test-ruoe-part4-quality-upgrade.mjs` | Required regression fixtures TEST-P4-* |
| `scripts/dry-run-b2-part4-local.mjs` | Local dry-run without OpenAI/Supabase |

### Modified

| File | Change |
|------|--------|
| `src/lib/examPartValidation.js` | Wire `validatePart4Quality()`; answer-length distribution → warning (not HARD); pass `qualityFails` |
| `src/lib/draloAiExamPrompts.js` | Naturalness-first; B2-Standard/B2-Strong; blueprint metadata fields; accepted variants; difficulty policy |
| `src/lib/gradeB2KeyWordKeyword.js` | Cambridge contractions embed keyword (`needn't` counts as NEED) |
| `scripts/dry-run-b2-part4-prompt.mjs` | Report `qualityFails`, metrics, findings |
| `package.json` | Add `test-ruoe-part4-quality-upgrade.mjs` to `npm test` |

### Not modified (by design)

- Parts 1, 2, 3, 5, 6, 7 validators/prompts
- Transformation Family bank
- Supabase overrides / production tables
- Pilot exam JSON regeneration

---

## 3. HARD vs QUALITY rules

### HARD_FAIL (blocks `validateGeneratedExamPart().ok`)

| Rule ID | Trigger |
|---------|---------|
| Mechanical (existing) | 6 items Q25–30, keyword UPPERCASE, 2–5 Cambridge words, keyword in answer, `grading_metadata` valid, marking points partition answer 2/2, no duplicate keywords, etc. |
| `P4-METADATA-MISMATCH` | `target_structure` lists contradictory lexical fragments (`hardly any`, `very few`, …) absent from canonical answer; or slash-separated **answer-shaped** routes with no overlap with answer |
| `P4-MARKING-POINT-MISMATCH` | Marking label contains contradictory lexical fragments (e.g. `hardly any`) not in canonical answer |
| `TEST-P4-INVALID-VARIANT` | `fullAnswers` variant wrong word count, missing keyword, or non-superficial alternate route |
| `TEST-P4-ALTERNATIVE-ROUTE` | Two `fullAnswers` entries with low token overlap (distinct grammatical routes, not contraction-only) |

### QUALITY_FAIL (surfaced in `qualityFails`; does not block `ok`)

| Rule ID | Trigger |
|---------|---------|
| `TEST-P4-TOO-EASY` | High S1/S2 overlap; inferred B1+/B1 band; 2-word obvious answers; part-level weak-band concentration |
| `TEST-P4-LOW-TRANSFORMATION-DISTANCE` | Item/part dominated by lexical/minor distance |
| `TEST-P4-UNNATURAL-SENTENCE` | Awkward collocation patterns (`please to`, `make a photo`, …) |
| `TEST-P4-INCOMPLETE-CONTEXT` | Bare S1; dangling verb without complement (`decided.` without `what to do`) |
| `TEST-P4-ANSWER-LENGTH-DISTRIBUTION` | ≥5/6 answers are 2–3 words |
| `TEST-P4-VALID-CONTRACTION` | Expanded negative (`need not`) in `fullAnswers` without explicit contraction pair |
| `TEST-P4-ALTERNATIVE-ROUTE` | Heuristic dual-route keywords (WISH/REGRET/MUST/SHOULD) without documented route control |

### Warnings (soft)

- Part 4 answer length: fewer than 3 answers using 4–5 words (distribution hint; not HARD)

---

## 4. Blueprint engine changes

### Transformation distance (`ruoePart4Quality.js`)

Explicit enum: `lexical_substitution` | `minor_grammatical` | `syntactic_restructuring` | `multi_step_transformation`.

- `inferTransformationDistance()` — linguistic signals (multi-step patterns, inversion, overlap with S1)
- Part-level gate: flag if ≥4/6 items are lexical/minor

### Difficulty policy

- `inferDifficultyBand()` — inferred from distance + word count + S1/S2 overlap (not declarative metadata alone)
- Part-level: majority B2-Standard/B2-Strong; flag ≥3 B1/B1+ items

### Naturalness before transformation convenience

- Prompt principle in `draloAiExamPrompts.js`
- `analyzeNaturalness()` — deterministic awkward-pattern list

### Context completeness

- `analyzeContextCompleteness()` — minimum S1 length; dangling-verb-end detector

### Metadata consistency (HARD)

- `validatePart4MetadataCoherence()` — target_structure vs canonical answer
- Pedagogical descriptors (conditional, reported, gerund, …) do not require literal token match
- Contradictory lexical fragments and slash-separated answer-shaped routes are HARD-blocked

### Accepted variants

- `validatePart4AcceptedVariants()` — explicit variants only; contraction expansion check
- Grader: `gradeB2KeyWordKeyword.js` treats `needn't` as embedding `NEED`

### Marking points

- Architecture unchanged: exactly 2 MPs partition canonical answer
- Mechanical partition check remains in `examPartValidation.js`
- Label HARD only for contradictory lexical fragments in labels

### Part-level quality gate

`validatePart4Quality()` aggregates: difficulty bands, transformation distance mix, answer-length distribution, per-item challenge.

---

## 5. Prompt changes (`draloAiExamPrompts.js` Part 4)

- **Naturalness before transformation convenience**
- Blueprint metadata per item: `family_id`, `target_structure`, `difficulty_band`, `transformation_distance`, `marking_point_plan`, `alternative_route_check`
- B2-Standard / B2-Strong predominance
- Explicit accepted variants + contraction pairs
- Internal consistency requirement across metadata and answer
- Removed HARD requirement for “≥3 answers must be 4–5 words” from prompt fail list (distribution is quality)

---

## 6. Tests and results

```text
npm test  →  ALL PASS (including scripts/test-ruoe-part4-quality-upgrade.mjs)
```

### Regression fixtures (all PASS)

| Fixture | Expected |
|---------|----------|
| `TEST-P4-TOO-EASY` | QUALITY_FAIL |
| `TEST-P4-LOW-TRANSFORMATION-DISTANCE` | QUALITY_FAIL |
| `TEST-P4-UNNATURAL-SENTENCE` | QUALITY_FAIL |
| `TEST-P4-INCOMPLETE-CONTEXT` | QUALITY_FAIL |
| `TEST-P4-METADATA-MISMATCH` | HARD_FAIL |
| `TEST-P4-MARKING-POINT-MISMATCH` | HARD_FAIL |
| `TEST-P4-VALID-CONTRACTION` | grades 2/2; no missing-pair quality fail when both forms listed |
| `TEST-P4-INVALID-VARIANT` | HARD_FAIL |
| `TEST-P4-ALTERNATIVE-ROUTE` | HARD_FAIL |
| `TEST-P4-ANSWER-LENGTH-DISTRIBUTION` | QUALITY_FAIL |
| Positive canonical fixture | HARD pass; no HARD quality fails |

---

## 7. Dry-runs

### 7.1 Local (no OpenAI, no Supabase)

Script: `scripts/dry-run-b2-part4-local.mjs`  
Output: `scripts/generated/reviews/b2-part4-local-dry-run-2026-08-17T09-47-26-332Z.json`

| Target | Mechanical OK | Quality HARD | Quality findings (summary) |
|--------|---------------|--------------|----------------------------|
| **Canonical fixture** | ✅ | — | None — 5/6 B2-Strong, distances syntactic/multi-step, lengths `{3:1, 4:2, 5:3}` |
| **Pilot EX01 Part4** | ✅ | — | Q25 too easy / low distance; length warning (2×4–5 words) |
| **Pilot EX02 Part4** | ❌ (Q25 grading + Q29–30 metadata) | Q29–30 metadata | Q27 missing contraction pair; Q29 parallel/incomplete; Q30 too easy + **hardly any / very few mismatch** (teacher feedback pattern) |

Pilot failures confirm the upgrade targets real issues in existing blueprints; regeneration with the new engine is expected to fix these.

### 7.2 OpenAI generation dry-run (no Supabase)

Script: `scripts/dry-run-b2-part4-prompt.mjs` (8 attempts)  
Output: `scripts/generated/reviews/b2-part4-dry-run-2026-08-17T09-42-33-280Z.json`

| Attempt | Result |
|---------|--------|
| 1–7 | Failed — keyword misuse, missing metadata, marking partition errors |
| 8 | Near-pass — mechanical errors only on Q28/Q30 marking partition (`got 1/2`) |

**Best attempt metrics (attempt 8):**

- 6 scored items, all inferred B2-Standard/B2-Strong
- Transformation distance: 6× syntactic_restructuring
- Answer lengths: `{3:2, 4:2, 5:2}` — good 2–5 spread
- No metadata HARD mismatches on generated content
- Remaining failure: generator still occasionally mis-partitions marking points (existing mechanical HARD)

**Note:** Live AI dry-run validates prompt + gate interaction; full mechanical pass may require retry loop or local repair (not in scope for this upgrade).

---

## 8. Limitations still requiring AI / human review

| Area | Limitation |
|------|------------|
| Naturalness | Heuristic pattern list — cannot catch all unnatural but grammatical English |
| Alternative routes | Deterministic heuristics only; subtle second routes need human review |
| Target structure | Pedagogical labels tolerated; exotic phrasing may need human judgment |
| Marking partition | Generator still produces invalid MP splits — mechanical HARD catches; no auto-repair in this upgrade |
| Transformation families | Family bank unchanged; selection quality depends on generation + quality gates |
| Pilot regeneration | Not run — next step after this report |

---

## 9. Confirmations

| Constraint | Status |
|------------|--------|
| **No Supabase write/sync** | ✅ Confirmed — no migrations, no remote writes |
| **No production writes** | ✅ Confirmed |
| **No full pilot regeneration (Exam 1/2)** | ✅ Confirmed — only validation of existing pilot JSON + generation dry-runs |
| **Parts 1–3, 5–7 untouched** | ✅ Confirmed |
| **Transformation Family bank unchanged** | ✅ Confirmed |

---

## 10. Next step (out of scope for v1.1)

Regenerate **Exam 1 and Exam 2** Parts 1–7 with the upgraded Part 4 engine, then human teacher review of new Part 4 blueprints.
