# Speaking B2 — revisión de instalación SQL (V2.3)

Fecha del paquete: 2026-10-28 (correcciones post-auditoría).  
Proyecto previsto: ENGLISH_PROD (`qnazrzvwvkwhkfbqsbmr`).  
**Este documento no autoriza la instalación.** No se ha ejecutado SQL. No se ha modificado producción.

Speaking debe seguir oculto y bloqueado para alumnos aunque se instalen las tablas.

Paquete posterior a la segunda auditoría: V2 admite `failed` desde la creación del libro; V1/V2.3 revocan `SELECT` sobre `access_token_hash` a clientes; V2.3 no toca índices de tablas compartidas. V2.2 escribe `failed` en todos los errores de cuota. No cambian reglas comerciales.

## 1. Estado y finalidad de cada migración

| Orden | Archivo | Versión | Finalidad | ¿Idempotente? |
|---|---|---|---|---|
| 1 | `migrations/speaking_b2_motor.sql` | V1 | Tablas del motor Part 1, RLS de lectura propia, bucket `speaking-b2-audio` | Parcial (`IF NOT EXISTS` + `DROP POLICY IF EXISTS`). El `INSERT` del bucket hace `ON CONFLICT DO UPDATE`. |
| 2 | `migrations/speaking_b2_motor_v2.sql` | V2 | `row_version`, candado de evaluación, `turn_index`, libro `speaking_b2_quota_charges` con CHECK `claimed\|reserved\|consumed\|released\|failed`, RPC `speaking_b2_claim_evaluation` | Columnas `IF NOT EXISTS`. El CHECK se vuelve a aplicar por nombre. |
| 3 | `migrations/speaking_b2_motor_v21.sql` | V2.1 | Reafirma el mismo CHECK; RPC de 6 argumentos que incrementa `plan_usage_counters` en la misma transacción | `CREATE OR REPLACE` + `DROP CONSTRAINT IF EXISTS`. |
| 4 | `migrations/speaking_b2_motor_v22.sql` | V2.2 | RPC de 9 argumentos: comprueba plan y diario **antes** de incrementar cualquiera; errores de cuota dejan `failed` | `DROP FUNCTION` de 6 args + `CREATE OR REPLACE` de 9 args. **No** crea índice extra en `ai_usage_daily_limits`. |
| 5 | `migrations/speaking_b2_motor_v23.sql` | V2.3 | Cierra lectura pública del banco; revoca `access_token_hash` a clientes; reafirma `REVOKE` de las RPC | Idempotente. **No** hace `DROP INDEX` sobre tablas compartidas. |

Cabeceras originales: «LOCAL / STAGING REVIEW ONLY. Do not apply to production without explicit authorisation.»

No hay triggers nuevos sobre tablas Speaking. No hay extensiones `CREATE EXTENSION`.

Scripts locales **excluidos** de este ZIP (no aplicar en ENGLISH_PROD):

- `scripts/speaking_b2_itest_schema.sql` — esquema aplanado para Postgres local.
- `scripts/speaking_b2_itest_security.sql` — stub de `auth.uid()` y rol de prueba con contraseña. No es SQL de producto.

## 2. Orden exacto

```
speaking_b2_motor.sql
  → speaking_b2_motor_v2.sql
    → speaking_b2_motor_v21.sql
      → speaking_b2_motor_v22.sql
        → speaking_b2_motor_v23.sql
```

No saltar versiones. V2.2 hace `DROP FUNCTION` de la firma de 6 argumentos creada en V2.1; si se aplica V2.2 sin V2.1, el `DROP` no falla, pero faltan tablas/columnas (`evaluation_charged`, `pending_report`, `speaking_b2_quota_charges`).

Cada archivo va en `BEGIN` / `COMMIT`. Un error hace rollback **de ese archivo**, no de los anteriores.

## 3. Dependencias previas

Deben existir **antes** de V1/V2.2. Este paquete no las crea. ChatGPT indicó que las dos tablas de cuota ya están en ENGLISH_PROD; hay que **verificarlo** con las consultas de la sección 8, no darlo por sentado en el momento de instalar.

