# E03 / E04 — CONTENT BRIEF AND TRANSFORMATION BLUEPRINT REVIEW

**Batch:** RUOE-PILOT-02 · **Exams:** RUOE-PILOT-E03, RUOE-PILOT-E04
**Document version:** 1.0 · **Status:** `AWAITING HUMAN APPROVAL`
**Language:** British English · **Level:** CEFR B2

---

## 0. Why this document exists, and what has *not* been done

The instruction was to check first whether approved E03/E04 briefs already existed, and to stop before generating exercises if they did not.

**They did not exist.** A full search of the repository found no Brief Map, no Content Brief, no Transformation Blueprint and no output folder for E03 or E04 — approved, draft or otherwise. The only approved inputs in the system are the twelve E01/E02 Content Briefs and the two E01/E02 Transformation Blueprints.

So this batch is at the proposal stage, and **the pipeline has been stopped at the human-approval gate**, exactly as DR-20 (HARD) requires:

```
Topic Bank + Style Cards + Distribution Rules + Usage History
        ↓
Brief Map                          ← DONE
        ↓
Content Brief Generator            ← DONE (12 briefs, editorial_status: Draft)
        ↓
Brief Validator + Distribution Validator   ← DONE (0 HARD failures)
        ↓
>>> HUMAN APPROVAL <<<             ← YOU ARE HERE. STOP.
        ↓
Part Prompt → Exercise → Validators → Local repair → Final pilot output
```

**No exercise text exists.** No passage, question, gap, option, profile, sentence pair or answer key has been written. No `05_OUTPUTS_PILOT_E03*` or `05_OUTPUTS_PILOT_E04*` folder has been created. Nothing was written to Supabase or to production, and no E01 or E02 file was modified.

---

## 1. What is being proposed

All files live in `02_PROPOSED_INPUTS_E03_E04_v1_0/`, kept separate from `02_APPROVED_INPUTS/`.

| File | Contents |
|---|---|
| `BRIEF_MAP_RUOE_PILOT_E03.md` | Distribution map, HARD/SOFT rule check and fingerprints for E03 |
| `BRIEF_MAP_RUOE_PILOT_E04.md` | The same for E04 |
| `DRALO_RUOE_12_Content_Briefs_E03_E04_v1_0_PROPOSED.json` | 12 Content Briefs, CB-PILOT-013 … CB-PILOT-024 |
| `DRALO_RUOE_Transformation_Blueprints_E03_E04_v1_0_PROPOSED.json` | 2 Part 4 Blueprints, TBP-PILOT-EX03 and TBP-PILOT-EX04 |
| `validate_e03_e04_proposal.mjs` | Read-only validator used to produce the result below |
| `distribution_validation_e03_e04.json` | Machine-readable validator output |
| `E03_E04_BRIEF_AND_BLUEPRINT_REVIEW.md` | This document |

Every brief carries `editorial_status: "Draft"` and `lifecycle_state: "Proposed"`. Every blueprint carries `status: "Draft — awaiting human approval"`. The validator fails the batch if any of these is set to approved.

---

## 2. Validator result

Run with `node .../validate_e03_e04_proposal.mjs`:

| Result | Count |
|---|---|
| **HARD failures** | **0** |
| SOFT warnings | 2 |
| Verdict | `PASS (HARD) — awaiting human approval` |

The two SOFT warnings are the deliberate subtopic reuses in §6.2 below. Everything else passed, including all Part 4 blueprint checks.

---

## 3. E03 at a glance

| Part | Brief | Style Card | Topic | Working angle |
|---|---|---|---|---|
| 1 | CB-PILOT-013 | SC-02 Trend & Social Report | TB-003 · Technology · Social Media + Health | People are narrowing social media rather than leaving it, and describe the change in terms of attention. |
| 2 | CB-PILOT-014 | SC-04 Narrative Story | TB-021 · Work · Business + Entrepreneurship | A weekend dog-walking favour has become eleven dogs, and one afternoon forces a decision about size. |
| 3 | CB-PILOT-015 | SC-03 Personal Reflective | TB-004 · Lifestyle · Hobbies + Daily Life | A hobby survived only once the narrator gave up the two-hour version of it. |
| **4** | **TBP-PILOT-EX03** | — | — | Six key word transformations; blueprint-only per DR-22. |
| 5 | CB-PILOT-016 | SC-01 Curiosity & Explanatory | TB-026 · Science · Inventions + Technology | Why everyday tools end up doing work nobody designed them for, plus a counter-case that did not spread. |
| 6 | CB-PILOT-017 | SC-05 Culture, Travel & Community | TB-045 · Culture · Festivals + Travel | A town festival read through eleven months of preparation rather than three days of spectacle. |
| 7 | CB-PILOT-018 | SC-06 Profiles & Testimonies | TB-025 · Education · Languages + Learning | Four people learning a language outside a classroom, with four different definitions of progress. |

