import { generateAuthActionLink, getPublicSiteOrigin } from '@/lib/authActionLinks';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';

/** Horas mínimas desde el registro antes del primer aviso (cae en la ventana de 2–3 días). */
const FIRST_AFTER_DAYS = 2;
/** Días entre un aviso y el siguiente. */
const REPEAT_DAYS = 15;
/** Avisos de este tipo. El correo del momento del registro no cuenta. */
const MAX_REMINDERS = 6;
const DAILY_CAP = 15;

const DAY_MS = 24 * 60 * 60 * 1000;

function isDisposableTestEmail(email) {
  return /@(example\.com|mailinator\.com|dralo-smoke\.invalid)$/i.test(email);
}

function isEmailSignup(user) {
  const providers = user?.app_metadata?.providers;
  if (Array.isArray(providers) && providers.length) return providers.includes('email');
  const identities = user?.identities;
  if (Array.isArray(identities) && identities.length) {
    return identities.some((item) => item?.provider === 'email');
  }
  return true;
}

async function loadAuthUsers(adminClient) {
  const users = [];
  let page = 1;

  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const batch = data?.users || [];
    users.push(...batch);
    if (batch.length < 200) break;
    page += 1;
  }

  return users;
}

/**
 * Avisa a quien se registró con email y contraseña y sigue sin confirmar.
 * El primer correo sale al registrarse. Este otro, a los 2 días, y luego cada 15.
 * Cada envío lleva un enlace nuevo. No escribe la URL en ningún sitio.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 */
export async function runConfirmationReminders(adminClient) {
  if (!adminClient) return { sent: 0, skipped: true };

  try {
    const now = Date.now();
    const firstAfter = now - FIRST_AFTER_DAYS * DAY_MS;
    const repeatBefore = now - REPEAT_DAYS * DAY_MS;
    const authUsers = await loadAuthUsers(adminClient);

    const pending = authUsers.filter((user) => {
      const email = String(user.email || '').trim().toLowerCase();
      if (!email || isDisposableTestEmail(email)) return false;
      if (user.email_confirmed_at) return false;
      if (user.banned_until && new Date(user.banned_until).getTime() > now) return false;
      if (!isEmailSignup(user)) return false;
      const createdAt = user.created_at ? new Date(user.created_at).getTime() : now;
      return createdAt <= firstAfter;
    });

    if (!pending.length) return { sent: 0, eligible: 0 };

    const { data: logs, error: logsError } = await adminClient
      .from('soporte_correos_log')
      .select('destinatario, enviado_en, ok')
      .eq('trigger_event', AUTOMATED_EMAIL_TRIGGERS.CONFIRMATION_REMINDER)
      .eq('ok', true)
      .order('enviado_en', { ascending: false })
      .limit(2000);

    const remindersByEmail = new Map();
    for (const row of logsError ? [] : logs || []) {
      const email = String(row.destinatario || '').trim().toLowerCase();
      if (!email || !row.enviado_en) continue;
      const list = remindersByEmail.get(email) || [];
      list.push(new Date(row.enviado_en).getTime());
      remindersByEmail.set(email, list);
    }

    const due = pending
      .filter((user) => {
        const email = String(user.email).trim().toLowerCase();
        const sentAt = remindersByEmail.get(email) || [];
        if (sentAt.length >= MAX_REMINDERS) return false;
        if (sentAt.some((ts) => ts > repeatBefore)) return false;
        return true;
      })
      .sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')));

    const ids = due.slice(0, DAILY_CAP).map((user) => user.id).filter(Boolean);
    const nameById = new Map();
    if (ids.length) {
      const { data: profiles } = await adminClient
        .from('Usuarios_y_Perfil_users')
        .select('id, nombre')
        .in('id', ids);
      for (const profile of profiles || []) {
        if (profile.id) nameById.set(profile.id, profile.nombre || '');
      }
    }

    const origin = getPublicSiteOrigin();
    let sent = 0;
    const errors = [];

    for (const user of due.slice(0, DAILY_CAP)) {
      const email = String(user.email).trim().toLowerCase();
      try {
        const link = await generateAuthActionLink(adminClient, {
          type: 'signup',
          email,
          origin,
          next: '/exam-practice/b2/exam-reading-and-use-of-english',
        });

        if (link.alreadyRegistered || !link.url) {
          if (!link.alreadyRegistered && link.error) errors.push(`${email}: ${link.error}`);
          continue;
        }

        const result = await dispatchAutomatedEmail({
          adminClient,
          triggerEvent: AUTOMATED_EMAIL_TRIGGERS.CONFIRMATION_REMINDER,
          to: email,
          variables: {
            nombre: nameById.get(user.id) || '',
            email,
            action_url: link.url,
          },
        });

        if (result.sent) sent += 1;
        else if (result.error) errors.push(`${email}: ${result.error}`);
      } catch (err) {
        errors.push(`${email}: ${err?.message || 'Error al enviar'}`);
      }
    }

    return {
      sent,
      eligible: due.length,
      capped: Math.max(0, due.length - DAILY_CAP),
      ...(errors.length ? { errors } : {}),
    };
  } catch (err) {
    return { sent: 0, error: err?.message || 'Error en los recordatorios de confirmación' };
  }
}
