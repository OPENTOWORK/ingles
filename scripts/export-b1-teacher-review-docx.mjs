import path from 'node:path';

import { loadB1TeacherReviewPackage, writeB1TeacherReviewDocx } from '../src/lib/b1TeacherReviewDocument.js';

const dir = process.argv[2];
const output = process.argv[3];
if (!dir || !output) {
  console.error('Usage: node --loader ./scripts/alias-loader.mjs scripts/export-b1-teacher-review-docx.mjs <cache-dir> <output.docx>');
  process.exit(1);
}

const exam = loadB1TeacherReviewPackage(path.resolve(dir));
writeB1TeacherReviewDocx(exam, path.resolve(output));
console.log(`Wrote teacher-review document: ${path.resolve(output)}`);
console.log(`Automated validation: ${exam.automatedValidation}. Teacher approval: ${exam.teacherApproval}.`);