| Dependencia | Dónde se usa | Si falta |
|---|---|---|
| `public."Usuarios_y_Perfil_users"(id)` | V1: FK de `speaking_b2_sessions.user_id` y `speaking_b2_assessments.user_id` `ON DELETE CASCADE` | V1 falla al crear las tablas. |
| `auth.uid()` | Políticas RLS V1/V2 | En Supabase existe. Fuera de Supabase las políticas no tienen sentido. |
| `auth.users(id)` | No hay FK directa desde tablas `speaking_b2_*`. Sí la tienen `plan_usage_counters` y `ai_usage_daily_limits`. El RPC escribe esos `user_id`. | El consume fallará en runtime si el UUID no está en `auth.users`. |
| `public.plan_usage_counters` | V2.1/V2.2: `INSERT … ON CONFLICT (user_id, usage_key, period_type, period_key)` | El RPC no se puede crear si la tabla no existe; si existe sin ese UNIQUE, el `ON CONFLICT` falla en runtime. |
| `public.ai_usage_daily_limits` | V2.2: `ON CONFLICT (user_id, action, usage_date)` usando el UNIQUE **ya existente**. V2.3 no altera índices de esta tabla. | El RPC falla en runtime si falta el UNIQUE de producto. |
| `storage.buckets` / `storage.objects` | V1: inserta/actualiza el bucket; `DROP POLICY` de dos nombres concretos | V1 falla si no hay esquema `storage` (no es el caso de Supabase). |
| `gen_random_uuid()` | Defaults de UUID | En Postgres 17 / Supabase suele existir. |
| Roles `anon`, `authenticated`, `service_role` | GRANT/REVOKE | En Supabase existen. |

Esquema de producto ya desplegado (solo referencia, **no reaplicar** como parte de Speaking):

- `dependencies/plan_usage_counters.sql`
- `dependencies/ai_usage_system.sql` (incluye `ai_usage_daily_limits` con `UNIQUE (user_id, action, usage_date)`)

El motor de cuotas comercial (`consumePlanUsage`, límites de plan, 3/día staff) vive en la aplicación. El SQL **no cambia** esos números; el RPC recibe `p_limit` / `p_daily_limit` ya resueltos.

Tabla vecina, nombre distinto: `public.speaking_respuestas` (Speaking antiguo). No se altera. No hay colisión de nombre con `speaking_b2_*`.

## 4. Objetos de Supabase afectados

### 4.1 Tablas nuevas (V1 / V2)

`speaking_b2_exams`, `speaking_b2_questions`, `speaking_b2_sessions`, `speaking_b2_turns`, `speaking_b2_assessments`, `speaking_b2_issues`, `speaking_b2_recommendations`, `speaking_b2_quota_charges` (V2).

### 4.2 Tablas existentes modificadas

| Tabla | Cambio | ¿Datos? |
|---|---|---|
| `speaking_b2_sessions` | V2 añade columnas | Vacía si V1 acaba de crearse. |
| `speaking_b2_turns` | V2 añade `turn_index` y hace `UPDATE` para numerar | Vacía en la primera instalación. |
| `speaking_b2_quota_charges` | V2 crea el CHECK con `failed`. V2.1 lo reafirma. | Vacía en la primera instalación. |
| `plan_usage_counters` | **Ningún DDL** en V1–V2.3. El RPC escribe filas **cuando se cobra** una sesión. | Riesgo de runtime, no de migración. |
| `ai_usage_daily_limits` | **Ningún DDL**. V2.2/V2.3 no crean ni borran índices compartidos. | No se toca el UNIQUE de producto. |
| `storage.buckets` | V1: `INSERT … ON CONFLICT (id) DO UPDATE` del bucket `speaking-b2-audio` | Crea el bucket o lo actualiza (`public=false`, 15 MB, MIME). |

No se tocan tablas de RUOE, Writing, Listening, `suscripciones`, ni `speaking_respuestas`.

### 4.3 Columnas añadidas (V2)

En `speaking_b2_sessions`: `row_version`, `evaluation_charged`, `evaluation_in_flight`, `evaluation_lock_at`, `pending_report`, `report`.  
En `speaking_b2_turns`: `turn_index`.

### 4.4 Índices y restricciones

