/** Parse and split writing feedback sections (shared server + client). */

import { isWritingFeedbackHeadingLine } from '@/lib/formatWritingFeedback';
import { isAnnotatedTextSection } from '@/lib/writingAnnotatedMarkup';

const SECTION_BREAK = /^(📝|💪|🎯|🎓|📊|🔍|✏️|📈|🚀|📚|✅|🟡|❌)/;

export function extractFeedbackSectionBody(feedback, emojiPrefix) {
  const lines = String(feedback || '').split('\n');
  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (start === -1) {
      if (t.startsWith(emojiPrefix)) start = i;
    } else if (SECTION_BREAK.test(t) && !t.startsWith(emojiPrefix)) {
      end = i;
      break;
    }
  }

  if (start === -1) return '';
  return lines.slice(start + 1, end).join('\n').trim();
}

/** @returns {Array<{ heading: string | null, body: string }>} */
export function splitFeedbackSections(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  /** @type {Array<{ heading: string | null, body: string }>} */
  const sections = [];
  let heading = null;
  let buffer = [];

  const flush = () => {
    const joined = buffer.join('\n');
    const body = isAnnotatedTextSection(heading) ? joined.replace(/^\n/, '') : joined.trim();
    if (heading || body) sections.push({ heading, body });
    buffer = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (t && isWritingFeedbackHeadingLine(t) && !/^#{1,6}\s+/.test(t)) {
      flush();
      heading = t;
      continue;
    }
    buffer.push(line);
  }
  flush();

  return sections;
}

export function sectionDisplayOrder(heading) {
  const h = String(heading || '').toLowerCase();
  if (/dralo writing feedback|^📝/.test(h)) return 0;
  if (/main strengths|💪/.test(h)) return 10;
  if (/main problems|🎯/.test(h)) return 20;
  if (/annotated text|🔍/.test(h)) return 22;
  if (/estimated cefr|🎓/.test(h)) return 30;
  if (/task check|📋/.test(h)) return 40;
  if (/scores|📊/.test(h)) return 50;
  if (/corrections|✏️/.test(h)) return 60;
  if (/improved version|📈/.test(h)) return 80;
  if (/stronger b2|🚀/.test(h)) return 90;
  if (/study plan|📚/.test(h)) return 100;
  if (/^✅|^🟡|^❌/.test(h)) return 110;
  return 55;
}

export function isCorrectionsSectionHeading(heading) {
  return /corrections?/i.test(String(heading || ''));
}

export function feedbackHasAnnotatedSection(sections) {
  return sections.some((s) => isAnnotatedTextSection(s.heading));
}

export { isAnnotatedTextSection };
