# Propuesta de retención de audio — Speaking B2

No es una política legal ni comercial aprobada. No se ha implementado borrado automático.

Hoy el motor **conserva** los ficheros: `persistSpeakingB2Audio` sube al bucket privado y no llama a `.remove()`. Las URLs firmadas duran 3600 s. No hay job de huérfanos ni gancho al borrar la cuenta.

## Qué hay que decidir

| Decisión | Opciones a valorar | Recomendación técnica (no jurídica) |
|---|---|---|
| Plazo de conservación | 30 / 90 / 180 días / hasta borrar cuenta / indefinido | Acotar. El audio no hace falta para releer el informe. |
| Finalidad | Evaluación, revisión docente, calidad del motor, reclamaciones | Declarar solo las necesarias. El piloto interno no es uso comercial. |
| Borrado de cuenta | Borrar objetos `userId/**` + filas; o anonimizar y conservar informe | El SQL actual no borra Storage al borrar `auth.users`. Hay que diseñarlo. |
| Huérfanos | Fichero sin turno; turno sin fichero | Recorrer `audio_path` vs bucket; registrar fallos; no borrar a ciegas. |
| URLs firmadas | 15 min / 1 h / 24 h | 1 h ya está. No hay URLs públicas. |
| Errores de borrado | Log + reintento / alerta staff | Hace falta tabla o log; hoy no existe. |
| Audio vs transcripción vs informe | Borrar audio y conservar texto; o borrar todo | El informe y la transcripción pueden vivir sin el wav. El wav identifica la voz. |

## Relación de datos

- **Audio:** `storage` `speaking-b2-audio` / `{userId}/{sessionId}/{uuid}.webm`. Identificable.
- **Turno:** `speaking_b2_turns.audio_path`, `transcript`. El texto no es la voz, pero puede citarse.
- **Informe:** `pending_report` / `report` / `speaking_b2_assessments`. Puede reutilizarse sin el audio.

Si se borra el audio y se conserva el informe, hay que dejar `audio_path` nulo y no generar URL.

## Lo que no se debe hacer sin aprobación

- Fijar 90 días u otro plazo “por defecto”.
- Borrar en producción.
- Usar grabaciones de alumnos reales para el piloto.
- Publicar URLs permanentes.

## Condición para implementarlo

Aprobación explícita de plazo, finalidad y comportamiento al borrar la cuenta. Hasta entonces, el código no borra.
