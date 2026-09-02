import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  getSubscriptionsDb,
  scheduleSubscriptionCancelAtPeriodEnd,
} from '@/lib/stripe/subscriptions';

function getServiceDb() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const db = getServiceDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Account deletion is not configured (missing service role).' },
        { status: 503 },
      );
    }

    const userId = auth.user.id;
    const subscriptionsDb = getSubscriptionsDb();

    let subscriptionResult = { scheduled: false };
    if (subscriptionsDb) {
      try {
        subscriptionResult = await scheduleSubscriptionCancelAtPeriodEnd(subscriptionsDb, userId);
      } catch (err) {
        console.error('[account/delete] Stripe cancel at period end:', err);
        return NextResponse.json(
          { error: 'Could not schedule subscription cancellation. Try again or contact support.' },
          { status: 502 },
        );
      }
    }

    const cleanupTables = [
      { table: 'user_preferences', column: 'user_id' },
      { table: 'profiles', column: 'user_id' },
      { table: 'user_profiles', column: 'id' },
    ];

    for (const { table, column } of cleanupTables) {
      const { error } = await db.from(table).delete().eq(column, userId);
      if (error && !String(error.message || '').includes('does not exist')) {
        console.warn(`[account/delete] cleanup ${table}:`, error.message);
      }
    }

    const deletedAt = new Date().toISOString();
    const { error: metadataError } = await db.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...(auth.user.user_metadata || {}),
        account_status: 'deleted',
        account_deleted_at: deletedAt,
        ...(subscriptionResult.scheduled && subscriptionResult.accessUntil
          ? { subscription_access_until: subscriptionResult.accessUntil }
          : {}),
      },
    });

    if (metadataError) {
      console.error('[account/delete] metadata:', metadataError);
      return NextResponse.json(
        { error: metadataError.message || 'Could not delete account.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      subscription: subscriptionResult.scheduled
        ? {
            cancelAtPeriodEnd: true,
            accessUntil: subscriptionResult.accessUntil || null,
            alreadyScheduled: Boolean(subscriptionResult.alreadyScheduled),
          }
        : null,
    });
  } catch (err) {
    console.error('[account/delete]', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
