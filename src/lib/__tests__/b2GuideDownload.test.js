import assert from 'node:assert/strict';
import test from 'node:test';
import {
  B2_GUIDE_PDF_PATH,
  b2GuidePdfUrl,
  buildB2GuideDownloadEmail,
  guideConsentError,
  normalizeGuideEmail,
} from '@/lib/b2GuideDownload';
import { buildB2GuideRequestPatch } from '@/lib/b2GuideRequests';

test('guide email only accepts a normal address and points at the PDF', () => {
  assert.equal(normalizeGuideEmail('  Ana@Dralo.es '), 'ana@dralo.es');
  assert.equal(normalizeGuideEmail('no-es-un-email'), '');
  assert.equal(normalizeGuideEmail('ana@dralo.es\nBcc: x'), '');

  const message = buildB2GuideDownloadEmail('ana@dralo.es', 'https://www.dralo.es');
  const pdf = b2GuidePdfUrl('https://www.dralo.es');
  assert.equal(message.to, 'ana@dralo.es');
  assert.equal(message.subject, 'Tu guía gratuita del B2 First');
  assert.equal(pdf, `https://www.dralo.es${B2_GUIDE_PDF_PATH}`);
  assert.match(message.text, new RegExp(pdf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(message.text, /exam-reading-and-use-of-english\/\?examen=1/);
  assert.match(message.html, /Descargar la guía del B2 First/);
  assert.match(message.html, /Probar un ejercicio gratis/);
  assert.match(message.html, /href="https:\/\/www\.dralo\.es\/exam-practice\/b2\/exam-reading-and-use-of-english\/\?examen=1"/);
  assert.equal(message.html.includes('ana@dralo.es'), false);
});

test('the guide form requires terms and data protection, not the marketing check', () => {
  assert.equal(guideConsentError({ acceptedTerms: true, acceptedDataProtection: true }), '');
  assert.equal(
    guideConsentError({ acceptedTerms: true, acceptedDataProtection: true, acceptedMarketing: false }),
    '',
  );
  assert.match(guideConsentError({ acceptedTerms: true }), /protección de datos/);
  assert.match(guideConsentError({}), /protección de datos/);
});
