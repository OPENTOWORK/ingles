import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canonicalUrl, pageMetadata } from '../siteSeo.js';

describe('page metadata', () => {
  it('builds a canonical URL with trailing slash', () => {
    assert.equal(canonicalUrl('/'), 'https://www.dralo.es/');
    assert.equal(canonicalUrl('/contacto'), 'https://www.dralo.es/contacto/');
    assert.equal(canonicalUrl('/contacto/'), 'https://www.dralo.es/contacto/');
  });

  it('keeps title, description, canonical and og:url aligned', () => {
    const meta = pageMetadata({
      title: 'Contacto',
      description: 'Escríbenos.',
      path: '/contacto/',
    });
    assert.deepEqual(meta.title, { absolute: 'Contacto | Dralo' });
    assert.equal(meta.description, 'Escríbenos.');
    assert.equal(meta.alternates.canonical, 'https://www.dralo.es/contacto/');
    assert.equal(meta.openGraph.url, 'https://www.dralo.es/contacto/');
    assert.equal(meta.openGraph.title, 'Contacto | Dralo');
  });

  it('keeps an absolute title without adding a second suffix', () => {
    const meta = pageMetadata({
      absoluteTitle: 'Práctica B2 First online con corrección de Writing | Dralo',
      description: 'Home.',
      path: '/',
    });
    assert.deepEqual(meta.title, {
      absolute: 'Práctica B2 First online con corrección de Writing | Dralo',
    });
  });
});
