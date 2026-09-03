import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFoundingMemberSlotAvailability } from '@/lib/foundingMemberPlus';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = getSupabaseUrl();
    const serviceKey = getSupabaseServiceRoleKey()?.trim();

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Configuración no disponible.' },
        { status: 503 },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const availability = await getFoundingMemberSlotAvailability(adminClient);

    return NextResponse.json(availability, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error('api/founding-member/slots:', err);
    return NextResponse.json(
      { error: 'No se pudo cargar la disponibilidad.' },
      { status: 500 },
    );
  }
}
