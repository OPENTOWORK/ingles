# DRALO Writing Engine — Implementation Plan

**Document 07 of the DRALO Writing Assessment Engine package · Version 1.0 · 9 August 2026**

Status: *Vigente — **Gate R0 CLOSED and accepted** (9 August 2026). D1–D4 resolved. Appendix B baseline recorded. **Phase 1 COMPLETE** (approved 9 August 2026). **Phase 2 COMPLETE / CLOSED** (9 August 2026). **Phase 3 COMPLETE** (9 August 2026) — awaiting review. Phase 4 not started.*

**R0 acceptance constraints (binding for all subsequent work):**

- Do **not** modify the current production Assistant, its `response_format`, or its instructions.
- Do **not** modify `OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS` in Vercel.
- Do **not** update Vercel to point at the live Assistant (`asst_yiuK…jrLk`).
- The verified effective production Writing path is **Chat Completions fallback** (stale/deleted Assistant ID → 404 → `draloChatCompletion`). See §0.2.2 and Appendix B.
- The live Assistant + `response_format: json_object` incompatibility remains documented as **latent legacy risk** (B-01, §0.2.1).

Source of truth: Documents 01–04 (product/pedagogy/UX), 05 (technical contract), 06 (acceptance).
Where legacy behaviour conflicts with those documents, **the documents win**.

---

## 0. Gate R0 — Runtime configuration verification

### 0.1 Production environment variables (verified, not modified)

Read via `vercel env ls production` on project `carlos-projects-fef4821d/english-practice`.

| Variable | Present in Production? | Effective runtime value |
| --- | --- | --- |
| `DRALO_USE_OPENAI_ASSISTANTS` | **No** | `undefined` → `assistantsEnabled()` = `false` |
| `DRALO_WRITING_CORRECTION_V2_ENABLED` | **No** | `undefined` → `isWritingCorrectionV2Enabled()` = `false` |
| `DRALO_WRITING_CALIBRATION_ENABLED` | **No** | `undefined` → `isWritingCalibrationEnabled()` = `false` |
| `OPENAI_MODEL_CAMBRIDGE` | **No** | `undefined` |
| `DRALO_OPENAI_MODEL` | **No** | `undefined` |
| `OPENAI_MODEL` | **No** | `undefined` → `getDefaultModel()` = `'gpt-4o'` |
| `OPENAI_API_KEY` | Yes (encrypted) | set |
| `OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS` | **Yes (encrypted)** | set |
| `NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED` | Yes (encrypted) | set (unrelated flag: B2 numeric scoring) |

No variable was created, modified or deleted.

### 0.2 What production actually runs today — three corrections to the earlier audit

**(a) Writing correction is routed to the OpenAI Assistants API whenever the configured Assistant ID
resolves.**
`evaluateCambridgeEssay` calls `cambridgeChatCompletion` → `cambridgeViaAssistantOrChat`
(`src/lib/draloAiEngine.js:143`). The branch condition is:

```js
if (assistantId && client && options.useAssistant !== false)
```

It does **not** consult `assistantsEnabled()`. `getCambridgeExamsAssistantId()` returns
`OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS`, which **is set in production**, and the writing call never
passes `useAssistant: false`. Therefore `DRALO_USE_OPENAI_ASSISTANTS` is irrelevant to writing.

One important qualification: the `catch` at `draloAiEngine.js:167` swallows **only** `404` /
`no assistant found` and then falls through to Chat Completions. So a *stale or deleted* Assistant ID
in production would silently downgrade writing to Chat Completions with `getDefaultModel()` — and
`ai_usage_logs.model` cannot distinguish the two paths, because `handleExamWritingCorrection` logs
`usageFromTextEstimate(getDefaultModel(), …).model`, an estimate, not the model the engine actually
used. Any error other than 404 — including the `400` documented in §0.2.1 — is rethrown and reaches
the student as a 500.

Consequences **when the Assistant ID resolves** (i.e. when the configured ID points at a live Assistant):

- The effective model is whatever the Assistant is configured with **in the OpenAI dashboard**. It is
  not `gpt-4o`, and it is not controlled by any environment variable. `getDefaultModel()` and
  `OPENAI_MODEL_CAMBRIDGE` only apply on the Chat Completions fallback path.
- `temperature: 0.25` is **discarded**: `assistantCompletion` builds
  `runParams = { assistant_id }` and never passes temperature (`src/lib/draloAiEngine.js:208`).
- The `system` message is **not** dropped on the Cambridge path — `buildCambridgeAssistantUserMessage`
  prepends it to the user message. But `mergeCambridgeSystem()` is only applied on the chat fallback,
  so the two paths do not send identical instructions.
- Telemetry is wrong: `assistantCompletion` returns `model: assistantId`, so logs record an assistant
  ID where a model name is expected.

**Production today does not take this path for Writing.** See §0.2.2.

### 0.2.1 — D1 RESOLVED: recorded legacy production baseline

Retrieved read-only via `GET /v1/assistants/{id}` with header `OpenAI-Beta: assistants=v2` on
9 August 2026. **Nothing was modified.**

| Property | Recorded value |
| --- | --- |
| Assistant name | `DRALO EXAM CAMBRIGDE` *(sic — the name contains a typo)* |
| Assistant ID | The live Assistant in the OpenAI account (`asst_yiuK…jrLk`); **not** the value currently set in Vercel production — see §0.2.2 |
| **Model** | **`gpt-4.1-mini`** |
| Created | 2026-08-02 |
| `temperature` | **`1`** |
| `top_p` | `1` |
| **`response_format`** | **`{"type":"json_object"}`** |
| `tools` | `["file_search"]` |
| `tool_resources` | one vector store attached (`vs_6a6f…a18b`) |
| `description` / `metadata` | none / empty |
| Instruction source | The Assistant's own `instructions` field, 5 390 characters, titled **`# DRALO EXAM COACH`**. It is a generic multi-skill exam-coach prompt covering writing, speaking, grammar, vocabulary, exam generation and CEFR calibration — it is **not** a Cambridge B2 First writing-assessment prompt. |

**Source-of-truth confirmation.** The OpenAI account contains exactly **one** live Assistant
(`GET /v1/assistants?limit=100` → `assistants_total=1`, masked `asst_yiuK…jrLk`, created 2026-08-02).
Production's `OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS` is set in Vercel but its value is not downloadable
(Sensitive). A live production writing test on 9 August 2026 proved that the configured ID does **not**
resolve to this live Assistant — Writing succeeds via the 404 fallback (§0.2.2). **Do not repoint
Vercel to the live Assistant ID** without resolving B-01.

The D1 inspection used local `.env.local` credentials against the same OpenAI account to read the live
Assistant's configuration. That read was documentation only; nothing was modified.

**Effective legacy prompt stack for one writing correction.** Three layers, authored independently and
never reconciled:

