import { supabase } from '@/utils/supabaseClient';

/** Next.js usa `trailingSlash: true`; sin barra final el 308 puede romper Authorization. */
function withTrailingSlash(path = '') {
  const [base, query = ''] = path.split('?');
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return query ? `${normalized}?${query}` : normalized;
}

export async function staffTasksFetch(path, options = {}, { soft = false } = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    if (soft) return { error: 'Sesión no válida.' };
    throw new Error('Sesión no válida.');
  }
  const res = await fetch(withTrailingSlash(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (soft) return { ...payload, error: payload?.error || 'Error en la petición.' };
    throw new Error(payload?.error || 'Error en la petición.');
  }
  return payload;
}
