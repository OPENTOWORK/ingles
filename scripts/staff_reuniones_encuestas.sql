-- Encuestas de fecha para acordar reuniones del equipo.
-- Ejecutar en Supabase SQL Editor.

begin;

create table if not exists public.staff_reuniones_encuestas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  notas text,
  departamentos jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open', 'closed')),
  meeting_id uuid references public.staff_reuniones (id) on delete set null,
  created_by uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_reuniones_encuesta_opciones (
  id uuid primary key default gen_random_uuid(),
  encuesta_id uuid not null references public.staff_reuniones_encuestas (id) on delete cascade,
  fecha date not null,
  hora time,
  orden integer not null default 0
);

create table if not exists public.staff_reuniones_encuesta_votos (
  id uuid primary key default gen_random_uuid(),
  opcion_id uuid not null references public.staff_reuniones_encuesta_opciones (id) on delete cascade,
  user_id uuid not null references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  voto text not null check (voto in ('yes', 'maybe', 'no')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opcion_id, user_id)
);

create index if not exists idx_staff_reuniones_encuestas_status
  on public.staff_reuniones_encuestas (status, created_at desc);

create index if not exists idx_staff_reuniones_encuesta_opciones_encuesta
  on public.staff_reuniones_encuesta_opciones (encuesta_id, orden);

create index if not exists idx_staff_reuniones_encuesta_votos_opcion
  on public.staff_reuniones_encuesta_votos (opcion_id);

alter table public.staff_reuniones_encuestas enable row level security;
alter table public.staff_reuniones_encuesta_opciones enable row level security;
alter table public.staff_reuniones_encuesta_votos enable row level security;

drop policy if exists staff_reuniones_encuestas_read on public.staff_reuniones_encuestas;
create policy staff_reuniones_encuestas_read on public.staff_reuniones_encuestas
  for select to authenticated
  using (true);

drop policy if exists staff_reuniones_encuesta_opciones_read on public.staff_reuniones_encuesta_opciones;
create policy staff_reuniones_encuesta_opciones_read on public.staff_reuniones_encuesta_opciones
  for select to authenticated
  using (true);

drop policy if exists staff_reuniones_encuesta_votos_read on public.staff_reuniones_encuesta_votos;
create policy staff_reuniones_encuesta_votos_read on public.staff_reuniones_encuesta_votos
  for select to authenticated
  using (true);

grant select on public.staff_reuniones_encuestas to authenticated;
grant select on public.staff_reuniones_encuesta_opciones to authenticated;
grant select on public.staff_reuniones_encuesta_votos to authenticated;

notify pgrst, 'reload schema';

commit;
