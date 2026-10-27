# Speaking Motor V1.6 — evaluación pedagógica

Fecha: 2026-10-24T15:24:52.997Z
Fuente: api

El conjunto `validate` es hold-out nuevo. `regression` es el antiguo validate de V1.5, ya usado para decidir cambios.

No se marca PASS solo porque la API responda 200.

## Set regression

Fuente: api

| Caso | Esperados | Detectados | FP | Omitidos | Bandas GV/DM | Feedback | Estado |
|---|---|---|---|---|---|---|---|
| val-q01-clean | — | — | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| val-q02-articles | GR-AR | GR-AR | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| val-q03-tenses | GR-VT | GR-VT | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| val-q02-prepositions | GR-PR | GR-PR | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| val-q04-collocation | VC-CO, VC-WW | VC-CO, VC-CO | 0 | 1 | GV 3.5 / DM 3 | review | REVIEW |
| val-q01-unnatural | VC-WW, GR-VT | review_required | 0 | 2 | GV 3.5 / DM 3 | review_required | REVIEW |
| val-q05-short | DM-EL | DM-EL | 0 | 0 | GV null / DM null | adequate | PASS |
| val-q02-repetition | VC-RP | VC-RP | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| val-q04-irrelevant | DM-RV | DM-RV | 0 | 0 | GV 2.5 / DM 1 | adequate | PASS |
| val-q03-organised | — | — | 0 | 0 | GV 4 / DM 4 | adequate | PASS |
| hold-q01-clean | — | — | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| hold-q02-articles | GR-AR | GR-AR, GR-AR | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| hold-q03-tenses | GR-VT | GR-VT | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| hold-q02-prepositions | GR-PR | GR-PR | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| hold-q04-collocation | VC-CO | VC-CO | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| hold-q01-unnatural | VC-WW | VC-WW | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| hold-q05-short-ok | — | — | 0 | 0 | GV null / DM null | adequate | PASS |
| hold-q05-undeveloped | DM-EL | DM-EL | 0 | 0 | GV null / DM null | adequate | PASS |
| hold-q02-repetition | VC-RP | VC-RP | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| hold-q04-irrelevant | DM-RV | DM-RV | 0 | 0 | GV 2 / DM 1 | adequate | PASS |
| hold-q03-organised | — | GR-AR, VC-CO | 2 | 0 | GV 3.5 / DM 3 | review | REVIEW |

- PASS: 18
- REVIEW: 3
- FAIL: 0
- Códigos detectados: GR-AR, GR-VT, GR-PR, VC-CO, review_required, DM-EL, VC-RP, DM-RV, VC-WW
- Códigos omitidos: VC-WW, GR-VT
- Falsos positivos: GR-AR, VC-CO

## Set validate

Fuente: api

| Caso | Esperados | Detectados | FP | Omitidos | Bandas GV/DM | Feedback | Estado |
|---|---|---|---|---|---|---|---|
| blind-q01-clean | — | — | 0 | 0 | GV 4 / DM 4 | adequate | PASS |
| blind-q02-articles | GR-AR | GR-AR, GR-AR, GR-AR | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| blind-q03-tenses | GR-VT | GR-VT | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| blind-q02-prepositions | GR-PR | GR-PR | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| blind-q04-collocation | VC-CO | VC-CO | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| blind-q01-wordchoice | VC-WW | VC-WW | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| blind-q05-short-ok | — | — | 0 | 0 | GV 3.5 / DM null | adequate | PASS |
| blind-q05-thin | DM-EL | DM-EL | 0 | 0 | GV null / DM null | adequate | PASS |
| blind-q02-repetition | VC-RP | VC-RP | 0 | 0 | GV 3.5 / DM 3 | adequate | PASS |
| blind-q04-irrelevant | DM-RV | DM-RV | 0 | 0 | GV 2 / DM 1 | adequate | PASS |
| blind-q03-organised | — | — | 0 | 0 | GV 4 / DM 3.5 | adequate | PASS |

- PASS: 11
- REVIEW: 0
- FAIL: 0
- Códigos detectados: GR-AR, GR-VT, GR-PR, VC-CO, VC-WW, DM-EL, VC-RP, DM-RV
- Códigos omitidos: —
- Falsos positivos: —

