# Writing v3 Calibration — binding-diagnostic-1

Generated: 2026-08-12T09:47:25.156Z

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

Attempt 1: first_failure=occurrence_out_of_range (content)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 1 | 1 | failed | occurrence_out_of_range | First of all a huge damage to the environment brings a transport. |
| content | 2 | 1 | failed | occurrence_out_of_range | In addition to this our rivers and seas are in not less danger situation |
| content | 3 | 1 | failed | occurrence_out_of_range | Apart from this I’m inclined to believe that every person can and must c |
| communicative_achievement | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| communicative_achievement | 4 | 1 | failed | occurrence_out_of_range | I’m inclined to believe that every person can and must contribute to sol |
| organisation | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| organisation | 1 | 1 | failed | occurrence_out_of_range | First of all a huge damage to the environment brings a transport. |
| organisation | 2 | 1 | failed | occurrence_out_of_range | In addition to this our rivers and seas are in not less danger situation |
| organisation | 3 | 1 | failed | occurrence_out_of_range | Apart from this I’m inclined to believe that every person can and must c |
| language | 0 | 1 | bound | — | pollution and damage to the environment is the most serious |
| language | 1 | 1 | failed | occurrence_out_of_range | if people won’t change their attitude |
| language | 2 | 1 | failed | occurrence_out_of_range | a huge damage to the environment brings a transport |
| language | 3 | 1 | failed | occurrence_out_of_range | one of disadvantage of these accustomed things is harmful exhaust |
| language | 4 | 1 | failed | occurrence_out_of_range | our rivers and seas are in not less danger situation |
| language | 5 | 1 | failed | occurrence_out_of_range | pour off their waste to ponds |
| language | 6 | 1 | failed | occurrence_out_of_range | Doing a little steps for protection our environment |

Attempt 2: first_failure=occurrence_out_of_range (content)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 1 | 1 | failed | occurrence_out_of_range | First of all a huge damage to the environment brings a transport. |
| content | 2 | 1 | failed | occurrence_out_of_range | In addition to this our rivers and seas are in not less danger situation |
| content | 3 | 1 | failed | occurrence_out_of_range | Apart from this I’m inclined to believe that every person can and must c |
| communicative_achievement | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| communicative_achievement | 3 | 1 | failed | occurrence_out_of_range | Apart from this I’m inclined to believe that every person can and must c |
| organisation | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| organisation | 1 | 1 | failed | occurrence_out_of_range | First of all a huge damage to the environment brings a transport. |
| organisation | 2 | 1 | failed | occurrence_out_of_range | In addition to this our rivers and seas are in not less danger situation |
| organisation | 3 | 1 | failed | occurrence_out_of_range | Apart from this I’m inclined to believe that every person can and must c |
| language | 0 | 1 | bound | — | pollution and damage to the environment is the most serious |
| language | 0 | 1 | bound | — | if people won’t change their attitude |
| language | 1 | 1 | failed | occurrence_out_of_range | a huge damage to the environment brings a transport |
| language | 1 | 1 | failed | occurrence_out_of_range | one of disadvantage of these accustomed things is harmful exhaust |
| language | 2 | 1 | failed | occurrence_out_of_range | our rivers and seas are in not less danger situation |
| language | 2 | 1 | failed | occurrence_out_of_range | pour off their waste to ponds |
| language | 3 | 1 | failed | occurrence_out_of_range | Doing a little steps for protection our environment |

Attempt 3: first_failure=occurrence_out_of_range (content)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 1 | 1 | failed | occurrence_out_of_range | First of all a huge damage to the environment brings a transport. |
| content | 2 | 1 | failed | occurrence_out_of_range | In addition to this our rivers and seas are in not less danger situation |
| content | 3 | 1 | failed | occurrence_out_of_range | Apart from this I’m inclined to believe that every person can and must c |
| communicative_achievement | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| communicative_achievement | 3 | 1 | failed | occurrence_out_of_range | I’m inclined to believe that every person can and must contribute to sol |
| organisation | 0 | 1 | bound | — | To begin with pollution and damage to the environment is the most seriou |
| organisation | 1 | 1 | failed | occurrence_out_of_range | First of all a huge damage to the environment brings a transport. |
| organisation | 2 | 1 | failed | occurrence_out_of_range | In addition to this our rivers and seas are in not less danger situation |
| organisation | 3 | 1 | failed | occurrence_out_of_range | Apart from this I’m inclined to believe that every person can and must c |
| language | 0 | 1 | bound | — | pollution and damage to the environment is the most serious |
| language | 0 | 1 | bound | — | if people won’t change their attitude |
| language | 1 | 1 | failed | occurrence_out_of_range | a huge damage to the environment brings a transport |
| language | 1 | 1 | failed | occurrence_out_of_range | one of disadvantage of these accustomed things is harmful exhaust |
| language | 2 | 1 | failed | occurrence_out_of_range | our rivers and seas are in not less danger situation |
| language | 2 | 1 | failed | occurrence_out_of_range | pour off their waste to ponds |
| language | 3 | 1 | failed | occurrence_out_of_range | Doing a little steps for protection our environment |

