import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/adminApiAuth';
import {
  fetchRecentTeoriaPreguntas,
  fetchTeoriaExerciseCatalog,
  generateAndPersistTeoriaExercise,
} from '@/lib/levelsTeoriaExerciseGenerator';
import {
  buildTeoriaSuperBatchPlan,
  summarizeTeoriaSuperBatchPlan,
} from '@/lib/teoriaSuperBatchPlan';

const RECENT_LIMIT = 120;
const MAX_CHUNK = 8;

export const maxDuration = 300;

export async function GET(req) {
  try {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const catalog = await fetchTeoriaExerciseCatalog(auth.adminDb);
    const plan = buildTeoriaSuperBatchPlan(catalog);

    return NextResponse.json({
      superBatch: summarizeTeoriaSuperBatchPlan(plan),
      aiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    });
  } catch (err) {
    console.error('[admin/teoria-ejercicios/super-batch GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const offset = Math.max(0, Number.parseInt(body.offset, 10) || 0);
    const limit = Math.min(
      MAX_CHUNK,
      Math.max(1, Number.parseInt(body.limit, 10) || 5),
    );

    const catalog = await fetchTeoriaExerciseCatalog(auth.adminDb);
    const plan = buildTeoriaSuperBatchPlan(catalog);
    const slice = plan.combinations.slice(offset, offset + limit);

    const created = [];
    const failed = [];

    for (const combo of slice) {
      try {
        const result = await generateAndPersistTeoriaExercise(auth.adminDb, {
          nivelId: combo.nivelId,
          skillId: combo.skillId,
          tipoId: combo.tipoId,
          topicHref: combo.topicHref,
          topicHint: combo.topicLabel,
        });
        created.push({
          id: result.pregunta?.id,
          topic: combo.topicLabel,
          nivel: combo.nivelCode,
          skill: combo.skillName,
        });
      } catch (err) {
        failed.push({
          ...combo,
          error: err?.message || 'Error',
        });
      }
    }

    const nextOffset = offset + slice.length;
    const done = nextOffset >= plan.total;

    let recent;
    if (done) {
      recent = await fetchRecentTeoriaPreguntas(auth.adminDb, RECENT_LIMIT);
    }

    return NextResponse.json({
      ok: failed.length === 0,
      offset,
      processed: slice.length,
      nextOffset,
      total: plan.total,
      done,
      createdCount: created.length,
      failedCount: failed.length,
      failed: failed.slice(0, 5),
      recent: recent || undefined,
    });
  } catch (err) {
    console.error('[admin/teoria-ejercicios/super-batch POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
