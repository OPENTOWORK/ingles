# RUOE v2 teacher-feedback repair mode

## Purpose

Teacher-feedback mode creates a candidate version of an existing exam. It never silently overwrites the source and does not persist anything.

Entry points:

- `classifyTeacherRepairScope()`
- `createTeacherRepairPlan()`
- `applyTeacherRepairPlan()`

Module: `src/lib/ruoeNaturalnessFirstV2/teacherRepair.js`

## Required input

The plan accepts:

- existing exam object;
- exam ID;
- source version;
- Part number;
- question number;
- teacher comment;
- current answer/key;
- relevant local context;
- optional explicit repair scope.

Missing exam data, an unknown scope, an unlocatable question, or empty teacher feedback returns `PIPELINE_FAIL`.

## Repair classifications

### `KEY_METADATA_FIX`

Use for a wrong key, mark scheme, accepted variant, or metadata. Only answer/key and metadata fields may change.

### `DISTRACTOR_ONLY_FIX`

Use first for Part 1 ambiguity when the sentence and target can remain natural. Only options/distractors may change. The sentence cannot be rewritten under this scope.

### `SENTENCE_LOCAL_CONTEXT_FIX`

Use when local framing is unnatural or a gap must move within its immediate context. Only local sentence/context and answer fields may change.

For Part 2, the caller must run the full Part 2 validator so the revised exam still contains exactly Q9–Q16.

### `TARGET_REPLACEMENT`

Use for a Part 3 base/answer pair that cannot be made natural and valid. The targeted question may be replaced. Its identity and number must remain unchanged.

### `TRANSFORMATION_REBUILD`

Use for a Part 4 route with meaning loss or awkward English. A different family and route are allowed. The targeted question number must remain unchanged, and Part 4 validation must check keyword mechanics, 2–5 words, completed S2, exact meaning, and naturalness.

### `PASSAGE_LEVEL_FIX`

Use only when the feedback explicitly targets the passage or when local fixes cannot host a valid set. A revised passage string is mandatory.

Parts 5–7 are not touched unless the plan explicitly identifies their Part and question.

## Naturalness-first policy

Preserve an existing target when it can be repaired naturally and unambiguously. Replace it when preservation would force unnatural British English or an invalid answer.

Existing targets have no priority over:

- ordinary British-English naturalness;
- unique answer validity;
- direct lexical derivation;
- exact semantic equivalence.

## Controlled patch rules

1. Clone the source exam.
2. Locate exactly one target question.
3. Classify the smallest safe scope.
4. Reject fields outside that scope.
5. Preserve the question number.
6. Preserve every other question byte-for-byte at object level.
7. Set a new version and `derivedFromVersion`.
8. Run all caller-supplied Part validators.
9. Accept the candidate only when every validator returns `PASS`.
10. Keep failed candidates for audit, but set `acceptedExam` to `null`.

No validators means `PIPELINE_FAIL`; the repair is not accepted.

## Part-specific validation after repair

### Part 1

- Build all four completed sentences.
- Judge A–D independently.
- Require exactly one survivor.
- A distractor-only repair must not change the sentence or unrelated questions.

### Part 2

- Validate the complete sentence and surrounding prose.
- Require eight unique one-word answers numbered 9–16.
- Require positive alternative-search evidence.
- A moved gap replaces one target; it does not add or remove a question.

### Part 3

- Validate the base as a legitimate lexical item.
- Reject stem equal to answer, pseudo-stems, and extra roots.
- Permit target replacement.
- Validate the natural completed sentence and contextual uniqueness.

### Part 4

- Canonicalise the repaired object.
- Rebuild completed S2.
- Enforce unchanged keyword and 2–5 words.
- Compare S1 with completed S2 proposition by proposition.
- Permit family replacement.

## Change record

Every attempted patch returns:

- Exam ID;
- source version;
- new version;
- Part;
- question;
- original content;
- teacher feedback;
- repair classification;
- revised content;
- original answer;
- revised answer;
- reason for change;
- validators and their results;
- final status.

The result also returns:

- `originalExam`;
- `candidateExam`;
- `acceptedExam` only on `PASS`.

## Failure handling

- Invalid input or validator shape: `PIPELINE_FAIL`.
- Objective exam rule failure: `HARD_FAIL`.
- Naturalness, ambiguity, morphology, or semantic failure: `QUALITY_FAIL`.
- Failed validation never becomes an accepted version.

## Integration boundary

The mode is deliberately persistence-free. A future teacher-report application should:

1. parse the teacher report into the required plan fields;
2. provide the existing exam object without mutating it;
3. inject the existing Part-specific validators;
4. review the returned candidate and change record;
5. persist only through a separately authorised workflow.

This phase does not provide or authorise that persistence workflow.
