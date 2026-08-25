# RUOE v1.1.1 — Staging Sync & Dry-Run Report

**Date:** 15 August 2026  
**Phase:** staging prompt sync → runtime verification → controlled dry-runs  
**Pilot regeneration:** NOT performed  
**Usage History migration:** NOT performed  
**Production writes:** NOT performed  

---

## 1. Environment verification (pre-write)

### 1.1 Local `.env.local` targets

| Variable | Value / ref | Role |
|----------|-------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qnazrzvwvkwhkfbqsbmr.supabase.co` | **ENGLISH_PROD** (`qnazrzvwvkwhkfbqsbmr`) |
| `SUPABASE_SERVICE_ROLE_KEY` | present | Used by `sync-b2-ruoe-prompts-from-code.mjs` |
| `SUPABASE_B_URL` | `https://cmeruknhkcxveygeeuji.supabase.co` | Documented “Supabase B / clone” |
| `SUPABASE_B_SECRET_KEY` | present | Staging B key |

**Critical:** `scripts/sync-b2-ruoe-prompts-from-code.mjs` reads **`NEXT_PUBLIC_SUPABASE_URL`** → would write to **production**, not `SUPABASE_B_URL`.

### 1.2 Staging (Supabase B) reachability

```
getaddrinfo ENOTFOUND cmeruknhkcxveygeeuji.supabase.co
```

- DNS does not resolve for `cmeruknhkcxveygeeuji.supabase.co`.
- Supabase MCP `list_projects` shows only **ENGLISH_PROD** (`qnazrzvwvkwhkfbqsbmr`, ACTIVE) and one unrelated inactive project — **no `cmeruknhkcxveygeeuji`**.

### 1.3 Decision: **NO STAGING SYNC PERFORMED**

Per instruction: *if destination cannot be demonstrated as staging, STOP and perform no writes.*

- Staging B URL in `.env.local` appears **stale / decommissioned**.
- Running the default sync script would hit **production** → **refused**.

### 1.4 Production prompt state (read-only, MCP SQL)

Rows in `levels_exam_part_prompt_overrides` for `level_slug = 'b2'`, parts 1–7:

| Part | `user_len` | `updated_at` | `PART 6 ARCHITECTURE v2` | `Adversarially test` (P1) | `Natural sentence first` (P3) |
|------|------------|--------------|--------------------------|---------------------------|-------------------------------|
| 1 | 6294 | 2026-07-21 | — | **false** | — |
| 2 | 3960 | 2026-07-27 | — | — | — |
| 3 | 4855 | 2026-07-27 | — | — | **false** |
| 5 | 4305 | 2026-07-20 | — | — | — |
| 6 | 5353 | 2026-07-20 | **false** | — | — |
| 7 | 4002 | 2026-07-27 | — | — | — |

**Code v1.1.1 defaults** (`resolveDefaultExamPartGenerationPrompt`, same seed):

| Part | Code `user_len` | P6 ARCH v2 | P1 adversarial |
|------|-----------------|------------|----------------|
| 1 | 5784 | — | **true** |
| 2 | 3910 | — | — |
| 3 | 4822 | — | — |
| 5 | 4588 | — | — |
| 6 | **6308** | **true** | — |
| 7 | 4491 | — | — |

**Conclusion:** Production DB overrides are **stale vs code v1.1.1** (missing Architecture v2, adversarial P1, P3 naturalness block, etc.). Lengths differ slightly but content signatures confirm drift.

**Runtime today:** `resolveEffectiveExamPartGenerationPrompt()` with local `.env.local` + admin DB client would return **stale production overrides** until sync — sync was **not** executed.

---

## 2. Sync status

| Action | Status |
|--------|--------|
| `node scripts/sync-b2-ruoe-prompts-from-code.mjs` | **NOT RUN** (would target prod) |
| `scripts/sync-b2-ruoe-prompts-staging.mjs` (new, targets `SUPABASE_B_URL`) | **NOT RUN** (staging DNS dead) |
| Part 4 prompts | **Not modified** (sync scripts skip Part 4 in staging variant) |

**Scripts added for this phase (no writes executed):**

- `scripts/verify-supabase-env.mjs`
- `scripts/preview-b2-ruoe-prompt-diff-staging.mjs`
- `scripts/preview-b2-ruoe-prompt-diff.mjs`
- `scripts/sync-b2-ruoe-prompts-staging.mjs`
- `scripts/verify-b2-ruoe-prompts-runtime-staging.mjs`
- `scripts/analyze-ruoe-dryrun.mjs`

---

## 3. Regression tests

