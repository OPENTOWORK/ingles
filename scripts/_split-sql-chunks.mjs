import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '_b2_sync_parts_2_4_5_6_7_fixed.sql');
const max = 14000;
const s = fs.readFileSync(src, 'utf8');
const parts = [];
let rest = s;
while (rest.length) {
  if (rest.length <= max) {
    parts.push(rest);
    break;
  }
  let cut = rest.lastIndexOf("', now());", max);
  if (cut < 0) cut = max;
  else cut += "', now());".length;
  parts.push(rest.slice(0, cut));
  rest = rest.slice(cut).trimStart();
}
parts.forEach((p, i) => {
  const f = path.join(__dirname, `_b2_chunk_${i}.sql`);
  fs.writeFileSync(f, p);
  console.log(i, f, p.length);
});
