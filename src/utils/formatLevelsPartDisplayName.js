import { getB2PartDef } from '@/lib/b2ExamCatalog';
import { getExamPartDisplayLabel } from '@/lib/examPartDisplayLabel';
import { formatSkillExerciseLabel } from '@/utils/skillPartFirstProgress';

/**
 * Nombre de parte tal como se muestra en la UI (levels_partes.nombre_parte suele incluir " B2").
 * No modifica datos en Supabase.
 * @param {string | null | undefined} raw — p. ej. "Parte 1 B2"
 * @returns {string}
 */
export function formatLevelsPartDisplayName(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const trimmed = s.replace(/\s+(a1|a2|b1|b2|c1|c2)\s*$/i, '').trim();
  const withoutLevel = trimmed.length ? trimmed : s;
  return withoutLevel.replace(/^Parte\s+/i, 'Part ');
}

/** Índice local 1-based dentro de un skill (p. ej. exam part 14 → 1 en Speaking). */
export function getSkillLocalPartNumber(partNumber, partMin) {
  const n = Number(partNumber);
  const min = Number(partMin);
  if (!Number.isFinite(n) || !Number.isFinite(min) || n < min) return null;
  return n - min + 1;
}

/**
 * Etiqueta de pestaña para skill practice (Part 1, Part 2… en lugar del número global del examen).
 * @param {{ partNumber?: number, nombre?: string, nombre_parte?: string } | null | undefined} part
 */
export function getSkillPartTabLabel(part, partMin, lang = 'en') {
  const n = Number(
    part?.partNumber ||
      String(part?.nombre || part?.nombre_parte || '').match(/\d+/)?.[0] ||
      0,
  );
  const local = getSkillLocalPartNumber(n, partMin);
  if (!local) return null;
  return lang === 'en' ? `Part ${local}` : `Parte ${local}`;
}

/** Título de parte en exam mode (Listening 10→1, Writing 8→1, etc.). */
export function getExamSectionPartTitle(partNumber, partMin, lang = 'en') {
  const local = getSkillLocalPartNumber(partNumber, partMin);
  if (!local) return null;
  return lang === 'en' ? `Part ${local}` : `Parte ${local}`;
}

/** Etiqueta "Part N" para botones Back/Continue del nav (misma numeración que las pestañas). */
export function getModuleNavPartLabel(partNumber, partMin, lang = 'en') {
  const n = Number(partNumber);
  if (!Number.isFinite(n) || n <= 0) return '';
  const localTitle = partMin != null ? getExamSectionPartTitle(n, partMin, lang) : null;
  if (localTitle) return localTitle;
  return lang === 'en' ? `Part ${n}` : `Parte ${n}`;
}

const ACTIVITY_SUBTITLES_EN = {
  'multiple-choice-cloze': 'Multiple-choice cloze',
  'open-cloze': 'Open cloze',
  'word-formation': 'Word formation',
  'key-word': 'Key word transformations',
  'multiple-choice': 'Multiple choice',
  'gapped-text': 'Gapped text',
  'multiple-matching': 'Multiple matching',
  essay: 'Essay',
  email: 'Email',
  'part-2': 'Choose one task',
  'short-extracts': 'Multiple choice',
  'sentence-completion': 'Sentence completion',
  conversation: 'Multiple choice',
  interview: 'Interview',
  'long-turn': 'Long turn',
  collaborative: 'Collaborative task',
  discussion: 'Discussion',
};

const ACTIVITY_SUBTITLES_ES = {
  'multiple-choice-cloze': 'Cloze de opción múltiple',
  'open-cloze': 'Cloze abierto',
  'word-formation': 'Formación de palabras',
  'key-word': 'Transformaciones con palabra clave',
  'multiple-choice': 'Opción múltiple',
  'gapped-text': 'Texto con huecos',
  'multiple-matching': 'Emparejamiento múltiple',
  essay: 'Ensayo',
  email: 'Email',
  'part-2': 'Elige una tarea',
  'short-extracts': 'Opción múltiple',
  'sentence-completion': 'Completar frases',
  conversation: 'Opción múltiple',
  interview: 'Entrevista',
  'long-turn': 'Turno largo',
  collaborative: 'Tarea colaborativa',
  discussion: 'Discusión',
};

