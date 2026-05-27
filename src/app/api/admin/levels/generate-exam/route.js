import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/adminApiAuth';
import {
  generateAndPersistA2Exam,
  generateAndPersistA2ExamPart,
  resetA2ExamContent,
} from '@/lib/levelsA2ExamGenerator';
import {
  generateAndPersistB2Exam,
  generateAndPersistB2ExamPart,
  resetB2ExamContent,
} from '@/lib/levelsB2ExamGenerator';
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

  if (slug !== 'a2' && slug !== 'b2') {
    return NextResponse.json(
      { error: 'Solo están implementados los niveles A2 y B2.' },
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
        slug === 'b2'
          ? await resetB2ExamContent(auth.adminDb, { levelId: levelData.id, examSlot: slot })
          : await resetA2ExamContent(auth.adminDb, { levelId: levelData.id, examSlot: slot });
      invalidateLevelExamCache(levelData.id);
      return NextResponse.json({ ok: true, slot, levelId: levelData.id, ...deleted });
    }

    let result;
    if (slug === 'b2') {
      if (partNumber != null && Number.isFinite(partNumber)) {
        result = await generateAndPersistB2ExamPart(auth.adminDb, {
          levelId: levelData.id,
          examSlot: slot,
          partNumber,
          skipAudio,
        });
      } else {
        result = await generateAndPersistB2Exam(auth.adminDb, {
          levelId: levelData.id,
          examSlot: slot,
          force,
          skipAudio,
        });
      }
    } else if (partNumber != null && Number.isFinite(partNumber)) {
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
