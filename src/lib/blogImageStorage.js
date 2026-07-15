export const BLOG_IMAGE_BUCKET = 'blog-images';
export const BLOG_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export const BLOG_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * @param {File} file
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function validateBlogImageFile(file) {
  if (!file) return { ok: false, error: 'Selecciona una imagen.' };
  if (!BLOG_IMAGE_MIME_TYPES.has(file.type)) {
    return { ok: false, error: 'Formato no válido. Usa JPG, PNG, WebP o GIF.' };
  }
  if (file.size > BLOG_IMAGE_MAX_BYTES) {
    return { ok: false, error: 'La imagen debe pesar 10 MB o menos.' };
  }
  return { ok: true };
}

/**
 * @param {string} articleId
 * @param {string} mimeType
 * @param {'cover' | 'inline' | 'og'} [kind]
 */
export function buildBlogImageStoragePath(articleId, mimeType = 'image/jpeg', kind = 'inline') {
  const ext =
    mimeType === 'image/png'
      ? 'png'
      : mimeType === 'image/webp'
        ? 'webp'
        : mimeType === 'image/gif'
          ? 'gif'
          : 'jpg';
  const stamp = Date.now();
  const folder = articleId || 'drafts';
  return `${folder}/${kind}-${stamp}.${ext}`;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} path
 */
export function getBlogImagePublicUrl(supabase, path) {
  const { data } = supabase.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}
