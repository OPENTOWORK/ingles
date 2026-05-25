-- Clases particulares: online (Calendly) y presenciales.
-- Ejecutar en Supabase SQL Editor.

begin;

create table if not exists public.profesor_calendly (
  profesor_id uuid primary key references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  calendly_url text,
  presentacion text,
  activo boolean not null default true,
  ofrece_online boolean not null default true,
  ofrece_presencial boolean not null default false,
  calendly_url_presencial text,
  info_presencial text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Columnas nuevas en instalaciones previas
alter table public.profesor_calendly add column if not exists ofrece_online boolean not null default true;
alter table public.profesor_calendly add column if not exists ofrece_presencial boolean not null default false;
alter table public.profesor_calendly add column if not exists calendly_url_presencial text;
alter table public.profesor_calendly add column if not exists info_presencial text;

-- calendly_url ya no es obligatorio si solo hay presencial
alter table public.profesor_calendly alter column calendly_url drop not null;

create index if not exists idx_profesor_calendly_activo
  on public.profesor_calendly (activo)
  where activo = true;

alter table public.profesor_calendly enable row level security;

drop policy if exists profesor_calendly_teacher_own on public.profesor_calendly;
create policy profesor_calendly_teacher_own on public.profesor_calendly
  for all to authenticated
  using (profesor_id = auth.uid())
  with check (profesor_id = auth.uid());

drop policy if exists profesor_calendly_student_read on public.profesor_calendly;
create policy profesor_calendly_student_read on public.profesor_calendly
  for select to authenticated
  using (
    activo = true
    and (
      (ofrece_online = true and calendly_url is not null and length(trim(calendly_url)) > 0)
      or (
        ofrece_presencial = true
        and (
          (calendly_url_presencial is not null and length(trim(calendly_url_presencial)) > 0)
          or (info_presencial is not null and length(trim(info_presencial)) > 0)
        )
      )
    )
  );

grant select, insert, update, delete on public.profesor_calendly to authenticated;

notify pgrst, 'reload schema';

commit;
