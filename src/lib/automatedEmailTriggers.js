/** Eventos que disparan correos automáticos. */
export const AUTOMATED_EMAIL_TRIGGERS = {
  USER_REGISTERED: 'user_registered',
  USER_EMAIL_CONFIRMATION: 'user_email_confirmation',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  ADMIN_USER_CREATED: 'admin_user_created',
  SUPPORT_REPLY_SENT: 'support_reply_sent',
  FRIEND_INVITED: 'friend_invited',
  STAFF_TASK_ASSIGNED: 'staff_task_assigned',
  STAFF_TASK_REMINDER: 'staff_task_reminder',
  STAFF_TASK_MESSAGE: 'staff_task_message',
  FOUNDING_MEMBER_PLUS_GRANTED: 'founding_member_plus_granted',
  FOUNDING_MEMBER_SURVEY: 'founding_member_survey',
  FOUNDING_MEMBER_SURVEY_REMINDER: 'founding_member_survey_reminder',
  FOUNDING_MEMBER_SURVEY_CONFIRMED: 'founding_member_survey_confirmed',
  FOUNDING_MEMBER_SURVEY_REVOKED: 'founding_member_survey_revoked',
};

export const AUTOMATED_EMAIL_TRIGGER_OPTIONS = [
  {
    value: AUTOMATED_EMAIL_TRIGGERS.USER_REGISTERED,
    label: 'Registro de usuario',
    description: 'La primera vez que el alumno entra con su email ya confirmado.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.USER_EMAIL_CONFIRMATION,
    label: 'Confirmación de email',
    description: 'Enlace para que el alumno confirme su correo tras registrarse.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.PASSWORD_RESET_REQUESTED,
    label: 'Recuperar contraseña',
    description: 'Cuando alguien pide restablecer su contraseña desde el login.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.SUPPORT_TICKET_CREATED,
    label: 'Ticket de soporte creado',
    description: 'Cuando un usuario envía un ticket de contacto.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.ADMIN_USER_CREATED,
    label: 'Cuenta creada por admin',
    description: 'Cuando un administrador crea una cuenta con contraseña temporal.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.SUPPORT_REPLY_SENT,
    label: 'Respuesta de soporte',
    description: 'Cuando soporte responde a un ticket desde el panel.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.FRIEND_INVITED,
    label: 'Invitar a un amigo',
    description: 'Cuando un usuario envía una invitación desde su perfil.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.STAFF_TASK_ASSIGNED,
    label: 'Tarea asignada (staff)',
    description: 'Cuando se crea una tarea y se asigna a una persona del equipo.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.STAFF_TASK_REMINDER,
    label: 'Recordatorio de tarea (staff)',
    description:
      'Cuando un administrador pulsa la campana de una tarea pendiente para avisar a la persona asignada.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.STAFF_TASK_MESSAGE,
    label: 'Mensaje en chat de tarea',
    description:
      'Avisa a los involucrados cuando hay un mensaje nuevo en la conversación de una tarea.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_PLUS_GRANTED,
    label: 'Plan Plus founding (50 primeras inscripciones)',
    description:
      'Se envía automáticamente a las inscripciones 2–50 con Plan Plus gratuito e indefinido, cuando confirman su email.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY,
    label: 'Encuesta founding (30 días)',
    description:
      'A los 30 días del alta: formulario para consolidar el Plan Plus de por vida. 7 días de plazo.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY_REMINDER,
    label: 'Recordatorio de la encuesta founding',
    description: 'Aviso a los 5 días si el formulario de los 30 días sigue sin responder.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY_CONFIRMED,
    label: 'Encuesta founding respondida',
    description: 'Confirma que el Plan Plus queda consolidado de por vida al enviar el formulario.',
  },
  {
    value: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY_REVOKED,
    label: 'Plan Plus founding retirado',
    description: 'Se envía cuando pasan los 7 días sin respuesta y se retira el Plan Plus.',
  },
];

export function getTriggerLabel(triggerEvent) {
  return (
    AUTOMATED_EMAIL_TRIGGER_OPTIONS.find((t) => t.value === triggerEvent)?.label ||
    triggerEvent ||
    '—'
  );
}

export function formatScheduleLabel(delayMinutos) {
  const n = Number(delayMinutos) || 0;
  if (n <= 0) return 'Inmediato (al ocurrir el evento)';
  if (n < 60) return `${n} min después del evento`;
  if (n < 1440) {
    const h = Math.floor(n / 60);
    const m = n % 60;
    return m ? `${h} h ${m} min después` : `${h} h después del evento`;
  }
  const d = Math.floor(n / 1440);
  return `${d} día${d !== 1 ? 's' : ''} después del evento`;
}
