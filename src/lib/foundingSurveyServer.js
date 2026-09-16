import { randomBytes } from 'node:crypto';

import { assignUserPlan } from '@/lib/adminUserPlan';
import { findSubscriptionByUserId } from '@/lib/stripe/subscriptions';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { formatNombreVariable } from '@/lib/renderEmailTemplate';
import { FIRST_AUTO_SLOT, MAX_FOUNDING_SLOT, PLUS_PLAN_SLUG } from '@/lib/foundingMemberPlus.rules';
import { buildFoundingSurveyUrl, formatFoundingDeadline } from '@/lib/foundingSurveyLinks';
import {
  FOUNDING_SURVEY_RESPONSE_DAYS,
  computeSurveyDeadline,
  daysLeftToAnswer,
  getSurveyState,
  isSurveyDue,
  isSurveyExpired,
  needsReminder,
  summarizeFoundingSurveyCampaign,
  validateSurveyAnswers,
} from '@/lib/foundingSurvey.rules';

const SURVEY_TABLE = 'founding_member_encuestas';
const GRANTS_TABLE = 'founding_member_grants';
const PROFILES_TABLE = 'Usuarios_y_Perfil_users';
const FREE_PLAN_SLUG = 'free';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

function newSurveyToken() {
  return randomBytes(24).toString('base64url');
}

/** Nombre y email de perfil para personalizar el correo. */
async function loadProfiles(adminClient, userIds) {
  const map = new Map();
  if (!userIds.length) return map;

  const { data, error } = await adminClient
    .from(PROFILES_TABLE)
    .select('id, nombre, email')
    .in('id', userIds);

  if (error) {
    console.error('[foundingSurvey] load profiles:', error);
    return map;
  }

  for (const row of data || []) map.set(String(row.id), row);
  return map;
}

/**
 * La campaña solo puede tocar el Plan Plus que ella misma regaló. Si por el
 * camino el alumno ha pasado por caja o le han concedido un Friendly a mano,
 * ese plan no es nuestro y se queda como está.
 * @returns {Promise<{ revocable: boolean, motivo?: string, planActual: string }>}
 */
async function assessRevocability(adminClient, userId) {
  const { data: profile } = await adminClient
    .from(PROFILES_TABLE)
    .select('plan_id')
    .eq('id', userId)
    .maybeSingle();

  const planActual = String(profile?.plan_id || FREE_PLAN_SLUG);

  try {
    const sub = await findSubscriptionByUserId(adminClient, userId);
    if (sub && subscriptionGrantsAccess(sub.status)) {
      return { revocable: false, motivo: `suscripcion_activa:${sub.status}`, planActual };
    }
  } catch (err) {
    console.error('[foundingSurvey] check subscription:', err);
  }

  if (planActual !== PLUS_PLAN_SLUG) {
    return { revocable: false, motivo: `plan_externo:${planActual}`, planActual };
  }

  return { revocable: true, planActual };
}

function surveyEmailVariables(row, profile) {
  const deadline = row.vence_en ? new Date(row.vence_en) : computeSurveyDeadline(new Date());
  return {
    email: row.email,
    nombre: formatNombreVariable(profile?.nombre),
    encuesta_url: buildFoundingSurveyUrl(row.token),
    fecha_limite: formatFoundingDeadline(deadline),
    dias_plazo: String(FOUNDING_SURVEY_RESPONSE_DAYS),
    dias_restantes: String(daysLeftToAnswer(row) ?? FOUNDING_SURVEY_RESPONSE_DAYS),
    slot_number: String(row.slot_number),
  };
}

/**
 * Envía la encuesta a los founding members que ya han cumplido 30 días
 * y todavía no la han recibido.
 */
async function sendDueSurveys(adminClient, { limit = 50 } = {}) {
  const { data: grants, error } = await adminClient
    .from(GRANTS_TABLE)
    .select('user_id, slot_number, email, granted_at')
    .gte('slot_number', FIRST_AUTO_SLOT)
    .lte('slot_number', MAX_FOUNDING_SLOT)
    .order('slot_number', { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return { enviadas: 0, skipped: true };
    throw error;
  }

  const due = (grants || []).filter((g) => isSurveyDue(g.granted_at));
  if (!due.length) return { enviadas: 0 };

  const { data: existing, error: existingError } = await adminClient
    .from(SURVEY_TABLE)
    .select('user_id')
    .in(
      'user_id',
      due.map((g) => g.user_id),
    );

  if (existingError) {
    if (isMissingTableError(existingError)) return { enviadas: 0, skipped: true };
    throw existingError;
  }

  const alreadySent = new Set((existing || []).map((r) => String(r.user_id)));
  const pending = due.filter((g) => !alreadySent.has(String(g.user_id))).slice(0, limit);
  if (!pending.length) return { enviadas: 0 };

  const profiles = await loadProfiles(
    adminClient,
    pending.map((g) => g.user_id),
  );

  let enviadas = 0;
  const errores = [];

  for (const grant of pending) {
    const sentAt = new Date();
    const row = {
      user_id: grant.user_id,
      slot_number: grant.slot_number,
      email: String(grant.email || '').trim().toLowerCase(),
      token: newSurveyToken(),
      enviada_en: sentAt.toISOString(),
      vence_en: computeSurveyDeadline(sentAt).toISOString(),
    };

    // Se persiste antes de enviar: si el correo falla, el plazo ya está fijado
    // y el reintento no genera un segundo token para el mismo alumno.
    const { data: inserted, error: insertError } = await adminClient
      .from(SURVEY_TABLE)
      .insert(row)
      .select('*')
      .maybeSingle();

    if (insertError) {
      if (insertError.code === '23505') continue; // otra ejecución se adelantó
      errores.push(`${grant.email}: ${insertError.message}`);
      continue;
    }

    const mail = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY,
      to: row.email,
      variables: surveyEmailVariables(inserted || row, profiles.get(String(grant.user_id))),
    });

    if (mail?.sent || mail?.queued) enviadas += 1;
    else errores.push(`${grant.email}: ${mail?.error || 'no enviado'}`);
  }

  return { enviadas, errores };
}