function getActivitySubtitle(activity, lang = 'en') {
  const key = String(activity || '').trim();
  const map = lang === 'es' ? ACTIVITY_SUBTITLES_ES : ACTIVITY_SUBTITLES_EN;
  if (map[key]) return map[key];
  return key.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getB2SkillPartHeading(partNumber, mode, lang = 'en', examSlot = null) {
  const pn = Number(partNumber);
  const en = lang === 'en';
  if (mode === 'use-of-english') {
    const label = en ? 'Use of English' : 'Uso de inglés';
    const slot = Number(examSlot);
    if (Number.isFinite(slot) && slot > 0) {
      return `${label} - ${formatSkillExerciseLabel(slot, lang)}`;
    }
    return en ? `${label} - Part ${pn}` : `${label} - Parte ${pn}`;
  }
  if (mode === 'reading') return en ? `Reading Part ${pn}` : `Reading Parte ${pn}`;
  if (mode === 'writing') {
    const label = en ? 'Writing' : 'Escritura';
    const slot = Number(examSlot);
    if (Number.isFinite(slot) && slot > 0) {
      return `${label} - ${formatSkillExerciseLabel(slot, lang)}`;
    }
    const local = pn - 7;
    return en ? `Writing Part ${local}` : `Writing Parte ${local}`;
  }
  if (mode === 'listening') {
    const label = en ? 'Listening' : 'Comprensión auditiva';
    const slot = Number(examSlot);
    if (Number.isFinite(slot) && slot > 0) {
      return `${label} - ${formatSkillExerciseLabel(slot, lang)}`;
    }
    const local = pn - 9;
    return en ? `Listening Part ${local}` : `Listening Parte ${local}`;
  }
  if (mode === 'speaking') {
    const label = en ? 'Speaking' : 'Expresión oral';
    const slot = Number(examSlot);
    if (Number.isFinite(slot) && slot > 0) {
      return `${label} - ${formatSkillExerciseLabel(slot, lang)}`;
    }
    const local = pn - 13;
    return en ? `Speaking Part ${local}` : `Speaking Parte ${local}`;
  }
  return en ? `Part ${pn}` : `Parte ${pn}`;
}

function normalizePracticeHeading(heading) {
  return String(heading || '').replace(/^Use of English\b/i, 'UOE');
}

/**
 * Título de práctica en dos líneas: categoría (UOE Part 1) + tipo de tarea (Multiple-choice cloze).
 * @returns {{ heading: string, subtitle: string }}
 */
export function getSkillPartPracticeTitle(slug = 'b2', partNumber, lang = 'en', examSlot = null) {
  const pn = Number(partNumber);
  if (!Number.isFinite(pn) || pn <= 0) return { heading: '', subtitle: '' };

  const levelSlug = String(slug || 'b2').toLowerCase();
  if (levelSlug === 'b2') {
    const def = getB2PartDef(pn);
    if (def) {
      return {
        heading: getB2SkillPartHeading(pn, def.mode, lang, examSlot),
        subtitle: getActivitySubtitle(def.activity, lang),
      };
    }
  }

  const full = getExamPartDisplayLabel(levelSlug, pn);
  const dashIdx = full.indexOf(' — ');
  if (dashIdx >= 0) {
    return {
      heading: normalizePracticeHeading(full.slice(0, dashIdx)),
      subtitle: full.slice(dashIdx + 3),
    };
  }
  return { heading: normalizePracticeHeading(full), subtitle: '' };
}

/** Una sola línea "UOE Part 1 — Multiple-choice cloze" (p. ej. headings auxiliares). */
export function formatSkillPartPracticeTitle(slug, partNumber, lang = 'en') {
  const { heading, subtitle } = getSkillPartPracticeTitle(slug, partNumber, lang);
  if (!heading && !subtitle) return '';
  if (!subtitle) return heading;
  return `${heading} — ${subtitle}`;
}
