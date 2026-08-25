# E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3

Generated: 2026-08-21T13:20:19.030Z

- Exam: **RUOE-PILOT-E01**
- Baseline: `05_OUTPUTS_REGENERATED_v1_1_2/EXAM-01` (preserved, not modified)
- Patched output: `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/EXAM-01`
- Feedback source: Audit Pilot Test 1 .docx (second human review, Alicia + SR)
- Patchable Parts: 1, 2, 3, 5, 6 · Frozen Parts: 4, 7

---

## CHANGE-SCOPE DIFF

### Part 1

_Validator after patch: mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 3_

#### Q2 — passage sentence

**Before**

```text
For example, a bird might try different ways to open a container before finally succeeding (2) ___.
```

**After**

```text
For example, a bird might try several ways of opening a container and, (2) ___ doing so, it gradually learns which movements are useless.
```

**Teacher feedback that caused the change:** Q2: "la respuesta es finally, pero justo esa misma palabra ya aparece en la frase de dicho hueco… Habría que eliminar ese finally". Alternative direction: test a B2 fixed expression such as "in doing so".

**Reason:** The key was visible immediately before the gap, so the item was unsolvable as designed. The sentence was re-gapped around the fixed expression "in doing so", which removes the leak and tests a genuine word combination instead of an obvious adverb choice.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 3

#### Q2 — options and key

**Before**

```text
accident / optionally / finally / slowly — key "finally"
```

**After**

```text
in / at / to / on — key "in"
```

**Teacher feedback that caused the change:** Q2: options "parecen demasiado básicas"; proposal "in doing so / at doing so / to do so / on doing so".

**Reason:** Teacher intent preserved, but Part 1 options must be single words in this pipeline (multi-word options are a hard validation failure), so "doing so" stays in the text and the gap sits on the preposition. The option set is exactly the teacher's four variants reduced to their distinguishing word, which makes this the dependent-preposition / fixed-expression item the review found missing. "gradually" in the same clause rules out the temporal reading of "on doing so".

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 3

#### Q5 — options and key

**Before**

```text
replace / copy / separate / mix — key "mix" ("sensory awareness mixes with trial-and-error")
```

**After**

```text
combines / connects / joins / relates — key "combines"
```

**Teacher feedback that caused the change:** Q5: "la respuesta debe ser mixes porque el sujeto sensory awareness aparece singular. Además, sensory awareness mixes with trial-and-error no es la colocación más natural". Direction: combines / connects / joins / relates.

**Reason:** Fixes both faults at once: every option is third-person singular, so it agrees with the singular subject, and "combines with … to produce" is the natural British English collocation. Option order was set so the Part 1 key spread covers A–D.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 3

#### Q6 — passage sentence

**Before**

```text
In short, the interesting part is not if the animal solves the task but how its behaviour (6) ___ to meet the challenge.
```

**After**

```text
In short, the interesting part is not whether the animal solves the task but how its behaviour (6) ___ to meet the challenge.
```

**Teacher feedback that caused the change:** Q6: "whether es más recomendable por naturalidad".

**Reason:** "not whether X but how Y" is the natural British English pairing. Q6 options and key were re-checked afterwards and still work: "changes to meet the challenge" remains the only natural completion, so the key stays A.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 3

#### Q8 — options and key

**Before**

```text
natural / automatic / certain / intelligent — key "intelligent" ("intelligent intelligence")
```

**After**

```text
genuine / truthful / sincere / honest — key "genuine"
```

**Teacher feedback that caused the change:** Q8: "los distractores son muy fáciles… al estudiante no le hace ni falta entender el texto"; "hay un fallo porque la respuesta dice ser D: intelligent, pero quedaría intelligent intelligence". SR: use options close in meaning.

**Reason:** Removes the impossible collocation and replaces an easy set with four near-synonymous adjectives about authenticity. All are plausible before reading the context, but only "genuine intelligence" is a natural collocation, so the item now tests semantic distinction — the category the review found missing.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 3

