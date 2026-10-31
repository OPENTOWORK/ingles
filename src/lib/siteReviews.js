import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export const SITE_REVIEW_PATH = '/resena/';
export const SITE_REVIEW_LIMITS = {
  nameMin: 2,
  nameMax: 40,
  textMin: 12,
  textMax: 400,
};
const NAME_RE = /^[\p{L}][\p{L}\p{M} .'’-]*$/u;
const URL_RE = /https?:\/\/|www\./i;

function reviewsDb() {
  const key = getSupabaseServiceRoleKey()?.trim();
  if (!key) return null;
  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function cleanText(value) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function publicSiteOrigin() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.dralo.es').replace(
    /\/$/,
    '',
  );
}

export function siteReviewPageUrl(origin = publicSiteOrigin()) {
  return `${String(origin || publicSiteOrigin()).replace(/\/$/, '')}${SITE_REVIEW_PATH}`;
}

export function buildSiteReviewInviteEmail(origin = publicSiteOrigin()) {
  const url = siteReviewPageUrl(origin);
  const subject = '¿Nos dejas tu reseña en Dralo?';
  const text = [
    'Hola,',
    '',
    'Si tienes cuenta en Dralo, puedes dejar tu reseña. Se publica en la página para que otras personas la lean. Cada cuenta puede dejar una, y después puedes editarla o eliminarla.',
    '',
    url,
    '',
    '— Equipo Dralo',
  ].join('\n');
  return { subject, text, url, ctaLabel: 'Dejar mi reseña' };
}

/**
 * @returns {{ ok: true, honeypot?: boolean, review?: { name: string, text: string, stars: number, initial: string } } | { ok: false, error: string }}
 */
export function checkSiteReview({ name, text, stars, company } = {}) {
  if (String(company || '').trim()) return { ok: true, honeypot: true };

  const cleanName = cleanText(name);
  if (
    cleanName.length < SITE_REVIEW_LIMITS.nameMin ||
    cleanName.length > SITE_REVIEW_LIMITS.nameMax ||
    !NAME_RE.test(cleanName) ||
    cleanName.split(' ').length > 4
  ) {
    return { ok: false, error: 'Escribe tu nombre.' };
  }

  const cleanBody = cleanText(text);
  if (cleanBody.length < SITE_REVIEW_LIMITS.textMin || cleanBody.length > SITE_REVIEW_LIMITS.textMax) {
    return { ok: false, error: 'La reseña tiene que tener entre 12 y 400 caracteres.' };
  }
  if (URL_RE.test(cleanBody)) {
    return { ok: false, error: 'La reseña no puede incluir un enlace.' };
  }

  const score = Number(stars);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return { ok: false, error: 'Elige de 1 a 5 estrellas.' };
  }

  return {
    ok: true,
    review: {
      name: cleanName,
      text: cleanBody,
      stars: score,
      initial: cleanName.slice(0, 1).toUpperCase(),
    },
  };
}

export function toPublicSiteReview(row) {
  const name = String(row?.display_name || row?.name || '').trim();
  return {
    id: row?.id,
    name,
    initial: name.slice(0, 1).toUpperCase(),
    text: String(row?.body || row?.text || '').trim(),
    stars: Number(row?.stars),
    createdAt: row?.created_at || row?.createdAt || null,
  };
}

