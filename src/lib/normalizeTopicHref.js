/**
 * Canonical /teoria/... path (no trailing slash).
 * next.config uses trailingSlash: true, so usePathname() often ends with /.
 */
export function normalizeTopicHref(href) {
  if (href == null || href === '') return '';
  let path = String(href).trim();
  if (path.startsWith('/teoria/')) {
    path = path.replace(/\/+$/, '') || path;
  }
  return path;
}
