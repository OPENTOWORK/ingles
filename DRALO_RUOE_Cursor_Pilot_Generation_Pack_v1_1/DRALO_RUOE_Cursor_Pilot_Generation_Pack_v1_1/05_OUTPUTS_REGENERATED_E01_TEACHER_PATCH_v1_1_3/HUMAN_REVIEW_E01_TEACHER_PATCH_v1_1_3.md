# HUMAN REVIEW — RUOE-PILOT-E01 · TEACHER FEEDBACK PATCH v1.1.3

Generated: 2026-08-21T14:13:54.704Z

- **Exam:** RUOE-PILOT-E01 (Reading and Use of English, Parts 1–7)
- **Baseline:** `05_OUTPUTS_REGENERATED_v1_1_2/EXAM-01` (kept intact)
- **This pack:** `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/EXAM-01`
- **Kind:** controlled patch from the second human review — **not** a regeneration
- **Status:** `PENDING_HUMAN_REVIEW` (nothing published, no Supabase, no production write)

## What changed and what did not

| Part | Activity | Status in this patch |
| --- | --- | --- |
| 1 | Multiple-choice cloze | Patched locally — 5 change(s) |
| 2 | Open cloze | Patched locally — 7 change(s) |
| 3 | Word formation | Patched locally — 7 change(s) |
| 4 | Key word transformations | **Frozen** — copied byte-for-byte, not re-validated |
| 5 | Multiple choice (reading) | Patched locally — 5 change(s) |
| 6 | Gapped text | **Rebuilt** (Architecture v2, the only authorised rebuild) |
| 7 | Multiple matching | **Frozen** — copied byte-for-byte, not re-validated |

## How to review

1. Read the **student view** first. It contains no keys and no correction marks — it is what a candidate would see.
2. Then open the **reviewer view** for the keys, the evidence, the validator findings and the list of teacher-feedback changes applied to that Part.
3. Items marked **TEACHER ATTENTION** are where the automated blind solver disagreed with the key or flagged a second defensible answer. These need a human decision.
4. Parts 4 and 7 are unchanged, so anything you flagged there previously still stands.

## Answer keys at a glance

- **Part 1:** 1=B · 2=C · 3=A · 4=D · 5=B · 6=D · 7=A · 8=C
- **Part 2:** 9=little · 10=go · 11=how · 12=if · 13=was · 14=best · 15=in · 16=together
- **Part 3:** 17=communication · 18=frustration · 19=learning · 20=occasionally · 21=matching · 22=unhelpful · 23=different · 24=balanced
- **Part 4:** 25=had not checked · 26=easier for me · 27=more moving than · 28=asked me to · 29=no point in worrying · 30=accused of stealing
- **Part 5:** 31=A · 32=C · 33=D · 34=B · 35=A · 36=C
- **Part 6:** 37=C · 38=G · 39=F · 40=D · 41=A · 42=E
- **Part 7:** 43=A · 44=B · 45=C · 46=D · 47=A · 48=B · 49=A · 50=C · 51=D · 52=B

---

# Part 1 — Multiple-choice cloze

### Vista alumno

**Reading and Use of English Part 1**

Part 1: Multiple-choice cloze
For questions 1–8, read the text below and choose the best word (A, B, C or D) for each gap. There is an example at the beginning (0).

**When animals solve a new problem**

**Example (0)**

- **A.** first
- **B.** originally
- **C.** suddenly
- **D.** finally

Answer: **C** _(example — given to the candidate)_

Imagine an animal trying to reach food but suddenly finds its usual way blocked (0) ___. The real challenge is not just repeated action but adapting to this new obstacle. This (1) ___ means the animal must notice the change and think about how to overcome it rather than just trying the same thing again. For example, a bird might try several ways of opening a container and, (2) ___ doing so, it gradually learns which movements are useless. The process involves memory, attention, and (3) ___ to new tactics until the goal is met. This flexible problem-solving contrasts with the automatic response that works immediately without change. Observers looking at animal behaviour (4) ___ this distinction carefully, because what seems like cleverness could be just a fixed routine. By watching how an animal’s actions develop, researchers see how sensory awareness (5) ___ with trial-and-error to produce new solutions. In short, the interesting part is not whether the animal solves the task but how its behaviour (6) ___ to meet the challenge. This shows that flexible problem-solving often depends on several abilities (7) ___, rather than a single instinct. Ultimately, such observations help us understand what counts as (8) ___ intelligence in the animal world.

**Questions 1–8**

**1**
- **A.** gradually
- **B.** basically
- **C.** largely
- **D.** frequently

**2**
- **A.** at
- **B.** to
- **C.** in
- **D.** on

**3**
- **A.** adapting
- **B.** relating
- **C.** depending
- **D.** preferring

**4**
- **A.** make
- **B.** involve
- **C.** base
- **D.** consider

**5**
- **A.** connects
- **B.** combines
- **C.** joins
- **D.** relates

**6**
- **A.** responds
- **B.** reacts
- **C.** returns
- **D.** changes

**7**
- **A.** combining
- **B.** competing
- **C.** controlling
- **D.** completing

**8**
- **A.** truthful
- **B.** sincere
- **C.** genuine
- **D.** honest


### Vista revisor

- **Content Brief:** CB-PILOT-001 (v1.0)
- **Style Card:** SC-01
- **Working title:** When animals solve a new problem
- **Patch status:** controlled-local-patch
- **Pedagogical approval:** PENDING_HUMAN_REVIEW
- **Mechanical validator:** PASS
- **Blocking HARD:** 0
- **Quality-review HARD:** 0
- **QUALITY findings:** 0
- **Warnings:** 3

#### Teacher-feedback changes applied in this Part

- **Q2 — passage sentence**
  - Before: For example, a bird might try different ways to open a container before finally succeeding (2) ___.
  - After: For example, a bird might try several ways of opening a container and, (2) ___ doing so, it gradually learns which movements are useless.
  - Feedback: Q2: "la respuesta es finally, pero justo esa misma palabra ya aparece en la frase de dicho hueco… Habría que eliminar ese finally". Alternative direction: test a B2 fixed expression such as "in doing so".
  - Reason: The key was visible immediately before the gap, so the item was unsolvable as designed. The sentence was re-gapped around the fixed expression "in doing so", which removes the leak and tests a genuine word combination instead of an obvious adverb choice.
