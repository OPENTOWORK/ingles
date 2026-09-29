import { deliverTransactionalEmail } from '@/lib/emailDelivery';
import { buildBrandedEmailFromPlainText } from '@/lib/emailBrandedLayout';

/**
 * Crea un código de 6 dígitos y lo envía con el correo de Dralo.
 * No incluye el enlace mágico: los antivirus lo abren y consumen el código
 * antes de que la persona lo vea.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {{ email: string, nombre?: string }} params
 */
export async function sendAccountDeletionCodeEmail(adminClient, { email, nombre }) {
  const to = String(email || '').trim().toLowerCase();
  if (!to) return { sent: false, error: 'Falta el email de la cuenta.' };

  let { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: to,
  });

  if (error) {
    return { sent: false, error: error.message || 'No se pudo crear el código.' };
  }

  const code = String(data?.properties?.email_otp || '').trim();
  const otpType = data?.properties?.verification_type || 'magiclink';
  if (!/^\d{6}$/.test(code)) {
    return { sent: false, error: 'No se pudo crear el código de confirmación.' };
  }

  const greetingName = String(nombre || '').trim();
  const hello = greetingName ? `Hola ${greetingName},` : 'Hola,';
  const subject = 'Código para eliminar tu cuenta — Dralo English';
  const text = [
    hello,
    '',
    `Has pedido eliminar la cuenta de Dralo asociada a ${to}.`,
    '',
    'Introduce este código en la app para confirmarlo:',
    '',
    code,
    '',
    'Caduca en una hora y solo sirve una vez. Si no has pedido darte de baja, ignora este correo: tu cuenta sigue activa.',
    '',
    '— Equipo Dralo English',
  ].join('\n');

  const { html } = buildBrandedEmailFromPlainText(text, {
    preheader: 'Tu código para confirmar la baja de la cuenta',
    headline: 'Confirma la baja de tu cuenta',
  });

  const result = await deliverTransactionalEmail({ to, subject, text, html });
  if (!result.ok) {
    return { sent: false, error: result.error || 'No se pudo enviar el correo.', otpType };
  }

  return { sent: true, channel: result.channel || null, otpType };
}
