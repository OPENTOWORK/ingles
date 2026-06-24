import fs from 'fs';
import path from 'path';

const p = path.join(process.env.USERPROFILE, '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools');

function extractFromMcpFile(raw) {
  let text = raw;
  if (raw.trimStart().startsWith('{')) {
    try {
      const outer = JSON.parse(raw);
      text = outer.result || outer.content || raw;
    } catch {
      /* keep raw */
    }
  }
  const m = text.match(/<untrusted-data-[^>]+>\n([\s\S]*?)\n<\/untrusted-data/);
  if (!m) return null;
  return JSON.parse(m[1]);
}

for (const f of fs.readdirSync(p)) {
  const raw = fs.readFileSync(path.join(p, f), 'utf8');
  if (!raw.includes('untrusted-data')) continue;
  try {
    const data = extractFromMcpFile(raw);
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.ddl?.startsWith('CREATE TABLE')) {
      console.log('DDL', f, row.ddl.length, (row.ddl.match(/CREATE TABLE/g) || []).length);
    }
    if (row?.sql?.startsWith('ALTER TABLE')) {
      console.log('SQL', f, row.sql.length, row.sql.includes('usuario_sesiones_app_user_id_fkey'));
    }
  } catch (e) {
    console.log('ERR', f, e.message.slice(0, 80));
  }
}
