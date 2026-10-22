import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { normalizeTrainingExperienceLevels } from '@/lib/trainingExperience';
import { readTrainingExperience, saveTrainingExperience } from '@/lib/trainingExperienceServer';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

async function userIdFrom(req) {
  const auth = await getSupabaseUserFromRequest(req);
  return auth?.user?.id || null;
}

function authRequired() {
  return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401, headers: noStore });
}

function experienceError(error) {
  console.warn('[training/experience]', error?.code || '', error?.message || error);
  return NextResponse.json({ error: 'EXPERIENCE_UNAVAILABLE' }, { status: 503, headers: noStore });
}

/** Training XP shown on the profile. */
export async function GET(req) {
  const userId = await userIdFrom(req);
  if (!userId) return authRequired();

  try {
    return NextResponse.json(await readTrainingExperience(userId), { headers: noStore });
  } catch (error) {
    return experienceError(error);
  }
}

/** Saves the path stars kept in the browser (`{ levels: [...] }`) and returns the new XP. */
export async function POST(req) {
  const userId = await userIdFrom(req);
  if (!userId) return authRequired();

  const body = await req.json().catch(() => ({}));
  if (!Array.isArray(body?.levels)) {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400, headers: noStore });
  }

  try {
    const result = await saveTrainingExperience(userId, normalizeTrainingExperienceLevels(body.levels));
    return NextResponse.json(result, { headers: noStore });
  } catch (error) {
    return experienceError(error);
  }
}
