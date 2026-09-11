import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BLOG_CALLOUT_TEMPLATE,
  normalizeBlogContent,
  repairBlogCallouts,
  sanitizeBlogHtml,
} from '@/lib/blogContent.js';

describe('blog callout', () => {
  it('keeps blockquote callouts through sanitize', () => {
    const html =
      '<blockquote class="blog-callout"><p>El texto <strong>puede no decir directamente</strong> que una persona está insatisfecha.</p></blockquote>';
    const safe = sanitizeBlogHtml(html);
    assert.match(safe, /<blockquote class="blog-callout">/);
    assert.match(safe, /<strong>puede no decir directamente<\/strong>/);
  });

  it('repairs detached callout content wrappers', () => {
    const broken = '<div class="blog-callout__content"><p>Contenido destacado.</p></div>';
    const repaired = repairBlogCallouts(broken);
    assert.match(repaired, /<blockquote class="blog-callout">/);
    assert.match(repaired, /Contenido destacado/);
  });

  it('migrates legacy div callouts to blockquote', () => {
    const legacy = '<div class="blog-callout"><p>Texto legacy.</p></div>';
    const repaired = repairBlogCallouts(legacy);
    assert.doesNotMatch(repaired, /<div class="blog-callout">/);
    assert.match(repaired, /<blockquote class="blog-callout">/);
  });

  it('template uses blockquote shell', () => {
    assert.match(BLOG_CALLOUT_TEMPLATE, /<blockquote class="blog-callout">/);
  });

  it('normalizeBlogContent preserves repaired callouts', () => {
    const normalized = normalizeBlogContent(
      '<div class="blog-callout"><p>Hola destacado.</p></div>',
    );
    assert.match(normalized, /<blockquote class="blog-callout">/);
    assert.match(normalized, /Hola destacado/);
  });
});
