/** Alignment and WER. WER alone does not decide STT quality. */

import {
  looksLikeArticleError,
  looksLikePrepositionError,
  looksLikeVerbTenseError,
  looksLikeCollocationError,
  looksLikeWordChoiceError,
  normalizeSpeakingSnippet,
} from './issue-evidence.js';

const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'to', 'in', 'on', 'at', 'of', 'for', 'from', 'with', 'by',
  'into', 'onto', 'up', 'off', 'out', 'over', 'under', 'and', 'or', 'but',
]);

const TENSE_WORDS = new Set([
  'go', 'goes', 'went', 'gone', 'going', 'visit', 'visited', 'meet', 'met',
  'is', 'was', 'are', 'were', 'have', 'has', 'had', 'did', 'made',
]);

const HALLUCINATION_PHRASES = [
  'thank you for watching',
  'if you have any questions',
  'please like and subscribe',
  'thanks for listening',
  'subscribe to our channel',
];

export function tokenizeSpeakingTranscript(text) {
  return normalizeSpeakingSnippet(text)
    .replace(/\[inaudible\]|\[unclear\]|\[noise\]/g, ' ')
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function alignTokens(reference, hypothesis) {
  const rows = reference.length + 1;
  const cols = hypothesis.length + 1;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(0));
  const back = Array.from({ length: rows }, () => Array(cols).fill(''));
  for (let i = 0; i < rows; i += 1) {
    dist[i][0] = i;
    back[i][0] = 'D';
  }
  for (let j = 0; j < cols; j += 1) {
    dist[0][j] = j;
    back[0][j] = 'I';
  }
  back[0][0] = 'S';
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const same = reference[i - 1] === hypothesis[j - 1];
      const sub = dist[i - 1][j - 1] + (same ? 0 : 1);
      const del = dist[i - 1][j] + 1;
      const ins = dist[i][j - 1] + 1;
      if (sub <= del && sub <= ins) {
        dist[i][j] = sub;
        back[i][j] = same ? 'E' : 'S';
      } else if (del <= ins) {
        dist[i][j] = del;
        back[i][j] = 'D';
      } else {
        dist[i][j] = ins;
        back[i][j] = 'I';
      }
    }
  }
  const ops = [];
  let i = reference.length;
  let j = hypothesis.length;
  while (i > 0 || j > 0) {
    const op = back[i][j];
    if (op === 'E' || op === 'S') {
      ops.push({ op, ref: reference[i - 1], hyp: hypothesis[j - 1] });
      i -= 1;
      j -= 1;
    } else if (op === 'D') {
      ops.push({ op, ref: reference[i - 1], hyp: '' });
      i -= 1;
    } else {
      ops.push({ op, ref: '', hyp: hypothesis[j - 1] });
      j -= 1;
    }
  }
  ops.reverse();
  return { distance: dist[reference.length][hypothesis.length], ops };
}

function cueFlags(text) {
  return {
    article: looksLikeArticleError(text),
    preposition: looksLikePrepositionError(text),
    tense: looksLikeVerbTenseError(text),
    collocation: looksLikeCollocationError(text),
    wordChoice: looksLikeWordChoiceError(text),
  };
}

export function compareSpeakingTranscripts(reference, hypothesis) {
  const refTokens = tokenizeSpeakingTranscript(reference);
  const hypTokens = tokenizeSpeakingTranscript(hypothesis);
  const { distance, ops } = alignTokens(refTokens, hypTokens);
  const substitutions = ops.filter((item) => item.op === 'S');
  const deletions = ops.filter((item) => item.op === 'D');
  const insertions = ops.filter((item) => item.op === 'I');
  const n = refTokens.length;
  const wer = n ? distance / n : hypTokens.length ? 1 : 0;

  const grammarChanging = [];
  const meaningChanging = [];
  for (const item of substitutions) {
    const functionSwap = FUNCTION_WORDS.has(item.ref) || FUNCTION_WORDS.has(item.hyp);
    const tenseSwap = TENSE_WORDS.has(item.ref) || TENSE_WORDS.has(item.hyp);
    if (functionSwap || tenseSwap) grammarChanging.push(item);
    else meaningChanging.push(item);
  }
  for (const item of deletions) {
    if (FUNCTION_WORDS.has(item.ref) || TENSE_WORDS.has(item.ref)) grammarChanging.push(item);
    else meaningChanging.push(item);
  }
  for (const item of insertions) {
    if (FUNCTION_WORDS.has(item.hyp) || TENSE_WORDS.has(item.hyp)) grammarChanging.push(item);
    else meaningChanging.push(item);
  }

  const refCues = cueFlags(reference);
  const hypCues = cueFlags(hypothesis);
  const grammarIntroduced = Object.entries(hypCues)
    .filter(([key, value]) => value && !refCues[key])
    .map(([key]) => key);
  const grammarRemoved = Object.entries(refCues)
    .filter(([key, value]) => value && !hypCues[key])
    .map(([key]) => key);

  const hypText = normalizeSpeakingSnippet(hypothesis);
  const insertedHallucination = HALLUCINATION_PHRASES.some((phrase) => {
    return hypText.includes(phrase) && !normalizeSpeakingSnippet(reference).includes(phrase);
  });
  const insertionRatio = n ? insertions.length / n : insertions.length ? 1 : 0;
  const hallucinationRisk = insertedHallucination || insertionRatio >= 0.4;

  return {
    reference: String(reference || ''),
    hypothesis: String(hypothesis || ''),
    refWords: n,
    hypWords: hypTokens.length,
    wer: Number(wer.toFixed(3)),
    substitutions: substitutions.length,
    deletions: deletions.length,
    insertions: insertions.length,
    ops,
    grammarChanging,
    meaningChanging,
    grammarIntroduced,
    grammarRemoved,
    hallucinationRisk,
    reviewRequired:
      hallucinationRisk ||
      grammarIntroduced.length > 0 ||
      grammarRemoved.length > 0 ||
      meaningChanging.length >= 2 ||
      wer >= 0.35,
    qualityByWerAlone: false,
  };
}

export function sttHarmLevel(comparison) {
  if (!comparison) return 'unknown';
  if (comparison.hallucinationRisk || comparison.grammarIntroduced.length || comparison.grammarRemoved.length) {
    return 'severe';
  }
  if (comparison.meaningChanging.length || comparison.wer >= 0.25) return 'mild';
  return 'none';
}
