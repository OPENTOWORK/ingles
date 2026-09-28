import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  fallbackJourneyFromVisit,
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
});
