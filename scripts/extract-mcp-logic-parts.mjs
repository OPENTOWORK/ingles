import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const GEN = path.join(ROOT, 'scripts', 'generated');
const AGENT = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);

function unescapeSql(value) {
  return String(value)
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"');
}

function parseMcpToolExport(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.result?.[0]?.sql) return unescapeSql(parsed.result[0].sql);
  } catch {
    /* fall through */
  }

  const marker = '[{"sql":"';
  const start = raw.indexOf(marker);
  if (start < 0) throw new Error('No se encontró export sql en archivo MCP');
  let i = start + marker.length;
  let out = '';
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '\\') {
      const next = raw[i + 1];
      if (next === 'n') {
        out += '\n';
        i += 2;
        continue;
      }
      if (next === 'r') {
        out += '\r';
        i += 2;
        continue;
      }
      if (next === 't') {
        out += '\t';
        i += 2;
        continue;
      }
      if (next === '"') {
        out += '"';
        i += 2;
        continue;
      }
      if (next === '\\') {
        out += '\\';
        i += 2;
        continue;
      }
      out += ch;
      i += 1;
      continue;
    }
    if (ch === '"') break;
    out += ch;
    i += 1;
  }
  return out.trim();
}

function findAgentFile(predicate) {
  const files = fs
    .readdirSync(AGENT)
    .map((name) => path.join(AGENT, name))
    .filter((p) => fs.statSync(p).isFile())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const file of files) {
    const head = fs.readFileSync(file, 'utf8').slice(0, 12000);
    if (predicate(head, file)) return file;
  }
  return null;
}

fs.mkdirSync(GEN, { recursive: true });

const policiesFile =
  process.argv[2] ||
  findAgentFile((head) => head.includes('DROP POLICY IF EXISTS')) ||
  path.join(AGENT, 'bb85a188-93d5-4761-a0fd-eb53e4607414.txt');

const functionsFile =
  findAgentFile((head) => head.includes('CREATE OR REPLACE FUNCTION public.is_admin')) ||
  findAgentFile((head) => head.includes('enforce_levels_preguntas_parte_examen_match'));

const rlsFile =
  findAgentFile((head) => head.includes('ENABLE ROW LEVEL SECURITY') && head.includes('staff_buzon_mensajes')) ||
  findAgentFile((head) => head.includes('ENABLE ROW LEVEL SECURITY'));

const triggersFile =
  findAgentFile((head) => head.includes('CREATE TRIGGER trg_levels_notas_actualizado_en'));

if (!fs.existsSync(policiesFile)) throw new Error('No policies export');
if (!functionsFile) {
  // Fallback: copy from repo SQL fragments
  const fallback = path.join(ROOT, 'scripts', 'perfil_estadisticas_generales.sql');
  if (!fs.existsSync(fallback)) throw new Error('No functions export in agent-tools');
}

const policies = parseMcpToolExport(fs.readFileSync(policiesFile, 'utf8'));
const functions = functionsFile
  ? parseMcpToolExport(fs.readFileSync(functionsFile, 'utf8'))
  : fs.readFileSync(path.join(ROOT, 'scripts', 'perfil_estadisticas_generales.sql'), 'utf8');
const rls = rlsFile
  ? parseMcpToolExport(fs.readFileSync(rlsFile, 'utf8'))
  : policiesFile && fs.existsSync(policiesFile)
    ? ''
    : '';
if (!rls) throw new Error('No RLS export in agent-tools');
const triggersRaw = triggersFile
  ? parseMcpToolExport(fs.readFileSync(triggersFile, 'utf8'))
  : `CREATE TRIGGER trg_levels_estadisticas_actualizado_en BEFORE UPDATE ON levels_estadisticas FOR EACH ROW EXECUTE FUNCTION levels_estadisticas_set_actualizado_en();
CREATE TRIGGER trg_levels_notas_actualizado_en BEFORE UPDATE ON levels_notas FOR EACH ROW EXECUTE FUNCTION levels_notas_set_actualizado_en();`;

const triggers = triggersRaw
  .split('\n\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => (line.endsWith(';') ? line : `${line};`))
  .join('\n\n');

fs.writeFileSync(path.join(GEN, 'prod-logic-functions.sql'), functions);
fs.writeFileSync(path.join(GEN, 'prod-logic-rls.sql'), rls);
fs.writeFileSync(path.join(GEN, 'prod-logic-triggers.sql'), triggers);
fs.writeFileSync(path.join(GEN, 'prod-logic-policies.sql'), policies);

console.log('Extracted logic parts to scripts/generated');
console.log('  policies ←', policiesFile);
console.log('  functions ←', functionsFile || 'fallback sql');
console.log('  rls ←', rlsFile);
console.log('  triggers ←', triggersFile || 'inline fallback');
