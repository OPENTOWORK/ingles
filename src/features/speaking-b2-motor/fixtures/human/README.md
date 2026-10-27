# Banco de audio humano (solo local)

Las grabaciones autorizadas viven fuera de la app pública:

`local/speaking-b2-human/`

Esa carpeta está en `.gitignore`. No hagas commit de voces identificables. No uses grabaciones de alumnos ni de terceros sin autorización.

## Piloto V1.9 — cinco preguntas de SP-EX001

| id | questionId | Pregunta | Archivo sugerido |
|---|---|---|---|
| `hum-v19-q01` | `SP-EX001-P1-Q01` | What do you enjoy most about studying English? | `originals/hum-v19-q01.m4a` |
| `hum-v19-q02` | `SP-EX001-P1-Q02` | How do you usually spend your weekends? | `originals/hum-v19-q02.m4a` |
| `hum-v19-q03` | `SP-EX001-P1-Q03` | Do you prefer visiting new places or returning to places you know? Why? | `originals/hum-v19-q03.m4a` |
| `hum-v19-q04` | `SP-EX001-P1-Q04` | How has technology changed the way you communicate with your friends? | `originals/hum-v19-q04.m4a` |
| `hum-v19-q05` | `SP-EX001-P1-Q05` | Is there a new skill you would like to learn in the future? | `originals/hum-v19-q05.m4a` |

Son cinco respuestas aisladas, no una entrevista oral continua. No las presentes como entrevista humana completa.

## 1. Grabar desde el móvil

1. Abre en el teléfono `docs/speaking-motor-v1.9-recording-card.md` o esta tabla.
2. iPhone: **Notas de voz**. Android: **Grabadora**.
3. Graba **un archivo por pregunta**. 20–40 segundos. Habla con naturalidad.
4. No leas un texto escrito. Si te autocorrijes, déjalo.
5. No borres el original del teléfono hasta copiarlo al ordenador.

## 2. Transferir y conservar originales

Formatos admitidos: `.m4a` (típico del móvil), `.mp3`, `.wav`, `.aac`, `.ogg`, `.webm`. Máximo 15 MB por archivo.

1. Pasa los archivos por USB, AirDrop, Google Drive o un envío de **archivo** (no una nota de voz comprimida de WhatsApp si puedes evitarlo).
2. En el PC: `npm run speaking:human-prepare`
3. Copia cada archivo a `local/speaking-b2-human/originals/` con el nombre exacto (`hum-v19-q01.m4a`, …). Si el móvil da `.mp3`, cambia la extensión en el `audioFile` del manifest, no conviertas el audio.
4. No re-exportes, no normalices el volumen y no “arregles” el archivo. El importador lee `originals/` y no lo reescribe.

## 3. Autorización y transcripción (sin inventar)

La plantilla `manifest.template.json` deja `granted: false` y `humanTranscript: ""`. No está autorizado hasta que lo rellenes tú.

En `local/speaking-b2-human/manifest.json`:

- `authorization.granted`: `true` solo si la persona que habla consiente este uso interno.
- `authorization.purpose`: por ejemplo `internal-speaking-motor-validation`.
- `authorization.consentRef`: tu referencia (fecha, nota, correo).
- `authorization.recordedAt`: fecha real.
- `microphone`: `mobile` u otro dato conocido.
- `humanTranscript`: lo que **se oye**, no lo que “debería” decir.
- No pongas `estimatedLevel` salvo revisión de un profesor.

### Cómo transcribir sin normalizar

Escribe exactamente lo hablado:

- Errores: `the my parents`, `I go yesterday`, `wait the bus`.
- Repeticiones: `I like I like weekends`.
- Autocorrecciones: `I go, I mean I went`.
- Vacilación: `um`, `uh`, `well`.

No corrijas gramática, no quites repeticiones, no expandas contracciones y no traduzcas.

## 4. Comprobar e importar

```
npm run speaking:human-prepare
npm run speaking:human-check
```

El check lista qué audio falta, qué transcripción está vacía y si falta el consentimiento. Mientras falte algo, el estado es **PENDING**.

## 5. Evaluar (solo cuando el check esté ready)

En desarrollo, sin cuota de alumno y sin persistir:

```
SPEAKING_B2_HUMAN_STT=1 npm run speaking:human-eval
```

Hasta que existan las cinco grabaciones autorizadas y sus transcripciones, Whisper no se ejecuta y el informe humano permanece PENDING. El audio sintético o técnico no cuenta como validación humana.
