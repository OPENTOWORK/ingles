import { deliverTransactionalEmail } from '@/lib/emailDelivery';
import { DEFAULT_AUTOMATED_EMAIL_TEMPLATES } from '@/lib/automatedEmailDefaults';
import {
  buildDefaultEmailVariables,
  formatNombreVariable,
  renderEmailTemplate,
} from '@/lib/renderEmailTemplate';

const TABLE = 'soporte_correos_automaticos';
const QUEUE_TABLE = 'soporte_correos_cola';
const LOG_TABLE = 'soporte_correos_log';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

async function logSend(adminClient, row) {
  if (!adminClient) return;
  try {
    await adminClient.from(LOG_TABLE).insert(row);
  } catch {
    /* no bloquear envío */
  }
}

async function loadTemplatesForTrigger(adminClient, triggerEvent) {
  if (adminClient) {
    const { data, error } = await adminClient
      .from(TABLE)
      .select('*')
      .eq('trigger_event', triggerEvent)
      .eq('activo', true);

    if (!error && data?.length) return data;
    if (error && !isMissingTableError(error)) {
      console.error('[dispatchAutomatedEmail] load templates', error);
    }
  }

  return DEFAULT_AUTOMATED_EMAIL_TEMPLATES.filter(
    (t) => t.trigger_event === triggerEvent && t.activo !== false,
  );
}

async function enqueueEmail(adminClient, template, to, variables) {
  const delayMin = Number(template.delay_minutos) || 0;
  const sendAt = new Date(Date.now() + delayMin * 60 * 1000).toISOString();

  const { error } = await adminClient.from(QUEUE_TABLE).insert({
    plantilla_id: template.id || null,
    slug: template.slug,
    destinatario: to,
    variables,
    enviar_en: sendAt,
    estado: 'pendiente',
  });

  if (error) throw error;
  return { queued: true, sendAt };
}

async function sendNow(template, to, variables, adminClient) {
  const merged = buildDefaultEmailVariables({
    nombre: formatNombreVariable(variables.name || variables.nombre),
    email: variables.email || to,
    ...variables,
  });

  const subject = renderEmailTemplate(template.asunto, merged).trim();
  const text = renderEmailTemplate(template.cuerpo, merged).trim();

  const result = await deliverTransactionalEmail({ to, subject, text });

  await logSend(adminClient, {
    plantilla_id: template.id || null,
    slug: template.slug,
    destinatario: to,
    trigger_event: template.trigger_event,
    canal: result.channel || null,
    ok: Boolean(result.ok),
    error_msg: result.ok ? null : result.error || 'Error desconocido',
  });

  return {
    sent: Boolean(result.ok),
    channel: result.channel,
    error: result.ok ? null : result.error,
    subject,
  };
}

/**
 * Dispara todos los correos activos para un evento.
 * @param {object} params
 * @param {import('@supabase/supabase-js').SupabaseClient | null} params.adminClient
 * @param {string} params.triggerEvent
 * @param {string} params.to
 * @param {Record<string, string>} [params.variables]
 */
export async function dispatchAutomatedEmail({ adminClient, triggerEvent, to, variables = {} }) {
  const email = String(to || '').trim().toLowerCase();
  if (!email || !triggerEvent) {
    return { sent: false, error: 'Destinatario o evento no válido.' };
  }

  const templates = await loadTemplatesForTrigger(adminClient, triggerEvent);
  if (!templates.length) {
    return { sent: false, error: 'No hay plantillas activas para este evento.' };
  }

  const results = [];

  for (const template of templates) {
    try {
      const delayMin = Number(template.delay_minutos) || 0;
      if (delayMin > 0 && adminClient) {
        const q = await enqueueEmail(adminClient, template, email, variables);
        results.push({ slug: template.slug, queued: true, sendAt: q.sendAt });
        continue;
      }

      const r = await sendNow(template, email, variables, adminClient);
      results.push({ slug: template.slug, ...r });
    } catch (err) {
      console.error('[dispatchAutomatedEmail]', template.slug, err);
      results.push({
        slug: template.slug,
        sent: false,
        error: err.message || 'Error al enviar',
      });
    }
  }

  const anySent = results.some((r) => r.sent);
  const anyQueued = results.some((r) => r.queued);
  const firstError = results.find((r) => r.error)?.error;

  return {
    sent: anySent,
    queued: anyQueued,
    results,
    error: anySent || anyQueued ? null : firstError || 'No se envió ningún correo.',
  };
}

/**
 * Procesa la cola de correos programados (cron).
 */
export async function processAutomatedEmailQueue(adminClient, { limit = 25 } = {}) {
  if (!adminClient) return { processed: 0, error: 'Sin service role' };

  const now = new Date().toISOString();
  const { data: rows, error } = await adminClient
    .from(QUEUE_TABLE)
    .select('*')
    .eq('estado', 'pendiente')
    .lte('enviar_en', now)
    .order('enviar_en', { ascending: true })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error)) return { processed: 0, skipped: true };
    return { processed: 0, error: error.message };
  }

  let processed = 0;

  for (const row of rows || []) {
    let template = null;

    if (row.plantilla_id) {
      const { data } = await adminClient
        .from(TABLE)
        .select('*')
        .eq('id', row.plantilla_id)
        .maybeSingle();
      template = data;
    }

    if (!template && row.slug) {
      template =
        DEFAULT_AUTOMATED_EMAIL_TEMPLATES.find((t) => t.slug === row.slug) || null;
    }

    if (!template) {
      await adminClient
        .from(QUEUE_TABLE)
        .update({
          estado: 'error',
          error_msg: 'Plantilla no encontrada',
          intentos: (row.intentos || 0) + 1,
        })
        .eq('id', row.id);
      continue;
    }

    const vars = row.variables && typeof row.variables === 'object' ? row.variables : {};
    const result = await sendNow(template, row.destinatario, vars, adminClient);

    await adminClient
      .from(QUEUE_TABLE)
      .update({
        estado: result.sent ? 'enviado' : 'error',
        error_msg: result.sent ? null : result.error,
        intentos: (row.intentos || 0) + 1,
        enviado_en: result.sent ? new Date().toISOString() : null,
      })
      .eq('id', row.id);

    if (result.sent) processed += 1;
  }

  return { processed, total: rows?.length || 0 };
}
