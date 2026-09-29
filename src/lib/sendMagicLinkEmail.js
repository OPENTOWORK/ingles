import { deliverTransactionalEmail } from '@/lib/emailDelivery';
import { buildBrandedEmailFromPlainText } from '@/lib/emailBrandedLayout';
import { generateAuthActionLink } from '@/lib/authActionLinks';

const DEFAULT_NEXT = '/exam-practice/b2/exam-reading-and-use-of-english';

/**
 * Envía un enlace mágico con la plantilla de Dralo, no con el correo por defecto de Supabase.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {{ email: string, nombre?: string, origin?: string, next?: string }} params
 */
export async function sendMagicLinkEmail(adminClient, { email, nombre, origin, next } = {}) {
  const to = String(email || '').trim().toLowerCase();
  if (!to) return { sent: false, error: 'Falta el email.' };

  const link = await generateAuthActionLink(adminClient, {
    type: 'magiclink',
    email: to,
    origin: origin || 'https://www.dralo.es',
    next: next || DEFAULT_NEXT,
  });
  if (!link.url) {
    return { sent: false, error: link.error || 'No se pudo crear el enlace de acceso.' };
  }

  const greetingName = String(nombre || '').trim();
  const hello = greetingName ? `Hola ${greetingName},` : 'Hola,';
  const subject = 'Tu enlace para entrar en Dralo English';
  const text = [
    hello,
    '',
    `Te escribimos para que entres en tu cuenta de Dralo English (${to}) sin contraseña.`,
    '',
    'Pulsa el botón. El enlace es personal, caduca en una hora y solo puede usarse una vez.',
    '',
    link.url,
    '',
    'Si no has pedido este acceso, ignora el correo. Nadie podrá entrar en tu cuenta sin este enlace.',
    '',
    '— Equipo Dralo English',
  ].join('\n');

  const { html } = buildBrandedEmailFromPlainText(text, {
    preheader: 'Enlace seguro para iniciar sesión. Caduca en una hora.',
    headline: 'Entra en tu cuenta',
    ctaLabel: 'Entrar en Dralo',
  });

  const result = await deliverTransactionalEmail({ to, subject, text, html });
  return {
    sent: Boolean(result.ok),
    channel: result.channel || null,
    deliveredTo: result.deliveredTo || to,
    error: result.ok ? null : result.error || 'No se pudo enviar el correo.',
  };
}
