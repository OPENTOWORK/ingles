# DRALO Speaking Motor V2.0 — persistencia, cuotas y estabilidad

Fecha: 2026-10-27. Trabajo local. Sin commit, sin deploy, sin SQL en producción.

La interfaz pública `/exam-practice/b2/exam-speaking/` no se ha modificado. Parts 2–4, hub B2, exam mode, RUOE, Writing, Listening y las reglas comerciales de planes no se han tocado.

Esta fase no valida el motor en producción. Las pruebas son locales, con mocks o con un almacén compartido en memoria que **simula** dos procesos. No sustituyen PostgreSQL real.

## 1. Hallazgos de la auditoría: confirmados o descartados

Se contrastaron los cinco hallazgos contra el código de V1.9 **antes** de cambiar nada.

| # | Hallazgo | Veredicto | Dónde |
|---|---|---|---|
| 1 | Las sesiones se recuperan de memoria / JSON temporal | **Confirmado** | `session-store.js`: `getMemorySession` leía `Map` + `os.tmpdir()/dralo-speaking-b2-sessions.json`. Las APIs `session`, `turn` y `complete` no cargaban Supabase. |
| 2 | Escrituras a Supabase sin comprobar error | **Confirmado** | `updatePersistedSession` tenía `catch { /* ignore */ }`. `persistSpeakingB2Turns` y `persistAssessmentAndIssues` devolvían `{ persisted: false }` sin fallar la petición. |
| 3 | La cuota no es transaccional entre instancias | **Confirmado** | `evaluationInFlight` vivía solo en el objeto de sesión. `consumePlanUsage` hace CAS del contador global, pero dos completes de **la misma sesión** en dos procesos podían cobrar dos veces. |
| 4 | Turnos con DELETE + INSERT | **Confirmado** | `persistSpeakingB2Turns`: `delete().eq('session_id')` y luego `insert`. Si el insert fallaba, se perdían los turnos. |
| 5 | Incidencia sin `questionId` cae en el primer turno | **Confirmado** | `rubric-engine.js`: `paired.find(...) \|\| paired[0]`. |

No se ha descartado ninguno de los cinco. Sí existían protecciones parciales que se conservan:

- En runtime publicado, `createPersistedSession` ya exigía Supabase y no caía al JSON.
- `speaking_b2_assessments.session_id` ya era único.
- `consumePlanUsage` ya usa compare-and-swap sobre `plan_usage_counters` (límite de plan, no idempotencia por sesión).
- El flujo complete ya tenía `pendingReport` y no cobraba si fallaba el evaluador (en un solo proceso).

## 2. Problemas corregidos

- Recuperación de sesión desde Supabase (fila + turnos + assessment).
- En producción/Vercel el JSON temporal no se consulta.
- Si Supabase falla en runtime publicado: error controlado `STORE_UNAVAILABLE` (503), no fallback silencioso.
- Actualización condicional por `row_version` (`STORE_CONFLICT` si otro proceso ganó).
- Bloqueo de evaluación atómico (`evaluation_in_flight` + caducidad 2 min).
- Turnos por UPSERT `(session_id, turn_index)` sin borrar la sesión.
- No se sobrescribe una respuesta válida con un reintento vacío o más pobre.
- Una evaluación cobra como máximo una unidad: candado de sesión + fila única `speaking_b2_quota_charges` + `speaking_correction` existente.
- Informe pendiente se persiste **antes** del cobro; un reinicio puede recuperar y cobrar una sola vez.
- Las incidencias se atan por `questionId` válido o por excerpt único. Si no hay seguridad: `review_required` sin inventar la primera pregunta.

## 3. Archivos modificados

Nuevos:

- `src/features/speaking-b2-motor/services/session-persistence.js`
- `src/features/speaking-b2-motor/__tests__/multi-instance.test.js`
- `scripts/speaking_b2_motor_v2.sql`
- `docs/speaking-motor-v2.0-report.md`

Modificados:

