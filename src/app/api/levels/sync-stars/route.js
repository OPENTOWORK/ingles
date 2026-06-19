import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { backfillLevelsStarsForUser } from '@/utils/syncLevelsStars';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

/** Backfill Levels_stars from existing levels_puntuaciones for the signed-in user. */
export async function POST(req) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Servidor no configurado (falta SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 503 },
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user?.id) {
      return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const result = await backfillLevelsStarsForUser(admin, authData.user.id);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('api/levels/sync-stars:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
