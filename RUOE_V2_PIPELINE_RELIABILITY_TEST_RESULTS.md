# RUOE v2 pipeline reliability test results

Command:

```text
node --loader ./scripts/alias-loader.mjs --test src/lib/__tests__/ruoeNaturalnessFirstV2.test.js
```

Result: **27 passed, 0 failed** in approximately 0.48 seconds on the final run.

No test called OpenAI or Supabase.

## Phase 5 additions

1. Part 1 deterministically creates all four completed A/B/C/D sentences.
2. A malformed Part 1 judge response receives exactly one schema-repair call and then becomes `PIPELINE_FAIL`.
3. The schema-repair prompt is verified to say “structure repair only”.
4. Part 2 performs one second gap-discovery pass against the same article.
5. The second Part 2 selection is verified to contain eight answers.
6. An unlisted real Part 3 pair (`MAINTAIN → maintenance`) can pass with a complete positive lexical-family judgement.
7. The same unlisted pair without that judgement becomes `PIPELINE_FAIL`, not an automatic lexical failure.
8. Malformed Part 4 semantic booleans become `PIPELINE_FAIL`, not `QUALITY_FAIL` or `HARD_FAIL`.

## Existing checks retained

- v2 is not the default.
- `effect` / `impact` and `cope with` / `deal with` ambiguity is rejected.
- Missing, duplicate, and unknown Part 1 labels are rejected.
- Exactly one surviving Part 1 option passes; two produce `QUALITY_FAIL`.
- Part 2 six and nine-gap sets fail; eight gaps numbered 9–16 pass structure.
- Silent empty Part 2 alternatives are not uniqueness evidence.
- `DECIDE → decision` passes.
- `DECIDE → decisions` passes when plural is required.
- `DECIDE → decision-making` fails for the extra root.
- `BEEKEEP → beekeeping` and truncated pseudo-bases fail.
- Part 4 flat and nested replacements normalise.
- Missing Part 4 answers fail canonicalisation.
- Completed S2 is rebuilt deterministically.
- A mechanical pass cannot override lost meaning or widened comparison scope.

## Diagnostics

The IDE reported no lint diagnostics for:

- `src/lib/ruoeNaturalnessFirstV2/`
- `src/lib/__tests__/ruoeNaturalnessFirstV2.test.js`
- `scripts/run-ruoe-v2-pipeline-reliability-pilot.mjs`

The Node loader emitted existing experimental-loader and typeless-package warnings. They did not fail tests.
