import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  authenticateTeacherRequest,
  getStudentRoleId,
  isSchemaNotReadyError,
} from '@/lib/teacherAccess';
import { isValidEmail, sendTransactionalEmail } from '@/lib/sendTransactionalEmail';
import { formatSessionDuration, isUserOnline } from '@/lib/userActivity';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { normalizeRoleName } from '@/utils/authRoles';

async function sendWelcomeEmail({ email, name, temporaryPassword }) {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
  const subject = 'Tu cuenta en Dralo English ha sido creada';
  const text = [
    `Hola${name ? ` ${name}` : ''},`,
    '',
    'Tu profesor ha creado tu cuenta en Dralo English.',
    `Email: ${email}`,
    `Contraseña temporal: ${temporaryPassword}`,
    '',
    'Cambia la contraseña en tu perfil tras iniciar sesión.',
    loginUrl ? `Acceso: ${loginUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return sendTransactionalEmail({ to: email, subject, text });
}

export async function GET(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { db, studentIds, isAdmin, professorId } = auth;

    const tablesProbe = await db.from('profesor_alumnos').select('id').limit(1);
    const tablesReady = !isSchemaNotReadyError(tablesProbe.error);

    if (!studentIds.length) {
      return NextResponse.json({ students: [], isAdmin, tablesReady });
    }

    const { data: profiles, error: profError } = await db
      .from('Usuarios_y_Perfil_users')
      .select('id, email, nombre, rol_id, creado_en, activo')
      .in('id', studentIds)
      .order('nombre', { ascending: true });

    if (profError) {
      return NextResponse.json({ error: profError.message }, { status: 500 });
    }

    const [presenceRes, sessionsRes, gradesRes, authSessionsRes] = await Promise.all([
      db.from('usuario_presencia').select('user_id, last_seen_at, total_session_seconds').in('user_id', studentIds),
      db
        .from('usuario_sesiones_app')
        .select('user_id, started_at, duration_seconds')
        .in('user_id', studentIds)
        .order('started_at', { ascending: false })
        .limit(5000),
      db
        .from('profesor_calificaciones')
        .select('alumno_id, nota')
        .eq('profesor_id', professorId)
        .in('alumno_id', studentIds),
      db
        .from('auth_sesiones')
        .select('user_id, creado_en')
        .in('user_id', studentIds)
        .order('creado_en', { ascending: false })
        .limit(5000),
    ]);

    const presenceByUser = {};
    for (const row of presenceRes.data || []) {
      presenceByUser[row.user_id] = row;
    }

    const sessionCountByUser = {};
    const lastSessionByUser = {};
    for (const row of sessionsRes.data || []) {
      sessionCountByUser[row.user_id] = (sessionCountByUser[row.user_id] || 0) + 1;
      if (!lastSessionByUser[row.user_id]) {
        lastSessionByUser[row.user_id] = row.started_at;
      }
    }

    const loginCountByUser = {};
    for (const row of authSessionsRes.data || []) {
      if (!row.user_id) continue;
      loginCountByUser[row.user_id] = (loginCountByUser[row.user_id] || 0) + 1;
    }

    const gradeAvgByUser = {};
    for (const row of gradesRes.data || []) {
      if (!gradeAvgByUser[row.alumno_id]) {
        gradeAvgByUser[row.alumno_id] = { sum: 0, count: 0 };
      }
      gradeAvgByUser[row.alumno_id].sum += Number(row.nota) || 0;
      gradeAvgByUser[row.alumno_id].count += 1;
    }

    const students = (profiles || []).map((p) => {
      const pres = presenceByUser[p.id];
      const g = gradeAvgByUser[p.id];
      return {
        ...p,
        online: pres ? isUserOnline(pres.last_seen_at) : false,
        lastSeenAt: pres?.last_seen_at || null,
        totalSessionSeconds: Number(pres?.total_session_seconds) || 0,
        totalSessionLabel: formatSessionDuration(pres?.total_session_seconds),
        sessionCount: sessionCountByUser[p.id] || 0,
        loginCount: loginCountByUser[p.id] || 0,
        lastSessionAt: lastSessionByUser[p.id] || null,
        gradeAverage: g && g.count ? Math.round((g.sum / g.count) * 10) / 10 : null,
      };
    });

    return NextResponse.json({ students, isAdmin, tablesReady });
  } catch (err) {
    console.error('[teacher/students GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const action = String(body?.action || 'assign').trim();
    const { db, professorId, isAdmin } = auth;

    if (action === 'remove') {
      const alumnoId = String(body?.alumnoId || '').trim();
      if (!alumnoId) {
        return NextResponse.json({ error: 'alumnoId obligatorio.' }, { status: 400 });
      }
      const { error } = await db
        .from('profesor_alumnos')
        .delete()
        .eq('profesor_id', professorId)
        .eq('alumno_id', alumnoId);
      if (error) {
        return NextResponse.json(
          {
            error: isSchemaNotReadyError(error)
              ? 'Ejecuta scripts/teacher_panel_tables.sql en Supabase.'
              : error.message,
          },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'assign') {
      const email = String(body?.email || '').trim().toLowerCase();
      const alumnoId = String(body?.alumnoId || '').trim();
      let targetId = alumnoId;

      if (!targetId && email) {
        const { data: row } = await db
          .from('Usuarios_y_Perfil_users')
          .select('id, rol_id, Usuarios_y_Perfil_roles(nombre)')
          .eq('email', email)
          .maybeSingle();
        if (!row?.id) {
          return NextResponse.json({ error: 'No existe un usuario con ese email.' }, { status: 404 });
        }
        const roleName = normalizeRoleName(
          Array.isArray(row.Usuarios_y_Perfil_roles)
            ? row.Usuarios_y_Perfil_roles[0]?.nombre
            : row.Usuarios_y_Perfil_roles?.nombre,
        );
        if (roleName !== 'student' && roleName !== 'alumno') {
          return NextResponse.json({ error: 'Solo puedes asignar alumnos.' }, { status: 400 });
        }
        targetId = row.id;
      }

      if (!targetId) {
        return NextResponse.json({ error: 'Email o alumnoId obligatorio.' }, { status: 400 });
      }

      const { error } = await db.from('profesor_alumnos').upsert(
        { profesor_id: professorId, alumno_id: targetId },
        { onConflict: 'profesor_id,alumno_id' },
      );
      if (error) {
        return NextResponse.json(
          {
            error: isSchemaNotReadyError(error)
              ? 'Ejecuta scripts/teacher_panel_tables.sql en Supabase.'
              : error.message,
          },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }
      return NextResponse.json({ success: true, alumnoId: targetId });
    }

    if (action === 'create') {
      const email = String(body?.email || '').trim().toLowerCase();
      const name = String(body?.name || '').trim();
      const temporaryPassword =
        String(body?.temporaryPassword || '').trim() ||
        `Tmp-${Math.random().toString(36).slice(-8)}A1`;

      if (!isValidEmail(email) || temporaryPassword.length < 8) {
        return NextResponse.json(
          { error: 'Email válido y contraseña temporal (mín. 8 caracteres) obligatorios.' },
          { status: 400 },
        );
      }

      const studentRoleId = await getStudentRoleId(db);
      if (!studentRoleId) {
        return NextResponse.json({ error: 'No se encontró el rol de alumno.' }, { status: 500 });
      }

      const serviceKey = getSupabaseServiceRoleKey()?.trim();
      if (!serviceKey) {
        return NextResponse.json(
          { error: 'Crear alumnos requiere SUPABASE_SERVICE_ROLE_KEY en el servidor.' },
          { status: 503 },
        );
      }

      const adminAuth = createClient(getSupabaseUrl(), serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: created, error: createError } = await adminAuth.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: { name: name || email.split('@')[0] },
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      const userId = created.user.id;
      await adminAuth.from('Usuarios_y_Perfil_users').upsert({
        id: userId,
        email,
        nombre: name || null,
        rol_id: studentRoleId,
        activo: true,
      });

      await db.from('profesor_alumnos').upsert(
        { profesor_id: professorId, alumno_id: userId },
        { onConflict: 'profesor_id,alumno_id' },
      );

      const mail = await sendWelcomeEmail({ email, name, temporaryPassword });
      return NextResponse.json({
        success: true,
        userId,
        email,
        emailSent: mail.ok,
        isAdmin,
      });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[teacher/students POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
