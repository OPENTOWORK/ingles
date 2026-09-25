import fs from 'node:fs';
import path from 'node:path';

const dir = 'local-teacher-repairs/ruoe-v2-phase10/input';
const files = fs.readdirSync(dir).filter((name) => name.endsWith('.extracted.txt'));
const out = [];
for (const name of files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
  const exam = Number(name.match(/Exam_(\d+)/)[1]) + 4;
  const text = fs.readFileSync(path.join(dir, name), 'utf8').replace(/\r/g, '');
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const hits = lines.filter((line) =>
    /part\s*[56]|q3[1-9]|q4[0-2]|gap\s*3|gapped|multiple-choice reading|no content|unchanged|rewritten|distractor|cohesion/i.test(line)
    && line.length < 420
    && !/^Check$|^Decision$|^Field$|^Value$/.test(line),
  );
  out.push(`\n===== BANK ${exam} (${name}) =====`);
  out.push(...hits.slice(0, 40));
}
fs.mkdirSync('local-teacher-repairs/ruoe-v2-phase11', { recursive: true });
fs.writeFileSync('local-teacher-repairs/ruoe-v2-phase11/p56-lines.txt', out.join('\n'));
console.log('wrote', out.length);
