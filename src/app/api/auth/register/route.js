import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { pickRandomMascotVariant } from '@/lib/profileDefaultAvatar';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { generateAuthActionLink, getPublicSiteOrigin } from '@/lib/authActionLinks';
import { markReferralRegistered } from '@/lib/referrals';
import { maybeGrantFoundingMemberPlus } from '@/lib/foundingMemberPlus';

export const maxDuration = 30;

const supabaseUrl = getSupabaseUrl();
const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 40;
const MAX_BUCKETS = 5000;
/** Espera máxima por los correos: nunca deben tumbar el registro. */
const SIGNUP_EMAIL_TIMEOUT_MS = 15000;
/** Dónde aterriza quien pulsa el enlace de confirmación. */
const CONFIRMATION_NEXT_PATH = '/perfil';

/** El envío se hace dentro de la petición: en serverless nada sobrevive a la respuesta. */
function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);
}

/** @type {Map<string, { n: number, reset: number }>} */
const ipBuckets = new Map();

function clientIp(req) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0].trim().slice(0, 64);
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || '';
}

function pruneBuckets(now) {
  for (const [key, bucket] of ipBuckets) {
    if (now > bucket.reset) ipBuckets.delete(key);
  }
  if (ipBuckets.size > MAX_BUCKETS) ipBuckets.clear();
}

/**
 * Reserva un intento; false si se superó el máximo por IP.
 * Sin IP identificable no se limita: colegios y redes con NAT compartirían un
 * único cubo y bloquearían a todo el mundo.
 */
function tryConsumeRate(ip) {
  if (!ip) return true;

  const now = Date.now();
  pruneBuckets(now);

  let b = ipBuckets.get(ip);
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + WINDOW_MS };
    ipBuckets.set(ip, b);
  }
  if (b.n >= MAX_PER_IP) return false;
  b.n += 1;
  return true;
}

/** Devuelve el intento al cubo cuando el fallo no es culpa de quien se registra. */
function refundRate(ip) {
  if (!ip) return;
  const b = ipBuckets.get(ip);
  if (b && b.n > 0) b.n -= 1;
}

