# PILOT_REGENERATION_COMPARISON_COMPLETE_v1_1_2

Generated: 2026-08-17T13:17:43.290Z

Old outputs preserved in `05_OUTPUTS/`. New outputs in `05_OUTPUTS_REGENERATED_v1_1_2/`.

## RUOE-PILOT-E01

### Part 1

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### QA-012
- **Original teacher problem:** Minor target-length drift.
- **Motor rule now addressing it:** Mechanical length targets retained as warning/HARD where configured.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-01\CB-PILOT-001_Part1.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 0
- **Warnings:** 6
- **Warnings:**
  - Part 1 should include at least 1 item decided by a dependent preposition or fixed expression (soft check).
  - Part 1 passage is 183 words; target is 150–180 (accepted up to 200 for generation).
  - 6 of 8 items have all-verb options; aim for at most 4.
  - Rubric verdict: revise. Issues: Most gaps require verbs or verbal forms limiting variety | Some options are grammatically inappropriate (e.g. noun for adverb gap) | Distractors occasionally implausible or weak (e.g. 'accident') | Minor ambiguity in some items | Options are all single words as required
  - Weak item Q2: Some distractors like 'accident' (noun) do not fit grammatically with the blank expecting an adverb.
  - Weak item Q4: Verb choices are similar in meaning; 'consider' is correct but 'make' could confuse due to verb form mismatch.

### Part 2

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** YES (findings match)

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** YES (findings match)

#### QA-012
- **Original teacher problem:** Minor target-length drift.
- **Motor rule now addressing it:** Mechanical length targets retained as warning/HARD where configured.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-01\CB-PILOT-002_Part2.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 0
- **Warnings:** 6
- **Warnings:**
  - Part 2 passage is 189 words; target is 150–180 (accepted up to 200 for generation).
  - Part 2 answers cover only 3 grammar categories (target at least 4: prepositions, relatives, modals, connectors, etc.).
  - [TQ-03] title: Title uses a repeated template frame ("The X that…" / "What happens when…").
  - [TQ-03] title: Title uses a repeated template frame ("The X that…" / "What happens when…").
  - Blind-solve disagreed on Q9 (key "have", solver "showed"). Review this gap.
  - Gaps 9, 13, 16 look trivially easy for B2.

### Part 3

#### QA-002
- **Original teacher problem:** ADAPT→adapt; no prefix/negative variety (stem==answer).
- **Motor rule now addressing it:** P3 derivation variety + stem==answer repair.
- **Still present in new output?** NO / not detected

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### QA-012
- **Original teacher problem:** Minor target-length drift.
- **Motor rule now addressing it:** Mechanical length targets retained as warning/HARD where configured.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-01\CB-PILOT-003_Part3.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 0
- **Warnings:** 4
- **Warnings:**
  - Part 3 transformation variety is low (detected tags: noun, adjective) — soft check.
  - Part 3 has no -ly adverb — include at least one when natural (soft check).
  - Part 3 has no prefix/negative formation — variety target; include when natural (not forced).
  - Quality validator failed to run: Missing } in template expression

### Part 4

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-01
- **Original teacher problem:** Difficulty felt B1+/B2-basic rather than B2-Standard/B2-Strong.
- **Motor rule now addressing it:** Part 4 prompt + ruoePart4Quality difficulty_band policy.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-02
- **Original teacher problem:** Transformations too direct / low transformation distance.
- **Motor rule now addressing it:** transformation_distance validator + naturalness-first prompt.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-03
- **Original teacher problem:** Unnatural S1/S2 phrasing.
- **Motor rule now addressing it:** Naturalness validator + editorial quality.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-04
- **Original teacher problem:** Incomplete context in sentence pairs.
- **Motor rule now addressing it:** context completeness validator.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-05
- **Original teacher problem:** Answer length variety weak (too many 2-word answers).
- **Motor rule now addressing it:** answer-length distribution QUALITY gate.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-06
- **Original teacher problem:** Contraction variants not explicit in accepted answers.
- **Motor rule now addressing it:** accepted variants + contraction-aware marking repair.
- **Still present in new output?** YES (findings match)

