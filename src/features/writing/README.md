# DRALO Writing Engine v3 (`src/features/writing`)

Cambridge B2 First writing assessment. Phases 1 (contracts), 2 (Task Analysis), 3 (Teacher DNA
observation extraction), 4 (Cambridge assessment), 5 (deterministic validation), 6 (feedback
composition) and 7 (persistence) are implemented; nothing is wired to an API route or the UI, the
Phase-7 migration has **not been applied to any database**, and the marks are **not calibrated**
against the official golden scripts.

## Source of truth

| Layer | Document |
| --- | --- |
| Task requirements | 01 — Task Requirements |
| Observation pedagogy | 02 — Teacher DNA v1.0 |
| Scoring | 03 — Cambridge Assessment v1.0 |
| Learner UX | 04 — Writing Feedback UX v1.0 |
| Technical contracts | 05 — Technical Implementation Handoff v1.0 |
| Acceptance | 06 — Acceptance & Validation v1.0 |
| Repository plan | 07 — Implementation Plan v1.0 |

Where legacy code conflicts with Documents 01–04, **the documents win**.

## Phase 1 scope (`domain/`)

| File | Role |
| --- | --- |
| `categories.ts` | Six **closed** `category_key` values (D3). No colour. |
| `engine-version.ts` | `WRITING_ENGINE_VERSION`, doc and prompt version pins |
| `schemas.ts` | Zod contracts: task analysis, observations, assessment, feedback, validation, execution |
| `types.ts` | `z.infer` type exports |
| `task-types.ts` | The six B2 First genres and alias normalisation (Phase 2) |

## Phase 2 scope — Task Analysis

| File | Role |
| --- | --- |
| `prompts/knowledge/doc01-genre-rules.ts` | Doc 01 encoded as mandatory / wording-conditional / recommended sets |
| `prompts/task-analysis.prompt.ts` | Prompt, Structured Outputs JSON schema and model-output contract |
| `services/analysis/task-analysis.service.ts` | Task-type resolution, stable IDs, fingerprint, assembly, safeguards |

The layer answers one question: **what does this task require?** It never sees a candidate answer,
never scores and never produces feedback. It also never routes a requirement to a Cambridge
criterion: `primary_criterion`, `criterion`, `score_effect`, `band_effect`, `deduction` and
`penalty` are forbidden keys. Criterion relevance is decided in Layer 3 against the actual script.

**Three classifications, kept apart by literals.**

| Set | Meaning |
| --- | --- |
| `mandatory_genre_conventions` | Binary: Doc 01 treats it as essential, or the task wording makes it mandatory |
| `core_genre_expectations` | What the genre must achieve. Never a checkbox — evidence made available to downstream reasoning |
| `recommended_genre_features` | Optional techniques that may improve the writing |

A Doc 01 recommendation can only become mandatory when the wording of that specific task requires
it, and only with a quote verified against the task text. A core expectation can never become
mandatory at all. `status` is a literal in each schema, so the sets cannot be silently merged.

**Determinism.** Code owns task-type normalisation, `cp01`/`fn01`/`gc01`/`ce01`/`rf01` IDs,
register, word guidance and its `source`, `automatic_penalty: false`, versions and the fingerprint.
The model only interprets wording: target reader, purpose, content points, required functions and
ambiguities.

**Stable IDs.** Requirements are bound to their verified evidence in `source_task_text`, ordered by
position in that text, tie-broken by normalised semantic text and de-duplicated *before* they are
numbered. Reordering the model's output cannot change the result.

**Nothing is invented to complete the schema.** `target_reader` is nullable and resolves through
task wording → trusted metadata → unambiguous inference → unresolved. Email formality read from the
wording is a fallback heuristic: low confidence, flagged in provenance, unresolved when ambiguous.

**Cache identity, not cache.** `task_fingerprint` and `cache_key` cover the task text, task type,
Doc 01 version, prompt version, schema version and model snapshot. Persistence lands in Phase 7.

## Phase 3 scope — Teacher DNA observation extraction

