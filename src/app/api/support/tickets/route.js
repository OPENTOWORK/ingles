import { NextResponse } from 'next/server';
import { requireSupportAgent } from '@/lib/supportAuth';
import { parseTicketMeta } from '@/lib/supportTicketParse';

export async function GET(req) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado');

  let query = auth.db
    .from('contacto_soporte')
    .select(
      'id, user_id, asunto, descripcion, estado, creado_en, cerrado_en, ultimo_mensaje_en, tipo_problema, prioridad, resuelto, solicitante_email, solicitante_nombre',
    )
    .order('creado_en', { ascending: false })
    .limit(100);

  if (estado && estado !== 'todos') {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[support/tickets GET]', error);
    return NextResponse.json({ error: 'No se pudieron cargar los tickets.' }, { status: 500 });
  }

  const tickets = (data || []).map((row) => {
    const meta = parseTicketMeta(row);
    return {
      ...row,
      solicitante_email: row.solicitante_email || meta.email,
      solicitante_nombre: row.solicitante_nombre || meta.name,
      mensaje_inicial: meta.body,
    };
  });

  const pendingCount = tickets.filter(
    (t) => t.estado === 'Sin responder' || t.estado === 'Abierto',
  ).length;

  return NextResponse.json({ tickets, pendingCount });
}