- **Q2 — options and key**
  - Before: accident / optionally / finally / slowly — key "finally"
  - After: in / at / to / on — key "in"
  - Feedback: Q2: options "parecen demasiado básicas"; proposal "in doing so / at doing so / to do so / on doing so".
  - Reason: Teacher intent preserved, but Part 1 options must be single words in this pipeline (multi-word options are a hard validation failure), so "doing so" stays in the text and the gap sits on the preposition. The option set is exactly the teacher's four variants reduced to their distinguishing word, which makes this the dependent-preposition / fixed-expression item the review found missing. "gradually" in the same clause rules out the temporal reading of "on doing so".
- **Q5 — options and key**
  - Before: replace / copy / separate / mix — key "mix" ("sensory awareness mixes with trial-and-error")
  - After: combines / connects / joins / relates — key "combines"
  - Feedback: Q5: "la respuesta debe ser mixes porque el sujeto sensory awareness aparece singular. Además, sensory awareness mixes with trial-and-error no es la colocación más natural". Direction: combines / connects / joins / relates.
  - Reason: Fixes both faults at once: every option is third-person singular, so it agrees with the singular subject, and "combines with … to produce" is the natural British English collocation. Option order was set so the Part 1 key spread covers A–D.
- **Q6 — passage sentence**
  - Before: In short, the interesting part is not if the animal solves the task but how its behaviour (6) ___ to meet the challenge.
  - After: In short, the interesting part is not whether the animal solves the task but how its behaviour (6) ___ to meet the challenge.
  - Feedback: Q6: "whether es más recomendable por naturalidad".
  - Reason: "not whether X but how Y" is the natural British English pairing. Q6 options and key were re-checked afterwards and still work: "changes to meet the challenge" remains the only natural completion, so the key stays A.
- **Q8 — options and key**
  - Before: natural / automatic / certain / intelligent — key "intelligent" ("intelligent intelligence")
  - After: genuine / truthful / sincere / honest — key "genuine"
  - Feedback: Q8: "los distractores son muy fáciles… al estudiante no le hace ni falta entender el texto"; "hay un fallo porque la respuesta dice ser D: intelligent, pero quedaría intelligent intelligence". SR: use options close in meaning.
  - Reason: Removes the impossible collocation and replaces an easy set with four near-synonymous adjectives about authenticity. All are plausible before reading the context, but only "genuine intelligence" is a natural collocation, so the item now tests semantic distinction — the category the review found missing.

#### Left unchanged on purpose (outside the feedback scope)

- **Example (0):** The example has the same leak pattern the teachers flagged in Q2: "but suddenly finds its usual way blocked (0) ___" with key "suddenly". The example was not named in the feedback, so it was left untouched. Recommend fixing in the next authorised pass.
- **Q5 and Q7 keys:** Q5 now keys "combines" while the frozen Q7 keys "combining". The echo is mild (finite verb vs gerund, two sentences apart) but Q7 was not flagged, so it was not touched.

_Blind-solve agreed with every key (8 items solved, no mismatches, no ambiguity flags)._

#### Answer key

- Example (0): **C**
- Q1: **B** — basically
- Q2: **C** — in
- Q3: **A** — adapting
- Q4: **D** — consider
- Q5: **B** — combines
- Q6: **D** — changes
- Q7: **A** — combining
- Q8: **C** — genuine

#### Validator findings

- **Blocking HARD:** none

- **Quality-review HARD:** none

- **QUALITY:** none

- **Warnings:**
  - Part 1 passage is 189 words; target is 150–180 (accepted up to 200 for generation).
  - Weak item Q1: The distractors (A, C, D) are close in meaning and register, but B is the best fit; still might confuse weaker B2s.
  - Weak item Q8: All options are synonyms but differ in register and subtlety; 'genuine' and 'honest' are both plausible, creating slight ambiguity.

#### Automated rubric

- Verdict: **pass**
- CEFR estimate: B2
- Realistic B2: true
- Issues:
  - Option words are all single words except preposition (item 2) and no multiword options, which is good.
  - Distractors sometimes close in meaning, which adds challenge but could confuse some borderline B2 candidates.
  - No item tests all verbs; item types vary appropriately.
  - The passage is natural and academic in tone, suitable for upper-intermediate level.
- Weak items:
  - Q1: The distractors (A, C, D) are close in meaning and register, but B is the best fit; still might confuse weaker B2s.
  - Q8: All options are synonyms but differ in register and subtlety; 'genuine' and 'honest' are both plausible, creating slight ambiguity.


---

# Part 2 — Open cloze

### Vista alumno

**Part 2: Open cloze**

For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap. There is an example at the beginning (0).

**The market that teaches you how a town eats**

**Example (0):** **just** _(example — given to the candidate)_

At the heart of the town, a busy market bustles (0) ___ before sunrise, with vendors quickly arranging fresh fruit and vegetables on their stalls. I arrived expecting to find the town’s famous pie, but soon realised that the locals had very (9) ___ interest in such treats early in the morning. Instead, they carefully selected ordinary ingredients, like leafy greens and root vegetables that will (10) ___ into the day’s meals. One stallholder, noticing my curiosity, explained (11) ___ to prepare a sauce from the wild herbs displayed. Her advice was simple but revealing: (12) ___ you want the fullest flavour, it’s best to use these herbs fresh. As I watched regular customers chatting and exchanging tips with sellers, it became clear that the market (13) ___ not simply about buying food; it also helped to build community spirit. People shared advice about how (14) ___ to store food or combine flavours, often revisiting the same stalls for guidance. The market showed me that understanding a town’s eating habits means looking beyond tourist favourites (15) ___ order to observe local behaviour. By the time I left, my view of the place had changed; it wasn’t about finding something rare but about seeing how food brings people (16) ___.

**Questions 9–16** — write ONE word in each gap.

- **9.** ______________________
- **10.** ______________________
- **11.** ______________________
- **12.** ______________________
- **13.** ______________________
- **14.** ______________________
- **15.** ______________________
- **16.** ______________________


### Vista revisor

- **Content Brief:** CB-PILOT-002 (v1.0)
- **Style Card:** SC-05
- **Working title:** The market that teaches you how a town eats
- **Patch status:** controlled-local-patch
- **Pedagogical approval:** PENDING_HUMAN_REVIEW
- **Mechanical validator:** PASS
- **Blocking HARD:** 0
- **Quality-review HARD:** 0
- **QUALITY findings:** 0
- **Warnings:** 9

#### Teacher-feedback changes applied in this Part

- **Example (0) — passage**
  - Before: a busy market bustles (0) ___ just before sunrise
  - After: a busy market bustles (0) ___ before sunrise
  - Feedback: Question 0: "la respuesta just ya aparece en el texto".
  - Reason: The leaked word after the gap was deleted so the example reads "bustles just before sunrise" only once the answer is supplied. The example answer itself is unchanged.
