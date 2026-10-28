# Runbook — Supabase de prueba para Speaking B2

No ejecutar estos pasos sobre ENGLISH_PROD (`qnazrzvwvkwhkfbqsbmr`) ni sobre `www.dralo.es`.

Estado el 2026-10-27:

| Proyecto | Ref | Estado | ¿Usable para V2.3? |
|---|---|---|---|
| ENGLISH_PROD | `qnazrzvwvkwhkfbqsbmr` | ACTIVE_HEALTHY | No |
| Auro Asistente personal | `heuwcacbbloxycglbbew` | INACTIVE | No (otro producto) |
| Supabase B / draloenglish-glitch | `cmeruknhkcxveygeeuji` | DNS inexistente, no aparece en la cuenta | No (además fue un clon, no un sandbox vacío) |

No hay un proyecto de pruebas **independiente y autorizado** para Speaking. La ejecución remota queda detenida hasta que exista uno.

## Qué hay que crear (autorización humana)

1. En la organización OPENTOWORK, crear un proyecto **nuevo y vacío** (nombre sugerido: `DRALO_SPEAKING_TEST`).
2. Confirmar el coste de compute en el dashboard. Este agente no lo crea.
3. No copiar tablas de alumnos, no restaurar dumps de producción, no usar `SUPABASE_B_*`.
4. Anotar el `project ref` y las claves de **ese** proyecto.

## Variables (archivo local `.env.speaking-test`, gitignorado)

```
SPEAKING_B2_TEST_AUTHORIZED=YES_ISOLATED_SPEAKING_TEST
SPEAKING_B2_TEST_PROJECT_REF=<ref-del-proyecto-nuevo>
SPEAKING_B2_TEST_SUPABASE_URL=https://<ref>.supabase.co
SPEAKING_B2_TEST_ANON_KEY=
SPEAKING_B2_TEST_SERVICE_ROLE_KEY=
SPEAKING_B2_TEST_DATABASE_URL=postgresql://...
```

Sin `YES_ISOLATED_SPEAKING_TEST` los scripts se detienen.

## Aplicar SQL (solo en ese proyecto)

Orden: V1 → V2 → V2.1 → V2.2.

```
# cargar .env.speaking-test en la sesión
npm run speaking:v23-guard
node --loader ./scripts/alias-loader.mjs scripts/speaking-b2-apply-test-migrations.mjs
```

Comprobar después:

- Funciones `speaking_b2_claim_evaluation` y `speaking_b2_consume_session_quota` (9 argumentos).
- `REVOKE` a `anon`/`authenticated`, `GRANT` a `service_role`.
- Bucket privado `speaking-b2-audio`, sin políticas públicas.
- RLS: el JWT de un usuario no lee la sesión de otro.

## Usuarios ficticios

Crear en Auth, no en producción:

- `speaking.student.test@example.invalid` — rol estudiante, plan de prueba.
- `speaking.staff.test@example.invalid` — staff no admin (tope 3/día).

No usar correos de alumnos reales.

## Dos instancias Next

```
npm run speaking:two-next
# si el guard es ok:
node --loader ./scripts/alias-loader.mjs scripts/speaking-b2-two-next.mjs start
node --loader ./scripts/alias-loader.mjs scripts/speaking-b2-two-next-probe.mjs
```

Puertos 3011 y 3012. Carpetas `.next-speaking-a` y `.next-speaking-b`. No reutilizar el `.next` de `npm run dev`.
