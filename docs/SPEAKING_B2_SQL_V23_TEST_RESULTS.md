# Speaking B2 SQL V2.3 — resultados locales (2026-10-28)

Entorno: PostgreSQL 127.0.0.1 (bases `speaking_b2_itest_chain`, `speaking_b2_itest`, `speaking_b2_itest_rls`).  
No se ha ejecutado SQL en ENGLISH_PROD ni en ningún proyecto remoto.

## Cadena limpia V1 → V2 → V2.1 → V2.2 → V2.3

Archivo: `src/features/speaking-b2-motor/__tests__/migration-chain.test.js`  
Base creada vacía (0 tablas `speaking_b2_*`) y bootstrap local de dependencias (perfiles, cupos, `auth.uid`, roles).  
**9/9 OK.**

| Caso | Resultado |
|---|---|
| Instalación sobre base sin tablas Speaking | OK |
| `failed` insertable tras V2, antes de V2.1; `nope` rechazado por CHECK | OK |
| PLAN_FEATURE_LOCKED → `failed`, cupo 0 | OK |
| PLAN_LIMIT_REACHED → `failed`, cupo sin incremento | OK |
| DAILY_LIMIT_REACHED → `failed`, plan 0 | OK |
| LIMIT_CHECK_FAILED → `failed`, cupo 0 | OK |
| Cobro correcto + reintento tras fallo + dos sesiones concurrentes (1 consumed, 1 DAILY_LIMIT_REACHED; plan=1, daily=1) | OK |
| ROLLBACK del caller: sin fila de cobro ni incremento | OK |
| `has_column_privilege(authenticated, access_token_hash)=false`; `state`/`id` sí; `anon` no; `service_role` sí; sin EXECUTE de RPC; sin vistas; `SET ROLE authenticated` lee la sesión y falla al seleccionar el hash; `service_role` lo lee | OK |

## PostgreSQL de cuota (esquema aplanado + V2.2/V2.3)

Archivo: `src/features/speaking-b2-motor/__tests__/pg-integration.test.js`  
**21/21 OK.** Incluye PLAN_FEATURE_LOCKED, reintento tras `failed`, concurrencia dual (plan+diario), transacción abortada y ausencia del índice extra `ai_usage_daily_limits_user_action_date_uidx`.

## RLS y privilegios

Archivo: `src/features/speaking-b2-motor/__tests__/rls-storage.test.js`  
**7/7 OK.** El rol de prueba (equivalente de cliente) lee `id`/`state`/`exam_code` y recibe `permission denied` / `permiso denegado` al seleccionar `access_token_hash`. El catálogo no es SELECT para alumnos. `anon`/`authenticated` no ejecutan las RPC. Postgres interno sí lee el hash.

## Unidad / UI (sin SQL remoto)

`quota-finalize`, `quota-parity`, `complete-flow`, `persistence`, `taxonomy`, `legacy-ui-regression`: **42/42 OK.**  
La UI pública de Speaking no se ha modificado. El hub y exam-mode siguen bloqueados para alumnos.

## Confirmaciones pedidas

1. `failed` es un estado permitido desde V2. V2.2 lo escribe en todos los errores de cuota.
2. Los errores de cuota no incrementan `plan_usage_counters` ni `ai_usage_daily_limits`.
3. `authenticated` no puede leer `access_token_hash` (privilegio de columna, no RLS).
4. `service_role` sí puede; las APIs internas siguen usando el cliente admin (`select *` de sesión).
5. La cadena completa corre desde una base sin tablas Speaking.

No hay `DROP INDEX` sobre tablas compartidas en V1–V2.3.