---

### Part 2

_Validator after patch: mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 9_

#### Example (0) — passage

**Before**

```text
a busy market bustles (0) ___ just before sunrise
```

**After**

```text
a busy market bustles (0) ___ before sunrise
```

**Teacher feedback that caused the change:** Question 0: "la respuesta just ya aparece en el texto".

**Reason:** The leaked word after the gap was deleted so the example reads "bustles just before sunrise" only once the answer is supplied. The example answer itself is unchanged.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 9

#### Q9 — passage and key

**Before**

```text
but soon realised the locals (9) ___ little interest in such treats early in the morning. → key "have"
```

**After**

```text
but soon realised that the locals had very (9) ___ interest in such treats early in the morning. → key "little"
```

**Teacher feedback that caused the change:** Q9: proposed rewrite "but soon realised that the locals had (9) ___ interest…", answer "little"; also the tense debate ("had" vs "showed"/"show").

**Reason:** Adopts the teacher rewrite, which settles the tense argument by fixing "had" in the text. "very" was added because the bare frame accepted both "little" and "no" as equally natural answers; "very little" leaves a single defensible key.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 9

#### Q12 — passage and key

**Before**

```text
Her advice was simple but revealing: it’s best (12) ___ use these herbs fresh, to bring out their full flavour. → key "to"
```

**After**

```text
Her advice was simple but revealing: (12) ___ you want the fullest flavour, it’s best to use these herbs fresh. → key "if"
```

**Teacher feedback that caused the change:** Q12: proposed rewrite "Her advice was simple but revealing: (12) ___ you want the fullest flavour, it's best to use these herbs fresh", answer "if".

**Reason:** Adopts the teacher rewrite verbatim. Note for review: "when" also reads naturally in this frame, so it is recorded as an accepted alternative pending the teacher’s decision.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 9

#### Q13 — passage and key

**Before**

```text
it became clear that the market (13) ___ more than just buying food; it builds community connections. → key "is"
```

**After**

```text
it became clear that the market (13) ___ not simply about buying food; it also helped to build community spirit. → key "was"
```

**Teacher feedback that caused the change:** Q13: proposed rewrite "the market (13) ___ not simply about buying food; it also helped to build community connections", answer "was"; plus "community connections - this is not natural English. I would change it to community spirit".

**Reason:** Adopts the teacher rewrite and her preferred noun phrase. The surrounding past narrative ("it became clear", "it also helped") now forces "was", so the key is unique.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 9

#### Q14 — passage

**Before**

```text
People shared advice about how (14) ___ best to store food or combine flavours → key "best"
```

**After**

```text
People shared advice about how (14) ___ to store food or combine flavours → key "best"
```

**Teacher feedback that caused the change:** Q14: "best appears exactly before the gap where the answer is meant to be (like a typo)".

**Reason:** Deleting the duplicated word leaves the fixed expression "how best to do something", which is a valid and non-trivial B2 open-cloze gap, so the key could stay unchanged.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 9

#### Q15 — passage and key

**Before**

```text
means looking beyond tourist favourites (15) ___ paying attention to everyday actions. → key "but"
```

**After**

```text
means looking beyond tourist favourites (15) ___ order to observe local behaviour. → key "in"
```

**Teacher feedback that caused the change:** Q15: "the expression looking beyond is usually paired with and or to - in this case I would perhaps change the ending of the sentence to tourist favourites to observe local behaviour".

**Reason:** The teacher ending removed the old gap, so a new gap was created in the same zone. "in order to" is a fixed expression with only one possible word, which keeps eight gaps (Q9–Q16) and adds a grammar category the validator reported as missing.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 9

#### Q16 — passage

**Before**

```text
about seeing how food ties people (16) ___. → key "together"
```

**After**

```text
about seeing how food brings people (16) ___. → key "together"
```

