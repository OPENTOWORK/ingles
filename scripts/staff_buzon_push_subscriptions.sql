-- Web Push subscriptions for the installable Dralo staff app.
-- Each browser endpoint belongs to the last authenticated user who enabled it.

create table if not exists public.staff_buzon_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  expiration_time bigint,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_buzon_push_subscriptions_user_id_idx
  on public.staff_buzon_push_subscriptions (user_id);

alter table public.staff_buzon_push_subscriptions enable row level security;

drop policy if exists "Users can read their own push subscriptions"
  on public.staff_buzon_push_subscriptions;
create policy "Users can read their own push subscriptions"
  on public.staff_buzon_push_subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own push subscriptions"
  on public.staff_buzon_push_subscriptions;
create policy "Users can create their own push subscriptions"
  on public.staff_buzon_push_subscriptions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own push subscriptions"
  on public.staff_buzon_push_subscriptions;
create policy "Users can update their own push subscriptions"
  on public.staff_buzon_push_subscriptions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own push subscriptions"
  on public.staff_buzon_push_subscriptions;
create policy "Users can delete their own push subscriptions"
  on public.staff_buzon_push_subscriptions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.staff_buzon_push_subscriptions is
  'Web Push subscriptions for staff Buzón message notifications.';
