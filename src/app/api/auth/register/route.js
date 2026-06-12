import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { pickRandomMascotVariant } from '@/lib/profileDefaultAvatar';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';

const supabaseUrl = getSupabaseUrl();
const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 8;

/** @type {Map<string, { n: number, reset: number }>} */
const ipBuckets = new Map();

function clientIp(req) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim().slice(0, 64) || 'unknown';
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'unknown';
}

/** Reserva un intento; false si se superó el máximo por IP. */
function tryConsumeRate(ip) {
  const now = Date.now();
  let b = ipBuckets.get(ip);
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + WINDOW_MS };
    ipBuckets.set(ip, b);
  }
  if (b.n >= MAX_PER_IP) return false;
  b.n += 1;
  return true;
}

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

function passwordOk(p) {
  return (
    typeof p === 'string' &&
    p.length >= 8 &&
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /\d/.test(p)
  );
}

async function resolveStudentRoleId(adminClient) {
  const candidates = ['Alumno', 'alumno', 'student', 'Student', 'Alumno/a'];
  for (const nombre of candidates) {
    const { data } = await adminClient
      .from('Usuarios_y_Perfil_roles')
      .select('id')
      .eq('nombre', nombre)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  const { data } = await adminClient
    .from('Usuarios_y_Perfil_roles')
    .select('id')
    .ilike('nombre', '%alumn%')
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

async function persistMarketingConsent(adminClient, userId, email, marketingAccepted) {
  const attempts = [
    () =>
      adminClient
        .from('Usuarios_y_Perfil_users')
        .update({ consentimiento_comercial: marketingAccepted })
        .eq('id', userId),
    () =>
      adminClient
        .from('Usuarios_y_Perfil_users')
        .update({ marketing_updates: marketingAccepted })
        .eq('id', userId),
    () =>
      adminClient.from('Usuarios_y_Perfil_users').upsert(
        {
          id: userId,
          email,
          consentimiento_comercial: marketingAccepted,
        },
        { onConflict: 'id' }
      ),
  ];
  for (const run of attempts) {
    try {
      const { error } = await run();
      if (!error) return;
    } catch {
      /* siguiente */
    }
  }
}

export async function POST(req) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Registro por servidor no configurado.', code: 'NO_SERVICE_ROLE' },
        { status: 503 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
    }

    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const acceptedTerms = Boolean(body?.acceptedTerms);
    const acceptedDataProtection = Boolean(body?.acceptedDataProtection);
    const acceptedMarketing = Boolean(body?.acceptedMarketing);

    if (!acceptedTerms || !acceptedDataProtection) {
      return NextResponse.json(
        { error: 'Debes aceptar términos y protección de datos.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email no válido.' }, { status: 400 });
    }

    if (!passwordOk(password)) {
      return NextResponse.json(
        {
          error:
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
        },
        { status: 400 }
      );
    }

    const ip = clientIp(req);
    if (!tryConsumeRate(ip)) {
      return NextResponse.json(
        {
          error:
            'Demasiados intentos de registro desde esta conexión. Prueba de nuevo en una hora o contacta con soporte.',
          code: 'RATE_LIMIT',
        },
        { status: 429 }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const legal_acceptance = {
      terms_and_conditions: true,
      data_protection: true,
      marketing_updates: acceptedMarketing,
      accepted_at: new Date().toISOString(),
    };

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'student',
        legal_acceptance,
      },
    });

    if (createError || !created?.user?.id) {
      const msg = (createError?.message || '').toLowerCase();
      if (msg.includes('already been registered') || msg.includes('already exists')) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email. Inicia sesión o recupera la contraseña.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: createError?.message || 'No se pudo crear la cuenta.' },
        { status: 400 }
      );
    }

    const userId = created.user.id;
    const rolId = await resolveStudentRoleId(adminClient);

    if (rolId) {
      await adminClient.from('Usuarios_y_Perfil_users').upsert(
        {
          id: userId,
          email,
          rol_id: rolId,
          activo: true,
        },
        { onConflict: 'id' }
      );
    }

    await persistMarketingConsent(adminClient, userId, email, acceptedMarketing);

    const mascotVariant = pickRandomMascotVariant();
    await adminClient.from('Usuarios_y_Perfil_profiles').upsert(
      {
        user_id: userId,
        idioma_preferido: 'es',
        mascot_variant: mascotVariant,
      },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );

    const welcomeMail = await dispatchAutomatedEmail({
      adminClient,
      triggerEvent: AUTOMATED_EMAIL_TRIGGERS.USER_REGISTERED,
      to: email,
      variables: { email },
    });

    return NextResponse.json({
      ok: true,
      userId,
      welcomeEmailSent: welcomeMail.sent || welcomeMail.queued,
      message: 'Cuenta creada. Ya puedes iniciar sesión con tu email y contraseña.',
    });
  } catch (err) {
    console.error('api/auth/register:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
