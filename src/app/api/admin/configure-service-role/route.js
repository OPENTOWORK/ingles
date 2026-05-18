import { NextResponse } from 'next/server';
import {
  isSupabaseServiceRoleReady,
  looksLikeServiceRoleKey,
  saveSupabaseServiceRoleKey,
  verifyServiceRoleKey,
} from '@/lib/supabaseServiceRoleCredentials';

function isLocalDev(req) {
  if (process.env.NODE_ENV === 'production') return false;
  const host = req.headers.get('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
}

export async function GET(req) {
  if (!isLocalDev(req)) {
    return NextResponse.json({ error: 'Solo disponible en desarrollo local.' }, { status: 403 });
  }
  return NextResponse.json({ configured: isSupabaseServiceRoleReady() });
}

export async function POST(req) {
  if (!isLocalDev(req)) {
    return NextResponse.json({ error: 'Solo disponible en desarrollo local.' }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
  }

  const serviceRoleKey = String(body?.serviceRoleKey || '').trim();
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Pega la clave service_role de Supabase.' }, { status: 400 });
  }

  if (!looksLikeServiceRoleKey(serviceRoleKey)) {
    return NextResponse.json(
      {
        error:
          'Clave inválida. En Supabase → Project Settings → API copia la clave «service_role» (secreta), no la «anon».',
      },
      { status: 400 },
    );
  }

  const verified = await verifyServiceRoleKey(serviceRoleKey);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }

  saveSupabaseServiceRoleKey(serviceRoleKey);

  return NextResponse.json({
    ok: true,
    message:
      'Clave guardada en secrets/supabase-service-role.txt. Ya puedes crear usuarios desde el panel (reinicia npm run dev si aún falla).',
  });
}
