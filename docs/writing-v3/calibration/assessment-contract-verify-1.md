# Writing v3 Calibration — assessment-contract-verify-1

Generated: 2026-08-12T10:07:24.272Z

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
| G-01 | 4 | 5 | 3 | 3 | 3 | 2 | 3 | 2 | 13 | 12 | no | passed |
| G-09 | 5 | 4 | 5 | 3 | 5 | 3 | 5 | 3 | 20 | 13 | no | passed |

## Aggregate

- Exact profiles matched: 0 / 2
- Exact criterion marks matched: 1 / 8
- Content accuracy: 0.0%
- Communicative Achievement accuracy: 50.0%
- Organisation accuracy: 0.0%
- Language accuracy: 0.0%
- Mean abs deviation: C 1.00 · CA 1.00 · O 1.50 · L 1.50
- Same-total wrong-profile cases: none
- Validation failures: 0

## Quote-binding diagnostics

### G-01

_No binding diagnostics captured (assessment assembled or no payload)._

### G-09

_No binding diagnostics captured (assessment assembled or no payload)._


## Mismatch forensics

- **G-01 / content**: expected 4, actual 5 · origin=boundary_decision
  - why_not_higher: Band 5 is the top of the scale and the descriptor is met.
  - why_not_lower: All mandatory content points are addressed and developed, fully informing the target reader.
  - rules: C01, C03, C12
- **G-01 / organisation**: expected 3, actual 2 · origin=descriptor_application
  - why_not_higher: The response lacks clear paragraphing and logical progression of ideas, which prevents it from achieving Band 3.
  - why_not_lower: The response has a recognisable structure and uses basic linking words, which exceeds the minimal coherence of Band 1.
  - rules: O01, O02, O08
- **G-01 / language**: expected 3, actual 2 · origin=descriptor_application
  - why_not_higher: The frequent grammatical errors and inappropriate vocabulary use prevent the response from achieving Band 3, where meaning should remain clear despite errors.
  - why_not_lower: The response demonstrates some range beyond basic vocabulary and grammar, which exceeds the limited resources of Band 1.
  - rules: L02, L03, L06
- **G-09 / content**: expected 5, actual 4 · origin=task_interpretation
  - why_not_higher: The response does not fully develop the discussion on whether people's appearance is important, and the candidate's own idea about the fashion industry being a source of profit and income is not directly linked to the negative impact on people's lives.
  - why_not_lower: The response addresses all mandatory content points and provides a personal viewpoint on the fashion industry's impact, with some development for each point.
  - rules: C13, C14, C18
- **G-09 / communicative_achievement**: expected 5, actual 3 · origin=task_interpretation
  - why_not_higher: The response lacks complexity in presenting the personal viewpoint and does not consistently hold the reader's attention due to some unclear expressions.
  - why_not_lower: The response uses the conventions of an essay to communicate straightforward ideas, and the register is generally appropriate for an essay.
  - rules: CA12, CA06, CA03
- **G-09 / organisation**: expected 5, actual 3 · origin=descriptor_application
  - why_not_higher: The organisation within paragraphs could be improved for better coherence, and some connections between ideas are weak.
  - why_not_lower: The text is generally well organised with a clear introduction, body, and conclusion structure, and a variety of linking words and cohesive devices are used.
  - rules: O13, O01, O03
- **G-09 / language**: expected 5, actual 3 · origin=descriptor_application
  - why_not_higher: The response lacks the range and flexibility of vocabulary and grammar needed for a higher band, and errors are noticeable.
  - why_not_lower: The response uses everyday vocabulary generally appropriately and simple grammatical forms with a good degree of control, allowing meaning to be determined despite errors.
  - rules: L15, L03, L04

## R3

**OPEN** — Quote-binding diagnostic only. Baseline 1 unchanged. No scoring tuning.
