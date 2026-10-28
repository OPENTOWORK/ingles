# DRALO Speaking Motor V2.1 — persistencia y cuotas con PostgreSQL

Fecha: 2026-10-27. Trabajo local. Sin commit, sin deploy, sin SQL en producción.

La interfaz `/exam-practice/b2/exam-speaking/` no se ha modificado. Rúbricas, prompts, taxonomía, banco SP-EX001, feedback y voz del examinador no se han tocado en esta fase.

## 1. Problemas confirmados

Tras V2.0 se contrastó de nuevo el cobro. El libro `speaking_b2_quota_charges` **no** era suficiente:

| Hueco | Qué ocurría |
|---|---|
| Insert `claimed` y luego `consumePlanUsage` | Dos pasos. Un fallo entre medias deja el estado ambiguo. |
| Tratar `23505` como «ya cobrado» | Un `claimed` no prueba que `plan_usage_counters` haya subido. El reintento podía saltarse el descuento o, al revés, volver a consumir. |
| `confirm` marca `consumed` sin incrementar | El registro y el contador podían divergir. |
| Publicado sin migración V2 | El código caía a candado en memoria o a `skipped: true`. Sin garantía multiinstancia, y en silencio. |

No se inventa «exactamente una ejecución» para el camino JS partido. Esa garantía solo existe dentro de la transacción SQL nueva.

## 2. Correcciones realizadas

- Máquina de estados del cobro: `none` → `claimed/reserved` (pendiente, consume desconocido) → `consumed` (contador movido en la misma transacción) o `failed` (se puede reintentar).
- Función `speaking_b2_consume_session_quota`: bloquea la sesión, exige informe, incrementa `plan_usage_counters` y escribe `consumed` + `evaluation_charged` en **una** transacción.
- Un `claimed` ya no se trata como cobro completado.
- Publicado: si falta el esquema V2, `STORE_UNAVAILABLE` (503). No cobra. No usa candado local. No cae al JSON.
- Recuperación: `pending_report` + `evaluation_charged` cierra el informe sin un segundo descuento.
- No se cobra si no hay informe.

El JSON temporal sigue solo en desarrollo local.

## 3. Archivos modificados

Nuevos:

- `src/features/speaking-b2-motor/services/quota-finalize.js`
- `src/features/speaking-b2-motor/__tests__/quota-finalize.test.js`
- `src/features/speaking-b2-motor/__tests__/pg-integration.test.js`
- `scripts/speaking_b2_motor_v21.sql`
- `scripts/speaking_b2_itest_schema.sql`
- `docs/speaking-motor-v2.1-report.md`

Modificados:

- `session-store.js`, `complete-flow.js`, `complete/route.js`
- tests de persistencia y complete-flow
- comentarios en `speaking_b2_motor.sql` y `speaking_b2_motor_v2.sql`

No modificados: `B2SpeakingExamPractice`, rúbrica, prompts, taxonomía, banco, `planAccess.js`, otros motores.

## 4. Funcionamiento definitivo de los cobros

1. `checkSpeakingCorrectionQuota` (sin descontar).
2. Evaluar y persistir `pending_report`.
3. `speaking_b2_consume_session_quota` (service_role):
   - si ya `evaluation_charged` o status `consumed` → `already`, no incrementa;
   - si no hay informe → `NO_REPORT`, no incrementa;
   - si el cupo está lleno → `failed`, no incrementa;
   - si no: incrementa `plan_usage_counters` y marca `consumed` + `evaluation_charged`.
4. Persistir el informe. Si el proceso muere aquí, el reintento ve `evaluation_charged` y no vuelve a cobrar.

**Demostrado con PostgreSQL:** como máximo un `speaking_correction` por sesión, también con 2 y 5 clientes concurrentes.

**No demostrado:** incremento diario de staff (`ai_usage_daily_limits`) en la misma transacción. En alumnos con plan, el camino comercial es `speaking_correction`.

No se han consumido cuotas de alumnos reales.

## 5. Evidencias con PostgreSQL

Base aislada local: `127.0.0.1` / `speaking_b2_itest`. No se ha usado `DATABASE_URL` de producción ni credenciales de Supabase remoto.

| Prueba | Resultado |
|---|---|
| Crear sesión, guardar turnos, leerlos desde otra conexión | OK |
| Rechazar `row_version` obsoleta | OK |
| Sin informe → 0 incrementos | OK |
| 2 clientes concurrentes → 1 incremento | OK |
| 5 consumes concurrentes → 1 incremento | OK |
| Fallo tras claim, luego consume + reintento | 1 incremento |
| Reintento tras informe persistido | `already`, contador = 1 |
| 2 procesos al candado de evaluación | `row_version = 2` (un solo lock) |
| Segunda aplicación del esquema aislado | OK |

## 6. Concurrencia real vs mocks

**PostgreSQL real (9 tests):** candado, consume atómico, versiones, recuperación.

**Mocks (el resto):** flujo complete, UI, evaluador, fixtures. Un `Map` compartido **no** se declara como garantía entre servidores.

## 7. Recuperación ante fallos

| Momento del fallo | Efecto | Reintento |
|---|---|---|
| Tras eval, antes de `pending_report` | Sin cobro | Reevaluar |
| Tras `pending_report`, antes de la transacción | Sin cobro | Llamar a la función |
| Dentro de la transacción | Rollback | Llamar a la función |
| Tras la transacción, antes de persistir el informe | Cobrado, informe pendiente | Completar sin cobrar |
| Fila `claimed` huérfana (camino JS antiguo) | Consume desconocido | No se usa en publicado; 409 `CHARGE_PENDING` |

## 8. Estado de las migraciones

Orden: `speaking_b2_motor.sql` → `speaking_b2_motor_v2.sql` → `speaking_b2_motor_v21.sql`.

**No aplicadas en producción ni en staging remoto.**

`speaking_b2_consume_session_quota` y `speaking_b2_claim_evaluation`: `SECURITY DEFINER`, `search_path` fijado, `REVOKE` a `public`/`anon`/`authenticated`, `GRANT` solo a `service_role`. La API sigue exigiendo el token de sesión.

La prueba de idempotencia se hizo sobre el esquema aislado (segunda ejecución sin error). El `GRANT` a `service_role` no se ejecutó en el Postgres local porque ese rol no existe fuera de Supabase.

## 9. Tests ejecutados

```
node --loader ./scripts/alias-loader.mjs --test src/features/speaking-b2-motor/__tests__/*.test.js
```

**112 tests, 17 suites, 0 fallos.**

- 103 unitarios / mocks
- 9 de integración contra PostgreSQL local aislado
- Incluye `legacy-ui-regression` (UI original intacta)

## 10. Riesgos pendientes

1. Desplegar el código V2.1 **sin** SQL V2+V2.1 deja el complete en 503. Es el comportamiento buscado, no un fallback.
2. La atomicidad «incremento + marca» está demostrada en Postgres local, no en Supabase remoto ni en dos instancias Next reales.
3. El cupo diario de staff no entra en la misma transacción.
4. Audio humano y calibración Cambridge siguen PENDING.
5. Speaking sigue bloqueado para alumnos.

No está validado en producción.
