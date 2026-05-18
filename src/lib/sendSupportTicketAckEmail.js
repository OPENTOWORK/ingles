import { Resend } from 'resend';
import { isResendDomainReady } from '@/lib/resendDomainReady';
import { sendSupportTicketViaSmtp } from '@/lib/sendSupportTicketViaSmtp';

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

  const smtp = await sendSupportTicketViaSmtp({
    to,
    subject: mailSubject,
    text,
  });

  if (smtp.sent) {
    return { sent: true, channel: smtp.channel };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey && (await isResendDomainReady())) {
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL?.trim() || 'soporte@dralo.es';
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: mailSubject,
      text,
    });
    if (!error) {
      return { sent: true, channel: 'resend' };
    }
    return {
      sent: false,
      error: error.message || 'No se pudo enviar el correo de confirmación.',
    };
  }

  return {
    sent: false,
    error: smtp.error || 'Correo de confirmación no configurado (SMTP / Resend).',
  };
}
