# Baseline 1 — Quote-binding forensics

Generated: 2026-08-12T09:35:43.429Z

## Verdict

**Not 12 separate bad paraphrases.** Every recorded failing quote is an exact substring of the current golden `candidate_response` and `bindQuote(..., 0)` succeeds offline. Baseline still reported “not present”. Dominant shared cause: binding/diagnostic collapse around `occurrence_index` (likely off-by-one) plus missing raw payload capture.

## Failure table

| Case | Crit | Exact? | occ0 | occ1 | Category | Model quote (truncated) |
| --- | --- | --- | --- | --- | --- | --- |
| G-01 | content | true | bound | occurrence_out_of_range:n=1 | C | First of all a huge damage to the environment brings a transport… |
| G-02 | content | true | bound | occurrence_out_of_range:n=1 | C | We have big problems with transport because there are too much c… |
| G-03 | content | true | bound | occurrence_out_of_range:n=1 | C | Investing on electrical transport would benefit the environment … |
| G-04 | content | true | bound | occurrence_out_of_range:n=1 | C | the prince rejected it and decided to leave the palace instead.… |
| G-05 | content | true | bound | occurrence_out_of_range:n=1 | C | The most useful thing i have learned is surely speaking English.… |
| G-06 | content | true | bound | occurrence_out_of_range:n=1 | C | My area includes also beautiful Baltic Sea which many tourist vi… |
| G-07 | content | true | bound | occurrence_out_of_range:n=1 | C | the appearance of the person is more important than the person i… |
| G-08 | content | true | bound | occurrence_out_of_range:n=1 | C | We shouldn’t judge people for its appearance, because that is no… |
| G-09 | content | true | bound | occurrence_out_of_range:n=1 | C | people place too much importance on appearance and the material,… |
| G-10 | content | true | bound | occurrence_out_of_range:n=1 | C | The majority of the people claimed that the best thing were comp… |
| G-11 | content | true | bound | occurrence_out_of_range:n=1 | C | When the bus is taking me to school I listen to the music so I c… |
| G-12 | content | true | bound | occurrence_out_of_range:n=1 | C | The most interesting thing that I learned was how to prepare a t… |

## Aggregate

- Recorded failed evidence refs: **12** (lower bound)
- By category: A=0 B=0 C=12 D=0 E=0
- By criterion (recorded): content 12/12 (assembly stops at first content failure)
- Assessments that would pass if binding fixed: **UNKNOWN** (later evidence never evaluated)

## Scoring matrix (unchanged raw Baseline 1 marks)

| Case | C e/a/Δ | CA e/a/Δ | O e/a/Δ | L e/a/Δ | Total e/a/Δ |
| --- | --- | --- | --- | --- | --- |
| G-01 | 4/4/+0 | 3/3/+0 | 3/3/+0 | 3/3/+0 | 13/13/+0 |
| G-02 | 3/3/+0 | 3/2/-1 | 3/2/-1 | 3/2/-1 | 12/9/-3 |
| G-03 | 5/5/+0 | 5/4/-1 | 4/4/+0 | 5/4/-1 | 19/17/-2 |
| G-04 | 5/5/+0 | 3/4/+1 | 3/3/+0 | 3/3/+0 | 14/15/+1 |
| G-05 | 5/5/+0 | 3/3/+0 | 3/3/+0 | 3/2/-1 | 14/13/-1 |
| G-06 | 5/5/+0 | 3/3/+0 | 4/3/-1 | 3/2/-1 | 15/13/-2 |
| G-07 | 5/3/-2 | 2/3/+1 | 2/2/+0 | 2/2/+0 | 11/10/-1 |
| G-08 | 5/4/-1 | 3/3/+0 | 4/3/-1 | 3/3/+0 | 15/13/-2 |
| G-09 | 5/4/-1 | 5/3/-2 | 5/3/-2 | 5/3/-2 | 20/13/-7 |
| G-10 | 5/5/+0 | 4/4/+0 | 4/4/+0 | 3/3/+0 | 16/16/+0 |
| G-11 | 4/3/-1 | 3/3/+0 | 2/2/+0 | 2/2/+0 | 11/10/-1 |
| G-12 | 5/4/-1 | 3/3/+0 | 4/3/-1 | 3/2/-1 | 15/12/-3 |

## Delta distribution

- Exact marks: **27/48**
- ±1 marks: **44/48**
- >1 deviations: **4/48**

- **content**: exact 7/12 · MAD 0.5 · mean signed -0.5 · under 5 · over 0
- **communicative_achievement**: exact 7/12 · MAD 0.5 · mean signed -0.167 · under 3 · over 2
- **organisation**: exact 7/12 · MAD 0.5 · mean signed -0.5 · under 5 · over 0
- **language**: exact 6/12 · MAD 0.583 · mean signed -0.583 · under 6 · over 0

## Recommended next action (NOT applied)

- Do NOT tune assessment.prompt.ts for scores.
- Smallest deterministic engineering fix to propose: (1) persist raw assessment lastPayload + binding.reason on failure; (2) make AssessmentValidationError distinguish quote_not_found vs occurrence_out_of_range and include occurrence_index + occurrences_found; (3) only after confirming occ off-by-one from saved payloads, decide whether to add a narrow retry hint or keep failing with a clear message — do not silently remap indices without evidence.

R3 remains OPEN. No prompts, marks, or model config were changed. No new OpenAI calls.