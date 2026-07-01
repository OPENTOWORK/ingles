-- Buzón: adjuntos de audio en mensajes.

alter table public.staff_buzon_mensajes
  drop constraint if exists staff_buzon_mensajes_attachment_kind_check;

alter table public.staff_buzon_mensajes
  add constraint staff_buzon_mensajes_attachment_kind_check check (
    attachment_kind is null or attachment_kind in ('image', 'document', 'audio')
  );

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/wav',
  'audio/x-wav'
]
where id = 'staff-buzon-attachments';

notify pgrst, 'reload schema';
