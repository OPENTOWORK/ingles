/** Matches `next.config.js` basePath for client-side API calls. */
export function withBasePath(path: string): string {
  const b = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!b) return p;
  return `${b.replace(/\/$/, '')}${p}`;
}
