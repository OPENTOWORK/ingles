'use client';

import { useRef, useState } from 'react';
import BlogRichTextEditor from '@/components/admin/BlogRichTextEditor';
import { upsertBlogSlotImage } from '@/lib/blogContent';
import { createEmptyFaqItem } from '@/lib/blogFaq';
import {
  PUBLISH_MODE_NOW,
  PUBLISH_MODE_SCHEDULE,
  combineScheduleInputs,
  formatScheduledDateTime,
  getScheduleQuickPresets,
  isFutureSchedule,
} from '@/lib/blogSchedule';
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
  publishMode: PUBLISH_MODE_NOW,
  scheduledPublishAt: '',
  scheduleDate: '',
  scheduleTime: '09:00',
  faqItems: [],
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
  const slotMenuRef = useRef(null);

  const contentType = normalizeBlogContentType(form.contentType);
  const meta = blogTypeMeta(contentType);
  const isArticle = contentType === BLOG_TYPE_ARTICLE;
  const isNews = contentType === BLOG_TYPE_NEWS;
  const publishMode = form.publishMode || PUBLISH_MODE_NOW;
  const isScheduleMode = publishMode === PUBLISH_MODE_SCHEDULE;
  const isDraftArticle =
    Boolean(form.id) && !form.published && !isScheduleMode && !isFutureSchedule(form.scheduledPublishAt);
  const schedulePreviewIso = combineScheduleInputs(form.scheduleDate, form.scheduleTime);
  const schedulePresets = getScheduleQuickPresets();

  const updateFaqItem = (id, patch) => {
    onChange({
      faqItems: (form.faqItems || []).map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  };

  const removeFaqItem = (id) => {
    onChange({
      faqItems: (form.faqItems || []).filter((item) => item.id !== id),
    });
  };

  const addFaqItem = () => {
    onChange({
      faqItems: [...(form.faqItems || []), createEmptyFaqItem()],
    });
  };

  const applySchedulePreset = (iso) => {
    const date = new Date(iso);
    onChange({
      publishMode: PUBLISH_MODE_SCHEDULE,
      scheduledPublishAt: iso,
      scheduleDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      scheduleTime: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    });
  };

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

  const closeSlotMenu = () => {
    if (slotMenuRef.current) slotMenuRef.current.open = false;
  };

  const handleSlotImage = async (event, slot) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    closeSlotMenu();
    if (!file) return;
    try {
      const url = await onUploadImage(file, 'inline');
      const alt = window.prompt(
        `Texto alternativo de la imagen ${slot} (SEO):`,
        form.title || `Imagen ${slot} del ${meta.label.toLowerCase()}`,
      );
      const next = upsertBlogSlotImage(form.content, slot, url, alt || '');
      onChange({ content: next });
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
            <div className={styles.coverActions}>
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
              <details ref={slotMenuRef} className={styles.imageMenu}>
                <summary className={styles.imageMenuSummary}>
                  Imágenes 1–3
                </summary>
                <div className={styles.imageMenuList} role="menu">
                  {[1, 2, 3].map((slot) => (
                    <label key={slot} className={styles.imageMenuItem} role="menuitem">
                      Subir imagen {slot}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className={styles.fileInput}
                        disabled={uploading}
                        onChange={(event) => handleSlotImage(event, slot)}
                      />
                    </label>
                  ))}
                </div>
              </details>
            </div>
            <p className={styles.hint}>
              La portada se ve en el listado. Las imágenes 1, 2 y 3 van dentro del texto, en ese
              orden.
            </p>
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

          <section className={styles.publicationCard} aria-labelledby="blog-publication-title">
            <h3 id="blog-publication-title" className={styles.sectionTitle}>
              Publicación
            </h3>
            <p className={styles.sectionHint}>
              {isDraftArticle
                ? 'Este contenido está en borrador. Con «Publicar ahora» activo, pulsa el botón de publicar abajo para hacerlo visible en /blog.'
                : `El recuadro verde es solo una vista previa. Debes pulsar «${isScheduleMode ? 'Programar publicación' : meta.publishActionLabel}» para guardarlo.`}
            </p>

            <div className={styles.publishToggle} role="tablist" aria-label="Modo de publicación">
              <button
                type="button"
                role="tab"
                aria-selected={!isScheduleMode}
                className={!isScheduleMode ? styles.publishToggleActive : styles.publishToggleBtn}
                onClick={() => onChange({ publishMode: PUBLISH_MODE_NOW })}
              >
                Publicar ahora
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isScheduleMode}
                className={isScheduleMode ? styles.publishToggleActive : styles.publishToggleBtn}
                onClick={() => onChange({ publishMode: PUBLISH_MODE_SCHEDULE })}
              >
                Programar
              </button>
            </div>

            {isScheduleMode ? (
              <div className={styles.schedulePanel}>
                <div className={styles.scheduleRow}>
                  <label className={styles.scheduleField}>
                    <span>Fecha</span>
                    <input
                      type="date"
                      className={styles.input}
                      value={form.scheduleDate || ''}
                      onChange={(e) =>
                        onChange({
                          scheduleDate: e.target.value,
                          scheduledPublishAt: combineScheduleInputs(
                            e.target.value,
                            form.scheduleTime || '09:00',
                          ),
                        })
                      }
                    />
                  </label>
                  <label className={styles.scheduleField}>
                    <span>Hora</span>
                    <input
                      type="time"
                      className={styles.input}
                      value={form.scheduleTime || '09:00'}
                      onChange={(e) =>
                        onChange({
                          scheduleTime: e.target.value,
                          scheduledPublishAt: combineScheduleInputs(
                            form.scheduleDate,
                            e.target.value,
                          ),
                        })
                      }
                    />
                  </label>
                </div>

                <div className={styles.quickAccess}>
                  <span className={styles.quickAccessLabel}>Accesos rápidos</span>
                  <div className={styles.quickAccessBtns}>
                    {schedulePresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={styles.quickAccessBtn}
                        onClick={() => applySchedulePreset(preset.iso)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {schedulePreviewIso && isFutureSchedule(schedulePreviewIso) ? (
                  <p className={styles.schedulePreview} role="status">
                    Programado para: {formatScheduledDateTime(schedulePreviewIso)}
                  </p>
                ) : (
                  <p className={styles.schedulePreviewWarn} role="status">
                    Elige una fecha y hora futuras para programar la publicación.
                  </p>
                )}
              </div>
            ) : (
              <p className={styles.publishNowHint}>
                Al guardar, el {meta.label.toLowerCase()} se publicará de inmediato en /blog.
              </p>
            )}
          </section>

          <section className={styles.faqCard} aria-labelledby="blog-faq-title">
            <h3 id="blog-faq-title" className={styles.sectionTitle}>
              Preguntas frecuentes
            </h3>
            <p className={styles.sectionHint}>
              Opcional. Se muestran al final del {meta.label.toLowerCase()}, antes de los comentarios.
              Si no añades ninguna, la sección no aparece.
            </p>

            {(form.faqItems || []).length === 0 ? (
              <p className={styles.faqEmpty}>Todavía no hay preguntas frecuentes.</p>
            ) : (
              <ul className={styles.faqList}>
                {(form.faqItems || []).map((item, index) => (
                  <li key={item.id} className={styles.faqItem}>
                    <div className={styles.faqItemHead}>
                      <strong>Pregunta {index + 1}</strong>
                      <button
                        type="button"
                        className={styles.faqRemoveBtn}
                        onClick={() => removeFaqItem(item.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                    <label className={styles.label}>
                      Pregunta
                      <input
                        type="text"
                        className={styles.input}
                        value={item.question}
                        onChange={(e) => updateFaqItem(item.id, { question: e.target.value })}
                        placeholder="¿Cómo puedo empezar a practicar con Dralo?"
                      />
                    </label>
                    <label className={styles.label}>
                      Respuesta
                      <textarea
                        rows={3}
                        className={styles.textarea}
                        value={item.answer}
                        onChange={(e) => updateFaqItem(item.id, { answer: e.target.value })}
                        placeholder="Escribe aquí la respuesta…"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <button type="button" className={styles.addFaqBtn} onClick={addFaqItem}>
              + Añadir pregunta
            </button>
          </section>
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
