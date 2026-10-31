import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSiteReviewInviteEmail, checkSiteReview, siteReviewPageUrl } from '@/lib/siteReviews';

test('a review needs a name, a short text and between 1 and 5 stars', () => {
  const ok = checkSiteReview({
    name: '  José  ',
    text: 'Me ha servido para practicar el writing con calma.',
    stars: 5,
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.review.name, 'José');
  assert.equal(ok.review.stars, 5);
  assert.equal(ok.review.initial, 'J');

  assert.match(checkSiteReview({ name: 'A', text: 'Me ha servido bastante.', stars: 5 }).error, /nombre/);
  assert.match(
    checkSiteReview({ name: 'Ana', text: 'Muy corta', stars: 4 }).error,
    /12 y 400/,
  );
  assert.match(checkSiteReview({ name: 'Ana', text: 'Me ha servido bastante.', stars: 0 }).error, /estrellas/);
  assert.match(
    checkSiteReview({ name: 'Ana', text: 'Mira https://example.com ahora mismo', stars: 4 }).error,
    /enlace/,
  );
});

test('the honeypot accepts the post without publishing a review', () => {
  const trapped = checkSiteReview({
    name: 'Ana',
    text: 'Me ha servido bastante.',
    stars: 5,
    company: 'spam',
  });
  assert.equal(trapped.ok, true);
  assert.equal(trapped.honeypot, true);
  assert.equal(trapped.review, undefined);
});

test('the review invite links to the review page and stays factual', () => {
  const message = buildSiteReviewInviteEmail('https://www.dralo.es');
  assert.equal(message.subject, '¿Nos dejas tu reseña en Dralo?');
  assert.equal(message.ctaLabel, 'Dejar mi reseña');
  assert.equal(siteReviewPageUrl('https://www.dralo.es'), 'https://www.dralo.es/resena/');
  assert.match(message.text, /https:\/\/www\.dralo\.es\/resena\//);
  assert.match(message.text, /Cada cuenta puede dejar una/);
  assert.equal(/excelente|increíble|la mejor/i.test(message.text), false);
});
