# Marketing CRM — Arquitectura Fase 1

## Contexto del proyecto

- **Framework:** Next.js 14 (App Router)
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth + roles en `Usuarios_y_Perfil_roles`
- **Sin APIs externas** en esta fase (GA4, GTM, Google Ads, Meta, etc.)

## Entidades reutilizadas (no duplicadas)

| Concepto spec | Entidad existente |
|---------------|-------------------|
| Contacto / usuario | `auth.users` + `Usuarios_y_Perfil_users.id` |
| Lead (pre-registro) | `referral_invitations` (funnel referidos) |
| Cliente de pago | Usuario con suscripción activa (`suscripciones`, Stripe) |
| Revenue operativo | `monetizacion_pagos` (complementado por `marketing_revenue`) |
| Consentimiento comercial | `Usuarios_y_Perfil_users.consentimiento_comercial` + `marketing_consent` (tracking) |
| Navegación post-login | `usuario_navegacion` (sin UTM; distinto de marketing web) |

## Nuevas tablas

Migración: `scripts/migrations/create_marketing_crm_phase1.sql`

| Tabla | Propósito |
|-------|-----------|
| `marketing_visitors` | `visitor_id` (`vis_…`) antes y después de identificación |
| `marketing_acquisition_profiles` | First touch (inmutable) y last touch (actualizable) |
| `marketing_sources` | Catálogo extensible de fuentes |
| `marketing_mediums` | Catálogo extensible de medios |
| `marketing_campaigns` | Campañas multi-plataforma |
| `marketing_touchpoints` | Interacciones para atribución futura |
| `marketing_events` | Eventos (`page_view`, `generate_lead`, `purchase`, custom…) |
| `marketing_campaign_costs` | Costes diarios por campaña |
| `marketing_opportunities` | Oportunidades/deals (preparado) |
| `marketing_revenue` | Ingresos atribuibles al journey |
| `marketing_consent` | Consentimiento analytics/ads/marketing (tri-state) |

## Identificadores

- **visitor_id:** `vis_` + 32 hex. Generado por el sistema si no se envía.
- **event_id (público):** `evt_` + 32 hex en columna `event_public_id`.
- **contact_id / customer_id:** `auth.users.id` cuando el visitante se identifica.
- **lead_id:** UUID libre; puede vincularse a `referral_invitations.id`.

## First touch / Last touch

Almacenados en `marketing_acquisition_profiles`:

- **First touch:** se escribe una sola vez cuando llega la primera señal de adquisición (source, medium, UTM, gclid…).
- **Last touch:** se actualiza en cada evento con señal de adquisición.
- Hitos: `lead_created_at`, `lead_qualified_at`, `converted_at`, `customer_created_at`.

## UTMs y click IDs

Cada evento/touchpoint guarda:

- `source`, `medium`, `campaign`, `content`, `term`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `gclid`, `gbraid`, `wbraid` (nullable)

En el perfil de adquisición se guardan copias normalizadas en campos `first_*` y `last_*`.

## Flujo visitor → lead → customer

```
Visitante (marketing_visitors.visitor_id)
    ↓ eventos / touchpoints
Lead (generate_lead + contact_id / referral_invitation)
    ↓ lead_qualified, meeting_booked, proposal_sent
Cliente (customer_created / purchase + customer_id)
    ↓ marketing_revenue (+ monetizacion_pagos)
Revenue atribuible
```

La deduplicación definitiva (email, teléfono, visitor_id) se integrará con reglas del CRM en fases posteriores (registro, formularios web).

## API interna

### POST `/api/marketing/events`

**Autenticación:**

- Header `x-marketing-ingest-key` = `MARKETING_INGEST_SECRET`, o
- Sesión staff admin/marketing (pruebas internas).

**Payload ejemplo:**

```json
{
  "visitor_id": "vis_123…",
  "session_id": "session_456",
  "event_name": "page_view",
  "timestamp": "2026-09-18T10:30:00Z",
  "page_url": "https://example.com/servicios",
  "source": "google",
  "medium": "cpc",
  "campaign": "campaña_ejemplo",
  "utm_source": "google",
  "utm_medium": "cpc",
  "gclid": null,
  "metadata": {}
}
```