| File | Role |
| --- | --- |
| `prompts/knowledge/doc02-teacher-dna-rules.ts` | R01–R60, reading sequence, priority factors, safeguards |
| `prompts/observation-extraction.prompt.ts` | Prompt, Structured Outputs JSON schema and model-output contract |
| `services/observation/observation.service.ts` | Binding, IDs, deduplication, grouping, ordering, assertions, provenance |
| `services/validation/evidence-binding.ts` | Quote → offset resolution against the original response |
| `services/validation/intent-preservation.ts` | Rejects a suggestion that would change what the learner said |

The layer answers: **what is happening in this writing, and what is pedagogically important about
it?** The output is evidence and diagnosis, never an assessment result.

**History-free by construction.** `ObservationExtractionRequest` has fields for the candidate
response, the task analysis and the model config — and nothing else. `assertNoLearnerHistory` rejects
any request carrying learner context, the 13 Teacher DNA rules that need history or course stage are
filtered out of the prompt, `within_script_frequency` cannot express historical recurrence, and
longitudinal phrasing in the model's prose is rejected rather than absorbed. Learner history is
attached only **after** Layer 3 has frozen the marks, so it cannot contaminate them.

**Score-free by construction.** `FORBIDDEN_OBSERVATION_KEYS` and `findScoringLeakage` scan the whole
serialised result for criterion routing, marks, bands, CEFR, pass/fail and deductions, both on the
model output and on the assembled result. Layer 2 never decides which Cambridge criterion an
observation serves.

**Internal domains ≠ UI categories.** The nine observation domains are pedagogical. They are
deliberately not the six Interactive Writing Map `category_key` values and carry no colour. An
observation may legitimately have no local annotation.

**Correction strategy.** Only `comprehensive` and `focused` are claimable from the current script.
`consolidation`, `exam_readiness` and `exploration` need context Phase 3 does not have, so they live
in `contextualCorrectionModeSchema`, reserved for a later overlay. There is no quota: zero
observations, zero strengths and many observations are all valid outcomes.

**Evidence binding.** The model emits a quote and an occurrence index; code resolves the offsets
against the original text through a normalised projection with an index map, tolerating curly
apostrophes, collapsed whitespace and case while still reproducing the exact source substring. A
quote that cannot be bound is marked `unbindable` and is not rendered locally — offsets are never
fabricated and the learner's text is never rewritten to make a quote fit.

**Stable identity.** `observation_id` is a digest of the script hash, task fingerprint, prompt,
schema and model versions, and the observation's own semantics and bound span. Array order is not an
input, so reordering the model output produces identical ids.

## Phase 4 scope — Cambridge assessment

| File | Role |
| --- | --- |
| `prompts/knowledge/doc03-cambridge-descriptors.ts` | Official band anchors per criterion + the twelve calibration profiles |
| `prompts/knowledge/doc03-assessment-rules.ts` | A/C/CA/O/L/X/S/SP/N rulebooks and the forbidden behaviours |
| `prompts/assessment.prompt.ts` | Prompt, Structured Outputs JSON schema and model-output contract |
| `services/assessment/assessment.service.ts` | Evidence index, binding, raw total, independence checks, provenance |

The layer answers: **how should this response be scored under the official B2 First Writing
Assessment Scale?** Four independent whole marks from 0 to 5, each with a band anchor, positive and
limiting evidence, bound quotes, boundary reasoning, confidence and Doc 03 rule provenance.

**The full response is authoritative.** Phase-3 observations arrive as an *evidence index*: every
quote is re-bound here rather than trusted, unbindable observations are dropped, and each
pedagogical field — priority, foundational importance, transferability, learning opportunity,
ambition, strategy, Teacher DNA rule ids — is stripped before the model sees anything. The index is
labelled incomplete by design in the prompt, so pedagogical selectivity cannot become scoring
selectivity. An observation id survives on a decision only as discovery metadata.

**Bands 2 and 4 are mixed profiles.** Both require concrete evidence from *both* neighbours, so
`adjacent_band_evidence` carries a lower and a higher side and neither is optional. Band 4 is never
"band 5 minus one mistake" and band 2 is never a midpoint. At band 5 `band_ceiling_reached` is true
and a fabricated band 6 is rejected; at band 0 `band_floor_reached` is true and `why_not_lower` must
be absent.

