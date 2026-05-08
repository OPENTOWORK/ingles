function normalizePath(path) {
  const raw = String(path || '').trim();
  if (!raw) return '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
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
