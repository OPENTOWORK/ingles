import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildNewsletterMondayEmail,
  isNewsletterMondaySendTime,
  newsletterIssueForMonday,
  newsletterMondayId,
  planNewsletterMondayRecipients,
} from '@/lib/newsletterMondayEmail';

const FIRST_MONDAY_UTC = new Date('2026-11-02T09:00:00.000Z');

test('the first Monday is 2 November 2026 at 10:00 Madrid', () => {
  assert.equal(newsletterMondayId(FIRST_MONDAY_UTC), '2026-11-02');
  assert.equal(newsletterMondayId(new Date('2026-11-01T22:30:00.000Z')), '2026-10-26');
  assert.equal(isNewsletterMondaySendTime(FIRST_MONDAY_UTC), true);
  assert.equal(isNewsletterMondaySendTime(new Date('2026-11-02T08:00:00.000Z')), false);
  assert.equal(isNewsletterMondaySendTime(new Date('2026-11-03T09:00:00.000Z')), false);
});

test('confirmed subscribers replace the staff list', () => {
  const withSubscribers = planNewsletterMondayRecipients({
    activeEmails: ['Ana@Dralo.es', 'ana@dralo.es'],
    staffEmails: ['direccion@opentowork.com', 'marketing@dralo.es'],
    alreadySent: [],
  });
  assert.deepEqual(withSubscribers, {
    audience: 'subscribers',
    recipients: ['ana@dralo.es'],
  });

  const emptyList = planNewsletterMondayRecipients({
    activeEmails: [],
    staffEmails: ['direccion@opentowork.com', 'Marketing@Dralo.es'],
    alreadySent: ['direccion@opentowork.com'],
  });
  assert.equal(emptyList.audience, 'staff');
  assert.deepEqual(emptyList.recipients, ['marketing@dralo.es']);
});

test('the first issue is the exam-date letter and later Mondays rotate', () => {
  const first = buildNewsletterMondayEmail({
    mondayId: '2026-11-02',
    audience: 'staff',
  });
  assert.match(first.subject, /fechas del B2 First/);
  assert.match(first.text, /junio, agosto y diciembre/);
  assert.match(first.text, /coordinación o profesorado/);
  assert.match(first.html, /Buscar un centro/);
  assert.match(first.html, /border-radius:999px;background:#f8f5ff/);
  assert.doesNotMatch(first.html, /text-decoration:underline/);
  assert.doesNotMatch(first.text, /darte de baja cuando quieras:\nhttps/);

  const subscriber = buildNewsletterMondayEmail({
    mondayId: '2026-11-02',
    audience: 'subscribers',
    unsubscribeUrl: 'https://www.dralo.es/newsletter/baja/?token=abc',
  });
  assert.match(subscriber.text, /newsletter\/baja\/\?token=abc/);
  assert.doesNotMatch(subscriber.text, /coordinación o profesorado/);

  assert.equal(newsletterIssueForMonday('2026-10-26'), null);
  assert.equal(newsletterIssueForMonday('2026-11-09').issueIndex, 1);

  const subjects = [];
  for (let week = 0; week < 60; week += 1) {
    const monday = new Date(Date.UTC(2026, 10, 2 + week * 7)).toISOString().slice(0, 10);
    const issue = newsletterIssueForMonday(monday);
    if (!issue) break;
    subjects.push(issue.subject);
  }
  assert.ok(subjects.length >= 12);
  assert.equal(new Set(subjects).size, subjects.length);
  assert.notEqual(subjects[4], subjects[0]);
  assert.equal(newsletterIssueForMonday('2027-11-01'), null);
});
