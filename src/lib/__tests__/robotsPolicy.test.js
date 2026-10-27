import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { PUBLIC_ROUTE_PREFIXES } from '@/utils/publicRoutes';
import {
  ROBOTS_SITEMAP_URL,
  buildRobotsPolicy,
  isPathAllowedByRobots,
  renderRobotsTxt,
} from '@/lib/robotsPolicy';
import { SITEMAP_PATHS, buildSitemapEntries, sitemapAbsoluteUrl } from '@/lib/sitemapPaths';

const ROOT = process.cwd();
const LINE = /^(User-Agent|Allow|Disallow|Sitemap): \S.*$/;
const AI_BOT_NAMES = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'Google-Extended',
  'GoogleOther',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'CCBot',
  'Bytespider',
  'Amazonbot',
];

const CRAWL_BLOCKED_PUBLIC_PREFIXES = new Set([
  '/login',
  '/reset-password',
  '/update-password',
  '/auth/callback',
  '/auth/confirm',
  '/founding/encuesta',
]);

test('production robots.txt is plain text, allows assets, and points at the real sitemap', () => {
  const text = renderRobotsTxt();
  assert.equal(text.includes('<'), false);
  assert.match(text, /^User-Agent: \*\r?\n/);
  assert.match(text, new RegExp(`Sitemap: ${ROBOTS_SITEMAP_URL.replace(/[.]/g, '\\.')}\\s*$`));
  assert.equal(ROBOTS_SITEMAP_URL, 'https://www.dralo.es/sitemap.xml');

  const lines = text.split(/\r?\n/).filter(Boolean);
  for (const line of lines) assert.match(line, LINE);

  const agents = lines.filter((line) => line.startsWith('User-Agent:')).map((line) => line.slice(12));
  assert.deepEqual(agents, ['*']);
  for (const bot of AI_BOT_NAMES) assert.equal(text.includes(bot), false);
  assert.equal(text.includes('Content-Signal'), false);
  assert.equal(text.includes('Crawl-delay'), false);

  assert.equal(fs.existsSync(path.join(ROOT, 'public/robots.txt')), false);
  assert.equal(fs.existsSync(path.join(ROOT, 'src/app/robots.ts')), true);
  const middleware = fs.readFileSync(path.join(ROOT, 'src/middleware.ts'), 'utf8');
  assert.match(middleware, /robots\.txt/);
  assert.match(middleware, /sitemap\.xml/);
});

test('public indexable URLs stay crawlable and private or auth URLs do not', () => {
  for (const prefix of PUBLIC_ROUTE_PREFIXES) {
    if (prefix === '/' || CRAWL_BLOCKED_PUBLIC_PREFIXES.has(prefix)) continue;
    assert.equal(isPathAllowedByRobots(prefix), true, prefix);
    assert.equal(isPathAllowedByRobots(`${prefix}/`), true, `${prefix}/`);
  }

  const allowed = [
    '/',
    '/blog/',
    '/blog/como-preparar-el-b2/',
    '/preparar-b2-cambridge/',
    '/preparar-b2-cambridge/a/',
    '/campana/',
    '/campana/b/',
    '/registro/',
    '/precios/',
    '/training/',
    '/exam-practice/b2/speaking/part-1/',
    '/exam-strategies/speaking/',
    '/speaking-lab/b2/',
    '/contact/',
    '/contacto/',
    '/_next/static/chunks/main.js',
    '/_next/static/css/app.css',
    '/_next/static/media/font.woff2',
    '/_next/image',
    '/favicon.ico',
    '/icons/icon.png',
    '/logo.svg',
    '/listening-preview/p02-part2.mp3',
    '/llms.txt',
    '/.well-known/ai-catalog.json',
    '/.well-known/ard.json',
    '/manifest.webmanifest',
    '/api/founding-member/slots/',
    '/api/blog/comments',
    '/api/dralo-ai/chat',
    '/api/levels/save-star',
    '/api/theory-exercises/',
    '/api/training/lives',
    '/api/contact/tickets',
    '/niveles/prueba-audio/',
  ];
  for (const urlPath of allowed) {
    assert.equal(isPathAllowedByRobots(urlPath), true, urlPath);
  }

  const blocked = [
    '/admin',
    '/admin/',
    '/admin/marketing/',
    '/teacher/',
    '/coordinador/',
    '/soporte/',
    '/informatico/',
    '/paneles/',
    '/tareas/',
    '/buzon/',
    '/centro-empresa/',
    '/clases-grupos/',
    '/plan-objetivos/',
    '/prueba-nivel/',
    '/profile/',
    '/perfil/',
    '/fix-page/',
    '/founding/',
    '/founding/encuesta/',
    '/auth/callback/',
    '/auth/confirm/',
    '/login',
    '/login/',
    '/reset-password/',
    '/update-password/',
    '/dralo-dev/writing-v3/',
    '/dralo-ai/',
    '/dralo-ai/speaking/',
    '/speaking/',
    '/api/admin/users/',
    '/api/auth/register',
    '/api/cron/founding-survey/',
    '/api/dralo/experience',
    '/api/dralo/experience/',
    '/api/marketing/events',
    '/api/founding-member/encuesta/token/',
    '/api/stripe/webhook/',
    '/api/site-assistant/chat',
    '/api/levels-progreso/',
    '/api/theory-exercise-progress/',
  ];
  for (const urlPath of blocked) {
    assert.equal(isPathAllowedByRobots(urlPath), false, urlPath);
  }
});

test('preview deployments disallow the whole host and omit the sitemap', () => {
  const policy = buildRobotsPolicy({ preview: true });
  assert.equal(policy.sitemap, undefined);
  assert.equal(isPathAllowedByRobots('/blog/', { preview: true }), false);
  assert.equal(isPathAllowedByRobots('/', { preview: true }), false);
  const text = renderRobotsTxt(policy);
  assert.match(text, /Disallow: \/\s*$/);
  assert.equal(text.includes('Sitemap:'), false);
});

test('sitemap lists only absolute indexable URLs that robots allows', () => {
  const entries = buildSitemapEntries(new Date('2026-10-21T00:00:00.000Z'));
  const urls = entries.map((entry) => entry.url);
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(urls.includes('https://www.dralo.es/dralo-ai/'), false);
  assert.equal(urls.includes('https://www.dralo.es/login/'), false);
  assert.equal(urls.includes('https://www.dralo.es/campana/'), false);
  assert.equal(urls.includes('https://www.dralo.es/contact/'), false);
  assert.ok(urls.includes('https://www.dralo.es/contacto/'));
  assert.ok(urls.includes('https://www.dralo.es/contacto/faq/'));
  assert.ok(urls.includes('https://www.dralo.es/'));
  assert.ok(urls.includes('https://www.dralo.es/sitemap.xml') === false);

  for (const entry of entries) {
    assert.match(entry.url, /^https:\/\/www\.dralo\.es\/?/);
    assert.equal(entry.url.includes('vercel.app'), false);
    const pathname = new URL(entry.url).pathname;
    assert.equal(isPathAllowedByRobots(pathname), true, entry.url);
    assert.ok(entry.priority >= 0 && entry.priority <= 1);
  }

  for (const sitemapPath of SITEMAP_PATHS) {
    assert.equal(urls.includes(sitemapAbsoluteUrl(sitemapPath)), true, sitemapPath);
  }
});
