-- Reuniones del equipo (panel de coordinador).
-- Tabla vacía por defecto; las reuniones se crean desde la UI.

begin;

create table if not exists public.staff_reuniones (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  fecha date not null,
  hora time,
  departamentos jsonb not null default '[]'::jsonb,
  puntos_dia jsonb not null default '[]'::jsonb,
  notas text,
  created_by uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_staff_reuniones_fecha on public.staff_reuniones (fecha desc);

alter table public.staff_reuniones enable row level security;

drop policy if exists staff_reuniones_read on public.staff_reuniones;
create policy staff_reuniones_read on public.staff_reuniones
  for select to authenticated
  using (true);

grant select on public.staff_reuniones to authenticated;

notify pgrst, 'reload schema';

commit;
