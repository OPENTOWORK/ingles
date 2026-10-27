# DRALO Speaking Motor V1.7 — calibración final del evaluador

Fecha: 2026-10-24. Local. Sin commit, sin deploy, sin SQL en producción.

Evaluación de entrevistas individuales de Part 1 (una pregunta + una respuesta de referencia). No se ha evaluado una entrevista oral completa ni Whisper.

Esta puntuación es orientativa de Dralo. No está calibrada contra Cambridge: no hay revisión de profesores.

## 1. Causa de las bandas GV/DM en null

Tres situaciones, no una sola:

### A. Evidencia realmente insuficiente

El motor no puntúa Grammar and Vocabulary con menos de 12 palabras, ni Discourse Management si no hay (2 turnos y ≥20 palabras) **o** (1 turno desarrollado y ≥16 palabras). Pronunciation, Interactive Communication y Global Achievement siguen en null en Part 1 aislada: no hay análisis acústico, no hay pareja y no hay entrevista completa.

Casos observados en esta corrida:

| Caso | Respuesta | Palabras | GV/DM | Motivo |
|---|---|---|---|---|
| val-q05-short | Yes, cooking. | 2 | null/null | Muestra lingüística insuficiente |
| hold-q05-undeveloped | Maybe later. | 2 | null/null | No-respuesta. DM-EL sí se emite |
| blind-q05-thin | We'll see. | 2 | null/null | Igual |
| hold-q05-short-ok | Yes, pottery, because… | 11 | null/null | Breve pero pertinente; 11 < 12 |
| blind-q05-short-ok | Yes, signing, because… | 15 | 3.5 / null | GV sí; DM de un solo turno pide 16 |

No se asignó nota por defecto.

### B. Evidencia suficiente, error técnico al recuperar la puntuación

Había tres fallos de recuperación, no de pedagogía:

1. Discourse Management exigía **siempre** 2 turnos. Una respuesta única de 30 palabras, desarrollada, se trataba como evidencia insuficiente.
2. El esquema JSON del rater ejemplificaba `"n|null"`. El parser solo leía `model.grammarVocabulary` / `model.discourseManagement` en número. Se perdían `"3,5"`, `{ value: 3.5 }` y `grammar_vocabulary`.
3. La ausencia de incidencias no era evidencia positiva, pero el parser tampoco recuperaba la banda cuando el modelo sí la emitía en otro formato.

Corregido: un turno ≥16 palabras **y** desarrollado habilita DM; `readSpeakingBand` / `readSpeakingB2Scores` aceptan coma decimal, objetos anidados y snake_case. Si el modelo omite la banda con evidencia suficiente, se registra `model_withheld`. No se inventa un 3.0.

En esta corrida, todas las respuestas con evidencia suficiente recibieron GV y DM. No quedó ningún caso B.

### C. Incertidumbre legítima del evaluador

Si hay evidencia y el modelo se abstiene, se mantiene `model_withheld`. En esta corrida no apareció: las respuestas desarrolladas salieron con banda. Las abstenciones observadas son A, no C.

## 2. Correcciones realizadas

- Recuperación de bandas (caso B) y registro de abstención A vs C.
- Evidencia de preposiciones: `wait the bus/train`, `arrive to`, `in home`, `go in the cinema`, `listen music`, `depend of`, `interested on`.
- Colocaciones: `do a decision`, `make messages`, `make exercise` → VC-CO. `make a decision`, `do sport`, `do exercise` no se marcan.
- Deduplicación GR-PR/VC-CO y VC-CO/VC-WW sobre el mismo extracto.
- `review_required` se resuelve a un código gramatical cuando la evidencia apunta a uno solo.
- Respuestas hedged (`Maybe later`, `We'll see`) → DM-EL. No se penaliza gramática en una respuesta lingüísticamente correcta pero insuficiente.
- Respuesta breve con razón (`Yes, pottery, because…`) no genera DM-EL.
- Bandas e incidencias son procesos distintos: no hace falta error para puntuar; la ausencia de errores no implica banda máxima.
- El hold-out V1.6 (`hold-*`) pasa a regression. El validate ciego es `blind-*`.

## 3. Archivos modificados

Solo motor interno y docs. No se tocó `/exam-practice/b2/exam-speaking/`, Parts 2–4, cabecera, botones, selector, colores, tipografía, hub B2, exam mode, RUOE, Writing ni Listening.

Dominio y evaluación:

- `src/features/speaking-b2-motor/domain/rubric-b2-part1.js`
- `src/features/speaking-b2-motor/domain/issue-evidence.js`
- `src/features/speaking-b2-motor/domain/issue-validator.js`
- `src/features/speaking-b2-motor/services/evaluation/rubric-engine.js`
- `src/features/speaking-b2-motor/services/evaluation/run-complete.js`

Banco, juez y tests:

- `src/features/speaking-b2-motor/fixtures/text-bank.js`
- `src/features/speaking-b2-motor/__tests__/issue-validator.test.js`
- `src/features/speaking-b2-motor/__tests__/text-eval.test.js`
- `src/features/speaking-b2-motor/__tests__/taxonomy.test.js`
- `scripts/validate-speaking-b2-text.mjs`

Informes:

- `docs/speaking-motor-v1.7-report.md`
- `docs/speaking-motor-v1.7-text-eval-report.md`

## 4. Preposiciones y colocaciones