**Code owns the total.** `raw_total` is the sum of the four marks. The model's JSON schema has no
total field, and anything it volunteers is stripped at parse time and never read — discarded, not
reconciled. Marks may be highly asymmetric: 5/2/2/2 is an official calibrated profile.

**Criterion independence.** A rationale repeated across two criteria is rejected, because a shared
textual feature must produce a *different construct consequence* in each. `source_rule_ids` must
cite Document 03, and a criterion cannot be justified only by another criterion's rulebook. Teacher
DNA `Rnn` ids are never scoring authority.

**Incomplete, not zero.** `checkTaskContext` has three insufficiency routes: blank task text, no
requirement map, and a target reader Phase 2 could not resolve — without a reader there is no
defensible Communicative Achievement decision, and inventing one to escape the state is what SP03
forbids. The service then returns `status: 'incomplete'` with no criteria, no raw total and no model
call at all. There is no `partial` status and no nullable mark: an unassessable response is never
expressed as 0/20.

**Word count and confidence change nothing.** Length is recorded as context with
`word_count_penalty_applied: false` and routes only through observable criterion consequences.
Confidence is `high | medium | low` (Doc 03 §1.7, one shared `confidenceSchema` for the whole
module) and is an internal safeguard: low confidence never lowers a mark, but it must state its
reason.

**Calibration is open.** `provenance.calibration_status` is `not_calibrated`. The twelve official
profiles are stored as immutable references; reproducing them requires real model runs (Doc 06),
which unit tests deliberately do not claim.

## Phase 5 scope — deterministic validation

`services/validation/deterministic-validators.ts` and `forbidden-heuristics.ts` answer one question:
is this engine output structurally, evidentially and architecturally valid enough to be accepted?
They never rescore, never repair and never generate. There is no model client in either file, so
validation is offline, free and deterministic.

**The result is about the output, not the learner.** `validationResultSchema` carries
`validation_status: 'passed' | 'failed' | 'retry_required'`. The field was deliberately renamed away
from `passed` so an engine verdict can never be read as a student passing, a Cambridge pass or 12/20.

**Failures are classified, not merged.** A `hard_failure` is architecturally invalid and regenerating
would not help; a `retryable_generation_failure` is something a fresh generation could plausibly fix,
so the result becomes `retry_required` with a `retry_target` naming the earliest stage to rerun; a
`non_blocking_warning` (version drift, for example) is recorded and never blocks. The validator does
not retry — it hands the orchestrator a machine-readable rule set and stops.

**Marks are immutable.** Validators are pure reads. A wrong mark, a mismatched `raw_total` or an
invented Band 6 is reported, never corrected. The suite deep-freezes its fixtures and asserts the
input is byte-identical afterwards.

**What is checked.** Task analysis: source task, approved genre, provenance and pinned model,
separation of mandatory/core/recommended, no criterion routing, `automatic_penalty === false`, honest
propagation of an unresolved reader. Observations: no scoring, history, CEFR or colour fields, local
spans that reproduce the source substring, grouping that does not publish counts, strategy
invariants. Assessment: exactly four criteria, integer marks 0–5, a `raw_total` that is the exact
sum, band-boundary contracts including both neighbours for the mixed bands 2 and 4, evidence that
re-binds to the candidate response, Doc-03 rule provenance appropriate to the construct, and
rationales that are not copied between criteria.

**Precision over recall in the heuristic detector.** Every prohibited pattern anchors on the object
being counted or on an explicit causal claim. "The response contains three mandatory task points" is
a task fact and passes; "there are seven errors" is a counting heuristic and fails. `LEGITIMATE_PHRASES`
is the exported false-positive guard the test suite runs against every rule.

Phase 5 strengthens R1 and the machinery R3 needs. It does not close R3.

## Phase 6 scope — feedback composition

`services/feedback/feedback-composer.service.ts` turns a frozen assessment into something a learner
can act on. It answers how the result should be communicated, never what the result should be.

**The model writes prose; the code owns the marks.** The composition schema has no field for a band,
a criterion score or a total, so a model that tries to re-mark has nowhere to put it. `global_result`
is produced by `copyFrozenAssessmentResult`, and a final equality check compares the payload against
the assessment record before it is returned. A hostile fixture that emits its own `raw_total` and
per-criterion marks changes nothing.