**Teacher feedback that caused the change:** Q16: "I would suggest changing this to seeing how food brings people together".

**Reason:** "brings people together" is the natural collocation; "ties people together" is not idiomatic. The key is unchanged.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 0 · warnings 9

---

### Part 3

_Validator after patch: mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 2 · warnings 0_

#### Opening sentence and example (0)

**Before**

```text
In an informal learning club, a group gathers to play a cooperative game designed to encourage skill (0) ___ (PRACTICE)_ (PRACTICE). → example answer "practice" (no transformation)
```

**After**

```text
In an informal learning club, a group gathers to take part in a cooperative activity designed to encourage everyone to (0) ___ (PRACTICE) specific skills. → example answer "practise"
```

**Teacher feedback that caused the change:** Example: "I would change this to In an informal learning club, a group gathers to take part in a cooperative activity - I would avoid the use of the word game as this B2 is not for schools"; "I also question the structure of the answer… I would change this to something like designed to encourage specific skill practice or designed to encourage the practice of specific skills".

**Reason:** Removes the school-ish framing, deletes the duplicated (PRACTICE) marker, and makes the example a real transformation: PRACTICE → practise is a genuine noun-to-verb derivation and a British English spelling point, which the previous no-transform example lacked.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 2 · warnings 0

#### Terminology — "players"

**Before**

```text
players must explain a strategy … let players explore solutions
```

**After**

```text
participants must explain a strategy … let participants explore solutions
```

**Teacher feedback that caused the change:** L2/L6: "players - I would use the word participants".

**Reason:** Applies the requested adult-register terminology at both occurrences.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 2 · warnings 0

#### Collocation — matching

**Before**

```text
depends on matching the activity with the specific skill being practised
```

**After**

```text
depends on matching the activity to the specific skill being practised
```

**Teacher feedback that caused the change:** "matching the activity with the specific skill being practised - in the context I think matching the activity to is better suited".

**Reason:** "match A to B" is the natural collocation for pairing an activity with its purpose.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 2 · warnings 0

#### Practice wording

**Before**

```text
a (23) ___ (DIFFER) way to repeat practice exercises
```

**After**

```text
a (23) ___ (DIFFER) way to approach practical exercises
```

**Teacher feedback that caused the change:** "way to repeat practice exercises - perhaps practical exercises".

**Reason:** Adopts the suggested wording; "approach" replaces "repeat" so the phrase reads naturally, and the following clause still carries the repetition idea.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 2 · warnings 0

#### Q20 — stem and answer (-ly adverb)

**Before**

```text
(20) ___ (OBSERVE) → "observant" ("the teacher’s role is largely observant")
```

**After**

```text
(20) ___ (OCCASION) → "occasionally" ("the teacher intervenes only occasionally")
```

**Teacher feedback that caused the change:** "there is no answer with a prefix or -ly".

**Reason:** Supplies the missing -ly adverb transformation through a two-step derivation (occasion → occasional → occasionally) while keeping the original pedagogical point that the teacher steps back.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 2 · warnings 0

#### Q22 — stem and answer (prefix/negative)

**Before**

```text
(22) ___ (USE) → "useless"
```

**After**

```text
(22) ___ (HELP) → "unhelpful"
```

**Teacher feedback that caused the change:** "there is no answer with a prefix or -ly".

**Reason:** Supplies the missing genuine prefix/negative formation. "the activity could be unhelpful or distracting" keeps the original meaning of the sentence.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 2 · warnings 0

#### Register consistency — "game"

**Before**

```text
the game’s value … the game could be … the best use of games in learning
```

**After**

```text
the value of the exercise … the activity could be … the best use of such activities in learning
```

**Teacher feedback that caused the change:** Consequence of "I would avoid the use of the word game as this B2 is not for schools".

