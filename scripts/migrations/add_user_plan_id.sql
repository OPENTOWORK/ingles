-- Plan asignado al usuario (FREE por defecto). Stripe activo tiene prioridad en la app.
alter table public."Usuarios_y_Perfil_users"
  add column if not exists plan_id text not null default 'free'
  check (plan_id in ('free', 'starter', 'premium', 'pro'));

comment on column public."Usuarios_y_Perfil_users".plan_id is
  'Plan asignado (free | premium | pro). Si hay suscripción Stripe activa, prevalece Stripe.';

update public."Usuarios_y_Perfil_users" u
set plan_id = lower(s.plan_id)
from public.suscripciones s
where s.user_id = u.id
  and s.status in ('trialing', 'active', 'past_due')
  and s.plan_id is not null;
