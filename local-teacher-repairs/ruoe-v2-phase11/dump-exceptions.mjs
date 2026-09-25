import fs from 'node:fs';
import path from 'node:path';

const root = 'local-teacher-repairs/ruoe-v2-phase10/exams';
const rows = [];
for (const dir of fs.readdirSync(root)) {
  const log = JSON.parse(fs.readFileSync(path.join(root, dir, 'repair-log.json'), 'utf8'));
  for (const comment of log.comments) {
    if (!['REFERENCE_INCOMPLETE', 'QUALITY_FAIL'].includes(comment.status)) continue;
    rows.push({
      exam: Number(dir.replace('exam-', '')),
      part: comment.part,
      question: comment.question,
      status: comment.status,
      feedback: comment.feedback || '',
      why: comment.why || '',
      validator: comment.validator || '',
      originalSentence: comment.originalSentence || '',
      revisedSentence: comment.revisedSentence || '',
      originalOptions: comment.originalOptions || null,
      revisedOptions: comment.revisedOptions || null,
      originalAnswer: comment.originalAnswer || '',
      reviewAnswer: comment.reviewAnswer || '',
    });
  }
}
fs.writeFileSync('local-teacher-repairs/ruoe-v2-phase11/exceptions-raw.json', JSON.stringify(rows, null, 2));
console.log(rows.length);
