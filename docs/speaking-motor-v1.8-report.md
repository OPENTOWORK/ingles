# DRALO Speaking Motor V1.8 — audio humano, Whisper y evaluación integral

Fecha: 2026-10-24. Local. Sin commit, sin deploy, sin SQL en producción.

La interfaz pública `/exam-practice/b2/exam-speaking/` no se ha modificado. Tampoco Parts 2–4, hub, exam mode, RUOE, Writing ni Listening.

**La validación humana no está aprobada.** No hay grabaciones humanas autorizadas. No se han inventado. Los resultados de habla real quedan PENDING.

## 1. Grabaciones disponibles

| Fuente | Tipo | Autorizada | En el banco | Uso |
|---|---|---|---|---|
| `fixtures/audio/empty.wav` | silencio técnico | n/a | sintético | guardas STT |
| `fixtures/audio/non-linguistic-tone.wav` | tono | n/a | sintético | guardas STT |
| `fixtures/audio/corrupt.bin` | corrupto | n/a | sintético | formato |
| Listening B2 / previews | examenes de listening | no para Speaking | no importadas | no usadas |
| Voces de alumnos | — | no | 0 | — |
| `local/speaking-b2-human/` | banco humano | vacío | 0 | PENDING |

No hay ningún archivo de habla humana en el motor.

## 2. Procedencia y autorización

El importador exige consentimiento explícito (`authorization.granted`, `purpose`, `scope` local/internal/dev, `consentRef`). No acepta un nivel B2 sin `levelVerified` y un verificador. El audio debe residir dentro de `local/speaking-b2-human/` (gitignorado). El catálogo público no incluye bytes ni rutas.

Cómo importar: `src/features/speaking-b2-motor/fixtures/human/README.md`.

## 3. Resultados WER

WER de habla humana: **PENDING**.

El medidor sí está implementado y cubierto con pares sintéticos (no son grabaciones):

- Identidad: WER 0.
- `wait for the bus` → `wait the bus` + coletilla de canal: omisión, inserciones, riesgo de alucinación, preposición introducida. WER no es el único criterio.

Whisper no se ha llamado. No hay cuota comercial consumida.

## 4. Errores críticos de transcripción

Pendientes sobre audio humano. El clasificador distingue:

- Omisiones, inserciones, sustituciones.
- Cambio gramatical (artículos, preposiciones, tiempos).
- Cambio de significado (enjoy → hate).
- Gramática inventada o borrada por el STT (`the my parents` → `my parents`).
- Alucinaciones (`subscribe to our channel`, texto demasiado denso para la duración).

Un error de STT que elimine `the my` perjudicaría al alumno: el evaluador dejaría de ver GR-AR. Eso se midió con un transcriptor inyectado, no con Whisper real.

## 5. Comparación humana frente a Whisper

PENDING. El circuito A/B está listo:

- A: evalúa la transcripción humana verificada.
- B: evalúa la salida de Whisper solo si el audio pasa las guardas.
- Compara códigos, omisiones, falsos positivos, bandas GV/DM y resúmenes.

En la prueba inyectada, Whisper “corrigió” `the my parents` y la banda GV subió 0.5. Harm: severe. No se asume que la IA reproduce lo dicho.

## 6. Falsos positivos y negativos

Sobre habla humana: PENDING.

Sobre el circuito inyectado: FN GR-AR cuando el STT limpia el artículo. FP no observados en ese par.

Los fixtures sintéticos no se cuentan como validación humana.

## 7. Diferencias de bandas

Humanas: PENDING.

Inyectada: GV humana 3.0 vs Whisper 3.5 (el STT ocultó el error). DM igual. PN/IC/GA siguen en null sin análisis acústico ni pareja.

## 8. Calidad del feedback

Humano: PENDING.

Entrevista scriptada SP-EX001 (texto de referencia, **no** entrevista humana):

- Orden de preguntas: OK
- Asociación audio/pregunta (aquí texto/pregunta): OK
- Registro de turnos: 6 respuestas de candidato
- Cierre: “Thank you. That is the end of Part 1.”
- Evaluación conjunta LLM: no lanzada en esta pasada (`SPEAKING_B2_INTERVIEW_EVAL=1` para pedirla). No se cobra cuota.

## 9. Tests ejecutados

80/80 del motor (71 previos + 9 de V1.8).

V1.8 cubre: importación, formatos, asociación a pregunta, WER, impacto gramatical/léxico, comparación A/B, guardas de alucinación, entrevista scriptada, privacidad, cuota omitida, runtime de producción desactivado, banco vacío = PENDING.

Script: `npm run speaking:human-eval` → `docs/speaking-motor-v1.8-human-eval-report.md`.

## 10. Limitaciones pendientes

1. Cero grabaciones humanas autorizadas. La validación de audio hablado real sigue PENDING.
2. Whisper no se ha ejecutado sobre habla humana.
3. No hay entrevista oral humana completa. La scriptada no se presenta como tal.
4. Este ordenador no tiene micrófono; el circuito no depende de `getUserMedia`.
5. Las bandas siguen sin calibración de profesores ni sello Cambridge.
6. SQL de persistencia sin aplicar.

Para desbloquear: copiar audio autorizado a `local/speaking-b2-human/`, rellenar `manifest.json`, y en desarrollo `SPEAKING_B2_HUMAN_STT=1 npm run speaking:human-eval`.
