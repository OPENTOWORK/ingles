# RUOE v2 pipeline reliability report

Phase 5 makes model-output failures distinguishable from exam-mechanics and language failures. It does not claim final linguistic quality.

Production is unchanged. `ruoeGenerationVersion` still defaults to `v1`, `useCodePrompts` is unchanged, Supabase was not accessed, prompt override rows were not modified, v1 was not replaced, and no production exam was regenerated.

## Local model configuration

The three local variables are explicit and canonical:

- `RUOE_V2_GENERATOR_MODEL=gpt-4o-mini`
- `RUOE_V2_BLIND_SOLVER_MODEL=gpt-4o-mini`
- `RUOE_V2_ADVERSARIAL_MODEL=gpt-4o-mini`

`OPENAI_MODEL` remains `gpt-4o-mini`. The pilot script aborts if any role resolves to a different model, preventing accidental higher-model spend. `RUOE_V2_ADVERSARY_MODEL` remains only a secondary backward-compatibility fallback.

Generator, blind solver, and adversarial judge are still separate API calls, roles, and prompts.

## Verdict taxonomy

- `PIPELINE_FAIL`: malformed or incomplete model output, wrong JSON shape, missing required fields, wrong field types, or a judge that cannot be interpreted.
- `HARD_FAIL`: validly shaped output that violates an objective exam rule, such as the wrong number of gaps, a duplicate gap id, a Part 4 answer outside 2–5 words, or a changed keyword.
- `QUALITY_FAIL`: validly shaped output that fails linguistic, semantic, ambiguity, or editorial checks.
- `PASS`: all configured layers pass.

Pipeline failure has precedence in the combined verdict because a malformed layer prevents a trustworthy overall linguistic classification. Component-level hard or quality failures remain in the saved artefact.

## Structured output and schema repair

Zod validates every generator stage before the next stage runs. One bounded schema-repair call is allowed per item. Its prompt explicitly says:

- structure repair only;
- preserve all existing linguistic judgements and boolean values;
- do not reconsider quality;
- do not change an answer;
- do not add a new rationale.

If the repaired output is still malformed, the result is `PIPELINE_FAIL`, not `HARD_FAIL`.

Malformed blind-solver output and malformed adversarial output are also `PIPELINE_FAIL`.

## Part 1

`buildPart1CompletedOptions()` joins each stable sentence with A, B, C and D in code. It replaces either the blank or the keyed expression and returns four completed strings. If an option cannot be inserted, the stage fails before a linguistic judge runs.

The independent judge receives those completed sentences. Its output must contain exactly four object records, one each for A–D, with all booleans and a non-empty reason. Missing, duplicate, unknown, or wrongly shaped judgements are rejected. Two surviving options remain `QUALITY_FAIL`.

## Part 2

Exactly eight one-word gaps numbered 9–16 remain mandatory. A wrong count or numbering is `HARD_FAIL`.

When the first selection has fewer than eight safe sites, the pipeline performs one `gap-discovery-2` call against the same article. It then re-runs selection and uniqueness. The article is not regenerated during this bounded second discovery.

Uniqueness still requires positive evidence: valid intended answer, search performed, empty plausible-alternative list, non-empty justification, and confidence above 0.7.

## Part 3

Pseudo-stems, truncated bases, stem equal to answer, and added lexical roots remain rejected. Shared spelling is not enough.

The small deterministic family map is now supporting evidence, not a whitelist. An unlisted pair can pass when a complete lexical-family judgement says:

- the base is legitimate;
- base and answer are in the same family;
- no independent root was added;
- the derivation is direct;
- a non-empty reason is supplied.

An unlisted pair with no complete judgement is `PIPELINE_FAIL`; absence from the reference list alone is not a quality failure.

## Part 4

Flat and nested repair/replacement objects are normalised before validation. The canonical object contains S1, keyword, gapped S2 where available, answer, completed S2, family, and accepted variants.

Completed S2 is rebuilt deterministically when a gap string exists. Semantic validation receives S1 and completed S2, not a blank or answer fragment.

All semantic flags and the naturalness flag must be booleans. Malformed flags are `PIPELINE_FAIL`. The 2–5 word and semantic-equivalence rules are unchanged.

## Files changed

- `.env.local` — local RUOE role values set to `gpt-4o-mini`; ignored local configuration
- `scripts/run-ruoe-v2-validation-hardening-pilot.mjs` — canonical adversarial variable first, legacy fallback second
- `src/lib/ruoeNaturalnessFirstV2/schema.js`
- `src/lib/ruoeNaturalnessFirstV2/layers.js`
- `src/lib/ruoeNaturalnessFirstV2/morphology.js`
- `src/lib/ruoeNaturalnessFirstV2/judgements.js`
- `src/lib/ruoeNaturalnessFirstV2/generate.js`
- `src/lib/ruoeNaturalnessFirstV2/prompts.js`
- `src/lib/ruoeNaturalnessFirstV2/index.js`
- `src/lib/__tests__/ruoeNaturalnessFirstV2.test.js`

## Files added

- `scripts/run-ruoe-v2-pipeline-reliability-pilot.mjs`
- `local-pilots/ruoe-v2-pipeline-reliability/`
- `RUOE_V2_PIPELINE_RELIABILITY_REPORT.md`
- `RUOE_V2_PIPELINE_RELIABILITY_TEST_RESULTS.md`
- `RUOE_V2_FOURTH_LOCAL_PILOT_RESULTS.md`

## Verification

- Focused tests: 27 passed, 0 failed.
- IDE diagnostics: no errors in the v2 modules, test file, or pilot runner.
- Pilot: 12/12 artefacts saved; exit code 0.

## Unresolved

1. `gpt-4o-mini` frequently fails the strict schemas even after one structural repair. That is now classified correctly, but not eliminated.
2. Part 1 reached deterministic four-sentence construction in all three tasks, but the judge did not return four valid judgement objects.
3. The blind solver sometimes answers with source prose rather than the requested gap answer. This is now `PIPELINE_FAIL`.
4. Part 4 often returns malformed semantic/naturalness records and one-word transformations. The malformed record is a pipeline failure; a valid one-word record would be a hard mechanics failure.
5. All roles use the same model, so role separation does not remove correlated model blind spots. The interfaces remain model-independent for a later approved swap.

The architecture is more reliable diagnostically: malformed JSON is no longer described as bad English, and failed stages do not become passes. It is not ready for production or teacher review.
