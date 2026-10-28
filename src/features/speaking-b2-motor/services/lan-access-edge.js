export const SPEAKING_B2_LAN_COOKIE = 'dralo_speaking_lan';
export const SPEAKING_B2_LAN_QUERY = 'lan';

export function hostFromRequest(request) {
  const forwarded = String(request.headers?.get?.('x-forwarded-host') || '')
    .split(',')[0]
    .trim();
  return (forwarded || String(request.headers?.get?.('host') || '')).toLowerCase();
}

export function hostnameFromHost(host) {
  return String(host || '')
    .replace(/^\[|\]$/g, '')
    .split(':')[0]
    .toLowerCase();
}

export function isSpeakingB2LoopbackHost(host) {
  const name = hostnameFromHost(host);
  return name === 'localhost' || name === '127.0.0.1' || name === '::1';
}

export function isSpeakingB2LoopbackRequest(request) {
  return isSpeakingB2LoopbackHost(hostFromRequest(request));
}

export function isSpeakingB2HttpsRequest(request) {
  const forwarded = String(request.headers?.get?.('x-forwarded-proto') || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (forwarded) return forwarded === 'https';
  const url = request.nextUrl?.protocol || request.url || '';
  return String(url).startsWith('https:');
}
