# RUOE naturalness-first validation spec

**Version:** v1. Specification only. No validator is wired up.

Judges that call a model use the instructions below in British English. Deterministic checks stay in code and do not depend on the model marking its own homework.

A mechanical pass never cancels a linguistic or semantic fail.

---

## 1. Shared naturalness gate

Apply to every student-facing sentence in Parts 1–4 after the item is assembled, including the sentence with the key restored.

Instruction:

```
Would a competent British English speaker naturally produce this sentence if it were not part of an exam?
Answer yes or no. If no, name the phrase that sounds translated, forced, or built for the gap.
Do not suggest keeping it because the target is useful.
```

Fail level: `QUALITY_FAIL`. Repair must change or drop the target. It must not “improve” the sentence just enough to keep the same key.

---

## 2. Part 1 — four independent options

### Deterministic

- Exactly four options, labels A–D, one word each, no duplicates. (Existing `validateB2Part1Strict`.)
- Key letter is one of A–D.
- No option is the empty or placeholder word.

These do not judge naturalness.

### Linguistic validator (required)

Input: the full passage, one item, options separated.

Instruction: the substitution text in `RUOE_NATURALNESS_FIRST_ARCHITECTURE_PROPOSAL_v1.md` section 4. The model returns JSON only:

```json
{
  "options": [
    {
      "letter": "A",
      "sentence": "full sentence with A filled in",
      "grammatical": true,
      "naturalBritishEnglish": true,
      "semanticallyDefensible": true,
      "acceptableCollocation": true
    }
  ],
  "survivors": ["A", "B"],
  "verdict": "fail"
}
```

Rules for the harness, not for the model’s goodwill:

- `verdict` is computed by code. If two or more options have `grammatical`, `naturalBritishEnglish`, and `semanticallyDefensible` all true, code sets `QUALITY_FAIL`.
- Ignore any model field that says the key is “more idiomatic.”
- `have an effect on` and `have an impact on` in the same frame must fail this harness even if the model prefers one.

### Blind best-letter solver (secondary)

Keep the current `blindSolve` call. A mismatch with the key is still a finding. Agreement with the key does **not** clear a substitution fail.

### Collocation and variety

- Variety of word class remains a deterministic soft check (existing verb-list warning) plus a count of knowledge types if the generator labels them.
- A labelled “collocation item” whose distractor survives substitution fails, whatever the label says.

---

## 3. Part 2 — open cloze

### Deterministic

- Eight gaps, numbers 9–16, one-word answers, passage length. (Existing.)
- Hard reject if the gapped token’s context matches a known twin pattern the current prompt already names, where the pattern can be seen without a model: defining relative `who`/`that` slot, and the answer key listing two words. The existing prompt text is the source of these pairs; the check only fires when a second word is actually present in `modelAnswers` or in the solver’s alternative list.

### Independent completion

A model that did not write the passage receives the gapped text and no key. Instruction:

```
For each gap, give every one-word completion you would accept in British English.
Do not pick a favourite.
If only one word is fully correct, return that word and an empty alternative list.
```

Code marks `QUALITY_FAIL` when the alternative list is non-empty, or when the solver’s word is not the key and both are function words that fit.

### Variety

After gaps are chosen, code counts categories (article, preposition, auxiliary, pronoun, linker, and the rest of the existing Part 2 list). A missing category is a warning, not a reason to force a gap into an unnatural site.

---

## 4. Part 3 — word formation

### Deterministic morphology

- Answer is one word and is not equal to the stem (existing).
- Answer’s letters must be explainable as the stem plus a prefix and/or suffix, or a known shape change already cited by the prompt (`long`/`length`, `decide`/`decisive`, `anxious`/`anxiety`). If a simple affix check cannot see the relationship, send the pair to the morphology judge rather than failing closed.
- Reject if the answer contains a hyphenated second lexeme or an obvious second word (`decision-making`). That is the `DECIDE → decision-making` failure.

### Naturalness and class

Instruction:

```
The sentence is already written. The derived word is in the gap.
Is this the word a British writer would have used here, with no exam in view?
What word class does the gap require? Does this derived word have that class?
Is the derived word formed only from the base, with no extra lexeme?
If the phrase is unnatural, say so. Do not defend it because the prefix was required.
```

Code fails the item if `natural` is false or `directDerivation` is false.

### Uniqueness

Same independent style as Part 1: are there two derived forms of this stem that both fit? If yes, `QUALITY_FAIL`.

---

## 5. Part 4 — mechanical and semantic, separate

### Mechanical (existing modules)

- Keyword unchanged in every full answer.
- 2–5 Cambridge words (`countCambridgeKeyWordWords`).
- Exactly two marking points, partition with no leftover (`ruoePart4MarkingPointRepair.js`).
- Controlled contractions only.
- Metadata labels that contradict the canonical answer (`validatePart4MetadataCoherence`).

Pass or fail this block on its own.

### Semantic (new)

Instruction: the proposition checklist in the architecture proposal, section 5. The model returns booleans for proposition, tense/aspect, modality, agency, referents, comparison scope, and added/lost information, plus the two sentences it compared.

Code sets `QUALITY_FAIL` if any boolean that should hold is false.

The item’s overall status is fail if **either** block fails. A 2–5 word keyword answer with a valid partition and a shifted `must`/`might` is a fail.

### Transformation distance

Keep `inferTransformationDistance` as a report. It does not override the semantic fail. A set that is entirely `lexical_substitution` remains a quality warning, as it is today.

---

## 6. What the model is not allowed to settle alone

| Check | Who decides |
|---|---|
| Option count, word count, keyword shape, gap numbers | Code |
| “This option is natural British English” | Model, one option at a time, then code counts survivors |
| “The key is the best one” | Not accepted as a pass |
| “The marking points partition” | Code |
| “Sentence 2 means sentence 1” | Model booleans, code combines them; a true mechanical pass is ignored |
| Final `QUALITY_FAIL` | Code, from those outputs |

Human review still samples items (see the test plan). It is not replaced by the model.
