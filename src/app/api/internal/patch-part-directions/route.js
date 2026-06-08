import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { verifyInternalApiKey } from '@/lib/verifyInternalApiKey';
import { invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { parteNameForLevel } from '@/lib/levelsExamCatalog';

/**
 * Update levels_partes."Descripción" only (directions visible in exam UI).
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
  const partNumber = Number(body.partNumber);
  const descripcion = String(body.descripcion || body.description || '').trim();

  if (!Number.isFinite(partNumber) || partNumber < 1 || !descripcion) {
    return NextResponse.json(
      { error: 'partNumber and descripcion are required.' },
      { status: 400 },
    );
  }

  const admin = createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const nombreParte = parteNameForLevel(slug, partNumber);
  const { data: parte, error: readErr } = await admin
    .from('levels_partes')
    .select('id, nombre_parte, Descripción')
    .eq('nombre_parte', nombreParte)
    .maybeSingle();

  if (readErr || !parte?.id) {
    return NextResponse.json(
      { error: readErr?.message || `Part ${nombreParte} not found.` },
      { status: 404 },
    );
  }

  const oldDescripcion = parte['Descripción'] ?? parte.Descripción ?? '';

  const { error: updateErr } = await admin
    .from('levels_partes')
    .update({ Descripción: descripcion })
    .eq('id', parte.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const { data: level } = await admin.from('levels').select('id').ilike('nombre', slug).maybeSingle();
  if (level?.id) invalidateLevelExamCache(level.id);

  return NextResponse.json({
    ok: true,
    parteId: parte.id,
    nombre_parte: parte.nombre_parte,
    oldDescripcion,
    newDescripcion: descripcion,
  });
}
