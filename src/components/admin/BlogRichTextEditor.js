'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import styles from './BlogRichTextEditor.module.css';

const FONT_FAMILIES = [
  { label: 'Predeterminada', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = [
  { label: '12 px', value: '12px' },
  { label: '14 px', value: '14px' },
  { label: '16 px', value: '16px' },
  { label: '18 px', value: '18px' },
  { label: '22 px', value: '22px' },
  { label: '28 px', value: '28px' },
];

function preventToolbarBlur(event) {
  event.preventDefault();
}

function execCommand(command, value = null) {
  document.execCommand(command, false, value);
}

function applyInlineStyle(property, value) {
  document.execCommand('styleWithCSS', false, true);
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  const span = document.createElement('span');
  span.style[property] = value;

  try {
    range.surroundContents(span);
  } catch {
    const text = range.toString();
    document.execCommand(
      'insertHTML',
      false,
      `<span style="${property}: ${value}">${text}</span>`
    );
  }
}

/**
 * @param {{
 *   value: string,
 *   onChange: (html: string) => void,
 *   onInsertImage?: () => void,
 *   uploading?: boolean,
 *   placeholder?: string,
 * }} props
 */
const BlogRichTextEditor = forwardRef(function BlogRichTextEditor(
  {
    value,
    onChange,
    onInsertImage,
    uploading = false,
    placeholder = 'Escribe el contenido de la noticia…',
  },
  ref
) {
  const editorRef = useRef(null);
  const lastHtmlRef = useRef(value || '');

  const emitChange = useCallback(() => {
    const html = editorRef.current?.innerHTML || '';
    lastHtmlRef.current = html;
    onChange(html);
  }, [onChange]);

  useImperativeHandle(ref, () => ({
    insertHtml(html) {
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, html);
      emitChange();
    },
    focus() {
      editorRef.current?.focus();
    },
  }), [emitChange]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value === lastHtmlRef.current) return;
    editor.innerHTML = value || '';
    lastHtmlRef.current = value || '';
  }, [value]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const handleBold = () => {
    focusEditor();
    execCommand('bold');
    emitChange();
  };

  const handleItalic = () => {
    focusEditor();
    execCommand('italic');
    emitChange();
  };

  const handleUnderline = () => {
    focusEditor();
    execCommand('underline');
    emitChange();
  };

  const handleHeading = (tag) => {
    focusEditor();
    execCommand('formatBlock', tag);
    emitChange();
  };

  const handleList = (ordered) => {
    focusEditor();
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
    emitChange();
  };

  const handleLink = () => {
    focusEditor();
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    const url = window.prompt('URL del hipervínculo:', 'https://');
    if (!url?.trim()) return;

    const safeUrl = url.trim().replace(/"/g, '');
    const label = selectedText || safeUrl;
    document.execCommand(
      'insertHTML',
      false,
      `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`
    );
    emitChange();
  };

  const handleUnlink = () => {
    focusEditor();
    execCommand('unlink');
    emitChange();
  };

  const handleFontFamily = (event) => {
    const font = event.target.value;
    event.target.value = '';
    focusEditor();
    if (!font) return;
    applyInlineStyle('fontFamily', font);
    emitChange();
  };

  const handleFontSize = (event) => {
    const size = event.target.value;
    event.target.value = '';
    focusEditor();
    if (!size) return;
    applyInlineStyle('fontSize', size);
    emitChange();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    emitChange();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formato de texto">
        <div className={styles.toolbarGroup}>
          <label className={styles.selectWrap}>
            <span className={styles.srOnly}>Tipo de fuente</span>
            <select
              className={styles.select}
              defaultValue=""
              onChange={handleFontFamily}
              onMouseDown={preventToolbarBlur}
              title="Tipo de fuente"
            >
              <option value="" disabled>
                Fuente
              </option>
              {FONT_FAMILIES.map((font) => (
                <option key={font.label} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.selectWrap}>
            <span className={styles.srOnly}>Tamaño de fuente</span>
            <select
              className={styles.select}
              defaultValue=""
              onChange={handleFontSize}
              onMouseDown={preventToolbarBlur}
              title="Tamaño de fuente"
            >
              <option value="" disabled>
                Tamaño
              </option>
              {FONT_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={handleBold}
            title="Negrita"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={handleItalic}
            title="Cursiva"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={handleUnderline}
            title="Subrayado"
          >
            <span className={styles.underline}>U</span>
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={() => handleHeading('h2')}
            title="Título grande"
          >
            H2
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={() => handleHeading('h3')}
            title="Título mediano"
          >
            H3
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={() => handleList(false)}
            title="Lista con viñetas"
          >
            • Lista
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={() => handleList(true)}
            title="Lista numerada"
          >
            1. Lista
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={handleLink}
            title="Crear hipervínculo"
          >
            Enlace
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={preventToolbarBlur}
            onClick={handleUnlink}
            title="Quitar enlace"
          >
            Quitar enlace
          </button>
          {onInsertImage ? (
            <button
              type="button"
              className={styles.toolBtn}
              onMouseDown={preventToolbarBlur}
              onClick={onInsertImage}
              disabled={uploading}
              title="Insertar imagen"
            >
              {uploading ? 'Subiendo…' : 'Imagen'}
            </button>
          ) : null}
        </div>
      </div>

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        suppressContentEditableWarning
      />
    </div>
  );
});

export default BlogRichTextEditor;
