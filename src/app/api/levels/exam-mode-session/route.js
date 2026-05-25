import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Optional cloud backup for exam-mode sessions (logged-in users).
 * Falls back gracefully if table is missing.
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const session = body?.session;
    if (!session?.slug || !session?.examSlot) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ ok: true, stored: false, reason: 'no_service' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    let userId = body?.userId;
    if (!userId && cookieHeader) {
      const { data: userData } = await supabase.auth.getUser(
        authHeader?.replace('Bearer ', '') || undefined,
      );
      userId = userData?.user?.id;
    }

    if (!userId) {
      return NextResponse.json({ ok: true, stored: false, reason: 'anonymous' });
    }

    const { error } = await supabase.from('levels_exam_mode_sessions').upsert(
      {
        user_id: userId,
        level_slug: session.slug,
        exam_slot: session.examSlot,
        payload: session,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,level_slug,exam_slot' },
    );

    if (error) {
      return NextResponse.json({ ok: true, stored: false, reason: error.message });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const examSlot = Number(searchParams.get('examen') || 1);
    const userId = searchParams.get('userId');

    if (!slug || !userId || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ session: null });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('levels_exam_mode_sessions')
      .select('payload')
      .eq('user_id', userId)
      .eq('level_slug', slug)
      .eq('exam_slot', examSlot)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({ session: data?.payload ?? null });
  } catch {
    return NextResponse.json({ session: null });
  }
}
