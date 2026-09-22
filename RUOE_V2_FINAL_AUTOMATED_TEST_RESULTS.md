# RUOE v2 final automated test results

No model/API call or synthetic generation was used.

## Command

```text
node --loader ./scripts/alias-loader.mjs --test \
  src/lib/__tests__/ruoeNaturalnessFirstV2.test.js \
  src/lib/__tests__/ruoeTeacherRepair.test.js
```

Final result:

- tests: 38;
- passed: 38;
- failed: 0;
- skipped: 0;
- duration: approximately 0.40 seconds.

## Existing v2 coverage retained

The original naturalness-first tests still pass:

- v1 remains the default;
- Part 1 independent substitution and ambiguity;
- Part 2 prose-first order, eight-gap structure, and positive uniqueness;
- Part 3 direct derivation, pseudo-stem, extra-root, and forced-context rules;
- Part 4 2–5 words, keyword, semantic equivalence, and canonicalisation;
- malformed output remains failed.

## Pipeline tests added

1. Schema repair allowance is one per stage, not one for the whole item.
2. Schema repair receives the malformed JSON.
3. Part 1 shifted distractor IDs are normalised by preserved key.
4. Part 2 blind solver is called once per gap.
5. Part 2 adversary is called once per gap.
6. Objective Part 4 mechanics stop semantic, blind, and adversarial calls.
7. Part 1 still builds every completed option deterministically.
8. Malformed Part 1 judgement remains `PIPELINE_FAIL`.
9. Unlisted Part 3 families require complete structured evidence.
10. Malformed Part 4 booleans remain `PIPELINE_FAIL`.

## Teacher-repair tests added

- repair-scope classification;
- key-only correction;
- source-version preservation and derived version;
- unrelated-question preservation;
- distractor-only field restrictions;
- Part 1 revalidation after distractor repair;
- Part 3 target replacement;
- Part 4 family/route replacement;
- validator input receives the revised question;
- failed validation leaves `acceptedExam` null;
- absence of a Part validator returns `PIPELINE_FAIL`.

## Diagnostics

IDE diagnostics reported no errors for:

- `src/lib/ruoeNaturalnessFirstV2/`;
- `src/lib/__tests__/ruoeNaturalnessFirstV2.test.js`;
- `src/lib/__tests__/ruoeTeacherRepair.test.js`.

`package.json` parses successfully and includes both v2 test files in `npm test`.

The Node experimental-loader and typeless-package warnings remain non-failing environment warnings. They are unrelated to RUOE validation.

## Result

The known Phase 5 pipeline root causes are covered by deterministic tests. The motor can now create and revalidate a controlled candidate patch for one existing question while preserving the original exam and every unrelated question.

No claim is made about model quality because Phase 6 intentionally ran no generation.
