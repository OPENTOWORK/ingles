import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isDraloAiLockedForRole } from '@/config/appNavMenu';
import { isProTierPlanSlug } from '@/data/financialPlanConfig';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { resolveUserPlanSlug, shouldApplyPlanUsageLimits } from '@/lib/planAccess';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { getUserRoleNameServer } from '@/lib/userRoleServer';

function getRoleLookupDb(accessToken) {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Whether the role may use Dralo AI pages and coach APIs. Students still need a Premium plan. */
export function canAccessDraloAiForRole(userRole) {
  return !isDraloAiLockedForRole(userRole);
}

/** Dralo AI en la tabla de precios: solo el plan Premium (y Friendly Premium). */
export function studentPlanIncludesDraloAi(planSlug) {
  return isProTierPlanSlug(planSlug);
}

/** Resolve session, role and plan access for Dralo AI routes and APIs. */
export async function getDraloAiAccessFromRequest(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return {
      allowed: false,
      reason: 'guest',
      user: null,
      roleName: null,
      planSlug: null,
      accessToken: null,
    };
  }

  const db = getRoleLookupDb(auth.accessToken);
  const roleName = await getUserRoleNameServer(auth.user.id, db);
  if (!canAccessDraloAiForRole(roleName)) {
    return {
      allowed: false,
      reason: 'locked_role',
      user: auth.user,
      roleName,
      planSlug: null,
      accessToken: auth.accessToken ?? null,
    };
  }

  const applyLimits = await shouldApplyPlanUsageLimits(auth.user.id, auth.user.email ?? '');
  if (!applyLimits) {
    return {
      allowed: true,
      reason: 'allowed',
      user: auth.user,
      roleName,
      planSlug: null,
      accessToken: auth.accessToken ?? null,
    };
  }

  const planSlug = await resolveUserPlanSlug(auth.user.id, auth.user.user_metadata ?? null);
  if (!studentPlanIncludesDraloAi(planSlug)) {
    return {
      allowed: false,
      reason: 'premium_required',
      user: auth.user,
      roleName,
      planSlug,
      accessToken: auth.accessToken ?? null,
    };
  }

  return {
    allowed: true,
    reason: 'allowed',
    user: auth.user,
    roleName,
    planSlug,
    accessToken: auth.accessToken ?? null,
  };
}

/** 401/403 for a Dralo AI API when the caller cannot use the tools. */
export function draloAiDeniedResponse(access) {
  if (access?.reason === 'premium_required') {
    return NextResponse.json(
      { error: 'Dralo AI es un servicio Premium.', code: 'PREMIUM_REQUIRED' },
      { status: 403 },
    );
  }
  if (access?.reason === 'guest') {
    return NextResponse.json(
      { error: 'Inicia sesión para usar Dralo AI.', code: 'AUTH_REQUIRED' },
      { status: 401 },
    );
  }
  return NextResponse.json(
    { error: 'Dralo AI no está disponible para esta cuenta.', code: 'FEATURE_NOT_AVAILABLE' },
    { status: 403 },
  );
}
