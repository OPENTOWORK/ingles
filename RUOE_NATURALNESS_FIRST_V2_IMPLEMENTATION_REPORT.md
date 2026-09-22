# RUOE naturalness-first v2 — implementation report

Local code path only. Production still uses v1. This phase did not write to Supabase, did not edit `levels_exam_part_prompt_overrides`, did not change `resolveEffectiveExamPartGenerationPrompt()`, and did not change the default of `useCodePrompts` (still `false`).

## What was added

A parallel engine lives in `src/lib/ruoeNaturalnessFirstV2/`. The version flag is `ruoeGenerationVersion: 'v1' | 'naturalness-first-v2'`. `resolveRuoeGenerationVersion()` returns v1 for every value except the exact string `naturalness-first-v2`.

Local entry point: `runNaturalnessFirstGeneration({ partNumber, brief, complete })`. It accepts an injected completer, so tests do not call OpenAI and the pilot can force code prompts.

`generateAndPersistLevelExamPart()` and `previewLevelExamPartGeneration()` accept the same flag and default it to `'v1'`. If a caller passes `'naturalness-first-v2'`, both functions throw before any database read, database write, or model call. Preview does not run v2; local callers must import `runNaturalnessFirstGeneration` themselves.

## Shared contract

`NATURALNESS_CONTRACT` in `contract.js` is the only British-English naturalness text for Parts 1–4. It requires natural British English, puts naturalness above a planned target, tells the model to discard a target that cannot be said naturally, and asks whether a competent British speaker would produce the sentence if there were no gap or exam task.

Part-specific prompts add only the stage rules. They do not restate a second contract.

## Generation order

| Part | Stages |
| --- | --- |
| 1 | passage → positions → keys → distractors → independent substitution |
| 2 | prose → gap discovery → select eight → uniqueness |
| 3 | prose → family discovery → base assignment → derivation check |
| 4 | family candidate → sentence pair → semantic check → naturalness check |

Each stage after the first receives the JSON from the earlier stages. The prompt forbids copying placeholders (`...`, `WORD`, `TF-00`, `DECIDE`). Code, not the model, assigns `PASS`, `QUALITY_FAIL`, or `HARD_FAIL`.

Part 1 substitution requires records for A, B, C and D. A missing letter is `HARD_FAIL`. Two or more options that are grammatical, natural British English, semantically defensible, collocational, and contextually defensible are `QUALITY_FAIL`. `moreIdiomaticThanKey` is ignored. “The key is more idiomatic” is not a pass.

Part 2 rejects a placeholder key (`HARD_FAIL`), a second defensible function word (`QUALITY_FAIL`), a keyed word that is not in the finished article, and a gap whose family is not a grammatical function-word family (preposition, auxiliary, article, determiner, pronoun, relative, linker, conjunction, particle, comparison, verb-pattern, frame).

Part 3 rejects an identical stem (`HARD_FAIL`), a second lexeme such as `DECIDE → decision-making` (`HARD_FAIL`), a rival family member, and a forced or unnatural context (`QUALITY_FAIL`).

Part 4 counts the answer with `countCambridgeKeyWordWords`. Outside 2–5 words, or a missing/changed keyword, is `HARD_FAIL`. Any failed semantic or naturalness boolean is `QUALITY_FAIL` even when the mechanical flags pass. The reason states that a mechanical pass does not override a semantic fail. A failed family calls `replace-family` and the new pair is sent through semantic and naturalness again.

## Repair policy

| Part | Order |
| --- | --- |
| 1 | repair the distractor, then the sentence |
| 2 | move or remove the gap before rewriting the passage |
| 3 | choose a new position and base from the finished prose |
| 4 | replace the transformation family |

Unaffected items are not the repair target. The repair prompt says to return only the repaired item.

## Kept as they were

Topic Bank, Content Briefs, Brief Map, Usage History, Style Card IDs, Transformation Family IDs, Part 6 architecture, Part 4 metadata normalisation, marking-point repair, the existing mechanical validators, and the severity hierarchy are unchanged. Parts 5–7 were not edited. v1 prompts in `draloAiExamPrompts.js` were not deleted.

## Files

Changed:

- `package.json` — the v2 test file is included in `npm test`
- `src/lib/levelsCambridgeExamGenerator.js` — default `ruoeGenerationVersion = 'v1'`, and a throw if v2 is asked to persist or preview

Added:

- `src/lib/ruoeNaturalnessFirstV2/contract.js`
- `src/lib/ruoeNaturalnessFirstV2/judgements.js`
- `src/lib/ruoeNaturalnessFirstV2/repair.js`
- `src/lib/ruoeNaturalnessFirstV2/variety.js`
- `src/lib/ruoeNaturalnessFirstV2/prompts.js`
- `src/lib/ruoeNaturalnessFirstV2/generate.js`
- `src/lib/ruoeNaturalnessFirstV2/index.js`
- `src/lib/__tests__/ruoeNaturalnessFirstV2.test.js`
- `scripts/run-ruoe-naturalness-first-v2-pilot.mjs`
- `local-pilots/ruoe-naturalness-first-v2/` (local JSON only, not a production exam)

## Tests

`node --loader ./scripts/alias-loader.mjs --test src/lib/__tests__/ruoeNaturalnessFirstV2.test.js`

17 passed, 0 failed. Details are in `RUOE_NATURALNESS_FIRST_V2_TEST_RESULTS.md`.

## Pilot

`node --loader ./scripts/alias-loader.mjs scripts/run-ruoe-naturalness-first-v2-pilot.mjs`

16/16 local files, model `gpt-4o-mini`, about 218 seconds. v1 used `resolveDefaultExamPartGenerationPrompt` (the code prompt). Database overrides were not read. Comparison is in `RUOE_NATURALNESS_FIRST_V2_PILOT_COMPARISON.md`.

## Unresolved

1. The adversary is the same model family as the generator. An empty `alternatives` list becomes a Part 2 pass. That is not a separate solver.
2. Part 2 does not fail a set that contains fewer than eight gaps. The P2-B pilot passed with six.
3. Part 1 variety is scored, and a one-type paper fails the variety object, but variety failure does not by itself start another generation loop.
4. Part 1 sentence repair is requested but not re-judged. Distractor repair is re-judged only when the model returns `options` or `items[0].options`.
5. Part 3 `sharesStem` treats a shared four-letter prefix as a derivation, so `beekeep → beekeeping` can pass. Hyphenated extra lexemes such as `decision-making` still fail.
6. Part 4 replacements in the pilot came back nested as `{ family, pair }` with no top-level `answer`. The re-judge then saw an empty answer and returned `HARD_FAIL`, and the stored answer key for that arm is empty. The inner pairs were still one word, or a keyword that was not inside the answer.
7. Part 4 `naturalness.natural` is sometimes an object. The orchestrator treats any value other than `false` as natural.
8. v2 is not wired to production. The live Part 1 override row is still the older stored prompt. The v1 pilot arm is the current code prompt, which is newer than that row.
