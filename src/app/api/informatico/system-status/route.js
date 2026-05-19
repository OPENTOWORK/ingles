import { NextResponse } from 'next/server';
import { authenticateItRequest } from '@/lib/itAccess';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { isResendDomainReady } from '@/lib/resendDomainReady';
import { isSupportSmtpReady } from '@/lib/supportSmtpCredentials';
import { isSupabaseServiceRoleReady } from '@/lib/supabaseServiceRoleCredentials';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export async function GET(req) {
  try {
    const auth = await authenticateItRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const host = req.headers.get('host') || '';
    const isLocal =
      process.env.NODE_ENV !== 'production' &&
      (host.includes('localhost') || host.includes('127.0.0.1'));

    const checks = [
      {
        id: 'supabase_url',
        label: 'Supabase URL',
        ok: Boolean(getSupabaseUrl()),
        detail: getSupabaseUrl(),
      },
      {
        id: 'supabase_anon',
        label: 'Clave anon (pública)',
        ok: Boolean(getSupabaseAnonKey()),
        detail: 'Configurada',
      },
      {
        id: 'service_role',
        label: 'Service role (servidor)',
        ok: isSupabaseServiceRoleReady(),
        detail: isSupabaseServiceRoleReady()
          ? 'Lista para APIs de administración'
          : 'Falta en .env.local o secrets/',
      },
      {
        id: 'smtp',
        label: 'Correo SMTP',
        ok: isSupportSmtpReady(),
        detail: isSupportSmtpReady() ? 'SMTP listo' : 'Configura en /contacto/configurar-correo',
      },
      {
        id: 'resend',
        label: 'Resend (alternativa)',
        ok: Boolean(process.env.RESEND_API_KEY?.trim()),
        detail: process.env.RESEND_API_KEY?.trim() ? 'API key presente' : 'No configurado',
      },
      {
        id: 'database_url',
        label: 'Prisma / DATABASE_URL',
        ok: Boolean(process.env.DATABASE_URL?.trim()),
        detail: process.env.DATABASE_URL?.trim() ? 'Speaking module' : 'Opcional',
      },
      {
        id: 'app_url',
        label: 'URL pública de la app',
        ok: Boolean(
          process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim(),
        ),
        detail:
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          'No definida',
      },
    ];

    const tableProbes = await Promise.all(
      ['profesor_alumnos', 'profesor_tareas', 'usuario_presencia', 'usuario_sesiones_app'].map(
        async (table) => {
          const { error } = await auth.db.from(table).select('id').limit(1);
          return {
            id: `table_${table}`,
            label: `Tabla ${table}`,
            ok: !error,
            detail: error
              ? isSchemaNotReadyError(error)
                ? 'Falta migración o recarga schema'
                : error.message
              : 'OK',
          };
        },
      ),
    );

    let resendReady = false;
    try {
      resendReady = await isResendDomainReady();
    } catch {
      resendReady = false;
    }

    const resendCheck = checks.find((c) => c.id === 'resend');
    if (resendCheck && process.env.RESEND_API_KEY?.trim()) {
      resendCheck.ok = resendReady;
      resendCheck.detail = resendReady ? 'Dominio verificado' : 'Dominio pendiente en Resend';
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV || 'development',
      isLocal,
      checks: [...checks, ...tableProbes],
    });
  } catch (err) {
    console.error('[informatico/system-status]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