### G-09

Attempt 1: first_failure=occurrence_out_of_range (content)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 3 | 1 | failed | occurrence_out_of_range | people place too much importance on appearance and the material, world,  |
| content | 3 | 1 | failed | occurrence_out_of_range | not only are the costs of fashion item unrealistically high, it is thoug |
| content | 2 | 1 | failed | occurrence_out_of_range | the fashion industry is undeniably a source of profit and income. It hir |
| communicative_achievement | 0 | 1 | bound | — | The society we live today is characterised by technology in constant dev |
| communicative_achievement | 4 | 1 | failed | occurrence_out_of_range | I do believe that the fashion industry, as it is today, has a harmful ef |
| organisation | 1 | 1 | failed | occurrence_out_of_range | On one hand, the fashion industry is undeniably a source of profit and i |
| organisation | 2 | 1 | failed | occurrence_out_of_range | Nevertheless, for those who are neither impressed nor motivated by numbe |
| language | 2 | 1 | failed | occurrence_out_of_range | people, isolating those who not fit their laws and commands. |
| language | 1 | 1 | failed | occurrence_out_of_range | fashion industry is undeniably a source of profit and income. |

Attempt 2: first_failure=occurrence_out_of_range (content)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 3 | 1 | failed | occurrence_out_of_range | people place too much importance on appearance and the material, world,  |
| content | 3 | 1 | failed | occurrence_out_of_range | not only are the costs of fashion item unrealistically high, it is thoug |
| content | 4 | 1 | failed | occurrence_out_of_range | the fashion industry, as it is today, has a harmful effect, because it v |
| communicative_achievement | 4 | 0 | failed | quote_not_found | I do believe that the fashion industry, as it is today, has a harmful ef |
| organisation | 2 | 1 | failed | occurrence_out_of_range | On one hand, the fashion industry is undeniably a source of profit and i |
| organisation | 3 | 0 | failed | quote_not_found | Nevertheless, for those who are neither impressed nor motivated by numbe |
| organisation | 3 | 1 | failed | occurrence_out_of_range | Moreover, not only are the costs of fashion item unrealistically high, i |
| language | 1 | 0 | failed | quote_not_found | The society we live today is characterised by technology in constant dev |
| language | 4 | 1 | failed | occurrence_out_of_range | it put into a good use, it can save lives. |

Attempt 3: first_failure=occurrence_out_of_range (content)

| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |
| --- | ---: | ---: | --- | --- | --- |
| content | 5 | 1 | failed | occurrence_out_of_range | people place too much importance on appearance and the material, world,  |
| content | 6 | 1 | failed | occurrence_out_of_range | not only are the costs of fashion item unrealistically high, it is thoug |
| content | 8 | 1 | failed | occurrence_out_of_range | it has such a wide reach that, it put into a good use, it can save lives |
| communicative_achievement | 0 | 1 | bound | — | The society we live today is characterised by technology in constant dev |
| communicative_achievement | 7 | 1 | failed | occurrence_out_of_range | I do believe that the fashion industry, as it is today, has a harmful ef |
| organisation | 1 | 1 | failed | occurrence_out_of_range | On one hand, the fashion industry is undeniably a source of profit and i |
| organisation | 4 | 1 | failed | occurrence_out_of_range | Nevertheless, for those who are neither impressed nor motivated by numbe |
| language | 0 | 1 | bound | — | The society we live today is characterised by technology in constant dev |
| language | 4 | 1 | failed | occurrence_out_of_range | those who not fit their laws and commands. |


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

## R3

**OPEN** — Quote-binding diagnostic only. Baseline 1 unchanged. No scoring tuning.
