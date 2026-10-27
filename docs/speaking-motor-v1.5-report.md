# DRALO Speaking Motor V1.5 — informe

Fecha: 2026-10-24. Local. Sin commit, sin deploy, sin SQL en producción.

## 1. Archivos modificados

Nuevos:

- `src/features/speaking-b2-motor/domain/audio-signal.js`
- `src/features/speaking-b2-motor/domain/stt-quality.js`
- `src/features/speaking-b2-motor/fixtures/text-bank.js`
- `src/features/speaking-b2-motor/fixtures/text-eval.js`
- `src/features/speaking-b2-motor/fixtures/audio/` (`empty.wav`, `non-linguistic-tone.wav`, `corrupt.bin`, `README.md`)
- `src/app/api/speaking-b2/fixtures/text-eval/route.js`
- `src/features/speaking-b2-motor/__tests__/text-eval.test.js`
- `src/features/speaking-b2-motor/__tests__/audio-grounding.test.js`
- `scripts/prepare-speaking-b2-audio-fixtures.mjs`
- `scripts/validate-speaking-b2-text.mjs`
- `docs/speaking-motor-v1-text-eval-report.md`

Cambiados (motor interno, no UI pública):

- `src/features/speaking-b2-motor/fixtures/materialize.js` — un fixture `speech` sin audio real ya no se sustituye por un tono.
- `src/features/speaking-b2-motor/fixtures/catalog.js`
- `src/features/speaking-b2-motor/services/evaluation/answer-audio.js`
- `src/features/speaking-b2-motor/services/evaluation/run-complete.js`
- `src/features/speaking-b2-motor/services/evaluation/rubric-engine.js`
- `src/features/speaking-b2-motor/services/evaluation/pedagogy-es.js`
- `src/app/api/speaking-b2/turn/route.js`
- `src/app/api/speaking-b2/fixtures/[id]/route.js`
- `src/features/speaking-b2-motor/__tests__/fixture-mode.test.js`
- `package.json` (`speaking:text-eval` + tests nuevos)

No se tocaron cabeceras, botones, colores, Parts 2–4, hub B2 ni exam mode.

## 2. Banco de respuestas

13 casos en `text-bank.js`:

- develop (diseño, no se usan para el veredicto): `dev-q01-clean`, `dev-q02-articles`, `dev-q03-tenses`
- validate (held-out): clean, artículos, tiempos, preposiciones, colocaciones, vocabulario poco natural, respuesta corta, repetición, irrelevante, bien organizada

Cada caso lleva pregunta, respuesta, transcripción de referencia, códigos esperados, fortalezas, criterios y notas. Los códigos son expectativas de revisión, no puntuaciones prefijadas.

## 3. Resultados por caso (set validate)

Fuente: `POST /api/speaking-b2/fixtures/text-eval/` contra el evaluador real. `persist: false`.

| Caso | Esperados | Detectados | FP | Omitidos | Feedback | Estado |
|---|---|---|---|---|---|---|
| val-q01-clean | — | — | 0 | 0 | español, GV 4.0 | REVIEW* |
| val-q02-articles | GR-AR | GR-VT | 1 | 1 | habla de “errores menores”, código incorrecto | FAIL |
| val-q03-tenses | GR-VT | GR-VT | 0 | 0 | detecta el tiempo; resumen en español | REVIEW* |
| val-q02-prepositions | GR-PR | GR-VT, GR-VT | 2 | 1 | no nombra las preposiciones | FAIL |
| val-q04-collocation | VC-CO, VC-WW | — | 0 | 2 | elogia el vocabulario | FAIL |
| val-q01-unnatural | VC-WW, GR-VT | GR-VT | 0 | 1 | explica `more big` / `enjoy to make` | REVIEW |
| val-q05-short | DM-EL | GR-VT | 1 | 1 | nota que es breve, pero no emite DM-EL | FAIL |
| val-q02-repetition | VC-RP | GR-VT | 1 | 1 | el texto ve la repetición; el código no | FAIL |
| val-q04-irrelevant | DM-RV | — | 0 | 1 | valora la cocina y no la irrelevancia | FAIL |
| val-q03-organised | — | — | 0 | 0 | GV 4 / DM 4, bien organizado | PASS |

\*REVIEW por el heurístico de español del juez, no por códigos. Tras ampliar el patrón, esos dos casos serían PASS.

200 de API no se ha usado como PASS.

## 4. Errores correctamente detectados

- GR-VT en `last summer I visit` (`val-q03-tenses`).
- GR-VT en `I enjoy to make` (`val-q01-unnatural`).
- La respuesta limpia y la organizada no inventan incidencias.
- PN / IC / GA permanecen sin puntuación.

## 5. Errores omitidos

GR-AR, GR-PR, VC-CO, VC-WW, DM-EL, VC-RP, DM-RV.

Discourse Management solo se puntúa con ≥2 turnos y ≥20 palabras. Por eso `val-q04-irrelevant` y `val-q05-short` no reciben banda DM, y el modelo tampoco emite el código discursivo.

## 6. Falsos positivos

GR-VT aparece como cajón de sastre en artículos, preposiciones, respuesta corta y repetición. No se ha visto un aluvión de códigos inventados fuera de gramática verbal.

## 7. Calidad de las explicaciones

Cuando acierta el código, el español es comprensible y cita el extracto (`to make my English more big`). Cuando falla el código, el resumen a veces describe el problema real (brevedad, repetición) pero etiqueta mal, o bien elogia una respuesta irrelevante / con colocación incorrecta. Adecuado a B2 en tono; aún no fiable en taxonomía.

## 8. Estado de Whisper

No validado con habla real. Controles añadidos:

- silencio, tono y audio corrupto no llaman a STT o vacían la transcripción
- un texto largo para un clip demasiado corto se marca `uncertain` / `hallucination`
- ese texto no entra en el evaluador
- una frase conocida no basta, por sí sola, para declarar alucinación

El TTS en tiempo real ya no rellena un fixture `speech` con un tono de 220 Hz.

## 9. Grabaciones utilizadas

| Archivo | Tipo | Autenticidad |
|---|---|---|
| `fixtures/audio/empty.wav` | vacío | synthetic-technical |
| `fixtures/audio/non-linguistic-tone.wav` | no lingüístico | synthetic-technical |
| `fixtures/audio/corrupt.bin` | corrupto | synthetic-technical |

No hay grabación humana. No se presenta audio de IA como voz de alumno. Los fixtures `speech` del catálogo quedan `NO_SPEECH_AUDIO` (422) hasta que exista un archivo inteligible.

## 10. Limitaciones y próximos pasos

- El motor pedagógico **puede** detectar y explicar algunos errores reales de Part 1 sobre texto, sin micrófono.
- **No** está validado el reconocimiento de voz con habla inteligible.
- **No** está validada una entrevista oral real.
- El evaluador aún confunde artículos, preposiciones, colocaciones, irrelevancia y falta de desarrollo.
- Siguiente: grabaciones humanas cortas con transcripción de referencia; calibrar GR-AR / GR-PR / VC-* / DM-*; no puntuar DM con un solo turno irrelevante.

Tests del motor (60/60): estado, coordinador, taxonomía, UI heredada, arranque, auth, audio, cuotas, persistencia, fixtures, text-eval y grounding.

Seguridad del harness: solo `development` y no Vercel; texto tipeado 403 fuera de `fixtureMode`; sin cuota; sin persistir informe en historial real; sin UI pública.