**Respuesta:**

```json
{
  "success": true,
  "event_id": "evt_…",
  "visitor_id": "vis_…"
}
```

**Comportamiento:**

1. Valida payload y fechas ISO.
2. Crea `visitor_id` si no existe.
3. Inserta `marketing_events` + `marketing_touchpoints`.
4. Actualiza first/last touch sin sobrescribir first.
5. Deduplica `page_view` en ventana de 5s (misma URL/sesión).
6. Idempotencia vía `idempotency_key` (explícita o derivada).
7. En `purchase` con `metadata.amount`, crea fila en `marketing_revenue`.

### POST `/api/marketing/consent`

Registra `analytics_consent`, `ads_consent`, `marketing_consent` (`true` / `false` / `null`).

### GET `/api/admin/marketing/customer-journey/[userId]`

Staff admin/marketing. `?mock=1` devuelve journey de demostración (no mezclado con datos reales).

## UI (Fase 1)

- **Hub:** `/admin/marketing` con subsecciones: Dashboard, Adquisición, Customer Journey, Campañas, Conversiones, ROI.
- **Promociones legacy:** `/admin/plan-marketing` (plan comercial existente).
- **Ficha usuario:** `/admin/usuarios/[userId]` → sección Marketing / Customer Journey.

## Índices

Índices en: `visitor_id`, `contact_id`, `lead_id`, `customer_id`, `session_id`, `event_name`, `event_timestamp`, `source`+`medium`, `campaign`, `gclid`, `idempotency_key`.

## Seguridad

- **RLS habilitado** en las 11 tablas `marketing_*` **sin políticas client** → deny-all para `anon`/`authenticated`.
- **No hay SELECT desde el navegador** hacia tablas marketing; lectura/escritura vía API con `SUPABASE_SERVICE_ROLE_KEY`.
- Migración documental: `scripts/migrations/document_marketing_rls_phase1.sql`.
- API de ingest: errores 500 genéricos (detalle solo en `console.error`).
- `MARKETING_INGEST_SECRET` solo en servidor; nunca en `NEXT_PUBLIC_*`.
- **Rate limiting** en ingest externo (`x-marketing-ingest-key`): 120 req/min por IP y endpoint (`src/lib/marketing/crm/rateLimit.js`). Limitación serverless: bucket en memoria por instancia.
- Sin modificación arbitraria de clientes/revenue desde el endpoint de eventos.

## First touch (integridad)

- **Append-only a nivel aplicación**: `computeAcquisitionPatch` no escribe `first_*` si `first_timestamp` ya existe.
- No hay trigger SQL en Fase 1; la inmutabilidad depende de la API de ingest.
- Tests: `marketingCrm.test.js` (Google Ads → organic; cadena last touch).

## Consentimiento

- `marketing_consent`: estado actual (tri-state + timestamp + source).
- **Sin historial de cambios** en Fase 1 (pendiente Fase 2+).
- Paralelo a `consentimiento_comercial` en perfil; no se modifica el sistema comercial existente.

## Tests

`src/lib/__tests__/marketingCrm.test.js` — validación, first/last touch, deduplicación, consentimiento, IDs.

## Pendiente Fase 2+

- [ ] Conectar GA4, GTM, Google Ads, Search Console, Meta, LinkedIn
- [ ] Script cliente web (visitor cookie + session)
- [ ] Integración en registro/formularios (`linkVisitorToUser`)
- [ ] Webhook Stripe → `customer_created` + revenue
- [ ] Dashboards con datos reales y algoritmos de atribución
- [ ] Cálculos CAC, CPL, ROAS, ROI
- [ ] Políticas RLS de lectura para roles marketing

## Aplicar migración

Ejecutar en Supabase SQL Editor o vía CLI:

```bash
# Contenido de scripts/migrations/create_marketing_crm_phase1.sql
```

Variable de entorno recomendada:

```env
MARKETING_INGEST_SECRET=tu_clave_secreta_larga
```
