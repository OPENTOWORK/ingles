import { getLevelExamPartDef } from '@/lib/levelsExamCatalog';
import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';

function getA2PartDef(partNumber) {
  return A2_EXAM_PARTS.find((p) => p.partNumber === Number(partNumber)) || null;
}

const B2_WRITING_LABELS = {
  8: 'Writing Part 1 — Essay',
  9: 'Writing Part 2 — Choose one task',
};

const B1_WRITING_LABELS = {
  7: 'Writing Part 1 — Email',
  8: 'Writing Part 2 — Choose one task',
};

/** Human-readable admin label for a global exam part number. */
export function getExamPartDisplayLabel(slug, partNumber) {
  const s = String(slug || 'b2').toLowerCase();
  const pn = Number(partNumber);

  if (s === 'b2' && B2_WRITING_LABELS[pn]) return B2_WRITING_LABELS[pn];
  if (s === 'b1' && B1_WRITING_LABELS[pn]) return B1_WRITING_LABELS[pn];

  const def =
    s === 'a2' ? getA2PartDef(pn) : getLevelExamPartDef(s, pn);
  if (!def) return `Part ${pn}`;

  const section = def.section || def.title || '';
  const activity = String(def.activity || '').replace(/-/g, ' ');
  const localIndex = getLocalPartIndex(s, pn, def);

  if (def.mode === 'writing') {
    if (def.activity === 'essay') return `Writing Part ${localIndex} — Essay`;
    if (def.activity === 'email') return `Writing Part ${localIndex} — Email`;
    if (def.activity === 'part-2') return `Writing Part ${localIndex} — Choose one task`;
    return `Writing Part ${localIndex}${activity ? ` — ${activity}` : ''}`;
  }

  if (def.mode === 'speaking') {
    return `Speaking Part ${localIndex}${activity ? ` — ${activity}` : ''}`;
  }

  if (def.mode === 'listening') {
    return `Listening Part ${localIndex}${activity ? ` — ${activity}` : ''}`;
  }

  if (def.mode === 'reading') {
    return `Reading Part ${localIndex}${activity ? ` — ${activity}` : ''}`;
  }

  if (def.mode === 'use-of-english') {
    return `Use of English Part ${localIndex}${activity ? ` — ${activity}` : ''}`;
  }

  return section ? `${section} — Part ${localIndex}` : `Part ${pn}`;
}

function getLocalPartIndex(slug, partNumber, def) {
  const s = String(slug || 'b2').toLowerCase();
  const pn = Number(partNumber);
  const mode = def?.mode;

  if (s === 'b2') {
    if (mode === 'writing') return pn === 8 ? 1 : pn === 9 ? 2 : pn - 7;
    if (mode === 'listening') return pn - 9;
    if (mode === 'speaking') return pn - 13;
    if (mode === 'reading' || mode === 'use-of-english') {
      if (pn <= 4) return pn;
      if (pn <= 7) return pn - 4;
    }
  }

  return pn;
}
