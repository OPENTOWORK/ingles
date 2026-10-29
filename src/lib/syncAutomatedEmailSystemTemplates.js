import { DEFAULT_AUTOMATED_EMAIL_TEMPLATES } from '@/lib/automatedEmailDefaults';

/** Asunto anterior de la bienvenida. Si sigue así, se sustituye por la serie nueva. */
const LEGACY_WELCOME_SUBJECT = '¡Bienvenido/a a Dralo English!';

function templateRow(template) {
  return {
    slug: template.slug,
    nombre: template.nombre,
    trigger_event: template.trigger_event,
    trigger_reason: template.trigger_reason || '',
    asunto: template.asunto,
    cuerpo: template.cuerpo,
    activo: template.activo !== false,
    delay_minutos: Number(template.delay_minutos) || 0,
    es_sistema: true,
    actualizado_en: new Date().toISOString(),
  };
}

/**
 * Inserta las plantillas de sistema que falten y sustituye la bienvenida antigua
 * por la serie del documento (solo si nadie ha cambiado ya el asunto).
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 */
export async function syncAutomatedEmailSystemTemplates(db) {
  if (!db) return { inserted: [], updated: [] };

  const { data: existing, error: loadError } = await db
    .from('soporte_correos_automaticos')
    .select('slug, asunto, cuerpo');

  if (loadError) {
    throw loadError;
  }

  const bySlug = new Map((existing || []).map((row) => [row.slug, row]));
  const missing = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.filter((t) => !bySlug.has(t.slug));
  const welcome = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.find((t) => t.slug === 'welcome_registration');
  const storedWelcome = bySlug.get('welcome_registration');
  const shouldRefreshWelcome =
    welcome && storedWelcome && storedWelcome.asunto === LEGACY_WELCOME_SUBJECT;
  const weekly = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.find((t) => t.slug === 'weekly_tuesday_challenge');
  const storedWeekly = bySlug.get('weekly_tuesday_challenge');
  const shouldRefreshWeekly =
    weekly &&
    storedWeekly &&
    String(storedWeekly.cuerpo || '').startsWith('Preheader: Elige una opción');

  if (!missing.length && !shouldRefreshWelcome && !shouldRefreshWeekly) {
    return { inserted: [], updated: [] };
  }

  if (missing.length) {
    const { error: insertError } = await db
      .from('soporte_correos_automaticos')
      .insert(missing.map(templateRow));
    if (insertError) throw insertError;
  }

  const refreshed = [];

  if (shouldRefreshWelcome) {
    const { slug, ...fields } = templateRow(welcome);
    const { error: updateError } = await db
      .from('soporte_correos_automaticos')
      .update(fields)
      .eq('slug', slug);
    if (updateError) throw updateError;
    refreshed.push('welcome_registration');
  }

  if (shouldRefreshWeekly) {
    const { slug, ...fields } = templateRow(weekly);
    const { error: updateError } = await db
      .from('soporte_correos_automaticos')
      .update(fields)
      .eq('slug', slug);
    if (updateError) throw updateError;
    refreshed.push('weekly_tuesday_challenge');
  }

  return {
    inserted: missing.map((t) => t.slug),
    updated: refreshed,
  };
}
