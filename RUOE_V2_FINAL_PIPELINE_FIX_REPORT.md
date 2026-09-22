# RUOE v2 final pipeline fix report

Phase 6 used only the saved Phase 5 artefacts and reports. No model/API call was made, no synthetic task was generated, and no pilot was run.

Production remains unchanged. v2 remains local-only. Supabase, database prompt overrides, `useCodePrompts`, v1, and production exams were not changed.

## Root-cause analysis of the ten Phase 5 pipeline failures

The old artefacts did not preserve raw failed responses or repaired responses. “Actual returned structure” below therefore uses the exact Zod issues and canonical data that were saved. That missing raw evidence was itself a root cause.

| Task | Exact failing stage | Saved returned structure versus expected | Recoverable content | Cause | Minimum prevention |
| --- | --- | --- | --- | --- | --- |
| P1-F | independent substitution → schema repair | Four returned item records had option arrays whose length was not four. Expected eight item records, each containing four A–D judgement objects. The source also had 11 distractor sets against eight selected keys, with IDs shifted after Q5. | Passage and eight selected keys were recoverable. Distractors were recoverable by matching their `isKey` word to the selected key, not by trusting shifted IDs. | Oversized multi-item judge call; failed schema repair; ID handover mismatch. | Judge one item per call; normalise distractors by preserved key; retain IDs; repair the malformed payload, not a blank prompt. |
| P1-G | independent substitution → schema repair | Returned option entries were strings, only three per item. Expected four objects with booleans and reasons. | Passage, eight keys, and eight distractor sets were recoverable. Judgements were not. | Prompt/schema mismatch and failed schema repair. | One item per call with an explicit contract and one repair using the raw malformed object. |
| P1-H | independent substitution → schema repair | Returned `items: []`. Earlier key/distractor stages contained only seven questions. Expected questions 1–8 followed by one four-option judgement per question. | Passage was recoverable; the complete Part 1 was not because one item was missing. | Missing generated item plus empty judge output; mechanics were checked too late. | Enforce questions 1–8 before the judge; return `HARD_FAIL` for seven questions; never ask blind/adversarial layers to classify it. |
| P2-G | second gap selection, then blind solve/final aggregation | After bounded discovery the selection contained only Q9 and Q10. Expected Q9–Q16. The blind response also omitted the singular blind-answer contract. | Article was recoverable. The selected exercise was not complete. | Objective mechanics failure plus multi-gap blind prompt/single-answer schema mismatch; aggregation let malformed blind output mask the hard failure. | Stop at deterministic `HARD_FAIL`; do not call blind/adversarial layers. For valid sets, call blind solver once per gap. |
| P2-H | blind solve/final aggregation | Selection contained eight gaps, but uniqueness records said `alternativeSearchPerformed: false`. The blind response omitted required singular answer/search fields. | Article and eight candidate positions were recoverable; uniqueness was not established. | Multi-gap blind prompt with a single-gap response contract; missing positive evidence was correctly a quality failure. | Build one gapped sentence in code and call blind/adversarial validation once per gap. Preserve the quality failure if the output is valid. |
| P3-G | base assignment parsing/schema | `lexicalFamilyValidation.legitimateBase` was a string for three items. Expected a boolean. No schema repair was available because the one global allowance had already repaired family discovery. | Prose and discovered words were recoverable. Base-assignment evidence was not valid. | Wrong field type and global-per-item repair budget consumed by an earlier stage. | One bounded repair per stage, with malformed JSON and the exact expected contract included. |
| P3-H | base assignment parsing/schema | Same string-versus-boolean mismatch for four `legitimateBase` fields. Expected booleans. | Prose and discovered words were recoverable. Base-assignment evidence was not. | Same shared repair-budget and field-type problem as P3-G. | Same per-stage structural repair. |
| P4-F | replacement revalidation | Replacement canonicalised successfully. Saved answer was one word (`missing`). A later semantic/naturalness response was incomplete; exact missing fields were not persisted. | Canonical replacement was recoverable, but it independently violates 2–5 words. | Mechanics were checked after semantic calls; global repair budget was spent on an earlier naturalness stage; failed-stage details were discarded. | Check 2–5 words/keyword first and return `HARD_FAIL`; persist each attempt; allow one schema repair for each later stage. |
| P4-G | replacement revalidation | Replacement canonicalised; answer was one word (`ladder`). Later semantic/naturalness output was incomplete and not saved. | Canonical replacement was recoverable but mechanically invalid. | Same ordering, global-budget, and observability defects as P4-F. | Same mechanics-first and per-stage repair fix. |
| P4-H | first naturalness repair and replacement revalidation | First naturalness remained invalid after repair (`natural` was not available). Replacement canonicalised with `cheaper ticket`, but later semantic/naturalness output was incomplete and details were lost. | Replacement pair was recoverable; semantic equivalence was not proven. | Failed schema repair, global repair budget, and missing before/after attempt records. | Give repair the malformed payload and contract, budget by stage, and retain both attempts. |

## Shared root causes

### 1. Schema repair had no source payload

Affected: P1-F/G/H, P3-G/H, P4-F/G/H.

The repair prompt received validation errors but not the malformed JSON. It could not preserve linguistic content because it had nothing to restructure. It effectively generated a fresh response.

Fix: schema repair now receives:

