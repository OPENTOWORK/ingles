import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/aiUsage';
import {
  SPEAKING_RESPUESTAS_BUCKET,
  SPEAKING_RESPUESTA_MAX_BYTES,
  SPEAKING_RESPUESTA_MIME_TYPES,
  speakingRespuestaExtensionFromMime,
} from '@/lib/speakingRespuestasStorage';

/**
 * @param {string | null | undefined} userId
 * @param {string} sessionId
 * @param {string} mimeType
 */
export function buildSpeakingRespuestaStoragePath(userId, sessionId, mimeType = 'audio/webm') {
  const owner = userId?.trim() || 'anonymous';
  const safeSession = String(sessionId).replace(/[^\w.-]/g, '_').slice(0, 64);
  const ext = speakingRespuestaExtensionFromMime(mimeType);
  return `${owner}/${safeSession}/${randomUUID()}.${ext}`;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} path
 */
export function getSpeakingRespuestaPublicUrl(supabase, path) {
  const { data } = supabase.storage.from(SPEAKING_RESPUESTAS_BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}

/**
 * Sube el audio a Storage e inserta fila en speaking_respuestas (service role).
 *
 * @param {{
 *   userId?: string | null,
 *   sessionId: string,
 *   turnId?: string | null,
 *   mode: string,
 *   cefr: string,
 *   b2PartNumber?: number,
 *   examPartIndex?: number,
 *   transcript: string,
 *   transcriptSource: 'STT' | 'TYPED' | 'MOCK',
 *   buffer: Buffer,
 *   mimeType: string,
 *   filename?: string,
 * }} params
 * @returns {Promise<{ audioUrl: string, storagePath: string, id: string } | null>}
 */
export async function persistSpeakingRespuestaAudio(params) {
  const {
    userId = null,
    sessionId,
    turnId = null,
    mode,
    cefr,
    b2PartNumber = null,
    examPartIndex = 0,
    transcript,
    transcriptSource,
    buffer,
    mimeType,
  } = params;

  if (!sessionId || !buffer?.length) return null;

  const normalizedMime = mimeType?.trim() || 'audio/webm';
  if (!SPEAKING_RESPUESTA_MIME_TYPES.has(normalizedMime)) {
    console.warn('[speaking] Unsupported audio mime type:', normalizedMime);
    return null;
  }
  if (buffer.length > SPEAKING_RESPUESTA_MAX_BYTES) {
    console.warn('[speaking] Audio exceeds max size:', buffer.length);
    return null;
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.warn('[speaking] Supabase admin not configured; audio not persisted.');
    return null;
  }

  const storagePath = buildSpeakingRespuestaStoragePath(userId, sessionId, normalizedMime);

  const { error: uploadError } = await admin.storage
    .from(SPEAKING_RESPUESTAS_BUCKET)
    .upload(storagePath, buffer, {
      upsert: false,
      contentType: normalizedMime,
      cacheControl: '31536000',
    });

  if (uploadError) {
    console.error('[speaking] Storage upload failed:', uploadError);
    return null;
  }

  const audioUrl = getSpeakingRespuestaPublicUrl(admin, storagePath);

  const row = {
    user_id: userId || null,
    session_id: sessionId,
    turn_id: turnId || null,
    mode,
    cefr,
    b2_part_number: b2PartNumber > 0 ? b2PartNumber : null,
    exam_part_index: examPartIndex,
    transcript: transcript || '',
    transcript_source: transcriptSource,
    storage_path: storagePath,
    audio_url: audioUrl,
    mime_type: normalizedMime,
    file_size_bytes: buffer.length,
  };

  const { data, error: insertError } = await admin
    .from('speaking_respuestas')
    .insert(row)
    .select('id')
    .single();

  if (insertError) {
    console.error('[speaking] speaking_respuestas insert failed:', insertError);
    await admin.storage.from(SPEAKING_RESPUESTAS_BUCKET).remove([storagePath]);
    return null;
  }

  return {
    id: data.id,
    audioUrl,
    storagePath,
  };
}

/**
 * @param {string} turnId
 * @param {string} respuestaId
 */
export async function linkSpeakingRespuestaToTurn(turnId, respuestaId) {
  if (!turnId || !respuestaId) return;
  const admin = getSupabaseAdmin();
  if (!admin) return;

  const { error } = await admin
    .from('speaking_respuestas')
    .update({ turn_id: turnId })
    .eq('id', respuestaId);

  if (error) {
    console.error('[speaking] link turn_id failed:', error);
  }
}

/**
 * @param {string | null | undefined} sessionId
 * @param {number | null | undefined} [b2PartNumber] — filter audios to this speaking part (e.g. 14 = Part 1)
 */
export async function loadSpeakingRespuestasForSession(sessionId, b2PartNumber = null) {
  if (!sessionId) return [];
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data, error } = await admin
    .from('speaking_respuestas')
    .select('id, transcript, audio_url, storage_path, mime_type, turn_id, b2_part_number, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[speaking] load speaking_respuestas failed:', error);
    return [];
  }

  let rows = data || [];
  const part = Number(b2PartNumber) || 0;
  if (part > 0) {
    rows = rows.filter((r) => r.b2_part_number == null || r.b2_part_number === part);
  }

  return rows;
}

