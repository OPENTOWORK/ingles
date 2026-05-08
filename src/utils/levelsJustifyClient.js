import { buildClientApiUrl, getStaticApiHint } from '@/utils/clientApiUrl';

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<string>}
 */
export async function postLevelsAnswerJustification(body) {
  const externalBaseConfigured = Boolean(
    String(process.env.NEXT_PUBLIC_AI_API_BASE_URL || '').trim(),
  );
  const res = await fetch(buildClientApiUrl('/api/levels/answer-justify/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint =
      !externalBaseConfigured && (res.status === 404 || res.status === 405)
        ? ` ${getStaticApiHint()}`
        : '';
    throw new Error((data.error || res.statusText || 'Error') + hint);
  }
  return typeof data.justification === 'string' ? data.justification : '';
}
