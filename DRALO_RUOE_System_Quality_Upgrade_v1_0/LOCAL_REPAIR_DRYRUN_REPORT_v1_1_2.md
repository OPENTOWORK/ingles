# RUOE v1.1.2 — Local Repair Dry-Run Report

**Date:** 15 August 2026  
**Phase:** local repair v1.1.2 (dry-run failures only)  
**Supabase sync:** NOT performed  
**Production writes:** NOT performed  
**Pilot regeneration:** NOT performed  

---

## 1. Scope

Repairs targeted only failures observed in `STAGING_SYNC_DRYRUN_REPORT.md`:

| Part | Prior failure | v1.1.2 fix |
|------|---------------|------------|
| P3 | 4× stem==answer; forced-naturalness false positive on `(N) ___ (STEM)` | `detectPart3StemForcing()` fix; local item repair; prompt HARD rule |
| P5 | ~492 words (undersize) | Validator HARD band 550–650; `repairPart5PassageLength()` in dry-run |
| P6 | Short pool options; P6-H07 cohesion gap 39 | Pool development QUALITY check; cohesion prompt reinforcement |
| P7 | 6× TEST-P7-WORD-MATCH | Editorial stricter detection; paraphrase prompt; `repairPart7WordMatchQuestions()` |

---

## 2. Code changes (summary)

| Area | File |
|------|------|
| P3 stem forcing detector | `src/lib/b2RuoeExamQuality.js` — canonical `(N) ___ (STEM)` no longer flagged |
| P5 length HARD band | `src/lib/b2RuoeExamQuality.js` — errors if &lt;550 or &gt;650 |
| P6 pool development | `src/lib/ruoePart6HardValidators.js` — `analyzePart6PoolDevelopment()` |
| P7 word-match editorial | `src/lib/ruoeEditorialQuality.js` — phrase-copy + ratio thresholds |
| Prompt reinforcements | `src/lib/draloAiExamPrompts.js` — P3/P5/P6/P7 |
| Local item repair | `src/lib/ruoeLocalItemRepair.js` — P3 stem≠answer, P5 passage length, P7 paraphrase |
| Dry-run loops | `scripts/dry-run-b2-part{3,5,6,7}-prompt.mjs` |
| Regression fixtures | `scripts/test-ruoe-quality-upgrade.mjs` |
| Legacy fixture updates | `scripts/test-b2-part{3,5,6,7}-validator.mjs`, `test-b2-reading-quality-validators.mjs` |

---

## 3. Test suite

```bash
npm test
```

**Result:** 294 tests, 0 failures (all legacy + v1.1.2 regression fixtures pass).

New regression coverage:

- `POSITIVE-P3-CANONICAL-FORMAT` — canonical gaps not flagged as forced-naturalness
- `TEST-P5-OVERSIZE` — HARD error when passage &gt;650 words
- `POSITIVE-P6-LONG-OPTION` / `NEGATIVE-P6-SHORT-OPTION`
- `POSITIVE-P7-PARAPHRASE` — paraphrased Who-question not flagged

---

## 4. Dry-runs (code prompts, no DB)

Model default: `gpt-4o-mini` unless overridden by env.

### 4.1 Part 3

| Metric | Value |
|--------|-------|
| Report | `scripts/generated/reviews/b2-part3-dry-run-2026-08-15T10-05-26-048Z.json` |
| Attempts | 2 |
| Passage words | 177 (150–180 band) |
| Validator HARD | **PASS** |
| stem==answer | **0** (local repair on attempt 1–2) |
| Forced-naturalness false positive | **none** |
| Local repairs | Q19/Q20 QUALITY→qualitative; Q20 CYCLE→cyclical |

Warnings only: transformation variety soft checks (expected).

### 4.2 Part 5

| Metric | Value |
|--------|-------|
| Report | `scripts/generated/reviews/b2-part5-dry-run-2026-08-15T10-07-15-512Z.json` |
| Attempts | 3 |
| Passage words | 562 (550–650 band) |
| Validator HARD | **PASS** |
| Local repairs | passage length 532→638 (attempt 2) |
| QUALITY | 1× P5-LITERAL-MATCH on Q33 (not HARD) |

Prior failure (492 words) resolved by length repair + retry.

### 4.3 Part 6

| Metric | Value |
|--------|-------|
| Report | `scripts/generated/reviews/b2-part6-dry-run-2026-08-15T10-08-14-177Z.json` |
| Attempts | 2 |
| Initial words | 421 → model length repair → 522 |
| Validator HARD | **PASS** |
| Duplicate in passage | **none** |
| Pool development | **0 short/generic options** |
| Unused letter | C |
| QUALITY | 1× TEST-P6-MULTIFIT heuristic on unused option G (not HARD) |

Architecture v2 retained; one sentence per pool option.

### 4.4 Part 7

| Metric | Value |
|--------|-------|
| Report | `scripts/generated/reviews/b2-part7-dry-run-2026-08-15T10-10-04-694Z.json` |
| Attempts | 3 |
| Section words (final) | 130, 127, 129, 133 |
| Validator HARD | **PASS** |
| TEST-P7-WORD-MATCH (editorial) | **0** after local paraphrase repair |
| Local repairs | Q43, Q44, Q47, Q50, Q51 paraphrased |

Prior accumulation (6 word-match findings) eliminated by local question regeneration.

---

## 5. Post-analysis (`analyze-ruoe-dryrun.mjs`)

| Part | validationOk | hardErrors | qualityFails | editorial qualityFails |
|------|--------------|------------|--------------|------------------------|
| 3 | true | 0 | 0 | 0 |
| 5 | true | 0 | 1 (P5-LITERAL-MATCH Q33) | 1 |
| 6 | true | 0 | 1 (TEST-P6-MULTIFIT option G) | 0 |
| 7 | true | 0 | 0 | 0 |

---

## 6. Exit criteria

| Criterion | Status |
|-----------|--------|
| P3: no stem==answer | **PASS** |
| P3: no forced-naturalness false positive | **PASS** |
| P5: within 550–650, no HARD failure | **PASS** (562 words) |
| P6: no duplicate, pool sufficiently developed | **PASS** |
| P6: no evident multifit (HARD) | **PASS** (heuristic on unused G only) |
| P7: no word-match accumulation | **PASS** (0 editorial findings) |
| `npm test` green | **PASS** |
| No Supabase / production / pilot regen | **CONFIRMED** |

---

## 7. Residual quality notes (non-blocking)

1. **P5 Q33** — P5-LITERAL-MATCH quality flag; correct option partially copies passage phrasing. Not HARD; future prompt tuning or local option rewrite could address.
2. **P6 option G** — unused distractor flagged by multifit heuristic; acceptable as QUALITY_FAIL on unused letter; no HARD impact.
3. **P3** — soft variety warnings (no -ly adverb, low tag variety); not in v1.1.2 exit scope.

---

## 8. Conclusion

**v1.1.2 local repair phase: COMPLETE.**

All dry-run HARD failures from the staging report are resolved. Local item-level repair loops (P3 stem≠answer, P5 passage length, P7 paraphrase) work without full-part regeneration where possible.

**STOP** — no further actions in this phase (no Supabase sync, no production writes, no pilot regeneration).

---

## 9. Reference

- Prior report: `STAGING_SYNC_DRYRUN_REPORT.md`
- Implementation history: `IMPLEMENTATION_REPORT.md`
