import { createClient } from '@supabase/supabase-js';
import { normalizeGuideEmail } from '@/lib/b2GuideDownload';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export function buildB2GuideRequestPatch(email, acceptedMarketing, now = new Date()) {
  const normalized = normalizeGuideEmail(email);
  if (!normalized) return null;
  return {
    email: normalized,
    accepted_marketing: acceptedMarketing === true,
    last_requested_at: now.toISOString(),
  };
}

function guideRequestsDb() {
  const key = getSupabaseServiceRoleKey()?.trim();
  if (!key) return null;
  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Guarda el correo del formulario. No lanza: un fallo aquí no debe impedir enviar la guía. */
export async function saveB2GuideRequest({ email, acceptedMarketing }) {
  const patch = buildB2GuideRequestPatch(email, acceptedMarketing);
  if (!patch) return { ok: false, error: 'invalid_email' };

  const db = guideRequestsDb();
  if (!db) {
    console.error('[guia-b2] sin service role; la solicitud no se ha guardado');
    return { ok: false, error: 'no_db' };
  }

  const { data: existing, error: readError } = await db
    .from('guia_b2_solicitudes')
    .select('id, request_count')
    .eq('email', patch.email)
    .maybeSingle();

  if (readError) {
    console.error('[guia-b2] leer solicitud', readError);
    return { ok: false, error: readError.message };
  }

  if (existing?.id) {
    const { error } = await db
      .from('guia_b2_solicitudes')
      .update({
        accepted_marketing: patch.accepted_marketing,
        last_requested_at: patch.last_requested_at,
        request_count: Number(existing.request_count || 1) + 1,
      })
      .eq('id', existing.id);
    if (error) {
      console.error('[guia-b2] actualizar solicitud', error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  const { error } = await db.from('guia_b2_solicitudes').insert({
    ...patch,
    request_count: 1,
  });
  if (error) {
    console.error('[guia-b2] guardar solicitud', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
