import { DEFAULT_AUTOMATED_EMAIL_TEMPLATES } from '@/lib/automatedEmailDefaults';

/**
 * Inserta en Supabase las plantillas de sistema que falten (p. ej. tras un deploy nuevo).
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 */
export async function syncAutomatedEmailSystemTemplates(db) {
  if (!db) return { inserted: [] };

  const { data: existing, error: loadError } = await db
    .from('soporte_correos_automaticos')
    .select('slug');

  if (loadError) {
    throw loadError;
  }

  const knownSlugs = new Set((existing || []).map((row) => row.slug));
  const missing = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.filter((t) => !knownSlugs.has(t.slug));

  if (!missing.length) {
    return { inserted: [] };
  }

  const rows = missing.map((template) => ({
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
  }));

  const { error: insertError } = await db.from('soporte_correos_automaticos').insert(rows);

  if (insertError) {
    throw insertError;
  }

  return { inserted: missing.map((t) => t.slug) };
}
