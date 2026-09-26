import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyTrafficSource,
  labelFromAcquisitionProfile,
  landingLabelFromPath,
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

describe('labelFromAcquisitionProfile', () => {
  it('reads stored keys', () => {
    assert.equal(labelFromAcquisitionProfile({ first_source: 'ai' }), 'IA');
    assert.equal(labelFromAcquisitionProfile({ first_source: 'google_ads' }), 'Anuncio Google');
    assert.equal(labelFromAcquisitionProfile(null), '—');
  });
});
