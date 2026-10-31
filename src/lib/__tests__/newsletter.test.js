import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildNewsletterConfirmEmail,
  createNewsletterTokenPair,
  newsletterConfirmUrl,
  newsletterConsentError,
  newsletterUnsubscribeUrl,
  normalizeNewsletterEmail,
  normalizeNewsletterToken,
  planNewsletterConfirm,
  planNewsletterSignup,
  planNewsletterUnsubscribe,
  tryConsumeNewsletterSignup,
} from '@/lib/newsletter';

const NOW = '2026-10-31T08:00:00.000Z';
const TOKENS = { confirmToken: 'a'.repeat(43), unsubscribeToken: 'b'.repeat(43) };

test('newsletter email only accepts a normal address', () => {
  assert.equal(normalizeNewsletterEmail('  Ana@Dralo.es '), 'ana@dralo.es');
  assert.equal(normalizeNewsletterEmail('no-es-un-correo'), '');
  assert.equal(normalizeNewsletterEmail('ana@dralo.es\nBcc: x'), '');
  assert.equal(normalizeNewsletterToken('short'), '');
  assert.equal(normalizeNewsletterToken(`${'a'.repeat(43)}`), 'a'.repeat(43));
});

test('signup requires terms, data protection and the newsletter', () => {
  assert.equal(
    newsletterConsentError({
      acceptedTerms: true,
      acceptedDataProtection: true,
      acceptedNewsletter: true,
    }),
    '',
  );
  assert.match(newsletterConsentError({ acceptedTerms: true, acceptedDataProtection: true }), /newsletter/);
  assert.match(newsletterConsentError({}), /términos/);
});

test('a new address is pending and an active one is left alone', () => {
  const created = planNewsletterSignup(null, TOKENS, NOW);
  assert.equal(created.outcome, 'pending');
  assert.equal(created.action, 'insert');
  assert.equal(created.row.status, 'pending');
  assert.equal(created.confirmToken, TOKENS.confirmToken);

  const pending = planNewsletterSignup(
    { status: 'pending', confirm_token: 'c'.repeat(43), unsubscribe_token: 'd'.repeat(43) },
    TOKENS,
    NOW,
  );
  assert.equal(pending.outcome, 'pending');
  assert.equal(pending.confirmToken, 'c'.repeat(43));
  assert.equal(pending.row.confirm_token, undefined);

  const active = planNewsletterSignup({ status: 'active' }, TOKENS, NOW);
  assert.equal(active.action, 'none');
  assert.equal(active.outcome, 'active');

  const again = planNewsletterSignup({ status: 'unsubscribed' }, TOKENS, NOW);
  assert.equal(again.outcome, 'pending');
  assert.equal(again.row.status, 'pending');
  assert.equal(again.row.confirm_token, TOKENS.confirmToken);
  assert.equal(again.row.unsubscribed_at, null);
});

test('confirm activates a pending row and does not revive a cancelled one', () => {
  const pending = planNewsletterConfirm({ status: 'pending' }, NOW);
  assert.equal(pending.ok, true);
  assert.equal(pending.patch.status, 'active');
  assert.equal(pending.patch.confirmed_at, NOW);

  assert.equal(planNewsletterConfirm({ status: 'active' }, NOW).already, true);
  assert.equal(planNewsletterConfirm({ status: 'unsubscribed' }, NOW).code, 'inactive');
  assert.equal(planNewsletterConfirm(null, NOW).code, 'invalid');
});

test('unsubscribe marks the row and a second time is already done', () => {
  const first = planNewsletterUnsubscribe({ status: 'active' }, NOW);
  assert.equal(first.patch.status, 'unsubscribed');
  assert.equal(first.patch.unsubscribed_at, NOW);
  assert.equal(planNewsletterUnsubscribe({ status: 'pending' }, NOW).patch.status, 'unsubscribed');
  assert.equal(planNewsletterUnsubscribe({ status: 'unsubscribed' }, NOW).already, true);
  assert.equal(planNewsletterUnsubscribe(null, NOW).code, 'invalid');
});

test('the confirmation email points at confirm and unsubscribe, not at the blog', () => {
  const pair = createNewsletterTokenPair();
  assert.equal(pair.confirmToken.length >= 32, true);
  assert.equal(pair.confirmToken === pair.unsubscribeToken, false);

  const confirmUrl = newsletterConfirmUrl(pair.confirmToken, 'https://www.dralo.es');
  const unsubscribeUrl = newsletterUnsubscribeUrl(pair.unsubscribeToken, 'https://www.dralo.es');
  const message = buildNewsletterConfirmEmail({ confirmUrl, unsubscribeUrl, siteUrl: 'https://www.dralo.es' });

  assert.equal(message.subject, 'Confirma tu newsletter de Dralo');
  assert.match(message.text, /newsletter\/confirmar\/\?token=/);
  assert.match(message.text, /newsletter\/baja\/\?token=/);
  assert.equal(message.text.includes('/blog'), false);
  assert.match(message.html, /Confirmar suscripción/);
  assert.match(message.html, new RegExp(confirmUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('signup rate limit blocks the sixth try from the same address', () => {
  const ip = `newsletter-${Date.now()}`;
  for (let i = 0; i < 5; i += 1) {
    assert.equal(tryConsumeNewsletterSignup(ip, `person${i}@dralo.es`), true);
  }
  assert.equal(tryConsumeNewsletterSignup(ip, 'otro@dralo.es'), false);
});
