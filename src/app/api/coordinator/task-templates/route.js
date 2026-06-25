import { NextResponse } from 'next/server';
import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';

const TABLE = 'staff_tarea_plantillas';

function mapTemplate(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    titulo: row.titulo,
    descripcion: row.descripcion || '',
    enlace: row.enlace || '',
    prioridad_default: row.prioridad_default || 'media',
    asignado_rol_default: row.asignado_rol_default || '',
    fase_id: row.fase_id || '',
    checklist_default: row.checklist_default || [],
    notas_default: row.notas_default || '',
    activa: row.activa !== false,
    creado_por: row.creado_por,
    creado_en: row.creado_en,
    actualizado_en: row.actualizado_en,
  };
}

export async function GET(req) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const probe = await auth.db.from(TABLE).select('id').limit(1);
    if (isSchemaNotReadyError(probe.error)) {
      return NextResponse.json({ templates: [], tablesReady: false });
    }

    const { data, error } = await auth.db
      .from(TABLE)
      .select('*')
      .eq('activa', true)
      .order('nombre', { ascending: true });

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ templates: [], tablesReady: false });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      templates: (data || []).map(mapTemplate),
      tablesReady: true,
    });
  } catch (err) {
    console.error('[coordinator/task-templates GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const action = String(body?.action || 'create').trim();

    const baseFields = {
      nombre: String(body?.nombre || '').trim(),
      titulo: String(body?.titulo || '').trim(),
      descripcion: String(body?.descripcion || '').trim() || null,
      enlace: String(body?.enlace || '').trim() || null,
      prioridad_default: body?.prioridad_default || 'media',
      asignado_rol_default: String(body?.asignado_rol_default || '').trim() || null,
      fase_id: body?.fase_id || null,
      notas_default: String(body?.notas_default || '').trim() || null,
      checklist_default: Array.isArray(body?.checklist_default) ? body.checklist_default : [],
      activa: body?.activa !== false,
      actualizado_en: new Date().toISOString(),
    };

    if (action === 'create') {
      if (!baseFields.nombre) {
        return NextResponse.json({ error: 'El nombre de la plantilla es obligatorio.' }, { status: 400 });
      }
      if (!baseFields.titulo) {
        return NextResponse.json({ error: 'El título es obligatorio.' }, { status: 400 });
      }

      const { data, error } = await auth.db
        .from(TABLE)
        .insert({ ...baseFields, creado_por: auth.user.id })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: isSchemaNotReadyError(error) ? 'Migración de plantillas pendiente.' : error.message },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }

      return NextResponse.json({ success: true, template: mapTemplate(data) });
    }

    const id = String(body?.id || '').trim();
    if (!id) return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });

    if (action === 'delete') {
      const { error } = await auth.db.from(TABLE).delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      if (!baseFields.nombre || !baseFields.titulo) {
        return NextResponse.json({ error: 'Nombre y título son obligatorios.' }, { status: 400 });
      }
      const { data, error } = await auth.db
        .from(TABLE)
        .update(baseFields)
        .eq('id', id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, template: mapTemplate(data) });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[coordinator/task-templates POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