**Reason:** Required for coherence once the opening was changed to "a cooperative activity"; leaving "game" elsewhere would have contradicted the reworked example and re-introduced the register problem.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 2 · warnings 0

---

### Part 5

_Validator after patch: mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 18 · warnings 0_

#### Question order (Q31–Q36)

**Before**

```text
Q31 global · Q32 detail · Q33 inference · Q34 attitude (¶1) · Q35 purpose · Q36 reference
```

**After**

```text
Q31 attitude (¶1) · Q32 detail (¶2) · Q33 inference (¶3) · Q34 purpose (¶6) · Q35 reference (¶7) · Q36 global
```

**Teacher feedback that caused the change:** "the order seems random - Q34 is out of order (the exact phrase appears at the start of the text)".

**Reason:** Questions now follow passage progression, with the whole-text question last as Cambridge normally places it. Prompts, evidence and rationales travelled with their items; only numbering changed.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 18 · warnings 0

#### Answer key distribution

**Before**

```text
B · C · B · B · C · B (only two letters used)
```

**After**

```text
A · C · D · B · A · C (all four letters used)
```

**Teacher feedback that caused the change:** "The answers are all B or C - no A or D".

**Reason:** Options were reordered inside the affected items only; no correct answer was changed conceptually and no distractor content was altered, so difficulty is unaffected.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 18 · warnings 0

#### Passage ¶3 wording

**Before**

```text
he worried that asking for help would make him seem unintelligent or careless
```

**After**

```text
he worried that asking for help would make him seem silly
```

**Teacher feedback that caused the change:** "unintelligent doesn’t sound natural here and careless is out of place here - I would change this to make him seem silly".

**Reason:** Adopts the suggested wording. The correct option and evidence for the item that depends on this sentence (now Q33) were updated to match, and the option is a paraphrase rather than a lift.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 18 · warnings 0

#### Passage ¶4 wording

**Before**

```text
I found myself not just managing logistics but enjoying this role more than I expected
```

**After**

```text
I found myself enjoying this role far more than I expected
```

**Teacher feedback that caused the change:** "I would just reduce this to I found myself enjoying this role far more than I expected".

**Reason:** Adopts the suggested wording; no item depends on the deleted clause.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 18 · warnings 0

#### questionType metadata

**Before**

```text
"main-idea / global" and "attitude / opinion / tone"
```

**After**

```text
"global" and "attitude"
```

**Teacher feedback that caused the change:** Consequence of reordering and re-tagging the affected items.

**Reason:** The previous free-text labels were not in the validator vocabulary and produced "unknown questionType" warnings. Metadata only — nothing the candidate sees changed.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 18 · warnings 0

---

### Part 6

_Validator after patch: mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 3 · warnings 0_

#### Whole Part — Architecture v2 rebuild

**Before**

```text
Article assembled around pre-written sentences; gap (37) appeared twice in the passage; option A fitted several gaps; gap (38) had weak cohesion clues.
```

**After**

```text
New continuous article written first, six genuine cohesion points identified, the six sentences occupying them physically removed to create gaps (37)–(42), one plausible unused sentence added, and A–G shuffled.
```

**Teacher feedback that caused the change:** "the sentences to be introduced read disjointed - is there a way to get the AI to create the text and then remove the sentences rather than create random sentences that could fit into the text?"

**Reason:** Rebuild authorised for Part 6 only. CB-PILOT-005, topic, Style Card SC-04 and the reflective first-person intent are preserved; the problematic sentences were not reused.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 3 · warnings 0

#### Q37 — antecedent mismatch

**Before**

```text
Gap (37) followed by "Many weren’t even full", while the correct sentence referred to the objects rather than the boxes.
```

**After**

```text
Gap (37) followed by "Opening them only made matters worse, because most held nothing more than odds and ends…", with the correct sentence "Each of these boxes was labelled ‘keep’…" referring unambiguously to the boxes.
```

