/** Next.js usa `trailingSlash: true`; sin barra final el 308 puede romper POST/Authorization. */
export function withApiTrailingSlash(path = '') {
  const [base, query = ''] = path.split('?');
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return query ? `${normalized}?${query}` : normalized;
}

export async function buzonApiRequest(path, { method = 'GET', body, token }) {
  const response = await fetch(withApiTrailingSlash(path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo completar la operación.');
  }
  return payload;
}

export async function buzonUploadRequest(path, { token, formData }) {
  const response = await fetch(withApiTrailingSlash(path), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo subir el archivo.');
  }
  return payload;
}
