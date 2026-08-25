# E01_TEACHER_FEEDBACK_PATCH_REPORT_v1_1_3

Generated: 2026-08-21T13:20:19.034Z

Controlled patch of RUOE-PILOT-E01 from the second human review. Not a regeneration.

---

## Files changed

| Part | File | Action |
| --- | --- | --- |
| 1 | `EXAM-01/CB-PILOT-001_Part1.json` | patched locally |
| 2 | `EXAM-01/CB-PILOT-002_Part2.json` | patched locally |
| 3 | `EXAM-01/CB-PILOT-003_Part3.json` | patched locally |
| 4 | `EXAM-01/TBP-PILOT-EX01_Part4.json` | copied byte-for-byte (frozen) |
| 5 | `EXAM-01/CB-PILOT-004_Part5.json` | patched locally |
| 6 | `EXAM-01/CB-PILOT-005_Part6.json` | rebuilt (Architecture v2, authorised) |
| 7 | `EXAM-01/CB-PILOT-006_Part7.json` | copied byte-for-byte (frozen) |

New files:

- `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/EXAM-01/*.json` (7 parts)
- `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/patch_manifest.json`
- `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/HUMAN_REVIEW_E01_TEACHER_PATCH_v1_1_3.md`
- `DRALO_RUOE_System_Quality_Upgrade_v1_0/E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3.md`
- `DRALO_RUOE_System_Quality_Upgrade_v1_0/E01_TEACHER_FEEDBACK_PATCH_REPORT_v1_1_3.md`

Unchanged on disk: `05_OUTPUTS_REGENERATED_v1_1_2/` and `05_OUTPUTS_REGENERATED_E02_v1_1_3/`.

### Library fixes required to satisfy the feedback

Two pre-existing bugs in shared code had to be corrected; neither changes exam content by itself.

1. **`src/lib/examPartValidation.js` — `injectPart3StemsIntoPassage`.** This is the root cause of the duplicated markers the review reported ("designed to encourage skill (0) ___ (PRACTICE)_ (PRACTICE)"). The regex `\((\d{1,2})\)\s*(?:_+|\.{2,}|…+)(?!\s*\()` was meant to skip gaps that already carry a stem, but on `(0) ___ (PRACTICE)` the engine backtracked the blank run from `___` to `__`, satisfied the negative lookahead against the leftover underscore and appended a second stem. Adding `(?![_.…])` pins the blank run to its full length. Verified both ways: an already-stemmed gap is left alone, and a bare gap still receives its stem.

2. **`src/lib/ruoeAiAdversarialQuality.js` — Part 6 pool builder.** A stray `)` inside a template expression stopped the whole module from parsing. Because the import is wrapped in try/catch this surfaced only as the warning "Quality validator failed to run: Missing } in template expression", which means **Parts 3, 5, 6 and 7 had never actually received an adversarial review**. One character was corrected, so the adversarial reviewer now runs and its findings appear below for the first time.

## Exact questions changed

| Part | Items touched | Nature |
| --- | --- | --- |
| 1 | Q2, Q5, Q8 (options + keys); Q6 (passage only) | leak removal, agreement + collocation fix, distractor redesign, `if` → `whether` |
| 2 | Example (0), Q9, Q12, Q13, Q14, Q15, Q16 | leak removal ×2, teacher rewrites, new fixed-expression gap at Q15 |
| 3 | Example (0), Q20, Q22 (+ local wording) | genuine example transformation, new -ly adverb, new prefix/negative |
| 5 | Q31–Q36 renumbered; Q33 correct option rewritten; all keys respread | passage progression order, A–D key spread, two passage wordings |
| 6 | Q37–Q42 (whole Part) | Architecture v2 rebuild |
| 4, 7 | none | frozen |

## Part 6 rebuild summary

Preserved: CB-PILOT-005 (v1.0), Style Card SC-04, working title "The boxes I thought I needed", topic/subtopic and the reflective first-person editorial intent.

Procedure actually followed:

1. A complete, continuous article was written first (seven paragraphs, one narrative arc).
2. Six genuine cohesion points were identified, one per paragraph across the first six paragraphs.
3. The sentence occupying each point was written as part of the article, not as a standalone option.
4. Those six sentences were physically removed from the passage.
5. Gaps (37)–(42) were inserted at the vacated positions.
6. One plausible unused sentence was added (option B, the tea-and-biscuits detail).
7. Options were shuffled to A–G so the keys are C, G, F, D, A, E.
8. Reconstruction was validated mechanically and adversarially.

Specific defects resolved:

