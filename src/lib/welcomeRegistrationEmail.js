import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';

const LOG_TABLE = 'soporte_correos_log';
const WELCOME_SLUG = 'welcome_registration';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

export function extractAuthUserNombre(user) {
  return (
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.nombre ||
    ''
  );
}

export async function hasWelcomeRegistrationEmailBeenSent(adminClient, email) {
  if (!adminClient || !email) return false;

  try {
    const normalized = String(email).trim().toLowerCase();
    const { data, error } = await adminClient
      .from(LOG_TABLE)
      .select('id')
      .eq('slug', WELCOME_SLUG)
      .eq('destinatario', normalized)
      .eq('ok', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) return false;
      console.error('[welcomeRegistrationEmail] log lookup:', error);
      return false;
    }

    return Boolean(data?.id);
  } catch (err) {
    console.error('[welcomeRegistrationEmail] log lookup:', err);
    return false;
  }
}

/**
 * Envía la bienvenida de registro una sola vez (email/password u OAuth/Google).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {{ email?: string | null, user_metadata?: Record<string, unknown> }} user
 */
export async function maybeSendWelcomeRegistrationEmail(adminClient, user) {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!adminClient || !email) {
    return { sent: false, skipped: true, reason: 'missing_params' };
  }

  if (await hasWelcomeRegistrationEmailBeenSent(adminClient, email)) {
    return { sent: false, skipped: true, reason: 'already_sent' };
  }

  return dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.USER_REGISTERED,
    to: email,
    variables: {
      email,
      nombre: extractAuthUserNombre(user),
    },
  });
}
