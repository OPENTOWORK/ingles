import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';
import { isPublicPath } from '@/utils/publicRoutes';

const require = createRequire(import.meta.url);
const { tryToParsePath } = require('next/dist/lib/try-to-parse-path');

const ROOT = path.resolve(process.cwd());
const IDENTIFIER = /^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/;
const PUBLIC_URL = 'https://www.dralo.es/llms.txt';

function readManifest(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  assert.equal(raw.trimStart().startsWith('<'), false);
  return JSON.parse(raw);
}

function assertArdManifest(manifest) {
  assert.equal(Array.isArray(manifest.entries), true);
  assert.ok(manifest.entries.length > 0);
  const identifiers = new Set();
  for (const entry of manifest.entries) {
    assert.equal(typeof entry.identifier, 'string');
    assert.match(entry.identifier, IDENTIFIER);
    assert.equal(identifiers.has(entry.identifier), false);
    identifiers.add(entry.identifier);
    assert.equal(typeof entry.displayName, 'string');
    assert.ok(entry.displayName.length > 0);
    assert.equal(typeof entry.type, 'string');
    assert.ok(entry.type.length > 0);
    const hasUrl = typeof entry.url === 'string';
    const hasData = entry.data != null;
    assert.equal(hasUrl !== hasData, true);
    if (hasUrl) {
      assert.equal(entry.url, PUBLIC_URL);
    }
    assert.equal(Array.isArray(entry.representativeQueries), true);
    assert.ok(entry.representativeQueries.length >= 2);
    assert.ok(entry.representativeQueries.length <= 5);
    for (const query of entry.representativeQueries) {
      assert.equal(typeof query, 'string');
      assert.ok(query.trim().length > 0);
    }
  }
}

test('ai-catalog.json is an ARD manifest for the public llms.txt', () => {
  const manifest = readManifest('public/.well-known/ai-catalog.json');
  assertArdManifest(manifest);
  assert.equal(fs.existsSync(path.join(ROOT, 'public/llms.txt')), true);
});

test('ard.json publishes the same public catalog entry', () => {
  const catalog = readManifest('public/.well-known/ai-catalog.json');
  const ard = readManifest('public/.well-known/ard.json');
  assertArdManifest(ard);
  assert.deepEqual(ard, catalog);
});

function compiledMiddlewarePattern() {
  const source = fs.readFileSync(path.join(ROOT, 'src/middleware.ts'), 'utf8');
  const literal = source.match(/matcher:\s*\[\s*('(?:\\'|[^'])*')/)?.[1];
  assert.equal(typeof literal, 'string');
  const matcher = Function(`"use strict"; return ${literal}`)();
  const wrapped = `/:nextData(_next/data/[^/]{1,})?${matcher}(.json)?`;
  const parsed = tryToParsePath(wrapped);
  assert.equal(parsed.error, undefined);
  return { source, pattern: new RegExp(parsed.regexStr) };
}

test('discovery paths stay outside the login middleware', () => {
  const { source, pattern } = compiledMiddlewarePattern();
  const manifestReturn = source.indexOf('discoveryManifestResponse(pathname)');
  const loginRedirect = source.indexOf("loginUrl.pathname = '/login'");
  assert.ok(manifestReturn > -1);
  assert.ok(loginRedirect > manifestReturn);
  for (const catalogPath of [
    '/.well-known/ai-catalog.json',
    '/.well-known/ai-catalog.json/',
    '/.well-known/ard.json',
    '/.well-known/ard.json/',
  ]) {
    assert.equal(pattern.test(catalogPath), false, catalogPath);
    assert.equal(isPublicPath(catalogPath), true, catalogPath);
  }
  assert.equal(pattern.test('/admin'), true);
  assert.equal(pattern.test('/login'), true);
  assert.equal(isPublicPath('/admin'), false);
  assert.equal(isPublicPath('/informatico'), false);
});