#### P4-TEACHER-07
- **Original teacher problem:** Metadata mismatch (family/target_structure vs answer).
- **Motor rule now addressing it:** P4-METADATA-MISMATCH HARD validator.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-08
- **Original teacher problem:** Marking-point partition failures / incoherent MPs.
- **Motor rule now addressing it:** marking-point repair v1.1.1 + P4-MARKING-POINT-MISMATCH.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-01\TBP-PILOT-EX01_Part4.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 6
- **Warnings:** 1
- **Repairs applied:** 1
  - Q26: regen + easier for | me
- **QUALITY findings:**
  - [TEST-P4-VALID-CONTRACTION] Q25: Expanded negative form listed without explicit contraction variant (e.g. need not / needn't).
  - [TEST-P4-TOO-EASY] Q28: Sentence 2 is too parallel to Sentence 1 — little restructuring required.
  - [TEST-P4-ANSWER-LENGTH-DISTRIBUTION] Part 4: Answers concentrate on 2–3 words — insufficient variety within the 2–5 range.
  - [TEST-P4-VALID-CONTRACTION] Q25: Expanded negative form listed without explicit contraction variant (e.g. need not / needn't).
  - [TEST-P4-TOO-EASY] Q28: Sentence 2 is too parallel to Sentence 1 — little restructuring required.
  - [TEST-P4-ANSWER-LENGTH-DISTRIBUTION] Part 4: Answers concentrate on 2–3 words — insufficient variety within the 2–5 range.
- **Warnings:**
  - Part 4: only 1/6 answers use 4–5 words — aim for more variety near the Cambridge maximum (distribution quality check).

### Part 5

#### QA-004
- **Original teacher problem:** Repetitive final paragraphs / filler.
- **Motor rule now addressing it:** Editorial Quality redundancy scan.
- **Still present in new output?** NO / not detected

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-01\CB-PILOT-004_Part5.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 0
- **Warnings:** 4
- **Warnings:**
  - Part 5 question 31: unknown questionType "main-idea / global".
  - Part 5 question 34: unknown questionType "attitude / opinion / tone".
  - Part 5 answer key uses only 2 different letters (target: spread across A–D).
  - Quality validator failed to run: Missing } in template expression

### Part 6

#### QA-007
- **Original teacher problem:** A–G options duplicated inside passage.
- **Motor rule now addressing it:** P6 architecture v2 — no option duplication HARD.
- **Still present in new output?** NO / not detected

#### QA-008
- **Original teacher problem:** Options too short/simple.
- **Motor rule now addressing it:** P6 developed sentence options + cohesion validators.
- **Still present in new output?** NO / not detected

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-01\CB-PILOT-005_Part6.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 2
- **Warnings:** 1
- **QUALITY findings:**
  - [TEST-P6-MULTIFIT] option A: Option may fully fit multiple gaps (heuristic cohesion score).
  - [P6-H07] gap (38): Correct option shows weak backward/forward cohesion clues (heuristic).
- **Warnings:**
  - Quality validator failed to run: Missing } in template expression

### Part 7

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** YES (findings match)

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### QA-012
- **Original teacher problem:** Minor target-length drift.
- **Motor rule now addressing it:** Mechanical length targets retained as warning/HARD where configured.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-01\CB-PILOT-006_Part7.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 2
- **Warnings:** 2
- **QUALITY findings:**
  - [TEST-P7-WORD-MATCH] Q50: Question wording overlaps heavily with a single profile (literal word matching).
  - [TEST-P7-WORD-MATCH] Q50: Question wording overlaps heavily with a single profile (literal word matching).
- **Warnings:**
  - Part 7 question 50: may be solvable by keyword matching in section C.
  - Quality validator failed to run: Missing } in template expression

## RUOE-PILOT-E02

### Part 1

