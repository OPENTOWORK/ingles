import { supabase } from '@/utils/supabaseClient';
import { withApiTrailingSlash } from '@/lib/staffBuzonClient';

/** Next.js usa `trailingSlash: true`; sin barra final el 308 puede romper Authorization. */
function withTrailingSlash(path = '') {
  return withApiTrailingSlash(path);
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

export async function staffTasksUploadFile(taskId, file) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Sesión no válida.');

  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(withTrailingSlash(`/api/coordinator/tasks/${taskId}/files`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload?.error || 'No se pudo subir el archivo.');
  return payload.file;
}

export async function staffTasksDownloadFile(taskId, file) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Sesión no válida.');

  const res = await fetch(withTrailingSlash(`/api/coordinator/tasks/${taskId}/files/${file.id}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.error || 'No se pudo descargar el archivo.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.nombre || 'archivo';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
