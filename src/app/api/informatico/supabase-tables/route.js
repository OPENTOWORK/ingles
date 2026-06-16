import { NextResponse } from 'next/server';
import { authenticateItRequest } from '@/lib/itAccess';
import { listSupabaseTables } from '@/lib/supabaseListTables';

export async function GET(req) {
  try {
    const auth = await authenticateItRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const includeCounts = searchParams.get('counts') !== '0';

    const { tables, source } = await listSupabaseTables(auth.db, { includeCounts });

    return NextResponse.json({
      tables,
      total: tables.length,
      source,
      projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    });
  } catch (err) {
    console.error('[informatico/supabase-tables]', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudieron listar las tablas.' },
      { status: 500 },
    );
  }
}