**Offsets and categories are copied, not retyped.** An observation becomes a local annotation only if
Phase 3 bound it, marked it renderable, and its domain has an honest UI category. The projection is
deliberately partial: `communicative_appropriacy` and `punctuation` have no category, because a
register problem is a property of the whole text and Doc 04 defines no semantic colour for
punctuation. Those observations stay valid and inform criterion feedback instead. There is no seventh
category and no colour anywhere in the contract.

**Selectivity without quotas.** No minimum or maximum number of annotations, no required category
mix, no fixed number of review topics. Opening strengths follow the evidence: zero eligible strengths
gives zero, one gives one, several give at most three, and praise that points at a negative
observation or an invented id is rejected. The one thing selectivity may not do is drop a locally
renderable meaning-blocking issue.

**Progressive disclosure.** Each criterion carries a `summary` plus an `expanded` layer with what
worked, what limited the band, evidence and where to focus next. Evidence is addressed by index into
the Phase-4 decision record, so the composer cannot invent a quotation. A band 5 discusses
consolidation; "aim for band 6" is rejected by the same forbidden-heuristic detector Phase 5 uses.

**Learner history arrives after the marks are frozen.** `learner-history-enrichment.service.ts`
returns an overlay keyed by observation id rather than mutating anything, and it refuses history that
carries scoring information or that arrives before a complete assessment exists. Without an overlay,
"you always", "you keep", "we worked on this before" and "you have improved since" are all rejected —
repetition inside one script is not a learner history. With a verified overlay, those statements are
permitted only for observations whose entry cites history evidence. History may reorder emphasis; it
can never move a mark.

**Teacher, not machine.** No "as an AI", no Cambridge affiliation, no official-examiner claim, no
rewritten or improved version. The required disclaimer states plainly that this is a DRALO correction
based on the Cambridge criteria and not an official Cambridge result.

R4 (feedback quality) stays **OPEN**: contracts and traceability are testable, "sounds like an expert
teacher" is not. No UI and no production wiring exists yet.

## Phase 7 scope — persistence and provenance

| File | Role |
| --- | --- |
| `services/persistence/writing-engine.repository.ts` | The only database access in the feature: a narrow port, zod validation, no mark arithmetic |
| `scripts/sql/writing_engine_schema.sql` | The eight `writing_*` tables, constraints, indexes, RLS and triggers. **Not applied yet** |
| `scripts/verify-writing-engine-persistence.mjs` | Read-only verification: static against the SQL, optionally against a staging database |

The eight tables are `writing_submissions`, `writing_engine_executions`, `writing_task_analyses`,
`writing_observations`, `writing_assessments`, `writing_assessment_criteria`,
`writing_feedback_payloads` and `writing_validation_results`. No existing table is altered, and the
migration holds no foreign key into `levels_*`: `pregunta_id`, `examen_id` and `parte_numero` are plain
columns, because a historical correction must survive an edit to the exam question.

**A re-evaluation is a new execution.** `UPDATE` raises on all seven artefact tables. The only table
with a lifecycle is `writing_engine_executions`, and its guard permits exactly one transition out of
`running` while rejecting any change to versions, documents, prompts, model or submission. The
repository offers no update method for artefacts, and every `persist*` call refuses an execution that
has already been finalised. `DELETE` stays possible for account erasure but is unreachable from a
client, which holds `SELECT` and nothing else.

**Snapshots, not pointers.** The submitted task wording and the response are copied into
`writing_submissions`, so rendering a year-old correction never depends on the current contents of
`levels_preguntas`, the current prompt or the current model.

**Assessment integrity is deferred, not fragile.** A constraint trigger declared
`DEFERRABLE INITIALLY DEFERRED` checks at `COMMIT` that a `complete` assessment carries exactly the
four canonical criteria and that `raw_total` is their sum. Inserting criteria one at a time is fine;
closing an inconsistent transaction is not. The trigger accepts or rejects and never writes a mark.
`persistAssessment` applies the same rule in code and **rejects** a mismatch rather than repairing it.

