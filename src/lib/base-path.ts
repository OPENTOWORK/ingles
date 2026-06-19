/** Matches `next.config.js` basePath for client-side API calls. */
export function withBasePath(path: string): string {
  const b = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  let p = path.startsWith('/') ? path : `/${path}`;
  // next.config.js uses trailingSlash: true — POST without a trailing slash gets a 308
  // redirect and some clients drop the request body (empty JSON on the API).
  if (!p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p.split('?')[0] ?? p)) {
    p = `${p}/`;
  }
  if (!b) return p;
  return `${b.replace(/\/$/, '')}${p}`;
}