**Teacher feedback that caused the change:** Q37: "right after the gap we read Many weren’t even full - but the answer is referring to the objects not the boxes".

**Reason:** Both the sentence before the gap ("towers of cardboard") and the sentence after it ("them", "most") now point to the boxes, so the reference chain is consistent.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 3 · warnings 0

#### Q40 — lexical repetition

**Before**

```text
Gap (40) surrounded by "That was different from my expectation" and option E "That was different from most other items I’d brought… think differently about…".
```

**After**

```text
Gap (40) filled by "The mug and the scarf, by contrast, attracted no interest at all, even though I had privately expected them to go before the lamp.", followed by "…my guesses were poor."
```

**Teacher feedback that caused the change:** Q40: "How many times can we put different into two lines?"

**Reason:** The word "different" no longer appears anywhere in Part 6. The contrast is now carried by the lamp/mug-and-scarf comparison and the marker "by contrast" instead of repeated vocabulary.

**Validator result:** mechanical PASS · HARD 0 · quality-review HARD 0 · QUALITY 3 · warnings 0

---

## Part 1 items as normalised (A–D letters are assigned by the key-distribution balancer)

| Q | A | B | C | D | Key | Correct word | Touched by this patch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | gradually | basically | largely | frequently | **B** | basically | no (words unchanged; letter order rebalanced) |
| 2 | at | to | in | on | **C** | in | yes |
| 3 | adapting | relating | depending | preferring | **A** | adapting | no (words unchanged; letter order rebalanced) |
| 4 | make | involve | base | consider | **D** | consider | no (words unchanged; letter order rebalanced) |
| 5 | connects | combines | joins | relates | **B** | combines | yes |
| 6 | responds | reacts | returns | changes | **D** | changes | no (words unchanged; letter order rebalanced) |
| 7 | combining | competing | controlling | completing | **A** | combining | no (words unchanged; letter order rebalanced) |
| 8 | truthful | sincere | genuine | honest | **C** | genuine | yes |

---

## Part 6 gap map after rebuild

| Gap | Key | Removed sentence | Cohesion anchor |
| --- | --- | --- | --- |
| 37 | C | Each of these boxes was labelled ‘keep’, which told me nothing useful about what was actually inside. | back: "towers of cardboard" → forward: "Opening them only made matters worse…" |
| 38 | G | I had kept it ‘just in case’, although I could no longer remember what that case might be. | back: umbrella "never once opened" → forward: "stored for a future I had never actually described" |
| 39 | F | It was not a jumble sale, she explained, but a morning for mending what was broken and rehoming what was not. | back: "Ruth mentioned a swap and repair event" → forward: "That distinction mattered to me" |
| 40 | D | The mug and the scarf, by contrast, attracted no interest at all, even though I had privately expected them to go before the lamp. | back: "The lamp went first" → forward: "my guesses were poor" |
| 41 | A | It went home with me again, and I have stopped pretending that this was an oversight. | back: "twice I took it back" → forward: "Some things earn their place by meaning rather than use" |
| 42 | E | Put like that, the test sounds severe, but in practice it simply forced me to finish sentences I had been leaving unfinished for years. | back: "drafting a rule" → forward: "It has not turned me into a minimalist" |
| — | B | The community centre had put out tea and biscuits, which struck me as a generous touch for a Saturday morning. | **unused distractor** — topically plausible, no cohesion hook |

---

## UNCHANGED CONTENT VERIFICATION

### Frozen Parts (absolute freeze)

Copied with `fs.copyFileSync`; SHA-256 computed on the raw file bytes of source and destination.

| Part | File | Source SHA-256 | Patched SHA-256 | Identical |
| --- | --- | --- | --- | --- |
| 4 | `TBP-PILOT-EX01_Part4.json` | `cb670cf0f1ad69ce…` | `cb670cf0f1ad69ce…` | **YES** |
| 7 | `CB-PILOT-006_Part7.json` | `b0e41eba01ad3f0b…` | `b0e41eba01ad3f0b…` | **YES** |

