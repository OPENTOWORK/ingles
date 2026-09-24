import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = new URL(req.url).searchParams.get('userId')?.trim();
    if (!userId) {
      return NextResponse.json({ error: 'Falta el usuario.' }, { status: 400 });
    }

    const { data, error } = await auth.db
      .from('formulario_respuestas')
      .select('id, formulario_id, formulario_titulo, respuestas, completado_en')
      .eq('user_id', userId)
      .order('completado_en', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ respuestas: data || [] });
  } catch (err) {
    console.error('[admin/users/formularios]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
