function normalizePath(path) {
  const raw = String(path || '').trim();
  if (!raw) return '/';
  let normalized = raw.startsWith('/') ? raw : `/${raw}`;

  // Next.js trailingSlash: true — requests without a trailing slash 308-redirect.
  // That redirect drops Authorization headers, so admin GETs (with ?query) fail as 401
  // and look like "empty / FROM CODE" prompts even when Supabase has the row.
  const qIndex = normalized.indexOf('?');
  const pathname = qIndex >= 0 ? normalized.slice(0, qIndex) : normalized;
  const query = qIndex >= 0 ? normalized.slice(qIndex) : '';
  if (pathname.startsWith('/api/') && !pathname.endsWith('/')) {
    return `${pathname}/${query}`;
  }
  return normalized;
}

export function buildClientApiUrl(path) {
  const normalizedPath = normalizePath(path);
  const externalBase = String(process.env.NEXT_PUBLIC_AI_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '');

  if (externalBase) {
    return `${externalBase}${normalizedPath}`;
  }

  const basePath = String(process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  return `${basePath}${normalizedPath}`;
}

export function getStaticApiHint() {
  return 'Si usas build estática, configura NEXT_PUBLIC_AI_API_BASE_URL con la URL pública de tu backend (que sí tenga /api).';
}
