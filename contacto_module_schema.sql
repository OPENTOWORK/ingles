-- Contacto module schema aligned with:
-- Mensajes internos, Soporte (tickets), FAQ, estados y tiempo activo.

create table if not exists contact_tickets (
  id bigserial primary key,
  created_by uuid references auth.users(id) on delete set null,
  requester_name text not null,
  requester_email text not null,
  requester_type text not null check (requester_type in ('Usuario potencial', 'Usuario confirmado')),
  subject text not null,
  message text not null,
  status text not null check (status in ('Abierto', 'Sin responder', 'Respondido', 'Cerrado')),
  topic text not null default 'uso de la plataforma',
  created_at timestamptz not null default now(),
  first_response_at timestamptz null,
  closed_at timestamptz null
);

create index if not exists idx_contact_tickets_created_by on contact_tickets(created_by);
create index if not exists idx_contact_tickets_status on contact_tickets(status);
create index if not exists idx_contact_tickets_created_at on contact_tickets(created_at desc);

create table if not exists contact_ticket_messages (
  id bigserial primary key,
  ticket_id bigint not null references contact_tickets(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_email text null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_ticket_messages_ticket_id on contact_ticket_messages(ticket_id);

create table if not exists internal_messages (
  id bigserial primary key,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid references auth.users(id) on delete set null,
  to_profile text not null check (to_profile in ('Alumno /profesor', 'Alumno/soporte', 'Profesor/soporte')),
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_internal_messages_from_user on internal_messages(from_user_id);
create index if not exists idx_internal_messages_to_user on internal_messages(to_user_id);

create table if not exists contact_faq (
  id bigserial primary key,
  topic text not null,
  question text not null,
  answer text not null,
  quick_link text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_faq_topic on contact_faq(topic);
create index if not exists idx_contact_faq_active on contact_faq(is_active);

alter table contact_tickets enable row level security;
alter table contact_ticket_messages enable row level security;
alter table internal_messages enable row level security;
alter table contact_faq enable row level security;

drop policy if exists "tickets_select_own" on contact_tickets;
create policy "tickets_select_own"
on contact_tickets
for select
using (created_by = auth.uid());

drop policy if exists "tickets_insert_anyone" on contact_tickets;
create policy "tickets_insert_anyone"
on contact_tickets
for insert
with check (true);

drop policy if exists "messages_select_ticket_owner" on contact_ticket_messages;
create policy "messages_select_ticket_owner"
on contact_ticket_messages
for select
using (
  exists (
    select 1
    from contact_tickets t
    where t.id = ticket_id
      and t.created_by = auth.uid()
  )
);

drop policy if exists "messages_insert_authenticated" on contact_ticket_messages;
create policy "messages_insert_authenticated"
on contact_ticket_messages
for insert
with check (auth.uid() is not null);

drop policy if exists "internal_messages_select_own" on internal_messages;
create policy "internal_messages_select_own"
on internal_messages
for select
using (from_user_id = auth.uid() or to_user_id = auth.uid());

drop policy if exists "internal_messages_insert_authenticated" on internal_messages;
create policy "internal_messages_insert_authenticated"
on internal_messages
for insert
with check (from_user_id = auth.uid());

drop policy if exists "faq_select_public" on contact_faq;
create policy "faq_select_public"
on contact_faq
for select
using (is_active = true);

insert into contact_faq (topic, question, answer, quick_link)
values
  ('cuenta', 'Como recupero mi cuenta?', 'Puedes usar la opcion de restablecer contrasena desde login.', '/reset-password'),
  ('pagos', 'Donde veo mis pagos?', 'En tu perfil, seccion de pagos y facturacion.', '/perfil'),
  ('uso de la plataforma', 'Como inicio con los ejercicios?', 'Entra a Training y selecciona nivel y habilidad.', '/training')
on conflict do nothing;
