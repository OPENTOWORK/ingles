import { existsSync, readFileSync } from 'fs';
import path from 'path';
export {
  SPEAKING_B2_LAN_COOKIE,
  SPEAKING_B2_LAN_QUERY,
  hostFromRequest,
  hostnameFromHost,
  isSpeakingB2HttpsRequest,
  isSpeakingB2LoopbackHost,
  isSpeakingB2LoopbackRequest,
} from './lan-access-edge.js';
import {
  SPEAKING_B2_LAN_COOKIE,
  isSpeakingB2HttpsRequest,
  isSpeakingB2LoopbackRequest,
} from './lan-access-edge.js';

export const SPEAKING_B2_LAN_KEY_PATH = path.join(process.cwd(), 'local/speaking-b2-lan/access.key');

export function readSpeakingB2LanCookie(request) {
  if (request.cookies?.get) {
    return String(request.cookies.get(SPEAKING_B2_LAN_COOKIE)?.value || '');
  }
  const raw = String(request.headers?.get?.('cookie') || '');
  const match = raw.match(new RegExp(`(?:^|; )${SPEAKING_B2_LAN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function readSpeakingB2LanKey() {
  const fromEnv = String(process.env.SPEAKING_B2_LAN_ACCESS_KEY || '').trim();
  if (fromEnv) return fromEnv;
  if (!existsSync(SPEAKING_B2_LAN_KEY_PATH)) return '';
  try {
    return readFileSync(SPEAKING_B2_LAN_KEY_PATH, 'utf8').trim();
  } catch {
    return '';
  }
}

export function speakingB2LanCookieMatches(request, key = readSpeakingB2LanKey()) {
  if (!key) return false;
  return readSpeakingB2LanCookie(request) === key;
}

export function allowSpeakingB2DevSurface(request) {
  return isSpeakingB2LoopbackRequest(request);
}

export function isSpeakingB2DevLanGateActive(env = process.env) {
  const nodeEnv = env.nodeEnv || env.NODE_ENV;
  const vercel = env.vercel || env.VERCEL;
  return nodeEnv === 'development' && vercel !== '1';
}

export function allowSpeakingB2LanRequest(request, env = process.env) {
  if (isSpeakingB2LoopbackRequest(request)) return { ok: true, loopback: true };
  if (!isSpeakingB2DevLanGateActive(env)) return { ok: true, loopback: false, published: true };
  if (!isSpeakingB2HttpsRequest(request)) {
    return { ok: false, code: 'HTTPS_REQUIRED' };
  }
  const key = readSpeakingB2LanKey();
  if (!key) return { ok: false, code: 'LAN_GATE_UNCONFIGURED' };
  if (!speakingB2LanCookieMatches(request, key)) return { ok: false, code: 'LAN_GATE' };
  return { ok: true, loopback: false };
}

