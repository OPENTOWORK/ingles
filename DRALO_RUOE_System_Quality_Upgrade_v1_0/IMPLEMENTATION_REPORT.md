# DRALO RUOE System Quality Upgrade v1.1.1 — Implementation Report

**Date:** 15 August 2026  
**Status:** Implemented · fixture tests passing · **no pilot regeneration** · **no Supabase sync** · **no production writes**

---

## 1. v1.1.1 scope (revision after v1.0 review)

Strict separation of **deterministic HARD_FAIL** vs **heuristic QUALITY_FAIL** / adversarial review.

| Change | v1.0 | v1.1.1 |
|--------|------|--------|
| Severity model | Editorial + mechanical quality mixed in `errors` | `errors` = HARD only; `qualityFails` = QUALITY; `warnings` = soft |
| P6 multifit / unused-fit / cohesion | HARD or errors | **QUALITY_FAIL** (heuristic + AI) |
| P5 weak distractor | HARD (`errors`) | **QUALITY_FAIL** |
| P5 bad reference | HARD | **HARD** (objectively wrong citation) |
| P3 prefix/negative in every batch | HARD required | **Removed** — variety target + warning; never forced |
| P3 stem==answer | HARD | **HARD** (`P3-NO-TRANSFORM`) |
| P6 duplicate-in-passage | HARD | **HARD** (`P6-H03`) |
| Part 3 metadata | — | `transformationFamily` per item |
| AI adversarial quality | Parts 1–2 only | **Parts 3, 5, 6, 7** added |
| Title Usage History | “optional later” | **Required before 20-exam scale** (documented; no prod migration yet) |

---

## 2. Severity matrix (v1.1.1)

| Rule ID | Part | Severity | Deterministic? | Module |
|---------|------|----------|----------------|--------|
| P3-NO-TRANSFORM | 3 | **HARD_FAIL** | Yes — stem identical to answer | `examPartValidation.js` |
| TEST-P3-FORCED-NATURALNESS | 3 | **QUALITY_FAIL** | Yes — CAPITAL stem jammed against gap marker | `b2RuoeExamQuality.detectPart3StemForcing` |
| P3-VARIETY | 3 | **QUALITY_FAIL** | Partial — low family count in batch | `examPartValidation.js` |
| P3-FORCED-NATURALNESS (AI) | 3 | **QUALITY_FAIL** | No — AI naturalness review | `ruoeAiAdversarialQuality.js` |
| P5-BAD-REFERENCE | 5 | **HARD_FAIL** | Yes — evidence not in cited paragraph | `b2RuoeExamQuality.checkPart5ReferenceIntegrity` |
| P5-WEAK-DISTRACTOR | 5 | **QUALITY_FAIL** | Heuristic — grounded-word count | `b2RuoeExamQuality.analyzePart5Quality` |
| P5-* (AI blind + defend) | 5 | **QUALITY_FAIL** | No — AI adversarial | `ruoeAiAdversarialQuality.js` |
| P6-H03 | 6 | **HARD_FAIL** | Yes — option verbatim in passage | `ruoePart6HardValidators.js` |
| P6-H08 | 6 | **HARD_FAIL** | Yes — duplicate sentence in reconstruction | `ruoePart6HardValidators.js` |
| TEST-P6-MULTIFIT | 6 | **QUALITY_FAIL** | Heuristic cohesion score | `ruoePart6HardValidators.detectPart6Multifit` |
| P6-H06 unused-fit | 6 | **QUALITY_FAIL** | Heuristic | `ruoePart6HardValidators.js` |
| P6-H07 cohesion | 6 | **QUALITY_FAIL** | Heuristic | `ruoePart6HardValidators.js` |
| P6-* (AI gap solve) | 6 | **QUALITY_FAIL** | No — AI adversarial | `ruoeAiAdversarialQuality.js` |
| TEST-P7-WORD-MATCH | 7 | **QUALITY_FAIL** | Heuristic lexical overlap | `ruoeEditorialQuality.js` |
| P7-* (AI literal match) | 7 | **QUALITY_FAIL** | No — AI adversarial | `ruoeAiAdversarialQuality.js` |
| TEST-EDQ-FILLER | EQS | **QUALITY_FAIL** | Heuristic | `ruoeEditorialQuality.js` |
| TEST-TITLE-LITERAL | EQS | **QUALITY_FAIL** | Heuristic | `ruoeEditorialQuality.js` |
| P1/P2 blind-solve | 1–2 | errors/warnings | No — AI | `examPartQualityValidator.js` |