- `src/features/speaking-b2-motor/services/session-store.js`
- `src/features/speaking-b2-motor/services/evaluation/complete-flow.js`
- `src/features/speaking-b2-motor/services/evaluation/rubric-engine.js`
- `src/features/speaking-b2-motor/services/evaluation/pedagogy-es.js`
- `src/features/speaking-b2-motor/domain/issue-validator.js`
- `src/app/api/speaking-b2/session/route.js`
- `src/app/api/speaking-b2/turn/route.js`
- `src/app/api/speaking-b2/complete/route.js`
- `src/features/speaking-b2-motor/__tests__/persistence.test.js`
- `src/features/speaking-b2-motor/__tests__/complete-flow.test.js`
- `src/features/speaking-b2-motor/__tests__/issue-validator.test.js`
- `scripts/speaking_b2_motor.sql` (solo un comentario que apunta a V2)

No modificados: `B2SpeakingExamPractice.js`, hub, exam mode, `planAccess.js`, `quota.js` (sigue usando `speaking_correction` / `exam_speaking_feedback`).

## 4. Arquitectura de persistencia resultante

```
API (session / turn / complete)
        │
        ▼
loadSpeakingB2Session(id)
        │
        ├─ publicado (NODE_ENV=production o VERCEL=1)
        │     Supabase obligatorio → sessions + turns + assessments
        │     Si falta admin o falla la lectura → STORE_UNAVAILABLE
        │     El JSON temporal no se abre
        │
        └─ local
              memoria / JSON de desarrollo
              Supabase opcional si la sesión ya está persisted
```

Campos de sesión que ahora viajan en columnas (V2 SQL) y también en `metadata` por compatibilidad:

- estado, versión, candado de evaluación, cobro, `pending_report`, `report`
- índice de pregunta, `currentQuestionId`, fixture, flags de vuelo

Los turnos viven en `speaking_b2_turns`. El informe cobrado vive en `speaking_b2_assessments` (único por sesión) y en `report`.

## 5. Consistencia entre instancias

No se usa un `Map` en memoria como garantía entre servidores.

1. Cada escritura incrementa `row_version` y exige la versión leída.
2. `claimSpeakingB2Evaluation` hace `UPDATE … WHERE evaluation_charged = false AND (in_flight = false OR lock caducado) AND state IN ('FINISHING','PROCESSING')`.
3. Solo la fila devuelta gana el complete.
4. SQL preparado: `public.speaking_b2_claim_evaluation(uuid)` (service_role). El runtime JS hace el mismo `UPDATE` condicional por si el RPC aún no está aplicado.

Hasta aplicar `speaking_b2_motor_v2.sql`, las columnas nuevas no existen. El código reintenta el payload legacy y el candado vuelve a ser el de memoria. **Eso no es garantía multiinstancia.** Está documentado; no se declara validado en producción.

## 6. Idempotencia de cuotas

No hay un sistema paralelo de planes. Sigue `checkPlanUsage` / `runAiPreflight` → `consumePlanUsage` → `plan_usage_counters` con la clave `speaking_correction`.

La novedad es un **libro por sesión**:

1. Insertar `speaking_b2_quota_charges (session_id PK, status='claimed')`.
2. Si `23505`, esa sesión ya se cobró o está en cobro: no se vuelve a llamar a `consumePlanUsage`.
3. Cobrar con el sistema existente.
4. Si el cobro falla: borrar la fila `claimed` (el siguiente reintento puede cobrar).
5. Si el cobro ok: `status='consumed'`.

Escenarios (mocks locales):

| Escenario | Resultado del test |
|---|---|
| Evaluación correcta | 1 check + 1 charge |
| Fallo del evaluador | solo check |
| 2 llamadas simultáneas | 200 + 409, 1 charge |
| 5 llamadas simultáneas | 1 × 200 + 4 × 409, 1 charge |
| Reintento tras timeout / pending | 1 charge y reuse después |
| Reinicio entre eval y cobro | `pendingReport` sobrevive; 1 charge |
| Fallo de persistencia | no cobra |
| Informe pendiente de confirmar | recovery + 1 charge |
| Cupo insuficiente | 429, no cobra |
| Dos “instancias” (claim compartido) | 200 + 409, 1 charge |