#### QA-001
- **Original teacher problem:** Two distractors/correct answers defensible in P1 Q6/Q8.
- **Motor rule now addressing it:** Adversarial option test; multi-defensible = HARD FAIL.
- **Still present in new output?** YES (findings match)

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### QA-012
- **Original teacher problem:** Minor target-length drift.
- **Motor rule now addressing it:** Mechanical length targets retained as warning/HARD where configured.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-02\CB-PILOT-007_Part1.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **Quality-review HARD (non-blocking mechanical):** 1
- **QUALITY count:** 0
- **Warnings:** 5
- **Warnings:**
  - Part 1 passage is 186 words; target is 150–180 (accepted up to 200 for generation).
  - Solver flagged Q1 as ambiguous (B/C): Both 'involves' and 'demands' collocate naturally with 'a deliberate slowing of the journey' and are appropriate for a B2 level..
  - Solver flagged Q7 as ambiguous (A/C): 'Reflect' and 'consider' both fit the meaning and are suitable collocations with 'on their surroundings'..
  - Rubric verdict: revise. Issues: item 1 has two defensible answers | item 4 preposition on is preferred but not the only possible choice | item 5 subtle difference between inconvenience and bother | item 8 verbs have overlapping meanings
  - Weak item Q1: Two options (A requires and C demands) are very close in meaning, making the best answer debatable

### Part 2

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### QA-012
- **Original teacher problem:** Minor target-length drift.
- **Motor rule now addressing it:** Mechanical length targets retained as warning/HARD where configured.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-02\CB-PILOT-008_Part2.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **Quality-review HARD (non-blocking mechanical):** 1
- **QUALITY count:** 0
- **Warnings:** 3
- **Warnings:**
  - Part 2 repeats the same answer word: to.
  - Part 2 passage is 198 words; target is 150–180 (accepted up to 200 for generation).
  - Part 2 answers cover only 2 grammar categories (target at least 4: prepositions, relatives, modals, connectors, etc.).

### Part 3

#### QA-003
- **Original teacher problem:** Naturalness sacrificed to planned word formation.
- **Motor rule now addressing it:** P3 prompt + Editorial Quality — change stem before unnatural prose.
- **Still present in new output?** YES (findings match)

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### QA-012
- **Original teacher problem:** Minor target-length drift.
- **Motor rule now addressing it:** Mechanical length targets retained as warning/HARD where configured.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-02\CB-PILOT-009_Part3.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 0
- **Warnings:** 2
- **Warnings:**
  - Part 3 has no prefix/negative formation — variety target; include when natural (not forced).
  - Quality validator failed to run: Missing } in template expression

### Part 4

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-01
- **Original teacher problem:** Difficulty felt B1+/B2-basic rather than B2-Standard/B2-Strong.
- **Motor rule now addressing it:** Part 4 prompt + ruoePart4Quality difficulty_band policy.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-02
- **Original teacher problem:** Transformations too direct / low transformation distance.
- **Motor rule now addressing it:** transformation_distance validator + naturalness-first prompt.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-03
- **Original teacher problem:** Unnatural S1/S2 phrasing.
- **Motor rule now addressing it:** Naturalness validator + editorial quality.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-04
- **Original teacher problem:** Incomplete context in sentence pairs.
- **Motor rule now addressing it:** context completeness validator.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-05
- **Original teacher problem:** Answer length variety weak (too many 2-word answers).
- **Motor rule now addressing it:** answer-length distribution QUALITY gate.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-06
- **Original teacher problem:** Contraction variants not explicit in accepted answers.
- **Motor rule now addressing it:** accepted variants + contraction-aware marking repair.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-07
- **Original teacher problem:** Metadata mismatch (family/target_structure vs answer).
- **Motor rule now addressing it:** P4-METADATA-MISMATCH HARD validator.
- **Still present in new output?** NO / not detected

#### P4-TEACHER-08
- **Original teacher problem:** Marking-point partition failures / incoherent MPs.
- **Motor rule now addressing it:** marking-point repair v1.1.1 + P4-MARKING-POINT-MISMATCH.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-02\TBP-PILOT-EX02_Part4.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 6
- **Warnings:** 0
- **Repairs applied:** 7
  - meta: Q25: target_structure → wish + past perfect; MP labels → wish + subject | had + past participle
  - meta: Q26: target_structure → subject + be EXPECTED + to-infinitive; MP labels → passive be + expected | to + infinitive
  - meta: Q27: target_structure → need not have + past participle; fullAnswers synced (2); MP labels → need not have (modal perfect) | past participle complement
  - meta: Q28: target_structure → present perfect + time period + since; MP labels → duration/time frame with since | since + past-event clause
  - meta: Q29: target_structure → make up one's mind; MP labels → made up (phrasal verb) | possessive + mind
  - meta: Q30: target_structure → hardly any + plural noun; MP labels → hardly any quantifier | plural noun continuation
  - Q27: post-meta MP need not | have bought
