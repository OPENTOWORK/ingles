import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/adminApiAuth';
import {
  previewA2ExamPartGeneration,
  saveA2ExamPartFromPreview,
} from '@/lib/levelsA2ExamGenerator';
import {
  previewLevelExamPartGeneration,
  saveLevelExamPartFromPreview,
} from '@/lib/levelsCambridgeExamGenerator';
import { isExamGenerationSlug } from '@/lib/levelsExamCatalog';
import { clampB2ExamSlot } from '@/utils/b2ResolveExam';
import { getCachedLevelBySlug, invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { logExamGeneration } from '@/lib/examGenerationLog';

export const maxDuration = 300;

/**
 * Admin single-part generation with preview/save.
 * POST body:
 * - action: "preview" | "save" (default preview)
 * - slug, slot|examNumber, partNumber|partId
 * - generated: required for save (approved JSON from preview)
 */
export async function POST(req) {
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const slug = String(body.slug || body.level || 'b2').toLowerCase();
  const slot = clampB2ExamSlot(body.slot ?? body.examSlot ?? body.examNumber ?? 1);
  const action = String(body.action || body.mode || 'preview').toLowerCase();
  const skipAudio = Boolean(body.skipAudio);
  const skipImages = Boolean(body.skipImages);

  let partNumber = body.partNumber != null ? Number(body.partNumber) : null;
  if (partNumber == null && body.partId) {
    const m = String(body.partId).match(/(\d+)/);
    if (m) partNumber = Number(m[1]);
  }

  if (!Number.isFinite(partNumber)) {
    return NextResponse.json({ error: 'partNumber or partId is required.' }, { status: 400 });
  }

  if (slug !== 'a2' && !isExamGenerationSlug(slug)) {
    return NextResponse.json(
      { error: 'Niveles soportados: A2, B1, B2, C1 y C2.' },
      { status: 400 },
    );
  }

  try {
    const { data: levelData, error: levelError } = await getCachedLevelBySlug(auth.adminDb, slug);
    if (levelError || !levelData?.id) {
      return NextResponse.json({ error: `Nivel ${slug.toUpperCase()} no encontrado.` }, { status: 404 });
    }

    if (action === 'save') {
      if (!body.generated || typeof body.generated !== 'object') {
        return NextResponse.json({ error: 'generated payload is required for save.' }, { status: 400 });
      }

      const result =
        slug === 'a2'
          ? await saveA2ExamPartFromPreview(auth.adminDb, {
              levelId: levelData.id,
              examSlot: slot,
              partNumber,
              generated: body.generated,
              skipAudio,
              skipImages,
              replacePartContent: body.replacePartContent !== false,
            })
          : await saveLevelExamPartFromPreview(auth.adminDb, {
              levelSlug: slug,
              levelId: levelData.id,
              examSlot: slot,
              partNumber,
              generated: body.generated,
              skipAudio,
              replacePartContent: body.replacePartContent !== false,
            });

      invalidateLevelExamCache(levelData.id);

      return NextResponse.json({
        success: true,
        ok: true,
        action: 'save',
        slot,
        levelId: levelData.id,
        ...result,
      });
    }

    if (action !== 'preview') {
      return NextResponse.json({ error: 'action must be preview or save.' }, { status: 400 });
    }

    const preview =
      slug === 'a2'
        ? await previewA2ExamPartGeneration({
            examSlot: slot,
            partNumber,
            varietySeed: body.varietySeed,
            topic: body.topic,
          })
        : await previewLevelExamPartGeneration({
            levelSlug: slug,
            examSlot: slot,
            partNumber,
            varietySeed: body.varietySeed,
            topic: body.topic,
          });

    return NextResponse.json({
      success: true,
      ok: true,
      action: 'preview',
      slot,
      levelId: levelData.id,
      preview: {
        partTitle: preview.partTitle,
        partLabel: preview.partLabel,
        partNumber: preview.partNumber,
        enunciadoPreview: preview.enunciadoPreview,
        payload: preview.generated,
        validation: preview.validation,
      },
    });
  } catch (err) {
    logExamGeneration('part_api_error', {
      level: slug,
      examNumber: slot,
      partNumber,
      action,
      error: err?.message,
      saved: false,
    });
    console.error('[admin/levels/generate-exam-part]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'No se pudo procesar la parte.' },
      { status: 500 },
    );
  }
}
