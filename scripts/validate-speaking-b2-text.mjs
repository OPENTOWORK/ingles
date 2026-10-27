import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvLocal } from './load-env-local.mjs';
import { evaluateSpeakingB2TextSet } from '../src/features/speaking-b2-motor/fixtures/text-eval.js';

loadEnvLocal();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requested = process.argv[2] || 'both';

function cell(value) {
  return String(value ?? '')
    .replaceAll('|', '/')
    .replaceAll('\n', ' ')
    .trim();
}

function codes(list) {
  return list?.length ? list.join(', ') : '—';
}

function row(item) {
  const bands = `GV ${item.scores?.grammarVocabulary ?? 'null'} / DM ${item.scores?.discourseManagement ?? 'null'}`;
  return `| ${cell(item.id)} | ${codes(item.expectedIssueCodes)} | ${codes(item.detectedIssueCodes)} | ${item.falsePositiveCount} | ${item.missedCount} | ${bands} | ${cell(item.feedbackQuality)} | ${item.status} |`;
}

function summarise(items) {
  return items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      acc.detected.push(...item.detectedIssueCodes);
      acc.missed.push(...item.missed);
      acc.falsePositives.push(...item.falsePositives);
      return acc;
    },
    { detected: [], missed: [], falsePositives: [] },
  );
}

async function runSet(set) {
  const url = process.env.SPEAKING_B2_TEXT_EVAL_URL || 'http://localhost:3000/api/speaking-b2/fixtures/text-eval/';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ set }),
    });
    if (response.ok) {
      const body = await response.json();
      if (Array.isArray(body.items)) return { source: 'api', persist: body.persist === false, items: body.items };
    }
  } catch {
    // Fall back to the in-process evaluator.
  }
  return { source: 'in-process', persist: false, items: await evaluateSpeakingB2TextSet(set) };
}

function section(title, items, source) {
  const counts = summarise(items);
  return `## ${title}

Fuente: ${source}

| Caso | Esperados | Detectados | FP | Omitidos | Bandas GV/DM | Feedback | Estado |
|---|---|---|---|---|---|---|---|
${items.map(row).join('\n')}

- PASS: ${counts.PASS || 0}
- REVIEW: ${counts.REVIEW || 0}
- FAIL: ${counts.FAIL || 0}
- Códigos detectados: ${codes([...new Set(counts.detected)])}
- Códigos omitidos: ${codes([...new Set(counts.missed)])}
- Falsos positivos: ${codes([...new Set(counts.falsePositives)])}
`;
}

const sets = requested === 'both' ? ['regression', 'validate'] : [requested];
const blocks = [];
const allItems = [];
let source = 'api';
for (const set of sets) {
  const result = await runSet(set);
  source = result.source;
  allItems.push(...result.items);
  blocks.push(section(`Set ${set}`, result.items, result.source));
}

const markdown = `# Speaking Motor V1.7 — evaluación pedagógica

Fecha: ${new Date().toISOString()}
Fuente: ${source}

El conjunto \`validate\` es el hold-out ciego \`blind-*\`. \`regression\` reúne \`val-*\` (V1.5) y \`hold-*\` (V1.6), ya usados para orientar cambios.

No se marca PASS solo porque la API responda 200.

${blocks.join('\n')}
`;

const out = path.join(root, 'docs/speaking-motor-v1.7-text-eval-report.md');
writeFileSync(out, markdown);
console.log(JSON.stringify({ out, items: allItems }, null, 2));