### Locked metadata (patched Parts)

| Part | Field | Value | Unchanged |
| --- | --- | --- | --- |
| 1 | `exam_id` | "RUOE-PILOT-E01" | YES |
| 1 | `ruoe_exam_id` | "RUOE-PILOT-E01" | YES |
| 1 | `brief_id` | "CB-PILOT-001" | YES |
| 1 | `brief_version` | "1.0" | YES |
| 1 | `blueprint_id` | null | YES |
| 1 | `style_card_id` | "SC-01" | YES |
| 1 | `working_title` | "When animals solve a new problem" | YES |
| 1 | `part` | "Part 1" | YES |
| 1 | `part_number` | 1 | YES |
| 2 | `exam_id` | "RUOE-PILOT-E01" | YES |
| 2 | `ruoe_exam_id` | "RUOE-PILOT-E01" | YES |
| 2 | `brief_id` | "CB-PILOT-002" | YES |
| 2 | `brief_version` | "1.0" | YES |
| 2 | `blueprint_id` | null | YES |
| 2 | `style_card_id` | "SC-05" | YES |
| 2 | `working_title` | "The market that teaches you how a town eats" | YES |
| 2 | `part` | "Part 2" | YES |
| 2 | `part_number` | 2 | YES |
| 3 | `exam_id` | "RUOE-PILOT-E01" | YES |
| 3 | `ruoe_exam_id` | "RUOE-PILOT-E01" | YES |
| 3 | `brief_id` | "CB-PILOT-003" | YES |
| 3 | `brief_version` | "1.0" | YES |
| 3 | `blueprint_id` | null | YES |
| 3 | `style_card_id` | "SC-02" | YES |
| 3 | `working_title` | "Games that make practice feel different" | YES |
| 3 | `part` | "Part 3" | YES |
| 3 | `part_number` | 3 | YES |
| 5 | `exam_id` | "RUOE-PILOT-E01" | YES |
| 5 | `ruoe_exam_id` | "RUOE-PILOT-E01" | YES |
| 5 | `brief_id` | "CB-PILOT-004" | YES |
| 5 | `brief_version` | "1.0" | YES |
| 5 | `blueprint_id` | null | YES |
| 5 | `style_card_id` | "SC-03" | YES |
| 5 | `working_title` | "The volunteer job I chose for the wrong reason" | YES |
| 5 | `part` | "Part 5" | YES |
| 5 | `part_number` | 5 | YES |
| 6 | `exam_id` | "RUOE-PILOT-E01" | YES |
| 6 | `ruoe_exam_id` | "RUOE-PILOT-E01" | YES |
| 6 | `brief_id` | "CB-PILOT-005" | YES |
| 6 | `brief_version` | "1.0" | YES |
| 6 | `blueprint_id` | null | YES |
| 6 | `style_card_id` | "SC-04" | YES |
| 6 | `working_title` | "The boxes I thought I needed" | YES |
| 6 | `part` | "Part 6" | YES |
| 6 | `part_number` | 6 | YES |

### Question-level deep diff (patched Parts)

Per-question SHA-256 over the full question object. Part 6 is a whole-Part authorised rebuild, so every gap is expected to change.

