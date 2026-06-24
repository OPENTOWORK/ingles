import fs from 'fs';
const raw = fs.readFileSync(process.argv[2], 'utf8');
const m = raw.match(/<untrusted-data-[^>]+>\n([\s\S]*?)\n<\/untrusted-data/);
console.log('match', !!m, 'len', m?.[1]?.length);
if (m) {
  try {
    const data = JSON.parse(m[1]);
    console.log('keys', Object.keys(data[0] || {}));
  } catch (e) {
    console.log('parse err', e.message);
  }
}
