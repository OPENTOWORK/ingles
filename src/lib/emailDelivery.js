import { Resend } from 'resend';
import { isResendDomainReady } from '@/lib/resendDomainReady';
import { isSupportSmtpReady } from '@/lib/supportSmtpCredentials';
import { sendSupportTicketViaSmtp } from '@/lib/sendSupportTicketViaSmtp';

function isForceResendSandbox() {
  const v = String(process.env.RESEND_FORCE_SANDBOX_FROM || '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/** @returns {Promise<string | null>} */
export async function getResendFromAddress() {
  if (await isResendDomainReady()) {
    return process.env.RESEND_FROM_EMAIL?.trim() || 'soporte@dralo.es';
  }
  if (isForceResendSandbox()) {
    return 'onboarding@resend.dev';
  }
  return null;
}

export async function canUseResend() {
  if (!process.env.RESEND_API_KEY?.trim()) return false;
  return (await isResendDomainReady()) || isForceResendSandbox();
}

/**
 * @param {{ to: string, subject: string, text: string, replyTo?: string }} params
 */
export async function sendEmailViaResend({ to, subject, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = await getResendFromAddress();
  if (!apiKey || !from) {
    return { ok: false, error: 'resend_unavailable' };
  }

  const sandbox = from === 'onboarding@resend.dev';
  let actualTo = to;
  let actualSubject = subject;
  let actualText = text;

  if (sandbox) {
    const fallback = process.env.RESEND_DEV_FALLBACK_TO?.trim();
    if (!fallback) {
      return {
        ok: false,
        error:
          'Modo prueba Resend: falta RESEND_DEV_FALLBACK_TO (email de tu cuenta en resend.com).',
      };
    }
    if (to.toLowerCase() !== fallback.toLowerCase()) {
      actualTo = fallback;
      actualSubject = `[Para: ${to}] ${subject}`;
      actualText = `Destinatario previsto: ${to}\n\n${text}`;
    }
  }

  const resend = new Resend(apiKey);
  /** @type {Record<string, unknown>} */
  const payload = {
    from,
    to: [actualTo],
    subject: actualSubject,
    text: actualText,
  };
  if (replyTo) payload.replyTo = replyTo;

  const { error } = await resend.emails.send(payload);
  if (error) {
    return { ok: false, error: error.message || 'Error Resend' };
  }
  return {
    ok: true,
    channel: sandbox ? 'resend-sandbox' : 'resend',
    deliveredTo: actualTo,
  };
}

function buildConfigError() {
  const hasResendKey = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasSmtpUser = Boolean(process.env.SUPPORT_SMTP_USER?.trim());
  const hasSmtpPass = Boolean(process.env.SUPPORT_SMTP_PASS?.trim());

  if (hasResendKey && !isForceResendSandbox()) {
    return (
      'RESEND_API_KEY está en el servidor pero dralo.es no está verificado en Resend. ' +
      'Verifica el dominio en resend.com/domains o activa RESEND_FORCE_SANDBOX_FROM=true (solo pruebas).'
    );
  }

  if (hasSmtpUser && !hasSmtpPass) {
    return 'Falta SUPPORT_SMTP_PASS en Vercel (contraseña de aplicación Gmail, 16 caracteres).';
  }

  return (
    'Correo no configurado en producción. En Vercel → Settings → Environment Variables añade: ' +
    'RESEND_API_KEY (+ dominio dralo.es verificado), o SUPPORT_SMTP_USER y SUPPORT_SMTP_PASS. ' +
    'En local: /contacto/configurar-correo'
  );
}

/**
 * SMTP (env) → Resend (dominio o sandbox) → error claro.
 * @param {{ to: string, subject: string, text: string, replyTo?: string }} params
 */
export async function deliverTransactionalEmail({ to, subject, text, replyTo }) {
  if (isSupportSmtpReady()) {
    const smtp = await sendSupportTicketViaSmtp({ to, subject, text, replyTo });
    if (smtp.sent) return { ok: true, channel: 'smtp' };
    if (!smtp.skipped) {
      return { ok: false, error: smtp.error || 'Error SMTP' };
    }
  }

  if (await canUseResend()) {
    const resend = await sendEmailViaResend({ to, subject, text, replyTo });
    if (resend.ok) return resend;
    return { ok: false, error: resend.error || 'Error Resend' };
  }

  return { ok: false, error: buildConfigError() };
}
