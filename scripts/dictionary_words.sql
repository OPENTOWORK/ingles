-- Palabras guardadas del diccionario Dralo AI (por usuario).
-- Ejecutar en Supabase SQL Editor.

begin;

create table if not exists public."Dictionary_words" (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word text not null,
  translation text,
  phonetic text,
  definition text,
  target_language text not null default 'es',
  cefr_level text,
  entry_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dictionary_words_user_word_unique unique (user_id, word)
);

create index if not exists idx_dictionary_words_user_created
  on public."Dictionary_words" (user_id, created_at desc);

alter table public."Dictionary_words" enable row level security;

drop policy if exists dictionary_words_own_select on public."Dictionary_words";
create policy dictionary_words_own_select on public."Dictionary_words"
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists dictionary_words_own_insert on public."Dictionary_words";
create policy dictionary_words_own_insert on public."Dictionary_words"
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists dictionary_words_own_update on public."Dictionary_words";
create policy dictionary_words_own_update on public."Dictionary_words"
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists dictionary_words_own_delete on public."Dictionary_words";
create policy dictionary_words_own_delete on public."Dictionary_words"
  for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public."Dictionary_words" to authenticated;

notify pgrst, 'reload schema';

commit;
