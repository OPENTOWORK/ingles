import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { generateAuthActionLink, getSiteOrigin } from '@/lib/authActionLinks';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_KEY = 5;
const MAX_BUCKETS = 5000;

/** @type {Map<string, { n: number, reset: number }>} */
const buckets = new Map();

function tryConsume(key) {
  if (!key) return true;
  const now = Date.now();

  for (const [k, bucket] of buckets) {
    if (now > bucket.reset) buckets.delete(k);
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

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

/**
 * Reenvía el correo de confirmación de una cuenta sin verificar.
 *
 * Se apoya en que `generateLink` de tipo signup solo devuelve token cuando la
 * cuenta existe y sigue sin confirmar; sobre una cuenta ya confirmada responde
 * «email_exists». Sin contraseña en la llamada, la actual no se toca.
 */
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Introduce un email válido.' }, { status: 400 });
  }

  if (!tryConsume(email) || !tryConsume(clientIp(req))) {
    return NextResponse.json(
      {
        error: 'Has pedido demasiados correos seguidos. Espera unos minutos y vuelve a intentarlo.',
        code: 'RATE_LIMIT',
      },
      { status: 429 },
    );
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Reenvío no configurado en el servidor.', code: 'NO_SERVICE_ROLE' },
      { status: 503 },
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const link = await generateAuthActionLink(adminClient, {
    type: 'signup',
    email,
    origin: getSiteOrigin(req),
    next: '/perfil',
  });

  if (link.alreadyRegistered) {
    return NextResponse.json({
      ok: true,
      alreadyConfirmed: true,
      message: 'Tu email ya está confirmado. Inicia sesión con tu contraseña.',
    });
  }

  if (!link.url) {
    console.error('api/auth/resend-confirmation generateLink:', link.error);
    return NextResponse.json({
      ok: true,
      message: 'Si hay una cuenta pendiente de confirmar con ese email, te llegará el enlace.',
    });
  }

  let nombre = '';
  try {
    const { data } = await adminClient
      .from('Usuarios_y_Perfil_users')
      .select('nombre')
      .eq('email', email)
      .maybeSingle();
    nombre = data?.nombre || '';
  } catch {
    /* el nombre es opcional en la plantilla */
  }

  const result = await dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.USER_EMAIL_CONFIRMATION,
    to: email,
    variables: { email, nombre, action_url: link.url },
  });

  if (!result.sent && !result.queued) {
    console.error('api/auth/resend-confirmation email:', result.error);
    return NextResponse.json(
      { error: 'No se pudo enviar el correo de confirmación. Inténtalo en unos minutos.' },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Te hemos reenviado el correo de confirmación. Revisa tu bandeja y la carpeta de spam.',
  });
}
