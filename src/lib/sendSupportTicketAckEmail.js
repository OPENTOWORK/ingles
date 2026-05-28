import { deliverTransactionalEmail } from '@/lib/emailDelivery';

/**
 * Confirmación al estudiante: hemos recibido el ticket y responderemos en ≤48 h.
 */
export async function sendSupportTicketAckEmail({ to, name, subject }) {
  const firstName = String(name || '')
    .trim()
    .split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,';

  const mailSubject = 'Hemos recibido tu consulta — Dralo English';
  const text = [
    greeting,
    '',
    'Gracias por contactar con Dralo English. Hemos recibido tu mensaje correctamente.',
    '',
    subject ? `Asunto: ${subject}` : null,
    '',
    'Nuestro equipo de soporte lo revisará y te responderemos en un plazo no superior a 48 horas.',
    '',
    'Si necesitas añadir más detalles, puedes responder a este correo o crear un nuevo ticket desde la sección Contacto de la plataforma.',
    '',
    '— Equipo Dralo English',
    'draloenglish@gmail.com',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const result = await deliverTransactionalEmail({
    to,
    subject: mailSubject,
    text,
  });

  if (result.ok) {
    return { sent: true, channel: result.channel };
  }

  return {
    sent: false,
    error: result.error || 'Correo de confirmación no configurado.',
  };
}
