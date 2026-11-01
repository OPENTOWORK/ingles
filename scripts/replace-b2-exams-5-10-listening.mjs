/**
 * Sustituye el Listening de los exámenes 5–10 de B2 y sube los audios a ENGLISH_PROD.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/replace-b2-exams-5-10-listening.mjs
 */
import { exam as exam5 } from './data/b2-listening-exam5.mjs';
import { exam as exam6 } from './data/b2-listening-exam6.mjs';
import { exam as exam7 } from './data/b2-listening-exam7.mjs';
import { exam as exam8 } from './data/b2-listening-exam8.mjs';
import { exam as exam9 } from './data/b2-listening-exam9.mjs';
import { exam as exam10 } from './data/b2-listening-exam10.mjs';
import { createListeningDb, installB2ListeningExam, loadB2ListeningContext } from './install-b2-listening-exam.mjs';

const db = createListeningDb();
const { level, parteId } = await loadB2ListeningContext(db);

for (const exam of [exam5, exam6, exam7, exam8, exam9, exam10]) {
  await installB2ListeningExam(db, level, parteId, exam);
}

console.log('Listening de los exámenes 5–10 sustituido en producción.');
