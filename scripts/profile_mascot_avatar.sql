-- Default Dralo avatar variant per user (assigned once at registration).
ALTER TABLE public."Usuarios_y_Perfil_profiles"
  ADD COLUMN IF NOT EXISTS mascot_variant smallint;

COMMENT ON COLUMN public."Usuarios_y_Perfil_profiles".mascot_variant IS
  'Dralo mascot PNG id for default profile photo when foto_url is empty.';

-- Assign a random mascot to existing profiles that do not have one yet.
UPDATE public."Usuarios_y_Perfil_profiles" AS p
SET mascot_variant = picks.variant
FROM (
  SELECT
    id,
    (ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16, 17])[
      1 + floor(random() * 15)::int
    ] AS variant
  FROM public."Usuarios_y_Perfil_profiles"
  WHERE mascot_variant IS NULL
) AS picks
WHERE p.id = picks.id;

-- Create profile rows (with random mascot) for app users missing a profile row.
INSERT INTO public."Usuarios_y_Perfil_profiles" (id, user_id, idioma_preferido, mascot_variant)
SELECT
  gen_random_uuid(),
  u.id,
  'es',
  (ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16, 17])[
    1 + floor(random() * 15)::int
  ]
FROM public."Usuarios_y_Perfil_users" AS u
WHERE NOT EXISTS (
  SELECT 1
  FROM public."Usuarios_y_Perfil_profiles" AS p
  WHERE p.user_id = u.id
);
