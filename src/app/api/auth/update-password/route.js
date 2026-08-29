import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function passwordOk(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

function formatUpdateError(error) {
  const raw = String(error?.message || error?.msg || '').trim();
  if (!raw || raw === 'null' || raw === 'undefined') {
    return 'No se pudo actualizar la contraseña. El enlace puede haber caducado; pide uno nuevo.';
  }
  const lower = raw.toLowerCase();
  if (lower.includes('session') && lower.includes('missing')) {
    return 'La sesión de recuperación ha caducado. Pide un enlace nuevo y ábrelo de inmediato.';
  }
  if (lower.includes('same') && lower.includes('password')) {
    return 'La nueva contraseña no puede ser igual a la anterior.';
  }
  return raw;
}

/** Actualiza la contraseña usando la sesión de las cookies (tras /auth/confirm). */
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const password = String(body?.password || '');
  if (!passwordOk(password)) {
    return NextResponse.json(
      {
        error:
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
      },
      { status: 400 },
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json(
        {
          error:
            'La sesión de recuperación no es válida o ha caducado. Pide un enlace nuevo.',
          code: 'NO_SESSION',
        },
        { status: 401 },
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return NextResponse.json({ error: formatUpdateError(updateError) }, { status: 400 });
    }

    await supabase.auth.signOut().catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('api/auth/update-password:', err);
    return NextResponse.json({ error: 'Error interno al actualizar la contraseña.' }, { status: 500 });
  }
}
