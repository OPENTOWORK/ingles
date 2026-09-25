# RUOE v2 real teacher-feedback validation

Date: 22 September 2026  
Scope: exactly five supplied historical cases; local only  
Models: generator, blind solver, and adversary each used `gpt-4o-mini`

## Outcome

- PASS: 0
- PIPELINE_FAIL: 2
- HARD_FAIL: 1
- QUALITY_FAIL: 2
- Successfully repaired and accepted: 0/5
- Valid repairs matching the historical correction: 0
- Different but valid repairs: 0
- One rejected candidate (Case 5) reached the historical wording but remained mechanically invalid.
- Unrelated questions were preserved exactly in every attempted patch.
- No source exam was overwritten. No Supabase, production prompt, DB override, or production exam was read or changed.

The result is not evidence that the validators are too strict. The run found missing evidence, a source/report mismatch, and genuinely invalid proposed repairs. Failed candidates remained unaccepted.

Local audit records and candidate versions:

- `local-teacher-repairs/ruoe-v2-phase7/case-1.json`
- `local-teacher-repairs/ruoe-v2-phase7/case-2.json`
- `local-teacher-repairs/ruoe-v2-phase7/case-3.json`
- `local-teacher-repairs/ruoe-v2-phase7/case-4.json`
- `local-teacher-repairs/ruoe-v2-phase7/case-5.json`
- `local-teacher-repairs/ruoe-v2-phase7/index.json`

## Case 1 — Exam 16, Part 1, Q6

- Source version: `pre-teacher-patch-2026-08-31T22:12:31.044Z`
- Source: `scripts/generated/b2-exams/exam-16/part-01.json`
- Original sentence: “Although unpaid, this kind of work can have a very (6) ___ effect on job prospects.”
- Original options: A `strong`; B `powerful`; C `certain`; D `positive`
- Original key: D
- Teacher feedback: `strong` is also natural and defensible.
- Scope: `DISTRACTOR_ONLY_FIX`
- Final candidate options after one bounded retry: A `feeble`; B `detrimental`; C `inconsequential`; D `positive`
- What changed: Q6 options only.
- Why: the first proposal (`significant`, `influential`, `beneficial`, `positive`) left four surviving answers.
- Validators:
  - Structural validation: PASS; four labelled options and Q6 identity preserved.
  - Blind solve: D.
  - Independent A–D substitution/adversary: QUALITY_FAIL; it marked A, B, C, and D as grammatical, natural, collocationally valid, and contextually defensible.
  - Ambiguity validation: QUALITY_FAIL; more than one option survived.
- Retries: one linguistic distractor-only retry.
- Historical correction: not available in a local historical teacher-patch document.
- Historical comparison: not assessable; no correction was invented.
- Preservation: Q1–Q5 and Q7–Q8 unchanged exactly.
- Final status: `QUALITY_FAIL`

The candidate was not accepted. The adversary’s boolean flags also conflict with parts of its own reasons, showing that model-supplied linguistic facts need a consistency check before the full batch.

## Case 2 — Exam 15, Part 2, example/opening

- Source version: `pre-teacher-patch-2026-08-31T21:58:39.096Z`
- Source: `scripts/generated/b2-exams/exam-15/part-02.json`
- Original opening: “For many teenagers, social media is now just as (0) ___ normal as sending a text message.”
- Original example answer: `as`
- Original Q9–Q16 keys: `to`, `themselves`, `but`, `when`, `on`, `which`, `on`, `who`
- Teacher evidence available locally: only the supplied summary that the example/opening required a naturalness/Open Cloze correction.
- Scope expected: `SENTENCE_LOCAL_CONTEXT_FIX`
- Repair: none.
- Validators: not run because the source rule required the exact historical teacher-patch document/comment before editing.
- Retries: none.
- Historical correction: unavailable locally.
- Preservation: the complete source Part 2 remained unchanged.
- Final status: `PIPELINE_FAIL`

The malformed opening strongly suggests a duplicated `as`, but applying that inference would violate the explicit no-invention source rule.

## Case 3 — Exam 16, Part 3, Q17

- Source version: `pre-teacher-patch-2026-08-31T22:13:44.493Z`
- Source: `scripts/generated/b2-exams/exam-16/part-03.json`
- Original context: “A good night's sleep improves our mood, sharpens our memory and supports better (17) ___ (DECIDE) during the day.”
- Original base/key: `DECIDE` → `decision-making`
- Teacher feedback: the compound route is forced/invalid.
- Scope: `TARGET_REPLACEMENT`
- Final candidate: `DECIDE` → `decision` (noun)
- What changed: Q17 target metadata and its separate `modelAnswers` record only.
- Validators:
  - Structural validation: PASS after one structure-only repair corrected a malformed `stem` field.
  - Morphology: PASS for `DECIDE` → `decision` as a direct lexical-family derivation.
  - Blind solve: `decisions`.
  - Naturalness/uniqueness: QUALITY_FAIL because the blind answer did not match the singular candidate; “supports better decision” is not the required natural completion.
  - Adversary: returned PASS, but the blind disagreement prevented acceptance.
