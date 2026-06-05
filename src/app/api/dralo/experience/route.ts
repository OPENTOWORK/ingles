import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { getServiceDb, isSchemaNotReadyError } from '@/lib/teacherAccess';
import { addDraloXp, getDraloUserXp } from '@/lib/draloExperience';

type AuthError = { error: string; status: 401 };
type AuthOk = { user: User; token: string; db: SupabaseClient };

async function getAuthedContext(request: Request): Promise<AuthError | AuthOk> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) return { error: 'Unauthorized', status: 401 };

  const supabaseUrl = getSupabaseUrl() || '';
  const supabaseAnonKey = getSupabaseAnonKey() || '';
  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return {
    user: data.user,
    token,
    db: getServiceDb(token),
  };
}

function schemaNotReadyResponse() {
  return NextResponse.json(
    {
      totalXp: 0,
      hasRecord: false,
      levelInfo: null,
      tablesReady: false,
      error: 'Las tablas Dralo IA Experience aún no están disponibles.',
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthedContext(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;
    const result = await getDraloUserXp(db, user.id);

    return NextResponse.json({
      totalXp: result.totalXp,
      hasRecord: result.hasRecord,
      levelInfo: result.levelInfo,
      tablesReady: true,
    });
  } catch (error) {
    if (isSchemaNotReadyError(error)) {
      return schemaNotReadyResponse();
    }
    console.error('[dralo/experience GET]', error);
    const message = error instanceof Error ? error.message : 'Error al cargar experiencia.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthedContext(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body: { amount?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
    }

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'amount debe ser un número positivo.' }, { status: 400 });
    }

    const { user, db } = auth;
    const result = await addDraloXp(db, user.id, amount);

    return NextResponse.json({
      totalXp: result.totalXp,
      hasRecord: result.hasRecord,
      levelInfo: result.levelInfo,
      tablesReady: true,
    });
  } catch (error) {
    if (isSchemaNotReadyError(error)) {
      return schemaNotReadyResponse();
    }
    console.error('[dralo/experience POST]', error);
    const message = error instanceof Error ? error.message : 'Error al sumar XP.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
