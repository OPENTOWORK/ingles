import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/adminApiAuth';
import {
  generateAndPersistA2Exam,
  generateAndPersistA2ExamPart,
  resetA2ExamContent,
} from '@/lib/levelsA2ExamGenerator';
import { resetB2ExamContent } from '@/lib/levelsB2ExamGenerator';
import {
  generateAndPersistLevelExam,
  generateAndPersistLevelExamPart,
  resetLevelExamContent,
} from '@/lib/levelsCambridgeExamGenerator';
import { isExamGenerationSlug } from '@/lib/levelsExamCatalog';
import { clampB2ExamSlot } from '@/utils/b2ResolveExam';
import { getCachedLevelBySlug, invalidateLevelExamCache } from '@/utils/levelsLevelCache';

export const maxDuration = 300;

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

  const slug = String(body.slug || 'a2').toLowerCase();
  const slot = clampB2ExamSlot(body.slot ?? body.examSlot ?? 1);
  const force = Boolean(body.force);
  const reset = Boolean(body.reset);
  const resetExam = Boolean(body.resetExam);
  const skipImages = Boolean(body.skipImages);
  const skipAudio = Boolean(body.skipAudio);
  const partNumber = body.partNumber != null ? Number(body.partNumber) : null;
  const preserveExistingParts = Boolean(body.preserveExistingParts);

  if (slug !== 'a2' && !isExamGenerationSlug(slug)) {
    return NextResponse.json(
      { error: 'Niveles soportados: A2, B1, B2, C1 y C2.' },
      { status: 400 },
    );
  }

  try {
    const { data: levelData, error: levelError } = await getCachedLevelBySlug(auth.adminDb, slug);
    if (levelError || !levelData?.id) {
      return NextResponse.json({ error: `Nivel ${slug.toUpperCase()} no encontrado en levels.` }, { status: 404 });
    }

    if (resetExam) {
      const deleted =
        slug === 'a2'
          ? await resetA2ExamContent(auth.adminDb, { levelId: levelData.id, examSlot: slot })
          : slug === 'b2'
            ? await resetB2ExamContent(auth.adminDb, { levelId: levelData.id, examSlot: slot })
            : await resetLevelExamContent(auth.adminDb, slug, {
                levelId: levelData.id,
                examSlot: slot,
              });
      invalidateLevelExamCache(levelData.id);
      return NextResponse.json({ ok: true, slot, levelId: levelData.id, ...deleted });
    }

    let result;
    if (slug === 'a2') {
      if (partNumber != null && Number.isFinite(partNumber)) {
        result = await generateAndPersistA2ExamPart(auth.adminDb, {
          levelId: levelData.id,
          examSlot: slot,
          partNumber,
          reset: reset || force,
          skipImages,
        });
      } else {
        result = await generateAndPersistA2Exam(auth.adminDb, {
          levelId: levelData.id,
          examSlot: slot,
          force,
          skipImages,
        });
      }
    } else if (partNumber != null && Number.isFinite(partNumber)) {
      result = await generateAndPersistLevelExamPart(auth.adminDb, {
        levelSlug: slug,
        levelId: levelData.id,
        examSlot: slot,
        partNumber,
        skipAudio,
        preserveExistingParts,
        replacePartContent: force,
      });
    } else {
      result = await generateAndPersistLevelExam(auth.adminDb, {
        levelSlug: slug,
        levelId: levelData.id,
        examSlot: slot,
        force,
        skipAudio,
        preserveExistingParts,
        replacePartContent: force,
      });
    }

    invalidateLevelExamCache(levelData.id);

    return NextResponse.json({ ok: true, slot, levelId: levelData.id, ...result });
  } catch (err) {
    console.error('[admin/levels/generate-exam]', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudo generar el examen.' },
      { status: 500 },
    );
  }
}
