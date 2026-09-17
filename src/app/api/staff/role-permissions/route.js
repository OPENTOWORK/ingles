import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { loadStaffRolePermissionOverrides } from '@/lib/staffRolePermissionsServer';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export async function GET(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const supabaseAnonKey = getSupabaseAnonKey();
  const token = auth.accessToken || '';

  const db = serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : createClient(supabaseUrl, supabaseAnonKey, {
        global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
        auth: { autoRefreshToken: false, persistSession: false },
      });

  try {
    const overrides = await loadStaffRolePermissionOverrides(db);
    return NextResponse.json({ overrides });
  } catch (err) {
    console.error('[api/staff/role-permissions] GET', err);
    return NextResponse.json({ overrides: {} });
  }
}
