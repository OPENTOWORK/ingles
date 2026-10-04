import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  fallbackJourneyFromVisit,
  journeyTrail,
  summarizeLandingPass,
  mergeVisitorJourneySources,
  normalizeVisitPath,
  titleForVisitPath,
} from '@/lib/visitorJourney.js';

describe('visitorJourney', () => {
  it('normalizes landing URLs to a site path', () => {
    assert.equal(normalizeVisitPath('https://www.dralo.es/exam-practice/b2/'), '/exam-practice/b2');
    assert.equal(normalizeVisitPath('/training/level-1?x=1'), '/training/level-1?x=1');
  });

  it('uses a readable label for exam and campaign pages', () => {
    assert.equal(titleForVisitPath('/exam-practice/b2'), 'Exam Practice');
    assert.equal(titleForVisitPath('/preparar-b2-cambridge'), 'Landing B2');
  });

  it('falls back to landing page and total time when there is no page log', () => {
    const pages = fallbackJourneyFromVisit({
      landing: '/campana/',
      seenAt: '2026-09-28T08:00:00.000Z',
      seconds: 19,
    });
    assert.equal(pages.length, 1);
    assert.equal(pages[0].pageTitle, 'Landing B2');
    assert.equal(pages[0].durationSeconds, 19);
    assert.equal(pages[0].durationLabel, '19 s');
  });

  it('prefers stored pages and drops duplicate timestamps', () => {
    const pages = mergeVisitorJourneySources({
      visitorPages: [
        {
          id: 'a',
          path: '/exam-strategies',
          page_title: 'Exam Strategies',
          visited_at: '2026-09-28T08:01:00.000Z',
          duration_seconds: 40,
        },
      ],
      userPages: [
        {
          id: 'b',
          path: '/exam-strategies',
          page_title: 'Exam Strategies',
          visited_at: '2026-09-28T08:01:10.000Z',
          duration_seconds: 40,
        },
      ],
      fallback: [{ path: '/', visited_at: '2026-09-28T08:00:00.000Z', duration_seconds: 99 }],
    });
    assert.equal(pages.length, 1);
    assert.equal(pages[0].id, 'a');
    assert.equal(pages[0].durationLabel, '40 s');
  });

  it('lists later pages after the landing and skips a repeated page', () => {
    const stops = journeyTrail(
      [
        { path: '/campana', page_title: 'Landing B2', visited_at: '2026-10-03T13:17:00.000Z' },
        { path: '/campana', page_title: 'Landing B2', visited_at: '2026-10-03T13:17:20.000Z' },
        { path: '/precios', visited_at: '2026-10-03T13:18:00.000Z' },
        { path: '/registro', visited_at: '2026-10-03T13:19:00.000Z' },
      ],
      '/campana',
    );
    assert.deepEqual(
      stops.map((stop) => stop.title),
      ['Landing B2', 'Precios', 'Registro'],
    );
  });

  it('separa quien se queda en la landing de quien abre otra página', () => {
    const summary = summarizeLandingPass([
      { landing: '/campana', stops: [{ title: 'Landing B2', path: '/campana' }] },
      { landing: '/preparar-b2-cambridge', pages: [{ path: '/registro', visited_at: '2026-10-03T13:00:00.000Z' }] },
      { landing: '/', stops: [{ title: 'Home', path: '/' }] },
    ]);
    assert.equal(summary.stayed, 1);
    assert.equal(summary.passed, 1);
    assert.equal(summary.total, 2);
    assert.equal(summary.stayedRate, 50);
    assert.equal(summary.passedRate, 50);
    assert.deepEqual(summary.destinations, [{ name: 'Registro', total: 1 }]);
  });

  it('cuenta cada sección una vez por visita, de la más visitada a la menos', () => {
    const summary = summarizeLandingPass([
      {
        landing: '/campana',
        stops: [
          { title: 'Landing B2', path: '/campana' },
          { title: 'Precios', path: '/precios' },
          { title: 'Registro', path: '/registro' },
        ],
      },
      {
        landing: '/campana',
        stops: [
          { title: 'Landing B2', path: '/campana' },
          { title: 'Precios', path: '/precios' },
          { title: 'Precios', path: '/pricing' },
        ],
      },
    ]);
    assert.deepEqual(summary.destinations, [
      { name: 'Precios', total: 2 },
      { name: 'Registro', total: 1 },
    ]);
  });
});
