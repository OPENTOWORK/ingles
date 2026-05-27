import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const dir =
  process.argv[2] ||
  'C:\\Users\\Usuario\\Downloads\\504342-a2-key-2020-sample-tests\\a2-key-sample-tests';

const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));

for (const file of files.sort()) {
  const buf = fs.readFileSync(path.join(dir, file));
  const data = await pdf(buf);
  console.log('\n' + '='.repeat(80));
  console.log('FILE:', file);
  console.log('='.repeat(80));
  console.log(data.text.slice(0, 12000));
}
