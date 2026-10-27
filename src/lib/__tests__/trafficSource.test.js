import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyTrafficSource,
  labelFromAcquisitionProfile,
  landingLabelFromPath,
  trafficSourceWithAd,
} from '@/lib/trafficSource.js';

describe('classifyTrafficSource', () => {
  it('detects Google organic search', () => {
    const result = classifyTrafficSource({
      referrer: 'https://www.google.com/search?q=dralo',
    });
    assert.equal(result.key, 'google');
    assert.equal(result.label, 'Google');
  });

  it('detects Google ads via gclid', () => {
    const result = classifyTrafficSource({
      landingPage: '/?gclid=abc123',
    });
    assert.equal(result.key, 'google_ads');
    assert.equal(result.label, 'Anuncio Google');
  });

  it('detects Instagram', () => {
    const result = classifyTrafficSource({
      referrer: 'https://www.instagram.com/',
    });
    assert.equal(result.label, 'Instagram');
  });

  it('detects Instagram ads from UTM', () => {
    const result = classifyTrafficSource({
      utmSource: 'instagram',
      utmMedium: 'paid_social',
    });
    assert.equal(result.key, 'instagram_ads');
    assert.equal(result.label, 'Anuncio Instagram');
  });

  it('detects ChatGPT as IA', () => {
    const result = classifyTrafficSource({
      referrer: 'https://chatgpt.com/',
    });
    assert.equal(result.key, 'ai');
    assert.equal(result.label, 'IA');
  });

  it('uses directo when there is no referrer or UTM', () => {
    const result = classifyTrafficSource({});
    assert.equal(result.key, 'direct');
    assert.equal(result.label, 'Directo');
  });
});

describe('landingLabelFromPath', () => {
  it('names main Dralo sections', () => {
    assert.equal(landingLabelFromPath('/'), 'Home');
    assert.equal(landingLabelFromPath('/registro?ref=abc'), 'Registro');
    assert.equal(landingLabelFromPath('/exam-practice/b2/quiz-game'), 'Quiz game');
    assert.equal(landingLabelFromPath('/exam-practice/b2/exam-reading-and-use-of-english'), 'Reading and Use of English');
    assert.equal(landingLabelFromPath('/training/12'), 'Training');
    assert.equal(landingLabelFromPath('/preparar-b2-cambridge'), 'Landing B2');
  });
});

describe('trafficSourceWithAd', () => {
  it('names the Meta ad from utm_content', () => {
    const landing =
      '/?utm_source=instagram&utm_medium=organic_social&utm_campaign=lanzamiento_dralo_2026&utm_content=video_remarketing';
    assert.equal(trafficSourceWithAd('meta_ads', landing), 'Anuncio Meta · video remarketing');
  });

  it('decodes the conversion ad and marks sitelink placements', () => {
    assert.equal(
      trafficSourceWithAd(
        'meta_ads',
        '/?utm_source=instagram&utm_campaign=lanzamiento_dralo_2026&utm_content=campa%C3%B1a_conversion_meta',
      ),
      'Anuncio Meta · campaña conversion meta',
    );
    assert.equal(
      trafficSourceWithAd(
        'meta_ads',
        '/?utm_source=instagram-SiteLink&utm_content=video_remarketing',
      ),
      'Anuncio Meta · sitelink · video remarketing',
    );
  });

  it('keeps channels without an ad name', () => {
    assert.equal(trafficSourceWithAd('google', '/'), 'Google');
    assert.equal(trafficSourceWithAd('direct', ''), 'Directo');
    assert.equal(trafficSourceWithAd('', ''), 'Directo');
  });
});

describe('labelFromAcquisitionProfile', () => {
  it('reads stored keys', () => {
    assert.equal(labelFromAcquisitionProfile({ first_source: 'ai' }), 'IA');
    assert.equal(labelFromAcquisitionProfile({ first_source: 'google_ads' }), 'Anuncio Google');
    assert.equal(labelFromAcquisitionProfile(null), '—');
  });
});