- V1: PK/FK/CHECK, `idx_speaking_b2_questions_exam`, `idx_speaking_b2_sessions_user`, `idx_speaking_b2_turns_session`, `idx_speaking_b2_issues_session`.
- V2: `speaking_b2_turns_session_index_uidx`, `speaking_b2_recommendations_session_order_uidx`, `speaking_b2_quota_charges_user_idx`.
- V2: CHECK `speaking_b2_quota_charges_status_check` (`claimed|reserved|consumed|released|failed`). V2.1 lo vuelve a dejar igual.
- V2.2 / V2.3: ningún índice nuevo ni `DROP INDEX` sobre tablas compartidas.

### 4.5 Funciones RPC (`SECURITY DEFINER`)

| Función | Firma | Privilegios |
|---|---|---|
| `speaking_b2_claim_evaluation` | `(uuid)` | `search_path = public, pg_temp`. `REVOKE` public/anon/authenticated. `GRANT EXECUTE` a `service_role`. |
| `speaking_b2_consume_session_quota` | V2.1: 6 args; V2.2 la elimina y deja 9 args | Igual: solo `service_role`. |

Ambas están en el esquema `public` (PostgREST las vería si hubiera `EXECUTE` para `authenticated`; el SQL lo revoca).

`claim_evaluation` **no comprueba** `auth.uid()` ni el dueño. Confía en que solo `service_role` la llama y en que la API ya autorizó el token de sesión.

`consume_session_quota` (V2.2) exige `p_user_id`, compara con `sess.user_id` y bloquea la sesión (`FOR UPDATE`). Comprueba hueco en plan y diario **antes** de incrementar. Si el segundo incremento fallara de forma inesperada, lanza `SPEAKING_B2_CONSUME_ABORTED` (`40001`) para revertir el primero. Un `RETURN` con `DAILY_LIMIT_REACHED` ya no deja el mensual incrementado.

### 4.6 Triggers

Ninguno nuevo en tablas `speaking_b2_*`.  
Al escribir `plan_usage_counters`, el trigger ya existente `plan_usage_counters_set_updated_at` puede dispararse. No se redefine en estas migraciones.

### 4.7 RLS (tablas nuevas)

Lectura:

- exámenes/preguntas: **sin** política SELECT y `REVOKE ALL` a `anon`/`authenticated`. El banco SP-EX001 lo sirve el código / `service_role`. Estudiantes e invitados no leen el catálogo por PostgREST.
- sesiones/turnos/informes/issues/recomendaciones/charges: `authenticated` y `user_id = auth.uid()` (o sesión del dueño).

Escritura cliente: `REVOKE INSERT, UPDATE, DELETE` a `anon`/`authenticated` en las tablas de intento. El cliente no puede crear sesiones ni turnos por PostgREST.

No hay políticas de INSERT/UPDATE para `authenticated` en tablas Speaking.

### 4.8 GRANT / REVOKE

Solo objetos `speaking_b2_*` y las dos funciones. **No** hay `GRANT`/`REVOKE` sobre `plan_usage_counters`, `ai_usage_daily_limits`, `auth` ni tablas de otros módulos.

`authenticated` no recibe `SELECT` de tabla sobre `speaking_b2_sessions`. Un `GRANT SELECT` de tabla cubriría todas las columnas y anularía un `REVOKE` de columna. V1/V2/V2.3 revocan el privilegio de tabla y conceden, columna a columna, todo excepto `access_token_hash`. `service_role` conserva `SELECT` de tabla, incluido el hash, para persistencia y recuperación de sesión en las APIs internas. No hay vistas ni RPC ejecutables por `authenticated` que lo devuelvan.

### 4.9 Transiciones de `speaking_b2_quota_charges.status`

| Desde | Evento | Hasta | Contadores |
|---|---|---|---|
| (sin fila) | `PLAN_FEATURE_LOCKED`, `PLAN_LIMIT_REACHED`, `DAILY_LIMIT_REACHED`, `LIMIT_CHECK_FAILED` | `failed` | no incrementan |
| `failed` / `released` | consume con hueco | `consumed` | +1 en las claves pasadas |
| `consumed` | reintento | `consumed` | no incrementan (`already`) |
| `claimed` / `reserved` | no se trata como cobrado | pendiente | el RPC no incrementa hasta `consumed` |
| cualquier escritura del RPC | `ROLLBACK` del caller | no queda fila ni incremento | revertido |

