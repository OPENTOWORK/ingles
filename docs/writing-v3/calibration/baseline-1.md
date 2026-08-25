# Writing v3 Calibration — baseline-1

Generated: 2026-08-11T18:25:27.871Z

## Baseline model / config

- Engine: 3.0.0
- Model: gpt-4o-2024-08-06
- Temperature: 0
- Response format: json_schema

## Status: complete

## Expected vs actual matrix

| Case | Exp C | Act C | Exp CA | Act CA | Exp O | Act O | Exp L | Act L | Exp /20 | Act /20 | Profile | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G-01 | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 3 | 13 | 13 | yes | failed |
| G-02 | 3 | 3 | 3 | 2 | 3 | 2 | 3 | 2 | 12 | 9 | no | failed |
| G-03 | 5 | 5 | 5 | 4 | 4 | 4 | 5 | 4 | 19 | 17 | no | failed |
| G-04 | 5 | 5 | 3 | 4 | 3 | 3 | 3 | 3 | 14 | 15 | no | failed |
| G-05 | 5 | 5 | 3 | 3 | 3 | 3 | 3 | 2 | 14 | 13 | no | failed |
| G-06 | 5 | 5 | 3 | 3 | 4 | 3 | 3 | 2 | 15 | 13 | no | failed |
| G-07 | 5 | 3 | 2 | 3 | 2 | 2 | 2 | 2 | 11 | 10 | no | failed |
| G-08 | 5 | 4 | 3 | 3 | 4 | 3 | 3 | 3 | 15 | 13 | no | failed |
| G-09 | 5 | 4 | 5 | 3 | 5 | 3 | 5 | 3 | 20 | 13 | no | failed |
| G-10 | 5 | 5 | 4 | 4 | 4 | 4 | 3 | 3 | 16 | 16 | yes | failed |
| G-11 | 4 | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 11 | 10 | no | failed |
| G-12 | 5 | 4 | 3 | 3 | 4 | 3 | 3 | 2 | 15 | 12 | no | failed |

## Aggregate

- Exact profiles matched: 2 / 12
- Exact criterion marks matched: 27 / 48
- Content accuracy: 58.3%
- Communicative Achievement accuracy: 58.3%
- Organisation accuracy: 58.3%
- Language accuracy: 50.0%
- Mean abs deviation: C 0.50 · CA 0.50 · O 0.50 · L 0.58
- Same-total wrong-profile cases: none
- Validation failures: 12

## Mismatch forensics

- **G-02 / communicative_achievement**: expected 3, actual 2 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-02 / organisation**: expected 3, actual 2 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-02 / language**: expected 3, actual 2 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-03 / communicative_achievement**: expected 5, actual 4 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-03 / language**: expected 5, actual 4 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-04 / communicative_achievement**: expected 3, actual 4 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-05 / language**: expected 3, actual 2 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-06 / organisation**: expected 4, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-06 / language**: expected 3, actual 2 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-07 / content**: expected 5, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-07 / communicative_achievement**: expected 2, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-08 / content**: expected 5, actual 4 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-08 / organisation**: expected 4, actual 3 · origin=unknown
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
- **G-11 / content**: expected 4, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-12 / content**: expected 5, actual 4 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-12 / organisation**: expected 4, actual 3 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —
- **G-12 / language**: expected 3, actual 2 · origin=unknown
  - why_not_higher: (raw model marks; assessment record failed validation)
  - why_not_lower: (raw model marks; assessment record failed validation)
  - rules: —

## R3

**OPEN** — Baseline 1 exact profiles 2/12. No prompt tuning applied after this run.