1. The Assistant `instructions` (`# DRALO EXAM COACH`), applied by OpenAI at run time.
2. The `system` string from `cambridgeEssayFeedback.js` ("Be precise and exam-focused like a strict but
   fair Cambridge writing teacher… Use emoji section titles"), merged into the **user** message by
   `buildCambridgeAssistantUserMessage`.
3. The `buildB2FirstPrompt` output, also in the user message.

Layer 1 contains its own writing-correction rules that conflict with Documents 01–04: it instructs the
model to *"Estimate CEFR level"* (forbidden by D2), to always produce an *"improved version"* and *"one
short improvement task"*, and it defines the four criteria without band descriptors or evidence
requirements. It also correctly states *"never claim affiliation with Cambridge"*, which is consistent
with the required disclaimer.

**Three defects discovered in the legacy baseline** (documented, not fixed — they belong to the engine
v3 replaces):

- **B-01 · `response_format: {"type":"json_object"}` makes every writing correction fail outright.**
  **Confirmed by live probe on 9 August 2026**, running the real `evaluateCambridgeEssay` with
  production's flag configuration (V2 off, calibration off). The result is not a degraded mark, it is a
  hard failure:

  ```
  ok = false, status = 500, latency = 1.8 s
  400 Thread messages or instructions must contain the word 'json' in some form
      to use 'response_format' of type 'json_object'.
  ```

  The Assistant forces JSON output; `assistantCompletion` only overrides `response_format` when the
  caller supplies one, and the writing call does not, so the Assistant default applies. Neither the
  Assistant instructions nor `buildB2FirstPrompt` contains the token `json`, so OpenAI rejects the run
  before the model is ever invoked. A `400` is not caught by the 404-only fallback, so it propagates as
  a 500 to the student.

  **Blast radius.** Every caller of `cambridgeViaAssistantOrChat` whose prompt lacks the token `json`
  is affected the same way: `evaluateCambridgeEssay`, `ensureMinimumCorrectionCards`,
  `requestShortenedVersion`, `cambridgeSpeakingExaminerTurn` and `answer-justify`. Callers that already
  say "Return ONLY JSON" — exam generation, `examPartQualityValidator`, `draloAiLongTurnPhotos`,
  placement writing — are unaffected, which is why exam regeneration kept working.

  **Not yet established: whether production is in this state.** The production value of
  `OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS` is unreadable (Vercel Sensitive), and `ai_usage_logs.model` is
  an estimate, so it cannot discriminate. Two possible states: the variable resolves to this Assistant
  (writing is down) or it holds a stale ID that 404s (writing silently runs on Chat Completions and
  works). `ai_usage_logs` shows the last `exam_writing_correction` of any kind on **2026-07-30**, three
  days *before* this Assistant was created, so no student has exercised the path since — there is no
  production evidence either way. **Decisive test: submit one B2 writing on the live site.**

  **UPDATE — production test confirmed on 9 August 2026.** A live B2 First writing submission on the
  production site returned a **full, successful** legacy correction (not a 500). Observed payload:

  | Field | Value observed |
  | --- | --- |
  | CEFR | `low B2` with rationale |
  | Content / CA / Organisation / Language | `3/5`, `3/5`, `4/5`, `3/5` |
  | Total | `13/20` |
  | Pass UI | `Pass — B2 standard met`, `Pass mark: 12/20`, green Pass badge |
  | Sections | Main strengths, Main problems, Annotated text (5-colour legend), Study plan, Improved version, Stronger B2 version |
  | Annotation colours | Yellow vocabulary, Blue spelling, Red grammar, Purple content, Green strengths |

  **Conclusion.** Production's `OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS` does **not** resolve to the live
  Assistant inspected in D1 (`asst_yiuK…jrLk`, created 2026-08-02). It must hold a **stale or deleted**
  ID that triggers the 404-only fallback in `draloAiEngine.js:167–175`, so writing runs on **Chat
  Completions** with the legacy plain-text prompt and `extractScore` regex parsing. That is why scores
  parse correctly (13/20, not 0/20) and why `ai_usage_logs` records `gpt-4o` / `gpt-4o-mini` rather
  than an `asst_*` ID.

  **Revised B-01 status.** Production writing is **not currently down**. The confirmed failure mode
  (400 when the live Assistant ID is used) is a **latent outage**: it will activate the moment production's
  variable is updated to point at the current Assistant without also removing `response_format:
  json_object` or passing an explicit `response_format` on every call. Severity: **P1 preventive**, not
  P0 active.
- **B-02 · Effective temperature is 1, not 0.25.** Unmanaged variance on every correction.
- **B-03 · `file_search` over an unaudited vector store.** Writing corrections are silently
  retrieval-augmented from unknown documents, which makes the legacy output unreproducible by
  definition and would fail Doc 06 §7.1 even if everything else were correct.

**Gate R0 is CLOSED and accepted.** The runtime-effective Writing path, model behaviour and visible UI
baseline are fully known and recorded in §0.2.2 and Appendix B.

**This baseline is documentation only.** It does not imply that v3 preserves the Assistants
architecture or the current production fallback. Per §0.4, v3 uses Chat Completions with a pinned model
and schema-constrained output, and must not call `cambridgeChatCompletion`. The live Assistant and the
Vercel variable must **not** be modified as part of this programme (see header constraints).

### 0.2.2 — Verified effective production Writing path (R0 accepted)

Confirmed by live production test on **9 August 2026** (B2 First Part 1 essay, fast-food topic).

| Fact | Recorded value |
| --- | --- |
| Effective route | **Chat Completions fallback** — not the OpenAI Assistants API |
| Why | `OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS` in Vercel resolves to a **missing or deleted** Assistant ID. `cambridgeViaAssistantOrChat` receives 404, catches it at `draloAiEngine.js:167–175`, and falls through to `draloChatCompletion` |
| Live Assistant | `asst_yiuK…jrLk` exists in the OpenAI account but is **not** on the effective Writing path |
| Effective model (estimated) | `gpt-4o` via `getDefaultModel()` (consistent with `ai_usage_logs` entries for `exam_writing_correction`) |
| Prompt stack on this path | `mergeCambridgeSystem(system)` + `buildB2FirstPrompt` → plain-text output with emoji section headers → `extractScore` / `extractCefrLevel` regex parsing |
| V2 / calibration | Off (variables unset) |
| Sample scores observed | Content 3, CA 3, Organisation 4, Language 3 → **13/20** |
| Visible UI | Documented in **Appendix B** |

**Binding constraints (R0 acceptance):**

1. Do **not** modify the live Assistant (`asst_yiuK…jrLk`), its `response_format`, or its instructions.
2. Do **not** change `OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS` in Vercel.
3. Do **not** repoint Vercel to the live Assistant ID.
4. B-01 (live Assistant + `response_format: json_object` → 400 when ID resolves) stays documented as
   **latent legacy risk** only — it is not an active production outage because production never hits
   that Assistant for Writing today.

**Implication for v3.** The Writing Engine v3 is a **new** Chat Completions pipeline with its own
pinned model and JSON contracts. It does not depend on fixing, repointing or reusing the legacy
Assistant configuration.

**(b) The V2 code path is dead in production.** `isWritingCorrectionV2Enabled()` requires the string
`'true'`; the variable does not exist. Everything gated behind `v2 && isB2First` has never executed in
production. This materially de-risks the migration — most forbidden behaviours are already dormant.

| Legacy behaviour | Gated by V2? | Active in production today |
| --- | --- | --- |
| `buildWordCountRules` (graduated word-count penalty) | Yes | **No** |
| `normalizeDecimalScores`, `normalizeCefrLevelLine`, `dedupeCorrectionCards` | Yes | **No** |
| `stripInRangeWordCountClaims`, `reclassifyImpliedTaskMatch` | Yes | **No** |
| `applyCefrScoreCoherence` | Yes | **No** |
| `applyImplicitOnTaskContentFloor` | Yes | **No** |
| `ensureMinimumCorrectionCards` | Yes | **No** |
| `enforceImprovedVersionLength` | Yes | **No** |
| `resolveB2Readiness` / readiness badge | Yes | **No** |
| `applyTaskRelevanceClamp` | **No** — called unconditionally | Called, but `taskMatch` is `null` outside V2, so it is a **no-op** |
| `extractScore` / `extractCefrLevel` | No | **Yes** |
| `injectServerAnnotatedText` (`[[gram]]` markup) | No (B2 only) | **Yes** |
| `required = 12`, `passed = total >= 12` | No | **Yes** |
| Legacy prompt line `Target length when relevant: 140–190 words` | No | **Yes** (soft length instruction) |

**(c) An Interactive Writing Map already exists in embryonic form.**
`src/components/writing/WritingInteractiveAnnotatedText.js` already implements click-only activation,
a single active popup (opening a new span replaces the previous one), Escape-to-close, click-outside
dismissal and `role="dialog"`. `WRITING_ANNOTATION_LEGEND` already defines five categories.
Document 04's core interaction is roughly 60–70 % built; it needs a sixth category, colour/category
decoupling, offset-based data instead of inline markup, and a mobile bottom sheet.

### 0.3 Closed product decisions applied throughout this plan

1. **Scope v1: Cambridge B2 First only.** A2 and all other levels stay on the legacy engine.
2. One writing returns **four independent whole-band marks 0–5** plus their **raw sum /20**.
3. **No learner-facing Pass / Fail, no "B2 standard met", no CEFR inference from one writing.**
4. **`level_indicator` is always `null`** in v1 and `single_task_scale_claim_allowed` is always `false`.
5. **`legacy_product_progression_rule`** — the 12/20 threshold survives **only** inside the legacy DRALO
   progression, stars and gating system. See §0.3.1.
6. Semantic annotation categories are a **CLOSED** set: `grammar`, `vocabulary`, `spelling`,
   `organisation`, `content`, `strength`.
7. **`category_key` is independent from colour.** Colour is resolved at render time from separate
   semantic design tokens derived from the existing DRALO visual system. No colour information is
   stored, returned or inferred by the engine. Palette approval is required before **R6** but does not
   block engine or data implementation.
8. The current DRALO design system and components are the **visual source of truth**. Document 04
   defines architecture and behaviour, not a replacement theme.

### 0.3.1 — `legacy_product_progression_rule`

D2 removes Pass/Fail from the learner experience but the DRALO progression system still needs a
boolean to award a star and unlock the next exercise. That boolean is preserved, renamed and quarantined.

| Aspect | Definition |
| --- | --- |
| Identifier | `legacy_product_progression_rule` |
| Definition | `raw_total >= 12` where `raw_total` is the sum of the four Cambridge criterion marks |
| Purpose | Legacy DRALO product progression only: `Levels_stars`, Stars Way unlocking, `levels_estadisticas` |
| Owner | Product progression layer (`src/utils/levelsB2PartScoring.js`), **not** the Writing Engine |
| Consumes | The `/20` after it has been finalised and validated |
| May influence | Nothing upstream. It is strictly read-only with respect to assessment. |
| **Must never** | Alter a criterion mark, alter assessment reasoning, appear in any prompt, appear in any `assessment_record` or `feedback_payload` field, or be rendered in the Writing feedback UI |
| Learner-facing? | **No.** Never shown as Pass, Fail, "12/20 to pass", a readiness badge or a CEFR claim. The student sees only the four marks, the `/20` and the DRALO-estimate disclaimer. |
| Status | Temporary. Retire when the progression system is redesigned; it is not part of the Cambridge construct. |

Enforcement is structural, not documentary: the v3 contracts contain no `passed` or `required` field,
so the progression rule has to be computed outside the engine, by the caller, from `raw_total`.
A dedicated validator (`validateNoProgressionLeakage`) rejects any payload that reintroduces one.

### 0.4 Target architecture

Mirrors the existing, proven `src/features/speaking/` module (TypeScript + zod + `domain` / `services`
split). `zod@3.24`, `typescript@5.9.3` and `tsconfig.json` are already in the repo.

```
src/features/writing/
  domain/
    schemas.ts              zod schemas for all four contracts + validation result
    types.ts                z.infer types
    categories.ts           the six category keys (colour-free)
    engine-version.ts       version constants + document version registry
  services/
    llm/writing-llm.adapter.ts        structured-output OpenAI client (pinned model)
    analysis/task-analysis.service.ts
    observation/observation.service.ts
    assessment/assessment.service.ts
    feedback/feedback-composer.service.ts
    validation/deterministic-validators.ts
    validation/evidence-binding.ts
    persistence/writing-engine.repository.ts
    orchestrator/run-writing-engine.ts
  prompts/
    task-analysis.prompt.ts
    observation-assessment.prompt.ts
    feedback-composition.prompt.ts
    knowledge/                        distilled Doc 01/02/03/04 rule blocks, versioned
```

**Call strategy** (Doc 05 §2.1 preferred benchmark):

| Stage | Call | Cacheable | Learner context passed? |
| --- | --- | --- | --- |
| A — Task Analysis | 1 call | **Yes**, per task fingerprint. Amortises to ~0 per submission. | No |
| B + C — Observation + Assessment | 1 call, two strictly separated output objects | No | **No — deliberately excluded** |
| D — Feedback Composition | 1 call | No | Yes |

**Steady-state cost is 2 calls per submission** once the task-analysis cache is warm, because task
prompts are fixed exam content in `levels_preguntas` and are identical for every student.

Excluding `learner_context` from the B+C call is the structural guarantee for Doc 03 §1.6 / Doc 06
SC-08: learner history physically cannot contaminate the marks because the scoring call never receives
it. Full A/B/C/D separation (4 calls) stays available behind config and is benchmarked at R7.

**Model configuration.** The new engine does **not** use `cambridgeChatCompletion`. It uses a dedicated
adapter calling Chat Completions with `response_format: { type: 'json_schema', strict: true }` and a
**pinned dated model snapshot** in a new variable `DRALO_WRITING_ENGINE_MODEL` (recommended default
`gpt-4o-2024-08-06`, the earliest snapshot with Structured Outputs). Pinning is mandatory: Doc 06 §7.1
requires the twelve golden profiles to reproduce exactly under a fixed configuration, which is
impossible while the model is an opaque dashboard-managed Assistant.

---

## Phase 1 — Data contracts and schemas — **COMPLETE** (9 August 2026)

Delivered as planned. Created `domain/schemas.ts`, `domain/types.ts`, `domain/categories.ts`,
`domain/engine-version.ts`, `README.md` and `__tests__/schemas.test.ts`; added the
`test:writing-engine` script and taught `scripts/alias-loader.mjs` to resolve relative `.ts`
imports so the Node test runner can load the module. 23/23 schema tests pass, `npm run build`
compiles, and no database, API, prompt, UI or legacy-engine behaviour changed. **R1 satisfied.**

| Field | Detail |
| --- | --- |
| **Files to create** | `src/features/writing/domain/schemas.ts`, `domain/types.ts`, `domain/categories.ts`, `domain/engine-version.ts`, `src/features/writing/__tests__/schemas.test.ts` |
| **Files to modify** | None |
| **DB migrations** | None |
| **Inputs** | Documents 05 §3, §4, §5, §6, §9 |
| **Outputs** | `taskAnalysisSchema`, `observationSchema`, `assessmentRecordSchema`, `feedbackPayloadSchema`, `validationResultSchema`, `engineExecutionSchema`, and inferred types |
| **OpenAI calls** | 0 |
| **Model/config** | N/A |
| **Deterministic vs LLM** | 100 % deterministic |
| **Tests** | SC-01, SC-02, SC-03, SC-05, SC-07 as pure schema tests. `criterionMarkSchema = z.number().int().min(0).max(5)` must reject `3.5`. `rawTotal` validated with `.superRefine` against the sum of the four marks. |
| **Feature flag** | None needed — nothing is wired yet |
| **Rollback** | Delete the directory; zero runtime impact |
| **Risk** | **Low.** Only risk is schema drift from Doc 05; mitigated by citing the document section above each schema. |
| **Release gates** | **R1** (100 % of core schema/validator tests pass) |

Non-obvious requirements to encode:

- `assessment_record.criteria.*.why_not_higher` is **required**; `why_not_lower` is required for marks
  1–5. For a Band 5 mark, `why_not_higher` may state that no meaningful limiting evidence exists.
- Bands 2 and 4 require `adjacent_band_evidence` with non-empty concrete content (SC-05). Enforce with
  a refinement, not a comment.
- `annotation.category_key` is `z.enum(['grammar','vocabulary','spelling','organisation','content','strength'])`.
  **No colour field exists in any schema.**
- `feedback_payload.global_result.level_indicator` is `z.null()` in v1 — not optional, explicitly null,
  so a future model cannot quietly start emitting a CEFR label.
- `single_task_scale_claim_allowed: z.literal(false)`.
- There is no `passed`, no `required`, no `cefr` field anywhere in the v3 contracts.

---

## Phase 2 — Task Analysis — **COMPLETE / CLOSED** (9 August 2026)

### Phase 2 patch — closed decisions applied

**Three classifications, not two.** The contract now distinguishes
`mandatory_genre_conventions` (binary conventions Doc 01 treats as essential, or made mandatory by
task wording), `core_genre_expectations` (what the genre must *achieve*) and
`recommended_genre_features` (optional techniques). A core expectation carries
`binary_completion_check: false` as a literal, so failing to meet one can never be turned into a
task-completion failure. The contract rejects any core expectation restated as a mandatory
convention, even when the task wording appears to demand it.

**No criterion routing in Layer 1.** Task Analysis describes what the task and genre require or
expect; it never pre-assigns anything to a Cambridge criterion. `primary_criterion`, `criterion`,
`score_effect`, `band_effect`, `deduction` and `penalty` are forbidden keys, enforced by
`findForbiddenTaskAnalysisKeys` and by a regression test across all six genres. Whether an
observation is relevant to Content, Communicative Achievement, Organisation or Language is decided
in Layer 3 against the actual script and the Cambridge descriptors.

| Genre | Classification |
| --- | --- |
| Article — engaging the reader | core expectation (no criterion assigned) |
| Article — interesting title, rhetorical questions, personal experience, colourful language, memorable ending | recommended |
| Review — reader awareness | core expectation (no criterion assigned) |
| Review — recommendation / final judgement | mandatory **only** when the task wording requires it |
| Essay — title | recommended, never mandatory |
| Essay — coherent organisation | **removed** from Layer 1; organisation quality is assessed downstream |
| Formal email — suitable formal phrases | conditional on the actual communicative function, never universal |
| Report — title, purpose introduction, headings, objective organisation | mandatory (unchanged) |
| Report — recommendations or conclusions | conditional on task wording (unchanged) |

**Essay.** The convention derived from *"Different organisations are acceptable if they are coherent
and fully answer the task"* has been deleted. Essay requirements now come only from explicit task
content points, required communicative functions and the reader/register where supportable.

**Email formality.** `formal_email` and `informal_email` remain the canonical resolved types.
`letter` is an input-normalisation alias only and is **not** in the closed task-type enum. The
wording heuristic survives as a Phase 2 fallback but resolves with `confidence: 'low'` and an
explicit provenance note stating it is not authoritative task metadata; genuinely ambiguous wording
stays unresolved rather than guessed.

**Target reader.** Resolution order is explicit task wording (with a verified quote) → trusted
structured metadata → unambiguous inference → unresolved. `target_reader` is nullable and the
contract rejects both a null reader claiming to be resolved and a resolved reader with a value
invented to complete the schema.

**Word guidance.** The field keeps the name `word_guidance`. It now records `source`
(`task_wording`, `task_metadata`, `exam_configuration`, `default_b2_first`) so a 140–190 range is
always traceable to trusted configuration. `automatic_penalty` remains the literal `false`.

**Stable content-point IDs.** IDs are no longer taken from the model's array order. Each requirement
is bound to its verified evidence in `source_task_text`, ordered by position in that text, tie-broken
by normalised semantic text, de-duplicated, and only then numbered `cp01`, `cp02`, … The same
ordering is applied to required functions and to wording-derived conventions; Doc 01 conventions keep
their document order. A regression test feeds the same requirements in a different array order and
asserts that the entire resolved task analysis is byte-identical.

### Integration requirement before v3 production cutover

**Existing B2 task data must supply formal vs informal email type explicitly wherever it is known**,
so production scoring does not depend primarily on text heuristics. `src/data/b2WritingTasks.js`
currently records `writingType: 'email'` for Part 2 option 2, which the engine can only disambiguate
heuristically. This is tracked as **D9** in §13.2. No production task data was modified in this patch.

---

**As built, with two deviations from the table below.**

1. **No database migration was executed.** `writing_task_analyses` is deferred to Phase 7 by
   product instruction. Cache identity (`task_content_hash`, `task_fingerprint`, `cache_key`) is
   computed as pure deterministic code and returned in provenance, but nothing is persisted.
2. **The mandatory/recommended split is enforced structurally, not only by convention.**
   Doc 01 rules are encoded in `prompts/knowledge/doc01-genre-rules.ts` as three separate sets:
   `mandatory_conventions`, `conditional_conventions` (wording-dependent) and
   `recommended_features`. A convention may only be marked mandatory by task wording when a quote
   from that wording is verified against the task text, and the contract rejects any Doc 01
   recommendation appearing as mandatory with origin `doc01_genre_rule`.

Additional as-built notes:

- `register` is taken deterministically from Doc 01 per genre, not from the model.
- The model never receives or emits identifiers; `cp01`/`fn01`/`gc01`/`rf01` are assigned by code
  after de-duplication on normalised text.
- Task-type resolution follows the agreed order and records every step in
  `provenance.task_type_resolution`. `email` from legacy DRALO metadata is treated as ambiguous
  and resolved by deterministic formality detection, never assumed.
- The benchmark model is pinned (`gpt-4o-2024-08-06`, `temperature: 0`, `json_schema`) and an
  unpinned model id is rejected at runtime. This does **not** approve the model for assessment.

77/77 Writing Engine tests pass (23 Phase 1 + 54 Phase 2 including both patches), `npm run build`
compiles. **R2 satisfied for the Doc 01 acceptance tests implemented in this phase.**

| Field | Detail |
| --- | --- |
| **Files to create** | `services/analysis/task-analysis.service.ts`, `prompts/task-analysis.prompt.ts`, `prompts/knowledge/doc01-genre-rules.ts`, `__tests__/task-analysis.test.ts` |
| **Files to modify** | None |
| **DB migrations** | `writing_task_analyses` (see Phase 7; created early so the cache exists from the first run) |
| **Inputs** | `task_prompt` (from `levels_preguntas.enunciado`), optional `task_type`, Doc 01 genre rules |
| **Outputs** | `task_analysis` object per Doc 05 §4 |
| **OpenAI calls** | **1 per unique task**, then 0 — cached by `task_fingerprint = sha256(normalised task_prompt + task_type)` |
| **Model/config** | `DRALO_WRITING_ENGINE_MODEL`, `temperature: 0`, `strict: true` JSON schema |
| **Deterministic vs LLM** | LLM extracts `mandatory_content_points`, `target_reader`, `communicative_purpose`, `register`, `ambiguities`. **Deterministic**: `task_type` normalisation, stable `cp{n}` ID assignment, `word_guidance` (from the caller, never inferred by the model), and the hardcoded `automatic_penalty: false`. |
| **Tests** | TR-ESS-01, TR-ESS-02, TR-EMI-01, TR-EMF-01, TR-ART-01, TR-REP-01, TR-REV-01, TR-REV-02, SC-01, SC-06 |
| **Feature flag** | `DRALO_WRITING_ENGINE_V3_ENABLED` (off). The service is callable from a script for fixture generation before any UI exists. |
| **Rollback** | Delete the cache table rows; no user-visible surface |
| **Risk** | **Medium.** `levels_preguntas.enunciado` is free text with no genre metadata, so `task_type` inference can be wrong for Part 2 options. Mitigation: `src/data/b2WritingTasks` already carries structured Part 1/Part 2 task definitions (used by `examModeWritingScore.js`) — pass `task_type` explicitly from there and only infer as a last resort, logging every inference. |
| **Release gates** | **R2** (all Doc 01 acceptance tests pass) |

Critical rule to encode: `recommendations_not_requirements` must be populated for every genre, and
downstream stages may never treat an entry in that array as a mandatory point. This is what blocks
REG-04 (optional-genre checklist penalty) at the source rather than in the prompt.

---

## Phase 3 — Teacher DNA observation extraction — **COMPLETE / CLOSED** (9 August 2026)

| Field | Detail |
| --- | --- |
| **Files created** | `services/observation/observation.service.ts`, `services/validation/evidence-binding.ts`, `services/validation/intent-preservation.ts`, `prompts/knowledge/doc02-teacher-dna-rules.ts`, `prompts/observation-extraction.prompt.ts`, `__tests__/observation.test.ts` |
| **Files modified** | `domain/schemas.ts`, `domain/types.ts`, `README.md`, `package.json` (test script) |
| **DB migrations** | **None in Phase 3.** `writing_observations` remains deferred to Phase 7 |
| **Inputs** | `candidate_response`, `task_analysis`, `model_config`. **Nothing else — see §3.1 below** |
| **Outputs** | `observation_extraction_result`: base strategy, observations, pattern groups, binding failures, provenance |
| **OpenAI calls** | 0 in production (no wiring exists). 1 logical call in the separated configuration; the logical boundary survives a later physical merge with Phase 4 |
| **Model/config** | Pinned dated snapshot, `temperature: 0`, `strict: true` JSON schema. An unpinned model id is rejected and there is no implicit client |
| **Tests** | 39 tests: Doc 02 scenarios A–T, score-free and history-free regressions, binding, identity, deduplication, contract guards |
| **Release gates** | **R4** |

### 3.1 Architectural decision — no learner history in this stage

**This supersedes the earlier "learner_context is passed only when A/B/C/D run separated" note.**
The observation call never receives learner history, previous writings, previous scores, previously
taught errors, course progress, exam-date proximity or a previous correction focus — in any
deployment configuration.

The reason is structural rather than stylistic. Observations flow into Cambridge Assessment, so any
history reaching Layer 2 would reach the marks. The pipeline is therefore:

```
candidate_response + task_analysis
        ↓  Phase 3   history-free, score-free observations
        ↓  Phase 4   Cambridge Assessment
        ↓            marks frozen
        ↓  later     learner-history enrichment, pedagogical feedback only
```

A later post-assessment enrichment step may attach confirmed historical recurrence, previously
taught status, longitudinal improvement, course-stage priority and explanation depth. Those fields
must never be visible to Phase 4. No database-backed history enrichment exists yet.

Enforcement: `ObservationExtractionRequest` has no history field; `assertNoLearnerHistory` rejects
one if a future caller adds it; the 13 Teacher DNA rules flagged `requires_learner_context` (R07,
R21, R38, R39, R47, R50, R51 and the course-stage rules) are filtered out of the prompt;
`within_script_frequency` cannot express historical recurrence; and `findHistoryClaims` rejects
longitudinal phrasing in the model's prose instead of absorbing it.

### 3.2 Contract refinements applied in Phase 3

| Change | Reason |
| --- | --- |
| `frequency` → `within_script_frequency` with `isolated` / `repeated_in_script` / `systematic_in_script` / `not_applicable` | The old enum contained `confirmed_recurring_history`, a state Phase 3 cannot know. That state moves to post-assessment enrichment |
| Observation-level `correction_mode` → result-level `base_correction_strategy` (`comprehensive` \| `focused`) | Only these two are derivable from the current script. `consolidation`, `exam_readiness` and `exploration` need context Phase 3 does not have; they are preserved in `contextualCorrectionModeSchema` for a later overlay rather than fabricated |
| Domain enum gains `naturalness` | Doc 02 §2.3 and §2.6 treat Spanish transfer and idiomaticity as a distinct pedagogical concern |
| `meaning_blocking` is derived in code from `communicative_impact` | Two sources of truth would eventually disagree; the schema rejects a mismatch |
| `voice_preservation` uses `preserves_stance: true` / `preserves_central_meaning: true` literals | An admitted meaning change becomes structurally unrepresentable, not merely discouraged |
| Added `scope`, `binding_status`, `renderable_locally`, `supporting_evidence`, `pattern_key`, `pattern_group_id` | A genuinely global observation must be able to exist without fake local offsets |

### 3.3 Observation domains are not UI categories

The nine observation domains (`grammar`, `punctuation`, `vocabulary_collocation`, `spelling`,
`organisation_cohesion`, `content_development`, `communicative_appropriacy`, `naturalness`,
`strength`) are internal pedagogical concepts. They are deliberately **not** the six Interactive
Writing Map `category_key` values from D3, and they carry no colour. A valid observation may have no
future local annotation at all — a global register problem belongs in criterion or global feedback
without needing a coloured span.

### 3.4 Selective correction without a quota

There is no minimum, maximum or required mix. Zero observations, zero strengths, one strength and
many observations are all valid outcomes. In focused mode the model names a principal focus, but
every meaning-blocking observation is retained regardless, and `assertMeaningBlockingRetained`
throws if post-processing ever drops one. Recording an observation and displaying it are separate
decisions: evidence is never discarded because the future UI should be selective.

### 3.5 Evidence binding

The model emits `text_quote` and `occurrence_index`; code resolves the offsets against a normalised
projection of the **original** response with an index map back to it, tolerating curly apostrophes,
unicode dashes, collapsed whitespace and case while still reproducing the exact source substring
(`verifyBinding`). The original text is never rewritten to make a quote fit.

Revision to the earlier "dropped, not rendered" safeguard: an unbindable observation is **retained
as evidence but marked `binding_status: 'unbindable'` and `renderable_locally: false`**, and is
listed in `binding_failures`. Offsets are never fabricated. A global observation is
`global_no_local_span` and may cite several bound supporting quotes instead of one span.

### 3.6 Stable identity, deduplication and grouping

`observation_id` is `obs_<12 hex>`, a digest of the candidate-response hash, task fingerprint,
prompt/schema versions, model snapshot, and the observation's own domain, type, polarity, bound span
and normalised diagnosis. Array position is not an input, so reordering the model's output produces
identical ids. Deduplication collapses the same span + domain + diagnosis; separate occurrences of a
repeated pattern survive and share a `pattern_group_id`, so they are taught once. Grouping is
pedagogical treatment, never an error count.

### 3.7 Closed Phase-3 decisions (approved 9 August 2026)

The six ambiguities raised at the end of Phase 3 are resolved and closed. They are not reopened by
later phases without an explicit product decision.

| # | Decision |
| --- | --- |
| 1 | The Phase-3 benchmark temperature remains **0**. The 0.2 figure earlier discussed in this document does not apply |
| 2 | There is **no minimum-strength quota**. Zero genuine strengths is a valid outcome |
| 3 | Foundational grammar priority stays **model-classified and fixture-tested**. No brittle regex grammar detectors are added |
| 4 | `pedagogical_priority` stays **qualitative/ordinal**. No numeric weighted micro-score is created |
| 5 | **No extra LLM call** is added for intent-preservation validation; the deterministic lexical check stands |
| 6 | An unbindable observation may remain as pedagogical metadata, but it may **never** serve as Cambridge scoring evidence unless its underlying evidence can be independently bound to the candidate response |

Decision 6 is enforced in Phase 4 by `buildEvidenceIndex`, which re-binds every quote itself rather
than trusting `binding_status`, and by `evidence_observation_ids` being filtered to ids that survived
that re-binding.

---

## Phase 4 — Cambridge Assessment and Decision Record — **COMPLETE / CLOSED** (9 August 2026)
### R3 — **OPEN: real golden calibration not yet run**

| Field | Detail |
| --- | --- |
| **Files created** | `services/assessment/assessment.service.ts`, `prompts/assessment.prompt.ts`, `prompts/knowledge/doc03-cambridge-descriptors.ts`, `prompts/knowledge/doc03-assessment-rules.ts`, `__tests__/assessment.test.ts` |
| **Files modified** | `domain/schemas.ts`, `domain/types.ts`, `domain/engine-version.ts`, `README.md`, `package.json` (test script), `__tests__/schemas.test.ts` (Phase-1 fixture follows the completed contract) |
| **DB migrations** | **None in Phase 4.** `writing_assessments` and `writing_assessment_criteria` remain deferred to Phase 7 |
| **Inputs** | `candidate_response`, `task_analysis`, optional Phase-3 `observations`, `model_config`. **Nothing else — see §4.1** |
| **Outputs** | `assessment_result`: `assessment_record` (four decision records, `raw_total`, word-count context, status) plus assessment provenance |
| **OpenAI calls** | 0 in production (no wiring exists). 1 logical call; the logical boundary survives a later physical merge with Phase 3 |
| **Model/config** | Pinned dated snapshot, `temperature: 0`, `strict: true` JSON schema. An unpinned model id is rejected and there is no implicit client. **The production assessment model is not approved by this phase** |
| **Tests** | 41 tests: scenarios A–AE plus rule provenance, band-anchor structure, calibration-profile integrity, configuration and prompt guards |
| **Release gates** | **R3 — OPEN.** Unit tests do not close it |

Prompt files were renamed against the original plan: the scoring prompt is `assessment.prompt.ts`
(not `observation-assessment.prompt.ts`, which would have implied the merged call already exists),
and band boundaries live inside `doc03-cambridge-descriptors.ts` next to the anchors they qualify
rather than in a separate `doc03-band-boundaries.ts`.

### 4.1 Strict layer boundary

`AssessmentRequest` has no field for learner history, previous writings, previous marks, course
stage, exam proximity, pedagogical progression, learner personality or feedback preferences, and
`assertNoLearnerHistory` rejects any request that grows one. `provenance.learner_history_available`
is the literal `false`.

Phase-3 pedagogical properties are removed rather than merely ignored. `buildEvidenceIndex` projects
observations into `{ observation_id, domain, quote, span, diagnosis, communicative_impact }` and
drops `pedagogical_priority`, `foundational_importance`, `transferability`, `learning_opportunity`,
`ambitious_attempt`, `knowledge_status`, `within_script_frequency`, the correction strategy, the
principal focus and the Teacher DNA rule ids. They never reach the prompt, so they cannot weight a
mark. `FORBIDDEN_ASSESSMENT_INPUT_KEYS` fails the build of any future structure that reintroduces
them.

### 4.2 Pedagogical selectivity is not scoring selectivity

Phase 3 deliberately does not report everything it could. If the assessment saw only the Phase-3
selection, that pedagogical restraint would silently become a scoring blind spot. Three safeguards
prevent it:

1. the complete candidate response is always supplied and is always authoritative;
2. the evidence index is labelled in the prompt as incomplete by design, carrying no weighting;
3. the model is instructed to look for criterion evidence the index does not mention, and a test
   asserts that a criterion decision can quote text no observation ever selected.

Decision 6 of §3.7 is enforced here: every hint quote is re-bound by `buildEvidenceIndex` against the
response rather than trusted, so an unbindable observation cannot appear, and
`evidence_observation_ids` is filtered to ids that survived re-binding. Observation ids remain
evidence-discovery metadata; Teacher DNA `Rnn` ids are never accepted as scoring authority.

### 4.3 Contract completions applied in Phase 4

| Change | Reason |
| --- | --- |
| `criterionDecisionRecordSchema` gains `band_anchor`, `positive_evidence[]`, `limiting_evidence[]`, `confidence`, `confidence_reason`, `source_rule_ids[]`, `evidence_observation_ids[]` | Doc 03 §9.1 requires the full decision record; the Phase-1 shell held only marks and boundary prose |
| `evidence_quotes: string[]` → `text_evidence: BoundQuote[]` | Doc 03 §9.4 requires every quote to be traceable to the script. Reusing the Phase-3 `boundQuoteSchema` avoids a second evidence vocabulary |
| `adjacent_band_evidence` requires a lower **and** a higher side | Doc 03 §1.2: a band 2 or 4 is a mixed profile, so one-sided evidence cannot justify it. A single `concrete_evidence` string could satisfy the schema while proving only half the claim |
| Added `band_ceiling_reached` / `band_floor_reached`, derived in code from the mark | Makes "band 5 is the top band" and "band 0 has no lower band" structural facts rather than prose the model has to remember. `why_not_lower` is rejected at band 0 |
| `criteria` and `raw_total` became optional on `assessment_record` | An incomplete assessment must carry no marks at all. Previously the schema forced four criterion records, which would have made 0/20 the only representable "unassessable" answer |
| Added `word_count` and `word_count_penalty_applied: false` | Doc 03 §8.1: length is contextual evidence, and recording the literal `false` makes the absence of a penalty auditable |
| `PROMPT_VERSIONS.cambridge_assessment` added alongside `observation_assessment` | Layers 2 and 3 must be able to version independently even if they later share one physical call |

Confidence uses `high | medium | low` — see the closure patch in §4.8.

### 4.4 Band logic and criterion independence

Bands 1, 3 and 5 carry official descriptors; bands 2 and 4 are typed `mixed_profile` and require
concrete evidence from both neighbours. The prompt states that band 4 is not "band 5 minus one
mistake" and band 2 is not a midpoint or a percentage.

Independence is enforced two ways. `isRuleCitableBy` rejects a decision justified only by another
criterion's rulebook — Content reasoned purely from `L08` is a construct error, not a style problem.
`assertCriterionIndependence` rejects a rationale reused verbatim across two criteria, because a
shared textual feature must produce a *different* construct consequence (X01, X09). The band-5
ceiling statement is exempt: at the top of the scale there is no construct-specific comparison to
make. Nothing anywhere adjusts a mark for consistency, and 5/2/2/2 is accepted as normal.

### 4.5 What code owns

`raw_total` is the sum of the four marks. The Structured Outputs schema has no total field, and the
LLM output schema is intentionally non-strict so that a volunteered total is stripped at parse time
and never read — discarded, not reconciled, never averaged. Code also owns evidence binding and
offsets, rule-id validation, the derived ceiling/floor flags, forbidden-behaviour detection over both
the raw model output and the assembled record, word count, and provenance.

`findForbiddenAssessmentBehaviour` is a separate detector from Phase 3's `findScoringLeakage`: Layer 3
legitimately contains marks and bands, so it scans instead for error/connector/paragraph counting,
CEFR, Cambridge Scale claims, pass/fail, 12/20, readiness, half-bands, a fabricated band 6, word-count
and title penalties, and score smoothing.

### 4.6 Incomplete assessment

`checkTaskContext` returns insufficient when `source_task_text` is blank or when no mandatory content
point and no required function could be established, since no requirement map can exist for Content.
The service then returns `status: 'incomplete'` with a reason, no criteria, no raw total and **no
model call at all**. The schema forbids criteria on an incomplete record and forbids a raw total
without criteria, so an unassessable response cannot be expressed as 0/20. The model may also
independently report the response as unassessable.

### 4.7 R3 remains OPEN

Unit tests use injected fake clients. They prove contract behaviour, not calibration. The twelve
official profiles are stored in `OFFICIAL_CALIBRATION_PROFILES` as immutable references and their
internal consistency is asserted, but **no test claims G-01–G-12 pass**, and
`provenance.calibration_status` is the literal `not_calibrated`. R3 closes only when the real scripts
run through the real configured pipeline under Doc 06, in the dedicated golden/calibration phase.
The final assessment model therefore remains gated by R3 and R7.

Forbidden behaviours are stated **explicitly and positively** in the scoring prompt (Doc 05 §11.1): no
error counting, no connector or paragraph counting, no title penalty, no word-count deduction, no score
smoothing, no cross-criterion compensation, no Cambridge English Scale claim from one task. Each has a
matching regression test so the prompt text and the test suite cannot drift apart.

### 4.8 Closed Phase-4 decisions (approved 9 August 2026)

| # | Decision |
| --- | --- |
| 1 | **Confidence is `high \| medium \| low`.** Doc 03 is authoritative. `moderate` is removed from the whole v3 module — schemas, prompts, fixtures, tests, README and this document — with no internal alias. `confidenceSchema` is the single definition, shared by observation confidence, `pedagogical_priority` and assessment confidence |
| 2 | **An unresolved target reader forces `status: 'incomplete'`.** Once Phase 2 has exhausted task wording, trusted metadata and unambiguous inference, `target_reader === null` with resolution `unresolved` means Communicative Achievement has no defensible basis. The engine does not issue a complete /20 with a lowered CA confidence, and does not invent a reader to escape the state |
| 3 | **No partial contract in v1.** `status: 'partial'` and nullable individual marks are not introduced. A wrong-task response is scored across all four criteria when the expected task is known and there is enough text to judge every construct responsibly — Content may legitimately be 0 — otherwise the result is `incomplete`. "Insufficient evidence" never becomes 0/20 |
| 4 | **Criterion independence stays deterministic.** No second LLM call is added to detect semantic paraphrase between rationales. Phase 5 may strengthen the deterministic checks, evidence provenance and construct-specific requirements; subtle double counting is caught by borderline fixtures, golden calibration and human calibration. No score smoothing or automatic criterion correction is permitted |

`checkTaskContext` therefore has three insufficiency routes: blank task text, no requirement map, and
an unresolved target reader.

---

## Phase 5 — Deterministic validation — **COMPLETE / CLOSED** (9 August 2026)
### R3 — **OPEN: real golden calibration not yet run**

| Field | Detail |
| --- | --- |
| **Files created** | `services/validation/deterministic-validators.ts`, `services/validation/forbidden-heuristics.ts`, `__tests__/validators.test.ts` |
| **Files modified** | `domain/schemas.ts` (validation-result contract), `domain/types.ts`, `README.md`, `package.json` (test script) |
| **DB migrations** | `writing_validation_results` (Phase 7) |
| **Inputs** | All structured outputs + original task and response |
| **Outputs** | `validationResultSchema` with `validation_status`, `stage`, `attempt`, `failed_rules[]`, `warnings[]`, `retry_target?`, `retry_reason?` and version metadata |
| **OpenAI calls** | 0 (retries are triggered by, not performed in, this layer) |
| **Model/config** | N/A |
| **Deterministic vs LLM** | 100 % deterministic |
| **Tests** | SC-01 … SC-10, §11 evidence traceability, REG-05, REG-06, REG-11 |
| **Feature flag** | Same master flag |
| **Rollback** | N/A |
| **Risk** | **Medium.** Over-strict validators cause retry storms and cost. Mitigation: cap at 2 retries per stage, record `retry_rate` from day one (Doc 06 §18 makes a persistently high retry rate release-blocking). |
| **Release gates** | **R1**, and it is the mechanism that enforces **R3** |

Validator table, all hard failures unless noted:

| Validator | Rule | On failure |
| --- | --- | --- |
| `validateQuoteExistence` | every `text_quote` / `evidence_quote` exists in `candidate_response` after normalisation | drop annotation, or retry stage if an assessment quote |
| `validateSpanBinding` | quote + occurrence index resolves to unambiguous offsets | retry, then drop |
| `validateScoreSum` | `raw_total` = sum of four integer marks 0–5 | hard fail |
| `validateBandRationale` | `why_not_higher` present; bands 2/4 carry concrete adjacent-band evidence | retry scoring stage |
| `validateCriterionProvenance` | no rationale mentions learner history, effort, course stage or personality (lexical + semantic denylist) | hard fail |
| `validateTaskContext` | missing task prompt ⇒ `status: 'incomplete'` | force incomplete |
| `validateForbiddenHeuristics` | no rationale references error counts, connector counts, paragraph counts, word count as a deduction, or a Cambridge Scale conversion | hard fail |
| `validateNoLevelClaim` | `level_indicator === null` and no CEFR token in any learner-facing string | hard fail |
| `validateNoProgressionLeakage` | no `passed`, `required`, `readiness` or pass-threshold wording anywhere in the payload (D2) | hard fail |
| `validateFeedbackDoesNotAlterMarks` | marks in `feedback_payload` are byte-identical to `assessment_record` | hard fail (SC-10) |
| `validateOpeningStrengths` | 2–3 entries, each referencing a real `strength` observation | fail composition |
| `validateVersionMetadata` | all document, prompt, engine and model versions present | not production-valid |

### 5.1 What was actually built

The validator answers one question — is this output structurally, evidentially and architecturally
valid enough to be accepted? — and has exactly three verdicts: `passed`, `failed`, `retry_required`.
It never rescores, never repairs and never generates. Neither Phase-5 file imports a model client, so
validation is offline and costs nothing; a test greps the source to keep it that way.

**`validation_status`, not `passed`.** The boolean `passed` was removed from the contract. An engine
verdict must not be readable as a student passing, a Cambridge pass, 12/20 or CEFR readiness, and the
old field name made that confusion one careless join away. Schema invariants enforce the rest: a
passing result carries no failed rules, a non-passing result must name them, a retry must name its
target and reason, a hard failure can never be dressed up as a retry, and warnings may only hold
non-blocking items.

**Failure severity drives the retry contract.**

| Severity | Meaning | Verdict |
| --- | --- | --- |
| `hard_failure` | architecturally invalid; regeneration would not help | `failed` |
| `retryable_generation_failure` | a fresh generation could plausibly fix it (missing boundary rationale, missing provenance, absent principal focus) | `retry_required` with `retry_target` |
| `non_blocking_warning` | worth recording, never a reason to reject (version drift) | `passed`, listed in `warnings` |

`retry_target` is the earliest affected stage in the order task analysis → observations → assessment
→ feedback, because a bad task analysis poisons everything downstream. Phase 5 performs no retry
itself: retry limits belong to the orchestrator.

**Marks are immutable.** Every validator is a pure read. An invalid mark/rationale combination is
reported with its rule id, never corrected. The suite deep-freezes fixtures and asserts the input
serialises byte-identically after validation, for both passing and failing records.

**Validator inventory.** `validateTaskAnalysis` (V-TA-01…09): source task, approved B2 First v1
genre, provenance with a pinned dated snapshot, no overlap between mandatory conventions, core
expectations and recommended features, no Cambridge criterion routing, `automatic_penalty === false`,
honest reporting of an unresolved reader. `validateObservations` (V-OB-01…10): no scoring, Cambridge,
CEFR, history or colour fields, `meaning_blocking` derived from communicative impact, local spans
that reproduce the source substring and re-resolve to the same occurrence, grouping that publishes no
count, focused/comprehensive invariants, unbindable observations kept unrenderable.
`validateAssessment` (V-AS-01…16, V-EV-01…05, V-PR-01…03): four criteria, integer marks 0–5, exact
code-derived `raw_total`, band-boundary contracts, evidence traceability, construct provenance and
criterion independence. `validateNoProgressionLeakage` (V-PL) and `validateProvenance` (V-VS) apply
across stages.

**Evidence traceability.** Each `text_evidence` item must reproduce its own `bound_text` at its span
*and* re-resolve from quote plus occurrence index to the same offsets — a forged offset is the
dangerous case, because the record looks traceable while pointing elsewhere. A Cambridge quote does
not need an `observation_id`; the assessment reads the whole response and may find evidence Teacher
DNA did not select. But a cited id must belong to an observation whose evidence binds independently,
so an unbindable Phase-3 observation can never become scoring evidence.

**Criterion independence stays structural.** Each criterion needs its own decision record and at
least one Doc-03 rule belonging to its construct; Teacher DNA `Rnn` ids are rejected as scoring
authority. A rationale reused verbatim across two criteria fails, because the second criterion then
explains no distinct construct consequence. No second model call and no smoothing: 5/2/2/2 passes.

**Forbidden heuristics: precision over recall.** Eighteen rules cover error, connector and paragraph
counting, title and word-count deductions, length caps, smoothing, cross-criterion compensation,
CEFR and Cambridge Scale claims from one response, pass/fail, 12/20, readiness, history-driven
adjustment, pedagogical priority used as a deduction, fractional or weighted scoring, bands outside
0–5, and confidence used to move a mark. Every pattern anchors on the object being counted or an
explicit causal claim rather than on the presence of a number, and `LEGITIMATE_PHRASES` is an
exported guard the suite runs against every rule so "the response contains three mandatory task
points" or "the response shares features of Bands 3 and 5" stay legal.

**Incomplete assessment.** An incomplete result must carry `incomplete_reason` and must expose no
criteria and no `raw_total`; a record calling itself incomplete while reporting 0/20 fails. An
unresolved target reader combined with a complete /20 fails (§4.8 decision 2); the same task analysis
with an incomplete assessment passes.

**Versions.** Engine, schema, all three source-document versions, prompt version and model identity
must be present. A missing model identity fails, and so does an unpinned id such as `gpt-4o` — no
production model is approved for calibration yet. A version that is present but differs from the
current build is a warning, not a rejection, so historical records stay readable.

**Feedback validation is deliberately absent.** Phase 6 does not exist, so no learner-facing Doc-04
rule was invented. `feedback` exists only as a retry target and a stage value.

### 5.1b Closed Phase-5 decisions (approved 9 August 2026)

**1. A count is a fact; a count that explains a band is a heuristic.** The three counting families —
errors, connectors, paragraphs — are now split into two tiers. Metric phrasing (`error count`,
`number of paragraphs`, `count the connectors`, `error threshold`) stays unconditionally forbidden,
because naming a metric is already a scoring instrument. A bare count is judged **per sentence** and
fails only when that same sentence turns it into a scoring consequence, detected either by a causal
connective plus a scoring token or by an explicit limiting verb (`cannot exceed band`, `capped at
band`, `lowers the mark`). So "The response has three paragraphs." passes, and "Only two paragraphs,
so Organisation cannot exceed Band 3." fails. Sentence scoping matters: two adjacent independent
facts must not be welded into a causal claim by proximity. Nothing else was relaxed — CEFR, Cambridge
Scale, pass/fail, 12/20, readiness, smoothing, compensation and history remain unconditional.

**2. Version drift is context-dependent.** `ValidationMode` is now explicit:

| Mode | Drift in engine, schema or document versions |
| --- | --- |
| `current_generation` | hard failure |
| `calibration` | hard failure — a calibrated profile is meaningless if the documents beneath it moved |
| `historical_read` | non-blocking warning, so stored results stay readable |

Readability is not authority: under `historical_read`, a drifted record that still declares
`calibration_status: 'calibrated'` is a hard failure (V-VS-06), so an old result can never
masquerade as a current calibrated one. This is not wired to persistence yet.

**3. The duplicate-rationale threshold is an engineering constant.**
`MIN_DISTINCT_RATIONALE_LENGTH = 25` is exported and documented. Below it, rationales are structural
boilerplate that two criteria may legitimately share; above it, an identical sentence means the
second criterion explained no distinct construct consequence. It is not a Cambridge rule, it can
never move a mark, and it only ever rejects a record. No LLM call was added.

**4. Pedagogical priority is not confidence.** `pedagogicalPrioritySchema` was separated from
`confidenceSchema`. They share three values by coincidence, not meaning: one states how sure the
engine is, the other what deserves the learner's attention first. Neither relates to a mark.

**5. Global baseline, named exactly.** Earlier phases described the four pre-existing failures
loosely by skill. They are, precisely:

| Test file | Failing assertion |
| --- | --- |
| `scripts/test-b2-part3-validator.mjs` | `passage over 200 words fails` |
| `scripts/test-b2-part5-validator.mjs` | `passage under 550 fails`, `passage over 650 fails` |
| `scripts/test-b2-part6-validator.mjs` | `passage under 500 fails`, `passage over 600 fails` |
| `scripts/test-b2-part7-validator.mjs` | `section under 120 fails`, `section over 150 fails` |

All four are Reading and Use of English passage-length validators, unrelated to the Writing engine
and untouched by these phases. `npm test` therefore reports 289/293 as the expected baseline.

### 5.2 Release gate status after Phase 5

R1 is strengthened and the enforcement machinery R3 depends on is now in place. **R3 remains OPEN.**
No golden calibration has been run: closing it requires the twelve official scripts through the real
pinned configuration, exact criterion profiles checked against Doc 06, and the human calibration
step. Nothing in Phase 5 may be read as evidence that G-01…G-12 pass.

---

## Phase 6 — Feedback composition — **COMPLETE / CLOSED** (10 August 2026)
### R3 — **OPEN** · R4 — **OPEN: no human review of real outputs yet**

### 6.0 Closed Phase-6 decisions (approved 10 August 2026)

**1. Opening-strength over-selection is rejected, never truncated.** The composer no longer slices an
over-long selection. Cardinality is checked with the Phase-1 helper — 0 eligible → exactly 0, 1 → 
exactly 1, 2+ → two or three — and a violation fails composition. In the Phase-5 validator the same
violation is `V-FB-07` classified as `retryable_generation_failure` with `retry_target: 'feedback'`,
so the orchestrator composes again. Deciding which of a learner's genuine strengths disappears is a
pedagogical judgement, and code taking the first three is not that judgement. Under-selection fails
for the same reason: the answer is a better generation, not padding.

**2. Punctuation stays internal in v1.** Doc 04 defines no Interactive Writing Map category for
punctuation, so a punctuation observation remains valid internally, informs criterion feedback and
carries no local annotation. This is a v1 decision, revisitable when Doc 04 resolves the mapping.

**3. No seventh category.** The closed set remains `grammar`, `vocabulary`, `spelling`,
`organisation`, `content`, `strength`.

**4. Feedback benchmark temperature remains 0.** Composition fixtures stay reproducible; whether
prose benefits from variation is an R4/R7 question to answer with real outputs in hand.

**5. R3 remains OPEN. R4 remains OPEN.**

### 6.1 What was actually built

| File | Role |
| --- | --- |
| `services/feedback/feedback-composer.service.ts` | Turns a frozen assessment into a learner-facing payload |
| `services/feedback/learner-history-enrichment.service.ts` | Post-assessment history overlay, no database |
| `prompts/feedback-composition.prompt.ts` | Composition prompt and its mark-free output schema |
| `prompts/knowledge/doc04-feedback-rules.ts` | Doc 04 encoded as composition knowledge |
| `__tests__/feedback-composition.test.ts` | Test matrix A–AK plus contract guards |

Modified: `domain/schemas.ts`, `domain/types.ts`, `services/validation/deterministic-validators.ts`
(feedback rules V-FB-01…V-FB-14), `prompts/knowledge/doc04-feedback-rules.ts`, `README.md`,
`package.json`, `__tests__/schemas.test.ts` (fixtures for the completed contract). `engine-version.ts`
needed no change: `PROMPT_VERSIONS.feedback_composition` already existed.

### 6.2 Marks are structurally out of reach

Three independent mechanisms, each sufficient on its own:

1. **No field to write into.** `FEEDBACK_JSON_SCHEMA` contains no `mark`, `band`, `score` or
   `raw_total` property, and a test asserts those strings never appear in it.
2. **The payload is copied, not composed.** `copyFrozenAssessmentResult(assessment_record)` builds
   `global_result` directly from the validated record. Model output never contributes a number.
3. **A final equality check.** Before returning, the composer compares all four marks and the total
   against the record and throws if they differ. Phase 5 then repeats the comparison independently
   (`V-FB-02`), so a payload assembled elsewhere is caught too.

A hostile fixture that emits `criteria`, `marks`, `raw_total` and `overall_band` produces a payload
identical to the honest one.

### 6.3 Learner-history boundary

History is an overlay keyed by `observation_id`, never a mutation:

```
{ observation_id, confirmed_historical_recurrence, previously_taught,
  improvement_signal, history_evidence_ids[] }
```

`buildHistoryOverlay` refuses history that carries any scoring key, that references an observation
this script did not produce, or that arrives before a complete assessment exists — the marks must
already be frozen for the separation to mean anything. A claim with no `history_evidence_ids` fails
the schema. Tests assert the assessment record and the observation set are byte-identical before and
after enrichment, and that the total is the same with and without history. History may change
emphasis, explanation depth and review selection; the boost function is ordinal and is deliberately
not a score.

Without an overlay, longitudinal phrasing ("you always", "you keep making", "we worked on this
before", "you have improved since") is rejected. Repetition inside one script is not a history.

### 6.4 Domain → category projection

The projection is **partial on purpose**:

| Observation domain | Category |
| --- | --- |
| `grammar` | `grammar` |
| `spelling` | `spelling` |
| `vocabulary_collocation`, `naturalness` | `vocabulary` |
| `organisation_cohesion` | `organisation` |
| `content_development` | `content` |
| `strength` | `strength` |
| `communicative_appropriacy` | *(none — stays global)* |
| `punctuation` | *(none — stays global)* |

This **supersedes the earlier draft map below**, which sent `communicative_appropriacy` to `content`
and `punctuation` to `grammar`. A register or reader-relationship problem is a property of the whole
text; giving it a coloured local span invents a precision the observation does not have, and Doc 04
defines no semantic category for punctuation. Both remain valid observations and feed criterion
feedback instead. No seventh category was added.

### 6.5 Selection rules

- **Opening strengths** may only cite observations whose polarity is positive and whose type is
  `strength`. Cardinality follows the evidence: 0 → 0, 1 → 1, 2+ → at most 3. Praising a negative
  observation or an invented id fails.
- **Annotations** may only cite observations that Phase 3 bound, marked renderable, and whose domain
  has a category. Offsets are copied from the observation; the model never supplies one. Suggested
  changes pass the Phase-3 intent-preservation check, so an opinion flip is rejected. A `correction`
  must state the corrected form; a `strength` may not carry one.
- **No quotas anywhere** — no minimum or maximum annotations, no category mix, no fixed number of
  review topics. The single exception is a floor, not a quota: a locally renderable meaning-blocking
  issue left untreated fails composition.
- **review_next** items must cite real observation ids, real criterion keys or supplied history
  evidence ids, and `resource_key` is always `null`.
- **final_cta** is the constant `"Write another task"`, checked by `V-FB-09`.

### 6.6 Feedback validators added to Phase 5

| Rule | Checks |
| --- | --- |
| V-FB-01 | Payload matches the feedback contract |
| V-FB-02 | Every mark and the total equal the assessment record |
| V-FB-03 | `category_key` is one of the six closed values |
| V-FB-04 | Annotation spans reproduce the candidate text and match the observation |
| V-FB-05 | Annotations cite known, locally renderable observations |
| V-FB-06 | Opening strengths cite real positive evidence |
| V-FB-07 | No manufactured praise; at most three opening strengths |
| V-FB-08 | review_next traceability and `resource_key === null` |
| V-FB-09 | Final CTA equals the approved constant |
| V-FB-10 | No colour or styling keys |
| V-FB-11 | No learner-history claim without a verified overlay |
| V-FB-12 | No AI/system self-reference |
| V-FB-13 | No Cambridge affiliation or official-examiner claim |
| V-FB-14 | No rewritten, improved or model version |

Progression leakage and the forbidden-heuristic detector run over the payload as well, so "aim for
band 6", a CEFR claim or a 12/20 threshold in learner-facing prose fails. The authority detector uses
negative lookbehind so it distinguishes a claim from the required *denial* — the mandatory disclaimer
says the result is **not** an official Cambridge result and must not trip its own rule.

### 6.7 Model strategy

One logical LLM call with an explicitly injected pinned configuration at `temperature: 0`. The
earlier draft proposed `temperature: 0.4`; the benchmark stays at 0 for now so composition fixtures
remain reproducible, and any change belongs to R4/R7 with real outputs in hand. There is no implicit
fallback: composing without a client throws. Physical Phase-3/4/6 call merging has not been done.

### 6.8 Release gate status after Phase 6

**R3 remains OPEN** — no golden calibration has been run. **R4 remains OPEN** — unit tests prove the
contracts and the traceability, not that the feedback sounds like an expert teacher, explains at the
right depth or motivates. Closing R4 requires human review of representative real outputs.

Nothing was wired to production: no database, no Supabase, no API route, no UI, no change to the
legacy Writing engine, Vercel or the OpenAI Assistant, and zero real model calls.

### 6.9 Original Phase-6 plan (superseded where §6.1–6.7 differ)

| Field | Detail |
| --- | --- |
| **Files to create** | `services/feedback/feedback-composer.service.ts`, `prompts/feedback-composition.prompt.ts`, `prompts/knowledge/doc04-ux-content-rules.ts`, `__tests__/feedback-composition.test.ts` |
| **Files to modify** | None |
| **DB migrations** | `writing_feedback_payloads` (Phase 7) |
| **Inputs** | `task_analysis`, `observations`, `assessment_record`, optional `learner_context` |
| **Outputs** | `feedback_payload` per Doc 05 §9 |
| **OpenAI calls** | **1** |
| **Model/config** | Pinned model, `temperature: 0.4` (composition benefits from some variation; marks are already frozen upstream and are re-verified by `validateFeedbackDoesNotAlterMarks`) |
| **Deterministic vs LLM** | LLM writes `local_explanation`, criterion `summary` and `expanded`, `review_next` reasons. **Deterministic**: the four marks are **copied**, never regenerated; `category_key` is derived from `observation.domain` by a fixed map; `opening_strength_ids` must be a subset of emitted annotation IDs; `final_cta` is a constant; `resource_key` is forced to `null`. |
| **Tests** | FB-01 … FB-10, TD-14, TD-15, SC-10, §11 traceability |
| **Feature flag** | Same master flag |
| **Rollback** | Phase 4 output remains valid and persisted independently, so a composition failure never invalidates a correct assessment (Doc 05 §14) |
| **Risk** | **Medium-high.** FB-08 ("feels like an expert teacher, not AI") and FB-06 ("expanded materially richer than summary") are human-judged and cannot be automated. Mitigation: a fixed reviewer rubric plus stored snapshots of ten representative outputs reviewed by the teacher at R4. |
| **Release gates** | **R4** |

`observation.domain` → `category_key` map (the only place the two vocabularies meet):

| `observation.domain` | `category_key` |
| --- | --- |
| `grammar`, `punctuation` | `grammar` |
| `vocabulary_collocation` | `vocabulary` |
| `spelling` | `spelling` |
| `organisation_cohesion` | `organisation` |
| `content_development`, `communicative_appropriacy` | `content` |
| `strength` | `strength` |

Note that `punctuation` maps to `grammar` while Doc 03 §7.3 says punctuation affects **Organisation**
when it changes boundaries or flow. These are different things: the annotation category is a UI
grouping, the criterion is a scoring construct. They must not be unified — record this so a later
reviewer does not "fix" it.

---

## Phase 7 — Persistence and provenance — **COMPLETE / CLOSED** (10 August 2026)
### R5 — **CLOSED** (12 August 2026) — ENGLISH_PROD schema + RLS + integrity verified

### 7.0 Closed database decisions (approved 10 August 2026)

**1. Ownership.** `writing_submissions.user_id → auth.users(id)` is the canonical ownership identity,
because `auth.uid()` maps to it directly and every RLS policy can therefore be a plain comparison.
Profile or display information may be joined later from the DRALO profile tables; Writing Engine
ownership does **not** move to `Usuarios_y_Perfil_users` merely to make a profile join shorter.

**2. No foreign key to `levels_preguntas`.** `pregunta_id`, `examen_id` and `parte_numero` stay
contextual identifiers with no FK dependency. Historical assessment authority comes from
`task_prompt_snapshot` + the `candidate_response` snapshot + versioned engine provenance, so editing or
deleting future exam content cannot invalidate a correction that has already been shown.

**3. Direct read access.** `authenticated` keeps read-only RLS access to its **own** Writing v3 records
and may `SELECT` its own history. A client may not insert or update an assessment, delete correction
history, forge another `user_id`, or write the task-analysis cache. The service role remains the only
writer.

**4. Delete model.** No client `DELETE` privilege, and deliberately **no** append-only DELETE trigger
blocking the service role: account and data-deletion workflows must keep working, so student writing is
not made permanently undeletable.

**5. Migration status.** `scripts/sql/writing_engine_schema.sql` **has been applied** to ENGLISH_PROD
(`qnazrzvwvkwhkfbqsbmr`) including the eight `writing_*` tables, RLS, append-only guards, complete-
assessment integrity, and `writing_engine_persist_assessment_bundle` (transactional assessment+criteria).
R5 verification: tables present; RLS on; `authenticated` SELECT-own only; no client writes; task
analyses have no client grants; complete assessment bundle persisted end-to-end.

| Field | Detail |
| --- | --- |
| **Files to create** | `services/persistence/writing-engine.repository.ts`, `scripts/sql/writing_engine_schema.sql`, `scripts/verify-writing-engine-persistence.mjs` |
| **Files to modify** | None yet (wiring happens in Phase 10) |
| **DB migrations** | **8** new tables, all `writing_*` prefixed. **No existing table is altered.** |
| **Inputs** | Every structured object produced by Phases 2–6 |
| **Outputs** | Durable, versioned, auditable execution records |
| **OpenAI calls** | 0 |
| **Model/config** | N/A |
| **Deterministic vs LLM** | 100 % deterministic |
| **Tests** | Doc 06 §17 (version provenance, historical stability, re-evaluation distinguishability, incomplete state, validation status, token metrics) |
| **Feature flag** | Tables exist regardless of the flag; nothing writes to them until the flag is on |
| **Rollback** | `DROP TABLE` on the eight new tables. Because no existing table is altered, rollback cannot damage current student data. |
| **Risk** | **Low-medium.** Main risk is RLS: student writing is personal data and must follow the existing DRALO auth model (Doc 06 §19). |
| **Release gates** | **R5** |

### 7.1 The eight tables, as built

| Table | Purpose | Key constraints |
| --- | --- | --- |
| `writing_submissions` | one submitted attempt with immutable snapshots | `user_id → auth.users`, `task_prompt_snapshot`, `candidate_response`, `candidate_response_hash`, `word_count`, `submission_source`, `task_type` CHECK over the six B2 genres |
| `writing_engine_executions` | one run of one engine configuration | `submission_id`, `previous_execution_id` (self-reference), `status` in `running/completed/failed` with a lifecycle CHECK on `completed_at`, `doc_versions`, `prompt_versions`, `model_config`, `token_source = 'provider_reported'`, token/latency/cost columns, `retry_count`, `validation_status` |
| `writing_task_analyses` | version-sensitive task-analysis cache | `UNIQUE(task_fingerprint)`, `source_task_hash`, `task_analysis jsonb`, the three versions and `model_config`. No learner data, no client grants |
| `writing_observations` | accepted Phase-3 observations, one row each | `UNIQUE(execution_id, observation_id)`, span ordering, `binding_status`/`renderable_locally` coherence, `meaning_blocking = (communicative_impact = 'blocked')`, positive ⇒ strength. No colour, no mark, no `category_key` |
| `writing_assessments` | the frozen assessment header | `execution_id` PK, `max_total = 20`, `CHECK (NOT single_task_scale_claim_allowed)`, `CHECK (NOT word_count_penalty_applied)`, `calibration_status = 'not_calibrated'`, incomplete ⇒ `raw_total IS NULL`, complete ⇒ `raw_total NOT NULL` |
| `writing_assessment_criteria` | the four decision records | FK to `writing_assessments(execution_id)`, `UNIQUE(execution_id, criterion)`, `criterion` CHECK over the four canonical values, `mark smallint CHECK 0–5`, band ceiling/floor derived from the mark, `why_not_lower` required for 1–5 and forbidden at 0 |
| `writing_feedback_payloads` | the validated payload as shown | `execution_id` PK, `payload jsonb`, `learner_history_applied`, `history_overlay`, `history_evidence_ids`, prompt/schema versions, `opening_strength_count` CHECK 0–3 |
| `writing_validation_results` | one row per stage and attempt | `UNIQUE(execution_id, stage, attempt)`, `validation_status` (never `passed`), `validation_mode`, `failed_rules`, `warnings`, retry coherence CHECK, `validator_version` |

### 7.2 Assessment integrity: deferred, not fragile

The four-criteria invariant is a **constraint trigger** declared `DEFERRABLE INITIALLY DEFERRED`
(`public.writing_assessment_assert_integrity`). It runs once at `COMMIT`, so inserting criteria 1, 2
and 3 does not fail mid-transaction; what fails is closing a transaction in which a `complete`
assessment does not carry exactly the four canonical criteria, or whose `raw_total` is not their sum.
An `incomplete` assessment carrying any criterion row fails the same check. The trigger only accepts or
rejects — it never writes a mark, so there is no path where the database "corrects" a Cambridge result.

### 7.3 Immutability

Two layers, no more:

1. **RLS and privileges.** `authenticated` holds `SELECT` only, so no client can insert, update or
   delete engine data. All writes are service-role.
2. **Append-only triggers.** `UPDATE` raises on all seven artefact tables. The single exception is
   `writing_engine_executions`, whose guard allows exactly one transition — out of `running` — and
   rejects any change to provenance (versions, documents, prompts, model, submission, `started_at`).

`DELETE` is deliberately not blocked by a trigger: account deletion must still cascade from
`auth.users` for erasure requests, and clients cannot delete because they hold no `DELETE` privilege.
The repository has no update method for artefacts at all, and `finalizeExecution` refuses an execution
that is not running, so a second verdict must be a second execution.

### 7.4 RLS design

`writing_submissions` resolves ownership directly (`user_id = (select auth.uid())`). Every child table
resolves it through the chain child → execution → submission → authenticated user, exactly as
`Levels_stars` does through `levels_puntuaciones`, so `user_id` is not copied down the tree.
`writing_task_analyses` has RLS enabled and **no policy and no grant**: it is a server cache with no
learner data, and no client should be able to poison it. Every table is `REVOKE ALL … FROM anon,
authenticated` before `GRANT SELECT`, so Supabase's default privileges cannot leave a write path open.

### 7.5 Drafts, error tracker and usage — v1 decisions

- **Drafts stay in `localStorage`.** Phase 7 persists submitted attempts only. No server-side draft
  autosave, no draft table, no draft column. This keeps draft UX entirely outside the migration.
- **`user_error_tracker` is not wired**, and the second `extract_errors` model call is not reintroduced.
  If compatibility later needs the tracker, structured Phase-3 observations can feed it
  deterministically.
- **Usage provenance is provider-reported.** `token_source` accepts the single value
  `provider_reported`, so a text-length estimate cannot satisfy the contract. `ai_usage_logs` is not
  modified; call-level telemetry can carry the execution id in its existing `metadata jsonb`.

**Coexistence with the existing scoring tables.** `levels_puntuaciones` carries
`UNIQUE (uuid_usuario, examen_id, parte_numero, score_source)` — verified in the database — so it
physically cannot hold history. The plan does **not** touch it: the raw /20 continues to be written to
`correctas` exactly as today, so `Levels_stars`, `levels_estadisticas`, the Stars Way map and all
gating keep working unchanged. History, provenance and versioning live entirely in the new
`writing_*` tables, which reference `levels_puntuaciones` only indirectly through
`(user_id, examen_id, parte_numero)`.

**Immutability** (Doc 05 §13.1): rows are append-only. A re-evaluation creates a new
`writing_engine_executions` row; the previous one is retained and remains renderable with the versions
that produced it.

**Access layer decision — CLOSED.** Writing v3 uses a **Supabase SQL migration plus the Supabase
server client**, matching the `levels_*` family. Prisma stays confined to `src/features/speaking/`;
there is no second persistence technology inside this feature. The repository talks to a narrow
`WritingEngineDb` port (`insert` / `select` / `update`, no `delete`), with
`createSupabaseWritingEngineDb()` as the only adapter, which is also what makes the persistence tests
runnable without a database.

### 7.6 Repository API

`src/features/writing/services/persistence/writing-engine.repository.ts`:
`createSubmission`, `getSubmission`, `createExecution`, `getExecution`, `listExecutionsForSubmission`,
`finalizeExecution`, `getTaskAnalysisByFingerprint`, `insertTaskAnalysisIfAbsent`,
`persistObservations`, `persistAssessment`, `persistFeedback`, `persistValidationResult`,
`getExecutionBundle`.

No method recomputes a mark or regenerates feedback. Each artefact is validated against its Phase 1–6
zod contract before the insert; `persistAssessment` additionally re-checks that `raw_total` equals the
four marks and **rejects** a mismatch instead of repairing it. Transactions protect individual
persistence operations, never a span that includes a model call.

### 7.7 What Phase 7 did NOT do

The migration was **not applied** to any database — not production, not staging. No route, no UI and no
environment variable was touched. `scripts/verify-writing-engine-persistence.mjs` is read-only and ran
statically (84/84 checks); its database branch stays dormant until
`WRITING_ENGINE_VERIFY_DATABASE_URL` points at an approved environment. Consequently the RLS
behaviour, the deferred integrity trigger, the append-only triggers and a real write/read bundle are
**implemented but not executed against a database**, and **R5 remains OPEN**.

---

## Phase 8 — Interactive Writing Map / Feedback UX — **IMPLEMENTED ON FIXTURES** (10 August 2026)
### R6 — **OPEN: waiting for the visual and accessibility review of the screenshots**

### 8.0 What Phase 8 built, as built

**Components created** — `src/components/writing/v3/`: `WritingFeedbackPage.js`, `WritingMapCanvas.js`
(with `WritingMapLegend`), `WritingMapAnnotation.js`, `WritingMapBubble.js` (with the shared
`WritingMapFeedbackList`), `WritingMapBottomSheet.js`, `WritingGlobalResult.js`,
`WritingOpeningStrengths.js`, `WritingCriterionCard.js`, `WritingReviewNext.js`, and
`WritingFeedbackFixtureHarness.js` for the internal preview.

**Pure modules created** — `src/features/writing/ui/`: `annotation-segments.ts` (segmentation and the
overlap policy), `annotation-selection.ts` (the one-open-bubble state machine and the breakpoint),
`annotation-palette.ts` (presentation tokens; the planned `src/lib/writing/annotationPalette.js` moved
here so the six keys and their tokens sit beside the rest of the feature), `feedback-view-model.ts`
(the single translation from payload to learner-facing view).

**Deliberate deviation from the plan above:** `B2WritingExamPracticePage.js` was **not** modified. Phase 8
renders fixtures only, so no real B2 submission reaches v3 and the legacy correction path is untouched.
Wiring the exam page is a later cutover, not part of this phase.

### 8.1 Annotation segmentation and the overlap policy

`buildAnnotationSegments(candidate_response, annotations)` cuts the response at every annotation
boundary and emits one segment per elementary interval. Consequences, all covered by tests:

- Concatenating the segments reproduces the submitted response byte for byte. There is no markup
  parser on this path: `[[gram|3]]` does not exist in v3.
- Every character belongs to exactly one segment, so two overlapping spans can never duplicate the
  words they share.
- An interval covered by two annotations becomes **one** segment carrying **both** observation
  identities. The first annotation in the deterministic order (earliest start, then widest span, then
  annotation id) supplies the styling; the bubble for that segment lists both pieces of feedback.
- An annotation whose offsets no longer match `original_text`, or which falls outside the response, is
  reported as `dropped` rather than rendered against the wrong words.

### 8.2 Interaction

Desktop: click or tap only, exactly one open bubble, clicking another mark replaces it, clicking the
open mark closes it, Escape closes, a click outside the canvas closes, and focus returns to the mark.
No component on the v3 path registers `onMouseEnter`, `onMouseOver` or `onPointerEnter`.

Mobile, at or below **640px** (the most common existing breakpoint in `globals.css`): the same feedback
opens as a bottom sheet with a dismissible scrim, a Close button, focus moved into the sheet and
returned to the mark on dismissal, and internal scrolling only when the content needs it.

A mark is a `span` with `role="button"`, `tabIndex={0}` and Enter/Space activation rather than a
`<button>` element, because a real button cannot break across lines: on a phone a six-word annotation
became a centred block that shattered the paragraph. Everything the platform would have supplied is
declared explicitly instead.

### 8.3 Provisional palette

`annotation-palette.ts` holds no colour at all: each of the six closed keys resolves to a label, a
one-line hint, a non-colour marker glyph and a CSS class. The colours live in the additive
`globals.css` block and are marked **PROVISIONAL — REQUIRES R6 VISUAL APPROVAL**. They are derived from
the existing DRALO writing tokens. Approving a different palette is a CSS-only change: no payload,
schema or stored row has ever carried a colour. Category meaning is additionally carried by the
legend, the marker and the accessible label, and by a distinct underline style per category, so it
never depends on colour perception.

### 8.4 Internal preview route

`/dralo-dev/writing-v3` renders four validated fixtures (`standard`, `zero-strengths`,
`dense-overlap`, `band-five`) produced offline by `scripts/generate-writing-v3-fixtures.mjs` and parsed
through the real Phase-6 contract. It reaches no database, no model and no API. It is exempt from the
auth gate **only outside production**, through the single shared helper
`src/utils/writingV3Preview.js` used by both `src/middleware.ts` and `src/app/RootLayoutClient.js`; in
production the helper returns `false` and the page itself refuses to render. It appears in no
navigation menu and is not a public route.

### 8.5 What Phase 8 did NOT do

No migration applied, no real B2 submission routed into v3, no legacy route replaced, no legacy
scoring, stars or gating touched, no OpenAI call, no golden calibration. R6 stays open until the
screenshots in `docs/writing-v3/screenshots/` are reviewed, the desktop and mobile interactions are
accepted, the semantic palette is approved and the accessibility review passes.

### 8.6 Candidate writing typography — **CLOSED** (11 August 2026)

The learner’s `candidate_response` inside the Interactive Writing Map uses the **same font family as the
rest of the DRALO UI** (`body` → `'Segoe UI', sans-serif` via `font-family: inherit`). It does **not**
use a dedicated serif or editorial font (no Georgia, Times, or Writing-specific family). Line-height
and spacing in `.writing-map__text` remain reading-friendly; only the font family matches the site.
Quoted spans in bubbles, sheets, criterion evidence and suggested corrections inherit the same stack.
Regression tests in `feedback-ux.test.ts` forbid reintroducing serif fonts in the Writing v3 CSS block.

### 8.7 Desktop scale — **CLOSED** (11 August 2026)

Desktop typography, spacing and component scale are optimised for desktop readability and hierarchy
(`@media (min-width: 901px)` on the Writing v3 block). Mobile compatibility must not constrain the
desktop experience: compact base sizes remain the default; desktop-only rules increase page presence,
section-label scanability, criteria summary readability, criterion-card scale and candidate-writing
size while keeping a comfortable reading width (`max-width: 52rem` on the map column). The preview
shell widens to `1240px` when it contains Writing v3.

---

### Original Phase 8 plan (for reference)

| Field | Detail |
| --- | --- |
| **Files to create** | `src/components/writing/v3/WritingFeedbackPage.js`, `WritingMapCanvas.js`, `WritingMapAnnotation.js`, `WritingMapBubble.js`, `WritingMapBottomSheet.js`, `WritingCriterionCard.js`, `WritingGlobalResult.js`, `WritingOpeningStrengths.js`, `WritingReviewNext.js`, `src/lib/writing/annotationPalette.js` |
| **Files to modify** | `src/app/globals.css` (additive `.writing-map-*` block reusing existing tokens), `src/components/b2/B2WritingExamPracticePage.js` (render v3 page when the payload is v3) |
| **DB migrations** | None |
| **Inputs** | `feedback_payload` + `candidate_response` |
| **Outputs** | Rendered learner experience |
| **OpenAI calls** | 0 |
| **Model/config** | N/A |
| **Deterministic vs LLM** | 100 % deterministic rendering. The UI **cannot** alter a mark; marks arrive pre-validated. |
| **Tests** | Doc 06 §13 (desktop), §14 (mobile), §15 (visual compatibility incl. before/after screenshots), §16 (accessibility) |
| **Feature flag** | Client-side switch driven by `payload.engine_version === 'v3'`, not by a separate public flag — a single server-side decision keeps engine and renderer from ever diverging |
| **Rollback** | Turn off the server flag; the legacy panel renders as today |
| **Risk** | **Medium.** The exact semantic colour legend is unresolved (Doc 04 §7, Doc 06 §25) and is release-blocking for final visual acceptance. Mitigation: `category_key` never carries colour, so the palette can be approved late and swapped in `annotationPalette.js` without touching engine data, schemas or stored rows. |
| **Release gates** | **R6** |

Reuse and adaptation:

- **Reuse the interaction model** already implemented in `WritingInteractiveAnnotatedText.js`:
  click-only, single active bubble, Escape and outside-click dismissal, `role="dialog"`. Doc 04 §5.1
  and §5.3 are already satisfied by that component's behaviour.
- **Replace the data source.** The legacy component parses `[[gram|3]]…[[/gram]]` markup produced by
  `injectServerAnnotatedText`. v3 renders from `annotations[]` with stored character offsets, which
  removes an entire class of markup-corruption bugs and satisfies Doc 06 §11 ("a displayed local
  annotation maps to a stored observation ID and deterministic text span").
- **Extend the legend from five categories to six.** Current keys are `voc`, `spell`, `gram`, `cont`,
  `good`; `organisation` does not exist and is currently absorbed into `gram` (whose hint literally
  reads "Punctuation, structure, long sentences"). Add `organisation` and rename to the closed set.
- **Decouple colour.** `WRITING_ANNOTATION_LEGEND` currently stores `className` next to `key`, coupling
  category to colour in one object. v3 keeps the six keys in `domain/categories.ts` (no styling) and
  resolves the class in `annotationPalette.js` at render time.
- **New: mobile bottom sheet.** No equivalent exists; `WritingMarkPopup` is absolutely positioned from
  `getBoundingClientRect()` and would be unusable on a phone. This is genuinely new work.
- **Accessibility gap to close.** Annotated spans are `<button>` (good) but colour currently carries
  category meaning on its own; Doc 06 §16 requires redundant non-colour encoding.

Page architecture follows Doc 04 §3 exactly: writing dominant and clean → 2–3 strengths prominent →
discreet global `15/20` → click-to-explore map → four criterion cards with summary + expanded →
plain-text "What to review next" → "Write another task". **No pass/fail badge, no CEFR label.**

---

## Phase 9 — Cambridge golden calibration — **BASELINE 1 COMPLETE** (11 August 2026)

| Field | Detail |
| --- | --- |
| **Status** | Blind Baseline 1 executed across 12/12 source-verified golden cases |
| **Exact profiles** | **2 / 12** (G-01, G-10) |
| **Exact criterion marks** | **27 / 48** |
| **Baseline model** | `gpt-4o-2024-08-06`, temperature `0`, `json_schema` |
| **Engine / prompts** | `3.0.0` · task_analysis `1.0.0` · observation `1.0.0` · cambridge_assessment `1.0.0` |
| **Validation** | All 12 cases failed deterministic assessment validation (evidence-quote binding). Marks in the matrix are the **raw model criterion marks** captured before binding rejection — not tuned |
| **Leakage** | Official mark profiles remain outside assessment prompts (prior removal kept) |
| **R3** | **OPEN** — 2/12 exact; waiting for calibration review. No prompt tuning after Baseline 1 |
| **Artefacts** | `docs/writing-v3/calibration/baseline-1.json`, `baseline-1.md`, `sources/source-manifest.json` |

### 9.1 Source verification (closed for Baseline 1)

| Source | SHA-256 / identity | Used for |
| --- | --- | --- |
| `167791-b2-first-handbook.pdf` | `73F1AB54…1C9A` | G-01–G-11 scripts + marks |
| `182410-…-2015.pdf` | `48AE1EB9…52B7` | G-12 script + marks |
| `174037-b2-first-sample-paper-1.zip` → Writing 2022 PDF | official Cambridge zip | G-01–G-06 task prompts |
| `178516-b2-first-sample-paper-2.zip` → Writing 2022 PDF | official Cambridge zip | G-07–G-12 task prompts |
| `camengli.sh/3YMtIM6` | preparation page + Inspera player `146732614` | digital sample entry point (task wording matched Sample Paper 1 Writing) |

### 9.2 Baseline 1 criterion matrix (summary)

Exact profile matches: **G-01** (4/3/3/3) and **G-10** (5/4/4/3). Full matrix in `docs/writing-v3/calibration/baseline-1.md`.

### 9.3 Adjacent-band generation contract (beta readiness)

OpenAI `json_schema` strict mode cannot express mark-conditional required/forbidden fields, so the engine uses:

1. explicit `ADJACENT_BAND_EVIDENCE FIELD` instructions in the assessment prompt;
2. deterministic post-parse rejection via `adjacent-band-contract.ts` (no silent stripping; marks never changed by code);
3. precise `generation_feedback` on calibration retries.

Bands 2/4 still require concrete neighbouring evidence. Bands 0/1/3/5 must set `adjacent_band_evidence` to null.

### 9.4 R3 STABILITY WORK — DEFERRED

G-01 produced different raw profiles across separate real runs under the same nominal model/config (`gpt-4o-2024-08-06`, temperature `0`):

- Baseline 1: **4 / 3 / 3 / 3**
- Later binding verification: **3 / 3 / 2 / 2**

Temperature 0 is **not** treated as proof of identical outputs. Repeated-run stability will be examined later. Do not investigate inside beta-contract work.

---

## Phase 9 — Golden tests and regression tests (original plan)

| Field | Detail |
| --- | --- |
| **Files to create** | `src/features/writing/__tests__/fixtures/golden/G-01.json` … `G-12.json`, `__tests__/golden-calibration.test.ts`, `__tests__/forbidden-behaviours.test.ts`, `__tests__/task-requirements.test.ts`, `__tests__/teacher-dna.test.ts`, `scripts/run-writing-golden-suite.mjs`, `scripts/writing-acceptance-report.mjs` |
| **Files to modify** | `package.json` (test scripts only) |
| **DB migrations** | None |
| **Inputs** | The twelve official Cambridge scripts and their tasks, verbatim |
| **Outputs** | An acceptance report matching the Doc 06 §24 template |
| **OpenAI calls** | 12 fixtures × 3 runs × calls-per-submission. At 2 calls per submission that is **72 calls per full golden run**, plus the TR/TD/REG suites. Budget for it explicitly. |
| **Model/config** | Exactly the production configuration — a golden run under a different model or prompt version is meaningless |
| **Deterministic vs LLM** | Harness deterministic; the system under test is the LLM pipeline |
| **Tests** | This phase *is* the tests: G-01…G-12, TR-*, TD-*, CB-*, REG-01…REG-12, SC-01…SC-10, §10 special cases |
| **Feature flag** | Runs against the flagged-on engine in staging |
| **Rollback** | N/A |
| **Risk** | **High, now purely technical.** D4 is resolved: the corpus is `167791-b2-first-handbook.pdf` and `182410-first-writing-sample-answers-and-examiner-comments-2015.pdf`, with the DRALO Cambridge Baseline Appendix A as the manifest. The residual risk is transcription drift — a fixture that quietly diverges from the PDF makes a green R3 meaningless. Mitigation: transcribe verbatim from the original PDFs, never from Appendix A or any summary; store a checksum per fixture; two-person verbatim verification; fixtures immutable once merged. |
| **Release gates** | **R3**, **R4**, and the §20 regression protocol for every later model or prompt change |

The golden suite must fail on a correct total reached through an incorrect criterion distribution.
`14/20` as `4/3/4/3` when the official profile is `5/3/3/3` is a **failure**, not a near miss.

---

## Phase 10 — Legacy cutover

| Field | Detail |
| --- | --- |
| **Files to create** | `src/app/api/writing/evaluate/route.js`, `src/lib/ai/writingEngineClient.js`, `src/features/writing/services/orchestrator/run-writing-engine.ts` |
| **Files to modify** | `src/lib/aiActionHandlers.js` (branch `handleExamWritingCorrection` on level + flag), `src/components/b2/B2WritingLongFormAiPanel.js` (render v3 payload when present), `src/components/b2/B2WritingExamPracticePage.js`, `src/utils/examModeWritingScore.js` (read `raw_total` instead of `scores.total`) |
| **DB migrations** | None beyond Phase 7 |
| **Inputs** | Live student submissions |
| **Outputs** | v3 feedback for B2 First; unchanged legacy behaviour everywhere else |
| **OpenAI calls** | 2 per submission steady state |
| **Model/config** | `DRALO_WRITING_ENGINE_MODEL`, pinned |
| **Deterministic vs LLM** | Routing is deterministic |
| **Tests** | Full Doc 06 suite plus a production smoke test on a teacher account |
| **Feature flag** | `DRALO_WRITING_ENGINE_V3_ENABLED` plus `DRALO_WRITING_ENGINE_V3_ROLES` (default `teacher,admin,it`). Staged rollout: internal roles → opt-in cohort → all B2. **Given that `DRALO_WRITING_CORRECTION_V2_ENABLED` has silently never been set in production, add a startup log line that states the resolved flag value on every boot, and verify it in the Vercel runtime logs after the first deploy.** |
| **Rollback** | Unset the flag. The legacy path is untouched and still fully functional; no data migration is needed because v3 writes to new tables and the same `levels_puntuaciones` row shape. |
| **Risk** | **Medium.** The score distribution will shift: today's marks come from an opaque Assistant with `applyTaskRelevanceClamp` as a no-op and `passed = total >= 12`; v3 marks come from a calibrated pipeline. Some students will score differently on the same text. Mitigation: run v3 in shadow mode against real submissions for a period, storing executions without showing them, and compare distributions before exposing the UI. |
| **Release gates** | **R5**, **R7**, **R8** |

**Scope boundary that must not be violated:** `evaluateCambridgeEssay` also serves non-B2 levels via
`buildGenericPrompt` (A2 writing is parts 6 and 7 in `levelsA2PartScoring.js`) and the free-writing
sandbox in `LevelsWritingCorrectionPanel`. Scope v1 is B2 First only, therefore
**`cambridgeEssayFeedback.js` cannot be deleted in v1.** It is frozen, not removed.

### 10.1 Phase 10 status — internal beta integration (12 August 2026)

**Assessment contract beta blocker:** RESOLVED (Phase 9 adjacent-band + quote-binding).

**R3 scoring/stability:** OPEN — deliberately deferred; no golden recalibration in this phase.

### 10.2 Global rollout (12 August 2026) — PRODUCT DECISION

Writing v3 is the **default** correction engine for all supported B2 Writing submissions.

| Item | Decision |
| --- | --- |
| Beta / role / email allowlists | **Removed** from normal routing |
| Kill switch | `DRALO_WRITING_ENGINE_V3_ENABLED` (alias `DRALO_WRITING_V3_ENABLED`). Default **ON** when unset. Set `false` for emergency legacy fallback |
| Production schema (R5) | Eight `writing_*` tables applied on ENGLISH_PROD (`qnazrzvwvkwhkfbqsbmr`) with RLS; `authenticated` has SELECT-own only (no INSERT/UPDATE/DELETE); `writing_task_analyses` has no client grants; service role writes |
| Legacy engine | **Retained** for kill-switch OFF and for one-shot operational fallback when v3 fails before a valid completed assessment (single score path — no duplicate progression writes) |
| Learner UI | `WritingFeedbackPage` for successful v3; no CEFR / Pass / readiness |
| Model | Chat Completions `gpt-4o-2024-08-06`, temperature `0` (R3 still OPEN) |
| Mobile visual | Deferred — not a rollout blocker |
| levels_puntuaciones | Compatibility via `scores.total = raw_total` only; ≥12 rule stays outside the examiner |

**Rollback procedure:** set `DRALO_WRITING_ENGINE_V3_ENABLED=false` in the runtime environment and redeploy/restart. All B2 Writing traffic returns to `evaluateCambridgeEssay`.

**Real smoke verification (12 August 2026, ENGLISH_PROD, controlled test account):**

| Check | Result |
| --- | --- |
| Routes to v3 (global_rollout) | PASS |
| Candidate response byte-for-byte | PASS |
| Valid complete assessment | PASS — execution `93485a11-0aab-406e-bc1e-d9827b689398` |
| Marks | Content **3** / CA **3** / Organisation **3** / Language **3** = **12/20** |
| Feedback matches assessment | PASS (`raw_total` 12) |
| Persistence bundle complete | PASS (submission + execution + task analysis + observations + assessment + 4 criteria + feedback + validation) |
| Multiple executions / history | PASS (distinct execution rows coexist) |
| Cross-user forge / client write | Blocked by RLS + SELECT-only grants (no INSERT/UPDATE/DELETE for `authenticated`) |
| CEFR / Pass / readiness in payload | Absent (`level_indicator: null`) |
| Provider usage | 16 982 tokens · ~$0.065 · ~26.1 s · model `gpt-4o-2024-08-06` · token_source `provider_reported` |
| Kill switch | Code path `kill_switch_off` → legacy; default ON when unset |

**R3** remains **OPEN** (scoring calibration deferred). **R4** unchanged. **R6 mobile** deferred. Desktop R6 status unchanged from prior documentation.

---

## 11. Reuse / adapt / replace / delete register

### 11.1 Core engine — `src/lib/cambridgeEssayFeedback.js`

| Function | Decision | Reason |
| --- | --- | --- |
| `evaluateCambridgeEssay` | **Replace** (B2) / **Keep frozen** (other levels) | Single-pass monolith; v3 orchestrator supersedes it for B2 only |
| `buildB2FirstPrompt` | **Replace** | Emoji-section plain-text contract; superseded by three schema-constrained prompts |
| `buildGenericPrompt` | **Keep** | Serves A2 and other levels, out of v1 scope |
| `buildTaskPack`, `clipText` | **Adapt** | Task-context assembly logic is reusable as the input to `task_analysis` |
| `inferWritingTaskType` | **Adapt** | Becomes the last-resort fallback in Phase 2; prefer explicit `task_type` from `b2WritingTasks` |
| `countEssayWords` | **Reuse** | Correct and needed; only its *use as a penalty* is forbidden, not the count itself |
| `extractScore`, `extractTaskMatch`, `extractCefrLevel` | **Delete** at cutover | Regex parsing of model prose is exactly the contract Doc 05 §12 replaces |
| `normalizeDecimalScores`, `normalizeCefrLevelLine`, `dedupeCorrectionCards`, `normalizeCardComparable` | **Delete** | Repairs of an unstructured output that no longer exists |
| `applyCefrScoreCoherence` | **Delete** | REG-06 score smoothing |
| `applyImplicitOnTaskContentFloor` | **Delete** | REG-06 score smoothing |
| `applyTaskRelevanceClamp` | **Delete** | REG-09 cross-criterion compensation; replaced by Content evidence per Doc 06 §10 |
| `reclassifyImpliedTaskMatch` | **Delete** | Post-hoc rewriting of a scoring decision |
| `stripInRangeWordCountClaims` | **Delete** | A patch for a word-count instruction that v3 does not issue |
| `buildWordCountRules` | **Delete** | REG-05 word-count penalty |
| `ensureMinimumCorrectionCards`, `countCorrectionCards`, `locateCorrectionsSection` | **Delete** | Correction quota; violates Doc 02 R33/R54 and FB-10 |
| `enforceImprovedVersionLength`, `requestShortenedVersion`, `buildImprovedVersionFallbackNote`, `locateImprovedSection` | **Delete** | The "improved version" is not part of the Doc 04 payload; annotations carry `suggested_change` instead |
| `resolveB2Readiness`, `syncReadinessLine` | **Delete** | Pass/readiness concept removed from the engine |
| `ensureStudyPlanLine` and the five `ensure*StudyPlanLine` variants | **Replace** | Superseded by `review_next` in the feedback payload |
| `findUncoveredStudyPlanAreas`, `removeUnbackedStudyPlanAreas` | **Delete** | Coupled to the study-plan text format |
| `applyOffTaskImprovedNote`, `OFF_TASK_IMPROVED_NOTE`, `hasExplicitnessCaveat` | **Delete** | Off-task handling moves into Content evidence |
| `getCalibrationBlock` | **Adapt** | The few-shot idea is sound; v3 uses the twelve official profiles as anchors instead |
| `isWritingCorrectionV2Enabled`, `isWritingCalibrationEnabled` | **Delete** at cutover | Dead flags; replaced by the v3 flag |
| `normalizeForQuoteMatch` | **Reuse** | Exactly the normalisation the Doc 05 §12 quote validator needs |
| `getStudyPlanGrammarBlock` | **Delete** | Format-coupled |

### 11.2 Engine plumbing

| File / function | Decision | Reason |
| --- | --- | --- |
| `src/lib/draloAiEngine.js` → `cambridgeChatCompletion` | **Keep, do not use for v3** | Still needed by speaking, exam generation and answer-justify. v3 bypasses it to control the model. |
| `cambridgeViaAssistantOrChat`, `assistantCompletion` | **Keep, do not use for v3** | Assistants path makes the model and temperature uncontrollable — incompatible with R3 reproducibility |
| `getDefaultModel`, `getDraloOpenAI` | **Reuse** | Client construction and key handling |
| `src/lib/aiActionHandlers.js` → `handleExamWritingCorrection` | **Adapt** | Becomes a router: B2 + flag → v3; everything else → legacy |
| `recordAiUsageSuccess` / `recordAiUsageFailure` (`ai_usage_logs`) | **Adapt** | Reuse the table and limits, but replace **estimated** tokens with the real `usage` object returned by the API, and log every stage including retries |
| `runAiPreflight`, IP rate limiting | **Reuse** | Unchanged |
| `src/app/api/dralo-ai/route.js` | **Keep** | Dispatch shape stays; a new dedicated route carries the v3 contract |
| `src/app/api/feedback/essay/route.js` | **Keep frozen** | Legacy alias used by the sandbox and `DraloAiStudio` |
| `src/lib/ai/draloAiClient.js` → `callExamWritingCorrection` | **Adapt** | Add a sibling `callWritingEngineV3` rather than changing the existing signature |
| `src/app/api/placement/evaluate-writing/route.js` | **Do not touch** | Separate 0–10 placement construct, explicitly out of scope |
| `ai-backend/api/feedback/essay.js` | **Delete (verify first)** | Standalone legacy backend with its own `passed = total >= 12` and `gpt-4o-mini` default; confirm nothing deploys it before removal |
| `handleDraloAiWritingCoach`, `examCoachService.js` | **Do not touch** | Conversational coach, not essay correction |

### 11.3 Rendering and parsing

| File | Decision | Reason |
| --- | --- | --- |
| `src/components/writing/WritingInteractiveAnnotatedText.js` | **Adapt** | Interaction model already matches Doc 04; swap markup parsing for offset-based annotations |
| `src/lib/writingAnnotatedMarkup.js` | **Replace** | `[[tag]]` markup, five categories, colour coupled to key |
| `WRITING_ANNOTATION_LEGEND` | **Replace** | Becomes six colour-free keys plus a separate palette module |
| `buildWritingMarkPopupNotes`, `getTeacherMarkChip`, `findCorrectionForPhrase`, `findContextNoteForMarkedPhrase` | **Delete** | Heuristics that reconstruct structure from prose; v3 receives the structure directly |
| `src/lib/writingAnnotatedTextBuilder.js` (`injectServerAnnotatedText`, `buildAnnotatedEssayText`) | **Delete** at cutover | Server-side markup injection replaced by stored spans |
| `src/components/writing/WritingFeedbackBody.js` | **Keep frozen** | Still renders legacy feedback for non-B2 and historical corrections |
| `src/lib/formatWritingFeedback.js`, `writingFeedbackSections.js`, `formatWritingFeedbackHtml.js` | **Keep frozen** | Same reason; delete only when legacy is retired |
| `src/lib/writingFeedbackPostProcess.js` | **Delete** at cutover | V2-only deterministic patches |
| `src/lib/writingFeedbackValidators.js` | **Adapt** | Fixture-validation idea is reused by the Doc 06 harness |
| `src/lib/calibration/*` (3 files) | **Adapt** | Replaced by the twelve official golden fixtures |
| `src/components/niveles/LevelsWritingCorrectionPanel.js` | **Keep frozen** | Sandbox has no task prompt, so Content and CA cannot be confidently scored (SC-06). Migrating it requires a product decision about what a task-less correction means. |
| `src/components/b2/B2WritingLongFormAiPanel.js` | **Adapt** | Keep the editor, word counter and draft persistence; replace the results area |
| `B2WritingFirstTaskCard.js`, `B2WritingPart2TaskPicker.js`, `B2WritingStrategyPanel.js` | **Reuse** | Pre-submission UI, unaffected |
| `B2WritingDraftStatusPanel.js` | **Adapt** | Remove the `passingCount = 12` display |
| `src/app/globals.css`, `src/styles/dralo-ai.css` | **Reuse + additive** | Visual source of truth per Doc 04 §8 |

### 11.4 Scoring and persistence utilities

| File | Decision | Reason |
| --- | --- | --- |
| `src/utils/levelsB2PartScoring.js` | **Adapt** | `passing: 12` for parts 8–9 is retained and renamed as `legacy_product_progression_rule` (§0.3.1): stars and gating only, never learner-facing, never upstream of assessment. |
| `src/utils/levelsA2PartScoring.js` | **Do not touch** | Out of scope |
| `src/utils/examModeWritingScore.js` | **Adapt** | Read `raw_total` from the v3 payload; keep localStorage draft recovery |
| `recordLevelsB2PartScore.js`, `persistLevelsPartProgress.js`, `levelsPuntuaciones.js`, `levelsStars.js`, `partSessionTime.js` | **Reuse unchanged** | Deliberately untouched so gating and stars cannot regress |
| `src/utils/errorTracker.js` → `trackWritingErrors` | **Replace** | Currently a **second LLM call** (`extract_errors`) that re-derives errors from feedback prose. v3 already has structured observations, so `user_error_tracker` is populated directly — this removes one call per correction and pays for part of the new pipeline. |

---

## 12. Explicit removal / bypass plan for forbidden behaviours

| # | Behaviour | Where it lives | Active in prod? | Removal mechanism | Test |
| --- | --- | --- | --- | --- | --- |
| 1 | Word-count scoring penalties | `buildWordCountRules` (V2), legacy prompt line `Target length when relevant` | Graduated version **no**; soft line **yes** | v3 prompts never mention length as a penalty. `word_count` travels as neutral context with `word_guidance.automatic_penalty: false`. Validator rejects any rationale citing length as a deduction. | REG-05, REG-07, §10 (120-word and 230-word cases) |
| 2 | `applyCefrScoreCoherence` | `cambridgeEssayFeedback.js` | No | Not ported. Deleted at cutover. Asymmetric profiles are anchored positively in the scoring prompt (G-07 `5/2/2/2`). | REG-06, G-07, G-11 |
| 3 | `applyImplicitOnTaskContentFloor` | `cambridgeEssayFeedback.js` | No | Not ported. "Point implied but not explicit" becomes Content evidence weighed by the band model, not a floor. | REG-06, CB-C45 |
| 4 | Cross-criterion numerical clamps | `applyTaskRelevanceClamp` (unconditional call, no-op in prod) | Called, no-op | Not ported. Wrong-task handling becomes low Content with evidence (Doc 06 §10). `validateCriterionProvenance` rejects any rationale justifying one criterion by another's mark. | REG-09, §10 wrong-task cases |
| 5 | Mandatory correction-card quotas | `buildB2FirstPrompt` minimum-cards instruction | No | v3 emits observations selected by `correction_mode`; no minimum exists. Meaning-blocking issues are always included (R36). | FB-10, TD-05, TD-06 |
| 6 | `ensureMinimumCorrectionCards` | `cambridgeEssayFeedback.js` | No | Deleted with its helpers. Removes an unlogged extra OpenAI call. | FB-10 |
| 7 | Single-writing CEFR labels | `🎓 Estimated CEFR level` prompt section, `extractCefrLevel`, `scores.cefr`, `WritingFeedbackBody` | **Yes** | No CEFR section in any v3 prompt; `level_indicator: z.null()`; `validateNoLevelClaim` scans every learner-facing string for CEFR tokens. | SC-09, REG-11 |
| 8 | 12/20 pass indicator | `required = 12`, `passed`, `scores.required ?? 12` in both panels, `passingCount` | **Yes** | Removed from the engine contract, the payload and the v3 UI. The threshold survives only as `legacy_product_progression_rule` (§0.3.1), computed by the caller from `raw_total`, invisible to the learner. `validateNoProgressionLeakage` blocks reintroduction. | Doc 06 §13 "Score secondary"; `validateNoProgressionLeakage` |
| 9 | Plain text + regex as the engine contract | Entire legacy pipeline | **Yes** | JSON Schema structured outputs end-to-end. Regex parsers survive only to render historical corrections until legacy retirement. | SC-01…SC-10 |

---

## 13. Decision register

### 13.1 Resolved

| # | Decision | Resolution |
| --- | --- | --- |
| **D1** | Current Assistant baseline | **RESOLVED.** Recorded in §0.2.1: model `gpt-4.1-mini`, temperature 1, `response_format: json_object`, `file_search` over one vector store, instructions = the 5 390-character `# DRALO EXAM COACH` prompt. Documentation only; v3 does not preserve the Assistants architecture. |
| **D2** | 12/20 | **RESOLVED.** All learner-facing Pass/Fail, "B2 standard met" and single-writing CEFR inference are removed. The threshold survives only as `legacy_product_progression_rule` (§0.3.1), isolated from Cambridge Assessment, never altering criterion marks or reasoning. |
| **D3** | Interactive Writing Map taxonomy | **RESOLVED.** Six category keys, CLOSED: `grammar`, `vocabulary`, `spelling`, `organisation`, `content`, `strength`. Semantic CSS/design tokens are implemented independently of `category_key`, with the palette derived from the existing DRALO visual system. Colour approval is required before **R6** and does not block engine or data work. |
| **D4** | Golden scripts | **RESOLVED.** The calibration corpus exists: `167791-b2-first-handbook.pdf` and `182410-first-writing-sample-answers-and-examiner-comments-2015.pdf`, with the DRALO Cambridge Baseline Appendix A as the manifest of the twelve preserved scripts and examiner profiles. Fixtures are built **verbatim from the original Cambridge PDFs**; candidate responses and examiner marks are never paraphrased. |
| **D5** | Persistence layer | **RESOLVED (technical).** Supabase SQL migration plus the Supabase server client, consistent with the `levels_*` family and its RLS. Prisma is not extended for writing. |
| **D6** | TypeScript for the new module | **RESOLVED (technical).** Yes — mirrors `src/features/speaking/`; zod schemas are the backbone of the Document 05 contracts. |

### 13.2 Remaining blockers

| # | Item | Blocks | Owner | Notes |
| --- | --- | --- | --- | --- |
| **B-01** | Latent Assistant misconfiguration | Nothing in v3; **P1 preventive — not active** | Technical | **Production confirmed working 9 Aug 2026** via Chat Completions fallback (stale Vercel ID → 404). Live Assistant (`asst_yiuK…jrLk`) + `json_object` → 400 if ID ever resolves. **R0 binding: do not modify Assistant, `response_format`, or Vercel variable; do not repoint to live ID.** v3 uses its own Chat Completions pipeline. |
| **D3-colour** | Approve the six semantic colours | **R6** only | Product / UX | Engine, schemas, persistence and API are unaffected |
| **D7** | Does the free-writing sandbox (`LevelsWritingCorrectionPanel`) migrate to v3? | Phase 10 scope | Product | It has no task prompt, so SC-06 forces `incomplete`. Recommendation: keep on legacy in v1. |
| **D8** | Shadow-mode window before exposing v3 | Phase 10 | Product | Score distribution will shift; agree a window and compare distributions before exposure |
| **D9** | B2 task data must record formal vs informal email explicitly | Before Phase 10 cutover | Product + data | `b2WritingTasks.js` stores `writingType: 'email'`; production scoring must not depend on the Phase 2 formality heuristic |
| **B-02** | `authRoles.js` previously relied on alias `user_profiles` | Role-gated staged rollout | **Mitigated 12 Aug 2026** — queries `Usuarios_y_Perfil_users` / `Usuarios_y_Perfil_profiles` explicitly |

None of the remaining items block **Phase 1**.

---

## 14. Risk register

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Twelve golden profiles do not reproduce exactly, three runs each | R3 blocked, release blocked | **High** | Pinned dated snapshot, `temperature: 0`, seeds, asymmetric anchors in-prompt; escalate to per-criterion calls if needed |
| Golden fixtures drift from the official PDFs during transcription | R3 invalid but green | Medium | D4 resolved: transcribe verbatim from `167791-b2-first-handbook.pdf` and `182410-first-writing-sample-answers-and-examiner-comments-2015.pdf`; store a checksum per fixture and a two-person verbatim check; fixtures are immutable once merged |
| Legacy writing may be returning a 500 to every student (finding B-01) | Feature outage **today**, independent of v3 | **Downgraded — production confirmed working 9 Aug 2026** | Production uses Chat Completions fallback; live Assistant path is latent risk only. Remove `json_object` from Assistant before repointing production variable |
| Cost increase from multi-call pipeline | Budget | Medium | Task-analysis cache (amortises stage A to ~0), removal of the `extract_errors` call, removal of `ensureMinimumCorrectionCards`; steady state is 2 calls, close to today's 1–2 |
| Latency increase (2 sequential calls + retries) | UX, R7 | Medium | Stream nothing until validated; measure p50/p95 from the first staging run; consider parallelising nothing (B+C must precede D) |
| A flag silently never set in production, repeating the V2 story | v3 never actually runs | **Medium-high** | Boot-time log of the resolved flag value, verified in Vercel logs after deploy; smoke test on a teacher account |
| Score distribution shift upsets existing students | Trust, support load | Medium | Shadow mode + distribution comparison before exposure (D8) |
| Retry storms from strict validators | Cost, latency | Medium | Cap 2 retries per stage; `retry_rate` is release-blocking per Doc 06 §18 |
| RLS gap exposes student writing | P0 security | Low | Mirror the existing `levels_*` RLS model; explicit policy review at R5 |
| Scope creep into A2 and the sandbox | Timeline | Medium | v1 is B2 First only; legacy stays alive and frozen |
| Pre-existing role-resolution bug (`authRoles.js` queries the non-existent `user_profiles`; the real table is `Usuarios_y_Perfil_profiles`) | Role-gated rollout silently falls back to `student` | **High if used** | Fix or bypass before relying on `DRALO_WRITING_ENGINE_V3_ROLES` for staged rollout |

---

## 15. First implementation commit (proposed — awaiting explicit Phase 1 approval)

**Title:** `feat(writing-engine): add v3 contracts, schemas and persistence migration (no runtime wiring)`

**Principle:** the commit is inert. It adds contracts, tests and a migration, and changes **zero**
existing runtime behaviour. Nothing imports the new module, no route calls it, no flag turns it on.
Deploying it to production must be a no-op for every existing user.

### 15.1 Files created

| Path | Contents |
| --- | --- |
| `src/features/writing/domain/categories.ts` | The six CLOSED `category_key` values (D3). No colour, no CSS class. |
| `src/features/writing/domain/engine-version.ts` | `ENGINE_VERSION`, `PROMPT_VERSIONS`, `SOURCE_DOC_VERSIONS` (01–06 at v1.0) |
| `src/features/writing/domain/schemas.ts` | zod: `taskAnalysisSchema`, `observationSchema`, `assessmentRecordSchema`, `criterionDecisionRecordSchema`, `feedbackPayloadSchema`, `validationResultSchema`, `engineExecutionSchema` |
| `src/features/writing/domain/types.ts` | `z.infer` type exports |
| `src/features/writing/README.md` | Layer boundaries, what may never enter a scoring prompt, pointer to Docs 01–06 |
| `src/features/writing/__tests__/schemas.test.ts` | SC-01, SC-02, SC-03, SC-05, SC-07 + D2/D3 guards |
| `scripts/sql/writing_engine_schema.sql` | The migration below, idempotent, with RLS policies |
| `scripts/verify-writing-engine-schema.mjs` | Read-only checker: tables, constraints, RLS present and correct |

### 15.2 Files modified

| Path | Change |
| --- | --- |
| `package.json` | Add `"test:writing-engine"` script. No dependency changes — `zod`, `typescript` and `@types/node` are already installed. |
| `DOCUMENTOS DE CORRECION/07_…Implementation_Plan_v1.0.md` | Mark Phase 1 as started |

Nothing else. In particular this commit does **not** touch `cambridgeEssayFeedback.js`,
`draloAiEngine.js`, `aiActionHandlers.js`, any API route, any component, `globals.css`,
`levelsB2PartScoring.js` or any environment variable.

### 15.3 Database migration included

`scripts/sql/writing_engine_schema.sql` — `CREATE TABLE IF NOT EXISTS` for the eight new tables in
§7.1, all prefixed `writing_`, plus:

- `CHECK (mark >= 0 AND mark <= 5)` and `mark` typed `smallint` on `writing_assessment_criteria`
- `UNIQUE (execution_id, criterion)` — exactly four decision records per execution
- `CHECK (NOT single_task_scale_claim_allowed)` on `writing_assessments` (SC-09 enforced in the database)
- `CHECK (max_total = 20)`
- a deferred constraint trigger asserting `writing_assessments.raw_total` equals the sum of its four
  criterion rows at `COMMIT` (SC-03), plus the presence of all four canonical criteria
- `NOT NULL` on `why_not_higher`
- `UNIQUE (task_fingerprint)` on `writing_task_analyses`
- append-only `UPDATE` triggers on the seven artefact tables and a lifecycle guard on
  `writing_engine_executions`
- RLS enabled on every table, mirroring the existing `levels_*` policy shape: a student reads only
  their own rows; the service role writes

**The migration has not been applied.** It is reviewed before any database runs it.

**No `ALTER TABLE` on any existing table.** `levels_puntuaciones`, `Levels_stars`,
`levels_estadisticas`, `levels_preguntas`, `user_error_tracker` and `ai_usage_logs` are untouched, so
the migration cannot regress progression, stars or gating.

### 15.4 Rollback

`DROP TABLE` on the eight new tables and revert the commit. Because nothing imports the module and no
existing table is altered, rollback is total and carries no data risk.

### 15.5 Definition of done for the first commit

- `npm run test:writing-engine` green, including a test asserting `3.5` is rejected as a criterion mark
- a test asserting the schemas contain no `passed`, `required`, `cefr` or `readiness` field (D2)
- a test asserting `category_key` accepts exactly the six closed values and carries no colour (D3)
- `node scripts/verify-writing-engine-persistence.mjs` reports every table, constraint and policy
  present (statically until a database has the migration; then also against that database)
- `npm run build` unchanged and green
- manual confirmation that the production writing flow behaves identically before and after

---

## 16. Phase-to-gate summary

| Phase | Gate | Blocking predecessor | Status |
| --- | --- | --- | --- |
| 0 Audit | **R0** | — | **CLOSED** |
| 1 Contracts | R1 | R0 | **Unblocked — awaiting approval** |
| 2 Task Analysis | R2 | R1 | Unblocked |
| 3 Observations | R4 | R1 | Unblocked |
| 4 Assessment | **R3** | R1, R2 | Unblocked (D4 resolved) |
| 5 Validation | R1 / enforces R3 | R1 | Unblocked |
| 6 Feedback Engine | R4 | R3 | **COMPLETE / CLOSED** (R4 still open) |
| 7 Persistence | R5 | R1 | **COMPLETE / CLOSED** — schema applied on ENGLISH_PROD; R5 verification green for tables/RLS/grants |
| 8 UX | R6 | R4 | **Implemented — R6 OPEN** (screenshots awaiting review) |
| 9 Golden suite | R3, R4 | R3 | Unblocked (D4 resolved); R3 scoring deferred |
| 10 Cutover | R5, R7, R8 | all | **GLOBAL ROLLOUT LIVE** — kill switch available; R3 remains OPEN |

---

## Appendix A — Legacy Assistant instructions, verbatim (D1 baseline record)

Retrieved read-only on 9 August 2026 from the Assistant referenced by
`OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS`. Reproduced unmodified for baseline traceability. This is the
**legacy** prompt; it is superseded by the v3 prompt stack and is recorded here only so that any
before/after comparison has a fixed reference.

```text
# DRALO EXAM COACH

You are DRALO Exam Coach, an elite English exam preparation assistant specialized in CEFR levels A2, B1, B2, C1 and C2.

You behave like:

* an experienced English teacher
* a speaking examiner
* a writing examiner
* a grammar and vocabulary coach
* a supportive language tutor

Your objectives are:

* help students prepare for official English exams
* improve writing, speaking, reading, listening, grammar and vocabulary
* provide realistic CEFR evaluation
* generate original exam-style practice
* give practical, motivating and clear feedback
* help students communicate naturally and confidently

━━━━━━━━━━━━━━━━━━━
GENERAL RULES
━━━━━━━━━━━━━━━━━━━

Always:

* be professional, supportive and human-like
* adapt explanations to the student's level
* explain mistakes clearly
* prioritize communication over perfection
* focus on practical improvement
* encourage confidence
* be concise when possible
* adapt feedback length to the student's level
* evaluate realistically and avoid inflated scores

Never:

* claim affiliation with Cambridge
* copy copyrighted material
* reproduce official exam texts
* generate identical official exercises
* overcorrect tiny mistakes
* sound robotic
* overestimate student level
* rewrite weak texts into native-level English

━━━━━━━━━━━━━━━━━━━
SUPPORTED AREAS
━━━━━━━━━━━━━━━━━━━

You can help with:

* Writing correction
* Speaking evaluation
* Grammar explanations
* Vocabulary improvement
* Reading practice
* Use of English practice
* Listening scripts and questions
* Speaking prompts
* Full exam generation
* Answer keys
* Model answers
* CEFR level estimation
* Study plans
* Error analysis

━━━━━━━━━━━━━━━━━━━
WRITING CORRECTION RULES
━━━━━━━━━━━━━━━━━━━

When correcting writing:

1. Estimate CEFR level.
2. Identify the task type.
3. Evaluate:

* Content
* Communicative Achievement
* Organisation
* Language

4. Highlight strengths first.
5. Prioritize important mistakes:

* communication issues
* repeated errors
* unnatural language
* grammar problems
* weak organisation
* wrong register

For each important mistake:

* quote the original sentence
* explain the problem
* provide a corrected version
* explain why the correction is better

Then provide:

* improved version
* better vocabulary and alternatives
* final practical advice
* one short improvement task

The improved version must preserve the student's original ideas and match the student's approximate level.

━━━━━━━━━━━━━━━━━━━
SPEAKING EVALUATION RULES
━━━━━━━━━━━━━━━━━━━

When evaluating speaking:

Evaluate:

* fluency
* grammar
* vocabulary
* pronunciation
* interaction
* global communication

Provide:

* strengths
* repeated mistakes
* natural alternatives
* pronunciation advice
* realistic examiner-style feedback
* one short improvement challenge

When generating speaking examples:

* sound conversational
* use realistic spoken English
* avoid overly academic language
* include natural hesitation occasionally when useful

━━━━━━━━━━━━━━━━━━━
GRAMMAR & VOCABULARY RULES
━━━━━━━━━━━━━━━━━━━

When teaching grammar or vocabulary:

* explain simply first
* provide examples
* include common mistakes
* create short practice exercises
* give answers when useful
* adapt explanation to the CEFR level

Prioritize:

* natural English
* useful vocabulary
* collocations
* phrasal verbs
* real communication
* exam usefulness

━━━━━━━━━━━━━━━━━━━
EXAM GENERATION RULES
━━━━━━━━━━━━━━━━━━━

You can generate complete original exam practice materials for A2, B1, B2, C1 and C2.

When generating exams, you may create:

* Reading tasks
* Use of English tasks
* Writing tasks
* Listening scripts
* Speaking tasks
* Answer keys
* Model answers
* Explanations

All exam content must be original.

Use the knowledge files only as:

* CEFR references
* difficulty calibration
* grammar references
* vocabulary references
* exam structure references

Never copy texts, exercises, questions or answer keys literally.

Create content inspired by:

* realistic CEFR difficulty
* natural English
* authentic communication
* realistic exam structure
* appropriate vocabulary range
* appropriate grammar complexity

Do not make exams artificially difficult.
Do not make exams artificially easy.
The objective is realistic preparation, not trick questions.

━━━━━━━━━━━━━━━━━━━
CEFR CALIBRATION RULES
━━━━━━━━━━━━━━━━━━━

A2:

* simple vocabulary
* everyday topics
* short sentences
* basic grammar

B1:

* practical communication
* everyday situations
* simple opinions
* moderate vocabulary range

B2:

* developed opinions
* wider vocabulary
* natural collocations
* more complex grammar
* clear organisation

C1:

* nuanced argumentation
* sophisticated vocabulary
* advanced cohesion
* flexible grammar
* strong register awareness

C2:

* highly sophisticated language
* subtle meaning
* stylistic control
* near-native complexity
* precise argumentation

Important:
A real B2 student is not native-like and still makes mistakes.
A real C1 student shows flexibility, natural collocations and strong control.
A real C2 student shows precision, nuance and stylistic sophistication.

━━━━━━━━━━━━━━━━━━━
OUTPUT STYLE
━━━━━━━━━━━━━━━━━━━

Responses must be:

* clean
* structured
* easy to read
* practical
* motivating
* human-like

The student should feel:

* supported
* guided
* challenged appropriately
* motivated
* capable of improving

# END
```

### A.1 Conflicts between this baseline and Documents 01–04

| Legacy instruction | Conflict |
| --- | --- |
| *"Estimate CEFR level"* (Writing rule 1) | D2 removes CEFR inference from a single writing |
| *"Highlight strengths first"* | Compatible with Doc 04 §3.2, but here it is an output-ordering rule rather than evidence-selected opening strengths |
| *"provide: improved version … one short improvement task"* | Not part of the Doc 04 payload; v3 carries `suggested_change` per annotation and `review_next` instead |
| Four criteria listed with no band descriptors, no whole-band rule, no evidence requirement | Doc 03 requires whole bands 0–5 with `why_not_higher` / `why_not_lower` |
| *"evaluate realistically and avoid inflated scores"*, *"overestimate student level"* | A global severity bias with no descriptor basis; Doc 03 A01 requires judging observable performance against the official anchors |
| *"never claim affiliation with Cambridge"* | **Aligned** — consistent with the required DRALO-estimate disclaimer |
| Multi-skill scope (speaking, grammar, exam generation) in the same instruction set | The same Assistant serves speaking, exam generation and answer-justify, so its writing rules can never be tuned without affecting other product areas. This is the structural reason v3 must not reuse it. |

---

## Appendix B — Legacy Production UI Baseline

**Captured:** 9 August 2026 · Production site · B2 First Writing Part 1 (compulsory essay) · Topic: fast food.

**Purpose.** This appendix records what students **actually see today** when Writing correction succeeds via
the Chat Completions fallback (§0.2.2). It is a **legacy visual and behavioural baseline** for
before/after comparison during v3 cutover.

**Not the source of truth for v3.** Document **04 — Writing Feedback UX Specification v1.0** defines the
future feedback architecture, progressive disclosure, Interactive Writing Map behaviour and payload
shape. The DRALO design system and reusable components remain the **visual** source of truth. This
appendix does **not** authorise copying legacy layout, section order or forbidden labels into v3.

**Screenshots (four captures, same submission).** For external review, bundle these with this document.
Source files supplied by product on 9 August 2026:

| Figure | File (as supplied) | What it shows |
| --- | --- | --- |
| B-1 | `WhatsApp_Image_2026-08-09_at_20.46.57.png` | **DRALO WRITING FEEDBACK** header; **MAIN STRENGTHS** (green); **MAIN PROBLEMS** (orange); **ANNOTATED TEXT** with legacy five-colour key and highlighted student essay |
| B-2 | `WhatsApp_Image_2026-08-09_at_20.46.58.png` | Annotated essay body; **ESTIMATED CEFR LEVEL** block (`Level: low B2` + rationale) |
| B-3 | `WhatsApp_Image_2026-08-09_at_20.46.58 (1).png` | **ESTIMATED CEFR LEVEL**; **SCORES** (four criteria + total); **IMPROVED VERSION (YOUR LEVEL)**; start of **STRONGER B2 VERSION** |
| B-4 | `WhatsApp_Image_2026-08-09_at_20.46.58 (2).png` | Essay conclusion in annotated view; **STUDY PLAN**; **WRITING SCORES** panel; **Total: 13/20**; **Pass mark: 12/20**; green **Pass** badge; **Pass — B2 standard met** |

### B.1 Observed legacy UI elements (inventory)

| # | Element | Observed content (this submission) | Legacy component / parser |
| --- | --- | --- | --- |
| 1 | Panel title | `DRALO WRITING FEEDBACK` | `formatWritingFeedback` / `LevelsWritingCorrectionPanel` |
| 2 | Main strengths | Bullet list with ✓ (e.g. clear paragraphing, good contrast) | Regex section `💪` / `MAIN STRENGTHS` |
| 3 | Main problems | Bullet list (missing title, generic content, underdeveloped own idea, repetitive vocabulary, weak conclusion) | Regex section `🎯` / `MAIN PROBLEMS` |
| 4 | Annotated text | Student essay with inline highlights; tap-for-correction hint | `injectServerAnnotatedText`, `WritingInteractiveAnnotatedText` |
| 5 | Colour key (legacy 5) | Yellow vocabulary · Blue spelling · Red grammar · Purple content · Green strengths | `WRITING_ANNOTATION_LEGEND` (5 entries — no `organisation` key) |
| 6 | ESTIMATED CEFR LEVEL | `Level: low B2` + explanatory sentence | `extractCefrLevel`, `WritingFeedbackBody` |
| 7 | SCORES block | Content 3/5, CA 3/5, Organisation 4/5, Language 3/5 | `extractScore` |
| 8 | Total | `13/20` | Sum of four whole-band marks |
| 9 | Pass — B2 standard met | Green check + label in study-plan area | `resolveB2Readiness` / readiness UI |
| 10 | STUDY PLAN | Grammar / Vocabulary / Strategy bullets + tip about highlights | Prompt section + parser |
| 11 | IMPROVED VERSION (YOUR LEVEL) | Full rewritten essay at student's level | Prompt section `✏️` |
| 12 | STRONGER B2 VERSION | Higher-register rewrite | Prompt section |
| 13 | WRITING SCORES (footer panel) | Four criterion rows repeated | `B2WritingLongFormAiPanel` scores panel |
| 14 | Pass mark: 12/20 | Learner-facing threshold line | `scores.required ?? 12` |
| 15 | Pass badge | Green **Pass** next to total | `passed = total >= required` |

### B.2 Remain in v3 (conceptual continuity)

These learner-facing **ideas** survive in v3. Implementation shape comes from Doc 04 and the v3
`feedback_payload`, not from copying this layout verbatim.

| Legacy element | v3 equivalent (Doc 04 / engine contract) |
| --- | --- |
| Four criterion scores (Content, Communicative Achievement, Organisation, Language) | Four independent **whole-band marks 0–5** in `assessment_record` |
| Raw **/20 total** | `raw_total` — sum of the four marks; displayed with DRALO-estimate disclaimer |
| Annotated student writing | **Interactive Writing Map** — offset-based annotations, click-activated popups |
| Strengths feedback | `opening_strengths` / strength-category annotations (`category_key: strength`) |
| Improvement feedback | Observation-linked corrections, `suggested_change`, criterion decision rationales, `review_next` |

### B.3 Removed or replaced in v3

| Legacy element (visible in screenshots) | v3 treatment | Authority |
| --- | --- | --- |
| **ESTIMATED CEFR LEVEL** (`Level: low B2`, rationale) | **Removed.** `level_indicator` is always `null`. No CEFR token in learner-facing strings. | D2; `validateNoLevelClaim` |
| **Pass — B2 standard met** | **Removed** from feedback UI | D2 |
| Learner-facing **Pass mark: 12/20** | **Removed** from feedback UI | D2; Doc 04 §13 |
| Green **Pass** badge | **Removed** from feedback UI | D2 |
| **Legacy five-category** colour key (vocabulary / spelling / grammar / content / strengths — no organisation) | **Replaced** by six **closed** semantic keys: `grammar`, `vocabulary`, `spelling`, `organisation`, `content`, `strength`. `category_key` independent from colour; palette from DRALO design tokens (colour approval before R6). | D3 |
| Inline `[[markup]]` annotation encoding | **Replaced** by offset-based annotation records in JSON payload | Doc 04; Phase 8 |
| **STUDY PLAN** (free-form grammar/vocabulary/strategy bullets) | **Replaced** where it conflicts with Doc 04 by structured `review_next` and progressive disclosure layers — not a duplicate study-plan prose block | Doc 04 |
| **IMPROVED VERSION (YOUR LEVEL)** (full rewrite) | **Removed** as a default section. Per-annotation `suggested_change` and evidence-bound feedback replace wholesale rewrites | Doc 04; Teacher DNA |
| **STRONGER B2 VERSION** (higher-register rewrite) | **Removed.** Conflicts with Doc 04 progressive disclosure and non-inflation principle | Doc 04; Doc 02 |

**Note on `legacy_product_progression_rule`.** The **12/20 threshold is not shown** in v3 feedback (see
rows above). It may still be computed **outside** the engine from `raw_total` for `Levels_stars` and
gating only (§0.3.1). It never alters criterion marks or assessment reasoning.

### B.4 Latent legacy risk (document only — no action required)

If `OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS` is ever repointed to the live Assistant (`asst_yiuK…jrLk`)
**without** removing `response_format: json_object` or without per-call `response_format` overrides,
Writing would fail with HTTP 400 (B-01, §0.2.1). **R0 acceptance explicitly forbids** repointing the
Vercel variable or modifying the Assistant as part of this programme. v3 does not depend on resolving
this risk for go-live.

### B.5 External review bundle

Share for review:

1. This file (`07_DRALO_Writing_Engine_Implementation_Plan_v1.0.md`)
2. Documents 01–06 (`.docx` in `DOCUMENTOS DE CORRECION/`)
3. The four WhatsApp screenshots listed in the table above (Figure B-1…B-4)
4. Cambridge golden-source PDFs: `167791-b2-first-handbook.pdf`, `182410-first-writing-sample-answers-and-examiner-comments-2015.pdf`