### 3.1 `test-ruoe-quality-upgrade.mjs` — **PASS** (exit 0)

All v1.1.1 fixture tests passed, including:

- P3 stem==answer HARD, P3 forced-naturalness QUALITY
- P6 duplicate HARD, P6 multifit QUALITY (not HARD)
- P5 bad-reference HARD, P5 weak distractor QUALITY
- Positive fixtures (no false positives on P3 no-prefix, P5 grounded, P6 clean)

### 3.2 Part validator scripts

| Script | Result | Notes |
|--------|--------|-------|
| `test-b2-part1-validator.mjs` | **PASS** | |
| `test-b2-part2-validator.mjs` | **PASS** | |
| `test-b2-part3-validator.mjs` | **3 FAIL** | Legacy “valid part 3” fixture has Q22/Q24 stem==answer (now correctly HARD). Over-200-word test expects old max. |
| `test-b2-part5-validator.mjs` | **2 FAIL** | Negative tests expect error text “550/650”; validator accepts from 500/700 in generation band. |
| `test-b2-part6-validator.mjs` | **2 FAIL** | Same pattern: short-passage negative tests expect “500/600” but mechanical min is 350. |
| `test-b2-part7-validator.mjs` | **2 FAIL** | Section min test expects “120” message; mechanical min is 100. |

**v1.1.1 severity rules:** confirmed in upgrade suite — `validation.ok` stays true when only `qualityFails` present (e.g. P6 multifit-severity test).

---

## 4. Controlled dry-runs (code prompts, no Supabase)

Model: **`gpt-4o-mini`** (from `OPENAI_MODEL` / dry-run defaults).  
Output: `scripts/generated/reviews/b2-part*-dry-run-*.json`

| Part | Attempts | Dry-run `ok` | `validation.ok` (v1.1.1) | Report file |
|------|----------|--------------|--------------------------|-------------|
| 1 | 5 | **true** | **true** | `b2-part1-dry-run-2026-08-15T09-47-25-979Z.json` |
| 2 | 2 | **true** | **true** | `b2-part2-dry-run-2026-08-15T09-47-54-004Z.json` |
| 3 | 8 | **false** | **false** | `b2-part3-dry-run-2026-08-15T09-49-11-781Z.json` |
| 5 | 8 | **false** | **false** | `b2-part5-dry-run-2026-08-15T09-51-32-348Z.json` |
| 6 | 2 | **true** | **true** | `b2-part6-dry-run-2026-08-15T09-52-12-284Z.json` |
| 7 | 4 | **true** | **true** | `b2-part7-dry-run-2026-08-15T09-53-37-420Z.json` |

**Approx. API calls:** ~35 Chat Completions (including Part 6/7 length-repair passes). No adversarial AI layer executed in dry-run scripts (would need preview pipeline + `ruoeAiAdversarialQuality.js`).

---

## 5. Dry-run findings by Part

### Part 1 — PASS mechanical

- Passage 162 words; 8 gaps; validator ok.
- **WARNING:** dependent preposition / fixed expression variety (soft).
- **HARD / QUALITY / editorial:** none.
- Blind/adversarial solve: **not run** in dry-run script (requires `validateB2Part1Quality`).

### Part 2 — PASS mechanical

- Passage 175 words; validator ok.
- **WARNING:** repeated answer word “you”.
- No HARD / QUALITY / editorial findings.

### Part 3 — FAIL (generation + validators working)

**HARD_FAIL:**

- Q18, Q20, Q23, Q24: `P3-NO-TRANSFORM` (stem identical to answer).

**QUALITY_FAIL (likely false positives):**

- Q17–Q24: `TEST-P3-FORCED-NATURALNESS` — detector matches canonical `(N) ___ (STEM)` layout (afterGap regex). **Bug:** treats normal Part 3 format as “forced”; needs fix before pilot regen.

**WARNING:** low derivational variety; no -ly adverb; no prefix/negative (acceptable per v1.1.1 — not HARD).

### Part 5 — FAIL length

**HARD_FAIL:**

- Passage 492 words (< 500 mechanical minimum).

**WARNING:** Q31–Q32 literal word-match hints on correct options.

**Earlier attempts** also hit `P5-BAD-REFERENCE` (last paragraph citations) — shows HARD reference check working.

### Part 6 — PASS mechanical, QUALITY cohesion flags (priority review)

**Architecture checks (dry-run):**

