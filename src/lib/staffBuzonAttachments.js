export const BUZON_ATTACHMENT_BUCKET = 'staff-buzon-attachments';
export const BUZON_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const BUZON_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
]);

export const BUZON_AUDIO_MIME_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/wav',
  'audio/x-wav',
]);

export const BUZON_ATTACHMENT_KINDS = new Set(['image', 'document', 'audio']);

export const BUZON_ATTACHMENT_MAX_BYTES = 15 * 1024 * 1024;

/**
 * @param {File} file
 * @returns {{ ok: true, kind: 'image' | 'document' | 'audio' } | { ok: false, error: string }}
 */
export function validateBuzonAttachmentFile(file) {
  if (!file) return { ok: false, error: 'Selecciona un archivo.' };
  if (file.size > BUZON_ATTACHMENT_MAX_BYTES) {
    return { ok: false, error: 'El archivo debe pesar 15 MB o menos.' };
  }
  if (BUZON_IMAGE_MIME_TYPES.has(file.type)) {
    return { ok: true, kind: 'image' };
  }
  if (BUZON_DOCUMENT_MIME_TYPES.has(file.type)) {
    return { ok: true, kind: 'document' };
  }
  if (BUZON_AUDIO_MIME_TYPES.has(file.type) || String(file.type || '').startsWith('audio/')) {
    return { ok: true, kind: 'audio' };
  }
  return {
    ok: false,
    error:
      'Formato no permitido. Usa imágenes, documentos (PDF, Word, Excel, TXT, ZIP) o audio (MP3, M4A, WAV, WebM, OGG).',
  };
}

export function getBuzonAttachmentDefaultBody(kind) {
  if (kind === 'image') return 'Imagen';
  if (kind === 'audio') return 'Audio';
  return 'Documento';
}

/**
 * @param {{ body?: string, attachment_kind?: string | null, attachment_name?: string | null }} message
 */
export function getMessagePreview(message) {
  if (message?.attachment_kind === 'image') return '🖼 Imagen';
  if (message?.attachment_kind === 'audio') {
    return `🎤 ${message.attachment_name || 'Audio'}`;
  }
  if (message?.attachment_kind === 'document') {
    return `📎 ${message.attachment_name || 'Documento'}`;
  }
  return message?.body || '';
}

export function isImageAttachment(message) {
  return message?.attachment_kind === 'image' && Boolean(message?.attachment_url);
}

export function isDocumentAttachment(message) {
  return message?.attachment_kind === 'document' && Boolean(message?.attachment_url);
}

export function isAudioAttachment(message) {
  return message?.attachment_kind === 'audio' && Boolean(message?.attachment_url);
}
