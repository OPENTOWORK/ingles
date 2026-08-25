# Part 4 Metadata Normalization — Report v1.1.2

**Date:** 17 August 2026  
**Status:** Implemented · tests green · failed outputs normalized · new E02 Part 4 dry-run PASS · **no Supabase** · **no production**

---

## 1. Slot mapping audit (E02 blueprint vs failed output)

### Expected blueprint mapping (TBP-PILOT-EX02)

| Slot | Keyword | Family |
|------|---------|--------|
| Q25 | WISH | TF-03 |
| Q26 | EXPECTED | TF-04 |
| Q27 | NEED | TF-06 |
| Q28 | SINCE | TF-07 |
| Q29 | MIND | TF-10 |
| Q30 | FEW | TF-13 |

### Finding: **no Q29/SINCE slot drift**

The retry log referenced **Q29** with `target_structure` / alternative-route errors. Inspection of `TBP-PILOT-EX02_Part4.json` confirms:

- **Q28** = SINCE (`since he left school`)
- **Q29** = MIND (`made up her mind`)
- **Q30** = FEW (`very few`)

Keywords and slot numbers match the approved blueprint. The Q29 failures were **metadata validation bugs** (slash-route `make up one's mind / decision equivalence` token-matching), not slot reassignment.

---

## 2. Root cause

1. **Pedagogical MP labels treated as answer-shaped metadata** — labels like `modal perfect structure with need` triggered HARD when tokens `modal` / `perfect` were not literal substrings of `need not have called`.
2. **Slash `target_structure` routes token-matched against answer** — Q29 `make up one's mind / decision equivalence` failed because meta-words (`make`, `up`, `mind`) were stripped and `decision` did not appear in the answer.
3. **FEW route equivalence in metadata** — blueprint descriptor `very few / hardly any equivalence` was kept on items whose canonical answer used only `very few`, causing HARD `hardly any` mismatch.
4. **Contraction `fullAnswers` without MP re-sync** — adding `needn't have called` to `fullAnswers` without re-partitioning MPs caused mechanical grader failure (1/2).

**Not root cause:** content quality, transformation distance, or slot/family allocation drift.

---

## 3. Validator changes (`ruoePart4Quality.js`)

- Removed token-substring HARD checks on pedagogical MP labels (`modal perfect`, etc.).
- **MP HARD only when label contradicts canonical route** (e.g. `hardly any` label + `very few` answer).
- **Slash `target_structure`:** semantic route compatibility (very few ↔ very few, mind ↔ made up her mind, since ↔ since clause) instead of literal token overlap on meta-words.
- **Quantifier HARD:** `hardly any` in `target_structure` only fails when answer uses the alternative route (`very few`).
- Added **`P4-SLOT-KEYWORD-MISMATCH`** via `validatePart4SlotKeywordAssignment()` when blueprint slots are supplied.

---

## 4. Normalization (`ruoePart4MetadataNormalization.js`)

**`normalizePart4MetadataFromCanonicalAnswer(gen, blueprintSlots)`**

Canonical-first order (immutable: S1, S2, keyword, answer):

1. Infer single-route `target_structure` from canonical answer + keyword.
2. Sync `fullAnswers` (+ contraction variants when applicable).
3. Set pedagogical MP labels aligned to partition (not token-identical).
4. After normalization, **re-run marking-point repair** so contraction variants partition 2/2.

Integrated in `repairPart4MarkingPoints({ normalizeMetadata: true, blueprintSlots })` and Part 4 pilot pipeline.

---

## 5. Tests

New: `scripts/test-ruoe-part4-metadata-normalization.mjs` (10 cases)

Updated: `scripts/test-ruoe-part4-quality-upgrade.mjs` (MP mismatch fixture)

`npm test` — full suite including new metadata tests.

---

## 6. Result on previous failed outputs

Script: `scripts/apply-e02-part4-metadata-normalization.mjs`

On last retry `TBP-PILOT-EX02_Part4.json` **without regenerating content:**

| Metric | Before | After normalization |
|--------|--------|---------------------|
| Mechanical | FAIL | **PASS** |
| HARD | 3 | **0** |
| QUALITY | 14 | 6 (preserved) |

Preview: `TBP-PILOT-EX02_Part4.json.normalized-preview.json`

---

## 7. New E02 Part 4 dry-run

Script: `scripts/dry-run-e02-part4-metadata.mjs`

| Metric | Result |
|--------|--------|
| Mechanical | **PASS** |
| HARD | **0** |
| QUALITY | 6 (preserved) |

Output written: `05_OUTPUTS_REGENERATED_v1_1_2/EXAM-02/TBP-PILOT-EX02_Part4.json`

**Global pilot status:** 14/14 mechanical PASS (reports rebuilt).

Other 13 parts unchanged.

---

## 8. Safety

- **Supabase sync:** NOT performed  
- **Production publish:** NOT performed  
- **Pedagogical approval:** PENDING_HUMAN_REVIEW  
- **Scale to 20 exams:** NOT performed  

---

## 9. Files touched

| File | Change |
|------|--------|
| `src/lib/ruoePart4MetadataNormalization.js` | **New** — normalization + slot keyword guard |
| `src/lib/ruoePart4Quality.js` | Pedagogical label / route compatibility fixes |
| `src/lib/ruoePart4MarkingPointRepair.js` | Post-normalization MP re-sync |
| `src/lib/ruoePilotRegeneration.js` | Blueprint slots + normalization in pipeline |
| `scripts/test-ruoe-part4-metadata-normalization.mjs` | **New** |
| `scripts/apply-e02-part4-metadata-normalization.mjs` | **New** |
| `scripts/dry-run-e02-part4-metadata.mjs` | **New** |
| `FULL_PILOT_REGENERATION_REPORT_v1_1_2.md` | Updated — 14/14 PASS |
| `PILOT_REGENERATION_COMPARISON_COMPLETE_v1_1_2.md` | Updated |
