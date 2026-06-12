import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';

/** Plantillas por defecto si la tabla aún no existe en Supabase. */
export const DEFAULT_AUTOMATED_EMAIL_TEMPLATES = [
  {
    slug: 'welcome_registration',
    nombre: 'Bienvenida al registrarse',
    trigger_event: AUTOMATED_EMAIL_TRIGGERS.USER_REGISTERED,
    trigger_reason:
      'Se envía cuando un alumno crea su cuenta en la plataforma (registro público).',
    asunto: '¡Bienvenido/a a Dralo English!',
    cuerpo: [
      'Hola{{nombre}},',
      '',
      '¡Gracias por registrarte en Dralo English!',
      '',
      'Ya puedes iniciar sesión con tu email ({{email}}) y empezar a practicar inglés con ejercicios, teoría y simulacros de examen.',
      '',
      '{{login_url}}',
      '',
      'Si tienes cualquier duda, responde a este correo o usa la sección Contacto de la plataforma.',
      '',
      '— Equipo Dralo English',
    ].join('\n'),
    activo: true,
    delay_minutos: 0,
    es_sistema: true,
  },
  {
    slug: 'support_ticket_ack',
    nombre: 'Confirmación de ticket de soporte',
    trigger_event: AUTOMATED_EMAIL_TRIGGERS.SUPPORT_TICKET_CREATED,
    trigger_reason:
      'Se envía al alumno cuando envía un ticket desde Contacto o «Report error».',
    asunto: 'Hemos recibido tu consulta — Dralo English',
    cuerpo: [
      'Hola{{nombre}},',
      '',
      'Gracias por contactar con Dralo English. Hemos recibido tu mensaje correctamente.',
      '',
      'Asunto: {{ticket_subject}}',
      '',
      'Nuestro equipo de soporte lo revisará y te responderemos en un plazo no superior a 48 horas.',
      '',
      'Si necesitas añadir más detalles, puedes responder a este correo o crear un nuevo ticket desde la sección Contacto.',
      '',
      '— Equipo Dralo English',
    ].join('\n'),
    activo: true,
    delay_minutos: 0,
    es_sistema: true,
  },
  {
    slug: 'admin_user_welcome',
    nombre: 'Cuenta creada por administrador',
    trigger_event: AUTOMATED_EMAIL_TRIGGERS.ADMIN_USER_CREATED,
    trigger_reason:
      'Se envía cuando un administrador o profesor crea una cuenta con contraseña temporal.',
    asunto: 'Tu cuenta en Dralo English ha sido creada',
    cuerpo: [
      'Hola{{nombre}},',
      '',
      'Tu cuenta ha sido creada por un administrador.',
      '',
      'Email: {{email}}',
      'Contraseña temporal: {{temporary_password}}',
      '',
      'Te recomendamos cambiar la contraseña en tu perfil tras iniciar sesión.',
      '',
      '{{login_url}}',
      '',
      '— Equipo Dralo English',
    ].join('\n'),
    activo: true,
    delay_minutos: 0,
    es_sistema: true,
  },
  {
    slug: 'support_staff_reply',
    nombre: 'Respuesta de soporte al usuario',
    trigger_event: AUTOMATED_EMAIL_TRIGGERS.SUPPORT_REPLY_SENT,
    trigger_reason:
      'Se envía al usuario cuando el equipo de soporte responde a su ticket desde el panel.',
    asunto: 'Re: [Soporte] {{ticket_subject}}',
    cuerpo: [
      'Hola,',
      '',
      '{{message}}',
      '',
      '—',
      '{{agent_name}} · Equipo Dralo',
      '{{support_email}}',
    ].join('\n'),
    activo: true,
    delay_minutos: 0,
    es_sistema: true,
  },
];

export function getDefaultTemplatesByTrigger(triggerEvent) {
  return DEFAULT_AUTOMATED_EMAIL_TEMPLATES.filter((t) => t.trigger_event === triggerEvent);
}
