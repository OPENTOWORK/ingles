import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  fetchUserPracticeErrors,
  summarizePracticeErrors,
} from '@/lib/fetchUserPracticeErrors';
import {
  fetchErrorReviewDetail,
  fetchReviewedErrorKeys,
  markErrorAsReviewed,
} from '@/lib/fetchErrorReviewDetail';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export async function GET(req) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user?.id) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const url = new URL(req.url);
    const errorKey = url.searchParams.get('errorKey');

    if (errorKey) {
      const list = await fetchUserPracticeErrors(admin, authData.user.id);
      if (!list.ok) {
        return NextResponse.json({ error: list.error || 'Could not load errors.' }, { status: 500 });
      }
      const item = (list.data || []).find((e) => e.id === errorKey);
      if (!item) {
        return NextResponse.json({ error: 'Error not found.' }, { status: 404 });
      }
      const detail = await fetchErrorReviewDetail(admin, item);
      if (!detail.ok) {
        return NextResponse.json({ error: detail.error || 'Could not load review.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, data: detail.data });
    }

    const [result, reviewed] = await Promise.all([
      fetchUserPracticeErrors(admin, authData.user.id),
      fetchReviewedErrorKeys(admin, authData.user.id),
    ]);

    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Could not load errors.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      reviewedKeys: reviewed.keys || [],
      summary: summarizePracticeErrors(result.data),
    });
  } catch (err) {
    console.error('[api/profile/error-tracker]', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user?.id) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const errorKey = String(body.errorKey || '').trim();
    if (!errorKey) {
      return NextResponse.json({ error: 'Missing errorKey.' }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const result = await markErrorAsReviewed(admin, authData.user.id, errorKey);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Could not save.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, errorKey });
  } catch (err) {
    console.error('[api/profile/error-tracker POST]', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
