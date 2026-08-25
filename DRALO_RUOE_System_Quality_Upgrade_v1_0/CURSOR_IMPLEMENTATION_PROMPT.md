# Cursor implementation prompt · DRALO RUOE System Quality Upgrade v1.0

You are working inside the existing `english-practice` repository.

A new specification pack has been added:
`DRALO_RUOE_System_Quality_Upgrade_v1_0/`

## Goal

Implement the approved RUOE quality-system changes from this pack into the actual generation engine and validators. This is a system upgrade, not a request to patch only the two pilot exams.

Read these files first, in this order:

1. `DRALO_RUOE_Editorial_Quality_Standard_v1_0.docx`
2. `DRALO_RUOE_Style_Cards_v1_1_Pilot_Revised.docx`
3. `DRALO_RUOE_Generation_Validator_Upgrade_v1_1.docx`
4. `DRALO_RUOE_QA_Lessons_Learned_v1_0.docx`

Also inspect the existing RUOE prompt/runtime implementation, prompt overrides, validators, tests and dry-run scripts before changing anything.

## Important boundaries

- Do NOT change Topic Bank content because of these pilot findings.
- Do NOT redesign Content Brief allocation unless a direct incompatibility is proven.
- Do NOT change Part 4 in this task.
- Do NOT write generated exams to production.
- Do NOT modify database production data.
- Do NOT silently invent new pedagogical rules.
- Where a specification rule cannot be implemented reliably, report it rather than approximating it invisibly.
- Preserve local-regeneration behaviour.

## Implementation order

### 1. Map the current implementation

Before editing, report:
- which files currently define prompts for Parts 1, 2, 3, 5, 6 and 7;
- which runtime/database prompt overrides can supersede code defaults;
- which validators currently run for each Part;
- which tests/dry-runs exercise those paths.

Confirm which source is actually authoritative at runtime.

### 2. Add the global Editorial Quality layer

Implement an independent post-generation quality pass for Parts 1, 2, 3, 5, 6 and 7.

It must evaluate:
- idiomatic/natural British English;
- awkward or translated-sounding collocations;
- unnecessary abstraction/corporate wording;
- filler and repeated conclusions;
- genre fit with the assigned Style Card;
- title quality/pattern repetition;
- item interference with natural prose;
- reference integrity;
- adversarial answer uniqueness where applicable.

The validator must not simply trust generator-provided notes such as `answer_validity_notes`.

Return structured findings with:
`rule_id`, `severity`, `location`, `evidence`, `reason`, `recommended_local_action`.

### 3. Update Style Card runtime representation to v1.1

Ensure the engine uses the v1.1 naturalness and title-strategy additions.

Do not duplicate Part mechanics inside Style Cards.

For title generation:
- create at least 3 candidates internally;
- select after the text is stable;
- reject titles that are literal paraphrases of the brief;
- avoid repeated syntactic title patterns;
- keep title-pattern metadata in output so it can later be persisted in Usage History.

Do not require production persistence in this task.

### 4. Update Part-specific generation rules

Implement the v1.1 changes for Parts 1, 2, 3, 5 and 7 exactly as specified.

Key requirements:
- P1: adversarially test all 4 options; multiple defensible answers = fail.
- P3: genuine word formation variety; root==answer default fail; naturalness before stem convenience.
- P5: distractors grounded in passage information; reference-location validation.
- P7: paraphrase evidence; flag literal word matching.

### 5. Replace Part 6 generation logic with Architecture v2

Part 6 must follow this sequence:

1. Generate complete coherent article.
2. Plan 6 cohesion opportunities.
3. Define cohesion metadata for each candidate.
4. Select/write 6 removable complete sentences.
5. PHYSICALLY REMOVE those 6 sentences.
6. Insert gaps 37–42.
7. Create 1 plausible unused sentence.
8. Shuffle A–G.
9. Validate.

Part 6 options are normally one complete sentence each. They may be substantially developed and occupy multiple visual lines. Do not force the pilot's short-sentence style.

Use a soft approximate option length target only; do not make word count a hard Cambridge rule.

### 6. Add Part 6 HARD validators

At minimum implement and test:
- exactly 6 gaps 37–42;
- exactly 7 A–G options;
- exactly one unused;
- no option text remains verbatim in passage;
- each correct option fits only one gap;
- no gap has two defensible answers;
- unused option fits no gap fully;
- correct option has backward + forward cohesion evidence;
- reconstructed article is coherent and non-duplicative.

### 7. Add regression tests with seeded bad cases

Create tests that MUST fail for:

- `TEST-P6-DUPLICATE`: an A–G option also appears verbatim in passage.
- `TEST-P6-MULTIFIT`: one option can fully fit two gaps.
- `TEST-P1-AMBIGUOUS`: two MC options are defensible.
- `TEST-P3-NO-TRANSFORM`: root and answer are identical.
- `TEST-P3-FORCED-NATURALNESS`: item only works with an editorially awkward sentence.
- `TEST-P5-WEAK-DISTRACTOR`: distractors are unrelated to passage information.
- `TEST-P5-BAD-REFERENCE`: question says “last paragraph” but evidence is elsewhere.
- `TEST-P7-WORD-MATCH`: question repeats the decisive phrase from one profile.
- `TEST-EDQ-FILLER`: repeated conclusion/filler paragraph.
- `TEST-TITLE-LITERAL`: title is a near-literal paraphrase of the Content Brief working title.

Also include positive fixtures that should pass.

### 8. Dry-run only

After implementation:
- run all relevant automated tests;
- run dry-runs for Parts 1, 2, 3, 5, 6 and 7;
- generate a small non-production validation sample sufficient to exercise the new rules;
- do not publish or persist exams to production.

## Required final report

Create:
`DRALO_RUOE_System_Quality_Upgrade_v1_0/IMPLEMENTATION_REPORT.md`

Report:
- files changed;
- runtime source of truth after change;
- prompt overrides checked/updated;
- validators added/changed;
- tests added and results;
- Part 6 v2 implementation details;
- any rule that could not be made deterministic;
- any remaining human-review-only check;
- any production migration still required later.

## STOP condition

Stop after implementation + tests + dry-run report.

Do not regenerate the two pilot exams yet.
Do not build the final 20-exam orchestrator.
Do not publish anything.
