/** Eventos que disparan correos automáticos. */
export const AUTOMATED_EMAIL_TRIGGERS = {
  USER_REGISTERED: 'user_registered',
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  ADMIN_USER_CREATED: 'admin_user_created',
  SUPPORT_REPLY_SENT: 'support_reply_sent',
};

export const AUTOMATED_EMAIL_TRIGGER_OPTIONS = [
  {
    value: AUTOMATED_EMAIL_TRIGGERS.USER_REGISTERED,
    label: 'Registro de usuario',
    description: 'Cuando un alumno se registra en la plataforma.',
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
