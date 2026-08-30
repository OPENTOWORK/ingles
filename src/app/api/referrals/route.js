import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { listReferralsForUser } from '@/lib/referrals';
import { getSupabaseUrl } from '@/lib/supabaseEnv';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Auth not configured.' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitations = await listReferralsForUser(authData.user.id);

    return NextResponse.json({
      invitations: invitations.map((row) => ({
        id: row.id,
        email: row.invitee_email,
        status: row.status,
        sentAt: row.email_sent_at,
        registeredAt: row.registered_at,
        paidAt: row.paid_at,
        paidPlan: row.paid_plan_slug,
        rewardGrantedAt: row.reward_granted_at,
      })),
    });
  } catch (err) {
    console.error('[api/referrals]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
