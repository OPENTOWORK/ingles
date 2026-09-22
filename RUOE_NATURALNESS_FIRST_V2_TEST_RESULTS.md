# RUOE naturalness-first v2 — test results

Command:

```
node --loader ./scripts/alias-loader.mjs --test src/lib/__tests__/ruoeNaturalnessFirstV2.test.js
```

Result: **17 passed, 0 failed** (about 1.7s). No test called OpenAI or Supabase.

| # | Test | Result |
| --- | --- | --- |
| 1 | v2 is not the default generation version | pass |
| 2 | Part 1 rejects `effect` and `impact` when both survive the same frame | pass |
| 3 | Part 1 rejects `cope with` and `deal with` when both survive | pass |
| 4 | Part 1 requires four independent substitutions and fails closed if a letter is missing | pass |
| 5 | Part 1 passes only when a single option survives | pass |
| 6 | Part 1 repair replaces the distractor before the sentence | pass |
| 7 | Part 2 writes prose before gap selection and rejects a second function word | pass |
| 8 | Part 2 accepts a gap with one defensible word | pass |
| 9 | Part 3 rejects `DECIDE → decision-making` and an identical stem | pass |
| 10 | Part 3 accepts a direct derivation and rejects a forced context | pass |
| 11 | Part 3 discovers word families only after the prose exists | pass |
| 12 | Part 4 enforces 2–5 words and fails a lost referent when mechanics would otherwise pass | pass |
| 13 | Part 4 fails a widened comparison and passes a fully equivalent pair | pass |
| 14 | Part 1 generation asks for the passage before distractors | pass |
| 15 | Part 1 later stages receive the finished passage | pass |
| 16 | Part 2 rejects a placeholder key and a content-word gap | pass |
| 17 | Part 4 semantic check receives the written sentence pair | pass |

## What the assertions lock

- Default version is `v1`. Only the exact string `naturalness-first-v2` selects v2.
- Part 1 does not pass because a key is “more idiomatic”. Two surviving options are `QUALITY_FAIL`. Fewer than four option records is `HARD_FAIL`.
- Part 2’s first stage is `prose`, and `select-eight` comes after it. A second function word is `QUALITY_FAIL`. The placeholder `...` is `HARD_FAIL`. An adjective gap is `QUALITY_FAIL` even when the model lists no alternatives.
- `DECIDE → decision-making` is `HARD_FAIL` because `making` is a second lexeme. `PERFORM → perform` is `HARD_FAIL`. A forced context is `QUALITY_FAIL`.
- A one-word Part 4 answer is `HARD_FAIL`. A lost referent or a widened comparison is `QUALITY_FAIL` even when `mechanicalOk` is true. The failure reason says a mechanical pass does not override a semantic fail.
- The positions prompt contains the passage returned by the previous stage. The Part 4 semantic prompt contains sentence 1 from the sentence-pair stage.

## Not covered by these tests

These tests use a fake completer. They do not prove that `gpt-4o-mini` will return the expected JSON shape. That behaviour is in the pilot comparison, and several pilot items failed for shape or uniqueness reasons while these tests stayed green.
