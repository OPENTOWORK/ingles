import { NextResponse } from 'next/server';
import { requireSupportAgent } from '@/lib/supportAuth';

const TABLE = 'soporte_correos_automaticos';

function isMissingTableError(error) {
  const msg = String(error?.message || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    trigger_event: row.trigger_event,
    trigger_reason: row.trigger_reason || '',
    asunto: row.asunto,
    cuerpo: row.cuerpo,
    activo: row.activo !== false,
    delay_minutos: Number(row.delay_minutos) || 0,
    es_sistema: Boolean(row.es_sistema),
    creado_en: row.creado_en,
    actualizado_en: row.actualizado_en,
  };
}

export async function PATCH(req, { params }) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const id = params?.id;
  if (!id || String(id).startsWith('default-')) {
    return NextResponse.json(
      { error: 'Ejecuta la migración SQL antes de editar plantillas del sistema.' },
      { status: 400 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const patch = { actualizado_en: new Date().toISOString() };

  if (body.nombre !== undefined) patch.nombre = String(body.nombre).trim();
  if (body.trigger_event !== undefined) patch.trigger_event = String(body.trigger_event).trim();
  if (body.trigger_reason !== undefined) patch.trigger_reason = String(body.trigger_reason).trim();
  if (body.asunto !== undefined) patch.asunto = String(body.asunto).trim();
  if (body.cuerpo !== undefined) patch.cuerpo = String(body.cuerpo).trim();
  if (body.activo !== undefined) patch.activo = Boolean(body.activo);
  if (body.delay_minutos !== undefined) {
    patch.delay_minutos = Math.max(0, Number(body.delay_minutos) || 0);
  }

  const { data, error } = await auth.db
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ error: 'Tabla no configurada en Supabase.' }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: mapRow(data) });
}

export async function DELETE(req, { params }) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const id = params?.id;
  if (!id || String(id).startsWith('default-')) {
    return NextResponse.json(
      { error: 'No se pueden eliminar plantillas por defecto sin migración SQL.' },
      { status: 400 },
    );
  }

  const { data: existing } = await auth.db
    .from(TABLE)
    .select('es_sistema')
    .eq('id', id)
    .maybeSingle();

  if (existing?.es_sistema) {
    return NextResponse.json(
      { error: 'Las plantillas del sistema no se pueden eliminar. Puedes desactivarlas.' },
      { status: 400 },
    );
  }

  const { error } = await auth.db.from(TABLE).delete().eq('id', id);

  if (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ error: 'Tabla no configurada en Supabase.' }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
