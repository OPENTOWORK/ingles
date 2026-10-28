import { supabase } from '@/utils/supabaseClient';

export function speakingB2Headers(accessToken, extra = {}) {
  const headers = { ...extra };
  if (accessToken) headers['x-speaking-session'] = accessToken;
  return headers;
}

export async function speakingB2AuthHeaders(accessToken, extra = {}) {
  const headers = speakingB2Headers(accessToken, extra);
  try {
    const { data } = await supabase.auth.getSession();
    const jwt = data?.session?.access_token;
    if (jwt) headers.Authorization = `Bearer ${jwt}`;
  } catch {
    /* guest or local fixture */
  }
  return headers;
}

export async function speakingB2Json(url, { accessToken, body, method = 'POST' } = {}) {
  const res = await fetch(url, {
    method,
    headers: await speakingB2AuthHeaders(accessToken, { 'Content-Type': 'application/json' }),
    body: body == null ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}