/** Recordatorio a quienes aún no han respondido y se les acaba el plazo. */
async function sendReminders(adminClient) {
  const { data, error } = await adminClient
    .from(SURVEY_TABLE)
    .select('*')
    .is('respondida_en', null)
    .is('plan_revocado_en', null)
    .is('recordatorio_enviado_en', null);

  if (error) {
    if (isMissingTableError(error)) return { recordatorios: 0, skipped: true };
    throw error;
  }

  const pending = (data || []).filter((row) => needsReminder(row));
  if (!pending.length) return { recordatorios: 0 };

  const profiles = await loadProfiles(
    adminClient,
    pending.map((r) => r.user_id),
  );

  let recordatorios = 0;

  for (const row of pending) {
    const mail = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY_REMINDER,
      to: row.email,
      variables: surveyEmailVariables(row, profiles.get(String(row.user_id))),
    });

    if (!(mail?.sent || mail?.queued)) continue;

    await adminClient
      .from(SURVEY_TABLE)
      .update({ recordatorio_enviado_en: new Date().toISOString() })
      .eq('id', row.id);

    recordatorios += 1;
  }

  return { recordatorios };
}

/** Retira el Plan Plus a quien no ha respondido dentro del plazo. */
async function revokeExpired(adminClient) {
  const { data, error } = await adminClient
    .from(SURVEY_TABLE)
    .select('*')
    .is('respondida_en', null)
    .is('plan_revocado_en', null);

  if (error) {
    if (isMissingTableError(error)) return { revocados: 0, skipped: true };
    throw error;
  }

  const expired = (data || []).filter((row) => isSurveyExpired(row));
  if (!expired.length) return { revocados: 0 };

  const profiles = await loadProfiles(
    adminClient,
    expired.map((r) => r.user_id),
  );

  let revocados = 0;
  let omitidos = 0;
  const errores = [];

  for (const row of expired) {
    const { revocable, motivo } = await assessRevocability(adminClient, row.user_id);

    // El orden importa: el trigger `preserve_founding_member_plus` vuelve a
    // poner `premium` mientras `plan_revocado_en` siga a null.
    const { error: markError } = await adminClient
      .from(SURVEY_TABLE)
      .update({
        plan_revocado_en: new Date().toISOString(),
        revocacion_omitida_motivo: motivo || null,
      })
      .eq('id', row.id)
      .is('plan_revocado_en', null);

    if (markError) {
      errores.push(`${row.email}: ${markError.message}`);
      continue;
    }

    // El plan no salió de esta campaña: cerramos la encuesta y no tocamos nada.
    if (!revocable) {
      omitidos += 1;
      continue;
    }

    try {
      await assignUserPlan(adminClient, row.user_id, FREE_PLAN_SLUG);
    } catch (err) {
      // Deshacer la marca para que el siguiente cron lo reintente.
      await adminClient
        .from(SURVEY_TABLE)
        .update({ plan_revocado_en: null, revocacion_omitida_motivo: null })
        .eq('id', row.id);
      errores.push(`${row.email}: ${err?.message || 'no se pudo retirar el plan'}`);
      continue;
    }

    revocados += 1;

    await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY_REVOKED,
      to: row.email,
      variables: surveyEmailVariables(row, profiles.get(String(row.user_id))),
    });
  }

  return { revocados, omitidos, errores };
}

/** Cupos ocupados, para saber si la campaña puede darse por cerrada. */
async function countClaimedSlots(adminClient) {
  const { count, error } = await adminClient
    .from(GRANTS_TABLE)
    .select('user_id', { count: 'exact', head: true });

  if (error) {
    if (isMissingTableError(error)) return 0;
    throw error;
  }
  return count || 0;
}

