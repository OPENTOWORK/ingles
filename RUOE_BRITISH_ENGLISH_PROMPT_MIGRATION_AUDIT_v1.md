# RUOE — British English prompt-layer migration · Phase 1 audit

**Status:** audit only. No runtime file, prompt, validator, Content Brief, Topic Bank, Transformation Family, Style Card ID, exam output, or Supabase row was changed.

**Date:** 22 September 2026  
**Scope:** instructions that influence English generation or linguistic judgement in the B2 Reading and Use of English (RUOE) engine, Parts 1–7. Listening, Writing and Speaking blocks that live in the same prompt file are noted only where a later edit of that file could touch them.

**Live database:** not read and not written. Override behaviour below is inferred from code.

---

## 1. How a prompt actually reaches the model

Default generation does **not** call the code prompt directly.

1. `generateAndPersistLevelExamPart()` in `src/lib/levelsCambridgeExamGenerator.js` uses `useCodePrompts = false`.
2. That calls `resolveEffectiveExamPartGenerationPrompt()` in `src/lib/examPartGenerationPrompt.js`.
3. The resolver reads `levels_exam_part_prompt_overrides` (`src/lib/examPartPromptOverrides.js`).
4. If `user_prompt` is non-empty, that stored text **replaces** the code prompt. Placeholders `{variety}`, `{SHARED_JSON_RULES}` and `{directions}` are expanded. If the stored prompt has no JSON schema, the code schema footer is appended. The `Topic/theme` + `Variety seed` line is refreshed.
5. `useCodePrompts: true` is the only in-process bypass. The local pilot path (`src/lib/ruoePilotRegeneration.js`) also builds from code, then appends the Content Brief, the Style Card text, and `BRITISH_ENGLISH_BLOCK`.
6. `ensureExamPartPromptStored()` copies the current code prompt into the table when the row is empty. `scripts/sync-b2-ruoe-prompts-from-code.mjs` **overwrites** B2 parts 1–7 from code. Neither was run.

**Migration risk:** editing `draloAiExamPrompts.js` will not change production generation until the override row is absent, identical to code, or explicitly reset. A later migration must version the stored prompt. It must not silently overwrite live rows.

---

## 2. Language of the current layer

The generation and validator prompts that the model sees are already written in English, and several already say “British English” or “natural British English”.

What is still missing is a single contract that forces the model to **think and judge in British English before it writes**, and a Part 1 rule that rejects a distractor which is itself natural. Spanish appears in comments, admin error strings, and human docs. Those do not enter the model unless someone pastes them into an override.

---

## 3. Inventory

Classification:

- **A** — generation-facing. The model uses this to write English.
- **B** — linguistic / editorial judgement.
- **C** — mechanical or code-only.
- **D** — human documentation or comments. May stay in Spanish.

