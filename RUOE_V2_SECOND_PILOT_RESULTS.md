# RUOE v2 second local pilot

Command: `node --loader ./scripts/alias-loader.mjs scripts/run-ruoe-v2-validation-hardening-pilot.mjs`

When: 22 September 2026  
Result: 12/12 files written, process exit 0, about 287 seconds  
Folder: `local-pilots/ruoe-v2-validation-hardening/`

Models, read from the environment rather than hardcoded:

| Role | Model |
| --- | --- |
| generator | gpt-4o-mini |
| blind solver | gpt-4o-mini |
| adversary | gpt-4o-mini |

`OPENAI_MODEL` in the environment is `gpt-4o-mini`, so all three roles used it. The calls were still separate: different prompts, and the blind solver did not receive the intended answer. Supabase was not read or written. No task was forced to PASS.

An earlier attempt failed immediately because the API requires the lowercase word `json` in the messages. The stage system line now includes `Return json.` The table below is the run after that fix.

## Verdicts

| ID | Direction | Final verdict | Repairs |
| --- | --- | --- | --- |
| P1-C | Village pool reopened with volunteer lifeguards | HARD_FAIL | 1 schema-repair |
| P1-D | Saturday bus now stops at the hospital | HARD_FAIL | 1 schema-repair |
| P1-E | School orchestra raised money for music stands | HARD_FAIL | 1 schema-repair |
| P2-C | Person who winds the town hall clock | HARD_FAIL | 2 move-gap |
| P2-D | Harbour office posts tide times by hand | HARD_FAIL | 2 move-gap |
| P2-E | Pruning apple trees in a shared orchard | QUALITY_FAIL | 2 move-gap |
| P3-C | Cataloguing old theatre programmes | HARD_FAIL | schema-repair, new-position |
| P3-D | Replacing glass in a Victorian greenhouse | QUALITY_FAIL | new-position |
| P3-E | Teaching adults to read a paper map | QUALITY_FAIL | new-position |
| P4-C | Forgetting a neighbour’s spare key | HARD_FAIL | schema-repair, replace-family |
| P4-D | Parcel that arrived a day early | HARD_FAIL | schema-repair, replace-family |
| P4-E | Choosing the quieter train | HARD_FAIL | schema-repair, replace-family |

Pass count: 0. Fail count: 12. That is the expected outcome when the rejection is correct. Repair total: 18 recorded steps. None of them flipped a fail into a pass.

## What the harness caught

Part 1 reached substitution, then the model returned an empty `items` array. One schema repair did not fix it. Verdict `HARD_FAIL`. The four-option check was not skipped and the missing judgements were not filled in. Blind solve and the adversary did not run, because the stage failed before an item existed.

Part 2 wrote prose first (about 161–171 words). P2-C numbered gaps 1–8 instead of 9–16. Two reselections from the same prose still missed 9–16, so the verdict stayed `HARD_FAIL`. P2-D returned 7 gaps after the retries: `HARD_FAIL`. P2-E did return gaps 9–16, then failed uniqueness because the alternative search was not shown. Empty `plausibleAlternatives` was not treated as proof.

Part 3 wrote prose first. P3-C included a stem identical to its answer (`HARD_FAIL`). The other Part 3 items were ordinary-looking pairs (`maintain → maintenance`, `navigate → navigation`) that are not on the confirmed family list, so they stayed `QUALITY_FAIL` rather than passing on spelling. `new-position` did not force a pass.

Part 4 answers were single words (`forgetting`, `that`, `quieter`). After one schema repair, semantic or naturalness JSON was still not a full boolean record. The judge did not treat the missing flags as true, and did not pass an empty normalised answer. `replace-family` ran and the items stayed `HARD_FAIL`.

On P2-C the blind solver returned PASS while the mechanical layer was `HARD_FAIL`. The combined verdict stayed `HARD_FAIL`. On P4-D the blind solver matched the stored one-word answer; the mechanical layer still failed the item.

## Success criteria

| Criterion | This run |
| --- | --- |
| Malformed output rejected | Yes. Empty Part 1 items and incomplete Part 4 booleans are HARD_FAIL. |
| Part 1 ambiguity detected | Not reached. The substitution payload was empty, so there was no four-way judgement to score. |
| Part 2 always enforces 8 gaps | Yes. 7 gaps and wrong numbering failed. |
| Part 2 uniqueness needs positive evidence | Yes. P2-E failed on a silent empty list. |
| Part 3 rejects invalid derivations | Yes. Identical stem failed. Unlisted pairs were not passed. |
| Part 4 repair output normalised | Yes. Missing or non-boolean semantic data did not become a pass. |
| Semantic fail cannot override mechanics | Yes. Incomplete semantic JSON cannot confirm the item. |
| Failed items stay failed | Yes. 0 of 12 were forced through. |

## Recommendation

Do not send this set to teachers. The validator is now doing the job Phase 3 lacked: bad shapes and silent uniqueness claims fail closed. The generator still does not produce a reviewable Part 1, a correctly numbered Part 2, a confirmed Part 3 family, or a 2–5 word Part 4 answer. The next useful step is a stronger generator model and a wider confirmed family list, still on this local path, still without a production switch.
