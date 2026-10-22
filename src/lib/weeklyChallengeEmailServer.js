import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { isStudentRole } from '@/lib/userRoleServer';
import { getWeeklyChallenge } from '@/data/weeklyTrainingChallenges';
import {
  WEEKLY_CHALLENGE_SEND_CAP,
  buildWeeklyChallengeEmailVariables,
  isWeeklyChallengeMailDay,
} from '@/lib/weeklyChallengeEmail';

const SLUG = 'weekly_tuesday_challenge';

function isDisposableTestEmail(email) {
  return /@(example\.com|mailinator\.com|dralo-smoke\.invalid)$/i.test(email);
}

function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.dralo.es'
  );
}

async function loadConfirmedUserIds(adminClient) {
  const confirmed = new Set();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    for (const user of users) {
      if (user.email_confirmed_at && user.id) confirmed.add(user.id);
    }
    if (users.length < 200) break;
    page += 1;
  }

  return confirmed;
}

/**
 * Envía el reto de la semana a alumnos confirmados.
 * El martes abre la tanda; de miércoles a domingo solo salen los que faltaban.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {Date} [now]
 */
export async function runWeeklyTuesdayChallenge(adminClient, now = new Date()) {
  if (!adminClient) return { sent: 0, skipped: true };
  if (!isWeeklyChallengeMailDay(now)) {
    return { sent: 0, skipped: true, reason: 'fuera de la semana del reto' };
  }

  const challenge = getWeeklyChallenge(now);
  const weekStart = `${challenge.weekId}T00:00:00.000Z`;

  const [confirmedIds, rolesRes, usersRes, logsRes, queueRes] = await Promise.all([
    loadConfirmedUserIds(adminClient),
    adminClient.from('Usuarios_y_Perfil_roles').select('id, nombre'),
    adminClient
      .from('Usuarios_y_Perfil_users')
      .select('id, email, nombre, activo, rol_id, destacado_equipo, creado_en')
      .eq('activo', true),
    adminClient
      .from('soporte_correos_log')
      .select('destinatario')
      .eq('slug', SLUG)
      .eq('ok', true)
      .gte('enviado_en', weekStart)
      .limit(5000),
    adminClient
      .from('soporte_correos_cola')
      .select('destinatario, estado')
      .eq('slug', SLUG)
      .gte('enviar_en', weekStart)
      .in('estado', ['pendiente', 'enviado'])
      .limit(5000),
  ]);

  if (usersRes.error) return { sent: 0, error: usersRes.error.message };
  if (logsRes.error) return { sent: 0, error: logsRes.error.message };

  const already = new Set();
  for (const row of logsRes.data || []) {
    const email = String(row.destinatario || '').trim().toLowerCase();
    if (email) already.add(email);
  }
  for (const row of queueRes.error ? [] : queueRes.data || []) {
    const email = String(row.destinatario || '').trim().toLowerCase();
    if (email) already.add(email);
  }

  const roleNameById = new Map(
    (rolesRes.data || []).map((role) => [role.id, role.nombre || 'student']),
  );

  const candidates = [];
  for (const user of usersRes.data || []) {
    const email = String(user.email || '').trim().toLowerCase();
    if (!email || isDisposableTestEmail(email) || already.has(email)) continue;
    if (user.destacado_equipo) continue;
    if (!confirmedIds.has(user.id)) continue;

    const roleName = user.rol_id ? roleNameById.get(user.rol_id) || 'student' : 'student';
    if (!isStudentRole(roleName)) continue;

    candidates.push({
      email,
      nombre: user.nombre || '',
      creadoEn: user.creado_en || '',
    });
  }

  candidates.sort((a, b) => String(a.creadoEn).localeCompare(String(b.creadoEn)));

  const challengeVariables = buildWeeklyChallengeEmailVariables(now, appOrigin());
  let sent = 0;
  const errors = [];

  for (const candidate of candidates.slice(0, WEEKLY_CHALLENGE_SEND_CAP)) {
    const result = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.WEEKLY_TUESDAY_CHALLENGE,
      to: candidate.email,
      variables: {
        nombre: candidate.nombre,
        email: candidate.email,
        ...challengeVariables,
      },
    });

    if (result.sent || result.queued) sent += 1;
    else if (result.error) {
      errors.push(`${candidate.email}: ${result.error}`);
      if (String(result.error).includes('No hay plantillas')) break;
    }
  }

  return {
    sent,
    eligible: candidates.length,
    capped: Math.max(0, candidates.length - WEEKLY_CHALLENGE_SEND_CAP),
    weekId: challenge.weekId,
    challengeId: challenge.id,
    ...(errors.length ? { errors } : {}),
  };
}