**Gate behaviour:** `validateGeneratedExamPart().ok` is `true` only when **HARD** `errors` is empty. `qualityFails` surface in preview `needsReview` and `validation.qualityFails` but do not flip `ok`.

---

## 3. Files changed (v1.1.1)

### New

| File | Purpose |
|------|---------|
| `src/lib/ruoeValidationFindings.js` | Shared finding type, `createFinding()`, `partitionFindings()` |
| `src/lib/ruoeAiAdversarialQuality.js` | AI adversarial QUALITY review for Parts 3, 5, 6, 7 |

### Modified

| File | Change |
|------|--------|
| `src/lib/ruoePart6HardValidators.js` | Severity split; multifit/unused/cohesion → QUALITY_FAIL |
| `src/lib/b2RuoeExamQuality.js` | P5 weak distractor → `qualityFails`; `derivePart3TransformationFamily`, `detectPart3StemForcing` |
| `src/lib/examPartValidation.js` | P3 prefix HARD removed; `qualityFails` channel; Part 6 hard wiring; metadata attachment |
| `src/lib/ruoeStyleCardV11.js` | Usage History wiring documented (required pre-scale) |
| `src/lib/levelsCambridgeExamGenerator.js` | AI adversarial for P3/5/6/7 on preview; `qualityFails` in validation payload |
| `scripts/test-ruoe-quality-upgrade.mjs` | Explicit fixtures + positive regression cases |

### Unchanged (by design)

- Topic Bank, Part 4, pilot JSON outputs
- Supabase prompt overrides (not synced)
- Production DB / generated exams
- Pilot exam regeneration

---

## 4. Part 3 (word formation)

- **HARD:** genuine transformation required (`stem !== answer`).
- **Removed:** mandatory prefix/negative in every Part 3 batch.
- **Quality targets:** derivational variety (`P3-VARIETY`); prefix/negative warned when absent but not forced.
- **Metadata:** `transformationFamily` on `questions[]`, `modelAnswers[]`, and `example` via `attachPart3TransformationMetadata()` in normalization.
- **Deterministic naturalness:** `detectPart3StemForcing()` → `TEST-P3-FORCED-NATURALNESS`.
- **AI:** `reviewB2Part3AdversarialQuality()` for forced/unnatural items (QUALITY only).

---

## 5. Part 6 Architecture v2 validators

| ID | Severity v1.1.1 |
|----|-----------------|
| P6-H03 duplicate-in-passage | HARD_FAIL |
| P6-H08 reconstruction duplicate | HARD_FAIL |
| TEST-P6-MULTIFIT | QUALITY_FAIL |
| P6-H06 unused-fit | QUALITY_FAIL |
| P6-H07 backward/forward cohesion | QUALITY_FAIL |

**AI:** `reviewB2Part6AdversarialQuality()` — solve gaps without key; flag multifit and weak cohesion (structured findings).

---

## 6. AI adversarial quality (Parts 3, 5, 6, 7)

Independent module: `src/lib/ruoeAiAdversarialQuality.js`

| Part | Method | Behaviour |
|------|--------|-----------|
| 5 | Blind solve + defend distractors | `reviewB2Part5AdversarialQuality` |
| 6 | Solve 6 gaps without key; multifit | `reviewB2Part6AdversarialQuality` |
| 7 | Solve questions; literal word-match | `reviewB2Part7AdversarialQuality` |
| 3 | Naturalness / forced transformation | `reviewB2Part3AdversarialQuality` |

- Runs on **preview** when mechanical validation passes (`levelsCambridgeExamGenerator.js`).
- Returns structured `findings` with `severity: QUALITY_FAIL` and `source: ai_adversarial`.
- **Never** promoted to mechanical HARD certainty.
- Requires `OPENAI_API_KEY` / `DRALO_OPENAI_MODEL_VALIDATOR` at runtime (not exercised in fixture suite).

