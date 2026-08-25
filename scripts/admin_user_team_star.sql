-- Estrella de equipo en panel admin (marcar usuarios del equipo)
ALTER TABLE public."Usuarios_y_Perfil_users"
  ADD COLUMN IF NOT EXISTS destacado_equipo boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public."Usuarios_y_Perfil_users".destacado_equipo IS
  'Marcador de equipo en panel admin: permite destacar usuarios para filtrar y gestionar el equipo.';

NOTIFY pgrst, 'reload schema';
