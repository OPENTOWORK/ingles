import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CONFIG_TABLE } from '@/lib/adminChangeLog';
import { SITE_THEME_SETTING_KEY, resolveSiteTheme } from '@/lib/siteTheme';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const NO_STORE = {
  'Cache-Control': 'no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

/** Público: el tema que ven todos los visitantes. La tabla solo la leen administradores. */
export async function GET() {
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (!serviceKey) {
    return NextResponse.json({ error: 'Configuración no disponible.' }, { status: 503, headers: NO_STORE });
  }

  const db = createClient(getSupabaseUrl(), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db
    .from(CONFIG_TABLE)
    .select('valor')
    .eq('clave', SITE_THEME_SETTING_KEY)
    .maybeSingle();

  if (error) {
    console.error('[api/site-theme GET]', error);
    return NextResponse.json({ error: 'No se pudo leer el tema.' }, { status: 503, headers: NO_STORE });
  }
  return NextResponse.json(resolveSiteTheme(data?.valor), { headers: NO_STORE });
}
