-- levels_notas: notas de estudio del alumno durante exam practice / skill practice.
-- Ejecutar en Supabase SQL Editor o vía migración.

begin;

create table if not exists public.levels_notas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null default 'New note',
  contenido text not null default '',
  etiquetas text[] not null default '{}'::text[],
  contexto jsonb not null default '{}'::jsonb,
  context_key text,
  creado_en timestamptz not null default timezone('utc'::text, now()),
  actualizado_en timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists idx_levels_notas_usuario_context_key
  on public.levels_notas (usuario_id, context_key)
  where context_key is not null;

create index if not exists idx_levels_notas_usuario_id
  on public.levels_notas (usuario_id);

create index if not exists idx_levels_notas_actualizado_en
  on public.levels_notas (actualizado_en desc);

comment on table public.levels_notas is
  'Notas personales del alumno (exam mode, skill practice, perfil Tools).';

create or replace function public.levels_notas_set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_levels_notas_actualizado_en on public.levels_notas;

create trigger trg_levels_notas_actualizado_en
  before update on public.levels_notas
  for each row
  execute procedure public.levels_notas_set_actualizado_en();

alter table public.levels_notas enable row level security;

drop policy if exists "levels_notas_select_own" on public.levels_notas;
drop policy if exists "levels_notas_insert_own" on public.levels_notas;
drop policy if exists "levels_notas_update_own" on public.levels_notas;
drop policy if exists "levels_notas_delete_own" on public.levels_notas;

create policy "levels_notas_select_own"
  on public.levels_notas
  for select
  to authenticated
  using (usuario_id = auth.uid());

create policy "levels_notas_insert_own"
  on public.levels_notas
  for insert
  to authenticated
  with check (usuario_id = auth.uid());

create policy "levels_notas_update_own"
  on public.levels_notas
  for update
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "levels_notas_delete_own"
  on public.levels_notas
  for delete
  to authenticated
  using (usuario_id = auth.uid());

grant select, insert, update, delete on public.levels_notas to authenticated;

commit;
