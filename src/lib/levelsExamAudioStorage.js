import { synthesizeListeningClipMp3, synthesizePart2ListeningMp3, synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';
import { concatMp3BuffersNormalized, makeSilenceMp3 } from '@/lib/listeningAudioFfmpeg';
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

/** Single MP3 for Listening Part 1 (all short extracts in one recording). */
export function listeningCombinedStoragePath({ levelLabel = 'B2', examSlot, partNumber, revision = 'v2' }) {
  const slot = Number(examSlot) || 1;
  const part = Number(partNumber) || 0;
  const level = String(levelLabel || 'B2').toLowerCase();
  return `${level}/exam-${slot}/part-${part}/full-${revision}.mp3`;
}

/** @param {Buffer[]} buffers */
export function concatMp3Buffers(buffers) {
  const parts = (buffers || []).filter((b) => b?.length);
  if (!parts.length) return Buffer.alloc(0);
  return Buffer.concat(parts);
}

/** Whether listening clips for this part should be merged into one MP3 (Part 1 extracts, Part 3 speakers). */
export function shouldCombineListeningClips(partDef) {
  if (partDef?.mode !== 'listening') return false;
  if (partDef.activity === 'short-extracts') return true;
  if (partDef.activity === 'multiple-matching' && (partDef.audioClips || 0) > 1) return true;
  return false;
}

export function listeningCombinedDefaultTitle(partNumber, setting) {
  const fromSetting = String(setting || '').trim();
  if (fromSetting) return fromSetting;
  switch (Number(partNumber)) {
    case 10:
      return 'Part 1: Short extracts (questions 1–8)';
    case 12:
      return 'Part 3: Multiple matching (questions 19–23)';
    default:
      return 'Listening recording';
  }
}

function listeningClipSynthesizer(partDef) {
  return partDef?.activity === 'sentence-completion'
    ? synthesizePart2ListeningMp3
    : synthesizeListeningClipMp3;
}

async function synthesizeListeningClipBuffers(clips, partDef) {
  const buffers = [];
  const synth = listeningClipSynthesizer(partDef);
  for (let i = 0; i < clips.length; i += 1) {
    const clip = clips[i];
    const text = String(clip.text || '').trim();
    if (!text) continue;
    const result = await synth(text, { extractIndex: (Number(clip.orden) || i + 1) - 1 });
    if (!result?.base64) {
      console.warn('[levelsExamAudio] TTS skipped for clip', clip.orden);
      continue;
    }
    buffers.push(Buffer.from(result.base64, 'base64'));
  }
  return buffers;
}

/** Descarga la intro hablada compartida (b2/shared/listening-part-N-intro.mp3). */
export async function fetchSharedListeningIntro(storagePath) {
  const base = getSupabaseUrl()?.replace(/\/$/, '');
  if (!base || !storagePath) return null;
  const encoded = String(storagePath)
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/');
  try {
    const res = await fetch(`${base}/storage/v1/object/public/${BUCKET}/${encoded}`);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function resolveListeningIntroBuffer(assembly, listeningIntro) {
  const fromStorage = await fetchSharedListeningIntro(assembly?.introFromSupabase);
  if (fromStorage?.length) return fromStorage;

  const text = String(listeningIntro?.text || listeningIntro || '').trim();
  if (!text) return null;
  const tts = await synthesizeExamTtsMp3(text, {
    edgeVoice: 'en-GB-SoniaNeural',
    preferEdge: true,
  });
  return tts?.base64 ? Buffer.from(tts.base64, 'base64') : null;
}

/**
 * Monta la grabación completa al estilo del Examen 1 B2:
 * intro → pausa → pasada 1 → pausa → pasada 2.
 * Las pasadas reutilizan el mismo audio, igual que en un examen real.
 * @param {{ clipBuffers: Buffer[], assembly?: object, introBuffer?: Buffer|null }} params
 */
export function assembleListeningFullRecording({ clipBuffers = [], assembly = {}, introBuffer = null }) {
  const usable = clipBuffers.filter((b) => b?.length);
  if (!usable.length) return Buffer.alloc(0);

  const passes = Math.max(1, Number(assembly.passes) || 1);
  const introPauseSec = Number(assembly.introPauseSec ?? 5);
  const betweenExtractPauseSec = Number(assembly.betweenExtractPauseSec ?? 3);
  const betweenPassesPauseSec = Number(assembly.betweenPassesPauseSec ?? 10);

  const pass = usable.flatMap((buf, i) =>
    i === 0 ? [buf] : [makeSilenceMp3(betweenExtractPauseSec), buf],
  );

  const segments = [];
  if (introBuffer?.length) segments.push(introBuffer, makeSilenceMp3(introPauseSec));
  for (let p = 0; p < passes; p += 1) {
    if (p > 0) segments.push(makeSilenceMp3(betweenPassesPauseSec));
    segments.push(...pass);
  }
  return concatMp3BuffersNormalized(segments);
}

export async function synthesizeAndUploadListeningClips(adminDb, params) {
  const rows = [];
  const levelLabel = params.levelLabel || 'A2';
  const revision = params.revision || 'v2';
  const assembly = params.audioAssembly;
  const combineClips =
    params.combineClips ?? params.combineShortExtracts ?? shouldCombineListeningClips(params.partDef);

  if (assembly && Number(assembly.passes) > 1 && params.clips?.length) {
    const clipBuffers = await synthesizeListeningClipBuffers(params.clips, params.partDef);
    if (!clipBuffers.length) return rows;

    const combined = assembleListeningFullRecording({
      clipBuffers,
      assembly,
      introBuffer: await resolveListeningIntroBuffer(assembly, params.listeningIntro),
    });
    if (!combined.length) return rows;

    const fileName =
      params.combinedStoragePath ||
      assembly.combinedStoragePath ||
      listeningCombinedStoragePath({
        levelLabel,
        examSlot: params.examSlot,
        partNumber: params.partNumber,
        revision,
      });
    const url = await uploadListeningClip(adminDb, {
      path: fileName,
      audioBuffer: combined,
      contentType: 'audio/mpeg',
    });
    rows.push({
      orden: 1,
      titulo:
        String(params.combinedTitle || '').trim() ||
        listeningCombinedDefaultTitle(params.partNumber, params.setting),
      audio_url: url,
    });
    return rows;
  }

  if (combineClips && params.clips?.length > 1) {
    const buffers = [];
    for (let i = 0; i < params.clips.length; i += 1) {
      const clip = params.clips[i];
      const text = String(clip.text || '').trim();
      if (!text) continue;
      const result = await synthesizeListeningClipMp3(text, {
        extractIndex: (Number(clip.orden) || i + 1) - 1,
      });
      if (!result?.base64) {
        console.warn('[levelsExamAudio] TTS skipped for combined clip extract', clip.orden);
        continue;
      }
      buffers.push(Buffer.from(result.base64, 'base64'));
    }
    if (!buffers.length) return rows;

    const combined = concatMp3Buffers(buffers);
    const fileName =
      params.combinedStoragePath ||
      listeningCombinedStoragePath({
        levelLabel,
        examSlot: params.examSlot,
        partNumber: params.partNumber,
        revision,
      });
    const url = await uploadListeningClip(adminDb, {
      path: fileName,
      audioBuffer: combined,
      contentType: 'audio/mpeg',
    });
    rows.push({
      orden: 1,
      titulo:
        String(params.combinedTitle || '').trim() ||
        listeningCombinedDefaultTitle(params.partNumber, params.setting),
      audio_url: url,
    });
    return rows;
  }

  for (const clip of params.clips) {
    const text = String(clip.text || '').trim();
    if (!text) continue;
    const synth =
      params.partDef?.activity === 'sentence-completion'
        ? synthesizePart2ListeningMp3
        : synthesizeListeningClipMp3;
    const result = await synth(text, {
      extractIndex: (Number(clip.orden) || rows.length + 1) - 1,
    });
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
        storagePath: String(c.storagePath || c.storage_path || '').trim(),
      }))
      .filter((c) => c.text);
  }

  const questions = Array.isArray(gen.questions) ? gen.questions : [];
  const perQuestionScripts = questions
    .map((q, i) => ({
      orden: q.number ?? i + 1,
      titulo: String(q.situation || q.prompt || `Extract ${i + 1}`).trim().slice(0, 120),
      text: String(q.script || q.dialogue || '').trim(),
    }))
    .filter((c) => c.text);

  const n = partDef.audioClips || 1;
  if (
    partDef.activity === 'short-extracts' &&
    perQuestionScripts.length >= n
  ) {
    return perQuestionScripts.slice(0, n);
  }

  const script = String(gen.script || '').trim();
  const clips = [];

  if (n === 1 && script) {
    clips.push({ orden: 1, titulo: gen.setting || gen.title || 'Listening recording', text: script });
    return clips;
  }

  const extractBlocks = script.split(/(?=Extract\s+\d+|Speaker\s+\d+|Question\s+\d+)/i).filter(Boolean);
  if (extractBlocks.length >= n) {
    extractBlocks.slice(0, n).forEach((block, i) => {
      const text = block.trim();
      const speakerMatch = text.match(/^Speaker\s+\d+\s*:\s*(.*)$/is);
      const body = speakerMatch ? speakerMatch[1].trim() : text;
      clips.push({
        orden: i + 1,
        titulo: (questions[i]?.situation || questions[i]?.prompt || `Extract ${i + 1}`).slice(0, 120),
        text: body.length >= 40 ? body : text,
      });
    });
    return clips;
  }

  for (let i = 0; i < n; i += 1) {
    const q = questions[i];
    const dialogue = q?.script || q?.dialogue;
    if (dialogue) {
      clips.push({
        orden: i + 1,
        titulo: q?.situation || q?.prompt || `Question ${i + 1}`,
        text: String(dialogue).trim(),
      });
      continue;
    }
    clips.push({
      orden: i + 1,
      titulo: q?.prompt || `Question ${i + 1}`,
      text: `Extract ${i + 1}.\n${q?.prompt || ''}\n${script.slice(0, 400)}`,
    });
  }
  return clips;
}
