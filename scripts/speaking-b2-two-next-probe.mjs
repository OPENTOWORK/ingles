import { readSpeakingB2TestTargetFromEnv } from '../src/features/speaking-b2-motor/services/test-target-guard.js';

const target = readSpeakingB2TestTargetFromEnv();
if (!target.ok) {
  console.log(JSON.stringify({ ok: false, probed: false, code: target.code }, null, 2));
  process.exit(2);
}

const ports = [
  process.env.SPEAKING_B2_NEXT_PORT_A || '3011',
  process.env.SPEAKING_B2_NEXT_PORT_B || '3012',
];

async function probe(port) {
  const base = `http://127.0.0.1:${port}`;
  const started = Date.now();
  try {
    const res = await fetch(`${base}/api/speaking-b2/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ examCode: 'SP-EX001' }),
    });
    const body = await res.json().catch(() => ({}));
    return {
      port,
      ok: res.status < 500,
      status: res.status,
      sessionId: body.sessionId || null,
      persisted: body.persisted ?? null,
      code: body.code || null,
      ms: Date.now() - started,
    };
  } catch (error) {
    return { port, ok: false, error: error.code || error.message, ms: Date.now() - started };
  }
}

const results = await Promise.all(ports.map(probe));
console.log(JSON.stringify({ ok: results.every((item) => item.ok), results }, null, 2));
if (!results.every((item) => item.ok)) process.exitCode = 1;