**Ownership resolves through the chain.** `writing_submissions` matches `auth.uid()` directly; every
child table resolves child → execution → submission → user, so `user_id` is not copied down the tree.
`writing_task_analyses` has RLS enabled with no policy and no client grant: it is a server cache with
no learner data.

**Provenance is provider-reported.** `token_source` accepts only `provider_reported`, so a
text-length estimate cannot be persisted as usage. `ai_usage_logs` is untouched.

**Drafts stay in `localStorage`.** Only submitted attempts are persisted in v1; there is no draft
table, column or repository method.

R5 (persistence and ownership) stays **OPEN**: RLS behaviour, the deferred trigger, the append-only
triggers and a real write/read bundle are implemented but have not been executed against a database.

## Phase 8 scope — Interactive Writing Map and feedback UX

Files: `ui/annotation-segments.ts`, `ui/annotation-selection.ts`, `ui/annotation-palette.ts`,
`ui/feedback-view-model.ts`, the components in `src/components/writing/v3/`, the additive
`.writing-v3` / `.writing-map__*` block in `src/app/globals.css`, and the internal preview route
`/dralo-dev/writing-v3`.

**The rendering logic is pure and testable.** Segmentation, the one-open-bubble state machine and the
translation from payload to learner-facing view are ordinary modules; the components are thin. That is
what makes the UX rules assertable in a project with no DOM test runner.

**The learner's words are never touched.** The map is built from `annotations[]` offsets, not from
`[[gram|3]]` markup, and concatenating the segments reproduces `candidate_response` exactly. Overlapping
spans become a single segment carrying both observation identities, so shared words are written once.

**Category is not colour.** `annotation-palette.ts` contains no colour value: a category resolves to a
label, a hint, a marker glyph and a CSS class. The colours are provisional and live in CSS, pending R6.

**Fixtures, not production.** `npm run writing:fixtures` regenerates the four validated fixtures through
the real Phase-2/3/6 pipeline with deterministic clients; `npm run writing:screenshots` captures the R6
review set into `docs/writing-v3/screenshots/` against a running dev server. No real submission, model
call or database read exists on this path, and the preview route does not render in production.

R6 (feedback UX and visual compatibility) stays **OPEN** pending the screenshot, palette and
accessibility review.

## Layer boundaries

```
task_analysis     → machine-readable task requirements (Doc 01)
observations      → evidence-bearing pedagogical objects (Doc 02) — not marks
assessment_record → four whole-band marks + decision records (Doc 03)
feedback_payload  → learner-facing composition (Doc 04)
```

**Scoring independence.** `assessment_record` has no learner-history fields. Learner context may
enrich feedback composition in Phase 6 only; it must never enter assessment prompts or marks.

**No legacy leakage in v3 contracts.** No `passed`, `required`, `readiness`, or `cefr` fields.
`level_indicator` is always `null` in v1. `single_task_scale_claim_allowed` is always `false`.

**Progression quarantine.** The 12/20 threshold for stars/gating is `legacy_product_progression_rule`
(§0.3.1 in Doc 07) — computed outside the engine from `raw_total`, never shown in feedback UI.

## What must never enter a scoring prompt

- Learner history, effort, course stage, personality
- Error counts, connector counts, paragraph counts
- Word-count penalties
- Cross-criterion compensation or score smoothing
- Single-task CEFR or Cambridge Scale claims
- Pass/fail or 12/20 progression thresholds

## Runtime

- Chat Completions with a pinned dated model snapshot + JSON schema. An unpinned model id is
  rejected; there is no implicit client and no silent network fallback.
- Does **not** use `cambridgeChatCompletion` or the legacy OpenAI Assistant.
- Task Analysis costs 1 call per unique task (2 only when the genre needs last-resort model
  inference), then 0 once the cache exists in Phase 7.

## Tests

```bash
npm run test:writing-engine
node scripts/verify-writing-engine-persistence.mjs
npm run writing:fixtures      # regenera las fixtures v3 de la interfaz
npm run writing:screenshots   # capturas para la revisión R6 (necesita npm run dev)
```

The verification script is read-only. Its database branch only runs when
`WRITING_ENGINE_VERIFY_DATABASE_URL` points at an environment where the migration has been applied —
never production.
