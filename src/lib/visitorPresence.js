export const VISITOR_STORAGE_KEY = 'dralo_visitor_id';
export const VISITOR_ID_PATTERN = /^vis_[a-f0-9]{32}$/;

export function isTrackedPublicPath(pathname) {
  const path = String(pathname || '').split('?')[0] || '/';
  return !/^\/(admin|teacher|coordinador|informatico|api)(\/|$)/.test(path);
}

export function readStoredVisitorId() {
  if (typeof window === 'undefined') return null;
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    return VISITOR_ID_PATTERN.test(existing || '') ? existing : null;
  } catch {
    return null;
  }
}

export function readOrCreateVisitorId() {
  const existing = readStoredVisitorId();
  if (existing) return existing;
  if (typeof window === 'undefined') return null;
  try {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    const visitorId = `vis_${[...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
    window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    return visitorId;
  } catch {
    return null;
  }
}
