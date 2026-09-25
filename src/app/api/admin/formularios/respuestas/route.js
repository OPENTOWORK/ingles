import { NextResponse } from 'next/server';
import { authenticatePlanObjetivosAdminRequest } from '@/lib/adminAccess';

export async function GET(req) {
  try {
    const auth = await authenticatePlanObjetivosAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.db
      .from('formulario_respuestas')
      .select('id, formulario_id, formulario_titulo, user_id, respuestas, completado_en')
      .order('completado_en', { ascending: false });
    if (error) throw error;

    const rows = data || [];
    const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];
    let usersById = new Map();
    if (userIds.length) {
      const { data: users, error: usersError } = await auth.db
        .from('Usuarios_y_Perfil_users')
        .select('id, email, nombre')
        .in('id', userIds);
      if (usersError) throw usersError;
      usersById = new Map((users || []).map((user) => [user.id, user]));
    }

    return NextResponse.json({
      respuestas: rows.map((row) => {
        const user = usersById.get(row.user_id);
        return {
          id: row.id,
          formulario_id: row.formulario_id,
          formulario_titulo: row.formulario_titulo,
          user_id: row.user_id,
          nombre: user?.nombre || null,
          email: user?.email || null,
          completado_en: row.completado_en,
          respuestas: Array.isArray(row.respuestas) ? row.respuestas : [],
        };
      }),
    });
  } catch (err) {
    console.error('[admin/formularios/respuestas]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
