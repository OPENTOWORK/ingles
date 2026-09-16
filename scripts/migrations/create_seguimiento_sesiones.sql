-- Sesiones de estudio monitorizadas (opt-in) y registro de consentimiento.
--
-- Solo se guardan agregados de foco: nunca pulsaciones, contenido escrito ni
-- actividad fuera de Dralo (el navegador no da acceso a eso). El alumno inicia
-- la sesion de forma explicita y puede revocarla en cualquier momento.

create table if not exists public.seguimiento_consentimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  version text not null,
  accion text not null check (accion in ('otorgado', 'revocado')),
  registrado_en timestamptz not null default now(),
  user_agent text
);

create index if not exists seguimiento_consentimientos_user_idx
  on public.seguimiento_consentimientos (user_id, registrado_en desc);

alter table public.seguimiento_consentimientos enable row level security;

drop policy if exists "Users can read their own study consent log"
  on public.seguimiento_consentimientos;
create policy "Users can read their own study consent log"
  on public.seguimiento_consentimientos
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.seguimiento_sesiones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'activa'
    check (status in ('activa', 'finalizada')),

  -- Agregados de foco, en segundos.
  focus_seconds integer not null default 0,
  away_seconds integer not null default 0,
  idle_seconds integer not null default 0,
  away_count integer not null default 0,
  longest_away_seconds integer not null default 0,

  -- { "Exam practice": 1200, "Training": 300 }
  areas jsonb not null default '{}'::jsonb,

  resumen text,
  resumen_bullets jsonb,
  resumen_generado_en timestamptz,

  consent_version text not null,
  consent_at timestamptz not null default now(),
  idle_detection_granted boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seguimiento_sesiones_user_idx
  on public.seguimiento_sesiones (user_id, started_at desc);

-- Como mucho una sesion activa por alumno.
create unique index if not exists seguimiento_sesiones_una_activa_por_usuario
  on public.seguimiento_sesiones (user_id)
  where status = 'activa';

alter table public.seguimiento_sesiones enable row level security;

drop policy if exists "Users can read their own study sessions"
  on public.seguimiento_sesiones;
create policy "Users can read their own study sessions"
  on public.seguimiento_sesiones
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.seguimiento_sesiones_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists seguimiento_sesiones_set_updated_at on public.seguimiento_sesiones;
create trigger seguimiento_sesiones_set_updated_at
  before update on public.seguimiento_sesiones
  for each row
  execute function public.seguimiento_sesiones_set_updated_at();

comment on table public.seguimiento_sesiones is
  'Sesiones de estudio monitorizadas con consentimiento explicito del alumno. Solo la escribe la API con service role.';
comment on column public.seguimiento_sesiones.focus_seconds is
  'Segundos con Dralo en primer plano y el alumno activo.';
comment on column public.seguimiento_sesiones.away_seconds is
  'Segundos con la pestana oculta o la ventana sin foco. No se sabe a que sitio fue: el navegador no lo expone.';
comment on column public.seguimiento_sesiones.idle_seconds is
  'Segundos sin interaccion con Dralo en primer plano (o pantalla bloqueada si concedio Idle Detection).';
comment on column public.seguimiento_sesiones.areas is
  'Segundos de foco por area de estudio, para el resumen de fin de sesion.';

notify pgrst, 'reload schema';