/** Traduce los errores de Supabase Auth para que el usuario sepa qué corregir. */
function translateAuthError(error) {
  const msg = String(error?.message || '').toLowerCase();
  if (msg.includes('password') && (msg.includes('short') || msg.includes('least'))) {
    return 'La contraseña es demasiado corta. Usa al menos 8 caracteres, con una mayúscula, una minúscula y un número.';
  }
  if (msg.includes('password')) {
    return 'La contraseña no cumple los requisitos de seguridad. Usa al menos 8 caracteres, con una mayúscula, una minúscula y un número.';
  }
  if (msg.includes('invalid') && msg.includes('email')) {
    return 'El email no es válido. Revisa que esté bien escrito.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Hemos recibido demasiadas peticiones seguidas. Espera un minuto y vuelve a intentarlo.';
  }
  return error?.message || 'No se pudo crear la cuenta.';
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
    const nombre = String(body?.nombre || body?.name || '').trim().slice(0, 120);
    const acceptedTerms = Boolean(body?.acceptedTerms);
    const acceptedDataProtection = Boolean(body?.acceptedDataProtection);
    const acceptedMarketing = Boolean(body?.acceptedMarketing);
    const referralToken = String(body?.referralToken || body?.ref || '').trim();

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

    // `generateLink` de tipo signup crea la cuenta SIN confirmar y devuelve el
    // token en la misma llamada: nadie entra sin verificar antes su correo.
    const origin = getPublicSiteOrigin(req);
    const signup = await generateAuthActionLink(adminClient, {
      type: 'signup',
      email,
      password,
      origin,
      next: CONFIRMATION_NEXT_PATH,
      data: {
        role: 'student',
        ...(nombre ? { name: nombre } : {}),
        legal_acceptance,
      },
    });

    if (!signup.user?.id) {
      if (signup.alreadyRegistered) {
        return NextResponse.json(
          {
            error:
              'Ya existe una cuenta con este email. Inicia sesión o usa "¿Has olvidado tu contraseña?".',
            code: 'EMAIL_EXISTS',
          },
          { status: 409 }
        );
      }
      refundRate(ip);
      return NextResponse.json({ error: translateAuthError(signup.rawError) }, { status: 400 });
    }

    const userId = signup.user.id;

    // A partir de aquí la cuenta ya existe: ningún fallo posterior puede
    // devolver error, o el usuario quedaría sin poder registrarse ni entrar.
    let welcomeEmailSent = false;
    let confirmationEmailSent = false;

    try {
      // Un trigger de auth.users ya crea la fila de aplicación y el perfil.
      // Aquí solo rellenamos lo que el trigger no sabe, sin pisar sus valores.
      const rolId = await resolveStudentRoleId(adminClient);

      const appUserRow = {
        id: userId,
        email,
        activo: true,
        consentimiento_comercial: acceptedMarketing,
      };
      if (nombre) appUserRow.nombre = nombre;
      if (rolId) appUserRow.rol_id = rolId;

      const { error: appUserError } = await adminClient
        .from('Usuarios_y_Perfil_users')
        .upsert(appUserRow, { onConflict: 'id' });
      if (appUserError) {
        console.error('api/auth/register app user row:', appUserError);
      }

      await persistMarketingConsent(adminClient, userId, email, acceptedMarketing);

      const { data: profileRow } = await adminClient
        .from('Usuarios_y_Perfil_profiles')
        .select('mascot_variant, idioma_preferido')
        .eq('user_id', userId)
        .maybeSingle();

      const profilePatch = {};
      if (profileRow?.mascot_variant == null) {
        profilePatch.mascot_variant = pickRandomMascotVariant();
      }
      if (!profileRow?.idioma_preferido) {
        profilePatch.idioma_preferido = 'es';
      }

      if (Object.keys(profilePatch).length) {
        await adminClient
          .from('Usuarios_y_Perfil_profiles')
          .upsert({ user_id: userId, ...profilePatch }, { onConflict: 'user_id' });
      }
    } catch (err) {
      console.error('api/auth/register post-creación:', err);
    }

    try {
      await markReferralRegistered({
        userId,
        email,
        referralToken: referralToken || undefined,
      });
    } catch (err) {
      console.error('api/auth/register referral:', err);
    }

    try {
      const founding = await maybeGrantFoundingMemberPlus(adminClient, { userId, email, nombre });
      if (founding.granted) {
        console.info(
          `api/auth/register founding plus: slot ${founding.slotNumber} → ${email}`,
        );
      }
    } catch (err) {
      console.error('api/auth/register founding plus:', err);
    }

    try {
      const dispatch = (triggerEvent, variables) =>
        withTimeout(
          dispatchAutomatedEmail({ adminClient, triggerEvent, to: email, variables }).catch((err) => {
            console.error(`api/auth/register ${triggerEvent}:`, err);
            return null;
          }),
          SIGNUP_EMAIL_TIMEOUT_MS,
        );

      const [welcomeMail, confirmationMail] = await Promise.all([
        dispatch(AUTOMATED_EMAIL_TRIGGERS.USER_REGISTERED, { email, nombre }),
        dispatch(AUTOMATED_EMAIL_TRIGGERS.USER_EMAIL_CONFIRMATION, {
          email,
          nombre,
          action_url: signup.url,
        }),
      ]);

      welcomeEmailSent = Boolean(welcomeMail?.sent || welcomeMail?.queued);
      confirmationEmailSent = Boolean(confirmationMail?.sent || confirmationMail?.queued);

      if (!welcomeEmailSent) console.error('api/auth/register welcome email:', welcomeMail?.error);
      if (!confirmationEmailSent) {
        console.error('api/auth/register confirmation email:', confirmationMail?.error);
      }
    } catch (err) {
      console.error('api/auth/register signup emails:', err);
    }

    return NextResponse.json({
      ok: true,
      userId,
      welcomeEmailSent,
      confirmationEmailSent,
      requiresEmailConfirmation: true,
      message: confirmationEmailSent
        ? 'Cuenta creada. Te hemos enviado un correo para confirmar tu email: ábrelo antes de iniciar sesión.'
        : 'Cuenta creada, pero no hemos podido enviar el correo de confirmación. Usa «Reenviar confirmación» en la pantalla de acceso.',
    });
  } catch (err) {
    console.error('api/auth/register:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