- The old passage contained gap `(37)` **twice** (a structural duplicate); the rebuilt passage contains each of (37)–(42) exactly once.
- Q37 antecedent mismatch is gone: the sentence before the gap and the sentence after it both refer to the boxes.
- The word "different" no longer appears anywhere in Part 6, removing the Q40 repetition.
- No option text appears verbatim in the passage.

## Validation results

| Part | Mechanical | Blocking HARD | Quality-review HARD | QUALITY | Warnings |
| --- | --- | --- | --- | --- | --- |
| 1 | **PASS** | 0 | 0 | 0 | 3 |
| 2 | **PASS** | 0 | 0 | 0 | 9 |
| 3 | **PASS** | 0 | 0 | 2 | 0 |
| 5 | **PASS** | 0 | 0 | 18 | 0 |
| 6 | **PASS** | 0 | 0 | 3 | 0 |
| 4 | not re-run (frozen) | — | — | — | — |
| 7 | not re-run (frozen) | — | — | — | — |

### HARD / QUALITY / warnings detail

#### Part 1

- **Blocking HARD:**
  - none
- **Quality-review HARD:**
  - none
- **QUALITY:**
  - none
- **Warnings:**
  - Part 1 passage is 189 words; target is 150–180 (accepted up to 200 for generation).
  - Weak item Q1: The distractors (A, C, D) are close in meaning and register, but B is the best fit; still might confuse weaker B2s.
  - Weak item Q8: All options are synonyms but differ in register and subtlety; 'genuine' and 'honest' are both plausible, creating slight ambiguity.

#### Part 2

- **Blocking HARD:**
  - none
- **Quality-review HARD:**
  - none
- **QUALITY:**
  - none
- **Warnings:**
  - Part 2 passage is 192 words; target is 150–180 (accepted up to 200 for generation).
  - [TQ-03] title: Title uses a repeated template frame ("The X that…" / "What happens when…").
  - [TQ-03] title: Title uses a repeated template frame ("The X that…" / "What happens when…").
  - Solver flagged Q12 as ambiguous (if/when): both are natural conditionals here with a subtle difference, both acceptable at B2.
  - Solver flagged Q13 as ambiguous (was/is): past or present tense can both suit, depending on context interpretation.
  - Solver flagged Q14 as ambiguous (best/how): both fit the meaning, 'best to store' or 'how to store'.
  - Solver flagged Q15 as ambiguous (in/for): both prepositions are commonly used with 'order to', slight difference in nuance.
  - Gaps 13, 15 look trivially easy for B2.
  - Weak item Q14: keyed answer 'best' can be challenged; 'how best' is an expression but 'best' alone may confuse less confident candidates

#### Part 3

- **Blocking HARD:**
  - none
- **Quality-review HARD:**
  - none
- **QUALITY:**
  - [P3-FORCED-NATURALNESS] Q17: COMMUNICATION is the natural noun form here, 'communication' fits better than a forced adjectival form like 'communicative'
  - [P3-UNNATURAL-ANSWER] Q18: FRUSTRATION is the correct noun form; 'frustrate' is a verb. Using any other derived word would be unnatural.
- **Warnings:**
  - none

#### Part 5

- **Blocking HARD:**
  - none
- **Quality-review HARD:**
  - none
- **QUALITY:**
  - [P5-WEAK-DISTRACTOR] Q31: The narrator admits the motive was selfish, not proud; 'proud' contradicts the text's modest tone.
  - [P5-WEAK-DISTRACTOR] Q31: The narrator explicitly calls their motive selfish rather than genuine.
  - [P5-WEAK-DISTRACTOR] Q31: The motive is relevant since the narrator reflects on it throughout.
  - [P5-WEAK-DISTRACTOR] Q32: Narrator states the main task was not repairing but welcoming visitors.
  - [P5-WEAK-DISTRACTOR] Q32: Organising volunteers came later, not on the first day.
  - [P5-WEAK-DISTRACTOR] Q32: There is no mention of teaching visitors to fix items on first day.
  - [P5-WEAK-DISTRACTOR] Q33: Visitor was embarrassed and lacked understanding, opposed to confident.
  - [P5-WEAK-DISTRACTOR] Q33: No indication that visitor was frustrated at service speed.
  - [P5-WEAK-DISTRACTOR] Q33: Visitor was concerned about simplicity of repair, not unconcerned.
  - [P5-WEAK-DISTRACTOR] Q34: Mistake exemplifies social awkwardness, not a focus on technical skill.
  - [P5-WEAK-DISTRACTOR] Q34: Narrator does not criticise the workshop’s routines, only mentions own cluelessness.
  - [P5-WEAK-DISTRACTOR] Q34: Narrator continued volunteering and enjoyed it; no explanation of quitting.
  - [P5-WEAK-DISTRACTOR] Q35: Phrase contrasts career focus vs personal insight, not career-only focus.
  - [P5-WEAK-DISTRACTOR] Q35: Experience was positive and insightful, not disappointing.
  - [P5-WEAK-DISTRACTOR] Q35: No mention of promotion or career ladder straightforwardness from volunteering.
  - [P5-WEAK-DISTRACTOR] Q36: Practical repair skills were not the main focus or unexpected insight.
  - [P5-WEAK-DISTRACTOR] Q36: Improving job applications was initial motive but not main theme.
  - [P5-WEAK-DISTRACTOR] Q36: Technical knowledge is lightly discussed but not main theme.
