import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSignupHref, normalizeSignupSource, pushSignUpEvent } from '../signupTracking.js';

describe('signup attribution', () => {
  it('keeps ad params and names the button', () => {
    assert.equal(
      buildSignupHref('?utm_source=google&utm_medium=cpc&gclid=click-1&fbclid=fb&page=home', 'hero'),
      '/registro/?utm_source=google&utm_medium=cpc&gclid=click-1&fbclid=fb&src=hero',
    );
    assert.equal(normalizeSignupSource('plan_plus'), 'plan_plus');
    assert.equal(normalizeSignupSource('promo_25'), 'promo_25');
    assert.equal(normalizeSignupSource('no-existe'), 'otros');
    assert.equal(buildSignupHref('', 'header'), '/registro/?src=otros');
  });

  it('sends sign_up once per account', () => {
    const storage = new Map();
    const layer = [];
    const memory = {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, value),
    };
    const first = pushSignUpEvent({
      method: 'email',
      userId: 'user-1',
      search: '?src=hero&utm_source=meta',
      storage: memory,
      layer,
    });
    const repeat = pushSignUpEvent({
      method: 'email',
      userId: 'user-1',
      search: '?src=hero',
      storage: memory,
      layer,
    });
    const other = pushSignUpEvent({
      method: 'email',
      userId: 'user-2',
      search: '?src=plan_plus',
      storage: memory,
      layer,
    });
    assert.equal(first, true);
    assert.equal(repeat, false);
    assert.equal(other, true);
    const promo = pushSignUpEvent({
      method: 'email',
      userId: 'user-3',
      search: '?src=promo_25',
      storage: memory,
      layer,
    });
    assert.equal(promo, true);
    assert.deepEqual(layer, [
      { event: 'sign_up', method: 'email', signup_source: 'hero' },
      { event: 'sign_up', method: 'email', signup_source: 'plan_plus' },
      { event: 'sign_up', method: 'email', signup_source: 'promo_25' },
      { event: 'signup_promo_25', method: 'email', signup_source: 'promo_25' },
    ]);
  });
});