- the validation issues;
- the exact malformed JSON;
- the documented expected structure;
- an instruction not to reconsider answers, booleans, or linguistic quality.

Both the initial and repaired attempts are saved in the stage record.

Risk: a model can still alter content despite the instruction. The attempt log makes that detectable; malformed repaired output remains `PIPELINE_FAIL`.

### 2. One schema-repair allowance was shared by the whole item

Affected: P3-G/H and P4-F/G/H.

An early successful repair consumed the only allowance. A later independent stage then failed without any repair opportunity.

Fix: one bounded repair is now allowed per named stage. The same stage cannot be repaired twice.

Risk: more local calls when several stages are malformed. The bound remains deterministic and no stage can loop.

### 3. Multi-item input used a single-item response contract

Affected: P1-F/G/H and P2-G/H.

Part 1 asked the model to judge an entire paper in one large response. Part 2 blind solving supplied eight gaps while its required output described one answer.

Fix:

- Part 1 constructs A–D sentences in code and judges one question per call.
- Part 2 constructs a blanked sentence in code and blind-solves/adversarially checks one gap per call.
- Part 3 validation is likewise split into item units by the common layer runner.

Risk: more calls and tokens when the motor is used. IDs and context are smaller and explicit, reducing schema ambiguity.

### 4. Stage identity was trusted instead of canonicalised

Affected: P1-F.

The distractor generator emitted extra items and shifted numbering. Matching only by number paired Q6’s sentence with the wrong key.

Fix: distractor sets are matched to selected items by the preserved `isKey` word, then renumbered to the selected question ID. Missing or non-unique matches remain `PIPELINE_FAIL`; extras are logged as ignored.

Risk: duplicate keyed words could be ambiguous. The normaliser fails rather than guessing when it cannot find a unique usable match.

### 5. Objective failure was allowed to enter downstream linguistic layers

Affected: P1-H, P2-G, P4-F/G and potentially P4-H.

Wrong counts and one-word transformations were sent onward, allowing a later malformed layer to dominate the final verdict.

Fix: deterministic `PIPELINE_FAIL` and `HARD_FAIL` stop blind and adversarial calls. Part 4 checks canonicalisation, answer count, keyword, and mechanical flags before semantic validation.

Risk: none to acceptance strictness. Invalid items are rejected earlier.

### 6. Failed-stage evidence was discarded

Affected most visibly: P4-F/G/H.

The artefacts saved a generic failure reason but not the malformed semantic/naturalness object.

Fix: every validated stage record now stores initial raw output, repaired raw output where applicable, issues, and validity.

Risk: larger local audit artefacts. No production persistence was added.

## Analysis of the 17 recorded Phase 5 repairs

The 17 records comprise:

- 9 schema repairs;
- 3 second gap-discovery calls;
- 1 `move-gap` policy record that did not make an API call;
- 1 Part 3 new-position call;
- 3 Part 4 family replacements.

Structural outcomes:

- 11 returned a structurally usable result;
- 5 failed structurally;
- 1 (`move-gap` in P2-H) was recorded but not executed.

Schema repairs specifically:

- immediate structural successes: 5/9;
  - P3-F/G/H family-discovery repair;
  - P4-F/G first naturalness repair;
- failures: 4/9;
  - P1-F/G/H;
  - P4-H.

Only P3-F ended with a non-pipeline verdict after a schema repair. For P3-G/H and P4-F/G, a later malformed stage failed because the global budget had been consumed.

Schema repair was therefore locally useful but not reliable end-to-end. More importantly, it was not genuinely guaranteed to be structure-only: the repair call did not receive the original malformed payload. The saved artefacts cannot prove whether linguistic content changed because before/after responses were not retained. That observability gap is now fixed.

## Pipeline fixes implemented

- Per-stage schema repair with raw malformed payload and explicit contract.
- Before/after stage-attempt audit records.
- One Part 1 judge call per question.
- Deterministic Part 1 completed sentences.
- Key-based Part 1 distractor handover normalisation.
- Part 1 count/number checks before judging.
- One Part 2 blind/adversarial call per gap with a deterministic blank.
- One Part 3 blind/adversarial call per item.
- Part 4 mechanics before semantics.
- Part 4 stage-attempt records and completed-S2 comparison.
- Deterministic failures stop downstream layers.
- Teacher-feedback repair mode added as a versioned controlled patch.

## Files changed

- `package.json`
- `src/lib/ruoeNaturalnessFirstV2/generate.js`
- `src/lib/ruoeNaturalnessFirstV2/schema.js`
- `src/lib/ruoeNaturalnessFirstV2/layers.js`
- `src/lib/ruoeNaturalnessFirstV2/prompts.js`
- `src/lib/ruoeNaturalnessFirstV2/index.js`
- `src/lib/__tests__/ruoeNaturalnessFirstV2.test.js`

Added:

- `src/lib/ruoeNaturalnessFirstV2/teacherRepair.js`
- `src/lib/__tests__/ruoeTeacherRepair.test.js`
- the three Phase 6 reports.

## Ready state

The known code-level causes visible in the Phase 5 artefacts have corresponding fixes and automated tests. No new model run was made, so model compliance has deliberately not been re-measured.

The motor is ready for controlled, local application of real teacher reports as candidate patches. It is not activated for production, and a repair cannot be accepted unless the caller supplies the relevant Part validator and every validator passes.