- Retries: one schema-repair attempt and one bounded linguistic retry.
- Historical correction: `DECIDE` → `decisions`
- Historical comparison: v2 disagreed, producing singular `decision`; the historical plural is better supported by the sentence.
- Preservation: Q18–Q24 unchanged exactly.
- Final status: `QUALITY_FAIL`

The candidate was not accepted. This case shows that direct lexical-family membership alone is insufficient; number and completed-sentence grammar must remain decisive.

## Case 4 — Exam 11, Part 4, Q25

- Located source version: `pre-teacher-patch-2026-08-31T21:13:45.955Z`
- Source: `scripts/generated/b2-exams/exam-11/part-04.json`
- Located S1: “The manager said that flexible hours had made a big difference to staff morale.”
- Located keyword: `BEEN`
- Located S2: “The manager said that flexible hours __________________ a big difference to staff morale.”
- Located answer: `had been making`
- Supplied historical direction: `BEEN` with `has been using`
- Scope expected: `TRANSFORMATION_REBUILD`
- Repair: none.
- Source consistency validation: PIPELINE_FAIL. `has been using` cannot complete the located S2 and refers to an entirely different lexical proposition.
- Semantic validation: not run because applying the direction would require inventing a different item.
- Retries: none.
- Historical comparison: the supplied report and located source Q25 do not correspond.
- Preservation: Q25–Q30 remained unchanged.
- Final status: `PIPELINE_FAIL`

The exact immediately-pre-patch source corresponding to the teacher direction is still missing or the report’s exam/question mapping is wrong.

## Case 5 — Exam 11, Part 3, Q22

- Source version: `pre-teacher-patch-2026-08-31T21:08:52.079Z`
- Source: `scripts/generated/b2-exams/exam-11/part-03.json`
- Original context: “However, experts warn that progress is not always (22) ___ (EQUAL) across a city.”
- Original stored key: `unequal`
- Scope: `KEY_METADATA_FIX`
- Candidate key: `equal`
- What changed: the Q22 key and corresponding separate `modelAnswers` record only.
- Validators:
  - Structural/key synchronisation: PASS.
  - Blind solve: `equal`.
  - Completed-sentence naturalness: supported.
  - Part 3 mechanics/adversary: HARD_FAIL because `EQUAL` → `equal` leaves the supplied base unchanged and is not Word Formation.
- Retries: none.
- Historical correction: `UNEQUAL` → `EQUAL`
- Historical comparison: the candidate independently reached the historical wording, but the current v2 rules correctly reject it as a Part 3 item.
- Preservation: Q17–Q21 and Q23–Q24 unchanged exactly.
- Final status: `HARD_FAIL`

The teacher patch repairs the sentence/key contradiction but does not repair the exam mechanic. A future authorised repair would need escalation from key-only correction to target replacement or local-context repair, followed by full revalidation.

## Repair-motor change discovered during validation

Real exam payloads keep answers in a separate `modelAnswers` array. Teacher-repair mode previously patched the question object without synchronising that canonical key record. It now synchronises the matching record by question number or ID while preserving unrelated answers.

An automated regression test was added. The focused RUOE suite now passes 39/39 tests with zero failures, and edited files report no lint errors.

The complete repository suite passed 540/541 tests. Its one failure is outside this change: the existing `POSITIVE-P3-NO-PREFIX` fixture has a 147-word passage while the validator requires at least 150 words.

## API usage

- Prompt tokens: 2,400
- Completion tokens: 1,619
- Total tokens: 4,019
- No higher model was used.

## Readiness decision

Do not process the full teacher-report batch yet.

Blocking issues:

1. Supply the exact historical teacher-patch evidence for Exam 15 Part 2 and the historical correction for Exam 16 Part 1.
2. Locate the actual Exam 11 Part 4 pre-patch source corresponding to `BEEN` / `has been using`, or correct the report mapping.
3. Add consistency validation between model boolean judgements and their reasons.
4. Strengthen completed-sentence grammar/number validation for Part 3 so singular/plural failures do not rely mainly on blind-solver disagreement.
5. Define controlled scope escalation when a key-only correction is natural but violates Part 3 mechanics.

Processing stopped after these five cases.
