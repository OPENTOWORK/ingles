import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { CHANGE_LOG_TABLE, isMissingRelationError, settingLabel } from '@/lib/adminChangeLog';

const PAGE_SIZE = 20;

function madridOffsetMs(instant) {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    timeZoneName: 'shortOffset',
  }).format(instant);
  const match = label.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  if (!match) return 2 * 60 * 60 * 1000;
  const sign = match[1].startsWith('-') ? -1 : 1;
  const hours = Math.abs(Number(match[1]));
  const minutes = Number(match[2] || 0);
  return sign * ((hours * 60 + minutes) * 60 * 1000);
}

function parseMadridDay(value, end) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const utcGuess = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z`);
  if (Number.isNaN(utcGuess.getTime())) return undefined;
  return new Date(utcGuess.getTime() - madridOffsetMs(utcGuess)).toISOString();
}

function applyTypeFilter(query, type) {
  if (type === 'configuracion') return query.eq('tabla_afectada', 'config_parametros');
  if (type === 'rol') return query.eq('campo', 'rol');
  if (type === 'estado') return query.eq('campo', 'activo');
  if (type === 'plan') return query.eq('campo', 'plan_id');
  if (type === 'accesos') return query.eq('tabla_afectada', 'admin_accesos_web');
  return query;
}

function elementLabel(table) {
  if (table === 'config_parametros') return 'Configuración';
  if (table === 'admin_accesos_web') return 'Acceso web';
  return 'Usuario';
}

function presentAuditValue(field, value) {
  if (field === 'contrasena') return value ? 'Actualizada' : null;
  return value;
}

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(req.url);
    const type = String(url.searchParams.get('tipo') || 'todos');
    const page = Math.max(1, Number(url.searchParams.get('page') || 1) || 1);
    const from = parseMadridDay(url.searchParams.get('desde') || '', false);
    const to = parseMadridDay(url.searchParams.get('hasta') || '', true);
    if (from === undefined || to === undefined) {
      return NextResponse.json({ error: 'La fecha del filtro no es válida.' }, { status: 400 });
    }
    if (!['todos', 'configuracion', 'rol', 'estado', 'plan', 'accesos'].includes(type)) {
      return NextResponse.json({ error: 'Ese tipo de cambio no existe.' }, { status: 400 });
    }

    let query = auth.db
      .from(CHANGE_LOG_TABLE)
      .select('id, tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en', { count: 'exact' })
      .order('cambiado_en', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    query = applyTypeFilter(query, type);
    if (from) query = query.gte('cambiado_en', from);
    if (to) query = query.lte('cambiado_en', to);

    const { data, error, count } = await query;
    if (error) {
      if (isMissingRelationError(error)) {
        return NextResponse.json(
          { error: 'La tabla del historial no está disponible. No es una lista vacía.' },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: error.message || 'No se pudo leer el historial.' }, { status: 500 });
    }

    const actorIds = [...new Set((data || []).map((row) => row.cambiado_por).filter(Boolean))];
    const names = new Map();
    if (actorIds.length) {
      const { data: people, error: peopleError } = await auth.db
        .from('Usuarios_y_Perfil_users')
        .select('id, nombre, email')
        .in('id', actorIds);
      if (peopleError) {
        return NextResponse.json({ error: peopleError.message || 'No se pudo leer quién hizo el cambio.' }, { status: 500 });
      }
      for (const person of people || []) {
        names.set(person.id, person.nombre || person.email || 'Administrador');
      }
    }

    const rows = (data || []).map((row) => ({
      id: row.id,
      at: row.cambiado_en,
      actor: names.get(row.cambiado_por) || 'No identificado',
      element: elementLabel(row.tabla_afectada),
      field: row.tabla_afectada === 'config_parametros' ? settingLabel(row.campo) : row.campo,
      key: row.clave,
      before: presentAuditValue(row.campo, row.valor_anterior),
      after: presentAuditValue(row.campo, row.valor_nuevo),
    }));

    return NextResponse.json({
      ok: true,
      rows,
      page,
      pageSize: PAGE_SIZE,
      total: count || 0,
      empty: (count || 0) === 0,
    });
  } catch (error) {
    console.error('[admin/cambios GET]', error);
    return NextResponse.json({ error: 'No se pudo leer el historial.' }, { status: 500 });
  }
}