El CAS de `plan_usage_counters` sigue protegiendo el techo del plan. El libro de sesión evita el doble cobro de **la misma entrevista**.

## 7. Protección de turnos

- Ya no hay `DELETE FROM speaking_b2_turns WHERE session_id = …`.
- Escritura: `planSpeakingB2TurnWrites` → upsert `(session_id, turn_index)`.
- Si el destino ya tiene transcripción y el reintento llega vacío o mucho más corto, se descarta.
- Se conserva `audio_path` si el reintento no trae audio.
- Los turnos de más que ya estén en base no se borran (un proceso atrasado no limpia al otro).

## 8. Asociación de incidencias

`bindSpeakingB2IssueToTurn` / `attachSpeakingB2IssuesToTurns`:

1. Si `questionId` existe en los turnos y el excerpt (o un código de discurso) encaja: se usa ese turno.
2. Si el id es falso o falta, se busca el excerpt en las respuestas. Un único match → ese turno.
3. Dos respuestas con el mismo fragmento → `review_required`, sin `questionId`.
4. Sin match → `review_required`, sin asignar la primera pregunta.
5. No se inventan marcas temporales.

El fallback `|| paired[0]` se ha eliminado del evaluador. La pedagogía vuelve a atar las incidencias del modelo a los turnos reales.

## 9. Cambios SQL pendientes de aplicar

Archivo: `scripts/speaking_b2_motor_v2.sql`. **No aplicado.** Solo revisión local.

- Columnas de sesión: `row_version`, `evaluation_charged`, `evaluation_in_flight`, `evaluation_lock_at`, `pending_report`, `report`
- `speaking_b2_turns.turn_index` + único `(session_id, turn_index)`
- Único `(session_id, sort_order)` en recomendaciones
- Tabla `speaking_b2_quota_charges` (RLS select propio; insert/update/delete revocados a `anon`/`authenticated`)
- Función `public.speaking_b2_claim_evaluation(uuid)`:
  - `SECURITY DEFINER`, `search_path` fijado
  - `REVOKE` a `public`, `anon`, `authenticated`
  - `GRANT EXECUTE` solo a `service_role`
  - No lee `user_metadata`. La API sigue exigiendo el token de sesión antes de usarla.

Storage privado del bucket `speaking-b2-audio` no cambia (sigue sin políticas públicas).

## 10. Tests ejecutados y resultados

Comando local:

```
node --loader ./scripts/alias-loader.mjs --test src/features/speaking-b2-motor/__tests__/*.test.js
```

**97 tests, 15 suites, 0 fallos.** Incluye el test de UI original (`legacy-ui-regression`).

Son tests de Node con mocks. No se ha ejecutado PostgreSQL, no se ha cobrado cuota real, no se ha llamado a Whisper ni al LLM.

## 11. Qué queda sin verificar

- Aplicar y probar `speaking_b2_motor_v2.sql` en un proyecto Supabase no productivo.
- Dos instancias Next reales (dos procesos / dos regiones) contra la misma base.
- Carrera real de `consumePlanUsage` + `speaking_b2_quota_charges` con service role.
- Recuperación tras un reinicio de Vercel con filas V2 ya migradas.
- Audio humano (V1.8–V1.9 siguen PENDING).
- Calibración oficial de Cambridge.

## 12. Riesgos antes del despliegue

1. Desplegar el código V2 **sin** el SQL V2 deja el candado y el upsert de turnos en modo legacy. El JSON temporal ya no se usa en producción, pero la concurrencia entre instancias **no está garantizada** hasta migrar.
2. El upsert de turnos exige el índice único `(session_id, turn_index)`. Sin él, se insertan solo filas nuevas.
3. `pending_report` / `report` en jsonb pueden ser grandes. Conviene vigilar el tamaño de fila.
4. Si el proceso muere **después** de insertar `quota_charges` como `claimed` y **antes** de `consumePlanUsage`, el siguiente reintento no volverá a cobrar (el alumno no pierde cupo; DRALO no registra el uso). Es preferible al doble cobro.
5. Speaking sigue bloqueado para alumnos en exam mode. Esta fase no lo publica.

No se ha validado en producción.
