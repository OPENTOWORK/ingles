export const PROFILE_AVATAR_BUCKET = 'profile-avatars';

export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const PROFILE_AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * @param {File} file
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function validateProfileAvatarFile(file) {
  if (!file) return { ok: false, error: 'Selecciona una imagen.' };
  if (!PROFILE_AVATAR_MIME_TYPES.has(file.type)) {
    return { ok: false, error: 'Formato no válido. Usa JPG, PNG, WebP o GIF.' };
  }
  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    return { ok: false, error: 'La imagen no puede superar 5 MB.' };
  }
  return { ok: true };
}

/**
 * @param {string} userId
 * @param {string} mimeType
 */
export function buildProfileAvatarStoragePath(userId, mimeType = 'image/jpeg') {
  const ext =
    mimeType === 'image/png'
      ? 'png'
      : mimeType === 'image/webp'
        ? 'webp'
        : mimeType === 'image/gif'
          ? 'gif'
          : 'jpg';
  return `${userId}/avatar.${ext}`;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} path
 */
export function getProfileAvatarPublicUrl(supabase, path) {
  const { data } = supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(path);
  const base = data?.publicUrl || '';
  if (!base) return '';
  return `${base}${base.includes('?') ? '&' : '?'}v=${Date.now()}`;
}
