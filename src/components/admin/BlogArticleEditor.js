'use client';

import { useRef, useState } from 'react';
import BlogRichTextEditor from '@/components/admin/BlogRichTextEditor';
import {
  BLOG_TYPE_ARTICLE,
  BLOG_TYPE_NEWS,
  blogTypeMeta,
  normalizeBlogContentType,
} from '@/lib/blogContentTypes';
import styles from './BlogArticleEditor.module.css';

const EMPTY_FORM = {
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  ogImageUrl: '',
  seoTitle: '',
  seoDescription: '',
  contentType: BLOG_TYPE_ARTICLE,
  published: false,
};

function CharCount({ value, max, label }) {
  const len = String(value || '').length;
  const over = len > max;
  return (
    <span className={`${styles.charCount}${over ? ` ${styles.charCountOver}` : ''}`}>
      {label}: {len}/{max}
    </span>
  );
}

/**
 * @param {{
 *   form: typeof EMPTY_FORM,
 *   onChange: (patch: Partial<typeof EMPTY_FORM>) => void,
 *   onSlugTouched: () => void,
 *   slugTouched: boolean,
 *   onTitleChange: (title: string) => void,
 *   onUploadImage: (file: File, kind: 'cover' | 'inline' | 'og') => Promise<string>,
 *   uploading: boolean,
 * }} props
 */