| File | Component | Language now | Class | Migrate? | Why | Risk if left | Examples to review |
|---|---|---|---|---|---|---|---|
| `src/lib/draloAiExamPrompts.js` | `buildExamGeneratePrompt` Part 1 `multiple-choice-cloze` | English | A | Yes, high | Writes the passage, the key, and all four options. | Distractor policy still allows a second natural option if the key is “more natural”. | Yes. See §5 and §6. |
| same | Part 2 open cloze | English | A | Yes, high | Writes function-word gaps and uniqueness. | Stronger uniqueness list than Part 1, but still no shared BE contract. | Relative-clause examples are sound. |
| same | Part 3 word formation | English | A | Yes, high | Writes stems, derived forms, and the sentence around them. | “Natural sentence first” is present; derivation examples are mostly sound. | `LONG → length`, `DECIDE → decisive`, `ANXIOUS → anxiety`. |
| same | Part 4 key-word transformations | English | A | Yes, high | Writes both sentences, the keyword answer, and marking metadata. | Already says naturalness before the transformation. Metadata example is fine; it is not a full item. | `do not need to use`; `is said to have been`. |
| same | Part 5 multiple choice | English | A | Yes, high | Writes the article, stems, and reading distractors. | Distractors must be passage-grounded; no shared BE naturalness test on the prose. | None that are themselves ambiguous items. |
| same | Part 6 gapped text | English | A | Yes, high | Writes the article and sentences A–G. Architecture v2 is structural and must stay. | Cohesion language is English and usable; still no shared contract. | Duplicate “EXTRA sentence” bullet is editorial noise, not a bad example. |
| same | Part 7 multiple matching | English | A | Yes, high | Writes four voices and “Who…” stems. | Paraphrase example is slightly forced. | Yes. See §6. |
| same | `RUOE_DISCOURSE_PATTERNS`, `varietyBlock`, `passageDiscourseBlock`, `SHARED_JSON_RULES` | English | A | Yes, medium | These frames shape every passage. | Saturated-theme list is fine. No BE spelling/vocabulary contract sits above them. | “has become increasingly popular in recent years” is a forbidden opener, correctly. |
| same | Listening and Writing branches in the same function | English | A, outside RUOE 1–7 | Later, if the file is split | A careless edit of the shared file can change them. | Phrasal-verb quotas can force unnatural listening scripts. | “at short notice”, “draw a blank”, “muck in”. |
| `src/lib/draloAiExamPartSpecs.js` | `EXAM_DIRECTIONS`, `getExamDirections` | English | A (injected) | Low | Student directions are already Cambridge-style British English. | Low, unless an override drops `{directions}`. | No. |
| `src/lib/levelsCambridgeExamGenerator.js` | `getLevelExamPartSystemPrompt` | English, one line | A | Yes, high | This is the system message for every part. It does not carry the BE contract. | The model can reason in any language the user prompt happens to use. | No. |
| same | `buildLevelExamPartUserPrompt` / `resolveDefaultLevelExamPartPrompt` | English user prompt from `buildExamGeneratePrompt` | A (wiring) | Yes, as the version switch | Chooses the code prompt. Spanish only in thrown errors (`Parte inválida`). | Those errors are not model input. | No. |
| same | `useCodePrompts = false` and the call to `resolveEffectiveExamPartGenerationPrompt` | Code | C + runtime risk | Do not flip in this phase | This is why DB text wins. | Code-only migration is invisible in production. | No. |
| same | `collectAmbiguityFindings`, `__needsReview` | English details, Spanish comments | B wiring | Keep the gate; change the judge | One blind-solve mismatch blocks automatic save. It does not require option-by-option substitution. | A “more idiomatic key” can still pass if the solver picks the key and does not list the rival. | No. |
| `src/lib/examPartGenerationPrompt.js` | `resolveEffectiveExamPartGenerationPrompt`, `expand` / schema footer / variety refresh | Code; stored prompt language is whatever was saved | A (resolver) | Plan around it; do not change it now | Stored HTML or plain text becomes the live prompt. | A new English code prompt never runs while an older row exists. | No. |
| same | Admin errors (“El prompt de usuario no puede estar vacío…”) | Spanish | D | No | Human-facing admin copy. | None for generation. | No. |
| `src/lib/examPartPromptOverrides.js` | `fetch` / `save` / `delete` on `levels_exam_part_prompt_overrides` | Code | C | Do not write | Keyed by `level_slug` + `part_number`. Stores `system_prompt` and `user_prompt`. | Any future sync script overwrites production prompts. | No. |
| `src/lib/ruoePilotRegeneration.js` | `BRITISH_ENGLISH_BLOCK`, `buildBriefUserPrompt` | English | A | Yes, high, as the seed of the shared contract | Already says think in British English and “Natural British English before exercise convenience.” Only the local pilot path appends it. | Production path never sees this block. | The block itself is the right principle. It does not yet contain the Part 1 substitution test. |
| same | Brief JSON + Style Card text appended to the user prompt | English inputs | A when injected | Do not rewrite the inputs | They steer topic, voice, and arc. | Changing them would break approved allocations. | Style Card reference titles are fine. |
| `src/lib/examPartQualityValidator.js` | `blindSolve`, `rubricReview` (Part 1) | English prompts; Spanish file header | B | Yes, high | This is the only model judge of Part 1 ambiguity. | It asks for one best letter, not four independent substitutions. One mismatch is a warning inside the validator (save is still blocked via `__needsReview`). Two mismatches become a hard error. Absurd or impossible distractors fail the rubric; a second **natural** option does not, unless the model volunteers it. | Blind-solve example reason: “both collocate naturally with …”. |
| same | `blindSolveOpenCloze`, `rubricReviewOpenCloze` (Part 2) | English | B | Yes, high | Judges alternative function words. | Closer to the desired policy than Part 1. Still no shared BE contract. | “which/that” relative example is a real ambiguity case and should stay as a BAD pattern. |
| `src/lib/ruoeAiAdversarialQuality.js` | Part 3 naturalness review | English | B | Yes, high | Judges forced stems and idiomaticity. | “Idiomatic” is not defined as British-English substitution. | No full item. |
| same | Part 5 blind solve | English | B | Yes, high | Tells the model that a tempting distractor is **not** a defect. | Correct for reading MCQ temptation. Must not be copied onto Part 1 cloze, where a natural substitute **is** a defect. | No. |
| same | Part 6 multifit / cohesion | English | B | Yes, medium | Judges whether a sentence genuinely completes two gaps. | Usable. Needs the shared BE voice, not a new architecture. | No. |
| same | Part 7 literal-match solve | English | B | Yes, medium | Flags stems that copy profile wording. | The repair prompt then rewrites the stem. | No. |
| `src/lib/ruoeLocalItemRepair.js` | `repairPart3NoTransformItems` system prompt | English | A (local regen) | Yes, high | Rewrites a stem and a derived word. | “British English B2” is one clause. No naturalness-over-target rule. | No. |
| same | `repairPart5PassageLength` | English | A | Yes, medium | Rewrites the whole article. | Can drift register while “keeping facts”. | No. |
| same | `repairPart7WordMatchQuestions` | English | A | Yes, medium | Rewrites one “Who…” stem. | Paraphrase instruction is good; no BE naturalness check on the new stem. | No. |
| `src/lib/ruoePart4MarkingPointRepair.js` | `regeneratePart4Item` | English | A | Yes, high | Writes a brand-new transformation, including both sentences. | “British English” is one word. The partition example can be copied mechanically. | `do not need to use` → MP1/MP2. Linguistically fine; do not treat it as a model sentence pair. |
| same | Partition, variant, and pedagogy scoring functions | Code | C | No | Objective split of an existing answer. | None for wording, except the regen prompt above. | No. |
| `src/lib/ruoePart4Quality.js` | `AWKWARD_PATTERNS`, `analyzeNaturalness`, `analyzeContextCompleteness`, `detectPart4AlternativeRoutes` | English pattern list | B (narrow) | Yes, medium | Catches a few translationese strings and some dual routes (`WISH`/`REGRET`). | Most unnatural British English will not match these regexes. | `make a photo`, `open the light`, `for to` are good BAD fragments. The list is not a generation standard. |
| same | Distance, difficulty band, metadata coherence, word count | Code | C | No | Structural. | None. | No. |
| `src/lib/ruoePart4MetadataNormalization.js` | Canonical-answer normalisation, contraction pairs | Code | C | No | `do not` / `don't` handling. Comments may be Spanish or English; they are not prompts. | None if the regen prompt is migrated separately. | No. |
| `src/lib/ruoeEditorialQuality.js` | Filler and corporate-abstract regexes; title paraphrase; Part 7 word-match | English patterns | B (narrow) | Low / medium | Judges tone and title, not option naturalness. | A translated sentence with no listed filler still passes. | `leverage`, `holistic approach` are tone flags, not item examples. |
| `src/lib/b2RuoeExamQuality.js` | Part 5–7 overlap, absurd-option, cohesion hint, Part 2/3 category maps | Code + English word lists | C, with a thin B edge | Low | Mostly counts, letters, and keyword overlap. | Cohesion hints are not a linguistic judge. | No. |
| `src/lib/ruoePart6HardValidators.js` | Duplication, multifit heuristic, unused-option fit | Code | C, thin B | Low | Architecture v2 checks. Do not replace with a translated prompt. | Heuristic cohesion can miss a genuinely natural second fit. The AI review covers that. | No. |
| `src/lib/examPartValidation.js` | `validateB2Part1Strict` through Part 7 | Code; messages in English | C | No, except where a warning pretends to judge language | Counts, letters, one-word options, gap markers, 150–180 words, key spread. Part 1 verb/preposition warnings are lexicon lookups, not a substitution test. | A fully natural second option passes every mechanical check. | No. |
| `src/lib/ruoeStyleCardV11.js` | Title-family IDs and paraphrase overlap | Code | C | No | IDs `SC-01`–`SC-06` must stay. | None. | No. |
| `src/lib/ruoeTopicVariety.js` | Bucket names | English labels | C | No | Topic allocation, not wording. | None. | No. |
| `src/lib/ruoeValidationFindings.js` | Finding shape | Code | C | No | Carries English `reason` strings written by callers. | None by itself. | No. |
| Style Cards `…/01_RUNTIME/_style_cards/SC-01.txt` … `SC-06.txt` | Full card prose, injected by the pilot | English. Header says `LANGUAGE British English` | A when injected; otherwise D | Review, do not rewrite IDs | They already ask for a general-reader voice and forbid “Nowadays, X is very important”. | Low if the shared contract sits above them. | Reference titles (`Birth order`, `Amazing fungi!`, `The grass-eating shark`) are pointers, not items to generate. |
| Approved Content Briefs and Transformation Blueprints (JSON) | Topic, family IDs, slot plans | English data | A when injected | **Do not alter** | The plan must keep IDs and allocations. | Rewriting them is out of scope and would change approved exams’ inputs. | Not reviewed as prompt examples. |
| Topic Bank spreadsheet, Usage History notes, Architecture v2 comments | Human / structural | Mixed | D or C | No | Preserve as specified. | None if they are not pasted into prompts. | No. |
| `DRALO_RUOE_System_Quality_Upgrade_v1_0/*` and pilot review markdown | Human review | Mixed ES/EN | D | No | Does not run. | Someone may later paste a Spanish note into an override. | Not runtime. |

