import { parseB2KeyWordTransformItems } from '@/utils/b2ExamTextBlocks';

export function splitRuoeExplanation(text = '') {
  const value = String(text).trim();
  const match = value.match(/^What this tests[ \t]*:?\s+([\s\S]+?)\s+Why (?:the answer is correct|it['’]s correct)[ \t]*:?\s+([\s\S]+)$/i);
  return match
    ? { focus: match[1].trim(), reason: match[2].trim() }
    : { focus: '', reason: value };
}

export function getRuoeAnswerContext(part, passage, questionNumber) {
  const text = String(passage || '');
  if (part === 4) {
    return parseB2KeyWordTransformItems(text).find((item) => item.questionNumber === questionNumber) || {};
  }

  const gap = new RegExp('\\(' + Number(questionNumber) + '\\)\\s*_+');
  if (part === 3) {
    const match = text.match(gap);
    const after = match ? text.slice(match.index + match[0].length) : '';
    return { keyword: after.match(/^\s*\(([A-Z][A-Z -]*)\)/)?.[1] || '' };
  }
  if (part !== 2) return {};

  const match = text.match(gap);
  if (!match) return {};
  const before = text.slice(0, match.index).split(/(?<=[.!?])\s+|\n+/).at(-1);
  const after = text.slice(match.index + match[0].length);
  return {
    sentence2Before: before.replace(/\(\d+\)\s*_+/g, '…'),
    sentence2After: (after.split(/(?<=[.!?])\s+|\n+/)[0] || '').replace(/\(\d+\)\s*_+/g, '…'),
  };
}