- **Warnings:**
  - none

#### Part 6

- **Blocking HARD:**
  - none
- **Quality-review HARD:**
  - none
- **QUALITY:**
  - [TEST-P6-MULTIFIT] Q39: Option D may fit gaps 39,40: Could logically refer to items mentioned before and contrast interest, fits well in 40 but also possibly 39 in discourse terms, but better in 40
  - [TEST-P6-MULTIFIT] Q39: Option F may fit gaps 39,40: Explains the event type, fits well in 39 but could superficially fit 40
  - [P6-WEAK-COHESION] Q39: Sentence introduces the swap and repair event, but the link to previous ideas is only moderate since the move is about possessions and the event is newly introduced
- **Warnings:**
  - none

### Blind / adversarial solve

- **Part 1:** blind-solve ran, 8 items solved — no disagreement.
- **Part 2:** blind-solve ran, 8 items solved — no disagreement.
- **Part 3:** adversarial review ran — 2 finding(s).
- **Part 5:** blind-solve ran, ? items solved — no disagreement.
- **Part 6:** blind-solve ran, ? items solved — no disagreement.

## British English review

Every rewritten sentence was checked against the question "would a competent British English speaker naturally say or write this?" before acceptance.

- Part 1: "in doing so", "combines with … to produce", "not whether … but how", "genuine intelligence" — all natural British collocations. The unnatural "mixes with trial-and-error" and the impossible "intelligent intelligence" are gone.
- Part 2: "had very little interest", "if you want the fullest flavour", "was not simply about", "how best to store food", "in order to observe local behaviour", "brings people together" — all idiomatic. "ties people together" and "community connections" removed as requested.
- Part 3: "take part in a cooperative activity", "participants", "matching the activity to", "practical exercises", "intervenes only occasionally", "unhelpful or distracting" — adult register, British spelling ("practise" as the verb).
- Part 5: "make him seem silly" and "enjoying this role far more than I expected" adopted verbatim from the review.
- Part 6: written directly in British English ("jumble sale", "rehoming", "flat", "hemmed in", "odds and ends"); no Americanisms, no corporate/AI phrasing.

## Unchanged-content verification

- Part 4 byte-identical: **YES** (`cb670cf0f1ad69cec34d948248656c08…`)
- Part 7 byte-identical: **YES** (`b0e41eba01ad3f0b15dbca87fa8ddbb6…`)
- Full hash and per-question deep diff: see `E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3.md`.

## Exam 2 confirmation

**Exam 2 was not touched.** No file under `EXAM-02`, `05_OUTPUTS_REGENERATED_E02_v1_1_3/` or any E02 brief/blueprint was read for generation or written by this patch.

## Safety

- No Supabase read or write
- No production write, no publish
- No scale-up (Exam 1 only, 7 parts)
- All parts remain `PENDING_HUMAN_REVIEW`
- Baseline `05_OUTPUTS_REGENERATED_v1_1_2/` untouched

**STOPPED after patch + validation + diff + reports.**

## Open items for the teachers

- **Part 1 — Example (0):** The example has the same leak pattern the teachers flagged in Q2: "but suddenly finds its usual way blocked (0) ___" with key "suddenly". The example was not named in the feedback, so it was left untouched. Recommend fixing in the next authorised pass.
- **Part 1 — Q5 and Q7 keys:** Q5 now keys "combines" while the frozen Q7 keys "combining". The echo is mild (finite verb vs gerund, two sentences apart) but Q7 was not flagged, so it was not touched.
- **Part 2 — Q12 and Q16:** Both follow the teacher rewrites exactly. "when" is a natural alternative at Q12 and "closer" at Q16; recorded as accepted alternatives for the teacher to confirm rather than re-engineered.
- **Part 2 — Q13:** The teacher noted the gap is easy for B2 but prescribed "was" as the canonical answer. The prescription was followed; raising the difficulty would need a new brief-level decision.
- **Part 3 — Title:** The passage no longer frames the activity as a game, but the working title "Games that make practice feel different" is brief metadata and was not flagged, so it is unchanged. Worth a decision in the next pass.
