# RUOE v2 Phase 9 — final real-case validation

Date: 22 September 2026  
Scope: Cases 4 and 5 only  
Production status: unchanged; local validation only

## Executive result

- Case 4: `REFERENCE_UNRESOLVED`; no repair invented or run
- Case 5: `PASS`
- Focused RUOE v2 tests: 42 passed, 0 failed
- Unrelated content preservation: PASS
- Final recommendation: **READY FOR CONTROLLED FULL TEACHER-REPORT PROCESSING**

This recommendation requires a source-alignment gate: any future teacher case without an exact original source and matching feedback must be skipped as `REFERENCE_INCOMPLETE` or `REFERENCE_UNRESOLVED`, not repaired speculatively.

## Case 4 source resolution

### Supplied historical claim

- Previously labelled: Exam 11, Part 4, Q25
- Keyword: `BEEN`
- Historical answer: `has been using`
- Intended issue: continuing aspect / semantic equivalence

### Located Exam 11 source

The locally available Exam 11 Part 4 source is:

- Source: `scripts/generated/b2-exams/exam-11/part-04.json`
- Version timestamp: `2026-08-31T21:13:45.955Z`
- Part: 4
- Question: 25
- S1: “The manager said that flexible hours had made a big difference to staff morale.”
- Keyword: `BEEN`
- S2: “The manager said that flexible hours __________________ a big difference to staff morale.”
- Original answer: `had been making`

`has been using` cannot complete this S2 and refers to a different lexical proposition. This is not the historical source item described by the correction.

### Search performed

The exact phrase and likely variants were searched across:

- all current tracked and ignored generated exam artefacts;
- all textual files in the repository;
- every textual git revision;
- local human-review records;
- the consolidated RUOE status report;
- the available conversation/audit history.

No original transformation, teacher comment, post-patch question, or versioned Part 4 record containing `has been using` was found. Matches in the Phase 7/8 reports merely repeat the supplied case definition; unrelated prose containing “started using” is not a transformation source.

### Resolution

The following cannot be established:

- exact Exam ID;
- exact source version;
- actual question number;
- original S1/S2;
- original answer;
- exact teacher comment;
- complete historical repaired item.

Status: `REFERENCE_UNRESOLVED`

No v2 repair was run. Neighbouring Part 4 questions were not changed. This is an input/reference failure, not evidence of a current Part 4 motor defect.

## Case 4 repair result

No candidate exists because the source could not be aligned. Running a repair would have required inventing S1, S2, context, or question identity.

For future processing, Part 4 intake must require all of:

1. exact source exam/version;
2. exact S1, keyword, S2 and stored answer;
3. teacher comment tied to that item;
4. neighbouring Part 4 questions for preservation checking.

Only then should the existing keyword, 2–5 word, completed-S2, tense/aspect, proposition, blind-solve, and adversarial checks run.

## Case 5 correctly scoped repair

### Original

- Exam: 11
- Part: 3
- Question: 22
- Source: `scripts/generated/b2-exams/exam-11/part-03.json`
- Source timestamp: `2026-08-31T21:08:52.079Z`
- Sentence: “However, experts warn that progress is not always (22) ___ (EQUAL) across a city.”
- Base: `EQUAL`
- Stored answer: `unequal`
- Historical patch: answer changed to `equal`

The stored answer is a legitimate direct derivation, but “not always unequal” contradicts or weakens the intended inequality claim supported by the next sentence about poorer areas receiving less investment.

The historical `equal` correction fixes the sentence meaning but creates `EQUAL` → `equal`, which is not Word Formation.

### Repair scope

`SENTENCE_LOCAL_CONTEXT_FIX`

The target itself was not defective:

- `EQUAL` is a legitimate base;
- `unequal` is a direct negative-prefix derivation;
- no extra lexical root is introduced;
- stem and answer differ.

Therefore target replacement was unnecessary. The smallest valid repair was to remove the contradictory local negative framing.

### New repair

Revised sentence:

“However, experts warn that progress can be (22) ___ (EQUAL) across a city.”

Preserved:

- base: `EQUAL`
- answer: `unequal`
- transformation family: prefix
- passage topic and intended inequality proposition
- Q17–Q21 and Q23–Q24

Local artefact:

- `local-teacher-repairs/ruoe-v2-phase9/case-5.json`
- `local-teacher-repairs/ruoe-v2-phase9/index.json`

### Validation

- Controlled single-sentence edit: PASS
- Question marker and printed base preservation: PASS
- Legitimate base: PASS
- Direct derivation: PASS
- Extra lexical root rejection: PASS
- Stem differs from answer: PASS
- Natural British English: PASS
- Contextual uniqueness: PASS
- Blind solve: `unequal` — PASS
- Adversarial validation: PASS
- Final verdict: `PASS`

### Preservation

- Q17–Q21 unchanged exactly
- Q23–Q24 unchanged exactly
- All neighbouring answer records unchanged exactly
- Only the Q22 sentence framing changed
- Original source retained separately

## Regression tests

Added an exact Case 5 regression proving that teacher-repair mode can:

- classify the issue as local context rather than key-only or target replacement;
- preserve `EQUAL` → `unequal`;
- replace exactly one local sentence;
- preserve neighbouring questions and answers;
- pass unchanged morphology validation.

Results:

- Focused RUOE v2 suite: 42 passed, 0 failed
- Edited-file lint diagnostics: 0
- Full repository suite: 543 passed, 1 failed

The one full-suite failure is pre-existing and unrelated: `POSITIVE-P3-NO-PREFIX` uses a 147-word fixture while the current validator requires at least 150 words.

## Preservation and motor status

Real-case validation now establishes:

- Part 1 ambiguity repair: PASS
- Part 3 defective target repair (`DECIDE` → `decisions`): PASS
- Part 3 invalid historical key patch replaced by a valid local-context repair: PASS
- Part 4 historical case: exact source conclusively unavailable in the available project evidence; safely rejected before mutation
- Failed or unaligned references do not enter repair
- Unrelated content remains unchanged
- No known pipeline defect remains from Cases 1, 3, or 5

## Remaining constraints

Case 2 and Case 4 remain unavailable as historical references. They are not motor blockers, provided full-batch processing enforces the source-alignment gate and records them as unresolved instead of guessing.

The unrelated 147-word test fixture should be corrected separately, but it is not part of teacher-repair mode and does not affect the focused v2 tests.

## Final recommendation

**READY FOR CONTROLLED FULL TEACHER-REPORT PROCESSING**

Conditions:

1. local/dry-run processing first;
2. exact pre-patch source required per case;
3. unresolved references skipped, never inferred;
4. one-question/local-sentence scope preferred;
5. all Part-specific validators must pass before acceptance;
6. original exams and complete audit records retained;
7. no production persistence without separate authorisation.

Phase 9 stops here. No full teacher batch was processed.
