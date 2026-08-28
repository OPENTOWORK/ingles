import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { normalizeBlogContent } from '@/lib/blogContent';
import { serializeBlogFaqItems } from '@/lib/blogFaq';
import {
  PUBLISH_MODE_DRAFT,
  PUBLISH_MODE_NOW,
  PUBLISH_MODE_SCHEDULE,
  combineScheduleInputs,
  isFutureSchedule,
  resolvePublishModeFromArticle,
  toScheduleInputs,
} from '@/lib/blogSchedule';
import { BLOG_TYPE_ARTICLE, normalizeBlogContentType } from '@/lib/blogContentTypes';

const TABLE = 'blog_articles';

const PUBLIC_LIST_FIELDS =
  'id, slug, title, excerpt, cover_image_url, content_type, created_at, updated_at, published_at';

const PUBLIC_DETAIL_FIELDS =
  'id, slug, title, excerpt, content, cover_image_url, og_image_url, seo_title, seo_description, content_type, faq_items, created_at, updated_at, published_at';

const ADMIN_FIELDS =
  'id, slug, title, excerpt, content, cover_image_url, og_image_url, seo_title, seo_description, content_type, published, author_id, scheduled_publish_at, faq_items, created_at, updated_at, published_at';

export function slugifyBlogTitle(title = '') {
  return String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

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

/** @param {import('@supabase/supabase-js').SupabaseClient} [_adminDb] */
export function getBlogAdminDb(_adminDb) {
  const key = getSupabaseServiceRoleKey()?.trim();
  if (!key) {
    throw new Error(
      'Service role no configurado. Añade SUPABASE_SERVICE_ROLE_KEY en .env.local para gestionar el blog.',
    );
  }
  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** @param {import('@supabase/supabase-js').SupabaseClient} db */
async function publishDueScheduledArticles(db) {
  const now = new Date().toISOString();
  const { error } = await db
    .from(TABLE)
    .update({ published: true, published_at: now })
    .eq('published', false)
    .not('scheduled_publish_at', 'is', null)
    .lte('scheduled_publish_at', now);

  if (error) throw new Error(error.message);
}

async function tryPublishDueScheduledArticles() {
  try {
    const key = getSupabaseServiceRoleKey()?.trim();
    if (!key) return;
    const db = createClient(getSupabaseUrl(), key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await publishDueScheduledArticles(db);
  } catch (err) {
    console.error('[blogArticles] publishDueScheduledArticles:', err);
  }
}

function resolvePublicationPatch(payload) {
  const publishMode = payload.publishMode || PUBLISH_MODE_DRAFT;

  if (publishMode === PUBLISH_MODE_SCHEDULE) {
    const scheduledAt =
      payload.scheduledPublishAt ||
      combineScheduleInputs(payload.scheduleDate, payload.scheduleTime);

    if (!scheduledAt) {
      throw new Error('Indica la fecha y la hora de publicación programada.');
    }
    if (!isFutureSchedule(scheduledAt)) {
      throw new Error('La fecha programada debe ser futura.');
    }

    return {
      published: false,
      scheduled_publish_at: scheduledAt,
    };
  }

  if (publishMode === PUBLISH_MODE_NOW) {
    return {
      published: true,
      scheduled_publish_at: null,
    };
  }

  return {
    published: false,
    scheduled_publish_at: null,
  };
}

function buildArticleRow(payload, { isCreate = false } = {}) {
  const row = {};

  if (payload.title != null || isCreate) {
    const title = String(payload.title || '').trim();
    if (!title) throw new Error('El título es obligatorio.');
    row.title = title;
  }

  if (payload.slug != null || isCreate) {
    let slug = String(payload.slug || '').trim();
    if (!slug && row.title) slug = slugifyBlogTitle(row.title);
    if (!slug) throw new Error('El slug es obligatorio.');
    row.slug = slug;
  }

  if (payload.excerpt != null || isCreate) {
    row.excerpt = String(payload.excerpt || '').trim();
  }
  if (payload.content != null || isCreate) {
    row.content = normalizeBlogContent(payload.content);
  }
  if (payload.coverImageUrl != null || isCreate) {
    row.cover_image_url = String(payload.coverImageUrl || '').trim();
  }
  if (payload.ogImageUrl != null || isCreate) {
    row.og_image_url = String(payload.ogImageUrl || '').trim();
  }
  if (payload.seoTitle != null || isCreate) {
    row.seo_title = String(payload.seoTitle || '').trim();
  }
  if (payload.seoDescription != null || isCreate) {
    row.seo_description = String(payload.seoDescription || '').trim();
  }
  if (payload.faqItems != null || isCreate) {
    row.faq_items = serializeBlogFaqItems(payload.faqItems || []);
  }
  if (payload.publishMode != null || isCreate) {
    const publication = resolvePublicationPatch(payload);
    row.published = publication.published;
    row.scheduled_publish_at = publication.scheduled_publish_at;
  }
  if (isCreate) {
    row.content_type = normalizeBlogContentType(payload.contentType || BLOG_TYPE_ARTICLE);
  }

  return row;
}

async function ensureUniqueSlug(db, slug, excludeId) {
  const baseSlug = slug;
  let suffix = 0;
  while (suffix < 30) {
    const candidate = suffix ? `${baseSlug}-${suffix}` : baseSlug;
    let query = db.from(TABLE).select('id').eq('slug', candidate);
    if (excludeId) query = query.neq('id', excludeId);
    const { data: existing } = await query.maybeSingle();
    if (!existing) return candidate;
    suffix += 1;
  }
  throw new Error('No se pudo generar un slug único.');
}

export async function fetchPublishedBlogArticles(limit = 50) {
  await tryPublishDueScheduledArticles();
  const db = getPublicDb();

  const { data, error } = await db
    .from(TABLE)
    .select(PUBLIC_LIST_FIELDS)
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchPublishedBlogArticleBySlug(slug) {
  await tryPublishDueScheduledArticles();
  const db = getPublicDb();

  const { data, error } = await db
    .from(TABLE)
    .select(PUBLIC_DETAIL_FIELDS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** @param {import('@supabase/supabase-js').SupabaseClient} adminDb */
export async function fetchAllBlogArticles(adminDb) {
  await tryPublishDueScheduledArticles();
  const db = getBlogAdminDb(adminDb);
  const { data, error } = await db
    .from(TABLE)
    .select(ADMIN_FIELDS)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/** @param {import('@supabase/supabase-js').SupabaseClient} adminDb */
export async function createBlogArticle(adminDb, payload) {
  const db = getBlogAdminDb(adminDb);
  const row = buildArticleRow(payload, { isCreate: true });
  row.slug = await ensureUniqueSlug(db, row.slug);
  row.author_id = payload.authorId || null;
  if (row.published) row.published_at = new Date().toISOString();

  const { data, error } = await db.from(TABLE).insert(row).select(ADMIN_FIELDS).single();
  if (error) throw new Error(error.message);
  return data;
}

/** @param {import('@supabase/supabase-js').SupabaseClient} adminDb */
export async function updateBlogArticle(adminDb, id, payload) {
  const db = getBlogAdminDb(adminDb);
  const patch = buildArticleRow(payload);

  if (patch.slug) {
    patch.slug = await ensureUniqueSlug(db, patch.slug, id);
  }

  if (patch.published === true) {
    const { data: current } = await db.from(TABLE).select('published_at').eq('id', id).maybeSingle();
    if (!current?.published_at) patch.published_at = new Date().toISOString();
  }

  if (!Object.keys(patch).length) throw new Error('Nada que actualizar.');

  const { data, error } = await db.from(TABLE).update(patch).eq('id', id).select(ADMIN_FIELDS).single();
  if (error) throw new Error(error.message);
  return data;
}

/** @param {import('@supabase/supabase-js').SupabaseClient} adminDb */
export async function deleteBlogArticle(adminDb, id) {
  const db = getBlogAdminDb(adminDb);
  const { error } = await db.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function formatBlogDate(value, locale = 'es-ES') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function mapArticleToClientForm(article) {
  const publishMode = resolvePublishModeFromArticle(article);
  const scheduledPublishAt = article?.scheduled_publish_at || '';
  const { date: scheduleDate, time: scheduleTime } = toScheduleInputs(scheduledPublishAt);

  return {
    id: article?.id || '',
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    coverImageUrl: article?.cover_image_url || '',
    ogImageUrl: article?.og_image_url || '',
    seoTitle: article?.seo_title || '',
    seoDescription: article?.seo_description || '',
    contentType: normalizeBlogContentType(article?.content_type),
    published: Boolean(article?.published),
    publishMode,
    scheduledPublishAt,
    scheduleDate,
    scheduleTime,
    faqItems: Array.isArray(article?.faq_items) ? article.faq_items : [],
  };
}

export function mapClientFormToPayload(form) {
  return {
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    content: form.content,
    coverImageUrl: form.coverImageUrl,
    ogImageUrl: form.ogImageUrl,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    contentType: normalizeBlogContentType(form.contentType),
    publishMode: form.publishMode || PUBLISH_MODE_DRAFT,
    scheduledPublishAt: form.scheduledPublishAt || null,
    scheduleDate: form.scheduleDate || '',
    scheduleTime: form.scheduleTime || '09:00',
    faqItems: form.faqItems || [],
  };
}

export function getBlogArticleStatusLabel(article) {
  if (article?.published) return 'Publicado';
  if (isFutureSchedule(article?.scheduled_publish_at)) return 'Programado';
  return 'Borrador';
}
