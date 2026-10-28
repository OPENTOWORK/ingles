# Speaking B2 First Part 1 — primera prueba funcional

Fecha: 28/10/2026  
Alcance: comprobación de principio a fin **sin escrituras** en ENGLISH_PROD.  
Restricciones cumplidas: sin cambios de UI, sin commit, sin deploy, sin SQL, sin abrir Speaking a estudiantes, sin tocar RUOE / Writing / Listening / Parts 2–4.

Leyenda: **PASS** ejecutado y correcto · **FAIL** ejecutado y bloqueado · **PENDING** no se puede cerrar todavía.

---

## Addendum — desbloqueo para la primera entrevista staff (28/10/2026, 08:40)

La recarga de caché quedó autorizada. La entrevista **no se ha iniciado**.

### Recarga PostgREST — PASS
Se ejecutó solo `NOTIFY pgrst, 'reload schema';`. Sin migraciones. Sin cambios de filas.

### Estado PostgREST — PASS
REST ve `speaking_b2_sessions` y el resto. Columnas V2.3 (`row_version`, `evaluation_charged`, `evaluation_in_flight`, `pending_report`) accesibles. Las 8 tablas siguen a **0 filas**.

RLS y permisos intactos: `auth_hash=false`, `auth_state=true`, `svc_hash=true`, `authenticated` no ejecuta claim/consume, `service_role` sí.

### Fallback a memoria — PASS
En ENGLISH_PROD, Vercel y `NODE_ENV=production` ya no se continúa en memoria. `persisted` solo es true si el insert/update guardó. Tests: persistencia 9/9, v23 4/4, UI legacy 5/5.

### SoniaNeural — FAIL en este PC, fallback PASS
Edge `en-GB-SoniaNeural` no responde en 20 s (se cuelga, no es solo lento). No se ha cambiado la voz principal. Timeout de intento: 8 s. Fallback `nova` 200, cabeceras `x-speaking-tts-engine=openai`, `x-speaking-tts-fallback=1`. Log: `[speaking-b2/tts] fallback { from, to, reason, elapsedMs }`. En un móvil la ruta Edge puede funcionar; por eso se mantiene Sonia como primer intento.

### Entrevista staff — PREPARADA, no ejecutada
Hay un proxy HTTPS local en el puerto 3443, solo LAN, con llave `lan` y cookie HttpOnly. Fixtures y eval de desarrollo responden 404 fuera de localhost. No hay POST session/turn/complete. El administrador debe abrir la URL de desbloqueo en el móvil, aceptar el certificado, iniciar sesión y **no** pulsar *Start the interview* hasta autorización. Admin: sin tope diario. No usar cuenta de alumno.

---

## 1. Estado de la conexión

**PASS** — el código local apunta a ENGLISH_PROD (`.env.local`, host `supabase.co`, ref de producción). Service role presente. No se han impreso credenciales.

**PASS** — `npm run speaking:v23-guard` sigue deteniendo pruebas remotas aisladas (`MISSING_TEST_URL`). No hay proyecto de test autorizado.

**FAIL** — PostgREST aún no ve las tablas nuevas. Una lectura REST de `speaking_b2_sessions` / `speaking_b2_quota_charges` responde: *Could not find the table in the schema cache*. Postgres sí las tiene (MCP `list_tables`). El motor no puede persistir ni restaurar por API hasta recargar el caché de esquema.

En desarrollo, si el insert REST falla, `createPersistedSession` cae a memoria local y **no escribe** en producción. No se ha llamado a POST `/api/speaking-b2/session/`.

## 2. Compatibilidad con Supabase

**PASS** — migraciones instaladas hoy:

| Versión | Nombre |
|---|---|
| 20261028072255 | `speaking_b2_motor_v1` |
| 20261028072317 | `speaking_b2_motor_v2` |
| 20261028072332 | `speaking_b2_motor_v21` |
| 20261028072354 | `speaking_b2_motor_v22` |
| 20261028072401 | `speaking_b2_motor_v23` |

**PASS** — ocho tablas `speaking_b2_*` existen y están vacías (0 filas): `exams`, `questions`, `sessions`, `turns`, `assessments`, `issues`, `recommendations`, `quota_charges`.

**PASS** — catálogo `exams` / `questions` con RLS y sin políticas (deny-all). El banco SP-EX001 vive en código, no en esas tablas.

**PASS** — advisors de seguridad: `speaking_b2_exams` y `speaking_b2_questions` aparecen como RLS sin política; es el lockdown V2.3, no un olvido. No se ha listado `speaking_b2_consume_quota` como ejecutable por `anon` / `authenticated`.

**PENDING** — RPCs de consume/claim: creadas por V2.1–V2.3 (verificación previa a esta prueba). No se han invocado. El caché REST puede ocultarlas igual que las tablas.

