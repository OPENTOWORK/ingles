import { NextResponse } from 'next/server';

import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';

import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';

import { canManageStaffPhases } from '@/lib/staffTasksPermissions';

import { computePhaseProgress } from '@/lib/staffTaskHelpers';

import { loadProfilesByIds, probeStaffTasksTable } from '@/lib/staffTasksServer';

import { getRoleNameByUserId } from '@/utils/authRoles';

import { getStaffRoleLabel } from '@/utils/staffBuzon';



const FASES_TABLE = 'staff_fases';

const TASKS_TABLE = 'staff_tareas';



function getPhaseResponsableIds(row = {}) {

  if (row.responsables_todos) return [];

  if (Array.isArray(row.responsables_ids) && row.responsables_ids.length > 0) {

    return row.responsables_ids.filter(Boolean);

  }

  if (row.responsable_id) return [row.responsable_id];

  return [];

}



function mapPhase(row, tasks = []) {

  const progress = computePhaseProgress(row.id, tasks);

  const responsables_ids = getPhaseResponsableIds(row);

  return {

    id: row.id,

    nombre: row.nombre,

    descripcion: row.descripcion || '',

    estado: row.estado,

    orden: row.orden,

    fecha_inicio: row.fecha_inicio,

    fecha_limite: row.fecha_limite,

    responsable_id: row.responsable_id,

    responsable_rol: row.responsable_rol || '',

    responsables_ids,

    responsables_todos: row.responsables_todos === true,

    visible_para_todos: row.visible_para_todos !== false,

    created_at: row.created_at,

    updated_at: row.updated_at,

    taskCount: progress.total,

    completedCount: progress.completed,

    progressPct: progress.pct,

    progressLabel: progress.label,

  };

}



async function resolveResponsableRol(db, responsableId) {

  if (!responsableId) return null;

  const profiles = await loadProfilesByIds(db, [responsableId]);

  const profile = profiles[responsableId];

  if (!profile?.roleName) return null;

  return getStaffRoleLabel(profile.roleName);

}



function parseResponsablesIds(body) {

  const raw = body?.responsables_ids;

  if (!Array.isArray(raw)) return [];

  return [...new Set(raw.map(String).filter(Boolean))];

}



async function buildPhasePayload(db, body) {

  const responsables_todos = body?.responsables_todos === true;

  const responsables_ids = responsables_todos ? [] : parseResponsablesIds(body);

  const responsable_id = responsables_ids[0] || null;

  const responsable_rol = responsables_todos

    ? 'Todo el equipo'

    : responsables_ids.length === 1

      ? await resolveResponsableRol(db, responsable_id)

      : null;



  return {

    nombre: String(body?.nombre || '').trim(),

    descripcion: String(body?.descripcion || '').trim() || null,

    estado: body?.estado || 'no_iniciada',

    orden: Number(body?.orden) || 0,

    fecha_inicio: body?.fecha_inicio || null,

    fecha_limite: body?.fecha_limite || null,

    responsable_id,

    responsable_rol,

    responsables_ids,

    responsables_todos,

    visible_para_todos: true,

  };

}



export async function GET(req) {

  try {

    const auth = await authenticateStaffTasksRequest(req);

    if (auth.error) {

      return NextResponse.json({ error: auth.error }, { status: auth.status });

    }



    const probe = await auth.db.from(FASES_TABLE).select('id').limit(1);

    if (isSchemaNotReadyError(probe.error)) {

      return NextResponse.json({ phases: [], tablesReady: false });

    }



    const { data: phases, error } = await auth.db

      .from(FASES_TABLE)

      .select('*')

      .order('orden', { ascending: true });



    if (error) {

      if (isSchemaNotReadyError(error)) {

        return NextResponse.json({ phases: [], tablesReady: false });

      }

      return NextResponse.json({ error: error.message }, { status: 500 });

    }



    let tasks = [];

    const tasksProbe = await probeStaffTasksTable(auth.db);

    if (!isSchemaNotReadyError(tasksProbe.error)) {

      const { data } = await auth.db.from(TASKS_TABLE).select('id, fase_id, estado');

      tasks = data || [];

    }



    const responsableIds = [

      ...new Set((phases || []).flatMap((p) => getPhaseResponsableIds(p))),

    ];

    const profilesById = await loadProfilesByIds(auth.db, responsableIds);



    return NextResponse.json({

      phases: (phases || []).map((p) => {

        const mapped = mapPhase(p, tasks);

        const ids = mapped.responsables_ids;

        return {

          ...mapped,

          responsable: ids.length === 1 ? profilesById[ids[0]] : null,

          responsables: ids.map((id) => profilesById[id]).filter(Boolean),

        };

      }),

      tablesReady: true,

    });

  } catch (err) {

    console.error('[coordinator/phases GET]', err);

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



    const role = await getRoleNameByUserId(auth.user.id, auth.user.email);



    if (!canManageStaffPhases(role)) {

      return NextResponse.json(

        { error: 'Solo administración puede gestionar fases.' },

        { status: 403 },

      );

    }



    if (action === 'create') {

      const payload = await buildPhasePayload(auth.db, body);

      if (!payload.nombre) {

        return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 });

      }



      const { data, error } = await auth.db

        .from(FASES_TABLE)

        .insert({

          ...payload,

          created_by: auth.user.id,

          updated_at: new Date().toISOString(),

        })

        .select()

        .single();



      if (error) {

        return NextResponse.json(

          {

            error: isSchemaNotReadyError(error)

              ? 'Ejecuta scripts/staff_tasks_system.sql en Supabase.'

              : error.message,

          },

          { status: isSchemaNotReadyError(error) ? 503 : 500 },

        );

      }



      return NextResponse.json({ success: true, phase: mapPhase(data, []) });

    }



    const id = String(body?.id || '').trim();

    if (!id) return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });



    if (action === 'delete') {

      const { error } = await auth.db.from(FASES_TABLE).delete().eq('id', id);

      if (error) {

        return NextResponse.json({ error: error.message }, { status: 500 });

      }

      return NextResponse.json({ success: true });

    }



    if (action === 'update') {

      const payload = await buildPhasePayload(auth.db, body);

      if (!payload.nombre) {

        return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 });

      }



      const { data, error } = await auth.db

        .from(FASES_TABLE)

        .update({

          ...payload,

          updated_at: new Date().toISOString(),

        })

        .eq('id', id)

        .select()

        .single();



      if (error) {

        return NextResponse.json({ error: error.message }, { status: 500 });

      }



      return NextResponse.json({ success: true, phase: mapPhase(data, []) });

    }



    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });

  } catch (err) {

    console.error('[coordinator/phases POST]', err);

    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });

  }

}


