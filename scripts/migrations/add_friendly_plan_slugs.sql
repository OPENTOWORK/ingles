-- Friendly PLUS / Friendly PREMIUM: planes gratuitos asignables solo desde admin.
-- Slugs: friendly_plus (mismos permisos que premium/PLUS) y friendly_premium (mismos que pro/PREMIUM).

ALTER TABLE public."Usuarios_y_Perfil_users"
  DROP CONSTRAINT IF EXISTS "Usuarios_y_Perfil_users_plan_id_check";

ALTER TABLE public."Usuarios_y_Perfil_users"
  DROP CONSTRAINT IF EXISTS usuarios_y_perfil_users_plan_id_check;

ALTER TABLE public."Usuarios_y_Perfil_users"
  ADD CONSTRAINT usuarios_y_perfil_users_plan_id_check
  CHECK (
    plan_id IN (
      'free',
      'starter',
      'premium',
      'pro',
      'friendly_plus',
      'friendly_premium'
    )
  );

COMMENT ON COLUMN public."Usuarios_y_Perfil_users".plan_id IS
  'Plan asignado: free | premium | pro (Stripe) | friendly_plus | friendly_premium (admin). Si hay suscripción Stripe activa, prevalece Stripe.';

NOTIFY pgrst, 'reload schema';
