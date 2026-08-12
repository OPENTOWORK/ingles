import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bindQuote } from '../src/features/writing/services/validation/evidence-binding.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(
  readFileSync(join(root, 'docs/writing-v3/calibration/baseline-1.json'), 'utf8'),
);

function extractQuote(msg) {
  const marker = 'evidence quote "';
  const start = msg.indexOf(marker);
  if (start < 0) return null;
  const from = start + marker.length;
  const end = msg.indexOf('" is not present', from);
  if (end < 0) return null;
  return msg.slice(from, end);
}

const rows = [];
for (const c of baseline.case_results) {
  const msg = (c.validation_failures || []).find((f) => String(f).includes('evidence quote'));
  const quote = extractQuote(String(msg || ''));
  const g = JSON.parse(
    readFileSync(join(root, `src/features/writing/calibration/fixtures/${c.case_id}.json`), 'utf8'),
  );
  const cand = g.candidate_response;
  if (!quote) {
    rows.push({ case: c.case_id, error: 'could not extract quote', msg });
    continue;
  }
  const b0 = bindQuote(cand, quote, 0);
  const b1 = bindQuote(cand, quote, 1);
  const nonAscii = [...quote]
    .filter((ch) => ch.charCodeAt(0) > 127)
    .map((ch) => `${ch}=U+${ch.charCodeAt(0).toString(16)}`);
  // Check apostrophe variants in candidate around match
  let idx = cand.indexOf(quote);
  if (idx < 0) {
    // try case-insensitive folded search via binder
    idx = b0.status === 'bound' ? b0.span_start : -1;
  }
  rows.push({
    case: c.case_id,
    quote,
    quote_len: quote.length,
    non_ascii_in_quote: nonAscii,
    exact_includes: cand.includes(quote),
    occ0: b0.status === 'bound' ? `bound@${b0.span_start}-${b0.span_end}` : `${b0.reason}:n=${b0.occurrences_found}`,
    occ1: b1.status === 'bound' ? `bound@${b1.span_start}-${b1.span_end}` : `${b1.reason}:n=${b1.occurrences_found}`,
    fixture_checksum: g.candidate_response_checksum,
  });
}

console.log(JSON.stringify(rows, null, 2));
writeFileSync(
  join(root, 'docs/writing-v3/calibration/baseline-1-binding-occ-probe.json'),
  JSON.stringify(rows, null, 2),
);