| Part | Question | Question object | Answer key |
| --- | --- | --- | --- |
| 1 | Q1 | unchanged | unchanged (B) |
| 1 | Q2 | **changed** | unchanged (C) |
| 1 | Q3 | unchanged | unchanged (A) |
| 1 | Q4 | **changed** | **C → D** |
| 1 | Q5 | **changed** | **D → B** |
| 1 | Q6 | **changed** | **A → D** |
| 1 | Q7 | **changed** | **B → A** |
| 1 | Q8 | **changed** | **D → C** |
| 2 | Q9 | unchanged | **have → little** |
| 2 | Q10 | unchanged | unchanged (go) |
| 2 | Q11 | unchanged | unchanged (how) |
| 2 | Q12 | unchanged | **to → if** |
| 2 | Q13 | unchanged | **is → was** |
| 2 | Q14 | unchanged | unchanged (best) |
| 2 | Q15 | unchanged | **but → in** |
| 2 | Q16 | unchanged | unchanged (together) |
| 3 | Q17 | unchanged | unchanged (communication) |
| 3 | Q18 | unchanged | unchanged (frustration) |
| 3 | Q19 | unchanged | unchanged (learning) |
| 3 | Q20 | **changed** | **observant → occasionally** |
| 3 | Q21 | unchanged | unchanged (matching) |
| 3 | Q22 | **changed** | **useless → unhelpful** |
| 3 | Q23 | unchanged | unchanged (different) |
| 3 | Q24 | unchanged | unchanged (balanced) |
| 5 | Q31 | **changed** | **B → A** |
| 5 | Q32 | unchanged | unchanged (C) |
| 5 | Q33 | **changed** | **B → D** |
| 5 | Q34 | **changed** | unchanged (B) |
| 5 | Q35 | **changed** | **C → A** |
| 5 | Q36 | **changed** | **B → C** |
| 6 | Q37 | unchanged | **A → C** |
| 6 | Q38 | unchanged | unchanged (G) |
| 6 | Q39 | unchanged | **C → F** |
| 6 | Q40 | unchanged | **E → D** |
| 6 | Q41 | unchanged | **F → A** |
| 6 | Q42 | unchanged | **B → E** |

### Explicit confirmations

- Part 4 unchanged: **CONFIRMED** (byte-identical copy)
- Part 7 unchanged: **CONFIRMED** (byte-identical copy)
- Content Brief IDs unchanged: **CONFIRMED** (see locked metadata table)
- Brief versions unchanged: **CONFIRMED**
- Style Cards unchanged: **CONFIRMED** (SC-01, SC-05, SC-02, SC-03, SC-04)
- Topics / subtopics / working titles unchanged: **CONFIRMED**
- Question counts and official Cambridge numbering unchanged: **CONFIRMED** (Part 1 Q1–8, Part 2 Q9–16, Part 3 Q17–24, Part 5 Q31–36, Part 6 Q37–42)
- Unaffected questions unchanged: **CONFIRMED** (see question-level deep diff)
- No unrequested global rewrite: **CONFIRMED** — Parts 1, 2, 3 and 5 keep their original passages except for the sentences named in the feedback; Part 6 is the only authorised rebuild.
- Exam 2 not touched: **CONFIRMED** — this script only reads `05_OUTPUTS_REGENERATED_v1_1_2/EXAM-01` and only writes `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3`.

---

## Observed but NOT patched (scope lock)

- **Part 1 — Example (0):** The example has the same leak pattern the teachers flagged in Q2: "but suddenly finds its usual way blocked (0) ___" with key "suddenly". The example was not named in the feedback, so it was left untouched. Recommend fixing in the next authorised pass.
- **Part 1 — Q5 and Q7 keys:** Q5 now keys "combines" while the frozen Q7 keys "combining". The echo is mild (finite verb vs gerund, two sentences apart) but Q7 was not flagged, so it was not touched.
- **Part 2 — Q12 and Q16:** Both follow the teacher rewrites exactly. "when" is a natural alternative at Q12 and "closer" at Q16; recorded as accepted alternatives for the teacher to confirm rather than re-engineered.
- **Part 2 — Q13:** The teacher noted the gap is easy for B2 but prescribed "was" as the canonical answer. The prescription was followed; raising the difficulty would need a new brief-level decision.
- **Part 3 — Title:** The passage no longer frames the activity as a game, but the working title "Games that make practice feel different" is brief metadata and was not flagged, so it is unchanged. Worth a decision in the next pass.