---

## 4. Part 1 — distractor audit

### Where generation is defined

Only one place writes Part 1 items:

`buildExamGeneratePrompt()` → activity `multiple-choice-cloze`, level `B2`, in `src/lib/draloAiExamPrompts.js` (the block that starts “Create ONE complete B2 Reading and Use of English Part 1”).

Relevant current rules, paraphrased faithfully:

- All four options must fit grammatically.
- The key is chosen by meaning, collocation, dependent preposition, word partnership, or lexical precision.
- Distractors must be plausible **both grammatically and semantically**. They “must make sense as an idea in that sentence, and fail only because it is not the natural combination in this context.”
- Exactly one option may be the natural combination, and that superiority must be clear. If a competent B2 candidate could defend a second option, redesign the item.
- Adversarially test all four options. If two are defensible, redesign.

### Where validation is defined

| Place | What it actually does | Substitution test? |
|---|---|---|
| `validateB2Part1Strict` | 8 items, A–D, one word, no duplicate words, key letter ≤ 3, gaps (0)–(8), 150–180 words (hard fail only outside 150–200). | No. |
| `blindSolve` | Examiner prompt: pick one best letter; list a gap as ambiguous only if two options are “defensible for a strong B2 candidate”. | No. It does not require writing the full sentence four times. |
| `rubricReview` | Scores naturalness and distractor quality. “Revise” if two answers are defensible, or if distractors are absurd or grammatically impossible. | No. |
| `validateB2Part1Quality` | ≥2 key disagreements → error. 1 disagreement, any `ambiguous` flag, and rubric `revise` → warnings. | No. |
| `collectAmbiguityFindings` | Turns those warnings into `__needsReview`, which blocks automatic save unless `overrideNeedsReview`. | Still no substitution. |
| `ruoeAiAdversarialQuality.js` | Parts 3, 5, 6, 7 only. Part 1 is absent. | — |

