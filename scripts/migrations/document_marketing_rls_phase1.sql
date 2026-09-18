-- FASE 1.2 — Documentación explícita de RLS en tablas marketing_*
-- NO crea políticas permisivas. NO abre acceso al navegador.
-- Las operaciones de marketing se realizan desde el servidor con service role (bypass RLS).

comment on table public.marketing_visitors is
  'Visitantes (visitor_id). RLS ON, sin políticas client: deny-all para anon/authenticated. Escritura/lectura vía API con service role.';

comment on table public.marketing_acquisition_profiles is
  'First touch (append-only en app) y last touch. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_touchpoints is
  'Touchpoints de atribución. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_events is
  'Eventos de marketing. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_campaigns is
  'Campañas multi-plataforma. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_campaign_costs is
  'Costes diarios por campaña. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_sources is
  'Catálogo de fuentes. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_mediums is
  'Catálogo de medios. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_opportunities is
  'Oportunidades/deals. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_revenue is
  'Revenue atribuible; complementa monetizacion_pagos. RLS ON sin políticas client; acceso solo servidor (service role).';

comment on table public.marketing_consent is
  'Consentimiento analytics/ads/marketing (estado actual, sin historial en Fase 1). RLS ON sin políticas client; acceso solo servidor (service role).';

notify pgrst, 'reload schema';
