import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { formatNombreVariable } from '@/lib/renderEmailTemplate';
import { syncAutomatedEmailSystemTemplates } from '@/lib/syncAutomatedEmailSystemTemplates';
import { getWeeklyChallenge } from '@/data/weeklyTrainingChallenges';
import {
  buildWeeklyChallengeEmailVariables,
  isWeeklyTuesdaySendTime,
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
 * Envía el reto de la semana a todos los usuarios activos con el email confirmado.
 * Solo el martes a las 10:00, hora de Madrid.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {Date} [now]
 */
export async function runWeeklyTuesdayChallenge(adminClient, now = new Date()) {
  if (!adminClient) return { sent: 0, skipped: true };
  if (!isWeeklyTuesdaySendTime(now)) {
    return { sent: 0, skipped: true, reason: 'solo martes a las 10:00 (Madrid)' };
  }

  const challenge = getWeeklyChallenge(now);
  const weekStart = `${challenge.weekId}T00:00:00.000Z`;

  const [confirmedIds, usersRes, logsRes, queueRes] = await Promise.all([
    loadConfirmedUserIds(adminClient),
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

  const candidates = [];
  for (const user of usersRes.data || []) {
    const email = String(user.email || '').trim().toLowerCase();
    if (!email || isDisposableTestEmail(email) || already.has(email)) continue;
    if (!confirmedIds.has(user.id)) continue;

    candidates.push({
      email,
      nombre: user.nombre || '',
      creadoEn: user.creado_en || '',
    });
  }

  candidates.sort((a, b) => String(a.creadoEn).localeCompare(String(b.creadoEn)));

  try {
    await syncAutomatedEmailSystemTemplates(adminClient);
  } catch (err) {
    console.error('[weekly-tuesday] sync templates', err);
  }

  const challengeVariables = buildWeeklyChallengeEmailVariables(now, appOrigin());
  let sent = 0;
  const errors = [];

  for (const candidate of candidates) {
    const result = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.WEEKLY_TUESDAY_CHALLENGE,
      to: candidate.email,
      syncTemplates: false,
      variables: {
        nombre: formatNombreVariable(candidate.nombre),
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
    weekId: challenge.weekId,
    challengeId: challenge.id,
    ...(errors.length ? { errors } : {}),
  };
}
