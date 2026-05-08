/**
 * URL absoluta del sitio para archivos en `public/`.
 * Respeta `NEXT_PUBLIC_BASE_PATH` (next.config / export estático).
 */
export function sitePublicPath(path) {
  const bp = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${bp}${p}`;
}
