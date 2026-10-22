import assert from 'node:assert/strict';
import test from 'node:test';
import { getWeeklyChallenge } from '@/data/weeklyTrainingChallenges';
import { DEFAULT_AUTOMATED_EMAIL_TEMPLATES } from '@/lib/automatedEmailDefaults';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { renderEmailTemplate, splitEmailDeliveryMeta } from '@/lib/renderEmailTemplate';
import {
  buildWeeklyChallengeEmailVariables,
  isWeeklyChallengeMailDay,
} from '@/lib/weeklyChallengeEmail';

const FIRST_TUESDAY = new Date('2026-10-20T08:00:00.000Z');
const MONDAY_BEFORE = new Date('2026-10-19T08:00:00.000Z');
const THURSDAY_SAME_WEEK = new Date('2026-10-22T08:00:00.000Z');
const NEXT_TUESDAY = new Date('2026-10-27T08:00:00.000Z');
const MONDAY_AFTER = new Date('2026-10-26T08:00:00.000Z');

test('tuesday challenge mail uses the week item and hides the solution', () => {
  const template = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.find(
    (item) => item.slug === 'weekly_tuesday_challenge',
  );
  assert.ok(template);
  assert.equal(template.trigger_event, AUTOMATED_EMAIL_TRIGGERS.WEEKLY_TUESDAY_CHALLENGE);
  assert.equal(template.delay_minutos, 0);
  assert.equal(template.activo, true);
  assert.match(template.cuerpo, /^Preheader: /);
  assert.match(template.cuerpo, /CTA: Comprobar mi respuesta/);
  assert.equal(template.cuerpo.includes('solution'), false);

  const challenge = getWeeklyChallenge(FIRST_TUESDAY);
  assert.equal(challenge.id, 'used-to-ing');
  assert.equal(challenge.weekId, '2026-10-20');

  const variables = buildWeeklyChallengeEmailVariables(FIRST_TUESDAY, 'https://www.dralo.es');
  assert.equal('correct' in variables, false);
  assert.equal('solution' in variables, false);
  assert.equal(variables.challenge_prompt, challenge.prompt);
  assert.match(variables.challenge_options, /^A\) speak\nB\) speaking\nC\) spoke$/);
  assert.equal(variables.challenge_url, 'https://www.dralo.es/training/');

  const rendered = renderEmailTemplate(template.cuerpo, variables);
  const meta = splitEmailDeliveryMeta(rendered);
  assert.equal(meta.preheader, 'Elige una opción antes de entrar. La explicación está en Dralo.');
  assert.equal(meta.ctaLabel, 'Comprobar mi respuesta');
  assert.match(meta.text, /I’m not used to _____ English every day\./);
  assert.match(meta.text, /B\) speaking/);
  assert.equal(meta.text.includes(challenge.solution), false);
  assert.equal(meta.text.includes('Después de be used to'), false);
  assert.match(meta.text, /https:\/\/www\.dralo\.es\/training\//);
});

test('the same challenge stays all week and the next tuesday moves on', () => {
  assert.equal(isWeeklyChallengeMailDay(FIRST_TUESDAY), true);
  assert.equal(isWeeklyChallengeMailDay(THURSDAY_SAME_WEEK), true);
  assert.equal(isWeeklyChallengeMailDay(MONDAY_BEFORE), false);
  assert.equal(isWeeklyChallengeMailDay(MONDAY_AFTER), false);

  const thisWeek = buildWeeklyChallengeEmailVariables(THURSDAY_SAME_WEEK);
  const opening = buildWeeklyChallengeEmailVariables(FIRST_TUESDAY);
  assert.equal(thisWeek.challenge_prompt, opening.challenge_prompt);

  const next = getWeeklyChallenge(NEXT_TUESDAY);
  assert.equal(next.id, 'second-conditional');
  assert.equal(next.weekId, '2026-10-27');
  const nextMail = buildWeeklyChallengeEmailVariables(NEXT_TUESDAY);
  assert.equal(nextMail.challenge_prompt.includes(next.solution), false);
  assert.equal(nextMail.challenge_options.includes('had'), true);
});

test('every weekly challenge is a three-option gap with one answer', () => {
  const seen = new Set();
  for (let week = 0; week < 24; week += 1) {
    const date = new Date(Date.UTC(2026, 9, 20 + week * 7, 8));
    const challenge = getWeeklyChallenge(date);
    assert.equal(seen.has(challenge.id), false);
    seen.add(challenge.id);
    assert.equal(challenge.options.length, 3);
    assert.deepEqual(
      challenge.options.map((option) => option.id),
      ['A', 'B', 'C'],
    );
    assert.ok(challenge.options.some((option) => option.id === challenge.correct));
    assert.equal(challenge.prompt.includes('_____'), true);
    const mail = buildWeeklyChallengeEmailVariables(date);
    assert.equal(mail.challenge_prompt.includes(challenge.solution), false);
    assert.equal(Object.values(mail).join('\n').includes(challenge.solution), false);
  }
});
