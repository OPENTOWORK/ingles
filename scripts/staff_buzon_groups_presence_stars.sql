-- Buzón v2: grupos, presencia (estado) y mensajes destacados.

-- ── Presencia / estado del staff ─────────────────────────────────────────────
create table if not exists public.staff_buzon_presencia (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'disponible'
    check (status in ('disponible', 'reunion', 'ocupado')),
  activity text null
    check (activity is null or char_length(trim(activity)) between 1 and 200),
  updated_at timestamptz not null default now()
);

-- ── Grupos ───────────────────────────────────────────────────────────────────
create table if not exists public.staff_buzon_grupos (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_buzon_grupo_miembros (
  group_id uuid not null references public.staff_buzon_grupos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists idx_staff_buzon_grupo_miembros_user
  on public.staff_buzon_grupo_miembros (user_id);

-- ── Mensajes: soporte de grupos ──────────────────────────────────────────────
alter table public.staff_buzon_mensajes
  add column if not exists group_id uuid null
    references public.staff_buzon_grupos(id) on delete cascade;

alter table public.staff_buzon_mensajes
  alter column recipient_id drop not null;

alter table public.staff_buzon_mensajes
  drop constraint if exists staff_buzon_mensajes_no_self;

alter table public.staff_buzon_mensajes
  drop constraint if exists staff_buzon_mensajes_dm_or_group;

alter table public.staff_buzon_mensajes
  add constraint staff_buzon_mensajes_dm_or_group check (
    (
      group_id is null
      and recipient_id is not null
      and sender_id <> recipient_id
    )
    or (
      group_id is not null
      and recipient_id is null
    )
  );

create index if not exists idx_staff_buzon_mensajes_group_created
  on public.staff_buzon_mensajes (group_id, created_at desc)
  where group_id is not null;

-- ── Mensajes destacados (por usuario) ────────────────────────────────────────
create table if not exists public.staff_buzon_mensajes_destacados (
  user_id uuid not null references auth.users(id) on delete cascade,
  message_id uuid not null references public.staff_buzon_mensajes(id) on delete cascade,
  starred_at timestamptz not null default now(),
  primary key (user_id, message_id)
);

create index if not exists idx_staff_buzon_destacados_user
  on public.staff_buzon_mensajes_destacados (user_id, starred_at desc);

-- ── Helpers ──────────────────────────────────────────────────────────────────
create or replace function public.is_staff_buzon_group_member(
  p_group_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_buzon_grupo_miembros m
    where m.group_id = p_group_id
      and m.user_id = coalesce(p_user_id, auth.uid())
  );
$$;

revoke all on function public.is_staff_buzon_group_member(uuid, uuid) from public;
grant execute on function public.is_staff_buzon_group_member(uuid, uuid) to authenticated;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.staff_buzon_presencia enable row level security;
alter table public.staff_buzon_grupos enable row level security;
alter table public.staff_buzon_grupo_miembros enable row level security;
alter table public.staff_buzon_mensajes_destacados enable row level security;

-- Presencia
drop policy if exists staff_buzon_presencia_select on public.staff_buzon_presencia;
create policy staff_buzon_presencia_select on public.staff_buzon_presencia
  for select to authenticated
  using (public.is_staff_buzon_user(auth.uid()));

drop policy if exists staff_buzon_presencia_upsert on public.staff_buzon_presencia;
create policy staff_buzon_presencia_upsert on public.staff_buzon_presencia
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_staff_buzon_user(auth.uid()));

drop policy if exists staff_buzon_presencia_update on public.staff_buzon_presencia;
create policy staff_buzon_presencia_update on public.staff_buzon_presencia
  for update to authenticated
  using (user_id = auth.uid() and public.is_staff_buzon_user(auth.uid()))
  with check (user_id = auth.uid() and public.is_staff_buzon_user(auth.uid()));

-- Grupos
drop policy if exists staff_buzon_grupos_select on public.staff_buzon_grupos;
create policy staff_buzon_grupos_select on public.staff_buzon_grupos
  for select to authenticated
  using (
    public.is_staff_buzon_user(auth.uid())
    and public.is_staff_buzon_group_member(id, auth.uid())
  );

drop policy if exists staff_buzon_grupos_insert on public.staff_buzon_grupos;
create policy staff_buzon_grupos_insert on public.staff_buzon_grupos
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.is_staff_buzon_user(auth.uid())
  );

-- Miembros de grupo
drop policy if exists staff_buzon_grupo_miembros_select on public.staff_buzon_grupo_miembros;
create policy staff_buzon_grupo_miembros_select on public.staff_buzon_grupo_miembros
  for select to authenticated
  using (
    public.is_staff_buzon_user(auth.uid())
    and public.is_staff_buzon_group_member(group_id, auth.uid())
  );

drop policy if exists staff_buzon_grupo_miembros_insert on public.staff_buzon_grupo_miembros;
create policy staff_buzon_grupo_miembros_insert on public.staff_buzon_grupo_miembros
  for insert to authenticated
  with check (
    public.is_staff_buzon_user(auth.uid())
    and (
      user_id = auth.uid()
      or exists (
        select 1 from public.staff_buzon_grupos g
        where g.id = group_id and g.created_by = auth.uid()
      )
    )
  );

-- Actualizar políticas de mensajes para incluir grupos
drop policy if exists staff_buzon_select_participant on public.staff_buzon_mensajes;
create policy staff_buzon_select_participant on public.staff_buzon_mensajes
  for select to authenticated
  using (
    public.is_staff_buzon_user(auth.uid())
    and (
      (group_id is null and (sender_id = auth.uid() or recipient_id = auth.uid()))
      or (group_id is not null and public.is_staff_buzon_group_member(group_id, auth.uid()))
    )
  );

drop policy if exists staff_buzon_insert_sender on public.staff_buzon_mensajes;
create policy staff_buzon_insert_sender on public.staff_buzon_mensajes
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_staff_buzon_user(auth.uid())
    and (
      (
        group_id is null
        and public.is_staff_buzon_user(recipient_id)
      )
      or (
        group_id is not null
        and recipient_id is null
        and public.is_staff_buzon_group_member(group_id, auth.uid())
      )
    )
  );

-- Destacados
drop policy if exists staff_buzon_destacados_select on public.staff_buzon_mensajes_destacados;
create policy staff_buzon_destacados_select on public.staff_buzon_mensajes_destacados
  for select to authenticated
  using (user_id = auth.uid() and public.is_staff_buzon_user(auth.uid()));

drop policy if exists staff_buzon_destacados_insert on public.staff_buzon_mensajes_destacados;
create policy staff_buzon_destacados_insert on public.staff_buzon_mensajes_destacados
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_staff_buzon_user(auth.uid()));

drop policy if exists staff_buzon_destacados_delete on public.staff_buzon_mensajes_destacados;
create policy staff_buzon_destacados_delete on public.staff_buzon_mensajes_destacados
  for delete to authenticated
  using (user_id = auth.uid() and public.is_staff_buzon_user(auth.uid()));

-- Realtime
alter table public.staff_buzon_presencia replica identity full;
alter table public.staff_buzon_grupos replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.staff_buzon_presencia;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.staff_buzon_grupos;
exception when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
