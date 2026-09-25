# RUOE v2 Phase 8 — repair debug and source reconciliation

Date: 22 September 2026  
Scope: the five Phase 7 cases only  
Focused model rerun: Cases 1 and 3 only, using `gpt-4o-mini`

## Result

- Case 1: `PASS`
- Case 2: `REFERENCE_INCOMPLETE`; not repaired
- Case 3: `PASS`
- Case 4: source/reference mismatch unresolved; not repaired
- Case 5: historical patch `INVALID UNDER CURRENT RULES`; not rerun

No production configuration, v1 path, Supabase data, DB prompt override, or production exam was changed.

Focused repaired artefacts:

- `local-teacher-repairs/ruoe-v2-phase8/case-1.json`
- `local-teacher-repairs/ruoe-v2-phase8/case-3.json`
- `local-teacher-repairs/ruoe-v2-phase8/index.json`

## Case 1 repair debug

### Original

- Exam 16, Part 1, Q6
- Sentence: “Although unpaid, this kind of work can have a very (6) ___ effect on job prospects.”
- Options: A `strong`; B `powerful`; C `certain`; D `positive`
- Stored key: D

Independent validation of the original found A, B, and D defensible. The teacher specifically identified A, but B was also a surviving distractor. Preserving D was sensible rather than automatic: D remained natural, matched the intended passage proposition, and was independently selected by the blind solver.

### Why Phase 7 failed

Phase 7 made two broad attempts:

1. `significant`, `influential`, `beneficial`, `positive`
   - All four were grammatical and semantically compatible.
   - The repair prompt generated synonyms instead of failed distractors.
2. `feeble`, `detrimental`, `inconsequential`, `positive`
   - It replaced every distractor at once instead of the identified survivor.
   - The adversary saw only the isolated sentence, not the complete passage.
   - It consequently marked context-contradicting alternatives as defensible, even where its own reasons said they contradicted the intended meaning.

Distractor-only repair was sufficient, but one replacement was not: both A and B survived the original item. The repair needed to replace one identified survivor, revalidate A–D, and then replace the next survivor if necessary.

### Changes

- Added `buildPart1DistractorOnlyPatch()`:
  - derives the surviving non-key option from four independent judgements;
  - changes exactly one option;
  - preserves the key and all other options;
  - rejects malformed or duplicate replacement words.
- Added a dedicated teacher-repair prompt:
  - includes the complete passage;
  - names the exact option to replace;
  - permits a grammatical semantic distractor that contradicts the passage;
  - forbids replacing the survivor with another positive synonym;
  - forbids duplicate options.
- Revalidation runs A–D independently after every local edit.
- Added a distinct-option structural check before acceptance.

The uniqueness validator itself was not weakened.

### New repair

Sequential local edits:

1. A `strong` → `negative`
   - Revalidation then found B and D still surviving.
2. B `powerful` → `weak`
   - Revalidation found only D surviving.

Final options:

- A `negative`
- B `weak`
- C `certain`
- D `positive`

### Validation and preservation

- Four distinct option words: PASS
- Independent A–D substitution: PASS; only D survived
- Blind solve: PASS; D selected
- Adversarial validation: PASS
- Q1–Q5 and Q7–Q8 unchanged exactly
- Passage and stored key unchanged
- Final verdict: `PASS`

## Case 2 source reconciliation

### Located pre-patch source

- Exam 15, Part 2
- Source: `scripts/generated/b2-exams/exam-15/part-02.json`
- Generated: `2026-08-31T21:58:39.096Z`
- Title: “Scrolling Through the Teenage Years”
- Opening: “For many teenagers, social media is now just as (0) ___ normal as sending a text message.”
- Example answer: `as`
- Q9–Q16 keys: `to`, `themselves`, `but`, `when`, `on`, `which`, `on`, `who`

### Evidence search

The exact original is present. The exact teacher comment and post-patch wording are not present in:

- the local exam audit directory;
- local human-review JSON for Exam 15;
- tracked or ignored textual repository files;
- relevant textual git history;
- the available conversation history.

The malformed opening appears to contain a duplicated `as`, but Phase 8 did not treat that inference as historical evidence.

### Status

`REFERENCE_INCOMPLETE`

Missing:

1. exact teacher feedback;
2. exact post-patch opening/example;
3. a version identifier or patch document tying that correction to this source.

Case 2 is not ready for valid retesting.

## Case 3 repair debug

### Original

- Exam 16, Part 3, Q17
- Source: `scripts/generated/b2-exams/exam-16/part-03.json`
- Sentence: “A good night's sleep improves our mood, sharpens our memory and supports better (17) ___ (DECIDE) during the day.”
- Base: `DECIDE`
- Stored answer: `decision-making`

`decision-making` is invalid here because it introduces the independent lexical root `making`. It is not a direct one-word derivation of `DECIDE`.

### Why Phase 7 failed

Phase 7 attempted:

1. a malformed proposal with the whole sentence in `stem` and answer `deciding`;
2. `DECIDE` → `decision`.

The second proposal was morphologically related, but the completed phrase “supports better decision during the day” required plural `decisions`. The blind solver found the plural, so the singular candidate was correctly rejected.

The Phase 7 retry prompt explicitly told the model to keep `DECIDE` and the existing sentence. More importantly, the repair API could replace a question object but had no controlled operation for changing one sentence inside the top-level passage. It therefore did not fully support genuine target replacement.

