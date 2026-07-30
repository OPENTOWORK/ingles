-- Emoji reactions for direct and group messages in the staff Buzón.

create table if not exists public.staff_buzon_mensaje_reacciones (
  message_id uuid not null references public.staff_buzon_mensajes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create index if not exists staff_buzon_mensaje_reacciones_user_id_idx
  on public.staff_buzon_mensaje_reacciones (user_id);

alter table public.staff_buzon_mensaje_reacciones enable row level security;

drop policy if exists "Buzon users can read reactions on visible messages"
  on public.staff_buzon_mensaje_reacciones;
create policy "Buzon users can read reactions on visible messages"
  on public.staff_buzon_mensaje_reacciones
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.staff_buzon_mensajes message
      where message.id = staff_buzon_mensaje_reacciones.message_id
        and (
          message.sender_id = (select auth.uid())
          or message.recipient_id = (select auth.uid())
          or (
            message.group_id is not null
            and exists (
              select 1
              from public.staff_buzon_grupo_miembros member
              where member.group_id = message.group_id
                and member.user_id = (select auth.uid())
            )
          )
        )
    )
  );

drop policy if exists "Buzon users can add their own reactions"
  on public.staff_buzon_mensaje_reacciones;
create policy "Buzon users can add their own reactions"
  on public.staff_buzon_mensaje_reacciones
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.staff_buzon_mensajes message
      where message.id = staff_buzon_mensaje_reacciones.message_id
        and (
          message.sender_id = (select auth.uid())
          or message.recipient_id = (select auth.uid())
          or (
            message.group_id is not null
            and exists (
              select 1
              from public.staff_buzon_grupo_miembros member
              where member.group_id = message.group_id
                and member.user_id = (select auth.uid())
            )
          )
        )
    )
  );

drop policy if exists "Buzon users can remove their own reactions"
  on public.staff_buzon_mensaje_reacciones;
create policy "Buzon users can remove their own reactions"
  on public.staff_buzon_mensaje_reacciones
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

alter table public.staff_buzon_mensaje_reacciones replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.staff_buzon_mensaje_reacciones;
exception when duplicate_object then null;
end $$;

comment on table public.staff_buzon_mensaje_reacciones is
  'Per-user emoji reactions on staff Buzón messages.';
