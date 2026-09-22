# RUOE v2 validation hardening — test results

Command:

```
node --loader ./scripts/alias-loader.mjs --test src/lib/__tests__/ruoeNaturalnessFirstV2.test.js
```

Result: **22 passed, 0 failed** (about 1.7s). No test called OpenAI or Supabase.

## New coverage in this phase

| Check | Result |
| --- | --- |
| Part 1 missing option B | HARD_FAIL |
| Part 1 duplicate label | HARD_FAIL |
| Part 1 unknown label | HARD_FAIL |
| Part 1 options returned as one object, not an array | schema fail |
| Part 1 two natural options | QUALITY_FAIL |
| Part 1 exactly one surviving option | PASS |
| Part 2 six gaps | HARD_FAIL |
| Part 2 nine gaps | HARD_FAIL |
| Part 2 eight gaps numbered 9–16 | structural PASS |
| Part 2 empty alternatives without a recorded search | QUALITY_FAIL |
| Part 2 empty alternatives with search, justification, and confidence above 0.7 | PASS |
| Part 3 DECIDE → decision | PASS |
| Part 3 DECIDE → decisions when the plural is required | PASS |
| Part 3 DECIDE → decision-making | HARD_FAIL |
| Part 3 BEEKEEP → beekeeping | HARD_FAIL |
| Part 3 truncated base `decis` | HARD_FAIL |
| Part 4 flat repair output | canonical item |
| Part 4 nested `family` / `pair` | flattened, answer kept |
| Part 4 answer only inside `replacement.pair`, family changed to TF-06 | flattened |
| Part 4 missing answer | canonicalisation fails |
| Part 4 gapped sentence rebuilt with the answer | `due to` inserted |
| Part 4 mechanical pass + lost referent | QUALITY_FAIL |

The earlier 17 tests still pass, including effect/impact, cope/deal, prose-before-gaps, and “a mechanical pass does not override a semantic fail”.

The old Part 2 test that treated a silent empty alternative list as a pass now expects `QUALITY_FAIL`.
