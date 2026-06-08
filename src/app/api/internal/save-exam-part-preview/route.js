import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { saveLevelExamPartFromPreview } from '@/lib/levelsCambridgeExamGenerator';
import { verifyInternalApiKey } from '@/lib/verifyInternalApiKey';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { getCachedLevelBySlug, invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { clampB2ExamSlot } from '@/utils/b2ResolveExam';

export const maxDuration = 120;

/**
 * Internal one-shot save for approved exam-part previews (CLI / automation).
 * POST + x-internal-key required; unauthenticated callers receive 401.
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
  const generated = body.generated;

  if (!Number.isFinite(partNumber) || !generated || typeof generated !== 'object') {
    return NextResponse.json({ error: 'partNumber and generated are required.' }, { status: 400 });
  }

  const admin = createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: levelData, error: levelError } = await getCachedLevelBySlug(admin, slug);
  if (levelError || !levelData?.id) {
    return NextResponse.json({ error: `Level ${slug} not found.` }, { status: 404 });
  }

  const skipAudio = body.skipAudio !== false;

  const result = await saveLevelExamPartFromPreview(admin, {
    levelSlug: slug,
    levelId: levelData.id,
    examSlot: slot,
    partNumber,
    generated,
    skipAudio,
    replacePartContent: true,
  });

  invalidateLevelExamCache(levelData.id);

  return NextResponse.json({ ok: true, ...result });
}
