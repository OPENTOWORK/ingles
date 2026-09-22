# RUOE naturalness-first architecture proposal

**Version:** v1. Design only. Not implemented. `en-GB-v1` is not activated. No prompt row is changed.

The future engine obeys this rule, in British English, in every generation and linguistic prompt:

**Naturalness takes priority over preserving a planned target. If a target cannot be realised in completely natural British English, discard or replace the target. Do not rewrite the English to save it.**

The judge is:

**Would a competent British English speaker naturally produce this sentence if it were not part of an exam?**

If no, reject the item.

---

## 1. What stays

| | Item |
|---|---|
| **KEEP** | Topic Bank, Content Briefs, Brief Map, Usage History, Style Card IDs `SC-01`–`SC-06`, Transformation Family IDs |
| **KEEP** | Part 6 Architecture v2 (already content-first in the prompt) |
| **KEEP** | Part 4 metadata normalisation and marking-point partition repair |
| **KEEP** | Mechanical validators: counts, letters, one word, 2–5 Cambridge words, keyword unchanged, gap markers, schema |
| **KEEP** | Severity hierarchy and `__needsReview` save gate |
| **KEEP** | Approved briefs, blueprints, and existing exam JSON |
| **KEEP** | Current resolver as `legacy`. `useCodePrompts` stays `false` until a later, explicit switch |
| **MODIFY** | The *order* inside a future Parts 1–4 layer, not the IDs those parts point at |
| **ADD** | A versioned layer (`ruoe-natural-v1`) that is not imported by `resolveEffectiveExamPartGenerationPrompt` yet |
| **ADD** | Independent option checks (Part 1), discovery-after-prose (Parts 2–3), semantic pass (Part 4) |
| **DEPRECATE** | Nothing in production yet. Do not delete the August 2026 rows or the current code prompts |

Listening is not rebuilt. It is the evidence for order of work, not a template to paste.

---

## 2. Shared generation contract (proposed prompt text)

This block would sit above every part prompt in `ruoe-natural-v1`. It is not to be translated.

```
Think, evaluate, and write in British English throughout.
Write the prose as if it were not an exam. Only then decide what can be tested.
Naturalness takes priority over preserving a planned target.
If a collocation, grammar word, base word, derivation, keyword, or transformation family cannot be hosted by a sentence a competent British English speaker would actually produce, discard that target and choose another.
Do not warp the sentence to keep the target.
Ask: "Would a competent British English speaker naturally produce this sentence if it were not part of an exam?"
If the answer is no, reject the item.
```

---

## 3. Part pipelines

### Part 1

**CURRENT**

Stored prompt (what production runs) plus one JSON call:

passage with gaps already in it, and four options whose job is to fail a collocation or partnership  
→ mechanical check (8 items, one word, key spread)  
→ blind solve asks for the best letter  
→ rubric may say “revise” without substituting each option

The file on disk adds a v1.2 line that the database row does not contain. Neither version substitutes A–D independently.

**PROPOSED**

```
natural article, no gaps, inside the Content Brief and Style Card
→ mark up to eight places where one word is the only natural British choice
→ if a place has two natural words, skip it
→ write three distractors that each FAIL the substitution test
→ if any distractor still survives, discard that gap and pick another place
→ only then cut the key words out and number the gaps
→ independent A/B/C/D validator (section 4)
→ existing mechanical validator
→ existing blind “best letter” solver kept as a second opinion, not the uniqueness test
```

The knowledge-type mix (noun, adjective, preposition, and so on) is a **filter on which discovered gaps to keep**, not a list that forces eight sentences into existence.

### Part 2

**CURRENT**

One call. The prompt lists grammar categories that must appear and requires gaps `(9)`–`(16)` in the passage. Uniqueness is a self-check in that prompt. There is no “write the text, then remove words” function.

**PROPOSED**

```
natural continuous article, no gaps
→ list function words whose removal leaves exactly one grammatical British completion
→ reject relatives, linkers, and prepositions that have a twin (who/that, though/however)
→ choose eight from different categories
→ if a required category has no natural site, drop that category for this paper
→ delete those eight words and number the gaps
→ a second model, which did not write the text, proposes every other one-word completion
→ any second survivor is QUALITY_FAIL
```

Benefits: the article is not built around eight predetermined slots. The category mix still happens, but only where the prose already has a unique word.

Risks: a natural article may not offer eight unique, varied function-word sites. The paper then needs another paragraph or a new article, which costs a call. A model that both writes and “finds” gaps can still cheat; the second model and a small deterministic list (defining `who`/`that`, paired linkers) are required. Do not drop the existing open-cloze mechanical checks.

This order is safer than the current one **if** the uniqueness pass is independent. It is not automatically safer if the same call both writes the text and declares the gaps unique.

### Part 3

**CURRENT**

Prompt says “Natural sentence first, transformation second,” but stem and answer are returned together, quotas demand difficult derivations, and repair invents a new stem for the same gap.

**PROPOSED**