### Changes

- Part 3 repair policy now explicitly permits changing:
  - the gapped word;
  - supplied base;
  - immediate sentence wording.
- Added controlled `localPassageEdit` support:
  - only for local-context or target-replacement scope;
  - requires one exact source occurrence;
  - preserves question markers and numbering;
  - requires the printed Part 3 base to match the structured stem.
- Surrounding passage and neighbouring questions remain immutable.
- Structured stem/base is authoritative over inconsistent model display text.
- A bounded blind-supported number correction is accepted only when the corrected answer independently passes unchanged morphology rules.

No morphology rule was weakened.

### New repair

The first candidate was `DECIDE` → `decision`. The blind solver independently returned `decisions`, and the adversary confirmed that the context requires plural.

The bounded correction produced:

- Sentence: unchanged
- Base: `DECIDE`
- Answer: `decisions`
- Family: noun

The new capability could change sentence and base, but this case did not require those broader edits once the natural direct derivation was identified. A regression test separately verifies a real local target replacement from `DECIDE` to `PERFORM` → `performance` while preserving its neighbour.

### Validation and preservation

- Structural/base canonicalisation: PASS
- Legitimate base: PASS
- Direct one-word derivation: PASS
- No extra lexical root: PASS
- Completed-sentence naturalness and number: PASS
- Blind solve: PASS; `decisions`
- Adversarial validation: PASS
- Q18–Q24 and their answer records unchanged exactly
- Surrounding passage unchanged
- Final verdict: `PASS`

This independently matches the historical `decisions` correction.

## Case 4 source reconciliation

### Located source

- Exam 11, Part 4, Q25
- Source: `scripts/generated/b2-exams/exam-11/part-04.json`
- Generated: `2026-08-31T21:13:45.955Z`
- S1: “The manager said that flexible hours had made a big difference to staff morale.”
- Keyword: `BEEN`
- S2: “The manager said that flexible hours __________________ a big difference to staff morale.”
- Stored answer: `had been making`

The supplied historical correction `has been using` cannot complete this S2 and does not express its proposition.

### Evidence search

No actual RUOE transformation containing `has been using` was found in:

- current or ignored generated exam artefacts;
- tracked textual repository files;
- textual git history;
- local review files.

The only exact occurrences are the Phase 7/8 case descriptions and reports. A historical commit contains unrelated prose with “started using”, not this transformation.

### Status

The correct exam, version, and question number could not be identified.

This remains an unresolved `SOURCE MISMATCH` with incomplete reference evidence. Case 4 is not ready for retesting. No repair was run.

## Case 5 historical-patch reassessment

### Original

- Exam 11, Part 3, Q22
- Sentence: “However, experts warn that progress is not always (22) ___ (EQUAL) across a city.”
- Supplied base: `EQUAL`
- Stored answer: `unequal`

The stored answer produces “progress is not always unequal”, which reverses or weakens the intended inequality claim. The historical key change to `equal` produces the natural sentence “progress is not always equal”.

However, `EQUAL` → `equal` leaves the supplied word unchanged. That is not a Cambridge-style Word Formation operation.

### Classification

`INVALID UNDER CURRENT RULES`

The historical patch fixed the local sentence/key contradiction but left the exam mechanic invalid. The stem-equals-answer rule remains unchanged.

### Valid future repair direction

The smallest defensible repair is a local-context repair:

- Revised sentence: “However, experts warn that progress can be (22) ___ (EQUAL) across a city.”
- Base: `EQUAL`
- Answer: `unequal`

This preserves the intended claim, restores a direct prefix derivation, and avoids rewriting the surrounding passage. It is a proposal for a future authorised retest, not an applied Phase 8 repair.

Case 5’s source is reconciled and it is ready for retesting only as a local-context/target repair—not as the historical key-only patch.

## Code and tests

Changed:

- `src/lib/ruoeNaturalnessFirstV2/teacherRepair.js`
- `src/lib/ruoeNaturalnessFirstV2/prompts.js`
- `src/lib/ruoeNaturalnessFirstV2/repair.js`
- `src/lib/ruoeNaturalnessFirstV2/index.js`
- `src/lib/__tests__/ruoeTeacherRepair.test.js`
- `scripts/run-ruoe-v2-phase8-repairs.mjs`

New exact regressions cover:

1. replacing one known Part 1 surviving distractor and obtaining exactly one survivor;
2. rejecting duplicate Part 1 replacement words;
3. replacing a defective Part 3 target by changing the local sentence and base while preserving neighbouring questions and answers.

Results:

- Focused RUOE v2 tests: 41 passed, 0 failed
- Edited-file lint diagnostics: 0
- Complete repository suite: 542 passed, 1 failed
- The one full-suite failure is pre-existing and unrelated: `POSITIVE-P3-NO-PREFIX` contains a 147-word fixture while the validator requires at least 150 words.

## Readiness

- Cases 1 and 3 now PASS.
- Case 2 is blocked by missing teacher and post-patch evidence.
- Case 4 is blocked by an unresolved source/question mismatch.
- Case 5 is source-reconciled and ready for a correctly scoped future retest.

The full teacher-report batch remains blocked until Cases 2 and 4 have exact source/reference alignment. Processing stopped after the requested Phase 8 work.
