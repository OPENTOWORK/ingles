import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_AUTOMATED_EMAIL_TEMPLATES } from '@/lib/automatedEmailDefaults';
import {
  BLACK_FRIDAY_EMAIL_LEGAL,
  blackFridayEmailForDate,
  blackFridayGreeting,
  blackFridayOfferUrl,
  userAlreadyPaid,
} from '@/lib/blackFridayEmailSequence.rules';
import { splitEmailDeliveryMeta } from '@/lib/renderEmailTemplate';

test('the sequence only matches its three Madrid mornings', () => {
  assert.equal(blackFridayEmailForDate(new Date('2026-11-19T22:00:00.000Z')), null);
  assert.equal(blackFridayEmailForDate(new Date('2026-11-19T23:30:00.000Z'))?.src, 'bf-email-1');
  assert.equal(blackFridayEmailForDate(new Date('2026-11-26T23:30:00.000Z'))?.src, 'bf-email-2');
  assert.equal(blackFridayEmailForDate(new Date('2026-11-29T23:30:00.000Z'))?.src, 'bf-email-3');
  assert.equal(blackFridayEmailForDate(new Date('2026-11-30T23:30:00.000Z')), null);
});

test('each email link keeps the campaign and its own src', () => {
  const first = blackFridayOfferUrl('https://www.dralo.es', 'bf-email-1');
  const second = blackFridayOfferUrl('https://www.dralo.es/', 'bf-email-2');
  assert.match(first, /facturacion=anual/);
  assert.match(first, /utm_source=email/);
  assert.match(first, /utm_campaign=black_friday/);
  assert.match(first, /src=bf-email-1/);
  assert.match(second, /src=bf-email-2/);
  assert.notEqual(first, second);
});

test('paid plans and past Stripe charges stay out, free accounts stay in', () => {
  assert.equal(userAlreadyPaid({ planId: 'free' }), false);
  assert.equal(userAlreadyPaid({ planId: 'premium' }), true);
  assert.equal(
    userAlreadyPaid({
      planId: 'free',
      subscription: { status: 'canceled', stripe_subscription_id: 'sub_123', plan_id: 'free' },
    }),
    true,
  );
  assert.equal(
    userAlreadyPaid({
      planId: 'free',
      subscription: { status: 'incomplete', stripe_subscription_id: 'sub_open', plan_id: 'premium' },
    }),
    false,
  );
});

test('the greeting uses the first name and stays plain without one', () => {
  assert.equal(blackFridayGreeting('María García'), ', María');
  assert.equal(blackFridayGreeting(''), '');
});

test('the three emails keep their subject, button and legal footer', () => {
  const emails = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.filter((item) =>
    String(item.slug || '').startsWith('black_friday_'),
  );
  assert.deepEqual(
    emails.map((item) => item.asunto),
    [
      '12 meses de Plan Plus por 19,99 €',
      'Tu Writing, corregido todo el año',
      'Hoy termina la oferta del año',
    ],
  );
  const buttons = ['Quiero el año por 19,99 €', 'Ver la oferta', 'Quiero el año por 19,99 €'];
  emails.forEach((item, index) => {
    const meta = splitEmailDeliveryMeta(item.cuerpo);
    assert.equal(meta.ctaLabel, buttons[index]);
    assert.match(item.cuerpo, /\{\{oferta_url\}\}/);
    assert.match(item.cuerpo, /Hola\{\{saludo\}\}:/);
    assert.ok(item.cuerpo.includes(BLACK_FRIDAY_EMAIL_LEGAL));
    assert.equal(item.cuerpo.includes('domingo'), false);
  });
  assert.match(emails[1].cuerpo, /Hasta el lunes 30/);
  assert.match(emails[1].cuerpo, /Preheader: El Plan Plus anual a 19,99 € termina el lunes\./);
});
