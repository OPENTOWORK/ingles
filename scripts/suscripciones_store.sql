-- Suscripciones compradas en Google Play o en la App Store.
-- Ejecutar en el SQL Editor de Supabase. Es compatible con las filas de Stripe.
--
-- La app sigue escribiendo esta tabla solo desde el servidor (service role).
-- El alumno únicamente puede leer su fila.

alter table public.suscripciones
  alter column stripe_customer_id drop not null;

alter table public.suscripciones
  add column if not exists store text not null default 'stripe';

alter table public.suscripciones
  add column if not exists store_product_id text;

alter table public.suscripciones
  add column if not exists store_purchase_token text;

alter table public.suscripciones
  add column if not exists store_transaction_id text;

alter table public.suscripciones
  drop constraint if exists suscripciones_store_check;

alter table public.suscripciones
  add constraint suscripciones_store_check
  check (store in ('stripe', 'google', 'apple'));

create unique index if not exists suscripciones_store_transaction_id_idx
  on public.suscripciones (store_transaction_id)
  where store_transaction_id is not null;

comment on column public.suscripciones.store is
  'Origen del cobro: stripe (web), google (Play) o apple (App Store).';
comment on column public.suscripciones.store_product_id is
  'Id del producto en la tienda: plus_monthly, plus_yearly, premium_monthly, premium_yearly.';
comment on column public.suscripciones.store_purchase_token is
  'Token de Google Play. Vacío en Apple y en Stripe.';
comment on column public.suscripciones.store_transaction_id is
  'Token de Play o transacción original de Apple. Impide canjear la misma compra en otra cuenta.';

notify pgrst, 'reload schema';