export async function listPublishedSiteReviews(limit = 24) {
  const db = reviewsDb();
  if (!db) return { ok: false, error: 'no_db', reviews: [] };
  const { data, error } = await db
    .from('resenas_web')
    .select('id, display_name, body, stars, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { ok: false, error: error.message, reviews: [] };
  return { ok: true, reviews: (data || []).map(toPublicSiteReview) };
}

export async function listSiteReviewsForStaff(limit = 40) {
  const db = reviewsDb();
  if (!db) return { ok: false, error: 'no_db', reviews: [] };
  const { data, error } = await db
    .from('resenas_web')
    .select('id, display_name, body, stars, published, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { ok: false, error: error.message, reviews: [] };
  return {
    ok: true,
    reviews: (data || []).map((row) => ({ ...toPublicSiteReview(row), published: row.published === true })),
  };
}

const OWN_COLUMNS = 'id, display_name, body, stars, published, created_at';

export async function getOwnSiteReview(userId) {
  const db = reviewsDb();
  if (!db || !userId) return { ok: false, error: 'No se ha podido cargar tu reseña.', review: null };
  const { data, error } = await db
    .from('resenas_web')
    .select(OWN_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { ok: false, error: 'No se ha podido cargar tu reseña.', review: null };
  if (!data) return { ok: true, review: null };
  return { ok: true, review: { ...toPublicSiteReview(data), published: data.published === true } };
}

export async function createSiteReview({ userId, name, text, stars }) {
  const db = reviewsDb();
  if (!db || !userId) return { ok: false, error: 'No se ha podido publicar la reseña.' };

  const existing = await getOwnSiteReview(userId);
  if (!existing.ok) return { ok: false, error: 'No se ha podido publicar la reseña.' };
  if (existing.review) {
    return { ok: false, status: 409, error: 'Ya tienes una reseña. Puedes editarla o eliminarla.' };
  }

  const { data, error } = await db
    .from('resenas_web')
    .insert({ user_id: userId, display_name: name, body: text, stars, published: true })
    .select(OWN_COLUMNS)
    .single();
  if (error?.code === '23505') {
    return { ok: false, status: 409, error: 'Ya tienes una reseña. Puedes editarla o eliminarla.' };
  }
  if (error) return { ok: false, error: 'No se ha podido publicar la reseña.' };
  return { ok: true, review: { ...toPublicSiteReview(data), published: true } };
}

export async function updateOwnSiteReview({ userId, name, text, stars }) {
  const db = reviewsDb();
  if (!db || !userId) return { ok: false, error: 'No se ha podido guardar la reseña.' };
  const { data, error } = await db
    .from('resenas_web')
    .update({ display_name: name, body: text, stars })
    .eq('user_id', userId)
    .select(OWN_COLUMNS)
    .maybeSingle();
  if (error || !data?.id) return { ok: false, status: 404, error: 'No tienes una reseña para editar.' };
  return { ok: true, review: { ...toPublicSiteReview(data), published: data.published === true } };
}

export async function deleteOwnSiteReview(userId) {
  const db = reviewsDb();
  if (!db || !userId) return { ok: false, error: 'No se ha podido eliminar la reseña.' };
  const { data, error } = await db
    .from('resenas_web')
    .delete()
    .eq('user_id', userId)
    .select('id');
  if (error) return { ok: false, error: 'No se ha podido eliminar la reseña.' };
  if (!data?.length) return { ok: false, status: 404, error: 'No tienes una reseña para eliminar.' };
  return { ok: true };
}

export async function setSiteReviewPublished(id, published) {
  const db = reviewsDb();
  if (!db) return { ok: false, error: 'No se ha podido actualizar la reseña.' };
  const { data, error } = await db
    .from('resenas_web')
    .update({ published: published === true })
    .eq('id', id)
    .select('id, published')
    .maybeSingle();
  if (error || !data?.id) return { ok: false, error: 'No se ha podido actualizar la reseña.' };
  return { ok: true, id: data.id, published: data.published === true };
}

export async function listReviewInviteRecipients() {
  const db = reviewsDb();
  if (!db) return { ok: false, error: 'No se ha podido preparar el envío.', emails: [] };
  const { data, error } = await db
    .from('guia_b2_solicitudes')
    .select('email')
    .eq('accepted_marketing', true);
  if (error) return { ok: false, error: 'No se ha podido preparar el envío.', emails: [] };
  const emails = [...new Set((data || []).map((row) => String(row.email || '').trim().toLowerCase()).filter(Boolean))];
  return { ok: true, emails };
}
