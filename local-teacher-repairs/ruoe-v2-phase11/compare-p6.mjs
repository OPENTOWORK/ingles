import fs from 'node:fs';

function load(exam, part) {
  const file = `scripts/generated/b2-exams/exam-${String(exam).padStart(2, '0')}/part-${String(part).padStart(2, '0')}.json`;
  const data = JSON.parse(fs.readFileSync(file, 'utf8')).generated;
  return data;
}

for (const exam of [6, 8, 9, 10, 13]) {
  const part = load(exam, 6);
  console.log('\nEXAM', exam, 'keys', (part.modelAnswers || []).map((row) => `${row.number}:${row.answer}`).join(' '));
  for (const line of part.sentencePool || []) console.log(' ', line);
}
const p5 = load(9, 5);
console.log('\nEXAM9 P5 title', p5.title);
console.log((p5.passage || '').slice(0, 400));
console.log('---Q35', p5.questions.find((q) => q.number === 35)?.prompt);
console.log(p5.questions.find((q) => q.number === 35)?.options);
