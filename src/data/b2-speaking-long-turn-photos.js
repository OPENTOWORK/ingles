import { sitePublicPath } from '@/utils/sitePublicPath';

/**
 * Pares fijos para Parte 15 (long turn), uno por examen 1–6.
 * No hay selección aleatoria: el examen elegido en el selector determina el par.
 *
 * Examen 1 — estudiar: biblioteca (A) vs en casa (B)
 * Examen 2 — comer: cafetería al aire libre (A) vs cocinar en casa (B)
 * Examen 3 — deporte: ciclismo al aire libre (A) vs piscina cubierta (B)
 * Examen 4 — compras: centro comercial (A) vs mercado callejero (B)
 * Examen 5 — música: tocar guitarra en vivo (A) vs escuchar en casa (B)
 * Examen 6 — voluntariado: festival comunitario (A) vs huerto urbano (B)
 */
const PHOTO_PATHS_BY_EXAM = {
  1: ['/b2-speaking/exam-1/photo-a.png', '/b2-speaking/exam-1/photo-b.png'],
  2: ['/b2-speaking/exam-2/photo-a.png', '/b2-speaking/exam-2/photo-b.png'],
  3: ['/b2-speaking/exam-3/photo-a.png', '/b2-speaking/exam-3/photo-b.png'],
  4: ['/b2-speaking/exam-4/photo-a.png', '/b2-speaking/exam-4/photo-b.png'],
  5: ['/b2-speaking/exam-5/photo-a.png', '/b2-speaking/exam-5/photo-b.png'],
  6: ['/b2-speaking/exam-6/photo-a.png', '/b2-speaking/exam-6/photo-b.png'],
};

/** Metadatos por par (examen 1–6) para UI y prompt del examinador */
export const B2_LONG_TURN_PHOTO_SETS = {
  1: {
    theme: 'Studying',
    photoA: 'Students studying together in a library',
    photoB: 'A student studying alone at home',
    comparePrompt:
      'Compare the two photographs. Say what you see and why the people might prefer each way of studying.',
  },
  2: {
    theme: 'Food',
    photoA: 'People eating at an outdoor café',
    photoB: 'Someone cooking at home',
    comparePrompt:
      'Compare the two photographs. Say what you see and why people might enjoy eating in each place.',
  },
  3: {
    theme: 'Sport',
    photoA: 'Cycling outdoors',
    photoB: 'Swimming in an indoor pool',
    comparePrompt:
      'Compare the two photographs. Say what you see and why people might enjoy each activity.',
  },
  4: {
    theme: 'Shopping',
    photoA: 'Shopping in a modern mall',
    photoB: 'Shopping at a street market',
    comparePrompt:
      'Compare the two photographs. Say what you see and why people might prefer each type of shopping.',
  },
  5: {
    theme: 'Music',
    photoA: 'Playing guitar in front of an audience',
    photoB: 'Listening to music at home',
    comparePrompt:
      'Compare the two photographs. Say what you see and why people might enjoy music in each situation.',
  },
  6: {
    theme: 'Volunteering',
    photoA: 'Volunteers helping at an outdoor community festival',
    photoB: 'Volunteers working together in an urban community garden',
    comparePrompt:
      'Compare the two photographs. Say what you see and why people might enjoy volunteering in each situation.',
  },
};

const EXAM_SLOTS = [1, 2, 3, 4, 5, 6];

/**
 * @param {number} examSlot 1–6
 * @returns {[string, string]}
 */
export function getB2LongTurnPhotoUrls(examSlot = 1) {
  const slot = Math.min(6, Math.max(1, Number(examSlot) || 1));
  const paths = PHOTO_PATHS_BY_EXAM[slot] ?? PHOTO_PATHS_BY_EXAM[1];
  return paths.map((p) => sitePublicPath(p));
}

/**
 * Par aleatorio para Dralo AI / práctica libre (cada sesión puede usar otro tema).
 * @param {number} [excludeSlot] no repetir este examen (p. ej. al pulsar «otro par»)
 * @returns {{ urls: [string, string], examSlot: number, meta: object }}
 */
export function getRandomB2LongTurnPhotoSet(excludeSlot = 0) {
  const exclude = Number(excludeSlot) || 0;
  const pool = EXAM_SLOTS.filter((s) => s !== exclude);
  const slot = pool[Math.floor(Math.random() * pool.length)] ?? 1;
  const meta = B2_LONG_TURN_PHOTO_SETS[slot] ?? B2_LONG_TURN_PHOTO_SETS[1];
  return {
    examSlot: slot,
    urls: getB2LongTurnPhotoUrls(slot),
    meta,
  };
}
