# RUOE v2 fourth local pilot results

Purpose: pipeline reliability, not final linguistic quality.

Command:

```text
node --loader ./scripts/alias-loader.mjs scripts/run-ruoe-v2-pipeline-reliability-pilot.mjs
```

Result: 12/12 artefacts saved, exit code 0, approximately 270 seconds.

All three roles used `gpt-4o-mini`. The runner contained a guard that would have aborted before any call if generator, blind solver, or adversary had resolved to another model.

Supabase was not accessed. No production exam or prompt override was changed.

## Totals

- PASS: 0
- PIPELINE_FAIL: 10
- HARD_FAIL: 0 final verdicts
- QUALITY_FAIL: 2
- Repairs recorded: 17
- Prompt tokens: 67,848
- Completion tokens: 22,564
- Total tokens: 90,412

A component can have an objective hard failure and still receive final `PIPELINE_FAIL` when another required layer is malformed. P2-G is an example: its two-gap selection is an objective hard failure, while its blind-solver output is malformed. The final result is `PIPELINE_FAIL` because a required layer could not be interpreted.

## Task results

| ID | Direction | Final verdict | Repairs | Tokens |
| --- | --- | --- | ---: | ---: |
| P1-F | Village-hall noticeboard | PIPELINE_FAIL | 1 | 10,472 |
| P1-G | Relaxed Sunday cinema screenings | PIPELINE_FAIL | 1 | 9,639 |
| P1-H | Repair café | PIPELINE_FAIL | 1 | 8,783 |
| P2-F | Volunteer checking nesting boxes | QUALITY_FAIL | 1 | 12,518 |
| P2-G | Cargo-bicycle bookshop | PIPELINE_FAIL | 1 | 10,298 |
| P2-H | Identifying trees in winter | PIPELINE_FAIL | 2 | 13,382 |
| P3-F | Restoring railway signs | QUALITY_FAIL | 2 | 6,601 |
| P3-G | Organising donated tools | PIPELINE_FAIL | 1 | 2,616 |
| P3-H | Recording fishing memories | PIPELINE_FAIL | 1 | 2,801 |
| P4-F | Missing the last bus | PIPELINE_FAIL | 2 | 4,403 |
| P4-G | Borrowing a neighbour’s ladder | PIPELINE_FAIL | 2 | 4,372 |
| P4-H | Cheaper advance ticket | PIPELINE_FAIL | 2 | 4,527 |

## Part 1

All three tasks completed passage, position, key, and distractor stages. Code then constructed the completed A–D sentences before calling the judge.

- P1-F: judge records did not contain exactly four options for each item.
- P1-G: options were returned as strings and in the wrong count.
- P1-H: the judge returned an empty item array.

Each used one structural schema repair. Each remained malformed and became `PIPELINE_FAIL`. None was mislabeled as ambiguous or unnatural English. Blind and adversarial layers did not run because no complete item existed.

## Part 2

All three tasks wrote the article first.

- P2-F used the bounded second discovery pass, returned eight gaps numbered 9–16, and produced positive uniqueness records. Mechanical self-checks passed. The blind solver returned source prose rather than a gap answer, while the independent adversary rejected the item linguistically. Final: `QUALITY_FAIL`.
- P2-G used the second discovery pass but returned only two selected gaps. That is an objective hard mechanics failure. Its blind output was also malformed, so final classification is `PIPELINE_FAIL`.
- P2-H returned eight gaps, but the uniqueness records did not show the required alternative search. The blind output was malformed. Final: `PIPELINE_FAIL`.

The pilot confirms that eight gaps and positive evidence are separate requirements.

## Part 3

- P3-F returned complete lexical-family objects after one schema repair. The derivation stage identified rival family members, and the adversary rejected the context. Final: `QUALITY_FAIL`.
- P3-G and P3-H returned `legitimateBase` as a string rather than a boolean. One structural repair did not correct the type. Final: `PIPELINE_FAIL`.

The small reference family list did not act as a hard whitelist. Unlisted pairs were eligible for validation through the structured lexical-family object. Malformed evidence was not converted into a linguistic failure.

## Part 4

All three tasks reached sentence-pair, semantic, naturalness, family replacement, and second semantic/naturalness calls. Canonical items and completed second sentences were saved.

The semantic or naturalness records remained incomplete after the one structural repair. All three therefore ended as `PIPELINE_FAIL`.

Blind or adversarial agreement did not override malformed semantic validation. P4-F and P4-G received blind and adversarial passes, but still failed the pipeline. P4-H also had blind/adversarial quality disagreement.

The generated transformations included one-word answers. A validly shaped one-word answer would still be `HARD_FAIL` under the unchanged 2–5 word rule.

## Success criteria

- Schema failures correctly identified: yes.
- Validators receive complete data or stop with `PIPELINE_FAIL`: yes.
- Malformed JSON is not confused with bad English: yes.
- Part 1 checks four code-completed options: yes; the model judgement shape then failed.
- Part 2 enforces eight gaps: yes; P2-G did not pass with two.
- Part 2 requires positive uniqueness evidence: yes.
- Part 3 no longer relies on spelling or a small hard whitelist: yes.
- Part 4 semantic validation receives completed S2: yes.
- Failed items are not forced through: yes.

The pipeline is diagnostically more reliable but still not ready for a higher-cost quality pilot, teacher review, or production activation.
