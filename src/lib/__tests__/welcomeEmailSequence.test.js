import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_AUTOMATED_EMAIL_TEMPLATES } from '@/lib/automatedEmailDefaults';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { renderEmailTemplate, splitEmailDeliveryMeta } from '@/lib/renderEmailTemplate';

const DAY = 24 * 60;

test('welcome sequence is four registration emails on day 0, 2, 4 and 7', () => {
  const sequence = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.filter(
    (template) => template.trigger_event === AUTOMATED_EMAIL_TRIGGERS.USER_REGISTERED,
  ).sort((a, b) => a.delay_minutos - b.delay_minutos);

  assert.deepEqual(
    sequence.map((template) => template.slug),
    [
      'welcome_registration',
      'welcome_learn_from_mistakes',
      'welcome_practice_with_intent',
      'welcome_start_account',
    ],
  );
  assert.deepEqual(
    sequence.map((template) => template.delay_minutos),
    [0, 2 * DAY, 4 * DAY, 7 * DAY],
  );

  for (const template of sequence) {
    assert.equal(template.activo, true);
    assert.equal(template.es_sistema, true);
    assert.ok(template.asunto.length > 8);
    assert.match(template.cuerpo, /^Preheader: /);
    assert.match(template.cuerpo, /CTA: /);
  }
});

test('preheader and button label stay out of the visible email body', () => {
  const template = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.find(
    (item) => item.slug === 'welcome_registration',
  );
  const rendered = renderEmailTemplate(template.cuerpo, {
    app_url: 'https://www.dralo.es',
  });
  const meta = splitEmailDeliveryMeta(rendered);

  assert.equal(meta.preheader, 'Un pequeño plan para empezar a practicar con sentido.');
  assert.equal(meta.ctaLabel, 'Empezar mi primera práctica');
  assert.equal(meta.text.includes('Preheader:'), false);
  assert.equal(meta.text.includes('CTA:'), false);
  assert.match(meta.text, /https:\/\/www\.dralo\.es\/exam-practice\/b2\//);
  assert.match(meta.text, /20 minutos/);
});