`failed` es legal desde V2. Un reintento tras fallo no exige borrar la fila: el `ON CONFLICT` la pasa a `consumed` o la deja en `failed`.

## 5. Riesgos para funcionalidades existentes

Señalar no implica que se haya corregido el SQL.

### 5.1 Operaciones que tocan datos o catálogo compartido

1. **`ai_usage_daily_limits` (V2.2/V2.3)** — no crean ni borran índices. El UNIQUE de producto no se toca.
2. **`storage.buckets` (V1)** — crea o **actualiza** `speaking-b2-audio`. Si ya existiera un bucket con ese `id` usado para otra cosa, el `DO UPDATE` lo marcaría privado y cambiaría MIME/tamaño.
3. **`DROP POLICY` en `storage.objects`** — solo nombres `speaking_b2_audio_public_read` y `speaking_b2_audio_public_write`. No borra políticas de otros buckets. Si alguien hubiera creado esas políticas para este bucket, las elimina (es el efecto buscado).
4. **RPC en runtime** — `INSERT`/`UPDATE` en `plan_usage_counters` y `ai_usage_daily_limits`. No corre durante la migración. Cuando Speaking cobre, comparte filas con Writing/otras claves. El `ON CONFLICT` incrementa **solo** la clave/periodo que se le pasa (`speaking_correction` o `exam_speaking_feedback`). Un error de argumentos podría incrementar otra `usage_key` o `action` si la API se equivoca; el SQL no valida el nombre.
5. **`FOR UPDATE`** en `speaking_b2_sessions` y en la fila del contador. No hace `LOCK TABLE` de tablas de alumnos. Puede esperar detrás de `consumePlanUsage` de la misma clave/usuario.

### 5.2 Lo que estas migraciones no hacen

- No `DELETE`/`TRUNCATE` de filas de alumnos, planes ni cuotas existentes.
- No alteran `suscripciones`, precios, ni `plan_id`.
- No tocan `auth.users`, login, ni JWT.
- No habilitan Speaking en el hub ni en exam mode (eso es código de aplicación; no forma parte de este SQL).
- No cambian RLS de Writing, RUOE, Listening ni `speaking_respuestas`.

### 5.3 Seguridad (proyecto compartido con alumnos reales)

| Riesgo | Detalle | ¿En el SQL? |
|---|---|---|
| Funciones privilegiadas en `public` | `SECURITY DEFINER` salta RLS de las tablas que toca. Correcto solo si `EXECUTE` queda en `service_role`. | Sí. Hay `REVOKE` + `GRANT`. Hay que **comprobarlo después**. |
| `claim_evaluation` sin dueño | Un `service_role` (o un GRANT filtrado mal) puede candar cualquier sesión. | Sí. |
| Lectura de `access_token_hash` | RLS no oculta columnas. V1/V2.3 hacen `REVOKE SELECT (access_token_hash)` a `public`/`anon`/`authenticated` y `GRANT` solo a `service_role`. PostgREST con JWT de alumno no puede leerla. | Sí. |
| Audio de otro usuario | No hay políticas de `storage.objects` para `authenticated`. El aislamiento depende de que solo `service_role` suba/firme y de que la API no firme rutas ajenas. | Sí (ausencia deliberada de policies). Pendiente de prueba en Cloud. |
| FK `Usuarios_y_Perfil_users` `ON DELETE CASCADE` | Borrar un perfil borra sesiones/informes Speaking. No borra objetos de Storage. | Sí. |
| Índice único diario | Si se aplica con duplicados, falla. Si se aplica bien, endurece una tabla **en uso**. | Sí. |

### 5.4 Colisiones de nombres

Prefijo `speaking_b2_*` y `speaking_b2_claim_evaluation` / `speaking_b2_consume_session_quota`. No coinciden con `speaking_respuestas`.  
No se añade el índice `ai_usage_daily_limits_user_action_date_uidx`. El UNIQUE de producto es el que usa el RPC.

## 6. Almacenamiento de audio (`speaking-b2-audio`)

**No crear el bucket en esta tarea.** El SQL V1, **si se aplica**, sí lo crea o actualiza.

