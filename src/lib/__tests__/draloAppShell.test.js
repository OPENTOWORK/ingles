import test from 'node:test';
import assert from 'node:assert/strict';
import { DRALO_APP_BOOT_SCRIPT, isDraloAppRequest, shouldOpenAppAtLogin } from '@/lib/draloAppShell';
import { appendItPreviewParams } from '@/lib/itPreviewRole';

test('detects the native app and the app preview', () => {
  assert.equal(isDraloAppRequest({ userAgent: 'Mozilla DraloApp', search: '' }), true);
  assert.equal(isDraloAppRequest({ userAgent: 'Mozilla', search: '?itPreviewApp=1' }), true);
  assert.equal(isDraloAppRequest({ userAgent: 'Mozilla', search: '' }), false);
});

test('the app preview can target Apple or Android', () => {
  const apple = appendItPreviewParams('/login', { roleId: 'student', app: true, platform: 'ios' });
  const android = appendItPreviewParams('/login', { roleId: 'student', app: true, platform: 'android' });
  assert.match(apple, /itPreviewPlatform=ios/);
  assert.match(android, /itPreviewPlatform=android/);
  assert.match(DRALO_APP_BOOT_SCRIPT, /itPreviewPlatform/);
  assert.match(DRALO_APP_BOOT_SCRIPT, /dralo-native-/);
});

test('the app home opens on login until a session is kept', () => {
  assert.equal(shouldOpenAppAtLogin({ path: '/', signedIn: false }), true);
  assert.equal(shouldOpenAppAtLogin({ path: '/', signedIn: true, remember: '1' }), false);
  assert.equal(shouldOpenAppAtLogin({ path: '/', signedIn: true, remember: '0', run: null }), true);
  assert.equal(shouldOpenAppAtLogin({ path: '/', signedIn: true, remember: '0', run: '1' }), false);
  assert.equal(shouldOpenAppAtLogin({ path: '/login', signedIn: false }), false);
});
