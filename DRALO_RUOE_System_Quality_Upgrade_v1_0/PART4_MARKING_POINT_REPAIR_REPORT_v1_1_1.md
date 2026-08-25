# Part 4 Marking-Point Local Repair — Report v1.1.1

**Date:** 17 August 2026  
**Status:** Implemented · tests green · dry-runs PASS · **no Supabase** · **no production** · **no pilot regeneration**

---

## 1. Problem

AI Part 4 dry-runs reached B2 content quality but occasionally failed **mechanical HARD** validation because `grading_metadata.markingPoints` did not **partition** the canonical answer exactly (MP1 + MP2 ≠ full answer, external label tokens, or contraction misalignment).

Pedagogically valid items were rejected before quality review.

---

## 2. Solution

New module: `src/lib/ruoePart4MarkingPointRepair.js`

| Function | Role |
|----------|------|
| `isPart4MarkingPartitionValid()` | Canonical answer grades 2/2 via marking points (no fullAnswer short-circuit) |
| `findBestPart4MarkingPartition()` | Search token splits; align contraction variants via identical MP2 tails |
| `collectMarkingPointAcceptedVariants()` | Build MP accepted lists across all `fullAnswers` |
| `repairPart4ItemMarkingPoints()` | Repair one item without changing S1/S2/keyword/canonical answer |
| `repairPart4MarkingPoints()` | Repair full Part 4 generation object |
| `regeneratePart4Item()` / `repairPart4WithRegeneration()` | Item-level OpenAI regen when no valid partition exists |

**Repair constraints (enforced):**
- Does not modify `sentence1`, `sentence2Start`, `keyword`, or `answer`
- MPs must be contiguous substrings of each relevant `fullAnswer` variant
- No external/gap-outside words in accepted variants
- Contraction pairs supported (`do not need` / `don't need` on MP1, shared MP2 `to use`)
- If no partition works → `hardFail: true` → item eligible for single-item regeneration

**Not changed:** Blueprint Engine, `ruoePart4Quality.js` rules, Transformation Families, Parts 1–3/5–7.

---

## 3. Files

| File | Change |
|------|--------|
| `src/lib/ruoePart4MarkingPointRepair.js` | **New** — repair engine |
| `scripts/test-ruoe-part4-marking-point-repair.mjs` | **New** — regression tests |
| `scripts/dry-run-b2-part4-prompt.mjs` | Auto-repair after each generation attempt |
| `package.json` | Added test to `npm test` |

---

## 4. Regression tests

`npm test` → **296 tests, 0 failures**

| Case | Result |
|------|--------|
| Invalid MP split (`she` \| `had visited`) | Repaired → `had she` \| `visited` |
| External MP words (`negative need structure`) | Repaired → `do not need` / `don't need` \| `to use` |
| MP1 + MP2 ≠ canonical | Repaired → `looking forward` \| `to hearing` |
| Already valid MPs | Unchanged |
| Impossible partition (1-token answer) | `hardFail` |
| Part-level repair (6 items) | Mechanical marking PASS |

---

## 5. Dry-runs (OpenAI, no Supabase)

Script: `scripts/dry-run-b2-part4-prompt.mjs`

| Run | Attempts | Mechanical | Repairs applied | Quality findings (preserved) |
|-----|----------|------------|-----------------|-------------------------------|
| `b2-part4-dry-run-2026-08-17T10-08-18-712Z.json` | **1** | ✅ PASS | Q28: `did not` \| `enjoy` | Q25 alternative-route; Q28 missing contraction pair |
| `b2-part4-dry-run-2026-08-17T10-08-48-299Z.json` | **1** | ✅ PASS | Q29: regen + `had` \| `taken` | Q25 alternative-route; Q29 too easy / low distance |

**Exit criteria met (both runs):**
- 6 scored items Q25–30
- Mechanical validator `ok: true`
- No metadata HARD fails
- All marking points grade 2/2
- Predominance B2-Standard / B2-Strong (5–6/6 per run)
- Transformation distance: syntactic restructuring on majority of items
- QUALITY findings preserved for human review (not blocking `ok`)

**Before repair (v1.1):** 8 attempts often ended with marking-partition HARD failures on Q28/Q30 despite good content.

---

## 6. Confirmations

| Constraint | Status |
|------------|--------|
| No Supabase write/sync | ✅ |
| No production writes | ✅ |
| No pilot regeneration | ✅ |
| Blueprint / quality rules unchanged | ✅ |

---

## 7. Next step

Proceed to full pilot regeneration (Exam 1 + Exam 2, Parts 1–7) with marking-point repair wired in the generation pipeline.
