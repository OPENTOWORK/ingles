import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import {
  blackFridayEmailForDate,
  blackFridayGreeting,
  blackFridayOfferUrl,
  userAlreadyPaid,
} from '@/lib/blackFridayEmailSequence.rules';
import { readCommercialConsent } from '@/lib/marketingPlanServer';
import { readAllMarketingRows } from '@/lib/marketingMetrics';
import { syncAutomatedEmailSystemTemplates } from '@/lib/syncAutomatedEmailSystemTemplates';

function isDisposableTestEmail(email) {
  return /@(example\.com|mailinator\.com|dralo-smoke\.invalid)$/i.test(email);
}

function isMissingColumn(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42703' || message.includes('column') || message.includes('schema cache');
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

async function loadUsers(adminClient) {
  const selects = [
    'id, email, nombre, activo, plan_id, consentimiento_comercial, marketing_updates, metadata, destacado_equipo',
    'id, email, nombre, activo, plan_id, consentimiento_comercial, destacado_equipo',
    'id, email, nombre, activo, plan_id, marketing_updates, metadata, destacado_equipo',
  ];
  let lastError = null;
  for (const select of selects) {
    try {
      const rows = await readAllMarketingRows(() =>
        adminClient.from('Usuarios_y_Perfil_users').select(select).order('id'),
      );
      return rows;
    } catch (error) {
      lastError = error;
      if (!isMissingColumn(error)) throw error;
    }
  }
  throw lastError || new Error('No se pudieron leer las cuentas.');
}

async function loadSubscriptions(adminClient) {
  const selects = [
    'user_id, plan_id, status, stripe_subscription_id, store',
    'user_id, plan_id, status, stripe_subscription_id',
    'user_id, plan_id, status',
  ];
  let lastError = null;
  for (const select of selects) {
    const { data, error } = await adminClient.from('suscripciones').select(select);
    if (!error) return data || [];
    lastError = error;
    if (!isMissingColumn(error)) break;
  }
  if (lastError) throw lastError;
  return [];
}

async function loadAlreadySent(adminClient, slug) {
  const rows = await readAllMarketingRows(() =>
    adminClient
      .from('soporte_correos_log')
      .select('destinatario, ok')
      .eq('slug', slug)
      .eq('ok', true)
      .order('destinatario'),
  );
  const sent = new Set();
  for (const row of rows) {
    const email = String(row.destinatario || '').trim().toLowerCase();
    if (email) sent.add(email);
  }
  return sent;
}

/**
 * El día de cada correo, escribe solo a quien aceptó comunicaciones y sigue sin haber pagado.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {Date} [now]
 */
export async function runBlackFridayEmailSequence(adminClient, now = new Date()) {
  if (!adminClient) return { sent: 0, skipped: true };
  const email = blackFridayEmailForDate(now);
  if (!email) return { sent: 0, skipped: true, reason: 'fuera de las fechas de la secuencia' };

  const [confirmedIds, users, subscriptions, alreadySent] = await Promise.all([
    loadConfirmedUserIds(adminClient),
    loadUsers(adminClient),
    loadSubscriptions(adminClient),
    loadAlreadySent(adminClient, email.slug),
  ]);

  const subByUser = new Map();
  for (const row of subscriptions) {
    if (row?.user_id) subByUser.set(row.user_id, row);
  }

  const candidates = [];
  let skippedPaid = 0;
  let skippedConsent = 0;
  let skippedUnconfirmed = 0;

  for (const user of users) {
    const address = String(user.email || '').trim().toLowerCase();
    if (!address || isDisposableTestEmail(address) || user.destacado_equipo) continue;
    if (user.activo === false) continue;
    if (!readCommercialConsent(user)) {
      skippedConsent += 1;
      continue;
    }
    if (!confirmedIds.has(user.id)) {
      skippedUnconfirmed += 1;
      continue;
    }
    if (alreadySent.has(address)) continue;
    if (userAlreadyPaid({ planId: user.plan_id, subscription: subByUser.get(user.id) })) {
      skippedPaid += 1;
      continue;
    }
    candidates.push({ email: address, nombre: user.nombre || '' });
  }

  try {
    await syncAutomatedEmailSystemTemplates(adminClient);
  } catch (err) {
    console.error('[black-friday-email] sync templates', err);
  }

  const ofertaUrl = blackFridayOfferUrl(appOrigin(), email.src);
  let sent = 0;
  const errors = [];

  for (const candidate of candidates) {
    const result = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: email.trigger,
      to: candidate.email,
      syncTemplates: false,
      variables: {
        saludo: blackFridayGreeting(candidate.nombre),
        email: candidate.email,
        oferta_url: ofertaUrl,
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
    slug: email.slug,
    src: email.src,
    skippedPaid,
    skippedConsent,
    skippedUnconfirmed,
    ...(errors.length ? { errors } : {}),
  };
}
