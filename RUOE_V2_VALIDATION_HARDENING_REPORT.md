# RUOE v2 validation hardening

Phase 4 hardens the local naturalness-first v2 path. Production is unchanged.

`ruoeGenerationVersion` still defaults to `v1`. `useCodePrompts` still defaults to `false`. This phase did not write to Supabase, did not edit `levels_exam_part_prompt_overrides`, and did not regenerate production exams.

## What changed

Every v2 stage is checked with a Zod schema before the next stage runs. The checker returns:

```json
{ "stage": "...", "status": "PASS | HARD_FAIL", "data": {}, "issues": [], "repairable": false }
```

Malformed JSON gets one schema repair. If that repair is still malformed, the item is `HARD_FAIL`. Missing fields are not invented.

Repair budgets are capped: schema repair 1, local linguistic repair 2, full regeneration 1. A failed item stays failed.

### Part 1

Exactly four records, labels A–D, no duplicates, no unknown labels. A missing letter, a duplicate, or a non-array `options` object is `HARD_FAIL`. Exactly one option may survive all of grammatical, natural British English, semantically defensible, and collocationally valid. “More idiomatic” is still ignored.

### Part 2

Exactly eight gaps, numbered 9–16, one word each, no duplicate ids. Six or nine gaps are `HARD_FAIL`. If the count is wrong, gap selection is retried from the same prose. The prose is not rewritten on the first failure.

An empty alternative list is not uniqueness. A gap can pass only when `alternativeSearchPerformed` is true, `intendedAnswerValid` is true, `plausibleAlternatives` is empty, the justification is non-empty, and confidence is above 0.7.

### Part 3

The four-letter stem overlap is gone. A pair passes only when the answer is on a confirmed lexical-family list for that base. `DECIDE → decision` and `DECIDE → decisive` pass. `DECIDE → decisions` passes only when the plural is marked as required. `DECIDE → decision-making` is `HARD_FAIL` because `making` is a second root. `BEEKEEP → beekeeping` and a truncated base such as `decis` are `HARD_FAIL`. An unlisted pair is `QUALITY_FAIL`, not a pass.

### Part 4

Repair JSON is flattened before any judge runs. Nested `family` / `pair` / `replacement` objects are accepted only if an answer string can be found. No answer is `HARD_FAIL`. Semantic comparison uses sentence 1 and the rebuilt completed sentence 2. A non-boolean naturalness or semantic flag cannot be treated as true. A mechanical pass still cannot override a semantic fail.

### Layers

The runner accepts three roles: generator, blind solver, and adversary. The blind solver receives the item with the intended answer removed. The adversary is told to try to invalidate the item and does not receive generator notes. If only the generator is injected, the other two layers are recorded as `UNCONFIGURED` and do not invent a pass. `HARD_FAIL` from the mechanical layer is kept even if another layer says pass.

## Files

Changed:

- `src/lib/ruoeNaturalnessFirstV2/judgements.js`
- `src/lib/ruoeNaturalnessFirstV2/generate.js`
- `src/lib/ruoeNaturalnessFirstV2/prompts.js`
- `src/lib/ruoeNaturalnessFirstV2/index.js`
- `src/lib/__tests__/ruoeNaturalnessFirstV2.test.js`

Added:

- `src/lib/ruoeNaturalnessFirstV2/schema.js`
- `src/lib/ruoeNaturalnessFirstV2/morphology.js`
- `src/lib/ruoeNaturalnessFirstV2/part4Canonical.js`
- `src/lib/ruoeNaturalnessFirstV2/layers.js`
- `scripts/run-ruoe-v2-validation-hardening-pilot.mjs`
- `local-pilots/ruoe-v2-validation-hardening/`

`src/lib/levelsCambridgeExamGenerator.js` was not edited in this phase. The v2 persist/preview throw from Phase 3 is still in place.

## Tests

22 passed, 0 failed. See `RUOE_V2_VALIDATION_HARDENING_TEST_RESULTS.md`.

## Pilot

12 local tasks, all saved, none forced to pass. See `RUOE_V2_SECOND_PILOT_RESULTS.md`.

## Unresolved

- The confirmed Part 3 family list is small. Real pairs such as `maintain → maintenance` currently fail as uncertain rather than passing. That is fail-closed, and it is too narrow for a review set.
- The model often returns Part 1 substitution items as an empty array, Part 2 gaps numbered 1–8, and Part 4 semantic flags that are not booleans. The harness rejects those. It does not yet make the model comply.
- Generator, blind solver, and adversary are separate roles and prompts, but this run used one provider for all three (`gpt-4o-mini`, from `OPENAI_MODEL`). The script does not hardcode that model. Set `RUOE_V2_GENERATOR_MODEL`, `RUOE_V2_BLIND_SOLVER_MODEL`, and `RUOE_V2_ADVERSARIAL_MODEL` to split them.
- The blind solver sometimes matched a stored answer that the mechanical layer had already failed. The combined verdict stayed `HARD_FAIL`.

## Recommendation

v2 is not ready for teacher blind review. The new checks reject the Phase 3 failure modes, which is what this phase required. They do not yet yield a set of Parts 1–4 that a teacher should mark.
