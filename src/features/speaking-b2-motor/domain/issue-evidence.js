/** General linguistic cues. Do not encode fixture sentences. */

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'from',
  'how', 'what', 'when', 'where', 'why', 'do', 'does', 'did', 'is', 'are', 'was', 'were',
  'you', 'your', 'i', 'my', 'we', 'our', 'it', 'this', 'that', 'there', 'about', 'most',
]);

export function normalizeSpeakingSnippet(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[“”"']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerptAppearsIn(answer, excerpt) {
  const haystack = normalizeSpeakingSnippet(answer);
  const needle = normalizeSpeakingSnippet(excerpt);
  if (!needle || needle.length < 2) return false;
  return haystack.includes(needle);
}

export function contentWords(text) {
  return normalizeSpeakingSnippet(text)
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

export function lexicalOverlap(question, answer) {
  const q = new Set(contentWords(question));
  const a = contentWords(answer);
  if (!q.size || !a.length) return 0;
  const hits = a.filter((word) => q.has(word)).length;
  return hits / a.length;
}

export function looksLikeArticleError(text) {
  const snippet = normalizeSpeakingSnippet(text);
  return (
    /\b(a|an|the)\s+(my|your|his|her|our|their)\b/.test(snippet) ||
    /\bthe\s+(breakfast|lunch|dinner|brunch|supper)\b/.test(snippet) ||
    /\ba\s+(city centre|information|homework|advice|furniture)\b/.test(snippet)
  );
}

export function looksLikePrepositionError(text) {
  const snippet = normalizeSpeakingSnippet(text);
  return (
    /\b(in home|on home)\b/.test(snippet) ||
    /\bgo in the\s+(cinema|theatre|theater|shop|park)\b/.test(snippet) ||
    /\barrive to\b/.test(snippet) ||
    /\bdepend of\b/.test(snippet) ||
    /\bwait(s|ed|ing)?\s+(the|a|an)\s+(bus|train|tram|metro|taxi|plane|flight)\b/.test(snippet) ||
    /\blisten(s|ed|ing)?\s+(music|the radio|radio)\b/.test(snippet) ||
    /\bon the car\b/.test(snippet) ||
    /\binterested on\b/.test(snippet)
  );
}

export function looksLikeVerbTenseError(text) {
  const snippet = normalizeSpeakingSnippet(text);
  return (
    /\b(yesterday|last \w+|ago|\d+ days ago)\b.{0,40}\b(i|we|he|she|they)\s+(go|visit|enjoy|meet|see|buy|come|take|feel)\b/.test(
      snippet,
    ) ||
    /\benjoy to\b/.test(snippet) ||
    /\bdid\s+(went|saw|went|ate|came)\b/.test(snippet) ||
    /\bhave\s+(go|went|ate|saw)\b/.test(snippet)
  );
}

export function looksLikeCollocationError(text) {
  const snippet = normalizeSpeakingSnippet(text);
  if (/\bmake a decision\b/.test(snippet) || /\bdo sport\b/.test(snippet) || /\bdo exercise\b/.test(snippet)) {
    return false;
  }
  return (
    /\bmake (messages?|homework|exercise|sport|a walk)\b/.test(snippet) ||
    /\bdo (a |the )?(decision|party|photo)\b/.test(snippet)
  );
}

export function looksLikeWordChoiceError(text) {
  const snippet = normalizeSpeakingSnippet(text);
  return (
    /\bmore (big|strong|good|easy)\b/.test(snippet) ||
    /\bin the job\b/.test(snippet) ||
    /\bgrow my english\b/.test(snippet)
  );
}

export function looksLikeRepetition(text) {
  const words = contentWords(text);
  if (words.length < 8) return false;
  const counts = new Map();
  for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  return [...counts.values()].some((count) => count >= 4);
}

export function isRelevantToQuestion(question, answer) {
  const overlap = lexicalOverlap(question, answer);
  if (overlap >= 0.12) return true;
  const q = normalizeSpeakingSnippet(question);
  const a = normalizeSpeakingSnippet(answer);
  const related = [
    [/english|studying/, /english|language|read|speak|word|text|grammar|meaning|conversation|client/],
    [/weekend|spend your/, /weekend|saturday|sunday|family|friend|walk|home|visit|rest|morning|brother|sister|parent|uncle/],
    [/places|visiting|returning/, /place|city|town|travel|visit|trip|transport/],
    [/technolog|communicat|friends/, /phone|message|call|chat|friend|app|video/],
    [/skill|learn|future/, /learn|skill|because|want|like/],
  ];
  if (related.some(([ask, about]) => ask.test(q) && about.test(a))) return true;
  const offTopic = [
    [/communicat|technolog/, /cook|recipe|cake|pasta|film|chef|swim|sea/],
    [/weekend/, /english|grammar|homework/],
    [/skill|learn|future/, /weekend|cinema|breakfast/],
  ];
  if (offTopic.some(([ask, other]) => ask.test(q) && other.test(a) && !ask.test(a))) return false;
  if (!isAdequatelyDeveloped(answer)) return true;
  return overlap >= 0.06;
}

export function isHedgedNonAnswer(answer) {
  const text = normalizeSpeakingSnippet(answer).replace(/[.!?]/g, '').trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  if (words.length > 5) return false;
  return /^(maybe|perhaps|later|not really|i don't know|i do not know|dunno|we'll see|we will see|not sure|no idea)(\s+\w+){0,2}$/.test(
    text,
  );
}

export function isAdequatelyDeveloped(answer) {
  const text = String(answer || '').trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (isHedgedNonAnswer(text)) return false;
  if (words.length <= 2) return false;
  if (words.length <= 5 && !/\bbecause\b|\bfor example\b|\bso that\b/i.test(text)) return false;
  return /\bbecause\b|\bfor example\b|\bso\b|\bwhen\b|\bwhich\b|\bafter\b/i.test(text) || words.length >= 10;
}

export function isThinAnswer(answer) {
  const words = String(answer || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length <= 4 || isHedgedNonAnswer(answer);
}

export function evidenceFlagsForIssue({ excerpt, answer, question }) {
  const span = excerpt || answer;
  return {
    article: looksLikeArticleError(span) || looksLikeArticleError(answer),
    preposition: looksLikePrepositionError(span) || looksLikePrepositionError(answer),
    tense: looksLikeVerbTenseError(span) || looksLikeVerbTenseError(answer),
    collocation: looksLikeCollocationError(span) || looksLikeCollocationError(answer),
    wordChoice: looksLikeWordChoiceError(span) || looksLikeWordChoiceError(answer),
    repetition: looksLikeRepetition(answer),
    relevant: isRelevantToQuestion(question, answer),
    developed: isAdequatelyDeveloped(answer),
  };
}
