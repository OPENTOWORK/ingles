import { randomUUID } from 'crypto';
import { BUZON_ATTACHMENT_BUCKET } from '@/lib/staffBuzonAttachments';

/**
 * @param {string} userId
 * @param {string} originalName
 */
export function buildBuzonAttachmentStoragePath(userId, originalName = 'file') {
  const safe = String(originalName)
    .replace(/[^\w.\-()+]/g, '_')
    .slice(0, 80);
  return `${userId}/${randomUUID()}-${safe || 'file'}`;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} path
 */
export function getBuzonAttachmentPublicUrl(supabase, path) {
  const { data } = supabase.storage.from(BUZON_ATTACHMENT_BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}
