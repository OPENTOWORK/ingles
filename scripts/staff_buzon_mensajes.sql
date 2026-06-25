-- Staff internal mailbox (Buzón): instant messages between staff roles.
-- Applied via Supabase migration: staff_buzon_mensajes

create or replace function public.is_staff_buzon_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "Usuarios_y_Perfil_users" u
    join "Usuarios_y_Perfil_roles" r on r.id = u.rol_id
    where u.id = coalesce(p_user_id, auth.uid())
      and coalesce(u.activo, true) = true
      and lower(trim(r.nombre)) in (
        'admin', 'administrador',
        'coordinador', 'coordinator',
        'informatico', 'it',
        'soporte', 'support',
        'teacher', 'profesor'
      )
  );
$$;

create table if not exists public.staff_buzon_mensajes (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  read_at timestamptz null,
  constraint staff_buzon_mensajes_no_self check (sender_id <> recipient_id)
);

alter table public.staff_buzon_mensajes enable row level security;
