import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Indica si hay sesión de recuperación en las cookies del servidor. */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return NextResponse.json({ hasSession: false });
    }
    return NextResponse.json({ hasSession: true });
  } catch {
    return NextResponse.json({ hasSession: false });
  }
}