There is **no** instruction, in generation or in validation, that says: substitute A, B, C and D independently into the complete sentence, and reject the item if more than one result is natural, grammatical, semantically defensible British English.

### The conflict that produces ambiguous keys

Two sentences in the Part 1 prompt pull in opposite directions:

1. “fail only because it is not the natural combination” plus “make sense as an idea”.
2. “If a competent B2 candidate could defend a second option, redesign.”

A model can satisfy (1) by keeping a distractor that a British speaker might actually say, then satisfy (2) by calling the key “clearly more natural”. That is exactly the failure mode this migration must close: **a distractor is not acceptable merely because it is less idiomatic than the key.**

The negative example in the prompt (“the rain *decided* heavily”) only forbids absurd distractors. It does not show a second option that is genuinely natural.

### Existing examples where a distractor could itself be a valid answer

The Part 1 prompt does **not** embed a full worked item of that kind. The risk is the rule, not a stored key.

The closest embedded cases:

- “heavy rain”, “make a decision”, “take part” are cited as **too obvious** textbook pairings, not as ambiguous sets. They are linguistically fine. They do not teach the substitution test.
- “make a decision” is also the classic pair with “take a decision”, which **is** natural British English. The prompt never puts those two words in one item, but the policy would allow a writer to keep both and call “make” the key. That pattern must be treated as a reject, not as a model.

No published exam JSON was opened or judged in this phase.

---

## 5. Positive-example audit

These strings sit inside generation or repair prompts. None were edited.

