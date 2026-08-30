-- Invitaciones de referidos: quién invita a quién y si el invitado contrata plan de pago.
-- La escribe la API con service role; cada usuario solo lee las suyas.

create table if not exists public.referral_invitations (
  id uuid primary key default gen_random_uuid(),
  inviter_user_id uuid not null references auth.users (id) on delete cascade,
  invitee_email text not null,
  invite_token text not null unique,
  custom_message text,
  status text not null default 'sent'
    check (status in ('sent', 'registered', 'paid')),
  invited_user_id uuid references auth.users (id) on delete set null,
  paid_plan_slug text,
  email_sent_at timestamptz not null default now(),
  registered_at timestamptz,
  paid_at timestamptz,
  reward_granted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists referral_invitations_inviter_email_key
  on public.referral_invitations (inviter_user_id, invitee_email);

create index if not exists referral_invitations_inviter_idx
  on public.referral_invitations (inviter_user_id, created_at desc);

create index if not exists referral_invitations_invited_user_idx
  on public.referral_invitations (invited_user_id)
  where invited_user_id is not null;

alter table public.referral_invitations enable row level security;

drop policy if exists "Users can read their own referral invitations"
  on public.referral_invitations;
create policy "Users can read their own referral invitations"
  on public.referral_invitations
  for select
  to authenticated
  using ((select auth.uid()) = inviter_user_id);

create or replace function public.referral_invitations_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists referral_invitations_set_updated_at on public.referral_invitations;
create trigger referral_invitations_set_updated_at
  before update on public.referral_invitations
  for each row
  execute function public.referral_invitations_set_updated_at();

comment on table public.referral_invitations is
  'Invitaciones de amigos por referido. Solo la escribe la API con service role.';
comment on column public.referral_invitations.status is
  'sent = correo enviado; registered = amigo se registró; paid = amigo tiene plan de pago activo.';

notify pgrst, 'reload schema';
