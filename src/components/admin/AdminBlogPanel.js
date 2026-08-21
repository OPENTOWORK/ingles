'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { canAccessBlogAdminPanel, getRoleNameByUserId } from '@/utils/authRoles';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import BlogArticleEditor, { BLOG_EMPTY_FORM } from '@/components/admin/BlogArticleEditor';
import {
  formatBlogDate,
  mapArticleToClientForm,
  slugifyBlogTitle,
} from '@/lib/blogArticles';
import {
  BLOG_CONTENT_TYPE_META,
  BLOG_TYPE_ARTICLE,
  BLOG_TYPE_NEWS,
  blogTypeFromQueryParam,
  blogTypeMeta,
  normalizeBlogContentType,
} from '@/lib/blogContentTypes';
import styles from './AdminBlogPanel.module.css';

async function getAdminFetchHeaders() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('Sesión no válida. Cierra sesión y vuelve a entrar.');
  }
  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData?.session?.access_token || null;
  if (!accessToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    accessToken = refreshed?.session?.access_token || null;
  }
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function emptyFormForType(contentType) {
  const type = normalizeBlogContentType(contentType);
  return {
    ...BLOG_EMPTY_FORM,
    contentType: type,
    published: type === BLOG_TYPE_NEWS,
  };
}

