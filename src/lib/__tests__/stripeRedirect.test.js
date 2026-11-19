import test from 'node:test';
import assert from 'node:assert/strict';
import { isStripeHostedUrl, redirectToStripe } from '@/lib/stripe/redirect';

test('only hosted Stripe checkout and billing URLs are accepted', () => {
  assert.equal(isStripeHostedUrl('https://checkout.stripe.com/c/pay/cs_test_123'), true);
  assert.equal(isStripeHostedUrl('https://billing.stripe.com/p/session/test'), true);
  assert.equal(isStripeHostedUrl('http://checkout.stripe.com/c/pay/cs_test_123'), false);
  assert.equal(isStripeHostedUrl('https://checkout.stripe.com.evil.test/c/pay/cs_test_123'), false);
  assert.equal(isStripeHostedUrl('https://example.com'), false);
  assert.equal(isStripeHostedUrl('javascript:alert(1)'), false);
});

test('the app frame asks the outer window to open Stripe', () => {
  const messages = [];
  const topAssigned = [];
  const frameAssigned = [];
  const frame = {};
  globalThis.window = {
    self: frame,
    top: { location: { assign: (url) => topAssigned.push(url) } },
    parent: { postMessage: (data) => messages.push(data) },
    location: { assign: (url) => frameAssigned.push(url) },
    open: () => {
      throw new Error('popup');
    },
  };

  redirectToStripe('https://checkout.stripe.com/c/pay/cs_test_123');

  assert.deepEqual(messages, [
    {
      type: 'dralo-open-stripe',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    },
  ]);
  assert.deepEqual(topAssigned, ['https://checkout.stripe.com/c/pay/cs_test_123']);
  assert.deepEqual(frameAssigned, []);
  delete globalThis.window;
});

test('the website opens Stripe in the same tab', () => {
  const assigned = [];
  const page = {
    location: { assign: (url) => assigned.push(url) },
  };
  globalThis.window = page;
  page.self = page;
  page.top = page;

  redirectToStripe('https://billing.stripe.com/p/session/test');

  assert.deepEqual(assigned, ['https://billing.stripe.com/p/session/test']);
  delete globalThis.window;
});

test('the installed app does not open Stripe', () => {
  const assigned = [];
  const page = {
    location: { assign: (url) => assigned.push(url), search: '' },
    navigator: { userAgent: 'Mozilla DraloApp' },
  };
  page.self = page;
  page.top = page;
  globalThis.window = page;

  assert.throws(
    () => redirectToStripe('https://checkout.stripe.com/c/pay/cs_test_123'),
    /Google Play/,
  );
  assert.deepEqual(assigned, []);
  delete globalThis.window;
});