- **Q9 — passage and key**
  - Before: but soon realised the locals (9) ___ little interest in such treats early in the morning. → key "have"
  - After: but soon realised that the locals had very (9) ___ interest in such treats early in the morning. → key "little"
  - Feedback: Q9: proposed rewrite "but soon realised that the locals had (9) ___ interest…", answer "little"; also the tense debate ("had" vs "showed"/"show").
  - Reason: Adopts the teacher rewrite, which settles the tense argument by fixing "had" in the text. "very" was added because the bare frame accepted both "little" and "no" as equally natural answers; "very little" leaves a single defensible key.
- **Q12 — passage and key**
  - Before: Her advice was simple but revealing: it’s best (12) ___ use these herbs fresh, to bring out their full flavour. → key "to"
  - After: Her advice was simple but revealing: (12) ___ you want the fullest flavour, it’s best to use these herbs fresh. → key "if"
  - Feedback: Q12: proposed rewrite "Her advice was simple but revealing: (12) ___ you want the fullest flavour, it's best to use these herbs fresh", answer "if".
  - Reason: Adopts the teacher rewrite verbatim. Note for review: "when" also reads naturally in this frame, so it is recorded as an accepted alternative pending the teacher’s decision.
- **Q13 — passage and key**
  - Before: it became clear that the market (13) ___ more than just buying food; it builds community connections. → key "is"
  - After: it became clear that the market (13) ___ not simply about buying food; it also helped to build community spirit. → key "was"
  - Feedback: Q13: proposed rewrite "the market (13) ___ not simply about buying food; it also helped to build community connections", answer "was"; plus "community connections - this is not natural English. I would change it to community spirit".
  - Reason: Adopts the teacher rewrite and her preferred noun phrase. The surrounding past narrative ("it became clear", "it also helped") now forces "was", so the key is unique.
- **Q14 — passage**
  - Before: People shared advice about how (14) ___ best to store food or combine flavours → key "best"
  - After: People shared advice about how (14) ___ to store food or combine flavours → key "best"
  - Feedback: Q14: "best appears exactly before the gap where the answer is meant to be (like a typo)".
  - Reason: Deleting the duplicated word leaves the fixed expression "how best to do something", which is a valid and non-trivial B2 open-cloze gap, so the key could stay unchanged.
- **Q15 — passage and key**
  - Before: means looking beyond tourist favourites (15) ___ paying attention to everyday actions. → key "but"
  - After: means looking beyond tourist favourites (15) ___ order to observe local behaviour. → key "in"
  - Feedback: Q15: "the expression looking beyond is usually paired with and or to - in this case I would perhaps change the ending of the sentence to tourist favourites to observe local behaviour".
  - Reason: The teacher ending removed the old gap, so a new gap was created in the same zone. "in order to" is a fixed expression with only one possible word, which keeps eight gaps (Q9–Q16) and adds a grammar category the validator reported as missing.
- **Q16 — passage**
  - Before: about seeing how food ties people (16) ___. → key "together"
  - After: about seeing how food brings people (16) ___. → key "together"
  - Feedback: Q16: "I would suggest changing this to seeing how food brings people together".
  - Reason: "brings people together" is the natural collocation; "ties people together" is not idiomatic. The key is unchanged.

#### Left unchanged on purpose (outside the feedback scope)

- **Q12 and Q16:** Both follow the teacher rewrites exactly. "when" is a natural alternative at Q12 and "closer" at Q16; recorded as accepted alternatives for the teacher to confirm rather than re-engineered.
- **Q13:** The teacher noted the gap is easy for B2 but prescribed "was" as the canonical answer. The prescription was followed; raising the difficulty would need a new brief-level decision.

#### TEACHER ATTENTION — blind-solve

- Q12: solver considers **if / when** defensible — both are natural conditionals here with a subtle difference, both acceptable at B2
- Q13: solver considers **was / is** defensible — past or present tense can both suit, depending on context interpretation
- Q14: solver considers **best / how** defensible — both fit the meaning, 'best to store' or 'how to store'
- Q15: solver considers **in / for** defensible — both prepositions are commonly used with 'order to', slight difference in nuance

#### Answer key

- Example (0): **just**
- Gap (9): **little**
- Gap (10): **go**
- Gap (11): **how**
- Gap (12): **if**
- Gap (13): **was**
- Gap (14): **best**
- Gap (15): **in**
- Gap (16): **together**

#### Validator findings

- **Blocking HARD:** none

- **Quality-review HARD:** none

- **QUALITY:** none

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

#### Automated rubric

- Verdict: **pass**
- CEFR estimate: B2
- Realistic B2: true
- Issues:
  - gap 14 might prompt alternative insertions (e.g. 'to best', 'best way') but context supports single-word 'best'
  - gaps 13 and 15 are very straightforward for B1 level
  - no gaps test content vocabulary instead of grammar/function words
  - all keyed answers are supported clearly by grammar and context
- Weak items:
  - Q14: keyed answer 'best' can be challenged; 'how best' is an expression but 'best' alone may confuse less confident candidates


---

# Part 3 — Word formation

### Vista alumno

**Reading and Use of English Part 3: Word formation**

For questions 17–24, read the text below. Use the word given in capitals at the end of each line to form a word that fits in the gap. There is an example at the beginning (0).

**Games that make practice feel different**

**Example (0):** **practise** (PRACTICE) _(example — given to the candidate)_

In an informal learning club, a group gathers to take part in a cooperative activity designed to encourage everyone to (0) ___ (PRACTICE) specific skills. Instead of focusing on winning, participants must explain a strategy clearly to their teammates, which demands real (17) ___ (COMMUNICATE) and planning. When one learner suggests a flawed move, the group experiences the (18) ___ (FRUSTRATE) of failing quickly, leading them to adjust their approach immediately. This instant feedback creates a chance for rapid (19) ___ (LEARN), which keeps participants engaged. In fact, the teacher intervenes only (20) ___ (OCCASION), stepping back to let participants explore solutions. However, it is important to remember that the value of the exercise depends on matching the activity to the specific skill being practised. Without such careful (21) ___ (MATCH), the activity could be (22) ___ (HELP) or distracting. Rather than replacing traditional lessons, this method offers a (23) ___ (DIFFER) way to approach practical exercises, making repetition less monotonous and more appealing. Ultimately, enjoyment and purposeful skill development must be (24) ___ (BALANCE) to make the best use of such activities in learning.

