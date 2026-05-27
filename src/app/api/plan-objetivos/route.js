import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildStudyPlanDocument } from '@/lib/buildStudyPlanDocument';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

async function getAuthUser(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { error: 'No autenticado.', status: 401 };

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData?.user) {
    return { error: 'Sesión no válida.', status: 401 };
  }

  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const db = serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

  return { user: authData.user, token, db };
}

export async function GET(req) {
  try {
    const auth = await getAuthUser(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.db
      .from('plan_objetivos')
      .select('*')
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (error) {
      console.error('[plan-objetivos GET]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan: data });
  } catch (err) {
    console.error('[plan-objetivos GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await getAuthUser(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const {
      placementLevel,
      examGoalDate,
      hoursPerWeek,
      studyGoals,
      strengths,
      weaknesses,
      otherNotes,
      surveyData,
      placementBreakdown,
    } = body;

    if (!hoursPerWeek || Number(hoursPerWeek) <= 0) {
      return NextResponse.json({ error: 'Indica las horas semanales de estudio.' }, { status: 400 });
    }

    const { data: placementRow } = await auth.db
      .from('placement_results')
      .select('nivel_asignado')
      .eq('user_id', auth.user.id)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!placementRow) {
      return NextResponse.json(
        { error: 'Debes completar el placement test antes de crear tu plan.' },
        { status: 403 },
      );
    }

    const level = placementLevel || placementRow.nivel_asignado;
    const planDocument = buildStudyPlanDocument({
      placementLevel: level,
      examGoalDate: examGoalDate || null,
      hoursPerWeek: Number(hoursPerWeek),
      studyGoals: studyGoals || [],
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      otherNotes: otherNotes || '',
      placementBreakdown: placementBreakdown || null,
    });

    const now = new Date().toISOString();
    const row = {
      user_id: auth.user.id,
      placement_level: level,
      exam_goal_date: examGoalDate || null,
      hours_per_week: Number(hoursPerWeek),
      study_goals: studyGoals || [],
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      other_notes: otherNotes || null,
      survey_data: surveyData || body,
      plan_document: planDocument,
      plan_summary: planDocument.summary,
      completed_at: now,
      updated_at: now,
    };

    const { data, error } = await auth.db
      .from('plan_objetivos')
      .upsert(row, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      console.error('[plan-objetivos POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, plan: data });
  } catch (err) {
    console.error('[plan-objetivos POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
