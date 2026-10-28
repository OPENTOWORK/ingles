import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {
  HALLOWEEN_ENDS_AT,
  SITE_THEME_BOOT_SCRIPT,
  SITE_THEME_STORAGE_KEY,
  activeSiteTheme,
  isSiteThemedPath,
  parseSiteThemeState,
  resolveSiteTheme,
} from '@/lib/siteTheme';

const at = (iso) => Date.parse(iso);

function bootClasses(now, pathname, stored) {
  const classes = new Set();
  vm.runInNewContext(SITE_THEME_BOOT_SCRIPT, {
    Date: { now: () => now },
    location: { pathname },
    localStorage: { getItem: (key) => (key === SITE_THEME_STORAGE_KEY ? stored : null) },
    document: { documentElement: { classList: { add: (name) => classes.add(name) } } },
  });
  return [...classes];
}

function expectedClasses(now, pathname, stored) {
  if (!isSiteThemedPath(pathname)) return [];
  let cached = null;
  try {
    cached = parseSiteThemeState(JSON.parse(stored));
  } catch {
    cached = null;
  }
  const theme = activeSiteTheme(cached || resolveSiteTheme(null, now), now);
  return theme === 'normal' ? [] : [`theme-${theme}`];
}

test('without a saved theme Halloween ends when November 1 ends in Madrid', () => {
  assert.equal(HALLOWEEN_ENDS_AT, at('2026-11-01T23:00:00.000Z'));
  assert.deepEqual(resolveSiteTheme(null, at('2026-10-31T21:00:00+01:00')), {
    theme: 'halloween',
    until: HALLOWEEN_ENDS_AT,
  });
  const lastSecond = resolveSiteTheme(null, at('2026-11-01T23:59:59+01:00'));
  assert.equal(activeSiteTheme(lastSecond, at('2026-11-01T23:59:59+01:00')), 'halloween');
  assert.equal(activeSiteTheme(lastSecond, HALLOWEEN_ENDS_AT), 'normal');
  assert.deepEqual(resolveSiteTheme(null, HALLOWEEN_ENDS_AT), { theme: 'normal', until: null });
  assert.deepEqual(resolveSiteTheme('fiesta', HALLOWEEN_ENDS_AT), { theme: 'normal', until: null });
});

test('a theme chosen by an admin has no end date', () => {
  const december = at('2026-12-20T10:00:00+01:00');
  assert.deepEqual(resolveSiteTheme('navidad', december), { theme: 'navidad', until: null });
  assert.deepEqual(resolveSiteTheme(' Halloween ', december), { theme: 'halloween', until: null });
  assert.deepEqual(resolveSiteTheme('normal', at('2026-10-30T10:00:00+01:00')), { theme: 'normal', until: null });
  assert.equal(activeSiteTheme(resolveSiteTheme('halloween', december), december), 'halloween');
});

test('only known themes are read back from the server or the browser', () => {
  assert.equal(parseSiteThemeState(null), null);
  assert.equal(parseSiteThemeState({ theme: 'carnaval' }), null);
  assert.deepEqual(parseSiteThemeState({ theme: 'navidad' }), { theme: 'navidad', until: null });
  assert.deepEqual(parseSiteThemeState({ theme: 'halloween', until: String(HALLOWEEN_ENDS_AT) }), {
    theme: 'halloween',
    until: HALLOWEEN_ENDS_AT,
  });
  assert.deepEqual(parseSiteThemeState({ theme: 'halloween', until: 'luego' }), { theme: 'halloween', until: null });
});

test('ad landings and their A/B variants stay undecorated', () => {
  for (const path of ['/campana', '/campana/', '/campana/a/', '/preparar-b2-cambridge/b/']) {
    assert.equal(isSiteThemedPath(path), false, path);
  }
  for (const path of ['/', '/blog/', '/exam-practice/b2/exam-mode/', '/campanas/']) {
    assert.equal(isSiteThemedPath(path), true, path);
  }
});

test('the head script paints the same theme as the app', () => {
  const stored = [
    null,
    JSON.stringify({ theme: 'navidad', until: null }),
    JSON.stringify({ theme: 'normal', until: null }),
    JSON.stringify({ theme: 'halloween', until: HALLOWEEN_ENDS_AT }),
    JSON.stringify({ theme: 'halloween', until: null }),
    JSON.stringify({ theme: 'carnaval' }),
    '{roto',
  ];
  const times = [at('2026-10-31T20:00:00+01:00'), HALLOWEEN_ENDS_AT - 1, HALLOWEEN_ENDS_AT, at('2026-12-24T18:00:00+01:00')];
  const paths = ['/', '/niveles/b2/', '/campana/a/', '/preparar-b2-cambridge'];

  for (const value of stored) {
    for (const now of times) {
      for (const pathname of paths) {
        assert.deepEqual(
          bootClasses(now, pathname, value),
          expectedClasses(now, pathname, value),
          `${value} · ${new Date(now).toISOString()} · ${pathname}`,
        );
      }
    }
  }

  assert.deepEqual(bootClasses(HALLOWEEN_ENDS_AT - 1, '/', null), ['theme-halloween']);
  assert.deepEqual(bootClasses(HALLOWEEN_ENDS_AT, '/', null), []);
  assert.deepEqual(bootClasses(HALLOWEEN_ENDS_AT, '/', JSON.stringify({ theme: 'navidad', until: null })), [
    'theme-navidad',
  ]);
});
