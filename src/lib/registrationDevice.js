import { isValidClientDeviceType } from '@/lib/clientDeviceType';
import { formatDeviceTypeLabel } from '@/lib/userActivity';

export { formatDeviceTypeLabel };

/** @param {string | null | undefined} ua */
export function inferDeviceTypeFromUserAgent(ua = '') {
  const s = String(ua || '');
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(s)) {
    return 'tablet';
  }
  if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(s)) {
    return 'mobile';
  }
  return 'desktop';
}

/** @param {string | null | undefined} value */
export function normalizeRegistrationDeviceType(value) {
  if (isValidClientDeviceType(value)) return value;
  return null;
}

/**
 * @param {{ metadata?: Record<string, unknown> | null, registrationDeviceType?: string | null }} user
 */
export function getRegistrationDeviceType(user) {
  if (user?.registrationDeviceType) {
    return normalizeRegistrationDeviceType(user.registrationDeviceType);
  }
  const meta = user?.metadata;
  if (meta && typeof meta === 'object') {
    const fromMeta = normalizeRegistrationDeviceType(meta.registration_device);
    if (fromMeta) return fromMeta;
  }
  return null;
}

/**
 * @param {object} user
 * @param {Array<{ device_type?: string | null, started_at?: string }>} [sessions]
 */
export function resolveRegistrationDeviceType(user, sessions = []) {
  const fromStored = getRegistrationDeviceType(user);
  if (fromStored) return fromStored;

  if (!sessions?.length) return null;

  const sorted = [...sessions].sort((a, b) => {
    const ta = new Date(a.started_at || 0).getTime();
    const tb = new Date(b.started_at || 0).getTime();
    return ta - tb;
  });

  for (const row of sorted) {
    const type = normalizeRegistrationDeviceType(row.device_type);
    if (type) return type;
  }

  return null;
}

export function getRegistrationDeviceLabel(user, sessions = []) {
  return formatDeviceTypeLabel(resolveRegistrationDeviceType(user, sessions));
}

/**
 * Guarda el dispositivo de registro en metadata (solo si aún no existe).
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 */
export async function persistRegistrationDevice(adminClient, userId, deviceType) {
  const normalized = normalizeRegistrationDeviceType(deviceType);
  if (!adminClient || !userId || !normalized) return { ok: false };

  const { data: row, error: readError } = await adminClient
    .from('Usuarios_y_Perfil_users')
    .select('metadata')
    .eq('id', userId)
    .maybeSingle();

  if (readError) {
    console.error('[registrationDevice] read metadata', readError);
    return { ok: false, error: readError.message };
  }

  const existing = row?.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  if (normalizeRegistrationDeviceType(existing.registration_device)) {
    return { ok: true, skipped: true };
  }

  const metadata = {
    ...existing,
    registration_device: normalized,
    registration_device_at: new Date().toISOString(),
  };

  const { error: updateError } = await adminClient
    .from('Usuarios_y_Perfil_users')
    .update({ metadata })
    .eq('id', userId);

  if (updateError) {
    console.error('[registrationDevice] update metadata', updateError);
    return { ok: false, error: updateError.message };
  }

  return { ok: true, deviceType: normalized };
}
