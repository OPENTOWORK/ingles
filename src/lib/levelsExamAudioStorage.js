import { synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';
import { getSupabaseUrl } from '@/lib/supabaseEnv';

const BUCKET = 'Levels_Listening';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} adminDb — service role
 */
export async function uploadListeningClip(adminDb, { path, audioBuffer, contentType = 'audio/mpeg' }) {
  const { error } = await adminDb.storage.from(BUCKET).upload(path, audioBuffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const base = getSupabaseUrl()?.replace(/\/$/, '');
  const encoded = path.split('/').map((s) => encodeURIComponent(s)).join('/');
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

/**
 * Genera clips TTS y devuelve filas para levels_preguntas_audios.
 * @param {{ partNumber: number, examSlot: number, levelLabel: string, script: string, clips: Array<{ orden: number, titulo: string, text: string }> }} params
 */
export function listeningClipStoragePath({ levelLabel = 'B2', examSlot, partNumber, orden, revision = 'v2' }) {
  const slot = Number(examSlot) || 1;
  const part = Number(partNumber) || 0;
  const ord = Number(orden) || 1;
  const level = String(levelLabel || 'B2').toLowerCase();
  return `${level}/exam-${slot}/part-${part}/clip-${String(ord).padStart(2, '0')}-${revision}.mp3`;
}

export async function synthesizeAndUploadListeningClips(adminDb, params) {
  const rows = [];
  const levelLabel = params.levelLabel || 'A2';
  const revision = params.revision || 'v2';

  for (const clip of params.clips) {
    const text = String(clip.text || '').trim();
    if (!text) continue;
    const result = await synthesizeExamTtsMp3(text);
    if (!result?.base64) {
      console.warn('[levelsExamAudio] TTS skipped for clip', clip.orden);
      continue;
    }
    const fileName =
      clip.storagePath ||
      listeningClipStoragePath({
        levelLabel,
        examSlot: params.examSlot,
        partNumber: params.partNumber,
        orden: clip.orden,
        revision,
      });
    const buf = Buffer.from(result.base64, 'base64');
    const url = await uploadListeningClip(adminDb, {
      path: fileName,
      audioBuffer: buf,
      contentType: result.mime || 'audio/mpeg',
    });
    rows.push({
      orden: clip.orden,
      titulo: String(clip.titulo || '').trim() || `Listening clip ${clip.orden}`,
      audio_url: url,
    });
  }

  return rows;
}

/**
 * Deriva clips desde JSON listening generado.
 */
export function extractListeningClipsFromGenerated(gen, partDef) {
  const explicit = Array.isArray(gen.audioClips) ? gen.audioClips : [];
  if (explicit.length) {
    return explicit
      .map((c, i) => ({
        orden: c.orden ?? i + 1,
        titulo: String(c.titulo || '').trim() || `Clip ${c.orden ?? i + 1}`,
        text: String(c.text || c.script || '').trim(),
      }))
      .filter((c) => c.text);
  }

  const script = String(gen.script || '').trim();
  const clips = [];
  const n = partDef.audioClips || 1;

  if (n === 1 && script) {
    clips.push({ orden: 1, titulo: gen.setting || gen.title || 'Listening recording', text: script });
    return clips;
  }

  const extractBlocks = script.split(/(?=Extract\s+\d+|Speaker\s+\d+|Question\s+\d+)/i).filter(Boolean);
  if (extractBlocks.length >= n) {
    extractBlocks.slice(0, n).forEach((block, i) => {
      clips.push({
        orden: i + 1,
        titulo: (gen.questions?.[i]?.prompt || `Extract ${i + 1}`).slice(0, 120),
        text: block.trim(),
      });
    });
    return clips;
  }

  const questions = gen.questions || [];
  for (let i = 0; i < n; i += 1) {
    const q = questions[i];
    const dialogue = q?.script || q?.dialogue || `Extract ${i + 1}.\n${q?.prompt || ''}\n${script.slice(0, 400)}`;
    clips.push({
      orden: i + 1,
      titulo: q?.prompt || `Question ${i + 1}`,
      text: dialogue,
    });
  }
  return clips;
}
