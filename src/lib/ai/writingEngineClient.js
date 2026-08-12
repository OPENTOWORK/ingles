/**
 * Browser client for Writing Engine v3 (internal beta).
 * Cannot force the engine on — the server re-checks the flag and role allowlist.
 */
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { DraloAiError } from '@/lib/ai/draloAiClient';

export async function callWritingEngineV3Evaluate(payload) {
  const res = await fetch(buildClientApiUrl('/api/writing/evaluate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error === true || data?.success === false) {
    throw new DraloAiError(
      data.code || 'WRITING_V3_FAILED',
      data.message || data.error || `Writing v3 failed (${res.status})`,
      data,
    );
  }
  return data.result ?? data;
}
