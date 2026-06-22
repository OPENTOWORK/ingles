-- Correos automáticos gestionados desde el panel de soporte.

create table if not exists soporte_correos_automaticos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  trigger_event text not null,
  trigger_reason text not null default '',
  asunto text not null,
  cuerpo text not null,
  activo boolean not null default true,
  delay_minutos integer not null default 0 check (delay_minutos >= 0),
  es_sistema boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_soporte_correos_trigger on soporte_correos_automaticos(trigger_event);
create index if not exists idx_soporte_correos_activo on soporte_correos_automaticos(activo);

create table if not exists soporte_correos_cola (
  id uuid primary key default gen_random_uuid(),
  plantilla_id uuid references soporte_correos_automaticos(id) on delete set null,
  slug text,
  destinatario text not null,
  variables jsonb not null default '{}'::jsonb,
  enviar_en timestamptz not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'enviado', 'error')),
  intentos integer not null default 0,
  error_msg text,
  creado_en timestamptz not null default now(),
  enviado_en timestamptz
);

create index if not exists idx_soporte_correos_cola_pendiente
  on soporte_correos_cola(enviar_en)
  where estado = 'pendiente';

create table if not exists soporte_correos_log (
  id uuid primary key default gen_random_uuid(),
  plantilla_id uuid,
  slug text,
  destinatario text not null,
  trigger_event text,
  canal text,
  ok boolean not null default true,
  error_msg text,
  enviado_en timestamptz not null default now()
);

create index if not exists idx_soporte_correos_log_enviado on soporte_correos_log(enviado_en desc);

alter table soporte_correos_automaticos enable row level security;
alter table soporte_correos_cola enable row level security;
alter table soporte_correos_log enable row level security;

-- Plantillas iniciales (idempotente por slug)
insert into soporte_correos_automaticos (slug, nombre, trigger_event, trigger_reason, asunto, cuerpo, activo, delay_minutos, es_sistema)
values
  (
    'welcome_registration',
    'Bienvenida al registrarse',
    'user_registered',
    'Se envía cuando un alumno crea su cuenta en la plataforma (registro público).',
    '¡Bienvenido/a a Dralo English!',
    E'Hola{{nombre}},\n\n¡Gracias por registrarte en Dralo English!\n\nYa puedes iniciar sesión con tu email ({{email}}) y empezar a practicar inglés con ejercicios, teoría y simulacros de examen.\n\n{{login_url}}\n\nSi tienes cualquier duda, responde a este correo o usa la sección Contacto de la plataforma.\n\n— Equipo Dralo English',
    true,
    0,
    true
  ),
  (
    'support_ticket_ack',
    'Confirmación de ticket de soporte',
    'support_ticket_created',
    'Se envía al alumno cuando envía un ticket desde Contacto o «Report error».',
    'Hemos recibido tu consulta — Dralo English',
    E'Hola{{nombre}},\n\nGracias por contactar con Dralo English. Hemos recibido tu mensaje correctamente.\n\nAsunto: {{ticket_subject}}\n\nNuestro equipo de soporte lo revisará y te responderemos en un plazo no superior a 48 horas.\n\nSi necesitas añadir más detalles, puedes responder a este correo o crear un nuevo ticket desde la sección Contacto.\n\n— Equipo Dralo English',
    true,
    0,
    true
  ),
  (
    'admin_user_welcome',
    'Cuenta creada por administrador',
    'admin_user_created',
    'Se envía cuando un administrador o profesor crea una cuenta con contraseña temporal.',
    'Tu cuenta en Dralo English ha sido creada',
    E'Hola{{nombre}},\n\nTu cuenta ha sido creada por un administrador.\n\nEmail: {{email}}\nContraseña temporal: {{temporary_password}}\n\nTe recomendamos cambiar la contraseña en tu perfil tras iniciar sesión.\n\n{{login_url}}\n\n— Equipo Dralo English',
    true,
    0,
    true
  ),
  (
    'support_staff_reply',
    'Respuesta de soporte al usuario',
    'support_reply_sent',
    'Se envía al usuario cuando el equipo de soporte responde a su ticket desde el panel.',
    'Re: [Soporte] {{ticket_subject}}',
    E'Hola,\n\n{{message}}\n\n—\n{{agent_name}} · Equipo Dralo\n{{support_email}}',
    true,
    0,
    true
  ),
  (
    'friend_invite',
    'Invitar a un amigo',
    'friend_invited',
    'Se envía cuando un usuario invita a un amigo desde la sección «Invite friends» del perfil.',
    '{{sender_name}} te invita a practicar en Dralo',
    E'Hola,\n\n{{sender_name}} quiere que practiques inglés juntos en Dralo — la plataforma para preparar exámenes Cambridge (A2–C2) con ejercicios, simulacros de examen y herramientas de IA.\n\n{{invite_message}}\n\n{{app_url}}\n\nEmpieza con Exam practice, explora Dralo AI para writing y speaking, y sigue tu progreso desde tu perfil.\n\n— Equipo Dralo English',
    true,
    0,
    true
  )
on conflict (slug) do nothing;
