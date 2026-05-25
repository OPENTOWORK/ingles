/**
 * Official Cambridge exam section durations (minutes).
 * @see https://www.cambridgeenglish.org/exams-and-tests/
 */
export const CAMBRIDGE_SECTION_MINUTES = {
  a2: {
    'Reading and Writing': 60,
    Listening: 30,
    Speaking: 12,
  },
  b1: {
    Reading: 55,
    Writing: 45,
    Listening: 30,
    Speaking: 12,
  },
  b2: {
    'Reading and Use of English': 75,
    Writing: 80,
    Listening: 40,
    Speaking: 15,
  },
  c1: {
    'Use of English': 60,
    Reading: 50,
    Writing: 80,
    Listening: 40,
    Speaking: 16,
  },
  c2: {
    'Use of English': 60,
    Reading: 50,
    Writing: 80,
    Listening: 40,
    Speaking: 16,
  },
};

/** @param {string} slug */
/** @param {string} sectionTitle */
export function getCambridgeSectionDurationMinutes(slug, sectionTitle) {
  const key = String(slug || '').toLowerCase();
  const map = CAMBRIDGE_SECTION_MINUTES[key] || {};
  return map[sectionTitle] ?? 45;
}

export function getCambridgeSectionDurationSeconds(slug, sectionTitle) {
  return getCambridgeSectionDurationMinutes(slug, sectionTitle) * 60;
}
