/**
 * Recompensa por referido: 2 meses gratis del plan PLUS (slug `premium`).
 */
import { getPlanBySlug } from '@/data/financialPlanConfig';
import {
  findSubscriptionByUserId,
  getOrCreateStripeCustomer,
  getSubscriptionsDb,
  syncSubscriptionFromStripe,
} from '@/lib/stripe/subscriptions';
import {
  getStripe,
  getStripePriceId,
  isStripeConfigured,
  subscriptionGrantsAccess,
} from '@/lib/stripe/server';

/** PLUS en el catálogo interno. */
export const REFERRAL_REWARD_PLAN_SLUG = 'premium';
export const REFERRAL_REWARD_FREE_DAYS = 60;

function subscriptionPeriodEndUnix(subscription) {
  return (
    subscription?.items?.data?.[0]?.current_period_end ?? subscription?.current_period_end ?? null
  );
}

/**
 * Aplica 2 meses gratis de PLUS al usuario que invitó, cuando su amigo contrata un plan de pago.
 */
export async function grantReferralReward({ inviterUserId, invitationId }) {
  if (!inviterUserId) return { ok: false, reason: 'no_inviter' };

  if (!isStripeConfigured()) {
    console.warn('[referral-reward] Stripe no configurado; recompensa pendiente', invitationId);
    return { ok: false, reason: 'stripe_not_configured' };
  }

  const db = getSubscriptionsDb();
  if (!db) return { ok: false, reason: 'no_db' };

  const priceId = getStripePriceId(REFERRAL_REWARD_PLAN_SLUG, 'month');
  if (!priceId) {
    console.error('[referral-reward] Falta STRIPE_PRICE_PREMIUM_MONTHLY');
    return { ok: false, reason: 'no_price_id' };
  }

  const { data: authData, error: authError } = await db.auth.admin.getUserById(inviterUserId);
  if (authError || !authData?.user) {
    console.error('[referral-reward] inviter not found', inviterUserId, authError);
    return { ok: false, reason: 'inviter_not_found' };
  }

  const stripe = getStripe();
  const inviter = authData.user;
  const customerId = await getOrCreateStripeCustomer(db, inviter);
  const existing = await findSubscriptionByUserId(db, inviterUserId);
  const rewardMeta = {
    supabase_user_id: inviterUserId,
    plan_slug: REFERRAL_REWARD_PLAN_SLUG,
    referral_reward: String(invitationId || 'true'),
  };

  try {
    if (
      existing?.stripe_subscription_id &&
      subscriptionGrantsAccess(existing.status)
    ) {
      const current = await stripe.subscriptions.retrieve(existing.stripe_subscription_id);
      const periodEnd = subscriptionPeriodEndUnix(current);
      if (!periodEnd) {
        return { ok: false, reason: 'no_period_end' };
      }

      const extensionSeconds = REFERRAL_REWARD_FREE_DAYS * 24 * 60 * 60;
      const updated = await stripe.subscriptions.update(existing.stripe_subscription_id, {
        trial_end: periodEnd + extensionSeconds,
        proration_behavior: 'none',
        metadata: {
          ...(current.metadata || {}),
          ...rewardMeta,
        },
      });

      await syncSubscriptionFromStripe(updated, { userId: inviterUserId });
      return {
        ok: true,
        method: 'extended',
        planSlug: REFERRAL_REWARD_PLAN_SLUG,
        freeDays: REFERRAL_REWARD_FREE_DAYS,
      };
    }

    const created = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: REFERRAL_REWARD_FREE_DAYS,
      metadata: rewardMeta,
    });

    await syncSubscriptionFromStripe(created, { userId: inviterUserId });
    return {
      ok: true,
      method: 'trial_created',
      planSlug: REFERRAL_REWARD_PLAN_SLUG,
      freeDays: REFERRAL_REWARD_FREE_DAYS,
    };
  } catch (err) {
    console.error('[referral-reward] grant failed', invitationId, err);
    return { ok: false, reason: 'stripe_error', error: err?.message || String(err) };
  }
}

export function referralRewardPlanLabel() {
  return getPlanBySlug(REFERRAL_REWARD_PLAN_SLUG)?.nombre || 'PLUS';
}
