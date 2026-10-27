# DRALO Speaking Motor V1.9 — primer piloto de audio humano

Fecha: 2026-10-24. Local. Sin commit, sin deploy, sin SQL en producción.

La interfaz `/exam-practice/b2/exam-speaking/` no se ha modificado.

**La validación humana no está aprobada.** Aún no hay grabaciones en el banco. No se ha simulado habla humana. WER, STT y evaluación comparada quedan **PENDING**.

## Completado

- Revisión del importador V1.8: formatos, asociación a `questionId`, consentimiento obligatorio para evaluar, carpeta gitignorada.
- Paquete de cinco preguntas SP-EX001 con IDs fijos (`hum-v19-q01` … `q05` / `SP-EX001-P1-Q01` … `Q05`).
- Plantilla `manifest.template.json` sin consentimiento, sin nivel y sin transcripciones inventadas (`granted: false`, `humanTranscript: ""`).
- Instrucciones de grabación móvil, transferencia y conservación de originales.
- La transcripción de referencia solo recorta espacios externos. Conserva errores, repeticiones y autocorrecciones.
- Scripts: `speaking:human-prepare`, `speaking:human-check`, `speaking:human-eval`.
- Tests del paquete y de la transcripción cruda. 82/82 del motor.
- Informe comparativo preparado; con el banco vacío no llama a Whisper ni cobra cuota.

## Pendiente (hace falta el audio)

1. Grabar las cinco respuestas desde el móvil.
2. Copiarlas a `local/speaking-b2-human/originals/` con los nombres del paquete.
3. Rellenar consentimiento real y transcripción humana (sin corregir).
4. `SPEAKING_B2_HUMAN_STT=1 npm run speaking:human-eval`
5. WER, errores de STT, diferencias de bandas y calidad del feedback sobre habla real.
6. Entrevista oral continua (estas cinco tomas siguen siendo aisladas).

## Cómo grabar, transferir e importar

Ver `docs/speaking-motor-v1.9-recording-card.md` y `src/features/speaking-b2-motor/fixtures/human/README.md`.

```
npm run speaking:human-prepare
# copiar los cinco audios a local/speaking-b2-human/originals/
# rellenar manifest.json (consentimiento + transcripción cruda)
npm run speaking:human-check
SPEAKING_B2_HUMAN_STT=1 npm run speaking:human-eval
```

Tabla viva: `docs/speaking-motor-v1.9-human-eval-report.md`.