export default function BlogArticleEditor({
  form,
  onChange,
  onSlugTouched,
  slugTouched,
  onTitleChange,
  onUploadImage,
  uploading,
}) {
  const [tab, setTab] = useState('content');
  const richEditorRef = useRef(null);
  const inlineImageInputRef = useRef(null);

  const contentType = normalizeBlogContentType(form.contentType);
  const meta = blogTypeMeta(contentType);
  const isArticle = contentType === BLOG_TYPE_ARTICLE;
  const isNews = contentType === BLOG_TYPE_NEWS;

  const handleInlineImagePick = () => {
    inlineImageInputRef.current?.click();
  };

  const handleInlineImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const url = await onUploadImage(file, 'inline');
      const alt = window.prompt(
        'Texto alternativo de la imagen (SEO):',
        form.title || `Imagen del ${meta.label.toLowerCase()}`,
      );
      const snippet = `<figure><img src="${url}" alt="${(alt || '').replace(/"/g, '')}" loading="lazy" /></figure>`;
      richEditorRef.current?.insertHtml(snippet);
    } catch {
      /* parent shows error */
    }
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const url = await onUploadImage(file, 'cover');
    onChange({ coverImageUrl: url });
  };

  const handleOgUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const url = await onUploadImage(file, 'og');
    onChange({ ogImageUrl: url });
  };

  return (
    <div className={styles.editor}>
      <div className={styles.typeBanner}>
        <span className={styles.typeBadge}>{meta.label}</span>
        <p className={styles.typeHint}>{meta.editorSubtitle}</p>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Secciones del editor">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'content'}
          className={tab === 'content' ? styles.tabActive : styles.tab}
          onClick={() => setTab('content')}
        >
          Contenido
        </button>
        {isArticle ? (
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'seo'}
            className={tab === 'seo' ? styles.tabActive : styles.tab}
            onClick={() => setTab('seo')}
          >
            SEO
          </button>
        ) : null}
      </div>

      {tab === 'content' ? (
        <div className={styles.panel}>
          <label className={styles.label}>
            Título del {meta.label.toLowerCase()}
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={styles.input}
              placeholder={
                isNews
                  ? 'Ej. Nueva función disponible en Dralo'
                  : 'Ej. 5 consejos para mejorar tu listening'
              }
            />
          </label>

          <label className={styles.label}>
            URL (slug)
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => {
                onSlugTouched();
                onChange({ slug: e.target.value });
              }}
              className={styles.input}
              placeholder={
                isNews ? 'nueva-funcion-disponible' : '5-consejos-para-mejorar-tu-listening'
              }
            />
            <span className={styles.hint}>Vista previa: /blog/{form.slug || '…'}</span>
          </label>

          <label className={styles.label}>
            {isNews ? 'Entradilla' : 'Extracto'}
            <textarea
              rows={isNews ? 2 : 3}
              value={form.excerpt}
              onChange={(e) => onChange({ excerpt: e.target.value })}
              className={styles.textarea}
              placeholder={meta.excerptPlaceholder}
            />
          </label>

          <div className={styles.coverBlock}>
            <span className={styles.labelText}>Imagen de portada</span>
            {form.coverImageUrl ? (
              <div className={styles.coverPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImageUrl} alt={`Portada del ${meta.label.toLowerCase()}`} />
                <button
                  type="button"
                  className={styles.textBtn}
                  onClick={() => onChange({ coverImageUrl: '' })}
                >
                  Quitar portada
                </button>
              </div>
            ) : (
              <p className={styles.coverEmpty}>Sin imagen de portada.</p>
            )}
            <label className={styles.uploadBtn}>
              {uploading ? 'Subiendo…' : 'Subir portada'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={styles.fileInput}
                disabled={uploading}
                onChange={handleCoverUpload}
              />
            </label>
          </div>

          <div className={styles.contentBlock}>
            <span className={styles.labelText}>Contenido del {meta.label.toLowerCase()}</span>
            <p className={styles.editorHint}>
              Selecciona texto y usa la barra como en Word: fuente, tamaño, negrita, cursiva,
              hipervínculos e imágenes.
            </p>
            <BlogRichTextEditor
              ref={richEditorRef}
              value={form.content}
              onChange={(content) => onChange({ content })}
              onInsertImage={handleInlineImagePick}
              uploading={uploading}
              placeholder={meta.contentPlaceholder}
            />
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={styles.fileInput}
              disabled={uploading}
              onChange={handleInlineImage}
            />
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => onChange({ published: e.target.checked })}
            />
            {meta.publishLabel}
          </label>
          {!form.published ? (
            <p className={styles.draftNotice} role="status">
              Borrador: esta {meta.label.toLowerCase()} no se mostrará en /blog hasta que actives esta casilla y
              guardes.
            </p>
          ) : null}
        </div>
      ) : (
        <div className={styles.panel}>
          <p className={styles.seoIntro}>
            Campos para el equipo de marketing. Si los dejas vacíos, se usarán el título y el
            extracto del artículo.
          </p>

          <label className={styles.label}>
            Meta título (SEO)
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => onChange({ seoTitle: e.target.value })}
              className={styles.input}
              placeholder={form.title || 'Título para buscadores'}
            />
            <CharCount value={form.seoTitle || form.title} max={60} label="Recomendado" />
          </label>

          <label className={styles.label}>
            Meta descripción (SEO)
            <textarea
              rows={4}
              value={form.seoDescription}
              onChange={(e) => onChange({ seoDescription: e.target.value })}
              className={styles.textarea}
              placeholder={form.excerpt || 'Descripción para buscadores y redes sociales'}
            />
            <CharCount value={form.seoDescription || form.excerpt} max={160} label="Recomendado" />
          </label>

          <div className={styles.coverBlock}>
            <span className={styles.labelText}>Imagen Open Graph (opcional)</span>
            <span className={styles.hint}>
              Para compartir en redes. Si no subes una, se usará la portada.
            </span>
            {form.ogImageUrl ? (
              <div className={styles.coverPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.ogImageUrl} alt="Imagen Open Graph" />
                <button
                  type="button"
                  className={styles.textBtn}
                  onClick={() => onChange({ ogImageUrl: '' })}
                >
                  Quitar imagen OG
                </button>
              </div>
            ) : null}
            <label className={styles.uploadBtn}>
              {uploading ? 'Subiendo…' : 'Subir imagen OG'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={styles.fileInput}
                disabled={uploading}
                onChange={handleOgUpload}
              />
            </label>
          </div>

          <div className={styles.seoPreview}>
            <p className={styles.seoPreviewLabel}>Vista previa en Google</p>
            <p className={styles.seoPreviewTitle}>{form.seoTitle || form.title || 'Título del artículo'}</p>
            <p className={styles.seoPreviewUrl}>www.dralo.es › blog › {form.slug || 'slug'}</p>
            <p className={styles.seoPreviewDesc}>
              {form.seoDescription || form.excerpt || 'Descripción del artículo para resultados de búsqueda.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { EMPTY_FORM as BLOG_EMPTY_FORM };