```
natural passage, every word already the right word
→ find words that are genuine word-family transformations in that sentence
→ assign the base word by reversing a real morphological step
→ morphology validator
→ naturalness validator on the untouched sentence
→ uniqueness: no second derived form fits
→ adversarial read of the gapped line
```

Morphology validator, as instructions:

```
The answer must be one word.
It must be formed from the given base by prefix, suffix, or a real change of shape (long → length).
It must not contain a second lexeme. DECIDE → decision-making fails because "making" is a separate word.
The word class in the sentence must be the class of that derived word.
The sentence with that word must be something a British writer would publish with no exam in view.
If the only way to use the base is an unnatural phrase, discard the base.
```

“These actions are not powerless” fails the naturalness validator even if `POWER → powerless` is morphologically direct. The quota for a negative form does not keep the item.

### Part 4

**CURRENT**

Production: one call emits sentences, keyword, family, and marking points together. The prompt says naturalness first and then demands the family fields.

Pilot: blueprint fixes `family_id`, keyword, and `target_structure`, then asks for new sentences.

Mechanical checks (2–5 words, keyword unchanged, partition) can pass while sentence 2 is not the same proposition as sentence 1.

**PROPOSED**

```
two natural sentences that already mean the same thing, with no keyword chosen yet
→ only then see whether a Transformation Family that is on the approved list can express that pair in 2–5 words
→ if it cannot, keep the meaning and change the family, or discard the pair
→ keyword and marking points are read off the finished answer
→ mechanical pass (existing)
→ semantic pass (section 5), which cannot be overruled by the mechanical pass
```

Family IDs stay. They are labels for a pair that already works, not a mould the sentences must fill. The pilot blueprint may still **prefer** a family. It may not force a sentence that fails the exam-free test. That is a change of policy on the blueprint path, not a change of the ID list.

---

## 4. Where the Part 1 uniqueness check lives

Use more than one layer. A single prompt line is what production already has (“if two are defensible, redesign”), and ambiguous items still appear.

| Layer | Role |
|---|---|
| **Generation** | Discover the gap from finished prose. Do not accept a distractor the writer only calls “less idiomatic.” |
| **Post-generation linguistic validation** | **Primary gate.** A fresh judge substitutes A, B, C, and D separately. This is the check that may emit `QUALITY_FAIL`. |
| **Adversarial / blind best-letter solver** | Keep the current solver as a disagreement signal. It must not be the uniqueness test, because “best” hides a second natural option. |
| **Local repair** | If two options survive, replace a distractor or move the gap. Do not tweak the sentence until the key “wins.” If repair cannot get to one survivor, regenerate the item from the prose. |

Proposed validator instruction (British English):

```
Do not choose the best answer.
For option A, write the complete sentence with A in the gap.
Answer only these questions:
- Is this sentence grammatical?
- Would a competent British English speaker produce it if it were not an exam item?
- Is the meaning defensible in this context?
- Is the collocation or fixed expression acceptable here?
Repeat independently for B, then C, then D.
Do not compare options while you judge one of them.
A distractor is not saved by being less idiomatic than the key.
If two or more options are grammatical, natural, and semantically defensible, the item is a QUALITY_FAIL.
Example: "have an effect on" and "have an impact on" both survive. Reject the item.
```

Suggested home for the new function, when implementation is allowed: a new module beside `examPartQualityValidator.js`, called only from the versioned layer. Do not replace `blindSolve` in the legacy path in the same change.

---

## 5. Part 4 semantic pass

Two passes, neither allowed to vouch for the other.

**Mechanical (existing, keep):** keyword unchanged, 2–5 Cambridge words, gap placement, two marking points that partition the answer, no second grammatical route in `fullAnswers`.

**Semantic (new), instruction:**

```
Read sentence 1. Read the completed sentence 2. Ignore the keyword and the word count.
Are these the same proposition?
- Is every important claim still there?
- Is tense and aspect the same where it changes the facts?
- Is modality the same (must / might, have to / could)?
- Is the same person or thing responsible?
- Are the same objects and referents present?
- Is the comparison the same scope (all / most, more than / as … as)?
- Has any fact been added or removed?
A mechanical pass does not excuse a semantic miss.
If any answer is no, QUALITY_FAIL the item and replace the pair. Do not stretch the English to keep the keyword.
```

Sit this judge after marking-point repair, not inside it. Repair may fix a partition. It must not be allowed to declare meaning checked. The production generate path should call it for Part 4 the way it already calls the Part 1 quality module. Today Part 4’s AI review is not on that path.

---

## 6. What not to copy from Listening

- Do not add a three-idiom quota. That is target-first pressure of a different kind.
- Do not vary American and Australian voices into RUOE articles.
- Do not remove briefs or Style Card IDs. Use them as the editorial frame for the **ungapped** prose.
- Do not turn off mechanical validators because Listening has fewer linguistic ones.

Copy only the order: a complete natural text exists before any exam hole is cut, and a later edit must not sacrifice that text to save a target.
