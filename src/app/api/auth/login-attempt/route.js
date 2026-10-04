import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_KEY = 30;
const MAX_BUCKETS = 5000;

/** @type {Map<string, { n: number, reset: number }>} */
const buckets = new Map();

const REASONS = {
  invalid_credentials: 'Email o contraseña incorrectos',
  user_not_found: 'No hay ninguna cuenta con ese correo',
  email_not_confirmed: 'El correo no está confirmado',
  rate_limit: 'Demasiados intentos seguidos',
  session_not_saved: 'La contraseña era correcta, pero no se pudo guardar la sesión',
  oauth_failed: 'No se pudo completar el inicio de sesión con el proveedor',
  unexpected: 'Error inesperado al iniciar sesión',
};

function tryConsume(key) {
  if (!key) return true;
  const now = Date.now();
  for (const [bucketKey, bucket] of buckets) {
    if (now > bucket.reset) buckets.delete(bucketKey);
  }
  if (buckets.size > MAX_BUCKETS) buckets.clear();

  let bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    bucket = { n: 0, reset: now + WINDOW_MS };
    buckets.set(key, bucket);
  }
  if (bucket.n >= MAX_PER_KEY) return false;
  bucket.n += 1;
  return true;
}

function clientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim().slice(0, 64);
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || '';
}

function reasonFor(code, provider) {
  if (code === 'oauth_failed' && provider === 'google') {
    return 'No se pudo iniciar sesión con Google';
  }
  return REASONS[code] || REASONS.unexpected;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const code = String(body?.code || '').trim();
  if (!REASONS[code]) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body?.email || '').trim().toLowerCase().slice(0, 320);
  const provider = body?.provider === 'google' ? 'google' : '';
  const ip = clientIp(req);
  if (!tryConsume(ip || 'unknown') || (email && !tryConsume(email))) {
    return NextResponse.json({ ok: true });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[login-attempt] service role no configurada');
    return NextResponse.json({ ok: true });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userId = null;
  const lookupEmail = email.replace(/[%_\\]/g, '');
  if (lookupEmail) {
    const { data: profile } = await adminClient
      .from('Usuarios_y_Perfil_users')
      .select('id')
      .ilike('email', lookupEmail)
      .maybeSingle();
    userId = profile?.id || null;
  }

  const { error } = await adminClient.from('auth_sesiones').insert({
    user_id: userId,
    email: email || null,
    exitoso: false,
    tipo_evento: 'login',
    motivo: reasonFor(code, provider),
    creado_en: new Date().toISOString(),
  });

  if (error) {
    console.error('[login-attempt]', error.message);
  }

  return NextResponse.json({ ok: true });
}
