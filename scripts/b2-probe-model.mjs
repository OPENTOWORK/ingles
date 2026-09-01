/**
 * Read-only: check which Chat Completions parameters a model accepts.
 *
 * The exam generator sends `temperature` and `max_tokens`; newer model families reject
 * those, and the generator swallows the API error as a null payload, so a model that is
 * simply mis-parameterised looks indistinguishable from a model that generates badly.
 *
 * Usage: node scripts/b2-probe-model.mjs gpt-5.4 gpt-4.1
 */
import { loadEnvLocal } from './load-env-local.mjs';

const models = process.argv.slice(2);
if (!models.length) {
  console.error('Usage: b2-probe-model.mjs <model> [model...]');
  process.exit(1);
}

const env = loadEnvLocal();
const key = env.OPENAI_API_KEY;
if (!key) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const VARIANTS = [
  { label: 'temperature + max_tokens (what the generator sends today)', temperature: 0.8, max_tokens: 60 },
  { label: 'temperature + max_completion_tokens', temperature: 0.8, max_completion_tokens: 60 },
  { label: 'max_completion_tokens only (no temperature)', max_completion_tokens: 60 },
];

for (const model of models) {
  console.log(`\n=== ${model}`);
  for (const variant of VARIANTS) {
    const { label, ...params } = variant;
    const body = {
      model,
      messages: [{ role: 'user', content: 'Reply with the JSON object {"ok":true} and nothing else.' }],
      response_format: { type: 'json_object' },
      ...params,
    };
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.error) {
      console.log(`  [${res.status}] ${label}`);
      console.log(`        ${json.error.message}`);
    } else {
      const content = json.choices?.[0]?.message?.content ?? '';
      console.log(`  [ok]  ${label} -> ${JSON.stringify(content)}`);
    }
  }
}
