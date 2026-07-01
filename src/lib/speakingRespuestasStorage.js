export const SPEAKING_RESPUESTAS_BUCKET = 'speaking-respuestas';

export const SPEAKING_RESPUESTA_MAX_BYTES = 15 * 1024 * 1024;

export const SPEAKING_RESPUESTA_MIME_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/wav',
  'audio/x-wav',
]);

/**
 * @param {string} mimeType
 */
export function speakingRespuestaExtensionFromMime(mimeType = 'audio/webm') {
  switch (mimeType) {
    case 'audio/ogg':
      return 'ogg';
    case 'audio/mpeg':
      return 'mp3';
    case 'audio/mp4':
    case 'audio/x-m4a':
      return 'm4a';
    case 'audio/aac':
      return 'aac';
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav';
    default:
      return 'webm';
  }
}