export default function AdminBlogPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [articles, setArticles] = useState([]);
  const [activeType, setActiveType] = useState(BLOG_TYPE_ARTICLE);
  const [form, setForm] = useState(emptyFormForType(BLOG_TYPE_ARTICLE));
  const [slugTouched, setSlugTouched] = useState(false);
  const editorRef = useRef(null);
  const handledCreateParam = useRef(false);
  const handledIdParam = useRef('');

  const load = useCallback(async () => {
    setError('');
    const headers = await getAdminFetchHeaders();
    const res = await fetch('/api/admin/blog', { headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'No se pudo cargar el contenido del blog.');
    setArticles(json.articles || []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push('/login');
        return;
      }
      const role = await getRoleNameByUserId(user.id, user.email);
      if (!canAccessBlogAdminPanel(role)) {
        router.push('/perfil');
        return;
      }
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, load]);

  useEffect(() => {
    const id = searchParams.get('id');
    const tipo = searchParams.get('tipo');
    const accion = searchParams.get('accion');
    if (handledCreateParam.current) return;
    if (!tipo && !id) return;
    handledCreateParam.current = true;

    if (tipo) {
      const nextType = blogTypeFromQueryParam(tipo);
      setActiveType(nextType);
      if (!id && accion !== 'editar') {
        setForm(emptyFormForType(nextType));
        setSlugTouched(false);
        setSuccess('');
        setError('');
        requestAnimationFrame(() => {
          editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id || loading || !articles.length || handledIdParam.current === id) return;
    const article = articles.find((item) => item.id === id);
    if (!article) {
      handledIdParam.current = id;
      setError('No se encontró el contenido a editar.');
      return;
    }
    handledIdParam.current = id;
    const mapped = mapArticleToClientForm(article);
    setForm(mapped);
    setActiveType(mapped.contentType);
    setSlugTouched(true);
    setSuccess('');
    setError('');
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [searchParams, loading, articles]);

  const patchForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const startCreate = (contentType) => {
    const nextType = normalizeBlogContentType(contentType);
    setActiveType(nextType);
    setForm(emptyFormForType(nextType));
    setSlugTouched(false);
    setSuccess('');
    setError('');
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleTitleChange = (title) => {
    patchForm({
      title,
      slug: slugTouched ? form.slug : slugifyBlogTitle(title),
    });
  };

  const uploadImage = async (file, kind) => {
    setUploading(true);
    setError('');
    try {
      const headers = await getAdminFetchHeaders();
      delete headers['Content-Type'];
      const body = new FormData();
      body.set('file', file);
      body.set('articleId', form.id || 'drafts');
      body.set('kind', kind);
      const res = await fetch('/api/admin/blog/upload-image', {
        method: 'POST',
        headers,
        body,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo subir la imagen.');
      return json.imageUrl;
    } catch (e) {
      setError(e.message || 'Error al subir la imagen.');
      throw e;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const meta = blogTypeMeta(form.contentType);
    try {
      const headers = await getAdminFetchHeaders();
      const isEdit = Boolean(form.id);
      const res = await fetch('/api/admin/blog', {
        method: isEdit ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `No se pudo guardar el ${meta.label.toLowerCase()}.`);

      const saved = json.article ? mapArticleToClientForm(json.article) : form;
      setSuccess(
        `${isEdit ? meta.updatedLabel : meta.createdLabel}${
          saved.published
            ? ' Ya es visible en /blog.'
            : ' Guardada como borrador: no aparecerá en /blog hasta que marques «Publicar».'
        }`,
      );
      if (!isEdit && json.article) {
        const mapped = mapArticleToClientForm(json.article);
        setForm(mapped);
        setActiveType(mapped.contentType);
        setSlugTouched(true);
      }
      await load();
    } catch (e) {
      setError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (article) => {
    const mapped = mapArticleToClientForm(article);
    setForm(mapped);
    setActiveType(mapped.contentType);
    setSlugTouched(true);
    setSuccess('');
    setError('');
  };

  const handleDelete = async (id) => {
    const item = articles.find((entry) => entry.id === id);
    const meta = blogTypeMeta(item?.content_type);
    if (!window.confirm(meta.deleteConfirm)) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo eliminar.');
      if (form.id === id) startCreate(activeType);
      setSuccess(meta.deletedLabel);
      await load();
    } catch (e) {
      setError(e.message || 'Error al eliminar');
    } finally {
      setDeletingId('');
    }
  };

  if (loading) {
    return <RouteLoadingMascot label="Cargando blog…" />;
  }

  const activeMeta = blogTypeMeta(activeType);
  const formMeta = blogTypeMeta(form.contentType);
  const filteredItems = articles.filter(
    (item) => normalizeBlogContentType(item.content_type) === activeType,
  );
  const newsMeta = BLOG_CONTENT_TYPE_META[BLOG_TYPE_NEWS];
  const articleMeta = BLOG_CONTENT_TYPE_META[BLOG_TYPE_ARTICLE];

  return (
    <div className={`shell ${styles.wrap}`}>
      <PanelPageHeader
        title="Blog"
        subtitle="Gestiona noticias breves y artículos completos con SEO para marketing."
      />

      <div className={styles.topBar}>
        <Link href="/blog" target="_blank" rel="noopener noreferrer" className={styles.topLink}>
          Ver blog público
        </Link>
        <div className={styles.topActions}>
          <button type="button" className={styles.newBtn} onClick={() => startCreate(BLOG_TYPE_NEWS)}>
            + {newsMeta.createLabel}
          </button>
          <button
            type="button"
            className={`${styles.newBtn} ${styles.newBtnSecondary}`}
            onClick={() => startCreate(BLOG_TYPE_ARTICLE)}
          >
            + {articleMeta.createLabel}
          </button>
        </div>
      </div>

      <div className={styles.typeTabs} role="tablist" aria-label="Tipo de contenido">
        {[BLOG_TYPE_NEWS, BLOG_TYPE_ARTICLE].map((type) => {
          const meta = blogTypeMeta(type);
          const count = articles.filter(
            (item) => normalizeBlogContentType(item.content_type) === type,
          ).length;
          return (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={activeType === type}
              className={activeType === type ? styles.typeTabActive : styles.typeTab}
              onClick={() => {
                setActiveType(type);
                if (!form.id) startCreate(type);
              }}
            >
              {meta.labelPlural} ({count})
            </button>
          );
        })}
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className={styles.success} role="status">
          {success}
        </p>
      ) : null}

      <div className={styles.layout}>
        <form className={styles.main} onSubmit={handleSubmit} ref={editorRef}>
          <BlogArticleEditor
            form={form}
            onChange={patchForm}
            onSlugTouched={() => setSlugTouched(true)}
            slugTouched={slugTouched}
            onTitleChange={handleTitleChange}
            onUploadImage={uploadImage}
            uploading={uploading}
          />

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn} disabled={saving || uploading}>
              {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : formMeta.createLabel}
            </button>
            {form.id ? (
              <>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => startCreate(form.contentType)}
                >
                  Nuevo
                </button>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  disabled={deletingId === form.id}
                  onClick={() => handleDelete(form.id)}
                >
                  {deletingId === form.id ? 'Eliminando…' : 'Eliminar'}
                </button>
                {form.published ? (
                  <Link
                    href={`/blog/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewLink}
                  >
                    Ver publicado
                  </Link>
                ) : null}
              </>
            ) : null}
          </div>
        </form>

        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            {activeMeta.labelPlural} ({filteredItems.length})
          </h2>
          {filteredItems.length === 0 ? (
            <p className={styles.empty}>
              No hay {activeMeta.labelPlural.toLowerCase()} todavía. Pulsa «{activeMeta.createLabel}» para empezar.
            </p>
          ) : (
            <ul className={styles.sidebarList}>
              {filteredItems.map((article) => (
                <li key={article.id}>
                  <button
                    type="button"
                    className={`${styles.sidebarItem}${form.id === article.id ? ` ${styles.sidebarItemActive}` : ''}`}
                    onClick={() => handleEdit(article)}
                  >
                    {article.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.cover_image_url} alt="" className={styles.sidebarThumb} />
                    ) : (
                      <span className={styles.sidebarThumbPlaceholder} aria-hidden="true" />
                    )}
                    <span className={styles.sidebarText}>
                      <strong>{article.title}</strong>
                      <span className={styles.sidebarMeta}>
                        {formatBlogDate(article.created_at)}
                        {' · '}
                        {article.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
