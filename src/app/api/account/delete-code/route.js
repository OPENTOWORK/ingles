import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { sendAccountDeletionCodeEmail } from '@/lib/sendAccountDeletionCode';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_USER = 3;

/** @type {Map<string, { n: number, reset: number }>} */
const buckets = new Map();

function tryConsume(userId) {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.reset) buckets.delete(key);
  }
  let bucket = buckets.get(userId);
  if (!bucket || now > bucket.reset) {
    bucket = { n: 0, reset: now + WINDOW_MS };
    buckets.set(userId, bucket);
  }
  if (bucket.n >= MAX_PER_USER) return false;
  bucket.n += 1;
  return true;
}

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (!tryConsume(auth.user.id)) {
      return NextResponse.json(
        { error: 'Too many codes sent. Wait a few minutes and try again.' },
        { status: 429 },
      );
    }

    const url = getSupabaseUrl();
    const serviceKey = getSupabaseServiceRoleKey();
    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: 'Account deletion email is not configured.' },
        { status: 503 },
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const nombre =
      auth.user.user_metadata?.nombre ||
      auth.user.user_metadata?.name ||
      auth.user.user_metadata?.full_name ||
      '';

    const result = await sendAccountDeletionCodeEmail(admin, {
      email: auth.user.email,
      nombre,
    });

    if (!result.sent) {
      console.error('[account/delete-code]', result.error);
      return NextResponse.json(
        { error: 'Could not send the confirmation email. Try again in a few minutes.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      otpType: result.otpType || 'magiclink',
    });
  } catch (err) {
    console.error('[account/delete-code]', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
