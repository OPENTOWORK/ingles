-- Speaking: audios de respuestas del usuario (STT / micrófono).
-- Ejecutar en Supabase SQL Editor o vía MCP apply_migration.

begin;

create table if not exists public.speaking_respuestas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  session_id text not null,
  turn_id text,
  mode text not null check (mode in ('PRACTICE', 'CORRECTION', 'EXAM')),
  cefr text not null check (cefr in ('A2', 'B1', 'B2', 'C1', 'C2')),
  b2_part_number integer,
  exam_part_index integer not null default 0,
  transcript text not null default '',
  transcript_source text not null default 'STT'
    check (transcript_source in ('STT', 'TYPED', 'MOCK')),
  storage_path text not null,
  audio_url text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_speaking_respuestas_user_created
  on public.speaking_respuestas (user_id, created_at desc);

create index if not exists idx_speaking_respuestas_session_created
  on public.speaking_respuestas (session_id, created_at asc);

create index if not exists idx_speaking_respuestas_turn
  on public.speaking_respuestas (turn_id)
  where turn_id is not null;

comment on table public.speaking_respuestas is
  'Audios de respuestas del alumno en práctica/examen speaking (Storage + metadatos STT).';

alter table public.speaking_respuestas enable row level security;

drop policy if exists "speaking_respuestas_select_own" on public.speaking_respuestas;
drop policy if exists "speaking_respuestas_insert_own" on public.speaking_respuestas;

create policy "speaking_respuestas_select_own"
  on public.speaking_respuestas
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "speaking_respuestas_insert_own"
  on public.speaking_respuestas
  for insert
  to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.speaking_respuestas to authenticated;

-- Bucket Storage (subida vía service role en API; lectura pública por URL).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'speaking-respuestas',
  'speaking-respuestas',
  true,
  15728640,
  array[
    'audio/webm',
    'audio/ogg',
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
    'audio/wav',
    'audio/x-wav'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "speaking_respuestas_public_read" on storage.objects;
create policy "speaking_respuestas_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'speaking-respuestas');

notify pgrst, 'reload schema';

commit;
