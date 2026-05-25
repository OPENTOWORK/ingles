import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { mapTeacherForStudent, teacherIsBookable, TUTOR_PROFILE_COLUMNS } from '@/lib/tutoringCalendly';
import { normalizeRoleName } from '@/utils/authRoles';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const client = createClient(url, anon);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

function isTeacherRoleName(roleName) {
  const normalized = normalizeRoleName(roleName);
  return normalized === 'teacher' || normalized === 'profesor';
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ teachers: [], assignedTeacherIds: [], tablesReady: false });
    }

    const [profilesRes, assignedRes, rolesRes] = await Promise.all([
      admin
        .from('profesor_calendly')
        .select(TUTOR_PROFILE_COLUMNS)
        .eq('activo', true)
        .order('actualizado_en', { ascending: false }),
      admin.from('profesor_alumnos').select('profesor_id').eq('alumno_id', user.id),
      admin.from('Usuarios_y_Perfil_roles').select('id, nombre'),
    ]);

    if (profilesRes.error) {
      if (isSchemaNotReadyError(profilesRes.error)) {
        return NextResponse.json({ teachers: [], assignedTeacherIds: [], tablesReady: false });
      }
      return NextResponse.json({ error: profilesRes.error.message }, { status: 500 });
    }

    const teacherRoleIds = new Set(
      (rolesRes.data || [])
        .filter((row) => isTeacherRoleName(row.nombre))
        .map((row) => row.id),
    );

    const assignedTeacherIds = (assignedRes.data || []).map((row) => row.profesor_id);
    const assignedSet = new Set(assignedTeacherIds);
    const profileRows = (profilesRes.data || []).filter(teacherIsBookable);

    if (!profileRows.length) {
      return NextResponse.json({ teachers: [], assignedTeacherIds, tablesReady: true });
    }

    const teacherIds = profileRows.map((row) => row.profesor_id);
    const { data: users, error: usersError } = await admin
      .from('Usuarios_y_Perfil_users')
      .select('id, nombre, email, rol_id, activo')
      .in('id', teacherIds)
      .eq('activo', true);

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const usersById = Object.fromEntries((users || []).map((row) => [row.id, row]));

    const teachers = profileRows
      .map((profile) => {
        const meta = usersById[profile.profesor_id];
        if (!meta) return null;
        if (teacherRoleIds.size && !teacherRoleIds.has(meta.rol_id)) return null;
        return mapTeacherForStudent(profile, meta, assignedSet.has(profile.profesor_id));
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.isAssigned !== b.isAssigned) return a.isAssigned ? -1 : 1;
        return String(a.name).localeCompare(String(b.name), 'es');
      });

    return NextResponse.json({ teachers, assignedTeacherIds, tablesReady: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error al listar profesores' },
      { status: 500 },
    );
  }
}