## 4. E04 at a glance

| Part | Brief | Style Card | Topic | Working angle |
|---|---|---|---|---|
| 1 | CB-PILOT-019 | SC-03 Personal Reflective | TB-011 · Health · Mental Health + Daily Life | The week felt heavy because of the number of decisions in it, not the amount of work. |
| 2 | CB-PILOT-020 | SC-02 Trend & Social Report | TB-009 · Technology · Transport + Travel | When a timetable is replaced by a booking, the planning effort moves to the passenger. |
| 3 | CB-PILOT-021 | SC-05 Culture, Travel & Community | TB-044 · Entertainment · Books + Lifestyle | A bookshop that is economically marginal and socially central at the same time. |
| **4** | **TBP-PILOT-EX04** | — | — | Six key word transformations; blueprint-only per DR-22. |
| 5 | CB-PILOT-022 | SC-04 Narrative Story | TB-037 · Education · Skills + Work | An office worker retrains as a roofer and finds the hard part is judgement, not strength. |
| 6 | CB-PILOT-023 | SC-01 Curiosity & Explanatory | TB-012 · Environment · Conservation + Wildlife | The cheapest measure in a river-restoration scheme turned out to be the one that worked. |
| 7 | CB-PILOT-024 | SC-06 Profiles & Testimonies | TB-022 · Travel · Accommodation + Technology | Four hosts who all book online but have drawn four different lines about what stays personal. |

---

## 5. Does this genuinely widen the system's coverage?

This was the explicit requirement: not to recycle E01/E02 topics under new names.

### 5.1 Topic Bank
Twelve Topic Bank entries are used and **none has ever been used before**. After this batch, 24 of the 50 active entries will have been used.

### 5.2 Main Topics
Two Main Topics had never been touched: **MT-02 Education** and **MT-08 Technology**. Both now appear once in each exam.

| Main Topic | E01 | E02 | E03 | E04 | Total /24 |
|---|:--:|:--:|:--:|:--:|:--:|
| MT-01 Culture | 1 | – | 1 | – | 2 |
| MT-02 Education | – | – | 1 | 1 | **2 (was 0)** |
| MT-03 Entertainment | 1 | 1 | – | 1 | 3 |
| MT-04 Environment | – | 1 | – | 1 | 2 |
| MT-05 Health | – | 1 | – | 1 | 2 |
| MT-06 Lifestyle | 1 | – | 1 | – | 2 |
| MT-07 Science | 1 | 1 | 1 | – | 3 |
| MT-08 Technology | – | – | 1 | 1 | **2 (was 0)** |
| MT-09 Travel | 1 | 1 | – | 1 | 3 |
| MT-10 Work | 1 | 1 | 1 | – | 3 |

Every Main Topic now has at least two uses; the maximum is three (12.5%), comfortably inside the DR-07 guidance.

### 5.3 Subtopics
Twenty-two of the twenty-four subtopic slots are **new to the system**. The two exceptions are documented in §6.2.

### 5.4 Style Cards
Across E01–E04 the assignment forms a complete rotation — every Part has used four different cards, and each of SC-01…SC-05 is used exactly four times:

| Part | E01 | E02 | E03 | E04 |
|---|:--:|:--:|:--:|:--:|
| Part 1 | SC-01 | SC-05 | SC-02 | SC-03 |
| Part 2 | SC-05 | SC-01 | SC-04 | SC-02 |
| Part 3 | SC-02 | SC-04 | SC-03 | SC-05 |
| Part 5 | SC-03 | SC-02 | SC-01 | SC-04 |
| Part 6 | SC-04 | SC-03 | SC-05 | SC-01 |
| Part 7 | SC-06 | SC-06 | SC-06 | SC-06 |

No Part is acquiring a habitual content identity (DR-19), no card dominates (DR-11) and no card is repeated on the same Part in succession (DR-12). SC-06 is used only at Part 7, and Part 7 uses nothing else.

