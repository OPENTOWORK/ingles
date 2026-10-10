import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AB_CTA_LABEL,
  CAMPAIGN_FAQ,
  CONDITION_SUMMARY,
  PAPERS,
  PLUS_HIGHLIGHTS,
  buildRegisterHref,
  campaignMetadata,
  guideMetadata,
  guideToCampaignHref,
  isAbExperimentPath,
  publicExperimentCopy,
  readAttributionFromSearch,
} from '../abExperiment.js';

describe('ab experiment routes and attribution', () => {
  it('keeps direct variant urls and guide-to-campaign attribution', () => {
    assert.equal(isAbExperimentPath('/campana/a/'), true);
    assert.equal(isAbExperimentPath('/preparar-b2-cambridge/b'), true);
    assert.equal(isAbExperimentPath('/campana/'), false);
    assert.equal(guideToCampaignHref('a'), '/campana/a/?ab_source=b2-guide');
    assert.equal(guideToCampaignHref('b'), '/campana/b/?ab_source=b2-guide');
    assert.equal(
      buildRegisterHref({ pageType: 'campaign', variant: 'A', source: 'b2-guide' }),
      '/login/?ab_page=campaign&ab_variant=a&ab_source=b2-guide',
    );
    assert.equal(
      buildRegisterHref({
        pageType: 'campaign',
        variant: 'a',
        source: 'direct',
        searchParams: { utm_source: 'google', gclid: 'click-1', ab_source: 'ignored' },
      }),
      '/login/?ab_page=campaign&ab_variant=a&ab_source=direct&utm_source=google&gclid=click-1',
    );
    assert.deepEqual(readAttributionFromSearch('?ab_page=campaign&ab_variant=b&ab_source=b2-guide'), {
      pageType: 'campaign',
      variant: 'b',
      source: 'b2-guide',
    });
  });

  it('noindexes guide variants and points their canonical at the main guide', () => {
    const meta = guideMetadata('a');
    assert.equal(meta.robots.index, false);
    assert.equal(meta.robots.follow, true);
    assert.equal(meta.alternates.canonical, 'https://www.dralo.es/preparar-b2-cambridge/');
    assert.equal(meta.openGraph.url, 'https://www.dralo.es/preparar-b2-cambridge/a/');
    assert.equal(campaignMetadata('b').openGraph.url, 'https://www.dralo.es/campana/b/');
    assert.notEqual(campaignMetadata('a').openGraph.url, 'https://www.dralo.es/');
    assert.equal(campaignMetadata('a').robots.index, false);
  });

  it('keeps four papers, the offer condition and a single campaign CTA', () => {
    assert.deepEqual(
      PAPERS.map((paper) => paper.weight),
      ['40 %', '20 %', '20 %', '20 %'],
    );
    assert.equal(PAPERS[0].name, 'Reading and Use of English');
    assert.match(CONDITION_SUMMARY, /30 días/);
    assert.match(CONDITION_SUMMARY, /formulario/);
    assert.equal(AB_CTA_LABEL, 'Quiero mi plaza gratis');
    assert.ok(PLUS_HIGHLIGHTS.some((item) => /Writing Correction/i.test(item)));
    assert.ok(CAMPAIGN_FAQ.some((item) => item.q.includes('tarjeta')));
  });

  it('does not publish forbidden claims', () => {
    const copy = publicExperimentCopy();
    assert.equal(/sin condiciones/i.test(copy), false);
    assert.equal(/sin sorpresas/i.test(copy), false);
    assert.equal(/cancelas cuando quieras/i.test(copy), false);
    assert.equal(/cinco pruebas/i.test(copy), false);
    assert.equal(/160 a 190/i.test(copy), false);
    assert.equal(/60 %/.test(copy), false);
  });
});
