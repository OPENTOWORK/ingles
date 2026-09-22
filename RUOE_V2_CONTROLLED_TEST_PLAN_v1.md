# RUOE v2 controlled test plan

**Version:** v1. Plan only. Do not run it until implementation of `ruoe-natural-v1` is explicitly requested.  
**This plan does not switch production, does not write `levels_exam_part_prompt_overrides`, and does not set `useCodePrompts`.**

---

## 1. Purpose

Compare two engines on the **same** content direction:

- **A. Legacy.** What production does today: `useCodePrompts: false`, so the stored B2 prompt row is the user prompt. Same mechanical validators as now.
- **B. Naturalness-first.** The proposed order in `RUOE_NATURALNESS_FIRST_ARCHITECTURE_PROPOSAL_v1.md`, with the checks in `RUOE_NATURALNESS_FIRST_VALIDATION_SPEC_v1.md`.

Same brief, same Style Card ID, same Transformation Family preferences, same topic. Different order of writing and a different linguistic gate.

No arm grades itself. The writer model is not the judge model. Deterministic checks do not call a model.

---

## 2. Sample

Use approved pilot briefs that already exist on disk. Do not invent a new brief bank.

Minimum:

| Part | Briefs | Notes |
|---|---|---|
| 1 | 2 | Include one brief whose working title is concrete, not a theme label |
| 2 | 2 | Same |
| 3 | 2 | Same |
| 4 | 2 | Use the approved blueprint slots as **preferences**, not as permission to force a bad sentence on arm B. Arm A pilot-equivalent may keep the current blueprint lock so the comparison is honest |

One extra Part 1 item set should be built, on paper, around `have an effect on` / `have an impact on`, to confirm the harness fails it. That pair is a fixture, not a generated exam.

Outputs stay local. They are not saved through `saveLevelExamPartFromPreview`.

---

## 3. How each arm is called

**Arm A:** `resolveEffectiveExamPartGenerationPrompt` against the existing row, or a frozen copy of that row saved as a local text file at the start of the test so a later edit cannot move the baseline. Do not update the row to make the copy.

**Arm B:** local prompts only, passed in as `userPrompt` / `systemPrompt` the way the pilot already does. Do not store them in Supabase.

Same model name for writing on both arms. A **different** model, or a second call with the writer’s answer key stripped, performs linguistic judgement. Record both model names.

---

## 4. Scores

### Part 1

| Measure | How | Pass |
|---|---|---|
| Four-option uniqueness | Substitution harness. Code counts survivors. | Exactly one survivor |
| Collocation | Each survivor must be an acceptable partnership; a second natural partnership fails | One |
| Lexical variety | Existing category / word-class counts across 8 items | At least the current soft mix, without forcing a gap |
| Blind solve | Current best-letter solver, key hidden | Report disagreements. Do not treat agreement as uniqueness |
| Exam-free sentence | Shared naturalness gate on the restored sentence | Yes |

### Part 2

| Measure | How | Pass |
|---|---|---|
| Natural text | Exam-free gate on the passage with answers restored | Yes |
| Gap uniqueness | Independent one-word list, key hidden | No alternatives |
| Grammar variety | Code counts categories | Report the mix. A missing category is a note, not a forced rewrite |

### Part 3

| Measure | How | Pass |
|---|---|---|
| Direct morphology | One word, stem relationship, no extra lexeme | `decision-making` style answers fail |
| Naturalness | Exam-free gate on the sentence with the derived word | Yes |
| Word-class variety | Code, from tags or a small class list | Report only |

### Part 4

| Measure | How | Pass |
|---|---|---|
| Semantic equivalence | Separate semantic booleans | All required booleans true |
| 2–5 words and keyword | Existing counters | Pass |
| Transformation distance | Existing `inferTransformationDistance` | Report. Not a veto by itself |
| Accepted variants | Existing variant checks | No second grammatical route |

An item that passes 2–5 words and fails modality is a **fail for the arm**, not a partial pass.

---

## 5. Human sample

After the automatic scores, a person reads a fixed sample: every `QUALITY_FAIL`, plus four items per part that the harness marked pass (two from A, two from B).

The reader answers only:

1. Would you say or publish this sentence with no exam attached?
2. For Part 1, does any other option still work?
3. For Part 4, do the two sentences mean the same thing?

Disagreement with the harness is recorded. It does not silently change the score. If the human rejects a harness pass more than occasionally, the harness instruction is wrong and the test is not a reason to switch engines.

---

## 6. What the test is allowed to conclude

- Arm B may be tried on a **new** local preview only if, on this sample, it has fewer substitution fails and fewer semantic fails than arm A, and the human sample does not regularly overturn harness passes.
- Arm B may not replace the database prompts, the legacy resolver, or published exams as part of this test.
- If arm B is cleaner but cannot fill eight gaps without inventing targets, report that as a coverage failure. Do not “fix” it by going back to target-first writing inside the test.

---

## 7. Explicit stops

- Do not edit `src/lib/draloAiExamPrompts.js` or the validators to run this plan.
- Do not call `saveExamPartPromptOverride` or `sync-b2-ruoe-prompts-from-code.mjs`.
- Do not flip `useCodePrompts`.
- Do not regenerate a stored exam.
- Do not activate `en-GB-v1` or `ruoe-natural-v1` on the production path.