/**
 * @param {string} storagePath
 * @returns {Promise<Buffer | null>}
 */
export async function downloadSpeakingRespuestaBuffer(storagePath) {
  if (!storagePath) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin.storage
    .from(SPEAKING_RESPUESTAS_BUCKET)
    .download(storagePath);

  if (error || !data) {
    console.warn('[speaking] audio download failed:', error?.message || storagePath);
    return null;
  }

  return Buffer.from(await data.arrayBuffer());
}

/**
 * Conversation + stored audio for holistic speaking feedback.
 *
 * @param {string | null | undefined} sessionId
 * @param {string | null | undefined} fallbackTranscript
 * @param {number | null | undefined} [b2PartNumber]
 */
export async function loadSpeakingSessionEvaluationContext(
  sessionId,
  fallbackTranscript,
  b2PartNumber = null,
) {
  const respuestas = await loadSpeakingRespuestasForSession(sessionId, b2PartNumber);

  /** @type {Array<{ text: string }>} */
  let studentTurns = [];
  let dialogue = '';

  if (sessionId) {
    try {
      const { prisma } = await import('@/lib/prisma');
      const { hasDatabaseUrl } = await import('@/lib/prisma');
      if (hasDatabaseUrl() && !sessionId.startsWith('local_')) {
        const turns = await prisma.speakingTurn.findMany({
          where: { sessionId },
          orderBy: { createdAt: 'asc' },
          select: { role: true, text: true },
        });
        dialogue = turns
          .map((t) => `${t.role === 'USER' ? 'Student' : 'Examiner'}: ${t.text}`)
          .join('\n\n');
        studentTurns = turns.filter((t) => t.role === 'USER').map((t) => ({ text: t.text }));
      }
    } catch (err) {
      console.warn('[speaking] could not load turns for evaluation context', err);
    }
  }

  if (studentTurns.length === 0 && fallbackTranscript?.trim()) {
    studentTurns = fallbackTranscript
      .split(/\n\n+/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ text }));
  }

  /** @type {Array<{ transcript: string, buffer: Buffer, mimeType: string }>} */
  const audioClips = [];
  for (const row of respuestas) {
    const buffer = await downloadSpeakingRespuestaBuffer(row.storage_path);
    if (!buffer?.length) continue;
    audioClips.push({
      transcript: row.transcript || '',
      buffer,
      mimeType: row.mime_type || 'audio/webm',
    });
  }

  return { dialogue, studentTurns, respuestas, audioClips };
}
