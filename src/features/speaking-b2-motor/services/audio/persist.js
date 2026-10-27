import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/aiUsage';

export const SPEAKING_B2_AUDIO_BUCKET = 'speaking-b2-audio';
export const SPEAKING_B2_AUDIO_MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
]);

export function isAllowedSpeakingB2AudioMime(mimeType) {
  return ALLOWED_MIME.has(String(mimeType || '').split(';')[0].trim().toLowerCase());
}

export function validateSpeakingB2CandidateAudio({ buffer = null, mimeType = '' } = {}) {
  if (buffer == null) return { ok: true, silent: true };
  if (!buffer.length) return { ok: false, code: 'AUDIO_EMPTY', error: 'Empty audio.' };
  if (buffer.length > SPEAKING_B2_AUDIO_MAX_BYTES) {
    return { ok: false, code: 'AUDIO_TOO_LONG', error: 'Audio is too long.' };
  }
  if (mimeType && !isAllowedSpeakingB2AudioMime(mimeType)) {
    return { ok: false, code: 'AUDIO_FORMAT', error: 'Audio format is not supported.' };
  }
  return { ok: true, silent: false };
}

export function speakingB2AudioPath({ userId, sessionId, mimeType }) {
  const owner = userId || 'anonymous';
  const ext = mimeType?.includes('mp4') || mimeType?.includes('m4a') ? 'm4a' : 'webm';
  return `${owner}/${sessionId}/${randomUUID()}.${ext}`;
}

export async function persistSpeakingB2Audio({ userId, sessionId, buffer, mimeType }) {
  const check = validateSpeakingB2CandidateAudio({ buffer, mimeType });
  if (!check.ok || check.silent) return null;
  const mime = isAllowedSpeakingB2AudioMime(mimeType) ? String(mimeType).split(';')[0].trim() : 'audio/webm';
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const path = speakingB2AudioPath({ userId, sessionId, mimeType: mime });
  try {
    const { error } = await admin.storage.from(SPEAKING_B2_AUDIO_BUCKET).upload(path, buffer, {
      contentType: mime,
      upsert: false,
    });
    if (error) return null;
    return { path, mimeType: mime, bytes: buffer.length };
  } catch {
    return null;
  }
}

export async function createSpeakingB2SignedUrl(path, expiresSec = 3600) {
  if (!path) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  try {
    const { data, error } = await admin.storage
      .from(SPEAKING_B2_AUDIO_BUCKET)
      .createSignedUrl(path, expiresSec);
    if (error) return null;
    return data?.signedUrl || null;
  } catch {
    return null;
  }
}
