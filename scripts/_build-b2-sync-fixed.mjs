import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, 'b2_parts_2_7_sync.sql');
const dst = path.join(__dirname, '_b2_sync_parts_2_4_5_6_7_fixed.sql');

const PART3 = "'1c4186d0-fdbe-41e7-8266-efdf712c3006'";

let s = fs.readFileSync(src, 'utf8').replace(/^\uFEFF/, '');

// 1) Remove Part 3 UPDATE (still one line in source)
s = s.replace(
  /update public\.levels_partes set "Descripción"='(?:[^']|'')*?' where id='1c4186d0-fdbe-41e7-8266-efdf712c3006';\s*/g,
  '',
);

// 2) Remove Part 3 INSERT rows (each insert is a single line in source)
s = s.replace(/insert into public\.levels_preguntas[^;]+'1c4186d0-fdbe-41e7-8266-efdf712c3006',[^;]+;\s*/g, '');

// 3) Legacy `n → newline
s = s.replace(/`n/g, '\n');

// 4) Remove Part 3 only from DELETE ... parte_id in (...) lines
const lines = s.split('\n');
const out = lines.map((line) => {
  if (!line.startsWith('delete from')) return line;
  let l = line;
  l = l.split(`,${PART3}`).join('');
  l = l.split(`${PART3},`).join('');
  return l.replace(/,\s*,/g, ',').replace(/\(,/g, '(').replace(/,\)/g, ')');
});

s = out.join('\n');
fs.writeFileSync(dst, s);
console.log('written', dst);
console.log('bytes', Buffer.byteLength(s, 'utf8'));
console.log('has part3 uuid', s.includes('1c4186d0'));
