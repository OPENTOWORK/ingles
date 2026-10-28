import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  allowSpeakingB2DevSurface,
  allowSpeakingB2LanRequest,
  hostFromRequest,
  isSpeakingB2DevLanGateActive,
  isSpeakingB2HttpsRequest,
  isSpeakingB2LoopbackHost,
  speakingB2LanCookieMatches,
  SPEAKING_B2_LAN_COOKIE,
} from '../services/lan-access.js';

function fakeRequest({ host = 'localhost:3000', proto = 'http', cookie = '', forwardedHost = '' } = {}) {
  const headers = new Map(
    [
      ['host', host],
      ['x-forwarded-proto', proto],
      ['x-forwarded-host', forwardedHost],
      ['cookie', cookie],
    ].filter(([, value]) => value),
  );
  return {
    headers: { get: (name) => headers.get(String(name).toLowerCase()) || null },
    cookies: {
      get: (name) => {
        const raw = headers.get('cookie') || '';
        const match = raw.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
        return match ? { value: decodeURIComponent(match[1]) } : undefined;
      },
    },
  };
}

describe('speaking B2 LAN test access', () => {
  it('treats only loopback as the local development surface', () => {
    assert.equal(isSpeakingB2LoopbackHost('localhost:3000'), true);
    assert.equal(isSpeakingB2LoopbackHost('127.0.0.1:3000'), true);
    assert.equal(isSpeakingB2LoopbackHost('192.168.1.20:3443'), false);
    assert.equal(allowSpeakingB2DevSurface(fakeRequest({ host: 'localhost:3000' })), true);
    assert.equal(allowSpeakingB2DevSurface(fakeRequest({ host: '192.168.1.20:3443' })), false);
  });

  it('requires HTTPS and the LAN cookie off loopback in development', () => {
    assert.equal(isSpeakingB2DevLanGateActive({ NODE_ENV: 'development' }), true);
    assert.equal(isSpeakingB2DevLanGateActive({ NODE_ENV: 'production' }), false);
    assert.equal(isSpeakingB2HttpsRequest(fakeRequest({ host: '192.168.1.20:3443', proto: 'https' })), true);
    const previous = process.env.SPEAKING_B2_LAN_ACCESS_KEY;
    process.env.SPEAKING_B2_LAN_ACCESS_KEY = 'test-lan-key';
    try {
      const devEnv = { NODE_ENV: 'development' };
      assert.equal(
        allowSpeakingB2LanRequest(fakeRequest({ host: '192.168.1.20:3443', proto: 'http' }), devEnv).code,
        'HTTPS_REQUIRED',
      );
      assert.equal(
        allowSpeakingB2LanRequest(fakeRequest({ host: '192.168.1.20:3443', proto: 'https' }), devEnv).code,
        'LAN_GATE',
      );
      assert.equal(
        allowSpeakingB2LanRequest(
          fakeRequest({
            host: '192.168.1.20:3443',
            proto: 'https',
            cookie: `${SPEAKING_B2_LAN_COOKIE}=test-lan-key`,
          }),
          devEnv,
        ).ok,
        true,
      );
      assert.equal(
        speakingB2LanCookieMatches(
          fakeRequest({ cookie: `${SPEAKING_B2_LAN_COOKIE}=test-lan-key` }),
          'test-lan-key',
        ),
        true,
      );
    } finally {
      if (previous == null) delete process.env.SPEAKING_B2_LAN_ACCESS_KEY;
      else process.env.SPEAKING_B2_LAN_ACCESS_KEY = previous;
    }
  });

  it('does not publish fixture or eval routes off loopback', () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
    const files = [
      'src/app/api/speaking-b2/fixtures/route.js',
      'src/app/api/speaking-b2/fixtures/human/route.js',
      'src/app/api/speaking-b2/fixtures/text-eval/route.js',
      'src/app/api/speaking-b2/fixtures/human-eval/route.js',
    ];
    for (const file of files) {
      const source = readFileSync(path.join(root, file), 'utf8');
      assert.match(source, /speakingB2DevSurfaceGuardResponse/);
    }
    assert.equal(hostFromRequest(fakeRequest({ forwardedHost: '10.0.0.8:3443', host: 'localhost:3000' })), '10.0.0.8:3443');
  });
});
