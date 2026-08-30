-- Consentimiento de comunicaciones comerciales (checkbox 3 del registro).
-- Ejecutar en el SQL Editor de Supabase si no se aplicó vía MCP.

alter table public."Usuarios_y_Perfil_users"
  add column if not exists consentimiento_comercial boolean not null default false;

comment on column public."Usuarios_y_Perfil_users".consentimiento_comercial is
  'Aceptación de comunicaciones comerciales en el registro.';

update public."Usuarios_y_Perfil_users" u
set consentimiento_comercial = coalesce(
  (
    select case
      when lower(coalesce(au.raw_user_meta_data->'legal_acceptance'->>'marketing_updates', '')) in ('true', 't', '1', 'yes', 'si', 'sí')
        then true
      when lower(coalesce(au.raw_user_meta_data->'legal_acceptance'->>'marketing_updates', '')) in ('false', 'f', '0', 'no')
        then false
      else null
    end
    from auth.users au
    where au.id = u.id
  ),
  u.consentimiento_comercial
);
