# Speaking Motor V1.4 — estado y despliegue

No publicar ni aplicar SQL en producción sin autorización expresa.
No hacer commit ni deploy desde esta pasada.

## Ruta principal

- `http://localhost:3000/exam-practice/b2/exam-speaking/`
- Part 1: motor embebido. Parts 2–4: simulador anterior.
- Prueba interna: `http://localhost:3000/exam-practice/b2/speaking/ex001/`

## Inicio unificado

En móvil, el botón original `Start exercise` (`phone-practice-step__cta`) abre el audio-check del motor.

- El padre controla el arranque con `useSpeakingMotorParent` + `ref.beginAudioCheck()`.
- Un candado síncrono evita que un doble clic cree dos sesiones.
- `getUserMedia` solo se pide dentro de `beginAudioCheck`, después de la acción del alumno.
- Tras la comprobación de micrófono, el alumno pulsa `Start the interview` en esa vista para empezar el examen.
- En escritorio no existe el paso de `Start exercise`; el motor sigue mostrando su propio arranque.

## Token de sesión

El `accessToken` **no es de un solo uso**. Es una credencial de sesión:

- Se emite una vez al crear la sesión (32 bytes aleatorios).
- El servidor guarda solo `accessTokenHash` (SHA-256).
- Sirve para todas las peticiones de esa sesión hasta `expiresAt` (24 h).
- No autoriza ninguna otra sesión.
- El UUID solo no basta.
- Tras vincular un invitado a una cuenta, solo ese usuario puede seguir usando el token.

## Persistencia

- Local (`next dev`): JSON temporal explícito si las tablas no existen.
- Publicado (`NODE_ENV=production` o `VERCEL=1`): si Supabase no acepta la sesión, la API responde `503 STORE_UNAVAILABLE`. No se usa el JSON en silencio.

`scripts/speaking_b2_motor.sql` sigue **sin aplicar**. Incluye `access_token_hash` y `expires_at`.

## Evaluación

- Grammar and Vocabulary y Discourse Management pueden puntuar si hay texto suficiente.
- Pronunciation queda `null` mientras no exista análisis acústico real. Tener audio + Whisper no cuenta.
- Interactive Communication y Global Achievement quedan `null` en esta Part 1 aislada.
- El aviso dice que la nota no es oficial de Cambridge.

## Cuotas

Comprobar → evaluar → cobrar. Un fallo de evaluación no cobra. Un informe ya guardado no cobra otra vez.

## Audio y examinador

- Voz autorizada: `en-GB-SoniaNeural`. Fallback: OpenAI `nova` (8 s).
- TTS solo reproduce líneas del banco. Un fallo deja `PAUSED_TECHNICAL`.
- VAD: no cierra el turno si el alumno tarda en empezar o hace una pausa natural (< 1,8 s tras ≥ 1,2 s de habla).
- El navegador de automatización no tiene micrófono. En local, el modo fixture recorre el motor con audios sintéticos.

## Modo fixture (solo desarrollo)

- Servidor: `NODE_ENV=development` y no Vercel. Se apaga con `SPEAKING_B2_FIXTURE_MODE=0`.
- Producción o Vercel: siempre desactivado, aunque el cliente pida `fixtureMode`.
- No se activa por query string.
- Ruta interna: `/exam-practice/b2/speaking/ex001/`
- La página pública `/exam-practice/b2/exam-speaking/` no muestra controles de fixture.
- Las sesiones fixture no cobran cuota.
- `fixtureId` solo se acepta en una sesión fixture y solo si el id está en el catálogo.
- Los audios son sintéticos/técnicos. No son grabaciones auténticas de alumnos.
- Informe: `docs/speaking-motor-v1-fixture-report.md`
- Script: `node --loader ./scripts/alias-loader.mjs scripts/validate-speaking-b2-fixtures.mjs`
