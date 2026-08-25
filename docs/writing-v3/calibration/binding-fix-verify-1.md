# Writing v3 Calibration — binding-fix-verify-1

Generated: 2026-08-12T09:56:23.798Z

## Baseline model / config

- Engine: 3.0.0
- Model: gpt-4o-2024-08-06
- Temperature: 0
- Response format: json_schema

## Status: partial

## Diagnostic run

- Cases: G-01, G-09
- This is **not** Baseline 2 and must not overwrite Baseline 1.

## Expected vs actual matrix

| Case | Exp C | Act C | Exp CA | Act CA | Exp O | Act O | Exp L | Act L | Exp /20 | Act /20 | Profile | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G-01 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 2 | 13 | 10 | no | failed |
| G-09 | 5 | 4 | 5 | 3 | 5 | 3 | 5 | 3 | 20 | 13 | no | failed |

## Aggregate

- Exact profiles matched: 0 / 2
- Exact criterion marks matched: 1 / 8
- Content accuracy: 0.0%
- Communicative Achievement accuracy: 50.0%
- Organisation accuracy: 0.0%
- Language accuracy: 0.0%
- Mean abs deviation: C 1.00 · CA 1.00 · O 1.50 · L 1.50
- Same-total wrong-profile cases: none
- Validation failures: 2

## Quote-binding diagnostics

### G-01

Attempt 1: first_failure=none (—)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 1 | 1 | bound | — | First of all a huge damage to the environment brings a transport. |
| content | 2 | 1 | bound | — | In addition to this our rivers and seas are in not less danger situation |
| content | 3 | 1 | bound | — | Apart from this I’m inclined to believe that every person can and must c |
| communicative_achievement | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| communicative_achievement | 1 | 1 | bound | — | Scientists of different countries predict a global ecocatastrophe if peo |
| organisation | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| organisation | 1 | 1 | bound | — | First of all a huge damage to the environment brings a transport. |
| language | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| language | 1 | 1 | bound | — | a huge damage to the environment brings a transport |

Attempt 2: first_failure=none (—)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 1 | 1 | bound | — | First of all a huge damage to the environment brings a transport. |
| content | 2 | 1 | bound | — | In addition to this our rivers and seas are in not less danger situation |
| content | 3 | 1 | bound | — | Apart from this I’m inclined to believe that every person can and must c |
| communicative_achievement | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| communicative_achievement | 1 | 1 | bound | — | Scientists of different countries predict a global ecocatastrophe if peo |
| organisation | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| organisation | 1 | 1 | bound | — | First of all a huge damage to the environment brings a transport. |
| language | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| language | 1 | 1 | bound | — | a huge damage to the environment brings a transport |

Attempt 3: first_failure=none (—)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 1 | 1 | bound | — | First of all a huge damage to the environment brings a transport. |
| content | 2 | 1 | bound | — | In addition to this our rivers and seas are in not less danger situation |
| content | 3 | 1 | bound | — | Apart from this I’m inclined to believe that every person can and must c |
| communicative_achievement | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| communicative_achievement | 1 | 1 | bound | — | Scientists of different countries predict a global ecocatastrophe if peo |
| organisation | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| organisation | 1 | 1 | bound | — | First of all a huge damage to the environment brings a transport. |
| language | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| language | 1 | 1 | bound | — | a huge damage to the environment brings a transport |

### G-09

Attempt 1: first_failure=quote_not_found (organisation)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 3 | 1 | bound | — | people place too much importance on appearance and the material, world,  |
| content | 3 | 1 | bound | — | not only are the costs of fashion item unrealistically high, it is thoug |
| content | 5 | 1 | bound | — | it put into a good use, it can save lives. |
| communicative_achievement | 5 | 1 | bound | — | I do believe that the fashion industry, as it is today, has a harmful ef |
| organisation | 2 | 1 | bound | — | On one hand, the fashion industry is undeniably a source of profit and i |
| organisation | 3 | 0 | failed | quote_not_found | Nevertheless, for those who are neither impressed nor motivated by numbe |
| language | 1 | 1 | bound | — | The society we live today is characterised by technology in constant dev |
| language | 3 | 1 | bound | — | not only are the costs of fashion item unrealistically high, it is thoug |

Attempt 2: first_failure=quote_not_found (organisation)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 3 | 1 | bound | — | It is stated that people place too much importance on appearance and the |
| content | 4 | 1 | bound | — | Moreover, not only are the costs of fashion item unrealistically high, i |
| content | 2 | 1 | bound | — | the fashion industry is undeniably a source of profit and income. It hir |
| communicative_achievement | 5 | 1 | bound | — | I do believe that the fashion industry, as it is today, has a harmful ef |
| communicative_achievement | 5 | 1 | bound | — | it put into a good use, it can save lives. |
| organisation | 2 | 1 | bound | — | On one hand, the fashion industry is undeniably a source of profit and i |
| organisation | 3 | 0 | failed | quote_not_found | Nevertheless, for those who are neither impressed nor motivated by numbe |
| language | 5 | 1 | bound | — | it put into a good use, it can save lives. |
| language | 1 | 5 | bound | — | fashion industry |

Attempt 3: first_failure=none (—)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 3 | 1 | bound | — | It is stated that people place too much importance on appearance and the |
| content | 3 | 1 | bound | — | Moreover, not only are the costs of fashion item unrealistically high, i |
| content | 2 | 1 | bound | — | the fashion industry is undeniably a source of profit and income. It hir |
| communicative_achievement | 0 | 1 | bound | — | The society we live today is characterised by technology in constant dev |
| communicative_achievement | 4 | 1 | bound | — | I do believe that the fashion industry, as it is today, has a harmful ef |
| organisation | 1 | 1 | bound | — | On one hand, the fashion industry is undeniably a source of profit and i |
| organisation | 2 | 1 | bound | — | Nevertheless, for those who are neither impressed nor motivated by numbe |
| language | 0 | 1 | bound | — | The society we live today is characterised by technology in constant dev |
| language | 2 | 1 | bound | — | those who not fit their laws and commands |


## Mismatch forensics

- **G-01 / content**: expected 4, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-01 / organisation**: expected 3, actual 2 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-01 / language**: expected 3, actual 2 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-09 / content**: expected 5, actual 4 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-09 / communicative_achievement**: expected 5, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-09 / organisation**: expected 5, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-09 / language**: expected 5, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —

## Verification findings (post unique-quote fix)

- **Unique-quote index misuse:** RESOLVED on both cases (G-01: 9/9 evidence bound on all 3 attempts; G-09 attempt 3: 9/9 bound).
- **G-09 paraphrase (attempts 1–2):** `quote_not_found` for truncated quote  
  `Nevertheless, for those who are neither impressed nor motivated by numbers and figures, the fashion industry is seen as one which segregates people.`  
  (official text continues with `, isolating those who not fit...`). Matching was not loosened.
- **Newly exposed post-binding blocker:** both cases then fail finalize with  
  `adjacent_band_evidence belongs to the mixed bands 2 and 4 only`  
  (model supplied adjacent evidence for band 3). Not a quote-binding failure.
- Marks above are raw model marks; binding fix does not alter criterion marks.

## R3

**OPEN** — Quote-binding unique-quote contract implemented. Baseline 1 unchanged. No scoring tuning.