**Questions 17–24** — use the word in CAPITALS to form a word that fits the gap.

- **17.** COMMUNICATE → ______________________
- **18.** FRUSTRATE → ______________________
- **19.** LEARN → ______________________
- **20.** OCCASION → ______________________
- **21.** MATCH → ______________________
- **22.** HELP → ______________________
- **23.** DIFFER → ______________________
- **24.** BALANCE → ______________________


### Vista revisor

- **Content Brief:** CB-PILOT-003 (v1.0)
- **Style Card:** SC-02
- **Working title:** Games that make practice feel different
- **Patch status:** controlled-local-patch
- **Pedagogical approval:** PENDING_HUMAN_REVIEW
- **Mechanical validator:** PASS
- **Blocking HARD:** 0
- **Quality-review HARD:** 0
- **QUALITY findings:** 2
- **Warnings:** 0

#### Teacher-feedback changes applied in this Part

- **Opening sentence and example (0)**
  - Before: In an informal learning club, a group gathers to play a cooperative game designed to encourage skill (0) ___ (PRACTICE)_ (PRACTICE). → example answer "practice" (no transformation)
  - After: In an informal learning club, a group gathers to take part in a cooperative activity designed to encourage everyone to (0) ___ (PRACTICE) specific skills. → example answer "practise"
  - Feedback: Example: "I would change this to In an informal learning club, a group gathers to take part in a cooperative activity - I would avoid the use of the word game as this B2 is not for schools"; "I also question the structure of the answer… I would change this to something like designed to encourage specific skill practice or designed to encourage the practice of specific skills".
  - Reason: Removes the school-ish framing, deletes the duplicated (PRACTICE) marker, and makes the example a real transformation: PRACTICE → practise is a genuine noun-to-verb derivation and a British English spelling point, which the previous no-transform example lacked.
- **Terminology — "players"**
  - Before: players must explain a strategy … let players explore solutions
  - After: participants must explain a strategy … let participants explore solutions
  - Feedback: L2/L6: "players - I would use the word participants".
  - Reason: Applies the requested adult-register terminology at both occurrences.
- **Collocation — matching**
  - Before: depends on matching the activity with the specific skill being practised
  - After: depends on matching the activity to the specific skill being practised
  - Feedback: "matching the activity with the specific skill being practised - in the context I think matching the activity to is better suited".
  - Reason: "match A to B" is the natural collocation for pairing an activity with its purpose.
- **Practice wording**
  - Before: a (23) ___ (DIFFER) way to repeat practice exercises
  - After: a (23) ___ (DIFFER) way to approach practical exercises
  - Feedback: "way to repeat practice exercises - perhaps practical exercises".
  - Reason: Adopts the suggested wording; "approach" replaces "repeat" so the phrase reads naturally, and the following clause still carries the repetition idea.
- **Q20 — stem and answer (-ly adverb)**
  - Before: (20) ___ (OBSERVE) → "observant" ("the teacher’s role is largely observant")
  - After: (20) ___ (OCCASION) → "occasionally" ("the teacher intervenes only occasionally")
  - Feedback: "there is no answer with a prefix or -ly".
  - Reason: Supplies the missing -ly adverb transformation through a two-step derivation (occasion → occasional → occasionally) while keeping the original pedagogical point that the teacher steps back.
- **Q22 — stem and answer (prefix/negative)**
  - Before: (22) ___ (USE) → "useless"
  - After: (22) ___ (HELP) → "unhelpful"
  - Feedback: "there is no answer with a prefix or -ly".
  - Reason: Supplies the missing genuine prefix/negative formation. "the activity could be unhelpful or distracting" keeps the original meaning of the sentence.
- **Register consistency — "game"**
  - Before: the game’s value … the game could be … the best use of games in learning
  - After: the value of the exercise … the activity could be … the best use of such activities in learning
  - Feedback: Consequence of "I would avoid the use of the word game as this B2 is not for schools".
  - Reason: Required for coherence once the opening was changed to "a cooperative activity"; leaving "game" elsewhere would have contradicted the reworked example and re-introduced the register problem.

#### Left unchanged on purpose (outside the feedback scope)

- **Title:** The passage no longer frames the activity as a game, but the working title "Games that make practice feel different" is brief metadata and was not flagged, so it is unchanged. Worth a decision in the next pass.

#### Answer key

- Example (0): **practise** (PRACTICE)
- Gap (17): **communication** (noun)
- Gap (18): **frustration** (noun)
- Gap (19): **learning** (adjective)
- Gap (20): **occasionally** (adverb)
- Gap (21): **matching** (adjective)
- Gap (22): **unhelpful** (prefix)
- Gap (23): **different** (other)
- Gap (24): **balanced** (adjective)

#### Validator findings

- **Blocking HARD:** none

- **Quality-review HARD:** none

- **QUALITY:**
  - [P3-FORCED-NATURALNESS] Q17: COMMUNICATION is the natural noun form here, 'communication' fits better than a forced adjectival form like 'communicative'
  - [P3-UNNATURAL-ANSWER] Q18: FRUSTRATION is the correct noun form; 'frustrate' is a verb. Using any other derived word would be unnatural.

- **Warnings:** none

#### Automated rubric

- Verdict: **revise**
- Issues:
  - Item 17: stem 'communicate' forced; use 'communication' instead
  - Item 18: noun should be 'frustration', not verb form or other derivations


---

# Part 4 — Key word transformations

### Vista alumno

**Reading and Use of English Part 4: Key Word Transformations**

For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. There is an example at the beginning (0).

**Example (0)**

If I had understood the instructions better, I wouldn’t have made so many mistakes.

**HAD**

If __________________ the instructions better, I wouldn’t have made so many mistakes.

**Questions 25–30**

**25.** If she had checked the weather forecast, she wouldn’t have been caught in the storm.

**HAD**

She ____________ the weather forecast; that’s why she got caught in the storm.

**26.** I didn’t think it would be so difficult to learn Spanish.

**EASIER**

I wish learning Spanish were __________________.

**27.** This film is more moving than the last one we watched.

**THAN**

This film is ____________________ the last one we watched.

**28.** He asked me to pass him the salt at the dinner table.

**ASKED**

He ____________ pass him the salt at the dinner table.

**29.** It’s pointless worrying about things you can’t change.

**POINT**

There is ____________________ about things you can’t change.

**30.** They accused him of stealing money from the company.

**ACCUSED**

He was ____________ stealing money from the company.


### Vista revisor

