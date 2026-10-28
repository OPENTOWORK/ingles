# DRALO Speaking Motor V2.2 — validación integrada de cuotas, seguridad y multiinstancia

Fecha: 2026-10-27. Trabajo local. Sin commit, sin deploy, sin SQL en producción.

Alcance: Cambridge B2 First Part 1 (SP-EX001). La interfaz `/exam-practice/b2/exam-speaking/` no se ha modificado. Parts 2–4, cabecera, botones, navegación, RUOE, Writing, Listening, planes, hub y exam mode no se han tocado. Rúbricas, prompts, taxonomía y banco no se han cambiado. `planAccess.js` y los números comerciales permanecen iguales.

No se han usado datos de alumnos ni credenciales de producción.

## 1. Diferencias detectadas entre la función SQL y el sistema original de cuotas

`consumePlanUsage` / `checkPlanUsage` / `checkDailyAiLimit` son el mecanismo comercial vivo. La función V2.1 copiaba el incremento de `plan_usage_counters` y no el resto de reglas.

| Regla comercial | Sistema original | SQL V2.1 | Hueco |
|---|---|---|---|
| Identidad | Exige `userId`; el contador es por usuario | Comprobaba dueño de sesión, no `AUTH_REQUIRED` si faltaba usuario | Parcial |
| Plan activo | `shouldApplyPlanUsageLimits` + `resolveUserPlanSlug` + límite del plan | El límite llegaba ya resuelto desde JS | Correcto si JS no se salta |
| Límite ≤ 0 | `PLAN_FEATURE_LOCKED` | `PLAN_LIMIT_REACHED` | Código incorrecto |
| Cupo lleno | `PLAN_LIMIT_REACHED` y `used` actual | `PLAN_LIMIT_REACHED` a veces sin `used` | Parcial |
| Periodo | `period_type` + `period_key` UTC (mes para Speaking) | Mismos argumentos | OK |
| Cupo Speaking alumno | `speaking_correction` / mes | Solo este camino | OK para alumnos |
| Staff no admin | `exam_speaking_feedback`, 3/día, `ai_usage_daily_limits` | No incrementaba el diario | **Hueco real** |
| Admin / staff exento | Sin incremento | `p_limit` nulo no incrementaba | OK |
| Restricciones | Rol estudiante vs staff; admin por email | Delegadas a JS | OK si no se llama el RPC a mano |
| Consumo previo | CAS `count` / `id` | `count < limit` en `ON CONFLICT` | Equivalente |
| Idempotencia por sesión | No existe en `consumePlanUsage` | `evaluation_charged` + fila `consumed` | Extra de Speaking, necesario |
| Informe obligatorio | No aplica | `NO_REPORT` | Extra de Speaking, necesario |

Copiar solo el `INSERT … count + 1` no bastaba: el staff podía completar Speaking sin tope diario atómico, y un plan bloqueado devolvía el código equivocado.

## 2. Correcciones realizadas

Sin cambiar reglas comerciales. Los números (cupo mensual de plan, 3/día staff, exención admin) siguen saliendo de `checkPlanUsage` y `checkDailyAiLimit`.

- `speaking_b2_consume_session_quota` (9 argumentos): plan y/o diario en **una** transacción.
- `p_limit <= 0` → `PLAN_FEATURE_LOCKED`.
- `PLAN_LIMIT_REACHED` y `DAILY_LIMIT_REACHED` devuelven `used`.
- Staff: incrementa `ai_usage_daily_limits` (`exam_speaking_feedback`) con `count < p_daily_limit`.
- Admin / plan ilimitado: ambos límites nulos → marca cobrado, `consumed: false`, sin contadores.
- `AUTH_REQUIRED` si no hay usuario; `FORBIDDEN` si la sesión es de otro.
- `resolveSpeakingB2QuotaChargeArgs` elige el camino comercial; `complete/route.js` ya no llama `consumePlanUsage` ni `consumeDailyAiLimit`.
- Índice único `(user_id, action, usage_date)` para el `ON CONFLICT` diario (la tabla de producto ya lo declara).

No se han añadido límites nuevos ni se ha cambiado el acceso del staff.

## 3. Resultados de pruebas multiinstancia

**Qué se ha hecho:** dos procesos Node.js independientes (`child_process.spawn`) contra una PostgreSQL local compartida (`speaking_b2_itest_proc`). Cada proceso tiene su conexión y su PID.

**Qué no se ha hecho:** no se han levantado dos servidores Next.js. `npm run dev` posee `.next`; un segundo `next dev` no sería una prueba limpia. Tampoco es una simulación en memoria (`Map`).

