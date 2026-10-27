# DRALO Speaking Motor V1.6 — calibración pedagógica

Fecha: 2026-10-24. Local. Sin commit, sin deploy, sin SQL en producción.

## 1. Causa del exceso de GR-VT

La aplicación **no** remapeaba otros códigos a GR-VT. Tampoco había un valor por defecto en JS.

Causas reales:

1. El esquema JSON del rater usaba solo `"code":"GR-VT"` como ejemplo. El modelo copiaba ese token.
2. Los códigos desconocidos se descartaban. Para que la incidencia sobreviviera, el modelo elegía el ejemplo.
3. El rater no recibía el texto de la pregunta, solo `Q1 (SP-EX001-P1-Q04): respuesta`. La relevancia era invisible.
4. No había validador de evidencia: el extracto no se comprobaba contra la respuesta ni contra la naturaleza del código.

## 2. Archivos modificados

Nuevos:

- `src/features/speaking-b2-motor/domain/issue-evidence.js`
- `src/features/speaking-b2-motor/domain/issue-validator.js`
- `src/features/speaking-b2-motor/__tests__/issue-validator.test.js`
- `docs/speaking-motor-v1.6-text-eval-report.md`
- `docs/speaking-motor-v1.6-report.md`

Cambiados (solo motor interno):

- `rubric-engine.js`, `pedagogy-es.js`, `error-taxonomy.js`
- `text-bank.js`, `text-eval.js`, `validate-speaking-b2-text.mjs`
- tests de taxonomía y text-eval, `package.json`

No se tocaron `/exam-practice/b2/exam-speaking/`, Parts 2–4, hub, exam mode, RUOE, Writing ni Listening.

## 3. Cambios en el evaluador

- Secuencia A–F: detectar → citar fragmento → naturaleza → código → validar evidencia → explicar.
- Pregunta y respuesta van juntas al rater.
- Códigos prioritarios en el esquema; `review_required` si no hay confianza.
- GR-VT solo si hay evidencia verbal. Si el modelo lo usa como cajón de sastre, el validador lo recodifica o lo deja en revisión.
- Respuesta gramatical irrelevante → DM-RV, no gramática.
- Respuesta breve con razón → no DM-EL automático.
- Colocaciones genéricas (`make messages`, `do a decision`, `make exercise`); no se corrige *do sport* / *at the weekend*.
- El banco antiguo `validate` pasa a `regression`. Hay un hold-out nuevo `hold-*`.

## 4. Antes y después (mismos casos V1.5 = regression)

| | V1.5 | V1.6 |
|---|---|---|
| PASS | 1 | 5 |
| REVIEW | 3 | 5 |
| FAIL | 6 | 0 |
| Falsos positivos | GR-VT en 4 casos | 0 |
| Códigos útiles | solo GR-VT | GR-AR, GR-VT, VC-CO, DM-EL, VC-RP, DM-RV |

Hold-out nuevo (`validate`): 6 PASS, 4 REVIEW, 1 FAIL. Cero falsos positivos.

## 5. Errores correctamente detectados

Regression: artículos, tiempos, colocación `make messages`, respuesta corta, repetición, irrelevancia (cocina vs tecnología).

Hold-out: `the my uncle`, `Two days ago I meet`, `arrive to` / `wait the`, `more strong` / `in the job`, repetición de *walking*, film/chef vs tecnología.

La respuesta breve adecuada (`Yes, pottery, because…`) **no** se marcó DM-EL.

## 6. Errores omitidos

- GR-PR en regression: el problema se vio, pero quedó `review_required`.
- VC-WW junto a colocación (`do a video call` se dejó; es aceptable).
- `enjoy to` + `more big`: detección sí, clasificación `review_required`.
- `Maybe later`: el resumen habla de falta de desarrollo, pero no emitió DM-EL → FAIL.

## 7. Falsos positivos

Ninguno en regression ni en el hold-out. GR-VT ya no aparece en artículos, preposiciones, respuestas cortas ni repeticiones.

## 8. Casos que requieren revisión

- Preposiciones y colocaciones nuevas a veces salen `review_required` en vez del código fino.
- Varias respuestas limpias tienen banda GV/DM en `null` (el modelo se vuelve conservador). El feedback en español es bueno; el juez las marca REVIEW por silencio de puntuación, no por error inventado.
- `hold-q03-organised` cayó al fallback genérico de pedagogía.

## 9. Tests

69/69 del motor: estado, coordinador, taxonomía, UI heredada, arranque, auth, audio, cuotas, persistencia, fixtures, text-eval, grounding e issue-validator.

Casos unitarios nuevos: artículos, preposiciones, colocaciones, verbos, irrelevancia, breve correcta, no-respuesta, repetición, *do sport* aceptable. Las expectativas no se bajaron para encajar con el motor.

## 10. Limitaciones pendientes

- Calibrar mejor GR-PR y VC-CO cuando hay dos problemas en la misma frase.
- Recuperar bandas GV/DM cuando hay evidencia suficiente.
- `Maybe later` debe emitir DM-EL, no solo mencionarlo en el resumen.
- Sigue sin validarse Whisper ni una entrevista oral real.

Tabla completa: `docs/speaking-motor-v1.6-text-eval-report.md`.