| Example | Where | Verdict |
|---|---|---|
| “the rain *decided* heavily” | Part 1 distractor standard | Valid **negative** example of an absurd option. Incomplete as training: it does not show a natural second answer. |
| “heavy rain”, “make a decision”, “take part” | Part 1, “too obvious” | Natural British English. Not ambiguous items. Do not promote them as the only distractor lesson. |
| “do not need to use” / “don't need to use” with MP1 “do not need” and MP2 “to use” | Part 4 prompt and `regeneratePart4Item` | Natural. It teaches **partition**, not sentence naturalness. Safe to keep as a metadata example. |
| “IMPORTANT to book your tickets” | Part 4, bad partition | Not a sentence. Safe as a metadata failure. |
| “is said to have been”, “not as easy as”, “in spite of having” | Part 4 quality | Fragments, not full items. Natural enough. “in spite of” is acceptable British English; do not replace it with a forced American equivalent. |
| “need not have brought” / “needn't have brought” | Part 4 variants | Natural British English. Keep. |
| `DIFFER → differences`, `LONG → length`, `DECIDE → decisive`, `ANXIOUS → anxiety`, `PERFORM → perform` (forbidden) | Part 3 | Formationally correct. `decisive` and `anxiety` are good less-transparent examples. None is a full sentence, so collocation in context is untested. |
| “Who felt overwhelmed when the deadline arrived” → “Who struggled to cope when a work deadline approached without guidance?” | Part 7 paraphrase | The bad stem is a fair copy-warning. The suggested rewrite is slightly translationese (“a work deadline approached without guidance”). A later prompt should replace it with something a British speaker would actually ask, for example: “Who found it hard to cope when a deadline loomed and nobody offered any help?” |
| “at short notice”, “draw a blank”, “get to the bottom of”, “muck in”, “brush aside” | Listening branch of the same file | Natural British English. The **quota** (three idioms per extract) can force unnatural scripts. Out of RUOE scope, but it lives in the file. |
| Style Card forbidden opener “Nowadays, X is very important” | SC-01 | Correct negative example. |

No embedded Part 1 example was found that should be deleted because the distractor is itself the right answer. The policy sentence is the defect.

---

## 6. What is already aligned

`BRITISH_ENGLISH_BLOCK` in `ruoePilotRegeneration.js` already states:

- Think and write in natural British English throughout.
- “Would this sound natural to a competent British English speaker?”
- British spelling, vocabulary, collocations, and phrasing.
- Natural British English before exercise convenience.

Part 4’s own header already says “Naturalness before transformation convenience.”

Those lines should become the shared contract. They must be attached to **production** generation and to every linguistic judge, not only to the local pilot.

---

## 7. Migration priority

| Priority | What | Why |
|---|---|---|
| **HIGH** | Part 1 generation block; Part 1 `blindSolve` and `rubricReview` | Directly create and judge the ambiguous-distractor failure. |
| **HIGH** | Parts 2, 3, 4, 5, 6, 7 generation blocks in `buildExamGeneratePrompt` | They write the English. |
| **HIGH** | `getLevelExamPartSystemPrompt` and a shared contract used by every part | Today the system line does not require British-English reasoning. |
| **HIGH** | `BRITISH_ENGLISH_BLOCK` promoted from pilot-only to the versioned layer | The right principle exists and is not on the production path. |
| **HIGH** | Adversarial prompts for Parts 3, 5, 6, 7 | They judge naturalness, cohesion, paraphrase, and distractors. |
| **HIGH** | Repair / regen prompts: Part 3 item, Part 5 passage, Part 7 stem, Part 4 `regeneratePart4Item` | They write replacement English. |
| **HIGH** | DB override strategy for `levels_exam_part_prompt_overrides` | Otherwise none of the above reaches runtime. Design only; do not write. |
| **MEDIUM** | Part 4 regex naturalness and dual-route checks; editorial filler/corporate lists; Part 6 AI cohesion prompt | Useful but narrow. Extend them under the same contract; do not translate the mechanical core. |
| **MEDIUM** | Discourse-pattern and variety blocks; Style Card prose review | Already English. Check for clashes with the new contract; do not renumber cards. |
| **LOW** | `examPartValidation.js`, Part 4 metadata partition, Part 6 hard validators, title-family IDs, topic buckets, Spanish comments, human docs, approved briefs, blueprints, Topic Bank | They do not teach the model how to write. Leave them. |

---

## 8. Explicit non-actions in this phase

- No production prompt was edited.
- No file under `src/` was edited.
- No exam was regenerated.
- No Content Brief, Topic Bank, Transformation Family, or Style Card ID was altered.
- No validator behaviour was changed.
- Supabase was not read or written.
- `.env.local` was not opened.