- **QUALITY findings:**
  - [TEST-P4-ALTERNATIVE-ROUTE] Q25: Keyword + sentence1 pattern may allow a second grammatical route.
  - [TEST-P4-TOO-EASY] Q26: Sentence 2 is too parallel to Sentence 1 — little restructuring required.
  - [TEST-P4-TOO-EASY] Q30: Sentence 2 is too parallel to Sentence 1 — little restructuring required.
  - [TEST-P4-ALTERNATIVE-ROUTE] Q25: Keyword + sentence1 pattern may allow a second grammatical route.
  - [TEST-P4-TOO-EASY] Q26: Sentence 2 is too parallel to Sentence 1 — little restructuring required.
  - [TEST-P4-TOO-EASY] Q30: Sentence 2 is too parallel to Sentence 1 — little restructuring required.

### Part 5

#### QA-005
- **Original teacher problem:** Weak distractors not grounded in passage.
- **Motor rule now addressing it:** P5 adversarial discrimination + grounded distractors.
- **Still present in new output?** YES (findings match)

#### QA-006
- **Original teacher problem:** Question references wrong paragraph location.
- **Motor rule now addressing it:** P5 reference integrity validator.
- **Still present in new output?** NO / not detected

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** YES (findings match)

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** YES (findings match)

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-02\CB-PILOT-010_Part5.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 1
- **Warnings:** 4
- **QUALITY findings:**
  - Part 5 question 32: distractors are weak — fewer than 2 of 3 wrong options are grounded in passage information (P5-WEAK-DISTRACTOR).
- **Warnings:**
  - Part 5 question 32: correct option may be solvable by word matching ("planters with herbs and flowers…").
  - [TQ-03] title: Title uses a repeated template frame ("The X that…" / "What happens when…").
  - [TQ-03] title: Title uses a repeated template frame ("The X that…" / "What happens when…").
  - Quality validator failed to run: Missing } in template expression

### Part 6

#### QA-007
- **Original teacher problem:** A–G options duplicated inside passage.
- **Motor rule now addressing it:** P6 architecture v2 — no option duplication HARD.
- **Still present in new output?** NO / not detected

#### QA-008
- **Original teacher problem:** Options too short/simple.
- **Motor rule now addressing it:** P6 developed sentence options + cohesion validators.
- **Still present in new output?** NO / not detected

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-02\CB-PILOT-011_Part6.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 2
- **Warnings:** 2
- **QUALITY findings:**
  - [TEST-P6-MULTIFIT] option B: Option may fully fit multiple gaps (heuristic cohesion score).
  - [TEST-P6-MULTIFIT] option G: Option may fully fit multiple gaps (heuristic cohesion score).
- **Warnings:**
  - Part 6 passage is 427 words; target is 500–600 (accepted from 350 for generation).
  - Quality validator failed to run: Missing } in template expression

### Part 7

#### QA-009
- **Original teacher problem:** Literal word matching makes item too easy.
- **Motor rule now addressing it:** P7 paraphrase repair + lexical-overlap warning.
- **Still present in new output?** NO / not detected

#### QA-010
- **Original teacher problem:** Grammatical but unnatural / AI-like phrasing.
- **Motor rule now addressing it:** Editorial Quality + Style Cards naturalness standard.
- **Still present in new output?** NO / not detected

#### QA-011
- **Original teacher problem:** Titles feel formulaic/literal.
- **Motor rule now addressing it:** Style Cards title families + editorial title check.
- **Still present in new output?** NO / not detected

#### QA-012
- **Original teacher problem:** Minor target-length drift.
- **Motor rule now addressing it:** Mechanical length targets retained as warning/HARD where configured.
- **Still present in new output?** NO / not detected

#### Regeneration summary
- **Old reference file:** `05_OUTPUTS\EXAM-02\CB-PILOT-012_Part7.json`
- **Mechanical validation:** PASS
- **HARD count (blocking):** 0
- **QUALITY count:** 0
- **Warnings:** 2
- **Warnings:**
  - Part 7 section D is 110 words; target is 120–150 (accepted from 100 for generation).
  - Quality validator failed to run: Missing } in template expression
