import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const TABLE = 'blog_article_comments';
const MAX_BODY_LENGTH = 2000;
const MIN_BODY_LENGTH = 2;

const PUBLIC_FIELDS = 'id, article_id, user_id, author_name, body, created_at';

function getPublicDb() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (url, options = {}) =>
        fetch(url, {
          ...options,
          cache: 'no-store',
          next: { revalidate: 0, ...(options.next || {}) },
        }),
    },
  });
}

export function getBlogCommentsAdminDb() {
  const key = getSupabaseServiceRoleKey()?.trim();
  if (!key) {
    throw new Error('Service role no configurado para comentarios del blog.');
  }
  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function normalizeBlogCommentBody(body = '') {
  return String(body || '').replace(/\s+/g, ' ').trim();
}

export function validateBlogCommentBody(body) {
  const normalized = normalizeBlogCommentBody(body);
  if (normalized.length < MIN_BODY_LENGTH) {
    throw new Error('El comentario es demasiado corto.');
  }
  if (normalized.length > MAX_BODY_LENGTH) {
    throw new Error(`El comentario no puede superar ${MAX_BODY_LENGTH} caracteres.`);
  }
  return normalized;
}

export async function fetchBlogArticleComments(articleId) {
  const db = getPublicDb();
  const { data, error } = await db
    .from(TABLE)
    .select(PUBLIC_FIELDS)
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function resolveBlogCommentAuthorName(adminDb, userId, email = '') {
  const { data } = await adminDb
    .from('Usuarios_y_Perfil_users')
    .select('nombre')
    .eq('id', userId)
    .maybeSingle();

  const name = String(data?.nombre || '').trim();
  if (name) return name;

  const emailPrefix = String(email || '').split('@')[0]?.trim();
  if (emailPrefix) return emailPrefix;

  return 'Usuario';
}

export async function createBlogArticleComment(adminDb, { articleId, userId, email, body }) {
  const normalizedBody = validateBlogCommentBody(body);

  const { data: article, error: articleError } = await adminDb
    .from('blog_articles')
    .select('id')
    .eq('id', articleId)
    .eq('published', true)
    .maybeSingle();

  if (articleError) throw new Error(articleError.message);
  if (!article?.id) throw new Error('Artículo no encontrado o no publicado.');

  const authorName = await resolveBlogCommentAuthorName(adminDb, userId, email);

  const { data, error } = await adminDb
    .from(TABLE)
    .insert({
      article_id: articleId,
      user_id: userId,
      author_name: authorName,
      body: normalizedBody,
    })
    .select(PUBLIC_FIELDS)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export function formatBlogCommentDate(value, locale = 'es-ES') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
