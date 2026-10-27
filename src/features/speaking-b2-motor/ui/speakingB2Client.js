export function speakingB2Headers(accessToken, extra = {}) {
  const headers = { ...extra };
  if (accessToken) headers['x-speaking-session'] = accessToken;
  return headers;
}

export async function speakingB2Json(url, { accessToken, body, method = 'POST' } = {}) {
  const res = await fetch(url, {
    method,
    headers: speakingB2Headers(accessToken, { 'Content-Type': 'application/json' }),
    body: body == null ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}