| Caso | Respuesta (extracto) | Esperado | Detectado | Estado |
|---|---|---|---|---|
| val-q02-prepositions | in home / go in the cinema | GR-PR | GR-PR | PASS |
| hold-q02-prepositions | arrive to / wait the bus | GR-PR | GR-PR | PASS |
| blind-q02-prepositions | wait the train / listen music / in home | GR-PR | GR-PR | PASS |
| hold-q04-collocation | do a decision / make exercise | VC-CO | VC-CO | PASS |
| blind-q04-collocation | do a decision / make messages | VC-CO | VC-CO | PASS |
| val-q04-collocation | make messages / do a video call | VC-CO, VC-WW | VC-CO, VC-CO | REVIEW |

`make a decision` y `do sport` no se marcan. `wait the bus` y `arrive to` son GR-PR, no léxico. `do a decision` y `make messages` son VC-CO.

REVIEW de `val-q04-collocation`: se detectaron las dos incidencias, ambas como VC-CO. `do a video call` es frontera colocación / word choice; no se bajó la expectativa a un solo código.

## 5. Discourse Management

| Tipo | Ejemplo | DM-EL / DM-RV | Banda DM | ¿Penaliza gramática? |
|---|---|---|---|---|
| Desarrollo adecuado | val-q03-organised, blind-q03-organised | no | 4 / 3.5 | no |
| Breve pero pertinente | pottery because…; signing because… | no | null (A) | no |
| Excesivamente breve | Yes, cooking. | DM-EL | null | no |
| No responde / hedge | Maybe later. / We'll see. | DM-EL | null | no |
| Irrelevante | cocina o mar vs tecnología | DM-RV | 1 | GV 2–2.5 por el discurso, no por gramática inventada |
| Repetición | I like / I love walking / I enjoy cooking ×4 | VC-RP, no DM-EL | 3 | no |

La respuesta lingüísticamente correcta pero insuficiente no recibe una mala nota gramatical. Las breves con razón no se penalizan automáticamente.

## 6. Bandas emitidas y abstenciones

Con evidencia suficiente (esta corrida): GV 3.5 o 4 en respuestas pertinentes; DM 3, 3.5 o 4. Respuestas irrelevantes: GV 2–2.5, DM 1. Ninguna respuesta limpia recibió 5 por ausencia de errores.

Abstenciones justificadas (A): las cinco filas de la tabla del apartado 1. PN, IC y GA: null por diseño en Part 1 aislada.

No hubo caso B residual. No hubo `model_withheld` (C) en esta corrida.

## 7. Comparación sobre conjuntos de regresión

Mismos casos, mismas expectativas. No se relajaron para fabricar PASS.

| Conjunto | V1.5 | V1.6 | V1.7 |
|---|---|---|---|
| val-* (validate original) | 1 PASS / 3 REVIEW / 6 FAIL | 5 PASS / 5 REVIEW / 0 FAIL | 8 PASS / 2 REVIEW / 0 FAIL |
| hold-* (hold-out V1.6) | — | 6 PASS / 4 REVIEW / 1 FAIL | 10 PASS / 1 REVIEW / 0 FAIL |
| Regression conjunta | — | — | 18 PASS / 3 REVIEW / 0 FAIL |
| Falsos positivos val-* | GR-VT en varios | 0 | 0 |
| FAIL `Maybe later` | — | sí (sin DM-EL) | PASS (DM-EL) |

## 8. Conjunto ciego nuevo (`blind-*`)

11 casos no usados para ajustar. Fuente: API local.

- PASS: 11
- REVIEW: 0
- FAIL: 0
- Falsos positivos: 0
- Omitidos: 0

Detección y clasificación: artículos (`the my parents`, `the lunch`), tiempos (`last month I go`), preposiciones (`wait the train`, `listen music`, `in home`), colocaciones (`do a decision`, `make messages`), word choice (`more good`), breve adecuada (signing because…, sin DM-EL), hedge (`We'll see.` → DM-EL), repetición, irrelevancia (mar/nadar vs tecnología), respuesta organizada limpia (GV 4 / DM 3.5, sin incidencias).

Esto mide generalización sobre ítems individuales, no una entrevista completa ni una calibración oficial.

## 9. Tests ejecutados

71/71 del motor: estado, coordinador, taxonomía, UI heredada, arranque, auth, audio, complete, persistencia, fixtures, text-eval, grounding e issue-validator.

Evaluación viva: `node --loader ./scripts/alias-loader.mjs scripts/validate-speaking-b2-text.mjs` → 21 regression + 11 blind, vía API de `npm run dev`.

La fase no se da por cerrada solo porque pasen los unitarios. El criterio es la tabla pedagógica.

## 10. Problemas pendientes

1. `val-q04-collocation`: `do a video call` se clasifica como VC-CO, no VC-WW. Frontera léxica; REVIEW consciente.
2. `val-q01-unnatural`: `enjoy to` + `more big` queda `review_required` (incertidumbre C de clasificación, no de banda).
3. `hold-q03-organised`: 2 FP (GR-AR, VC-CO) sobre una respuesta limpia de regression. El paralelo ciego `blind-q03-organised` no los tuvo. No se cambiaron expectativas. Queda como REVIEW.
4. Bandas típicas 3.5 / 3: coherentes entre sí, no calibradas por profesores.
5. Whisper y la entrevista oral completa siguen sin validarse. No hay grabaciones humanas.
6. SQL de persistencia sin aplicar. Fixtures solo en desarrollo. Interfaz pública de Speaking sin cambios.

Tabla completa: `docs/speaking-motor-v1.7-text-eval-report.md`.
