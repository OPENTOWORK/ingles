import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { shouldSyncExamModeSessionToServer } from '@/lib/b2ScoringV2FeatureFlag';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Cloud backup for archived exam-mode attempts (logged-in users). */
export async function PUT(request) {
  try {
    const body = await request.json();
    const history = body?.history;
    if (!history?.slug || !history?.examSlot) {
      return NextResponse.json({ error: 'Invalid history payload' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ ok: true, stored: false, reason: 'no_service' });
    }

    const userId = body?.userId;
    if (!userId) {
      return NextResponse.json({ ok: true, stored: false, reason: 'anonymous' });
    }

    if (!shouldSyncExamModeSessionToServer(history)) {
      return NextResponse.json({ ok: true, stored: false, reason: 'sync_disabled' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.from('levels_exam_mode_sessions').upsert(
      {
        user_id: userId,
        level_slug: history.slug,
        exam_slot: history.examSlot,
        payload: history,
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
      return NextResponse.json({ history: null });
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
      return NextResponse.json({ history: null });
    }

    return NextResponse.json({ history: data?.payload ?? null });
  } catch {
    return NextResponse.json({ history: null });
  }
}