| Pregunta | Estado en el SQL / código |
|---|---|
| ¿Se crea por SQL? | Sí, V1 `INSERT INTO storage.buckets`. No hay script de Dashboard aparte. |
| ¿Privado? | `public = false`. El `ON CONFLICT` fuerza `public = false`. |
| ¿Quién sube / lee / borra? | No hay policies de objeto para `anon`/`authenticated`. Subida y firma: `service_role` desde `persistSpeakingB2Audio` / `createSpeakingB2SignedUrl`. El SQL no concede Storage a alumnos. |
| URLs firmadas | Aplicación: `createSignedUrl(path, 3600)`. No hay URLs públicas en SQL. |
| RLS de Storage | Ninguna policy nueva de SELECT/INSERT. Se eliminan dos policies públicas si existieran. |
| Limpieza automática | No hay. |
| Retención | Pendiente de aprobación. Ver `notes/speaking-motor-v2.3-audio-retention.md`. Borrar cuenta no limpia el bucket. |

Aplicar V1 implica crear el bucket. Si la auditoría quiere tablas sin Storage, hay que **partir V1 en un paso posterior**; no se ha partido aquí.

## 7. Comprobaciones previas (solo lectura)

Ejecutar **antes** de instalar. Si alguna falla, **no instalar**.

```sql
-- 1) Tablas Speaking aún no deben existir
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'speaking_b2_%'
order by 1;

-- 2) Perfil y cuotas compartidas
select to_regclass('public."Usuarios_y_Perfil_users"') as perfiles;
select to_regclass('public.plan_usage_counters') as plan_counters;
select to_regclass('public.ai_usage_daily_limits') as daily_limits;

-- 3) UNIQUE que el RPC necesita
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.plan_usage_counters'::regclass
  and contype = 'u';

select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.ai_usage_daily_limits'::regclass
  and contype = 'u';

-- 4) Duplicados que tumbarían el índice V2.2
select user_id, action, usage_date, count(*)
from public.ai_usage_daily_limits
group by 1, 2, 3
having count(*) > 1;

-- 5) Tamaño / bloqueo potencial
select count(*) as daily_rows from public.ai_usage_daily_limits;
select count(*) as plan_rows from public.plan_usage_counters;

-- 6) Bucket homónimo
select id, name, public, file_size_limit
from storage.buckets
where id = 'speaking-b2-audio' or name = 'speaking-b2-audio';

-- 7) Funciones homónimas
select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname in (
  'speaking_b2_claim_evaluation',
  'speaking_b2_consume_session_quota'
);

-- 8) Tabla vecina (no tocar)
select to_regclass('public.speaking_respuestas') as speaking_antiguo;
```

Condiciones que **bloquean** la instalación: ver sección 10.

## 8. Verificaciones posteriores (por migración, solo lectura)

Tras **V1**:

```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name like 'speaking_b2_%'
order by 1;

select relrowsecurity from pg_class
where relname like 'speaking_b2_%' and relnamespace = 'public'::regnamespace;

select polname, tablename, cmd, roles
from pg_policies
where tablename like 'speaking_b2_%';

select id, public from storage.buckets where id = 'speaking-b2-audio';
```

Tras **V2**:

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'speaking_b2_sessions'
  and column_name in ('row_version','evaluation_charged','pending_report','report');

select proname, prosecdef, proconfig
from pg_proc
where proname = 'speaking_b2_claim_evaluation';

select grantee, privilege_type
from information_schema.role_routine_grants
where routine_name = 'speaking_b2_claim_evaluation';
```

Tras **V2.1**:

```sql
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'speaking_b2_quota_charges_status_check';

select pg_get_function_identity_arguments(oid)
from pg_proc
where proname = 'speaking_b2_consume_session_quota';
```

Tras **V2.2**:

```sql
select pg_get_function_identity_arguments(oid)
from pg_proc
where proname = 'speaking_b2_consume_session_quota';
-- Esperado: 9 argumentos. No debe quedar la firma de 6.

select indexname, indexdef
from pg_indexes
where tablename = 'ai_usage_daily_limits';

