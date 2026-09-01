import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isLevelIncludedInPlan, minPlanForLevel } from '@/data/financialPlanConfig.js';
import { getNivelesLevelPlanLock } from '@/lib/nivelesPlanLevelAccess.js';

describe('nivelesPlanLevelAccess', () => {
  it('locks C2 for FREE and PLUS, not for PREMIUM', () => {
    assert.equal(minPlanForLevel('c2'), 'pro');
    assert.equal(isLevelIncludedInPlan('c2', 'free'), false);
    assert.equal(isLevelIncludedInPlan('c2', 'premium'), false);
    assert.equal(isLevelIncludedInPlan('c2', 'pro'), true);

    assert.deepEqual(getNivelesLevelPlanLock('C2', 'premium'), {
      level: 'C2',
      requiredPlanSlug: 'pro',
      requiredPlanName: 'PREMIUM',
    });
    assert.equal(getNivelesLevelPlanLock('C2', 'pro'), null);
  });
});
