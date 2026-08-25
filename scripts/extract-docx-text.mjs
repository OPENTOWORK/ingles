import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/extract-docx-text.mjs <file-or-dir>');
  process.exit(1);
}

async function extractOne(file) {
  const { value } = await mammoth.extractRawText({ path: file });
  const out = file.replace(/\.docx$/i, '.extracted.txt');
  fs.writeFileSync(out, value, 'utf8');
  console.log('Wrote', out);
}

async function main() {
  if (target.endsWith('.docx')) {
    await extractOne(target);
    return;
  }
  const dir = target;
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith('.docx')) await extractOne(path.join(dir, name));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
