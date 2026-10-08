import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';

export const dynamic = 'force-dynamic';

function whoLabel(name, email) {
  const person = String(name || '').trim();
  const mail = String(email || '').trim();
  if (person && mail && person.toLowerCase() !== mail.toLowerCase()) {
    return `${person} · ${mail}`;
  }
  return mail || person || 'No identificado';
}

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { db } = auth;
    const [failureRes, failureCountRes, successRes] = await Promise.all([
      db
        .from('auth_sesiones')
        .select('user_id, email, motivo, creado_en')
        .eq('tipo_evento', 'login')
        .eq('exitoso', false)
        .order('creado_en', { ascending: false })
        .limit(200),
      db
        .from('auth_sesiones')
        .select('id', { count: 'exact', head: true })
        .eq('tipo_evento', 'login')
        .eq('exitoso', false),
      db.rpc('admin_login_audit_success_count'),
    ]);

    if (failureRes.error) {
      return NextResponse.json({ error: failureRes.error.message }, { status: 500 });
    }
    if (successRes.error) {
      console.error('[admin/login-attempts] success count', successRes.error.message);
    }

    const failures = failureRes.data || [];
    const userIds = [...new Set(failures.map((row) => row.user_id).filter(Boolean))];
    const nameById = new Map();
    if (userIds.length) {
      const { data: people } = await db
        .from('Usuarios_y_Perfil_users')
        .select('id, nombre, email')
        .in('id', userIds);
      for (const person of people || []) {
        nameById.set(person.id, person);
      }
    }

    const failureCount = failureCountRes.count ?? failures.length;
    const successCount = successRes.error ? null : Number(successRes.data);
    const knownSuccesses = Number.isFinite(successCount) ? successCount : null;
    const successRate =
      failureCount === 0
        ? 100
        : knownSuccesses == null
          ? null
          : Math.round((knownSuccesses / (knownSuccesses + failureCount)) * 100);

    return NextResponse.json({
      successRate,
      successCount: knownSuccesses ?? 0,
      failureCount,
      failures: failures.map((row) => {
        const person = row.user_id ? nameById.get(row.user_id) : null;
        const email = row.email || person?.email || '';
        return {
          at: row.creado_en,
          email,
          who: whoLabel(person?.nombre, email),
          reason: row.motivo || 'No se pudo iniciar sesión',
          ok: false,
        };
      }),
    });
  } catch (error) {
    console.error('[admin/login-attempts]', error);
    return NextResponse.json({ error: 'No se pudieron cargar los accesos.' }, { status: 500 });
  }
}
