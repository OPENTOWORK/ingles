import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Cierra sesión en cookies del servidor (SSR), si existen. */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('[api/auth/logout]', error?.message || error);
  }

  return NextResponse.json({ ok: true });
}
