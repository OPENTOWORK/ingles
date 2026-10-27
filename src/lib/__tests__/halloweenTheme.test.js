import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {
  HALLOWEEN_BOOT_SCRIPT,
  HALLOWEEN_CLASS,
  HALLOWEEN_ENDS_AT,
  isHalloweenActive,
  isHalloweenThemedPath,
} from '@/lib/halloweenTheme';

const at = (iso) => Date.parse(iso);

function bootAddsClass(now, pathname) {
  const classes = new Set();
  vm.runInNewContext(HALLOWEEN_BOOT_SCRIPT, {
    Date: { now: () => now },
    location: { pathname },
    document: { documentElement: { classList: { add: (name) => classes.add(name) } } },
  });
  return classes.has(HALLOWEEN_CLASS);
}

test('Halloween ends when November 1 ends in Madrid', () => {
  assert.equal(HALLOWEEN_ENDS_AT, at('2026-11-01T23:00:00.000Z'));
  assert.equal(isHalloweenActive(at('2026-10-27T12:00:00+01:00')), true);
  assert.equal(isHalloweenActive(at('2026-10-31T21:00:00+01:00')), true);
  assert.equal(isHalloweenActive(new Date('2026-11-01T23:59:59.999+01:00')), true);
  assert.equal(isHalloweenActive(at('2026-11-02T00:00:00+01:00')), false);
  assert.equal(isHalloweenActive(at('2026-11-15T10:00:00+01:00')), false);
  assert.equal(isHalloweenActive(at('2026-10-26T23:59:59+01:00')), false);
});

test('ad landings and their A/B variants stay undecorated', () => {
  for (const path of ['/campana', '/campana/', '/campana/a/', '/preparar-b2-cambridge/b/']) {
    assert.equal(isHalloweenThemedPath(path), false, path);
  }
  for (const path of ['/', '/blog/', '/exam-practice/b2/exam-mode/', '/campanas/']) {
    assert.equal(isHalloweenThemedPath(path), true, path);
  }
});

test('the head script follows the same dates and paths', () => {
  const during = at('2026-10-31T20:00:00+01:00');
  assert.equal(bootAddsClass(during, '/'), true);
  assert.equal(bootAddsClass(during, '/niveles/b2/'), true);
  assert.equal(bootAddsClass(during, '/campana/a/'), false);
  assert.equal(bootAddsClass(during, '/preparar-b2-cambridge'), false);
  assert.equal(bootAddsClass(HALLOWEEN_ENDS_AT - 1, '/'), true);
  assert.equal(bootAddsClass(HALLOWEEN_ENDS_AT, '/'), false);
});