select grantee, privilege_type
from information_schema.role_routine_grants
where routine_name = 'speaking_b2_consume_session_quota';
```

Comprobar que `anon` y `authenticated` **no** tienen `EXECUTE` en las dos funciones.

No hay en este paquete un `SELECT` que consuma cuota ni que inserte sesiones de prueba con datos reales.

## 9. Recuperación ante errores

Distinguir **revertir DDL** y **restaurar datos**.

| Situación | ¿Qué se puede hacer? | ¿Es seguro? |
|---|---|---|
| Falla V1 (transacción) | Nada que limpiar de Speaking si el `COMMIT` no ocurrió. | Sí, si Postgres hizo rollback del archivo. |
| V1 committed, falla V2 | Quedan tablas V1 sin columnas V2. Se puede reintentar V2. Borrar las tablas `speaking_b2_*` **destruye** cualquier fila ya insertada. | Rollback de datos Speaking = pérdida. En primera instalación vacía, `DROP TABLE … CASCADE` de objetos `speaking_b2_*` es viable **solo si se confirma que no hay filas**. |
| V2 committed, falla V2.1 | El CHECK de V2 ya incluye `failed`. Reintentar V2.1. | No hay pérdida de cuotas de plan. |
| V2.1 committed, falla V2.2 | Sigue el RPC de 6 argumentos. El índice diario nuevo no existe. Reintentar V2.2. | Si el fallo es por duplicados en `ai_usage_daily_limits`, **no** borrar esas filas a ciegas: son cupos reales. |
| V2.2 committed y se quiere «deshacer» | `DROP FUNCTION` de 9 args deja el motor **sin** consume (V2.2 ya eliminó la de 6). Hace falta reaplicar V2.1 y luego una V2.2 corregida. Quitar el índice único diario no restaura duplicados (no debería haberlos). | No presentar esto como rollback seguro. No hay script de down. |
| RPC ya incrementó un contador | Eso no se «deshace» con DROP FUNCTION. Restaurar `plan_usage_counters` / `ai_usage_daily_limits` exige backup o corrección manual fila a fila. | Pérdida o distorsión de cupos de alumnos/staff si se edita mal. |

No hay `DOWN` migration. Un backup de ENGLISH_PROD **antes** de instalar es la única vía de restaurar datos compartidos.

No ejecutar `DROP TABLE speaking_b2_*` en caliente si ya hay sesiones.

## 10. Condiciones que deben bloquear la instalación

No aplicar ninguna migración si:

1. No hay autorización explícita para ENGLISH_PROD (las cabeceras del SQL lo exigen).
2. Las consultas previas muestran tablas `speaking_b2_*` ya existentes con un esquema distinto al esperado.
3. Falta `Usuarios_y_Perfil_users`, `plan_usage_counters` o `ai_usage_daily_limits`.
4. `plan_usage_counters` no tiene UNIQUE `(user_id, usage_key, period_type, period_key)`.
5. `ai_usage_daily_limits` tiene duplicados `(user_id, action, usage_date)`.
6. Existe un bucket `speaking-b2-audio` que no es de este motor (o es público y no se ha decidido el `DO UPDATE`).
7. Ya existen funciones `speaking_b2_*` de otra firma no documentada.
8. Se pretende abrir Speaking a alumnos en el mismo cambio.
9. No hay backup reciente de ENGLISH_PROD.
10. No se ha decidido si V1 puede crear el bucket ahora.

## 11. Contenido del paquete

Ver `MANIFEST.txt`.

Este ZIP es para auditoría e instalación controlada **posterior**. No sustituye la decisión humana de aplicar el SQL.

## 12. Confirmaciones de esta revisión

Ver `SPEAKING_B2_SQL_V23_TEST_RESULTS.md`.

1. `failed` es un estado permitido desde V2 (no se espera a V2.1/V2.2).
2. Los errores de cuota no incrementan `plan_usage_counters` ni `ai_usage_daily_limits`.
3. `authenticated` no tiene `SELECT` sobre `access_token_hash` (privilegio de columna, comprobado con `has_column_privilege` y `SET ROLE`).
4. `service_role` sí puede leer el hash; las APIs internas siguen usando el cliente admin.
5. La cadena V1→V2→V2.1→V2.2→V2.3 se aplica sobre una base local vacía de tablas `speaking_b2_*`.

No se ha ejecutado SQL en ENGLISH_PROD.
