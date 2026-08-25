import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { supabase } from '@/utils/supabaseClient';

/**
 * Valida slot + cuota mensual antes de iniciar exam-mode.
 * @returns {Promise<{ allowed: boolean, code?: string, message?: string }>}
 */
export async function requestStartExamSession(examSlot, { resuming = false } = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    return { allowed: false, code: 'AUTH_REQUIRED', message: 'Inicia sesión para continuar.' };
  }

  const res = await fetch(buildClientApiUrl('/api/subscription/start-exam'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ examSlot, resuming }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      allowed: false,
      code: json.code || 'START_EXAM_DENIED',
      message: json.message || 'No puedes iniciar este examen con tu plan actual.',
      limit: json.limit,
      used: json.used,
    };
  }

  return { allowed: true, ...json };
}
