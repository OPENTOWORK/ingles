import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { buildFoundingSurveyUrl, formatFoundingDeadline } from '@/lib/foundingSurveyLinks';
import {
  FOUNDING_SURVEY_QUESTIONS,
  FOUNDING_SURVEY_RESPONSE_DAYS,
  computeSurveyDeadline,
} from '@/lib/foundingSurvey.rules';

/** Mismo valor que `@/config/auth`, sin arrastrar TypeScript a los scripts. */
const ADMIN_EMAIL = 'direccion@opentowork.com';

const PROFILES_TABLE = 'Usuarios_y_Perfil_users';

/** Correos del equipo que reciben la prueba del formulario. */
export async function resolveAdminTestRecipients(adminClient) {
  const emails = new Set([ADMIN_EMAIL]);

  try {
    const { data: roles } = await adminClient.from('Usuarios_y_Perfil_roles').select('id, nombre');

    const adminRoleIds = (roles || [])
      .filter((r) => ['admin', 'administrador'].includes(String(r.nombre || '').toLowerCase()))
      .map((r) => r.id);

    if (adminRoleIds.length) {
      const { data: users } = await adminClient
        .from(PROFILES_TABLE)
        .select('email')
        .in('rol_id', adminRoleIds);

      for (const user of users || []) {
        const email = String(user.email || '').trim().toLowerCase();
        if (email) emails.add(email);
      }
    }
  } catch (err) {
    console.error('[foundingSurvey] admin recipients:', err);
  }

  return [...emails];
}

/**
 * Envía a los administradores el correo real de la encuesta, con un enlace a un
 * formulario de prueba que no guarda nada ni toca el plan de nadie.
 */
export async function sendFoundingSurveyTestEmail(adminClient, { to } = {}) {
  const recipients = to?.length
    ? to.map((e) => String(e).trim().toLowerCase()).filter(Boolean)
    : await resolveAdminTestRecipients(adminClient);

  if (!recipients.length) {
    return { ok: false, error: 'No hay destinatarios de prueba.' };
  }

  const previewUrl = buildFoundingSurveyUrl('preview');
  const fechaLimite = formatFoundingDeadline(computeSurveyDeadline(new Date()));
  const results = [];

  for (const email of recipients) {
    const mail = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY,
      to: email,
      variables: {
        email,
        nombre: '',
        encuesta_url: previewUrl,
        fecha_limite: fechaLimite,
        dias_plazo: String(FOUNDING_SURVEY_RESPONSE_DAYS),
        dias_restantes: String(FOUNDING_SURVEY_RESPONSE_DAYS),
      },
    });

    results.push({ email, sent: Boolean(mail?.sent || mail?.queued), error: mail?.error || null });
  }

  return {
    ok: results.some((r) => r.sent),
    previewUrl,
    preguntas: FOUNDING_SURVEY_QUESTIONS.length,
    results,
  };
}