| Prueba | Resultado |
|---|---|
| Dos procesos consumen la misma sesión | 1 `consumed` + 1 `already`; contador = 1 |
| Proceso A solo hace `claim`; proceso B consume y lee | Informe recuperable; `evaluation_charged`; un solo cobro |
| Dos procesos sobre el cupo diario staff | 1 incremento; `plan_usage_counters` = 0 |

Clientes concurrentes en `pg-integration` (misma base, conexiones distintas) confirman lo mismo para 2 y 5 consumes de alumno.

## 4. Resultados RLS y Storage

Entorno aislado local (`speaking_b2_itest_rls`). No es Supabase Cloud. `auth.uid()` se simula con `request.jwt.claim.sub`. Tablas `storage.buckets` / `storage.objects` son stand-in.

| Comprobación | Resultado |
|---|---|
| Dueño lee su sesión | OK |
| Otro `auth.uid()` no ve la sesión | 0 filas |
| Rol autenticado no puede UPDATE/INSERT | `permission denied` |
| Bucket `speaking-b2-audio` | `public = false` |
| Sin políticas en `storage.objects` | El tester no lista grabaciones |
| SQL V1: revoke write + sin políticas públicas de storage | Revisado en fuente |
| URLs firmadas | Código: `createSignedUrl` 3600 s vía `service_role`. No se ha llamado a Storage remoto |
| Conservación / borrado | No hay `.remove()`. Las grabaciones se conservan. Sin job de retención |

Autenticación de API (token de sesión + usuario Supabase) no se ha cambiado. El RPC sigue siendo `service_role` only.

## 5. Estado de las migraciones

Orden previsto:

1. `scripts/speaking_b2_motor.sql` (V1)
2. `scripts/speaking_b2_motor_v2.sql` (V2)
3. `scripts/speaking_b2_motor_v21.sql` (V2.1)
4. `scripts/speaking_b2_motor_v22.sql` (V2.2)

**No aplicadas en producción, ni en staging remoto, ni sobre datos reales.**

En local se aplicó el esquema aislado aplanado + seguridad stub + V2.2 (dos veces, sin error). No se ha ejecutado la cadena V1→V2→V2.1→V2.2 sobre un proyecto Supabase: V1 espera roles `anon`/`authenticated`/`service_role` y `storage` real.

`GRANT` a `service_role` no se ejecuta en el Postgres local (ese rol no existe fuera de Supabase). El SQL de producto lo mantiene.

## 6. Tests ejecutados

```
node --loader ./scripts/alias-loader.mjs --test src/features/speaking-b2-motor/__tests__/*.test.js
```

**129 tests, 20 suites, 0 fallos, 0 omitidos.**

Suites nuevas o ampliadas:

- `quota-parity.test.js` — paridad con `consumePlanUsage` / cupo staff
- `pg-integration.test.js` — `PLAN_FEATURE_LOCKED`, identidad, diario staff, exención
- `two-process.test.js` — dos procesos OS + PostgreSQL
- `rls-storage.test.js` — RLS stub y bucket privado
- `complete-flow.test.js` — `finalize` frente a `consumePlanUsage`
- `legacy-ui-regression` — UI original intacta

Base usada: `127.0.0.1` / `postgres` / `speaking_b2_itest*`. Nunca `DATABASE_URL` de producción.

## 7. Problemas pendientes

1. No hay dos instancias Next reales ni un proyecto Supabase de staging remoto.
2. Las URLs firmadas y el upload no se han ejercido contra Storage Cloud.
3. No hay borrado automático de audio; hay que decidir retención antes de abrir a alumnos.
4. Aplicar V1→V2.2 en un proyecto Supabase vacío de prueba (no prod) sigue pendiente.
5. Audio humano y calibración Cambridge siguen PENDING.
6. Speaking sigue bloqueado para alumnos. Publicado sin SQL V2.2 deja el complete en 503 (fail-closed).

## 8. Condiciones necesarias antes de desplegar

1. Proyecto Supabase de **prueba**, no producción, con migraciones V1→V2→V2.1→V2.2 aplicadas por una persona autorizada.
2. Bucket privado `speaking-b2-audio` creado; sin políticas públicas; `service_role` sube y firma.
3. Confirmar que `ai_usage_daily_limits` tiene `UNIQUE (user_id, action, usage_date)` (el SQL de producto ya lo declara).
4. Variables de servicio locales/staging, nunca las de producción, en esa prueba.
5. Recorrer complete con un usuario staff de prueba (tope 3/día) y un alumno de prueba (cupo mensual), sin datos reales.
6. Segunda instancia de la app (otro proceso/host) contra la misma base de prueba: complete + recover.
7. Política de retención de audio acordada.
8. No abrir Speaking a alumnos ni activar exam mode hasta esa prueba remota.

No validado en producción. No publicar.
