import test from 'node:test';
import assert from 'node:assert/strict';
import { STORE_PRODUCTS, storeProductFor } from '../store/products.js';
import { entitlementFromGoogleSubscription } from '../store/googlePlay.js';
import { entitlementFromAppleTransaction, verifyAppleSignedTransaction } from '../store/appleStore.js';

test('los planes de la tienda coinciden con los precios de la web', () => {
  const plusMonth = storeProductFor('premium', 'monthly');
  const plusYear = storeProductFor('premium', 'annual');
  const premiumYear = storeProductFor('pro', 'year');

  assert.equal(plusMonth.productId, 'plus_monthly');
  assert.equal(plusMonth.priceEur, 3.99);
  assert.equal(plusYear.productId, 'plus_yearly');
  assert.equal(plusYear.priceEur, 23.88);
  assert.equal(premiumYear.productId, 'premium_yearly');
  assert.equal(premiumYear.priceEur, 59.88);
  assert.equal(STORE_PRODUCTS.length, 4);
});

test('una suscripción de Play cancelada sigue activa hasta que vence', () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const entitlement = entitlementFromGoogleSubscription(
    {
      subscriptionState: 'SUBSCRIPTION_STATE_CANCELED',
      latestOrderId: 'order-1',
      lineItems: [{ productId: 'plus_monthly', expiryTime: future }],
    },
    'plus_monthly',
  );

  assert.equal(entitlement.active, true);
  assert.equal(entitlement.cancelAtPeriodEnd, true);
  assert.equal(entitlement.status, 'active');
  assert.equal(entitlement.productId, 'plus_monthly');
});

test('una transacción de Apple caducada no da acceso', () => {
  const entitlement = entitlementFromAppleTransaction({
    productId: 'plus_yearly',
    expiresDate: Date.now() - 1000,
    originalTransactionId: '100',
  });

  assert.equal(entitlement.active, false);
  assert.equal(entitlement.status, 'canceled');
  assert.equal(entitlement.transactionId, '100');
});

test('una transacción sin firma de Apple se rechaza', () => {
  assert.throws(() => verifyAppleSignedTransaction('a.b.c'), /Apple|válida|firmada|formato/);
});