- **Blueprint:** TBP-PILOT-EX01
- **Patch status:** frozen — copied unchanged from v1.1.2
- **Pedagogical approval:** PENDING_HUMAN_REVIEW
- **Mechanical validator:** PASS
- **Blocking HARD:** 0
- **Quality-review HARD:** 0
- **QUALITY findings:** 6
- **Warnings:** 1

#### Teacher-feedback changes applied in this Part

**None — this Part is frozen and was copied byte-for-byte from the v1.1.2 output.**

The validator findings below are the ones recorded in v1.1.2 and are reproduced unchanged, because re-running the validators would have meant touching a frozen Part.

#### Answer key

- Example (0): **I had understood**
- Q25 (HAD): **had not checked**
- Q26 (EASIER): **easier for me**
- Q27 (THAN): **more moving than**
- Q28 (ASKED): **asked me to**
- Q29 (POINT): **no point in worrying**
- Q30 (ACCUSED): **accused of stealing**

#### Validator findings

- **Blocking HARD:** none

- **Quality-review HARD:** none

- **QUALITY:**
  - [TEST-P4-VALID-CONTRACTION] Q25: Expanded negative form listed without explicit contraction variant (e.g. need not / needn't).
  - [TEST-P4-TOO-EASY] Q28: Sentence 2 is too parallel to Sentence 1 — little restructuring required.
  - [TEST-P4-ANSWER-LENGTH-DISTRIBUTION] Part 4: Answers concentrate on 2–3 words — insufficient variety within the 2–5 range.
  - [TEST-P4-VALID-CONTRACTION] Q25: Expanded negative form listed without explicit contraction variant (e.g. need not / needn't).
  - [TEST-P4-TOO-EASY] Q28: Sentence 2 is too parallel to Sentence 1 — little restructuring required.
  - [TEST-P4-ANSWER-LENGTH-DISTRIBUTION] Part 4: Answers concentrate on 2–3 words — insufficient variety within the 2–5 range.

- **Warnings:**
  - Part 4: only 1/6 answers use 4–5 words — aim for more variety near the Cambridge maximum (distribution quality check).


---

# Part 5 — Multiple choice (reading)

### Vista alumno

**Part 5**

Read the text and choose the answer (A, B, C or D) which you think fits best according to the text.

**The volunteer job I chose for the wrong reason**

I signed up to volunteer at the local community repair workshop for what I now admit was a distinctly selfish reason: I was certain that adding some volunteer work to my CV would impress future employers and help me stand out in job applications. At the time, I imagined spending my weekends fixing gadgets or tinkering with small machines — something hands-on that would demonstrate practical skills. I was convinced that volunteering was just another bullet point, a way to check a box rather than an experience that would change how I thought about work.

On my first shift, however, I was surprised to find that my main task was not repairing anything but welcoming visitors and working out what help they needed. It quickly became clear that I was expected to be a friendly face, to listen to people’s requests, and then direct them to volunteers more skilled than myself. This was unexpected and initially rather frustrating. I had pictured myself elbow-deep in tools, not chatting with people or scribbling notes. But as the day went on, I realised that this role, though unglamorous, was essential for the workshop to function smoothly and for visitors to feel comfortable asking for help.

One particular encounter has stayed with me. A visitor came in, clearly embarrassed, clutching a small radio that wouldn’t switch on. He was sheepish about not understanding even such a simple fix, and I could tell he worried that asking for help would make him seem silly. I learned then that the way I spoke to him mattered — explaining the problem without assuming any prior knowledge, avoiding jargon, and most importantly, not making him feel foolish for not knowing how to fix something so ordinary.

As weeks turned into months, I took on more responsibility, gradually moving from greeting guests to coordinating the volunteers and the repair tasks depending on their skills and availability. I found myself enjoying this role far more than I expected. It gave me a sense of accomplishment and control, and I liked the social interaction. This was a side of volunteering I had not anticipated or considered when I first signed up. I discovered I was more interested in enabling others to do their work than in doing the hands-on repairs myself.

When it came time to update my CV, I reflected on my experience and realised that the most valuable aspect was not the line about volunteering but what the experience taught me about myself. I now see that coordinating people and communicating effectively suit me better than the solitary, technical tasks I thought I wanted. The CV still includes a note about my volunteering, but the real benefit is a changed understanding of the kind of work I find fulfilling. Volunteering was not just about adding a badge to my applications but about discovering what I actually enjoy doing.

Looking back, I can also laugh at some minor mistakes that day one, when I proudly tried to hand a screwdriver to someone who didn’t actually want it, highlighting how clueless I was about the workshop’s unofficial routines. My previous belief that "serious" career skills came only from formal jobs or internships now seems limited. Doing regular, sometimes mundane tasks with real people revealed strengths I hadn’t expected in myself.

In essence, this volunteer role became a mirror rather than just a step on the career ladder. It reflected back to me not only what I could do but what kind of work energises me and feels worthwhile. This shift in perspective — from seeing volunteering as a strategic CV move to a personal discovery — has influenced how I think about future jobs and even how I define success. Sometimes, it’s the small, everyday interactions and responsibilities that open our eyes to new directions.

**Questions 31–36**

**31.** Which statement best describes the narrator’s attitude towards their initial motive for volunteering?
- **A.** They admitted their motive was somewhat selfish.
- **B.** They felt proud of making a strategic career decision.
- **C.** They believed the motive was entirely genuine.
- **D.** They considered the motive to be irrelevant to the experience.

**32.** What was the narrator’s main task on the first day of volunteering?
- **A.** Repairing small machines brought in by visitors.
- **B.** Organising the volunteers and their tasks.
- **C.** Welcoming visitors and determining their needs.
- **D.** Teaching visitors how to fix items themselves.

**33.** How did the visitor with the broken radio feel, and why was this significant for the narrator?
- **A.** Confident because he understood the repair process.
- **B.** Frustrated at the workshop’s slow service.
- **C.** Unconcerned about the simplicity of the repair.
- **D.** Embarrassed, and afraid that needing help would reflect badly on him.

**34.** Why does the narrator mention the small mistake on their first day?
- **A.** To highlight the importance of technical skills.
- **B.** To add light humour and show initial awkwardness.
- **C.** To criticise the workshop’s informal routines.
- **D.** To explain why they stopped volunteering.

**35.** What does the phrase "a mirror rather than just a step on the career ladder" mean in the last paragraph?
- **A.** The volunteering reflected the narrator's true interests and abilities.
- **B.** The volunteer work was only career-focused, not personal.
- **C.** The experience was disappointing and didn’t lead anywhere.
- **D.** The workshop offered a clear path to promotion and success.

**36.** What is the main theme of the article?
- **A.** How volunteering can help develop practical repair skills.
- **B.** Strategies for improving job applications with volunteer experience.
- **C.** The unexpected personal insights gained through volunteering.
- **D.** The importance of technical knowledge in community workshops.


### Vista revisor

- **Content Brief:** CB-PILOT-004 (v1.0)
- **Style Card:** SC-03
- **Working title:** The volunteer job I chose for the wrong reason
- **Patch status:** controlled-local-patch
- **Pedagogical approval:** PENDING_HUMAN_REVIEW
- **Mechanical validator:** PASS
- **Blocking HARD:** 0
- **Quality-review HARD:** 0
- **QUALITY findings:** 18
- **Warnings:** 0

#### Teacher-feedback changes applied in this Part

- **Question order (Q31–Q36)**
  - Before: Q31 global · Q32 detail · Q33 inference · Q34 attitude (¶1) · Q35 purpose · Q36 reference
  - After: Q31 attitude (¶1) · Q32 detail (¶2) · Q33 inference (¶3) · Q34 purpose (¶6) · Q35 reference (¶7) · Q36 global
  - Feedback: "the order seems random - Q34 is out of order (the exact phrase appears at the start of the text)".
  - Reason: Questions now follow passage progression, with the whole-text question last as Cambridge normally places it. Prompts, evidence and rationales travelled with their items; only numbering changed.
- **Answer key distribution**
  - Before: B · C · B · B · C · B (only two letters used)
  - After: A · C · D · B · A · C (all four letters used)
  - Feedback: "The answers are all B or C - no A or D".
  - Reason: Options were reordered inside the affected items only; no correct answer was changed conceptually and no distractor content was altered, so difficulty is unaffected.
- **Passage ¶3 wording**
  - Before: he worried that asking for help would make him seem unintelligent or careless
  - After: he worried that asking for help would make him seem silly
  - Feedback: "unintelligent doesn’t sound natural here and careless is out of place here - I would change this to make him seem silly".
  - Reason: Adopts the suggested wording. The correct option and evidence for the item that depends on this sentence (now Q33) were updated to match, and the option is a paraphrase rather than a lift.
- **Passage ¶4 wording**
  - Before: I found myself not just managing logistics but enjoying this role more than I expected
  - After: I found myself enjoying this role far more than I expected
  - Feedback: "I would just reduce this to I found myself enjoying this role far more than I expected".
  - Reason: Adopts the suggested wording; no item depends on the deleted clause.
- **questionType metadata**
  - Before: "main-idea / global" and "attitude / opinion / tone"
  - After: "global" and "attitude"
  - Feedback: Consequence of reordering and re-tagging the affected items.
  - Reason: The previous free-text labels were not in the validator vocabulary and produced "unknown questionType" warnings. Metadata only — nothing the candidate sees changed.

_Blind-solve agreed with every key (6 items solved, no mismatches, no ambiguity flags)._

_Adversarial blind reconstruction: 31=A (high), 32=C (high), 33=D (high), 34=B (high), 35=A (high), 36=C (high)._

#### Answer key

- Q31: **A** — They admitted their motive was somewhat selfish.
- Q32: **C** — Welcoming visitors and determining their needs.
- Q33: **D** — Embarrassed, and afraid that needing help would reflect badly on him.
- Q34: **B** — To add light humour and show initial awkwardness.
- Q35: **A** — The volunteering reflected the narrator's true interests and abilities.
- Q36: **C** — The unexpected personal insights gained through volunteering.

#### Evidence and rationale per item

- **Q31** (attitude)
  - Evidence: ‘…what I now admit was a distinctly selfish reason: I was certain that adding some volunteer work to my CV would impress future employers…’
  - Rationale: A is correct as the narrator openly admits a selfish motive. B contradicts the tone of admission; C is not suggested; D is not expressed.
- **Q32** (detail)
  - Evidence: ‘…my main task was not repairing anything but welcoming visitors and working out what help they needed.’
  - Rationale: C is correct as per the explicit description of the first shift. A and B describe tasks the narrator expected or later took on. D is not mentioned as a main task.
- **Q33** (inference)
  - Evidence: ‘A visitor came in, clearly embarrassed … he worried that asking for help would make him seem silly.’
  - Rationale: D matches the passage’s description of the visitor’s embarrassment and the narrator’s realisation that his own tone mattered. A is the opposite; B and C are not supported by the text. The option paraphrases the text rather than lifting it, so the item cannot be solved by word matching.
- **Q34** (purpose)
  - Evidence: ‘…I can also laugh at some minor mistakes that day one, when I proudly tried to hand a screwdriver to someone who didn’t actually want it…’
  - Rationale: B is correct as the narrator uses the example humorously and self-deprecatingly. A and C are incorrect because the mistake is personal and light-hearted; D is incorrect as they continued volunteering.
- **Q35** (reference)
  - Evidence: ‘This volunteer role became a mirror ... It reflected back to me not only what I could do but what kind of work energises me and feels worthwhile.’
  - Rationale: A matches the metaphor that volunteering gave self-awareness. B and C misinterpret the positive reflection; D is unrelated to the metaphor.
- **Q36** (global)
  - Evidence: The writer explains starting with a motive to improve their CV but ends up discovering more about personal interests through the experience.
  - Rationale: C reflects the overall message that the volunteer experience led to unexpected self-discovery. A is incorrect because the focus is less on repair skills; B is too narrow, focusing on applications rather than insights; D is incorrect as technical skills were less emphasised.

#### Validator findings

- **Blocking HARD:** none

- **Quality-review HARD:** none

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

- **Warnings:** none

#### Automated rubric

- Verdict: **pass**


---

# Part 6 — Gapped text

### Vista alumno

**Reading and Use of English Part 6: Gapped text**

Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap. There is one extra sentence which you do not need to use.

**The boxes I thought I needed**

Moving into a smaller flat was supposed to be a straightforward step: fewer rooms to clean, lower bills and, I hoped, a fresh start. Instead, I spent my first evening sitting on the bare floor, hemmed in by towers of cardboard that had already claimed every corner of the sitting room. (37) Opening them only made matters worse, because most held nothing more than odds and ends I had packed out of habit rather than need: three identical chargers, a bag of assorted keys, a folder of instruction manuals for appliances I no longer owned. Somewhere between the third and fourth box, I accepted that keeping everything was not merely impractical but physically impossible.

One box defeated me completely. Inside, wrapped in a supermarket bag as though it were valuable, was a compact umbrella I had been given years earlier and never once opened. (38) Holding it in the middle of that half-empty room, I understood that a surprising number of my possessions were being stored for a future I had never actually described to myself. In a flat of this size, that vagueness turned out to be expensive, because every undecided object was occupying space I genuinely needed.

A few days later, my downstairs neighbour, Ruth, mentioned a swap and repair event at the community centre. (39) That distinction mattered to me more than I expected. Throwing things away had always felt like an admission of waste, and I had been postponing decisions largely to avoid that feeling; passing something on, or watching it mended, sounded almost like the opposite.

I arrived on the Saturday with a bag of things nobody could possibly want: a chipped mug, a scarf worn thin at the elbows and a desk lamp with an unfashionable shade. The lamp went first, claimed within minutes by a student who said it was exactly right for the corner of her room. (40) What I had been calling clutter, I realised, was simply a set of guesses about other people, and my guesses were poor. Value was not a property the objects carried around with them; it depended entirely on who was standing in front of them.

Not everything was so easy to reason about. I had also brought a hand-knitted blanket of my grandmother’s, which is warm, takes up an absurd amount of shelf space and does nothing that I actually need doing. Twice I put it on the swap table, and twice I took it back before anyone could look at it properly. (41) Some things earn their place by meaning rather than use, provided you are willing to say honestly which of the two you are claiming.

Walking home, I found myself drafting a rule. Anything I kept had to do a job or mean something specific, and I had to be able to say which of the two it was without hesitating. (42) It has not turned me into a minimalist, and the flat is certainly not empty; it is merely more honest about what it contains and why.

There is still one shelf I avoid, holding a handful of objects whose value I cannot yet argue either way. I have decided that this is acceptable, at least for now. A home edited down to nothing but justifications would not be a home I would want to come back to.

**Questions 37–42** — sentences A–G

- **A.** It went home with me again, and I have stopped pretending that this was an oversight.
- **B.** The community centre had put out tea and biscuits, which struck me as a generous touch for a Saturday morning.
- **C.** Each of these boxes was labelled ‘keep’, which told me nothing useful about what was actually inside.
- **D.** The mug and the scarf, by contrast, attracted no interest at all, even though I had privately expected them to go before the lamp.
- **E.** Put like that, the test sounds severe, but in practice it simply forced me to finish sentences I had been leaving unfinished for years.
- **F.** It was not a jumble sale, she explained, but a morning for mending what was broken and rehoming what was not.
- **G.** I had kept it ‘just in case’, although I could no longer remember what that case might be.

- **37.** ______
- **38.** ______
- **39.** ______
- **40.** ______
- **41.** ______
- **42.** ______


### Vista revisor

- **Content Brief:** CB-PILOT-005 (v1.0)
- **Style Card:** SC-04
- **Working title:** The boxes I thought I needed
- **Patch status:** architecture-v2-rebuild
- **Pedagogical approval:** PENDING_HUMAN_REVIEW
- **Mechanical validator:** PASS
- **Blocking HARD:** 0
- **Quality-review HARD:** 0
- **QUALITY findings:** 3
- **Warnings:** 0

#### Teacher-feedback changes applied in this Part

- **Whole Part — Architecture v2 rebuild**
  - Before: Article assembled around pre-written sentences; gap (37) appeared twice in the passage; option A fitted several gaps; gap (38) had weak cohesion clues.
  - After: New continuous article written first, six genuine cohesion points identified, the six sentences occupying them physically removed to create gaps (37)–(42), one plausible unused sentence added, and A–G shuffled.
  - Feedback: "the sentences to be introduced read disjointed - is there a way to get the AI to create the text and then remove the sentences rather than create random sentences that could fit into the text?"
  - Reason: Rebuild authorised for Part 6 only. CB-PILOT-005, topic, Style Card SC-04 and the reflective first-person intent are preserved; the problematic sentences were not reused.
- **Q37 — antecedent mismatch**
  - Before: Gap (37) followed by "Many weren’t even full", while the correct sentence referred to the objects rather than the boxes.
  - After: Gap (37) followed by "Opening them only made matters worse, because most held nothing more than odds and ends…", with the correct sentence "Each of these boxes was labelled ‘keep’…" referring unambiguously to the boxes.
  - Feedback: Q37: "right after the gap we read Many weren’t even full - but the answer is referring to the objects not the boxes".
  - Reason: Both the sentence before the gap ("towers of cardboard") and the sentence after it ("them", "most") now point to the boxes, so the reference chain is consistent.
- **Q40 — lexical repetition**
  - Before: Gap (40) surrounded by "That was different from my expectation" and option E "That was different from most other items I’d brought… think differently about…".
  - After: Gap (40) filled by "The mug and the scarf, by contrast, attracted no interest at all, even though I had privately expected them to go before the lamp.", followed by "…my guesses were poor."
  - Feedback: Q40: "How many times can we put different into two lines?"
  - Reason: The word "different" no longer appears anywhere in Part 6. The contrast is now carried by the lamp/mug-and-scarf comparison and the marker "by contrast" instead of repeated vocabulary.

_Blind-solve agreed with every key (6 items solved, no mismatches, no ambiguity flags)._

_Adversarial blind reconstruction: 37=C (high), 38=G (high), 39=F (high), 40=D (high), 41=A (high), 42=E (high)._

#### Answer key

- Gap 37: **C**
- Gap 38: **G**
- Gap 39: **F**
- Gap 40: **D**
- Gap 41: **A**
- Gap 42: **E**
- Unused sentence: **B**

#### Validator findings

- **Blocking HARD:** none

- **Quality-review HARD:** none

- **QUALITY:**
  - [TEST-P6-MULTIFIT] Q39: Option D may fit gaps 39,40: Could logically refer to items mentioned before and contrast interest, fits well in 40 but also possibly 39 in discourse terms, but better in 40
  - [TEST-P6-MULTIFIT] Q39: Option F may fit gaps 39,40: Explains the event type, fits well in 39 but could superficially fit 40
  - [P6-WEAK-COHESION] Q39: Sentence introduces the swap and repair event, but the link to previous ideas is only moderate since the move is about possessions and the event is newly introduced

- **Warnings:** none

#### Automated rubric

- Verdict: **pass**
- Issues:
  - Sentence for gap 39 less linked to previous context than others
  - Letters D and F could fit more than one gap, possibly causing confusion


---

# Part 7 — Multiple matching

### Vista alumno

**Reading and Use of English Part 7: Multiple matching**

Read the article in which people talk about their experiences. For each question, choose from the people (A–D). The people may be chosen more than once.

Which person…? The people may be chosen more than once.

**Questions 43–52**

**43.** Who began their work because they discovered stories were at risk of disappearing completely? ______
**44.** Who talks about needing to find a compromise between keeping things original and adapting for modern requirements? ______
**45.** Who regularly involves others in helping to identify unclear historical information? ______
**46.** Who emphasises tailoring their approach during activities to maintain the group’s interest? ______
**47.** Who has found that emotional memories can interfere with an accurate record of events? ______
**48.** Who mentions initial enthusiasm fading due to the slower, less exciting nature of the work? ______
**49.** Who values ordinary community stories more than widely known historical events? ______
**50.** Who feels most pleased when various pieces of information come together to solve a historical puzzle? ______
**51.** Who avoids sharing stories that cannot be fully supported by evidence to keep trust with their audience? ______
**52.** Who views working with others as an important and enjoyable part of their contribution? ______

**Texts A–D**

**A. Maya, oral-history volunteer**

Initially, I got involved after listening to an elderly neighbour sharing stories from decades ago and realising that countless personal memories were never documented. My aim has always been to preserve these individual experiences before they fade away completely. I conduct interviews with local residents, focusing on open-ended questions that encourage detailed recollections. However, it can be challenging because many people drift away from exact dates and facts, blending memories with feelings. Since then, I have learned to carefully cross-check basic facts to distinguish between what actually happened and what might be remembered inaccurately. I now value everyday stories equally, even more than big historical events, but I try to remain patient and cautious to avoid mixing emotion with verified information.

**B. Tom, cinema restoration volunteer**

I joined the project after noticing the old community cinema closed down and left to deteriorate, which felt like losing a shared cultural space. My motivation was to protect this building, which holds meaning for many locals. Getting my hands dirty cleaning and fixing parts of the place has been rewarding, especially working alongside others in the team. Yet, the restoration has taken much longer than I expected and is less exciting than I hoped — a lot of the work involves tedious repairs. I've also had to accept that some modern adaptations are necessary for it to be usable again, even if they affect the original look. Despite that, I’m now realistic about balancing preservation with practical use, and I’m happy the cinema might reopen in a different, functioning form.

**C. Luca, digital photo archive creator**

My interest began when I came across several boxes of old photos from families and streets around town, but most lacked labels or dates. It seemed important to organise and digitise these images to make them more accessible and searchable for anyone interested. To solve the problem of many photos being unidentified, I invite neighbours to help me tag the people and places they recognise. Still, it’s often unclear who or what is in some pictures, so I make sure to mark uncertain information clearly rather than guessing. I enjoy the process of combining small hints from various contributors to solve these historical puzzles. Currently, I feel most satisfaction when different pieces come together to reveal a photo’s story, knowing that I’ve built something collaborative and methodical.

**D. Olivia, local walking-tour organiser**

Friends frequently asked me about the unusual buildings visible on everyday walks, which made me realise people often overlook the history around them. I decided to create guided walks to highlight these places, hoping to encourage locals to observe their neighbourhood more closely. Designing tours means organising routes based on visible features while keeping groups interested throughout the tour by varying pace and length. A big challenge is avoiding presenting unverified stories as facts, so I deliberately leave out legends or uncertain anecdotes. I believe it’s better to nurture curiosity while maintaining trust. Nowadays, I focus heavily on providing accurate information in a lively way, adjusting my delivery to suit various audiences, and I find the experience rewarding and energising.


### Vista revisor

- **Content Brief:** CB-PILOT-006 (v1.0)
- **Style Card:** SC-06
- **Working title:** Keeping local history alive in different ways
- **Patch status:** frozen — copied unchanged from v1.1.2
- **Pedagogical approval:** PENDING_HUMAN_REVIEW
- **Mechanical validator:** PASS
- **Blocking HARD:** 0
- **Quality-review HARD:** 0
- **QUALITY findings:** 2
- **Warnings:** 2

#### Teacher-feedback changes applied in this Part

**None — this Part is frozen and was copied byte-for-byte from the v1.1.2 output.**

The validator findings below are the ones recorded in v1.1.2 and are reproduced unchanged, because re-running the validators would have meant touching a frozen Part.

#### Answer key

- Q43: **A**
- Q44: **B**
- Q45: **C**
- Q46: **D**
- Q47: **A**
- Q48: **B**
- Q49: **A**
- Q50: **C**
- Q51: **D**
- Q52: **B**

#### Validator findings

- **Blocking HARD:** none

- **Quality-review HARD:** none

- **QUALITY:**
  - [TEST-P7-WORD-MATCH] Q50: Question wording overlaps heavily with a single profile (literal word matching).
  - [TEST-P7-WORD-MATCH] Q50: Question wording overlaps heavily with a single profile (literal word matching).

- **Warnings:**
  - Part 7 question 50: may be solvable by keyword matching in section C.
  - Quality validator failed to run: Missing } in template expression

_The "validator failed to run" warning above is inherited from v1.1.2: the adversarial quality validator had a syntax error that has since been fixed. Re-running it here would have meant rewriting a frozen Part, so the warning is left as recorded._


---

## Open questions for the teachers

- **Part 1 — Example (0):** The example has the same leak pattern the teachers flagged in Q2: "but suddenly finds its usual way blocked (0) ___" with key "suddenly". The example was not named in the feedback, so it was left untouched. Recommend fixing in the next authorised pass.
- **Part 1 — Q5 and Q7 keys:** Q5 now keys "combines" while the frozen Q7 keys "combining". The echo is mild (finite verb vs gerund, two sentences apart) but Q7 was not flagged, so it was not touched.
- **Part 2 — Q12 and Q16:** Both follow the teacher rewrites exactly. "when" is a natural alternative at Q12 and "closer" at Q16; recorded as accepted alternatives for the teacher to confirm rather than re-engineered.
- **Part 2 — Q13:** The teacher noted the gap is easy for B2 but prescribed "was" as the canonical answer. The prescription was followed; raising the difficulty would need a new brief-level decision.
- **Part 3 — Title:** The passage no longer frames the activity as a game, but the working title "Games that make practice feel different" is brief metadata and was not flagged, so it is unchanged. Worth a decision in the next pass.

## Confirmations

- Part 4 and Part 7 were not regenerated, repaired, normalised or reformatted.
- Content Brief IDs, Style Cards, topics, question counts and Cambridge numbering are unchanged in every Part.
- Exam 2 was not touched.
- All Parts remain `PENDING_HUMAN_REVIEW`.