**PENDING** — bucket `speaking-b2-audio`: confirmado privado en la instalación. No se ha subido ni listado ningún objeto en esta prueba.

## 3. Estado de las APIs

Ejecutado contra `http://localhost:3000` (sin crear sesión):

| Comprobación | Resultado |
|---|---|
| POST `/api/speaking-b2/tts/` texto no autorizado | **PASS** 400 |
| POST `/api/speaking-b2/tts/` línea autorizada SP-EX001 | **PASS** 200 `audio/mpeg` (41–51 KB) |
| GET `/api/speaking-b2/session/` | **PASS** 405 (no hay GET; no escribe) |
| GET `/api/speaking-b2/fixtures/human/` en development | **PASS** 200, `persist:false`, `quotaCharged:false`, 0 samples |
| GET `/exam-practice/b2/exam-speaking/` | **PASS** 200 (rewrite a `/niveles/b2/exam-speaking/`) |
| Tests locales del motor | **PASS** 70/70 |

**PENDING** — POST session / turn / complete / persistencia real: no ejecutados. Escribirían ENGLISH_PROD o, con el caché actual, fallarían el persist.

## 4. Estado del examinador y TTS

**PASS** — el código usa `en-GB-SoniaNeural` con timeout 8 s y fallback OpenAI `nova`. Tests de taxonomía lo fijan.

**PASS (fallback)** — dos síntesis autorizadas devolvieron MP3. El log local: `Edge unavailable, trying OpenAI: TTS timeout`. El examinador **sí habla** por `nova`.

**FAIL (primario en esta máquina)** — Edge `en-GB-SoniaNeural` no respondió a tiempo en las dos llamadas. No se ha oído SoniaNeural en vivo.

**PENDING** — reproducción dentro de la entrevista original (hay que pulsar *Start the interview*; no se ha pulsado).

## 5. Estado de Whisper

**PASS** — el motor transcribe con `OpenAISTTAdapter` / `whisper-1` cuando hay `OPENAI_API_KEY` (presente). Sin clave usaría MOCK; no es el caso local.

**PASS** — tests de import humano, WER y comparación Whisper (fixtures técnicos, no voz humana).

**PENDING** — ninguna grabación humana autorizada. Whisper no se ha ejecutado sobre audio real. `npm run speaking:human-check`: **PENDING**, 0/5, `no_authorized_human_recordings`.

## 6. Estado del evaluador

**PASS** — flujo de complete, cuota check-then-charge, informe pedagógico y text-eval en tests locales (70 tests del lote de esta prueba, incluidos 15 de complete y 6 de text-eval).

**PENDING** — ninguna evaluación de entrevista real ni de audio humano. El informe final no se ha generado fuera de tests.

## 7. Estado del informe final

**PENDING** — no hay sesión COMPLETED, ni `speaking_b2_assessments`, ni informe en la UI.

El camino seguro (sin prod) está preparado: `local/speaking-b2-human/` + `npm run speaking:human-eval` (`persist:false`, `quotaCharged:false`). Sigue vacío.

## 8. Problemas encontrados

1. **Caché de PostgREST** — las tablas V1–V2.3 existen en Postgres y no en el schema cache REST. Bloquea persistencia, restore y, probablemente, RPC vía `supabase-js`.
2. **Edge TTS timeout** — SoniaNeural no contestó en 8 s; el fallback `nova` sí.
3. **PC de desarrollo sin micrófono** — la UI original usa `getUserMedia`. No se puede hacer la entrevista continua en este ordenador.
4. **Banco humano vacío** — 5 ítems en draft, sin audio, sin consentimiento, sin transcripción.
5. **Huésped y URL directa** — el hub muestra *Speaking COMING SOON*; `/exam-practice/b2/exam-speaking/` sigue abriéndose sin login (el gate *Coming soon* exige sesión de estudiante). No se ha cambiado. No se ha pulsado *Start the interview*.
6. **No hay SoniaNeural oída** — solo MP3 de fallback.

Nada de esto ha escrito en ENGLISH_PROD. Las ocho tablas siguen a 0 filas.

## 9. Pruebas ejecutadas realmente

- Listado de migraciones y tablas (solo lectura MCP).
- Advisors de seguridad (solo lectura).
- Probe REST de columnas V2 (SELECT `limit 1`; falló por schema cache; 0 filas tocadas).
- 70 tests unitarios del motor (legacy UI, taxonomía TTS, complete, persistencia, humano, v23, text-eval, parent-start, session-auth, audio-flow).
- `speaking:human-check` y catálogo local `/api/speaking-b2/fixtures/human/`.
- TTS autorizado e no autorizado.
- Navegación real: `/exam-practice/b2/exam-speaking/` (Part 1 motor + *Start the interview*), pestaña Part 2 (sesión original Long turn), hub B2 (*Speaking COMING SOON*), exam mode (sin exámenes para invitado; Speaking sigue en `STUDENT_EXAM_MODE_BLOCKED_SECTION_KEYS`).