### 5.5 Narrative frames, openings and protagonists
Ten opening mechanisms new to the system are introduced: `specific_behaviour`, `scene_with_object`, `abandoned_object`, `familiar_object_defamiliarised`, `off_season_scene`, `counted_detail`, `absent_timetable`, `counter_detail`, `first_day_on_site`, `counter_intuitive_result`. Part 7 keeps `varied_profile_entry`, which is structurally correct for SC-06.

Twelve protagonist types are used. None of the roles DR-16 warns about specifically — `volunteer`, `student`, `researcher`, `traveller`, `entrepreneur` — is reused. The one genuine near-repeat is `office_worker` (E04 Part 1) against E02's `worker`; that is flagged as a SOFT warning in the E04 map rather than glossed over.

### 5.6 Title patterns
Usage History shows the frame *"The X that…"* already used three times (E01 Parts 2, 3, 6) and *"What happens when…"* once (E02 Part 5); the E01 teacher patch raised TQ-03 warnings against both.

Of the twelve working titles here, none uses *"What happens when…"*. However, **four still use a definite noun plus a defining relative clause**, which is the same underlying frame that TQ-03 penalises: *The tool nobody was asked to design*, *The week the streets change shape*, *The decisions I stopped making before nine* and *The shop that lends more than it sells*. Only the last of these uses the literal word *that*, but the shape is close enough that I am flagging it rather than claiming the batch is clean.

This is tolerable because **these are working titles only** and none of them will survive into the exam. Per §13 of the generation instruction, each final title must be chosen from at least three candidates generated *after* the text is stable, must not literally paraphrase the brief title above, and will be checked against TQ-03 at that point. If you would prefer the working titles themselves to be varied now, say so and I will rewrite them before generation.

---

## 6. Everything that needs a decision from you

### 6.1 Part 4 · the two untested families

Blueprint System v1.0 §10 states that TF-11 (Fixed expressions & collocations) and TF-14 (Clause & phrase restructuring) were untested after E01/E02 and *"should be prioritised in the next blueprint batch"*. Both are now scheduled, one per exam:

- **TF-11** → E03 Q30, *do somebody a favour*, keyword `FAVOUR`, B2-Strong
- **TF-14** → E04 Q29, *how deep it is → the depth of it*, keyword `DEPTH`, B2-Standard

Placing one in each exam avoids repeating a brand-new family in neighbouring exams. Family coverage after E04:

| Coverage | Families |
|---|---|
| 2 uses | TF-01, TF-02, TF-03, TF-04, TF-05, TF-06, TF-07, TF-09, TF-10, TF-12 |
| 1 use | TF-08, TF-11, TF-13, TF-14 |
| 0 uses | *(none)* |

**TF-08 Causative** and **TF-13 Quantifiers** are deliberately rested this batch — both were used recently and have narrow B2 target ranges. They should return in E05/E06.

> **Decision 1:** Approve TF-11 and TF-14 placement, and approve resting TF-08 and TF-13.

### 6.2 Two subtopic reuses (the only SOFT warnings raised)

| Brief | Subtopic | Last used | Distance | Why it is proposed anyway |
|---|---|---|---|---|
| CB-PILOT-021 (E04 P3) | ST-048 Lifestyle | E02 Part 6 | 2 exams | E02 used it for a private evening routine; this uses it for a shared high-street reading culture. No shared angle, tension, protagonist or setting. |
| CB-PILOT-023 (E04 P6) | ST-006 Wildlife | E01 Part 1 | 3 exams | E01 used it for individual animal problem-solving; this uses it for habitat recovery at system level. No shared angle, tension, protagonist or setting. |

The Wildlife reuse is unavoidable if Environment is to appear at all: **every remaining MT-04 entry in the Topic Bank pairs a fresh subtopic with an already-used one** (TB-012 Wildlife, TB-020 Oceans, TB-027 Society, TB-042 Sustainability). TB-012 was chosen because Wildlife has the oldest recency of the four. Without it, Environment would sit at 1 use in 24 briefs.

> **Decision 2:** Accept both reuses, or nominate replacements (noting that dropping TB-012 leaves Environment badly under-covered).

### 6.3 The weakest point in the batch: MT-08 in adjacent exams

E03 Part 1 and E04 Part 2 both use **MT-08 Technology with SC-02**. The domains are unrelated — managing an online audience versus running a rural bus service — and the Parts differ, but this is the closest thing to a DR-18 consecutive-exam repetition in the proposal.

