export function stripB1FailurePrefix(message) {
  return String(message || '').replace(/^(?:Generation\/parse error:\s*)+/i, '').trim();
}

export function b1FailureItems(message) {
  const text = stripB1FailurePrefix(message);
  const items = new Set();
  for (const match of text.matchAll(/\b(?:Q|gap|item|question)\s*(\d+)\b/gi)) {
    items.add(Number(match[1]));
  }
  return [...items].sort((a, b) => a - b);
}

export function b1FailureItemsFromMessages(messages = []) {
  const items = new Set();
  for (const message of Array.isArray(messages) ? messages : [messages]) {
    for (const item of b1FailureItems(message)) items.add(item);
  }
  return [...items].sort((a, b) => a - b);
}

export function b1ItemSignatureImproved(previousItems = [], nextItems = []) {
  const previous = [...previousItems];
  const next = [...nextItems];
  if (!previous.length) return false;
  if (!next.length) return true;
  if (previous.join(',') === next.join(',')) return false;
  const nextIsSubset = next.every((item) => previous.includes(item));
  if (nextIsSubset && next.length < previous.length) return true;
  const previousIsSubset = previous.every((item) => next.includes(item));
  return !previousIsSubset && !nextIsSubset;
}

const CONTENT_FAILURE_PATTERNS = [
  /\b\d+\s+words?\b|shorter than|longer than|word count|too short|too long/i,
  /above b1|above-level|specialist|academic/i,
  /cohesion|multifit|mechanical|repeated phrase|two-word phrase|sequence issue|whole-text|labelled|signal is missing|unknown cohesion/i,
  /grammar target|must test|targetType|content vocabulary|open cloze|exactly one word|six different|near-synonym|distractor/i,
  /limited to adults|does not state an age|leave-by-noon|closes or locks at noon|unsupported/i,
];

export function isB1ContentFailureMessage(message) {
  const text = stripB1FailurePrefix(message);
  return CONTENT_FAILURE_PATTERNS.some((pattern) => pattern.test(text));
}

export function b1ContentError(message) {
  const error = new Error(message);
  error.code = 'b1_content_validation';
  error.items = b1FailureItems(message);
  return error;
}