No ejecutado: POST session, PATCH audio-check, POST turn, POST complete, upload al bucket, consume RPC, SQL, entrevista, Whisper humano.

## 10. Pruebas pendientes de audio humano

**PENDING 0/5.** Archivos esperados (gitignored):

| id | Pregunta | Archivo |
|---|---|---|
| `hum-v19-q01` | What do you enjoy most about studying English? | `local/speaking-b2-human/originals/hum-v19-q01.m4a` |
| `hum-v19-q02` | How do you usually spend your weekends? | `hum-v19-q02.m4a` |
| `hum-v19-q03` | Do you prefer visiting new places or returning to places you know? Why? | `hum-v19-q03.m4a` |
| `hum-v19-q04` | How has technology changed the way you communicate with your friends? | `hum-v19-q04.m4a` |
| `hum-v19-q05` | Is there a new skill you would like to learn in the future? | `hum-v19-q05.m4a` |

Tarjeta: `docs/speaking-motor-v1.9-recording-card.md`.  
Consentimiento en `manifest.json`: `granted`, `purpose`, `consentRef`, `humanTranscript` literal.  
Luego: `npm run speaking:human-check` → `SPEAKING_B2_HUMAN_STT=1 npm run speaking:human-eval`.

Cinco tomas aisladas **no** son una entrevista oral continua. El audio sintético de los tests no cuenta como validación humana.

## 11. Qué falta para una entrevista completa

1. Recargar el schema cache de PostgREST en ENGLISH_PROD (`NOTIFY pgrst, 'reload schema'` o equivalente del Dashboard). Es SQL de catálogo, no de datos. **No se ha ejecutado.**
2. Autorización específica para **una** entrevista staff (ver abajo).
3. Usuario staff expresamente autorizado, no un alumno. Admin: sin tope diario. Otro staff: 1 de 3 `exam_speaking_feedback` del día.
4. Dispositivo **con micrófono** (móvil) abriendo la UI original. Este PC no sirve para la entrevista continua.
5. Si el móvil usa el `npm run dev` local: URL alcanzable en la LAN y contexto seguro para el micrófono. No hay deploy.
6. Completar audio-check → 5 preguntas SP-EX001 → transcripción → complete → informe.
7. En paralelo, las 5 grabaciones autorizadas para Whisper/eval sin persistir.

### Parada obligatoria — escritura en ENGLISH_PROD

No se ha creado sesión. Si se autoriza **una** entrevista staff en la UI original, el impacto previsto es:

| Tabla / recurso | Operación | Cantidad prevista |
|---|---|---|
| `speaking_b2_sessions` | INSERT + UPDATE | 1 fila |
| `speaking_b2_turns` | INSERT | ~12 (intro, 5 preguntas, 5 respuestas, cierre) |
| `speaking_b2_assessments` | INSERT | 1 |
| `speaking_b2_issues` / `recommendations` | INSERT | las que genere el evaluador |
| `speaking_b2_quota_charges` | INSERT + UPDATE a `consumed` o `failed` | 1 |
| `storage.objects` bucket `speaking-b2-audio` | posible upload | clips de esa sesión |
| `ai_usage_daily_limits` | +1 `exam_speaking_feedback` si el staff no es admin | 1 |
| `plan_usage_counters` | **no** si es staff; **sí** `speaking_correction` si se usara un alumno | 0 previsto |

Riesgos: fila huérfana si se aborta; audio privado de staff; tope diario de staff; si se usara un alumno, consumo de cuota comercial. No se borraría nada de otros usuarios. No se tocarían planes.

Hasta que no haya autorización explícita para (a) recargar el schema cache y (b) esa única entrevista staff, no se pulsa *Start the interview* ni se llama a session/complete.

---

## Resumen

| Área | Estado |
|---|---|
| Conexión local → ENGLISH_PROD | PASS |
| Tablas V1–V2.3 en Postgres | PASS |
| Caché REST / persistencia API | FAIL |
| APIs TTS / human catalog / UI | PASS |
| Examinador SoniaNeural en vivo | FAIL (timeout) |
| Fallback TTS `nova` | PASS |
| Whisper con clave | PASS (cableado) |
| Whisper sobre voz humana | PENDING 0/5 |
| Evaluador / informe real | PENDING |
| UI original Part 1 motor | PASS |
| Parts 2–4 intactas | PASS |
| Speaking bloqueado en hub | PASS |
| Exam mode Speaking bloqueado en código | PASS |
| Escrituras en ENGLISH_PROD | ninguna |
