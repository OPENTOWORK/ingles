import { APP_ROUTES } from '@/config/appRoutes';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { isStudentRole } from '@/lib/userRoleServer';

/** Días en silencio antes del primer aviso. */
const IDLE_DAYS = 3;
/** Días entre un aviso y el siguiente. */
const REPEAT_DAYS = 7;
/** Avisos seguidos sin que vuelva. Al practicar, la cuenta se reinicia. */
const MAX_REMINDERS = 4;
/** Tope por mañana, para no salir todos el mismo día. */
const DAILY_CAP = 15;

const DAY_MS = 24 * 60 * 60 * 1000;

function isDisposableTestEmail(email) {
  return /@(example\.com|mailinator\.com|dralo-smoke\.invalid)$/i.test(email);
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
 * Avisa a alumnos confirmados que llevan días sin practicar.
 * Corre con el cron diario de correos. No escribe a quien no ha confirmado el email.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 */
export async function runPracticeReminders(adminClient) {
  if (!adminClient) return { sent: 0, skipped: true };

  const now = Date.now();
  const idleBefore = new Date(now - IDLE_DAYS * DAY_MS).toISOString();
  const repeatBefore = now - REPEAT_DAYS * DAY_MS;

  const [confirmedIds, rolesRes, usersRes, sessionsRes, logsRes] = await Promise.all([
    loadConfirmedUserIds(adminClient),
    adminClient.from('Usuarios_y_Perfil_roles').select('id, nombre'),
    adminClient
      .from('Usuarios_y_Perfil_users')
      .select('id, email, nombre, activo, rol_id, destacado_equipo, creado_en')
      .eq('activo', true),
    adminClient
      .from('usuario_sesiones_app')
      .select('user_id, started_at')
      .order('started_at', { ascending: false })
      .limit(10000),
    adminClient
      .from('soporte_correos_log')
      .select('destinatario, enviado_en, ok')
      .eq('trigger_event', AUTOMATED_EMAIL_TRIGGERS.PRACTICE_REMINDER)
      .eq('ok', true)
      .order('enviado_en', { ascending: false })
      .limit(2000),
  ]);

  if (usersRes.error) return { sent: 0, error: usersRes.error.message };
  if (sessionsRes.error) return { sent: 0, error: sessionsRes.error.message };

  const roleNameById = new Map(
    (rolesRes.data || []).map((role) => [role.id, role.nombre || 'student']),
  );
  const lastPracticeByUser = new Map();
  for (const session of sessionsRes.data || []) {
    if (session.user_id && !lastPracticeByUser.has(session.user_id)) {
      lastPracticeByUser.set(session.user_id, session.started_at);
    }
  }

  const remindersByEmail = new Map();
  for (const row of logsRes.error ? [] : logsRes.data || []) {
    const email = String(row.destinatario || '').trim().toLowerCase();
    if (!email || !row.enviado_en) continue;
    const list = remindersByEmail.get(email) || [];
    list.push(new Date(row.enviado_en).getTime());
    remindersByEmail.set(email, list);
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.dralo.es';
  const practiceUrl = `${base.replace(/\/$/, '')}${APP_ROUTES.examPracticeStudentEntry}/`;

  const candidates = [];

  for (const user of usersRes.data || []) {
    const email = String(user.email || '').trim().toLowerCase();
    if (!email || isDisposableTestEmail(email)) continue;
    if (user.destacado_equipo) continue;
    if (!confirmedIds.has(user.id)) continue;

    const roleName = user.rol_id ? roleNameById.get(user.rol_id) || 'student' : 'student';
    if (!isStudentRole(roleName)) continue;

    const registeredAt = user.creado_en ? new Date(user.creado_en).getTime() : now;
    if (now - registeredAt < IDLE_DAYS * DAY_MS) continue;

    const lastPractice = lastPracticeByUser.get(user.id) || null;
    const lastPracticeAt = lastPractice ? new Date(lastPractice).getTime() : 0;
    const idleSince = lastPractice || user.creado_en;
    if (idleSince && idleSince > idleBefore) continue;

    const sentAt = (remindersByEmail.get(email) || []).filter((ts) => ts > lastPracticeAt);
    if (sentAt.length >= MAX_REMINDERS) continue;
    if (sentAt.some((ts) => ts > repeatBefore)) continue;

    candidates.push({
      email,
      nombre: user.nombre || '',
      idleSince: idleSince || user.creado_en || '',
    });
  }

  candidates.sort((a, b) => String(a.idleSince).localeCompare(String(b.idleSince)));

  let sent = 0;
  const errors = [];

  for (const candidate of candidates.slice(0, DAILY_CAP)) {
    const result = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.PRACTICE_REMINDER,
      to: candidate.email,
      variables: {
        nombre: candidate.nombre,
        email: candidate.email,
        action_url: practiceUrl,
      },
    });

    if (result.sent) sent += 1;
    else if (result.error) errors.push(`${candidate.email}: ${result.error}`);
  }

  return {
    sent,
    eligible: candidates.length,
    capped: Math.max(0, candidates.length - DAILY_CAP),
    ...(errors.length ? { errors } : {}),
  };
}
