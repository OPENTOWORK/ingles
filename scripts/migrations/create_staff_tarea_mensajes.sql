-- Conversación por tarea (tipo ticket): el responsable habla con admin/coordinación.
-- Se cierra cuando la tarea pasa a completada o cancelada.

create table if not exists public.staff_tarea_mensajes (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references public.staff_tareas (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 4000),
  created_at timestamptz not null default now()
);

create index if not exists staff_tarea_mensajes_tarea_created_idx
  on public.staff_tarea_mensajes (tarea_id, created_at);

comment on table public.staff_tarea_mensajes is
  'Hilo de conversación dentro de una tarea de staff (ticket interno).';

-- Última lectura de cada usuario en cada tarea (para contar pendientes).
create table if not exists public.staff_tarea_lecturas (
  tarea_id uuid not null references public.staff_tareas (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (tarea_id, user_id)
);

comment on table public.staff_tarea_lecturas is
  'Marca de lectura del chat de tarea por usuario.';

alter table public.staff_tarea_mensajes enable row level security;
alter table public.staff_tarea_lecturas enable row level security;

notify pgrst, 'reload schema';
