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

    const { data: updatedRow, error } = await db
      .from('Usuarios_y_Perfil_users')
      .update({ destacado_equipo: starred })
      .eq('id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message || 'No se pudo actualizar la estrella del equipo.' },
        { status: 500 },
      );
    }

    if (!updatedRow) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, destacado_equipo: starred });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Error interno al actualizar la estrella.' },
      { status: 500 },
    );
  }
}