| Check | Result |
|-------|--------|
| Gaps 37–42 | ✓ |
| 7 options A–G | ✓ |
| Unused letter | **F** (answers A,B,D,C,E,G) ✓ |
| Duplicate in passage (P6-H03) | ✓ none |
| Passage length | 523 words (model length-repair on attempt 2) ✓ |
| `validation.ok` | **true** despite quality findings ✓ |

**QUALITY_FAIL (not HARD):**

- `[P6-H07] gap (39): weak backward/forward cohesion (heuristic).`

**WARNING:** weak cohesion near gaps 39, 40 (analyzePart6Quality soft layer).

**Sentence pool concern:** options are **short** (~8–12 words), e.g. *“A) This has led to a reevaluation of the services they provide.”* — below Architecture v2 “developed sentence” intent; may need prompt tightening or QUALITY rubric for minimum pool sentence length.

**Cohesion sample:** unused F = *“Collaborations with schools have also become more common.”* — plausible unused; no P6-H03 duplicate detected.

**Multifit / unused-fit:** no HARD; no TEST-P6-MULTIFIT in this sample (heuristic did not fire).

### Part 7 — PASS mechanical, QUALITY word-match

**`validation.ok`:** true.

**QUALITY_FAIL (6 items):** `TEST-P7-WORD-MATCH` on Q44, Q45, Q47, Q50, Q51, Q52 — stems overlap profile wording.

**WARNING:** keyword-match hints on 5 questions (b2RuoeExamQuality soft layer).

Section lengths after model repair: 131, 124, 120, 124 words.

---

## 6. Editorial & adversarial layers

| Part | `__editorialFindings` | Editorial QUALITY | AI adversarial |
|------|----------------------|-------------------|----------------|
| 1 | 0 | — | Not executed in dry-run |
| 2 | 0 | — | Not executed |
| 3 | 0 | — | Not executed |
| 5 | 0 | — | Not executed |
| 6 | 0 | — | Not executed |
| 7 | 6 | TEST-P7-WORD-MATCH | Not executed |

**Note:** Dry-run scripts do not attach `__needsReview` or run `runRuoeAdversarialQualityReview()` — those run in `levelsCambridgeExamGenerator` preview path only.

---

## 7. False positives / tooling gaps

1. **`detectPart3StemForcing`:** flags every item with canonical `(N) ___ (STEM)` — **false positive** on Part 3 dry-run (8/8 items). Fix required before trusting TEST-P3-FORCED-NATURALNESS in production gate.
2. **Legacy part validator scripts:** negative tests use outdated error-string expectations (word-count bands); not v1.1.1 regressions.
3. **Part 3 validator fixture:** “valid part 3” sample violates new HARD stem==answer rule.

---

## 8. What was NOT done (confirmed)

- [x] No RUOE-PILOT-E01 / E02 regeneration  
- [x] No Part 4 changes  
- [x] No `titlePatternFamily` persistence / Usage History migration  
- [x] No 20-exam orchestrator work  
- [x] No exam publish / production content writes  
- [x] No Supabase prompt sync (staging unreachable; prod sync refused)  

---

## 9. Conclusion

### **NOT_READY_FOR_PILOT_REGENERATION**

**Blockers:**

1. **Staging sync not completed** — `SUPABASE_B_URL` (`cmeruknhkcxveygeeuji`) does not resolve; no active staging project in Supabase account. Cannot verify runtime overrides on staging.
2. **Production prompts still stale** — DB lacks v1.1.1 signatures (P6 Architecture v2, P1 adversarial, etc.). Local dev `.env.local` points at prod; **sync was intentionally not run** to avoid prod writes without staging path.
3. **Dry-run generation gaps** — Part 3 (stem==answer) and Part 5 (passage length) failed after 8 attempts with **code** prompts.
4. **Part 3 forced-naturalness detector** — false positives on valid gap layout; must fix before pilot QA.
5. **Part 7** — systematic literal word-match QUALITY findings in sample.
6. **Part 6** — mechanical pass but short pool sentences + P6-H07 cohesion QUALITY on gap 39; needs prompt/validator tuning and more samples.

**Recommended next steps:**

1. Restore or document correct **staging Supabase** URL (or create new staging project); update `.env.local` / sync script to target it explicitly.
2. Run `scripts/sync-b2-ruoe-prompts-staging.mjs` on live staging, then `verify-b2-ruoe-prompts-runtime-staging.mjs`.
3. Fix `detectPart3StemForcing` false positive on `(N) ___ (STEM)`.
4. Re-run dry-runs after sync (or confirm code-only path if staging unavailable).
5. Optionally run AI adversarial review on passing samples via preview API path.

---

**STOP** — report generated; no further writes or pilot regeneration.