export async function getFoundingSurveyCampaignStatus(adminClient) {
  const [{ data: surveys, error }, claimedSlots] = await Promise.all([
    adminClient.from(SURVEY_TABLE).select('*').order('slot_number', { ascending: true }),
    countClaimedSlots(adminClient),
  ]);

  if (error) {
    if (isMissingTableError(error)) {
      return { ...summarizeFoundingSurveyCampaign([], { claimedSlots }), rows: [] };
    }
    throw error;
  }

  const rows = surveys || [];
  return {
    ...summarizeFoundingSurveyCampaign(rows, { claimedSlots }),
    rows: rows.map((row) => ({
      slot_number: row.slot_number,
      email: row.email,
      estado: getSurveyState(row),
      enviada_en: row.enviada_en,
      vence_en: row.vence_en,
      respondida_en: row.respondida_en,
      plan_revocado_en: row.plan_revocado_en,
      revocacion_omitida_motivo: row.revocacion_omitida_motivo,
    })),
  };
}

/**
 * Pasada diaria completa: envía las encuestas que tocan, recuerda las que van a
 * vencer y retira el plan a las vencidas. Se detiene sola cuando la campaña
 * termina (50 cupos ocupados y ninguna encuesta sin resolver).
 */
export async function runFoundingSurveyCampaign(adminClient, { limit = 50 } = {}) {
  if (!adminClient) return { ok: false, error: 'Sin service role' };

  try {
    const before = await getFoundingSurveyCampaignStatus(adminClient);
    if (before.finished) {
      return { ok: true, finished: true, skipped: 'campaña finalizada', resumen: before };
    }

    const enviadas = await sendDueSurveys(adminClient, { limit });
    const recordatorios = await sendReminders(adminClient);
    const revocados = await revokeExpired(adminClient);
    const after = await getFoundingSurveyCampaignStatus(adminClient);

    return {
      ok: true,
      finished: after.finished,
      enviadas: enviadas.enviadas,
      recordatorios: recordatorios.recordatorios,
      revocados: revocados.revocados,
      omitidos: revocados.omitidos || 0,
      errores: [...(enviadas.errores || []), ...(revocados.errores || [])],
      resumen: after,
    };
  } catch (err) {
    console.error('[foundingSurvey] campaign run:', err);
    return { ok: false, error: err?.message || 'Error en la campaña de encuestas' };
  }
}

/** Carga la encuesta asociada a un token del correo. */
export async function getFoundingSurveyByToken(adminClient, token) {
  const clean = String(token || '').trim();
  if (!clean) return { error: 'Enlace no válido.', status: 404 };

  const { data, error } = await adminClient
    .from(SURVEY_TABLE)
    .select('*')
    .eq('token', clean)
    .maybeSingle();

  if (error && !isMissingTableError(error)) {
    console.error('[foundingSurvey] load by token:', error);
    return { error: 'No se pudo cargar el formulario.', status: 500 };
  }
  if (!data) return { error: 'Este enlace no existe o ya no es válido.', status: 404 };

  const profile = (await loadProfiles(adminClient, [data.user_id])).get(String(data.user_id));

  return {
    survey: data,
    estado: getSurveyState(data),
    diasRestantes: daysLeftToAnswer(data),
    fechaLimite: data.vence_en ? formatFoundingDeadline(data.vence_en) : '',
    nombre: String(profile?.nombre || '').trim().split(/\s+/)[0] || '',
  };
}

/**
 * Guarda las respuestas y consolida el Plan Plus de por vida.
 */
export async function submitFoundingSurvey(adminClient, token, rawAnswers) {
  const loaded = await getFoundingSurveyByToken(adminClient, token);
  if (loaded.error) return loaded;

  const { survey } = loaded;

  if (survey.respondida_en) {
    return { error: 'Ya hemos recibido tus respuestas. ¡Gracias!', status: 409 };
  }
  if (survey.plan_revocado_en || isSurveyExpired(survey)) {
    return {
      error: 'El plazo para responder ya ha terminado. Escríbenos si quieres recuperar el Plan Plus.',
      status: 410,
    };
  }

  const validated = validateSurveyAnswers(rawAnswers);
  if (!validated.ok) {
    return { error: 'Revisa las respuestas marcadas.', errors: validated.errors, status: 400 };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await adminClient
    .from(SURVEY_TABLE)
    .update({ respuestas: validated.answers, respondida_en: now, plan_confirmado_en: now })
    .eq('id', survey.id)
    .is('respondida_en', null);

  if (updateError) {
    console.error('[foundingSurvey] submit:', updateError);
    return { error: 'No se pudieron guardar tus respuestas. Inténtalo de nuevo.', status: 500 };
  }

  // Reafirma el Plus solo si el alumno se quedó sin plan durante el mes. Si
  // mientras tanto tiene algo mejor (Friendly o suscripción de pago), tocarlo
  // sería degradarlo.
  try {
    const { data: profile } = await adminClient
      .from(PROFILES_TABLE)
      .select('plan_id')
      .eq('id', survey.user_id)
      .maybeSingle();

    if (String(profile?.plan_id || FREE_PLAN_SLUG) === FREE_PLAN_SLUG) {
      await assignUserPlan(adminClient, survey.user_id, PLUS_PLAN_SLUG);
    }
  } catch (err) {
    console.error('[foundingSurvey] confirm plan:', err);
  }

  await dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_SURVEY_CONFIRMED,
    to: survey.email,
    variables: {
      email: survey.email,
      nombre: loaded.nombre ? ` ${loaded.nombre}` : '',
    },
  });

  return { ok: true };
}
