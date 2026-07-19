'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import styles from './PromptColoredTextEditor.module.css';

const TEXT_COLORS = [
  { label: 'Negro', value: '#0f172a' },
  { label: 'Rojo', value: '#dc2626' },
  { label: 'Naranja', value: '#ea580c' },
  { label: 'Ámbar', value: '#d97706' },
  { label: 'Verde', value: '#16a34a' },
  { label: 'Azul', value: '#2563eb' },
  { label: 'Índigo', value: '#4f46e5' },
  { label: 'Violeta', value: '#7c3aed' },
  { label: 'Rosa', value: '#db2777' },
  { label: 'Gris', value: '#64748b' },
];

async function getAuthHeaders() {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token || null;
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function preventToolbarBlur(event) {
  event.preventDefault();
}

function applyForeColor(color) {
  document.execCommand('styleWithCSS', false, true);
  document.execCommand('foreColor', false, color);
}

/**
 * Editor ligero para prompts con color de texto (estilo Word).
 * Guarda HTML; al generar exámenes se convierte a texto plano.
 */
const PromptColoredTextEditor = forwardRef(function PromptColoredTextEditor(
  {
    value = '',
    onChange,
    rows = 16,
    placeholder = '',
    ariaLabel = 'Prompt',
    showInlineToolbar = true,
    enableTranslate = true,
    lang = 'es',
  },
  ref,
) {
  const editorRef = useRef(null);
  /** null = aún no sincronizado con el DOM (evita saltar el primer value al montar). */
  const lastHtmlRef = useRef(null);
  const [translating, setTranslating] = useState(null);
  const [translateError, setTranslateError] = useState('');

  const isEn = lang === 'en';

  const emitChange = useCallback(() => {
    const html = editorRef.current?.innerHTML || '';
    lastHtmlRef.current = html;
    onChange?.(html);
  }, [onChange]);

  const setEditorHtml = useCallback(
    (html) => {
      const editor = editorRef.current;
      if (!editor) return;
      const next = String(html || '');
      if (next && !/<[a-z][\s\S]*>/i.test(next)) {
        editor.textContent = next;
      } else {
        editor.innerHTML = next;
      }
      lastHtmlRef.current = editor.innerHTML;
      onChange?.(editor.innerHTML);
    },
    [onChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      applyColor(color) {
        editorRef.current?.focus();
        applyForeColor(color);
        emitChange();
      },
      focus() {
        editorRef.current?.focus();
      },
      getPlainText() {
        return editorRef.current?.innerText || '';
      },
      getHtml() {
        return editorRef.current?.innerHTML || '';
      },
      setHtml(html) {
        setEditorHtml(html);
      },
    }),
    [emitChange, setEditorHtml],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const next = value || '';
    if (lastHtmlRef.current !== null && next === lastHtmlRef.current) return;

    // Plain text from code/Supabase → preservar saltos de línea
    if (next && !/<[a-z][\s\S]*>/i.test(next)) {
      editor.textContent = next;
      lastHtmlRef.current = editor.innerHTML;
      return;
    }

    editor.innerHTML = next;
    lastHtmlRef.current = next;
  }, [value]);

  const focusEditor = () => editorRef.current?.focus();

  const run = (fn) => {
    focusEditor();
    fn();
    emitChange();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    emitChange();
  };

  const handleTranslate = async (targetLang) => {
    const html = editorRef.current?.innerHTML || '';
    if (!String(html).replace(/<[^>]+>/g, '').trim()) {
      setTranslateError(isEn ? 'The prompt is empty.' : 'El prompt está vacío.');
      return;
    }

    setTranslating(targetLang);
    setTranslateError('');
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(buildClientApiUrl('/api/admin/levels/exam-part-prompt/translate'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ html, targetLang }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || (isEn ? 'Translation failed.' : 'No se pudo traducir.'));
      }
      setEditorHtml(json.html || '');
    } catch (err) {
      setTranslateError(err?.message || (isEn ? 'Translation failed.' : 'No se pudo traducir.'));
    } finally {
      setTranslating(null);
    }
  };

  const minHeight = Math.max(8, Number(rows) || 16) * 1.35;

  return (
    <div className={styles.wrap}>
      {showInlineToolbar ? (
        <div className={styles.toolbar} role="toolbar" aria-label="Formato de texto">
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={() => run(() => document.execCommand('bold'))}
            title="Negrita"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={() => run(() => document.execCommand('italic'))}
            title="Cursiva"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={() => run(() => document.execCommand('underline'))}
            title="Subrayado"
          >
            <span className={styles.underline}>U</span>
          </button>

          <span className={styles.toolbarSep} aria-hidden="true" />

          <span className={styles.colorLabel}>Color</span>
          <div className={styles.swatches}>
            {TEXT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={styles.swatch}
                style={{ background: c.value }}
                title={c.label}
                aria-label={c.label}
                onMouseDown={preventToolbarBlur}
                onClick={() => run(() => applyForeColor(c.value))}
              />
            ))}
          </div>
          <label className={styles.customColor}>
            <span className={styles.srOnly}>Color personalizado</span>
            <input
              type="color"
              defaultValue="#4f46e5"
              onMouseDown={preventToolbarBlur}
              onChange={(e) => {
                const color = e.target.value;
                run(() => applyForeColor(color));
              }}
              title="Más colores"
            />
          </label>

          {enableTranslate ? (
            <>
              <span className={styles.toolbarSep} aria-hidden="true" />
              <span className={styles.colorLabel}>{isEn ? 'Translate' : 'Traducir'}</span>
              <div
                className={styles.langGroup}
                role="group"
                aria-label={isEn ? 'Translate prompt' : 'Traducir prompt'}
              >
                <button
                  type="button"
                  className={styles.langBtn}
                  onMouseDown={preventToolbarBlur}
                  onClick={() => void handleTranslate('en')}
                  disabled={Boolean(translating)}
                  title={isEn ? 'Translate prompt to English' : 'Traducir prompt al inglés'}
                >
                  {translating === 'en' ? '…' : 'EN'}
                </button>
                <button
                  type="button"
                  className={styles.langBtn}
                  onMouseDown={preventToolbarBlur}
                  onClick={() => void handleTranslate('es')}
                  disabled={Boolean(translating)}
                  title={isEn ? 'Translate prompt to Spanish' : 'Traducir prompt al español'}
                >
                  {translating === 'es' ? '…' : 'ES'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {translateError ? (
        <p className={styles.translateError} role="alert">
          {translateError}
        </p>
      ) : null}

      <div
        ref={editorRef}
        className={styles.editor}
        style={{ minHeight: `${minHeight}rem` }}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
      />
    </div>
  );
});

export { TEXT_COLORS };
export default PromptColoredTextEditor;
