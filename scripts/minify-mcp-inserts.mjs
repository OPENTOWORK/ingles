import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, 'generated', 'mcp_batches');
for (const f of ['01_insert.sql', '02_insert.sql', '03_insert.sql', '04_insert.sql', '05_insert.sql']) {
  let q = fs.readFileSync(path.join(p, f), 'utf8');
  q = q.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
  fs.writeFileSync(path.join(p, f.replace('.sql', '_oneline.sql')), q, 'utf8');
  console.log(f, q.length);
}
