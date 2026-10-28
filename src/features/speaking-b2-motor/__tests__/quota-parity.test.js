import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { AI_ACTIONS, getDailyLimit } from '@/lib/aiUsage';
import { PLAN_USAGE_KEYS } from '@/lib/planUsageKeys';
import { getSpeakingCorrectionMonthlyLimit } from '@/lib/subscriptionPlans';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function read(rel) {
  return readFileSync(path.join(root, rel), 'utf8');
}

describe('speaking B2 quota parity with the live commercial rules', () => {
  const consume = read('src/lib/planAccess.js');
  const daily = read('src/lib/aiUsage.js');
  const quota = read('src/features/speaking-b2-motor/services/evaluation/quota.js');
  const sql = read('scripts/speaking_b2_motor_v22.sql');
  const store = read('src/features/speaking-b2-motor/services/session-store.js');

  it('keeps student identity, active plan, monthly speaking cupo and renewal period', () => {
    assert.match(consume, /export async function checkPlanUsage/);
    assert.match(consume, /PLAN_FEATURE_LOCKED/);
    assert.match(consume, /PLAN_LIMIT_REACHED/);
    assert.match(consume, /periodType/);
    assert.match(consume, /periodKey/);
    assert.match(consume, /eq\('user_id', userId\)/);
    assert.match(quota, /shouldApplyPlanUsageLimits/);
    assert.match(quota, /resolveUserPlanSlug/);
    assert.match(quota, /PLAN_USAGE_KEYS\.SPEAKING_CORRECTION/);
    assert.match(quota, /periodKey: planResult.periodKey/);
    assert.match(sql, /if p_user_id is null/);
    assert.match(sql, /sess.user_id <> p_user_id/);
    assert.match(sql, /p_period_type/);
    assert.match(sql, /p_period_key/);
    assert.match(sql, /PLAN_FEATURE_LOCKED/);
    assert.match(sql, /PLAN_LIMIT_REACHED/);
    assert.equal(PLAN_USAGE_KEYS.SPEAKING_CORRECTION, 'speaking_correction');
  });

  it('does not invent a new staff cap: Speaking uses exam_speaking_feedback 3/day', () => {
    assert.equal(AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, 'exam_speaking_feedback');
    assert.equal(getDailyLimit(AI_ACTIONS.EXAM_SPEAKING_FEEDBACK), 3);
    assert.match(quota, /checkDailyAiLimit\(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK/);
    assert.match(quota, /mode: 'staff_daily'/);
    assert.match(quota, /mode: 'staff_exempt'/);
    assert.match(sql, /p_daily_action/);
    assert.match(sql, /ai_usage_daily_limits/);
    assert.match(sql, /DAILY_LIMIT_REACHED/);
    assert.match(store, /p_daily_limit: dailyLimit/);
  });

  it('does not change commercial speaking numbers', () => {
    assert.equal(typeof getSpeakingCorrectionMonthlyLimit('free'), 'number');
    assert.equal(getDailyLimit(AI_ACTIONS.EXAM_SPEAKING_FEEDBACK), 3);
    assert.equal(quota.includes('speakingCorrectionMonthly'), false);
    assert.equal(sql.includes('speakingCorrectionMonthly'), false);
  });

  it('charges through the SQL transaction instead of copying consumePlanUsage', () => {
    const route = read('src/app/api/speaking-b2/complete/route.js');
    assert.match(sql, /insert into public.plan_usage_counters/);
    assert.match(sql, /for update/);
    assert.match(sql, /Validate every limit before touching shared counters/);
    assert.match(sql, /and public.plan_usage_counters.count < p_limit/);
    assert.match(sql, /and public.ai_usage_daily_limits.count < p_daily_limit/);
    assert.equal(sql.includes('ai_usage_daily_limits_user_action_date_uidx'), false);
    assert.match(sql, /evaluation_charged = true/);
    assert.match(sql, /status = 'consumed'/);
    assert.match(route, /finalizeSpeakingB2QuotaCharge/);
    assert.equal(route.includes('consumePlanUsage'), false);
    assert.equal(route.includes('consumeDailyAiLimit'), false);
  });
});
