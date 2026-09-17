-- Permisos de paneles staff por rol (overrides editables desde /admin/configuracion).

create table if not exists public.staff_role_permissions (
  role_key text primary key,
  permission_keys text[] not null default '{}',
  updated_at timestamptz not null default now()
);

comment on table public.staff_role_permissions is
  'Overrides de acceso a paneles staff por rol. Si no hay fila, se usan los defaults del código.';

alter table public.staff_role_permissions enable row level security;

notify pgrst, 'reload schema';
