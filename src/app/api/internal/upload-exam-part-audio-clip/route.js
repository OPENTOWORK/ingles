import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyInternalApiKey } from '@/lib/verifyInternalApiKey';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { uploadListeningClip } from '@/lib/levelsExamAudioStorage';
import { getCachedLevelBySlug, invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { clampB2ExamSlot } from '@/utils/b2ResolveExam';
import { resolveLevelExamenId } from '@/lib/levelsExamPersist';
import { getLevelExamPartDef, parteNameForLevel } from '@/lib/levelsExamCatalog';

export const maxDuration = 60;

/**
 * Upload one listening clip (pre-synthesized MP3) for an exam part question row.
 */
export async function POST(req) {
  const auth = verifyInternalApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 503 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const slug = String(body.slug || 'b2').toLowerCase();
  const slot = clampB2ExamSlot(body.slot ?? body.examSlot ?? 1);
  const partNumber = Number(body.partNumber);
  const preguntaId = String(body.preguntaId || '').trim();
  const orden = Number(body.orden);
  const titulo = String(body.titulo || '').trim();
  const storagePath = String(body.storagePath || '').trim();
  const audioBase64 = String(body.audioBase64 || body.base64 || '').trim();
  const existingAudioUrl = String(body.existingAudioUrl || body.audioUrl || '').trim();
  const replaceExisting = body.replaceExisting !== false;

  if (!Number.isFinite(partNumber) || !Number.isFinite(orden) || !storagePath) {
    return NextResponse.json(
      { error: 'partNumber, orden and storagePath are required.' },
      { status: 400 },
    );
  }

  if (!audioBase64 && !existingAudioUrl) {
    return NextResponse.json(
      { error: 'audioBase64 or existingAudioUrl is required.' },
      { status: 400 },
    );
  }

  const admin = createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: levelData, error: levelError } = await getCachedLevelBySlug(admin, slug);
  if (levelError || !levelData?.id) {
    return NextResponse.json({ error: `Level ${slug} not found.` }, { status: 404 });
  }

  let qId = preguntaId;
  if (!qId) {
    const partDef = getLevelExamPartDef(slug, partNumber);
    if (!partDef) {
      return NextResponse.json({ error: `Invalid part: ${partNumber}` }, { status: 400 });
    }
    const examenId = await resolveLevelExamenId(admin, slug, levelData.id, slot);
    const { data: parte } = await admin
      .from('levels_partes')
      .select('id')
      .eq('nombre_parte', parteNameForLevel(slug, partNumber))
      .maybeSingle();
    if (!parte?.id || !examenId) {
      return NextResponse.json({ error: 'Exam part row not found.' }, { status: 404 });
    }
    const { data: pregunta } = await admin
      .from('levels_preguntas')
      .select('id')
      .eq('examen_id', examenId)
      .eq('parte_id', parte.id)
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle();
    qId = pregunta?.id;
  }

  if (!qId) {
    return NextResponse.json({ error: 'preguntaId not found for this part.' }, { status: 404 });
  }

  if (replaceExisting) {
    await admin.from('levels_preguntas_audios').delete().eq('pregunta_id', qId).eq('orden', orden);
  }

  const buf = audioBase64 ? Buffer.from(audioBase64, 'base64') : null;
  const audio_url = buf
    ? await uploadListeningClip(admin, {
        path: storagePath,
        audioBuffer: buf,
        contentType: 'audio/mpeg',
      })
    : existingAudioUrl;

  const { data: row, error } = await admin
    .from('levels_preguntas_audios')
    .insert({
      pregunta_id: qId,
      audio_url,
      orden,
      titulo: titulo || `Speaker ${orden}`,
    })
    .select('id, orden, titulo, audio_url')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateLevelExamCache(levelData.id);

  return NextResponse.json({
    ok: true,
    preguntaId: qId,
    partNumber,
    clip: row,
    storagePath,
    bytes: buf?.length ?? 0,
    relinked: !buf && Boolean(existingAudioUrl),
  });
}