---

## 7. Title pattern family & Usage History

- `titlePatternFamily` set in `normalizeGeneratedExamPart()` via `classifyTitlePatternFamily()`.
- **Usage History connection (required before 20-exam scale):**
  - Persist `titlePatternFamily` + `styleCardId` per generated part in Usage History store.
  - Orchestrator reads recent families for same level/part/card before generation.
  - Distribution Rules v1.1: block/warn on repeated families within N exams.
  - Wire point: `levelsCambridgeExamGenerator` variety seed + Content Brief allocation.
- **No production migration** in v1.1.1 — documented in `ruoeStyleCardV11.js` header.

---

## 8. Tests and results

```bash
node --loader ./scripts/alias-loader.mjs scripts/test-ruoe-quality-upgrade.mjs
```

**Exit code 0** — 15 August 2026.

| Test ID | Type | Result |
|---------|------|--------|
| TEST-P3-NO-TRANSFORM | HARD negative | PASS |
| TEST-P3-FORCED-NATURALNESS | QUALITY negative | PASS |
| POSITIVE-P3-NO-PREFIX | No false positive (no prefix batch) | PASS |
| POSITIVE-P3-METADATA | `transformationFamily` present | PASS |
| TEST-P6-DUPLICATE | HARD negative (P6-H03) | PASS |
| TEST-P6-MULTIFIT | QUALITY negative (detector + rules + severity) | PASS |
| POSITIVE-P6-CLEAN | No false positive | PASS |
| TEST-P5-BAD-REFERENCE | HARD negative (+ helper) | PASS |
| TEST-P5-WEAK-DISTRACTOR | QUALITY negative (not HARD) | PASS |
| POSITIVE-P5-GROUNDED | No false positive on Q31 | PASS |
| TEST-EDQ-FILLER | PASS |
| TEST-TITLE-LITERAL | PASS |
| TEST-P7-WORD-MATCH | PASS |
| Utility positives | duplicate detector, stem forcing, title family | PASS |

**Not in fixture suite (runtime / AI):**

| Test | Layer |
|------|-------|
| TEST-P1-AMBIGUOUS | `examPartQualityValidator.js` (P1 blind-solve) |
| AI adversarial P3/5/6/7 | `ruoeAiAdversarialQuality.js` (requires API) |

Dry-runs and OpenAI generation were **not** executed.

---

## 9. Checks still requiring AI or human review

| Area | Why |
|------|-----|
| P1 two defensible MC options | Blind-solve AI (`examPartQualityValidator`) |
| P2 gap ambiguity | Blind-solve AI (P2 validator) |
| P6 subtle multifit | Heuristic catches obvious cases; AI gap-solve for borderline |
| P6 discourse cohesion quality | Heuristic score + AI review |
| P5 distractor plausibility (nuanced) | Mechanical grounding + AI “defend distractor” |
| P7 paraphrase quality beyond keyword overlap | AI literal-match review |
| P3 idiomatic naturalness | AI adversarial + human editor |
| EQS British English / register | Partial heuristics; human editorial |
| Title Usage History enforcement | DB read/write not wired yet |

---

## 10. Confirmations (STOP conditions)

| Item | Status |
|------|--------|
| Supabase prompt sync | **NOT performed** |
| Pilot exam regeneration | **NOT performed** |
| Production DB writes | **NOT performed** |
| Fixture regression tests | **PASS** (exit 0) |
| Implementation report updated | **Yes** (this document) |

**Stopped** as instructed after report and fixture test run.

---

## 11. Recommended next steps (human owner)

1. Review this v1.1.1 report and severity matrix.
2. Approve Usage History schema + migration for `titlePatternFamily` longitudinal tracking.
3. Run `node scripts/sync-b2-ruoe-prompts-from-code.mjs` on staging when ready.
4. Regenerate pilot exams after approval (Phase B Part 4 unchanged).
5. Human pedagogical review with updated checklists.
6. Second controlled pilot before 20-exam orchestrator scale.