The alternative is not free. Swapping E04 Part 2 to TB-001 (AI + Work) would put subtopic `ST-083 Work` in the same exam as Part 5's `ST-083 Work`, which is a worse violation. Swapping to TB-003 is impossible because E03 already uses it.

> **Decision 3:** Accept the adjacency, or ask for a re-plan of E04 Part 2 (which will cascade into E04's Main Topic set).

### 6.4 Three deliberate near-neighbours, flagged honestly

Each of these is a real adjacency that I resolved by changing the angle rather than the topic. Please sanity-check the differentiation:

| New brief | Sits near | How it was separated |
|---|---|---|
| CB-PILOT-019 (E04 P1) | CB-PILOT-011 (E02 P6) — evening routine, work boundaries | E02 relocates the *end* of the working day. This reduces the *number of choices before it starts*. Different time of day, different mechanism, different tension tag. |
| CB-PILOT-015 (E03 P3) | CB-PILOT-009 (E02 P3) — adult learner, musical instrument | E02 is a narrative about performing for others. This is a reflection about session length and private standards, with no audience and no performance. |
| CB-PILOT-022 (E04 P5) | CB-PILOT-004 (E01 P5) — volunteering and career preference | E01 is a first-person reflection about motive. This is a third-person narrative about a technical misjudgement with a physical cost. |

> **Decision 4:** Confirm each separation is sufficient, or send the brief back for regeneration. Under DR-21, only the failed brief would be regenerated.

### 6.5 Topic sensitivity

Every one of the 50 Topic Bank entries is marked `sensitivity_review: Pending policy`, so the field cannot currently discriminate. Two briefs touch areas that would be affected by a future policy:

- **CB-PILOT-013** (Social Media + Health): framed as observable habit change. `fact_safety_notes` forbid clinical claims about mental health, adolescence or addiction.
- **CB-PILOT-019** (Mental Health + Daily Life): framed as everyday workload pressure. `fact_safety_notes` forbid presenting it as diagnosis, treatment or advice.

> **Decision 5:** Confirm both framings, or exclude these topics until the sensitivity policy is settled.

### 6.6 A data inconsistency in the *approved* E01/E02 briefs

While building Usage History I found that three approved briefs carry subtopic IDs that do not match Topic Bank v1.1:

| Brief | Records | Topic Bank v1.1 says |
|---|---|---|
| CB-PILOT-006 | `ST-084 Society` | `ST-082` is Society; `ST-084` is Workplace |
| CB-PILOT-010 | `ST-070 Sustainability` | `ST-072` is Sustainability |
| CB-PILOT-012 | `ST-082 Workplace`, `ST-065 Psychology` | `ST-084` is Workplace; `ST-058` is Psychology |

This proposal uses Topic Bank v1.1 IDs as canonical and treats the *labels* in those briefs as the true history, so the recency checks are still correct. **No E01/E02 file has been modified.**

> **Decision 6:** Note only, or schedule a separate corrective task for the historical briefs.

---

## 7. Part 4 blueprint detail

### 7.1 TBP-PILOT-EX03 — RUOE-PILOT-E03

| Q | Family | Target structure | Keyword | Difficulty | MP1 / MP2 |
|:--:|---|---|:--:|---|---|
| 25 | TF-01 Comparison & degree | negative equivalence with *not as … as* | `AS` | B2-Core | AS + gradable adjective / second AS + standard |
| 26 | TF-02 Conditionals | negative condition with *unless* | `UNLESS` | B2-Standard | UNLESS + subject / affirmative verb after polarity change |
| 27 | TF-05 Reported speech | *advised* + object + to-infinitive | `ADVISED` | B2-Standard | ADVISED + object / TO-infinitive |
| 28 | TF-09 Verb patterns | *have difficulty (in)* + gerund | `DIFFICULTY` | B2-Standard | tensed HAVE + DIFFICULTY / gerund |
| 29 | TF-12 Dependent prepositions | *be responsible for* | `RESPONSIBLE` | B2-Standard | tensed BE + RESPONSIBLE / FOR |
| 30 | **TF-11 Fixed expressions** | *do somebody a favour* | `FAVOUR` | B2-Strong | DO + indirect object / A + FAVOUR |

### 7.2 TBP-PILOT-EX04 — RUOE-PILOT-E04

| Q | Family | Target structure | Keyword | Difficulty | MP1 / MP2 |
|:--:|---|---|:--:|---|---|
| 25 | TF-10 Phrasal verbs | *get rid of* | `RID` | B2-Core | tensed GET + RID / OF |
| 26 | TF-06 Modality | *must have* + past participle (deduction) | `MUST` | B2-Standard | MUST HAVE / past participle |
| 27 | TF-07 Tense & aspect | *this is the first time* + present perfect | `TIME` | B2-Standard | FIRST TIME / subject + present perfect |
| 28 | TF-03 Preference & wish | *would rather* + subject + past simple | `RATHER` | B2-Standard | WOULD RATHER + subject / past-simple verb |
| 29 | **TF-14 Clause restructuring** | wh-clause → nominalised phrase | `DEPTH` | B2-Standard | THE + DEPTH / OF |
| 30 | TF-04 Passive & reporting | *be thought to have* + past participle | `THOUGHT` | B2-Strong | passive BE + THOUGHT / TO HAVE + past participle |

### 7.3 Blueprint rule check

| Rule | E03 | E04 |
|---|---|---|
| P4-DR-01 six slots Q25–Q30 | PASS | PASS |
| P4-DR-02 six distinct families | PASS | PASS |
| P4-DR-03 no repeated keyword in exam | PASS | PASS |
| P4-DR-04 no duplicate target/collision key | PASS | PASS |
| P4-DR-05 no family repeated vs neighbouring exam | PASS | PASS |
| P4-DR-06 no keyword used in E01/E02/E03 | PASS | PASS |
| P4-DR-07 grammar/lexis balance | 3 grammar · 1 pattern · 2 lexical | 4 grammar · 1 lexical · 1 structural |
| P4-DR-10 two marking points planned | PASS | PASS |
| P4-BV-11 difficulty mix | 1 Core · 4 Standard · 1 Strong | 1 Core · 4 Standard · 1 Strong |
| P4-BV-14 example collision | deferred to generation | deferred to generation |

Two blueprint-level warnings are recorded for your attention:

1. **E03 Q28 vs E01 Q29.** Both are noun-plus-gerund frames (`have difficulty doing` vs `there is no point in doing`). Different families, different keywords, two exams apart — but the generation prompt is instructed to keep the sentence contexts clearly unrelated.
2. **E04 Q30 vs E02 Q26.** Both are raised-subject passives with a reporting verb (`be thought to have done` vs `be expected to do`). The perfect infinitive and past reference distinguish them. Please confirm this is enough separation at two exams' distance.

### 7.4 How the E01 blind-solve findings were applied here

You asked whether the four E01 Part 2 blind-solve flags (`if/when`, `was/is`, `best/how`, `in/for`) were taken into account for the blueprint. To be precise about scope:

- Those items are **open-cloze (Part 2)** findings. They do not transfer to Part 4, which has its own uniqueness rule (P4-DR-13: if an item admits a credible alternative route, regenerate that item only).
- What *did* transfer is the **principle**: do not leave uniqueness to be discovered after the item exists. Every one of the twelve slots above now carries an `avoid` block that names the specific competing route to be closed at generation — for example, `UNLESS` must not permit an `if … not` reading, `ADVISED` must not permit a `suggested` reading, `MUST HAVE` must not permit `might have`, and `RATHER` must not permit a present-simple verb after the second subject.
- The same lesson is applied on the Part 2 side through the `avoid` lists in CB-PILOT-014 and CB-PILOT-020, which explicitly forbid gaps whose answer is visible next to them and require a single defensible answer per gap.

---

## 8. Brief Validator results

All twelve briefs were checked against BV-01 … BV-18.

| Brief | Part | Status | Warnings |
|---|---|---|---|
| CB-PILOT-013 | E03 P1 | PASS | Sensitivity framing to confirm |
| CB-PILOT-014 | E03 P2 | PASS | — |
| CB-PILOT-015 | E03 P3 | PASS_WITH_WARNINGS | Similarity vs CB-PILOT-009 |
| CB-PILOT-016 | E03 P5 | PASS | Described object must not read as a commercial product |
| CB-PILOT-017 | E03 P6 | PASS | Architecture v2 mandatory |
| CB-PILOT-018 | E03 P7 | PASS | Word-match check at generation |
| CB-PILOT-019 | E04 P1 | PASS_WITH_WARNINGS | Similarity vs CB-PILOT-011; sensitivity framing |
| CB-PILOT-020 | E04 P2 | PASS_WITH_WARNINGS | DR-18 adjacency with CB-PILOT-013 |
| CB-PILOT-021 | E04 P3 | PASS_WITH_WARNINGS | ST-048 reuse |
| CB-PILOT-022 | E04 P5 | PASS_WITH_WARNINGS | Similarity vs CB-PILOT-004 |
| CB-PILOT-023 | E04 P6 | PASS_WITH_WARNINGS | ST-006 reuse; Architecture v2 mandatory |
| CB-PILOT-024 | E04 P7 | PASS | Word-match check at generation |

Both Part 6 briefs carry the full discourse extension (paragraph functions, discourse links, reference chains, sequencing logic, six removable-sentence opportunities, interchangeability risk). Both Part 7 briefs carry the full four-profile extension with comparison dimensions, controlled overlap, exclusive details, voice differentiation and planned answer distribution.

---

## 9. Approval sheet

Please mark each line. Partial approval is supported: under **DR-21**, only the rejected briefs are regenerated, and the map is then revalidated.

### E03
| Item | Approve | Adjust | Replace |
|---|:--:|:--:|:--:|
| Brief Map E03 | ☐ | ☐ | ☐ |
| CB-PILOT-013 · Part 1 | ☐ | ☐ | ☐ |
| CB-PILOT-014 · Part 2 | ☐ | ☐ | ☐ |
| CB-PILOT-015 · Part 3 | ☐ | ☐ | ☐ |
| TBP-PILOT-EX03 · Part 4 | ☐ | ☐ | ☐ |
| CB-PILOT-016 · Part 5 | ☐ | ☐ | ☐ |
| CB-PILOT-017 · Part 6 | ☐ | ☐ | ☐ |
| CB-PILOT-018 · Part 7 | ☐ | ☐ | ☐ |

### E04
| Item | Approve | Adjust | Replace |
|---|:--:|:--:|:--:|
| Brief Map E04 | ☐ | ☐ | ☐ |
| CB-PILOT-019 · Part 1 | ☐ | ☐ | ☐ |
| CB-PILOT-020 · Part 2 | ☐ | ☐ | ☐ |
| CB-PILOT-021 · Part 3 | ☐ | ☐ | ☐ |
| TBP-PILOT-EX04 · Part 4 | ☐ | ☐ | ☐ |
| CB-PILOT-022 · Part 5 | ☐ | ☐ | ☐ |
| CB-PILOT-023 · Part 6 | ☐ | ☐ | ☐ |
| CB-PILOT-024 · Part 7 | ☐ | ☐ | ☐ |

### Batch decisions
| # | Decision | Approve | Change |
|:--:|---|:--:|:--:|
| 1 | TF-11 and TF-14 placement; TF-08 and TF-13 rested | ☐ | ☐ |
| 2 | ST-048 Lifestyle and ST-006 Wildlife reuses | ☐ | ☐ |
| 3 | MT-08 Technology in adjacent exams (E03 P1 / E04 P2) | ☐ | ☐ |
| 4 | The three near-neighbour separations in §6.4 | ☐ | ☐ |
| 5 | Sensitivity framing for CB-PILOT-013 and CB-PILOT-019 | ☐ | ☐ |
| 6 | Historical subtopic-ID inconsistency: note only | ☐ | ☐ |

---

## 10. What happens after approval

Once approval is recorded, the next run will produce — and only then:

- `05_OUTPUTS_PILOT_E03_v1_0/EXAM-03/` and `05_OUTPUTS_PILOT_E04_v1_0/EXAM-04/`, seven JSON files each
- `HUMAN_REVIEW_RUOE_PILOT_E03_v1_0.md` and `HUMAN_REVIEW_RUOE_PILOT_E04_v1_0.md`, each with Vista alumno and Vista revisor for all seven Parts
- `RUOE_PILOTS_E03_E04_GENERATION_REPORT_v1_0.md`
- `pilot_e03_e04_manifest.json`

All generated exercises will carry `PENDING_HUMAN_REVIEW`. No Supabase sync, no production write, no publish, no modification of E01 or E02, and no overwriting of any historical output.

---

## 11. STOP

**The E03 and E04 Content Briefs and Part 4 Blueprints have not been human-approved. Generation stops here.** No Part will be produced until this document is signed off.
