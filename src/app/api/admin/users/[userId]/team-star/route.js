import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';

export async function PATCH(req, { params }) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = String((await params)?.userId || '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'Usuario no válido.' }, { status: 400 });
    }

    const body = await req.json();
    const starred = Boolean(body?.starred);
    const { db } = auth;

    const tables = ['Usuarios_y_Perfil_users', 'user_profiles'];
    let lastError = null;

    for (const table of tables) {
      const { error } = await db
        .from(table)
        .update({ destacado_equipo: starred })
        .eq('id', userId);

      if (!error) {
        return NextResponse.json({ ok: true, destacado_equipo: starred });
      }

      lastError = error;
      const message = String(error.message || '');
      if (!message.includes('destacado_equipo') && !message.includes('column')) {
        break;
      }
    }

    return NextResponse.json(
      { error: lastError?.message || 'No se pudo actualizar la estrella del equipo.' },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Error interno al actualizar la estrella.' },
      { status: 500 },
    );
  }
}
