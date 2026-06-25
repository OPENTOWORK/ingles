-- Buzón v3: descripción de grupos, gestión de miembros, adjuntos en mensajes.

alter table public.staff_buzon_grupos
  add column if not exists description text null
    check (description is null or char_length(trim(description)) between 1 and 500);

alter table public.staff_buzon_mensajes
  add column if not exists attachment_url text null,
  add column if not exists attachment_name text null,
  add column if not exists attachment_mime text null,
  add column if not exists attachment_kind text null
    check (attachment_kind is null or attachment_kind in ('image', 'document'));

alter table public.staff_buzon_mensajes
  drop constraint if exists staff_buzon_mensajes_body_check;

alter table public.staff_buzon_mensajes
  drop constraint if exists staff_buzon_mensajes_body_or_attachment;

alter table public.staff_buzon_mensajes
  add constraint staff_buzon_mensajes_body_or_attachment check (
    char_length(trim(body)) > 0 or attachment_url is not null
  );

-- Grupos: actualizar / eliminar (solo creador)
drop policy if exists staff_buzon_grupos_update on public.staff_buzon_grupos;
create policy staff_buzon_grupos_update on public.staff_buzon_grupos
  for update to authenticated
  using (created_by = auth.uid() and public.is_staff_buzon_user(auth.uid()))
  with check (created_by = auth.uid() and public.is_staff_buzon_user(auth.uid()));

drop policy if exists staff_buzon_grupos_delete on public.staff_buzon_grupos;
create policy staff_buzon_grupos_delete on public.staff_buzon_grupos
  for delete to authenticated
  using (created_by = auth.uid() and public.is_staff_buzon_user(auth.uid()));

-- Miembros: expulsar o abandonar
drop policy if exists staff_buzon_grupo_miembros_delete on public.staff_buzon_grupo_miembros;
create policy staff_buzon_grupo_miembros_delete on public.staff_buzon_grupo_miembros
  for delete to authenticated
  using (
    public.is_staff_buzon_user(auth.uid())
    and (
      user_id = auth.uid()
      or exists (
        select 1 from public.staff_buzon_grupos g
        where g.id = group_id and g.created_by = auth.uid()
      )
    )
  );

-- Storage bucket (adjuntos del buzón)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'staff-buzon-attachments',
  'staff-buzon-attachments',
  true,
  15728640,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
