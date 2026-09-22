# RUOE naturalness-first v2 — local pilot comparison

Run: `scripts/run-ruoe-naturalness-first-v2-pilot.mjs`  
Model: `gpt-4o-mini`  
When: 22 September 2026  
Result: 16/16 files written, process exit 0, about 218 seconds  
Folder: `local-pilots/ruoe-naturalness-first-v2/`

Nothing from this run was saved as a production exam. Supabase was not read or written. The v1 arm used `resolveDefaultExamPartGenerationPrompt` (the code prompt), not `levels_exam_part_prompt_overrides`. That code prompt is newer than the live Part 1 override row from 31 August 2026.

Each brief was generated twice: v2 through `runNaturalnessFirstGeneration`, and v1 through one code-prompt JSON call.

| ID | Direction | Preferred family |
| --- | --- | --- |
| P1-A | How a town library stayed open after its main grant was cut | — |
| P1-B | Why some coastal paths are closed after winter storms | — |
| P2-A | The volunteer who catalogues old photographs for a local museum | — |
| P2-B | A bakery that delivers bread by bicycle before dawn | — |
| P3-A | Restoring a Victorian bandstand in a public park | — |
| P3-B | Learning to keep bees on a city rooftop | — |
| P4-A | Everyday misunderstandings about household recycling | TF-02 |
| P4-B | Arriving late for a community meeting | TF-05 |

## Verdicts

| ID | v2 verdict | v2 trace | v1 shape |
| --- | --- | --- | --- |
| P1-A | QUALITY_FAIL | passage → positions → keys → distractors → substitution → repair-distractor → repair-sentence | 202 words, 8 MCQ |
| P1-B | HARD_FAIL | same repair trace as P1-A | 196 words, 8 MCQ |
| P2-A | PASS | prose → gap-discovery → select-eight → uniqueness | 157 words, 8 short questions |
| P2-B | PASS | same order as P2-A | 187 words, 8 short questions |
| P3-A | QUALITY_FAIL | prose → family-discovery → base-assignment → derivation-check → new-position | 187 words, 8 word-formation stems |
| P3-B | HARD_FAIL | same order as P3-A | 175 words, 8 word-formation stems |
| P4-A | HARD_FAIL | family → pair → semantic → naturalness → replace-family → semantic → naturalness | 6 transformations |
| P4-B | HARD_FAIL | same order as P4-A | 6 transformations |

v1 produced a complete part object every time (`partTitle`, `directions`, `passage` or questions, `questions`, `modelAnswers`). v2 produced a staged trace plus an adversarial verdict. v2 passages for Parts 1–3 were inside 150–180 words (156–169). Two v1 passages were outside that band (P1-A 202, P1-B 196). P2-B v1 was 187.

## Part 1

v2 wrote the article first, then chose words from it. P1-A substitution judged eight items in sentences taken from the library article, not from a canned example.

P1-A keys: vital, available, operations, initiatives, contributed, offering, preserve, importance. All eight were labelled lexical meaning. Variety failed: one knowledge type, and that type exceeded three items.

Independent substitution on P1-A, survivors by item: 1 ABCD, 2 AB, 3 A, 4 ABCD, 5 A, 6 AB, 7 ABCD, 8 ABCD. Item 1 is `vital` versus `essential` in “remained a vital/essential resource”. Both were marked grammatical, natural, semantically defensible, collocational, and contextual. The verdict is `QUALITY_FAIL`. “More idiomatic” was not used to keep the item. Distractor repair and sentence repair both ran. The set still failed.

P1-B keys: vital, debris, hazards, assess, ensure, impacting, essential, updates. Variety failed (two types, seven of them lexical meaning). Substitution for item 1 returned `options` as one object instead of four records, so the judge returned `HARD_FAIL` for missing A–D. That is fail-closed behaviour.

v1 P1-A options include assist / sustain / maintain / support and sparked / ignited / fueled / enhanced. Those sets are the same class of near-synonym problem. v1 does not run the four-way substitution, so it would have stored them.

## Part 2

Both v2 articles exist before the gaps. P2-A (166 words) selected eight function words: a, a, that, each, the, their, the, the (articles, a relative word, a determiner, a pronoun). P2-B (169 words) selected six: a, the, a, their, the, the. The code did not reject the short set.

Uniqueness returned an empty alternative list for every gap, so each gap was `PASS` (“Only ‘a’ is defensible”, and the same for the, that, each, their). That pass means the same model claimed no rival. It does not mean a second solver tried `the` against `a`. Several of these articles and determiners are the kind of site the contract says to reject when a second word also fits.

v1 returned eight short-answer slots (numbers 9–16) inside one JSON object, which is the current one-shot shape.

## Part 3

v2 prose came first (P3-A 156 words, P3-B 168 words). Derivation was judged after that.

P3-A original pairs included restore → restoration, preserve → preservation, instrumental → instrument, retain → retention, community → communal, heritage → hereditary. `new-position` ran. The set still failed because rival family members were listed (for example restorer and restorative beside restoration). One pair, instrumental → instrument, passed the direct-derivation check. Overall `QUALITY_FAIL`.

P3-B included beekeep → beekeeping (passed the prefix check), hobby → hobby, local → local, and reward → reward (`HARD_FAIL`, stem equals answer), plus invest → investing and connect → connecting (`QUALITY_FAIL`). Overall `HARD_FAIL`. `DECIDE → decision-making` did not appear in this pilot; that case is covered by the unit test, which fails it.

v1 returned eight base-word stems in one call (P3-A started EXPENSE, SIGNIFY; P3-B started SATISFY, CONTRIBUTE) with no separate derivation stage.

## Part 4

The family was a plan, then sentences were written, then semantic and naturalness checks ran. Both first answers were one word, so the verdict is `HARD_FAIL` before any semantic pass could override it.

P4-A family TF-02, keyword recycling. Sentence 1: “The community is really focused on recycling.” Sentence 2: “There is a strong emphasis on recycling in the community.” Answer: recycling (1 word). The semantic object also marked agency as not preserved and information as added. The reported reason is the word count, which is the mechanical `HARD_FAIL`.

Replacement came back nested (`family` + `pair`) rather than as a flat answer. The inner answer was “confusion about recycling” with keyword misunderstandings, so the keyword is not in the answer. The re-judge read the wrapper, saw no top-level answer, and stayed on `HARD_FAIL`. The saved answer key for this arm is empty.

P4-B family TF-05, keyword late. “They arrived late to the party.” / “They got to the party late.” Answer: late (1 word). The replacement inner answer was still the one word delayed. Same `HARD_FAIL`.

v1 returned six keyword transformations with sentence 1, keyword, sentence start, and answer. P4-A included KNOW → “did not know”. P4-B included BEEN → “not been arriving”, which is the kind of forced pair the v2 semantic pass is meant to reject. v2 did not accept it, because the v2 model never produced a 2–5 word answer that survived the keyword check.

## How to read the passes

P2-A and P2-B are the only v2 passes. They show the required order (prose, then gaps) and they selected function words from the article. They do not show that each gap has a single defensible answer. The uniqueness lists were empty.

Parts 1, 3, and 4 failed in the direction the contract asks for: more than one natural Part 1 option, rival word-family members, identical stems, and Part 4 answers that are not 2–5 words. Those failures are saved with the adversarial object and the repair trace. They were not inserted into production.
